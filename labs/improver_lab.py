#!/usr/bin/env python3
"""Finite self-application example: optimize a duration parser, then its edit order.

All examples, edits and the search algorithm are hand-written. No LLM, generated
code execution, statistical inference or claim of general RSI is involved.
"""
from dataclasses import asdict, dataclass, field, replace
from decimal import Decimal
import argparse
import hashlib
from itertools import combinations
import json
from pathlib import Path
import re

OPERATIONS = ("units", "case", "trim", "decimal")


@dataclass(frozen=True)
class Task:
    id: str
    raw: str
    expected: int | None


# Public, deliberately constructed fixtures. Confirmation changes values, not
# task families; SHIFT changes the mix of formats. Neither is a hidden benchmark.
DEV = tuple(Task(f"dev-{i}", raw, expected) for i, (raw, expected) in enumerate([
    ("10", 10), ("2s", 2000), ("5ms", 5), (" 7 ", 7), ("\t8\n", 8),
    (" 3s ", 3000), (" 9ms ", 9), (" 11 ", 11), ("4S", 4000), ("1.5s", 1500),
]))
CONFIRM = tuple(Task(f"confirm-{i}", raw, expected) for i, (raw, expected) in enumerate([
    ("13", 13), ("6s", 6000), ("17ms", 17), (" 19 ", 19), ("\t23\n", 23),
    (" 5s ", 5000), (" 21ms ", 21), (" 29 ", 29), ("9S", 9000), ("2.5s", 2500),
]))
SHIFT = tuple(Task(f"shift-{i}", raw, expected) for i, (raw, expected) in enumerate([
    ("12", 12), ("3s", 3000), ("2S", 2000), ("3MS", 3), ("4S", 4000),
    ("10MS", 10), ("7S", 7000), ("8MS", 8), (" 6s ", 6000), ("2.5s", 2500),
]))


@dataclass(frozen=True)
class Solver:
    enabled: tuple[str, ...] = ()

    def parse(self, raw: str) -> int | None:
        text = raw.strip() if "trim" in self.enabled else raw
        if "case" in self.enabled:
            text = text.lower()
        multiplier = 1
        if "units" in self.enabled:
            if text.endswith("ms"):
                text = text[:-2]
            elif text.endswith("s"):
                text, multiplier = text[:-1], 1000
        pattern = r"[0-9]+(?:\.[0-9]+)?" if "decimal" in self.enabled else r"[0-9]+"
        if not re.fullmatch(pattern, text):
            return None
        value = Decimal(text) * multiplier
        return int(value) if value == value.to_integral_value() else None


@dataclass(frozen=True)
class Improver:
    order: tuple[str, ...] = OPERATIONS

    def __post_init__(self):
        if len(self.order) != len(OPERATIONS) or set(self.order) != set(OPERATIONS):
            raise ValueError("order must be a permutation of the four operations")


@dataclass
class Ledger:
    # One solver evaluation = running one parser configuration on a full suite.
    solver_evaluations: int = 0
    task_executions: int = 0
    proposals: int = 0
    trace: list[dict] = field(default_factory=list)


def edit(target: Solver | Improver, operation: str) -> Solver | Improver:
    """The same operation name has a domain-specific, bounded interpretation."""
    if operation not in OPERATIONS:
        raise ValueError("unknown operation")
    if isinstance(target, Solver):
        return replace(target, enabled=tuple(x for x in OPERATIONS
                                            if x in target.enabled or x == operation))
    return replace(target, order=(operation,) + tuple(x for x in target.order if x != operation))


def evaluate(solver: Solver, tasks: tuple[Task, ...], ledger: Ledger) -> float:
    ledger.solver_evaluations += 1
    ledger.task_executions += len(tasks)
    return sum(solver.parse(t.raw) == t.expected for t in tasks) / len(tasks)


def improve(controller: Improver, target, utility, budget: int, ledger: Ledger, label: str):
    """Greedy search. Equal scores keep the incumbent; no-op proposals cost budget.

    The controller is a snapshot. Self-application updates the target, and that
    result becomes the controller on the NEXT call, never halfway through a call.
    """
    if not isinstance(budget, int) or isinstance(budget, bool) or budget < 0:
        raise ValueError("budget must be a non-negative integer")
    best, best_score = target, utility(target)
    for operation in controller.order[:budget]:
        candidate = edit(best, operation)
        ledger.proposals += 1
        score = utility(candidate)
        accepted = score > best_score
        ledger.trace.append({"stage": label, "operation": operation,
                             "parent": asdict(best), "candidate": asdict(candidate),
                             "score": score, "accepted": accepted})
        if accepted:
            best, best_score = candidate, score
    return best


def train_improver(initial: Improver, tasks=DEV, rounds: int = 1):
    """No confirmation or shifted observations are supplied to this search."""
    if rounds < 1:
        raise ValueError("rounds must be positive")
    ledger = Ledger()
    current = initial
    history = []
    for iteration in range(rounds):
        def meta_utility(candidate: Improver):
            # Utility of an improver is utility of the solver it produces from
            # the SAME fresh starting point, with TWO proposals, on dev data.
            scores = {}
            def solver_utility(solver):
                value = evaluate(solver, tasks, ledger)
                scores[solver] = value
                return value
            solver = improve(candidate, Solver(), solver_utility, 2, ledger,
                             f"meta-{iteration}/inner")
            return scores[solver]
        before = ledger.solver_evaluations
        current = improve(current, current, meta_utility, 4, ledger, f"meta-{iteration}/outer")
        history.append({"round": iteration + 1, "order": list(current.order),
                        "solver_evaluations": ledger.solver_evaluations - before})
    return current, ledger, history


def search_solver(controller: Improver):
    ledger = Ledger()
    selected = improve(controller, Solver(), lambda s: evaluate(s, DEV, ledger),
                       2, ledger, "solver-search")
    return selected, ledger


def exhaustive_solver():
    # All 2^4 configurations fit in this tiny space. Charge all 16 evaluations.
    ledger = Ledger()
    best, best_score = Solver(), -1.0
    for size in range(len(OPERATIONS) + 1):
        for enabled in combinations(OPERATIONS, size):
            candidate = Solver(enabled)
            score = evaluate(candidate, DEV, ledger)
            if score > best_score:
                best, best_score = candidate, score
    return best, ledger


def measurements(solver: Solver):
    # Final reporting happens AFTER all choices are fixed. Do not return these
    # observations to either improve() or train_improver().
    result = {}
    for name, tasks in (("dev", DEV), ("confirm", CONFIRM), ("shift", SHIFT)):
        rows = [{**asdict(t), "actual": solver.parse(t.raw)} for t in tasks]
        for row in rows:
            row["passed"] = row["actual"] == row["expected"]
        result[name] = {"success": sum(r["passed"] for r in rows) / len(rows), "trials": rows}
    return result


def demo(rounds=1):
    initial = Improver()
    trained, training, history = train_improver(initial, rounds=rounds)
    frozen_solver, frozen_cost = search_solver(initial)
    updated_solver, updated_cost = search_solver(trained)
    exhaustive, exhaustive_cost = exhaustive_solver()
    methods = {}
    for name, solver, ledger, overhead in (
        ("frozen", frozen_solver, frozen_cost, 0),
        ("self_applied", updated_solver, updated_cost, training.solver_evaluations),
        ("exhaustive", exhaustive, exhaustive_cost, 0),
    ):
        methods[name] = {"enabled": list(solver.enabled),
                         "search_evaluations": ledger.solver_evaluations,
                         "training_evaluations": overhead,
                         "total_search_evaluations": ledger.solver_evaluations + overhead,
                         "final_report_task_executions": len(DEV) + len(CONFIRM) + len(SHIFT),
                         "results": measurements(solver), "trace": ledger.trace}
    return {"schema_version": 1, "public_teaching_fixture": True,
            "code_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            "initial_order": list(initial.order), "updated_order": list(trained.order),
            "meta_history": history, "training": asdict(training), "methods": methods,
            "limitations": ["All edits, scoring and search code are hand-written.",
                            "Confirmation changes values within the same templates.",
                            "Scores are deterministic fixture results, not LLM measurements.",
                            "Evaluation counts exclude unequal CPU costs; report task runs separately.",
                            "Self-application is finite configuration search, not open-ended algorithm invention."]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rounds", type=int, default=1)
    parser.add_argument("--output", type=Path, default=Path("lab-output/improver/report.json"))
    args = parser.parse_args()
    if args.rounds < 1:
        parser.error("--rounds must be positive")
    report = demo(args.rounds)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print("Public deterministic parser experiment; no LLM calls.")
    print("I0:", " -> ".join(report["initial_order"]))
    print("I1:", " -> ".join(report["updated_order"]))
    print("method         dev  confirm  shift  search_evals (training + solver)")
    for name, row in report["methods"].items():
        scores = [row["results"][split]["success"] for split in ("dev", "confirm", "shift")]
        print(f"{name:14} " + " ".join(f"{s:.1f}" for s in scores)
              + f"       {row['total_search_evaluations']} ({row['training_evaluations']} + {row['search_evaluations']})")
    print("Each method additionally runs 30 final-report task executions.")
    print("Report:", args.output)


if __name__ == "__main__":
    main()
