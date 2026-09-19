#!/usr/bin/env python3
"""Offline evaluation-method lab. No LLM calls, candidate execution, or sandbox claims."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import random
import statistics
import sys


def canonical_hash(value):
    raw = json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False)
    return hashlib.sha256(raw.encode()).hexdigest()


def finite_number(value, name, minimum=0):
    if type(value) not in (int, float) or not math.isfinite(value) or value < minimum:
        raise ValueError(f'{name} must be a finite number >= {minimum}')
    return value


def validate(report):
    """Require complete, paired trials, including failures. Never trust a reported score."""
    if not isinstance(report, dict):
        raise ValueError('report must be an object')
    if type(report.get('schema_version')) is not int or report['schema_version'] != 1:
        raise ValueError('schema_version must be 1')
    if report.get('split') != 'confirmation' or report.get('candidate_frozen') is not True:
        raise ValueError('confirmation split and a frozen candidate are required')
    tasks = report.get('task_ids')
    if not isinstance(tasks, list) or len(tasks) < 2 or any(type(t) is not str or not t for t in tasks):
        raise ValueError('at least two nonempty task IDs are required')
    if len(set(tasks)) != len(tasks):
        raise ValueError('duplicate task IDs')
    repeats = report.get('runs_per_task')
    if type(repeats) is not int or repeats < 1:
        raise ValueError('runs_per_task must be a positive integer')
    for name in ('model_id', 'evaluator_id', 'environment_id', 'taskset_id'):
        if not isinstance(report.get(name), str) or not report[name].strip():
            raise ValueError(f'missing {name}')
    expected = {(t, r) for t in tasks for r in range(repeats)}
    records = {}
    for arm in ('baseline', 'candidate'):
        run = report.get(arm)
        if not isinstance(run, dict) or not isinstance(run.get('version'), str) or not run['version']:
            raise ValueError(f'{arm}: version is required')
        conditions = run.get('conditions')
        if not isinstance(conditions, dict) or any(conditions.get(name) != report[name] for name in ('model_id', 'evaluator_id', 'environment_id', 'taskset_id')):
            raise ValueError(f'{arm}: declared conditions differ from the comparison protocol')
        rows = run.get('trials')
        if not isinstance(rows, list):
            raise ValueError(f'{arm}: trials must be a list')
        indexed = {}
        for row in rows:
            if not isinstance(row, dict) or type(row.get('task_id')) is not str or type(row.get('run_id')) is not int:
                raise ValueError(f'{arm}: invalid task_id or run_id')
            key = (row['task_id'], row['run_id'])
            if key in indexed:
                raise ValueError(f'{arm}: duplicate trial {key}')
            if key not in expected:
                raise ValueError(f'{arm}: unexpected trial {key}')
            if type(row.get('passed')) is not bool or type(row.get('critical_violation')) is not bool:
                raise ValueError(f'{arm}: outcomes must be booleans')
            if row.get('status') not in ('ok', 'timeout', 'crash'):
                raise ValueError(f'{arm}: invalid status')
            if row['status'] != 'ok' and row['passed']:
                raise ValueError(f'{arm}: timeout/crash cannot pass')
            finite_number(row.get('cost_units'), 'cost_units')
            indexed[key] = row
        if set(indexed) != expected:
            raise ValueError(f'{arm}: missing trials (do not drop failed runs)')
        records[arm] = indexed
    return tasks, repeats, records


def bootstrap_interval(differences, seed=17, samples=2000):
    """Resample tasks, keeping each task's repeated trials inside its cluster."""
    rng = random.Random(seed)
    n = len(differences)
    means = sorted(sum(rng.choice(differences) for _ in range(n)) / n for _ in range(samples))
    return [means[int(.025 * (samples - 1))], means[int(.975 * (samples - 1))]]


def compare(report, *, alpha=.05, min_effect=.02, max_cost_ratio=1.25, seed=17):
    finite_number(alpha, 'alpha')
    finite_number(min_effect, 'min_effect')
    finite_number(max_cost_ratio, 'max_cost_ratio')
    if not 0 < alpha < 1 or min_effect >= 1 or max_cost_ratio <= 0:
        raise ValueError('require 0 < alpha < 1, 0 <= min_effect < 1, cost ratio > 0')
    tasks, repeats, records = validate(report)
    means, costs = {}, {}
    for arm in records:
        means[arm] = [statistics.mean(records[arm][t, r]['passed'] for r in range(repeats)) for t in tasks]
        costs[arm] = sum(row['cost_units'] for row in records[arm].values())
    differences = [c - b for b, c in zip(means['baseline'], means['candidate'])]
    delta = statistics.mean(differences)
    # Task-level differences lie in [-1, 1]. This one-sided Hoeffding bound
    # requires independently sampled tasks and ONE pre-specified comparison.
    radius = math.sqrt(2 * math.log(1 / alpha) / len(tasks))
    lower = max(-1.0, delta - radius)
    upper = min(1.0, delta + radius)
    violation = any(row['critical_violation'] for row in records['candidate'].values())
    cost_ok = costs['candidate'] <= max_cost_ratio * costs['baseline']
    if violation:
        decision, reason = 'reject', 'candidate critical violation'
    elif not cost_ok:
        decision, reason = 'reject', 'candidate exceeds the pre-specified cost budget'
    elif upper < 0:
        decision, reason = 'reject', 'evidence of regression under the stated assumptions'
    elif lower > min_effect:
        decision, reason = 'keep', 'one-sided lower bound exceeds the practical effect threshold'
    else:
        decision, reason = 'inconclusive', 'insufficient evidence; keep the incumbent'
    return {
        'schema_version': 1, 'input_sha256': canonical_hash(report),
        'baseline_version': report['baseline']['version'], 'candidate_version': report['candidate']['version'],
        'task_count': len(tasks), 'runs_per_task': repeats,
        'baseline_mean': statistics.mean(means['baseline']), 'candidate_mean': statistics.mean(means['candidate']),
        'delta': delta, 'paired_task_bootstrap_95': bootstrap_interval(differences, seed),
        'one_sided_hoeffding_lower': lower, 'one_sided_hoeffding_upper': upper,
        'alpha_per_direction': alpha, 'minimum_effect': min_effect,
        'max_cost_ratio': max_cost_ratio, 'bootstrap_seed': seed,
        'total_cost_units': costs, 'decision': decision, 'reason': reason,
        'assumptions': [
            'Synthetic demo unless a trusted external evaluator produced the input.',
            'Independent tasks; trials within each task are clustered. Cluster by repository if needed.',
            'Candidate and policy fixed before ONE confirmation; no adaptive holdout reuse.',
            'Bootstrap interval is descriptive. The gate uses the conservative Hoeffding bound.',
            'Two one-sided bounds are reported separately; they are not a joint 95% interval.',
            'Hashes identify artifacts; they do not authenticate the scorer or prove isolation.',
        ],
    }


def demo_report(kind='improvement', n=80, repeats=3):
    """Construct transparent toy observations, not measured agent capabilities."""
    tasks = [f'task-{i:03}' for i in range(n)]
    report = dict(schema_version=1, split='confirmation', candidate_frozen=True,
                  task_ids=tasks, runs_per_task=repeats, model_id='synthetic-no-model',
                  evaluator_id='fixture-v1', environment_id='offline-fixture', taskset_id=f'toy-{n}-v1')
    for arm in ('baseline', 'candidate'):
        rows = []
        for i, t in enumerate(tasks):
            for r in range(repeats):
                base = i % 5 == 0
                passed = base if arm == 'baseline' else i % 5 != 4
                if kind == 'tie':
                    passed = base
                if kind == 'regression' and arm == 'baseline':
                    passed = i % 5 != 4
                if kind == 'regression' and arm == 'candidate':
                    passed = base
                violation = kind == 'violation' and arm == 'candidate' and i == r == 0
                cost = 2 if kind == 'expensive' and arm == 'candidate' else 1
                rows.append(dict(task_id=t, run_id=r, passed=passed, status='ok',
                                 cost_units=cost, critical_violation=violation))
        report[arm] = dict(version=arm + '-toy-v1', trials=rows,
                           conditions={k: report[k] for k in ('model_id', 'evaluator_id', 'environment_id', 'taskset_id')})
    return report


def selection_bias(seed=17, experiments=300, tasks=40, candidates=30):
    """All candidates have true p=.5; select the best development score only."""
    if any(type(x) is not int or x < 1 for x in (experiments, tasks, candidates)):
        raise ValueError('experiments, tasks, and candidates must be positive integers')
    rng = random.Random(seed)
    dev, confirmation = [], []
    for _ in range(experiments):
        scores = [sum(rng.random() < .5 for _ in range(tasks)) / tasks for _ in range(candidates)]
        dev.append(max(scores))
        confirmation.append(sum(rng.random() < .5 for _ in range(tasks)) / tasks)
    return dict(synthetic=True, seed=seed, experiments=experiments, tasks=tasks, candidates=candidates,
                true_success_probability=.5, selected_development_mean=statistics.mean(dev),
                fresh_confirmation_mean=statistics.mean(confirmation),
                explanation='Selection on noise creates apparent progress; fresh data removes that advantage in expectation.')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    demo = sub.add_parser('demo')
    demo.add_argument('--output', type=Path, default=Path('lab-output'))
    gate = sub.add_parser('compare')
    gate.add_argument('input', type=Path)
    gate.add_argument('--alpha', type=float, default=.05)
    gate.add_argument('--min-effect', type=float, default=.02)
    gate.add_argument('--max-cost-ratio', type=float, default=1.25)
    bias = sub.add_parser('selection-bias')
    bias.add_argument('--candidates', type=int, default=30)
    bias.add_argument('--seed', type=int, default=17)
    args = parser.parse_args(argv)
    try:
        if args.command == 'demo':
            args.output.mkdir(parents=True, exist_ok=True)
            summary = {}
            for kind in ('improvement', 'tie', 'regression', 'violation', 'expensive'):
                report = demo_report(kind)
                result = compare(report)
                (args.output / f'{kind}.input.json').write_text(json.dumps(report, indent=2) + '\n')
                (args.output / f'{kind}.result.json').write_text(json.dumps(result, indent=2) + '\n')
                summary[kind] = result['decision']
            summary['selection_bias'] = selection_bias()
            (args.output / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')
            print(json.dumps(summary, indent=2))
        elif args.command == 'compare':
            result = compare(json.loads(args.input.read_text()), alpha=args.alpha,
                             min_effect=args.min_effect, max_cost_ratio=args.max_cost_ratio)
            print(json.dumps(result, indent=2, allow_nan=False))
        else:
            print(json.dumps(selection_bias(seed=args.seed, candidates=args.candidates), indent=2))
    except (ValueError, KeyError, TypeError, OSError) as e:
        print(f'Invalid evaluation input: {e}', file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
