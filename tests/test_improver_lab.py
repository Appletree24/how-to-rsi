"""Checks for the self-application example's behavior and resource accounting."""
import unittest
from labs.improver_lab import (CONFIRM, DEV, SHIFT, OPERATIONS, Improver, Ledger,
                               Solver, demo, edit, improve, train_improver)


class ImproverLabTests(unittest.TestCase):
    def test_parser_contract_and_patch_interaction(self):
        complete = Solver(OPERATIONS)
        for raw, expected in [(" 1.25S ", 1250), ("0", 0), ("7ms", 7),
                              ("-2s", None), ("0.1ms", None), ("1e3", None),
                              ("", None), ("ms", None), ("2s trailing", None)]:
            self.assertEqual(complete.parse(raw), expected, raw)
        self.assertIsNone(Solver(("trim",)).parse(" 3s "))
        self.assertIsNone(Solver(("units",)).parse(" 3s "))
        self.assertEqual(Solver(("trim", "units")).parse(" 3s "), 3000)

    def test_candidates_do_not_mutate_parent(self):
        solver, improver = Solver(), Improver()
        self.assertEqual(edit(solver, "trim").enabled, ("trim",))
        self.assertEqual(solver.enabled, ())
        self.assertEqual(edit(improver, "trim").order[0], "trim")
        self.assertEqual(improver.order, OPERATIONS)

    def test_zero_budget_and_noop_are_accounted(self):
        ledger = Ledger()
        calls = []
        utility = lambda s: calls.append(s) or 1.0
        result = improve(Improver(), Solver(), utility, 0, ledger, "zero")
        self.assertEqual(result, Solver())
        self.assertEqual(len(calls), 1)
        improve(Improver(), Improver(), utility, 1, ledger, "noop")
        self.assertEqual(len(calls), 3)  # Initial + candidate, even for a no-op.
        self.assertEqual(ledger.proposals, 1)

    def test_self_application_uses_old_controller_until_next_round(self):
        trained, ledger, _ = train_improver(Improver())
        self.assertEqual(trained.order, ("trim", "units", "case", "decimal"))
        outer = [r for r in ledger.trace if r["stage"].endswith("/outer")]
        self.assertEqual(tuple(r["operation"] for r in outer), OPERATIONS)
        self.assertEqual([r["operation"] for r in outer if r["accepted"]], ["trim"])
        self.assertEqual(ledger.solver_evaluations, 15)
        self.assertEqual(ledger.task_executions, 150)

    def test_distribution_shift_reverses_the_preference(self):
        report = demo()
        old, new = (report["methods"][n] for n in ("frozen", "self_applied"))
        self.assertGreater(new["results"]["confirm"]["success"], old["results"]["confirm"]["success"])
        self.assertLess(new["results"]["shift"]["success"], old["results"]["shift"]["success"])
        # When trained on the shifted mixture, the same search retains I0.
        shifted, _, _ = train_improver(Improver(), tasks=SHIFT)
        self.assertEqual(shifted, Improver())
        self.assertTrue(set(t.raw for t in DEV).isdisjoint(t.raw for t in CONFIRM))

    def test_extra_round_spends_budget_without_extra_gain(self):
        first = demo(1)
        second = demo(2)
        self.assertEqual(first["updated_order"], second["updated_order"])
        self.assertEqual(second["training"]["solver_evaluations"], 30)
        self.assertEqual(first["methods"]["self_applied"]["total_search_evaluations"], 18)
        exhaustive = first["methods"]["exhaustive"]
        self.assertEqual(exhaustive["total_search_evaluations"], 16)
        self.assertTrue(all(v["success"] == 1 for v in exhaustive["results"].values()))


if __name__ == "__main__":
    unittest.main()
