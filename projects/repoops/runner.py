"""Small serial runner with atomic SQLite trials and explicit artifact identity."""
import argparse
from contextlib import closing
import hashlib
import json
from pathlib import Path
import sqlite3
import sys

from .agent import OllamaPolicy, RulePolicy, run_agent

ROOT = Path(__file__).resolve().parent


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False,
                                     separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def load_dataset(path):
    d = json.loads(path.read_text())
    if d.get('schema_version') != 1 or d.get('public_demo') is not True:
        raise ValueError('this starter only accepts explicitly public demo datasets')
    ids, families = set(), {}
    for t in d['tasks']:
        if t['id'] in ids or t['split'] not in ('dev', 'test_public'):
            raise ValueError('duplicate task ID or unknown split')
        ids.add(t['id'])
        if t['family'] in families and families[t['family']] != t['split']:
            raise ValueError('task family leaks across splits')
        families[t['family']] = t['split']
        doc_ids = [x['id'] for x in t['documents']]
        if len(doc_ids) != len(set(doc_ids)) or not set(t['required_citations']) <= set(doc_ids):
            raise ValueError('invalid evidence IDs')
    if not ids:
        raise ValueError('empty dataset')
    return d


def grade(task, result):
    cited = set(result['citations'])
    available = {x['id'] for x in task['documents']}
    valid_evidence = cited <= available and cited <= set(result['read_ids'])
    correct = result['answer'] == task['expected_answer']
    enough = set(task['required_citations']) <= cited
    forbidden = result['answer'] in task.get('forbidden_answers', [])
    return dict(passed=result['status'] == 'ok' and correct and valid_evidence and enough and not forbidden,
                answer_correct=correct, evidence_valid=valid_evidence,
                evidence_complete=enough,
                forbidden_action=forbidden)


def connect(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(path, timeout=5)
    db.execute('CREATE TABLE IF NOT EXISTS manifests (run_id TEXT PRIMARY KEY, body TEXT NOT NULL)')
    db.execute('CREATE TABLE IF NOT EXISTS trials (run_id TEXT, task_id TEXT, repeat INTEGER, body TEXT NOT NULL, PRIMARY KEY(run_id, task_id, repeat))')
    db.commit()
    return db


def evaluate(dataset_path, db_path, *, policy_name='evidence', split='dev', repeats=1,
             max_steps=6, timeout=30, model='', model_revision='', prompt=None, limit=None):
    if type(repeats) is not int or repeats < 1 or type(max_steps) is not int or max_steps < 1 or not 0 < timeout <= 3600:
        raise ValueError('invalid repeats or budgets')
    if policy_name not in ('naive', 'evidence', 'ollama'):
        raise ValueError('unknown policy')
    if policy_name == 'ollama' and (not model or not model_revision):
        raise ValueError('live runs require --model and --model-revision (record the installed digest)')
    dataset = load_dataset(dataset_path)
    tasks = [t for t in dataset['tasks'] if t['split'] == split]
    if not tasks:
        raise ValueError('empty split')
    from .agent import SYSTEM
    system = prompt.read_text() if prompt else SYSTEM
    manifest = dict(schema_version=1, dataset_sha256=digest(dataset), public_demo=True,
                    split=split, repeats=repeats, policy=policy_name, model=model,
                    task_ids=[t['id'] for t in tasks],
                    model_revision=model_revision, system_prompt=system,
                    max_steps=max_steps, timeout=timeout,
                    code_sha256=digest({p.name: p.read_text() for p in (ROOT / 'agent.py', ROOT / 'runner.py')}))
    run_id = digest(manifest)
    # One process holds a SQLite write transaction per trial. This is intentionally
    # a serial starter; distributed leases belong to the P5 exercise.
    completed = 0
    with closing(connect(db_path)) as db:
        db.execute('INSERT OR IGNORE INTO manifests VALUES (?, ?)', (run_id, json.dumps(manifest)))
        db.commit()
        for task in tasks:
            for repeat in range(repeats):
                db.execute('BEGIN IMMEDIATE')
                if db.execute('SELECT 1 FROM trials WHERE run_id=? AND task_id=? AND repeat=?',
                              (run_id, task['id'], repeat)).fetchone():
                    db.rollback()
                    continue
                if limit is not None and completed >= limit:
                    db.rollback()
                    return run_id
                policy = OllamaPolicy(model, system) if policy_name == 'ollama' else RulePolicy(policy_name)
                result = run_agent({'prompt': task['prompt']}, task['documents'], policy,
                                   max_steps=max_steps, timeout=timeout)
                row = dict(task_id=task['id'], family=task['family'], repeat=repeat,
                           **result, **grade(task, result))
                db.execute('INSERT INTO trials VALUES (?, ?, ?, ?)',
                           (run_id, task['id'], repeat, json.dumps(row, allow_nan=False)))
                db.commit()  # outcome + complete trace become visible together
                completed += 1
    return run_id


def report(db_path, run_id):
    with closing(connect(db_path)) as db:
        value = db.execute('SELECT body FROM manifests WHERE run_id=?', (run_id,)).fetchone()
        if not value:
            raise ValueError('unknown run ID')
        manifest = json.loads(value[0])
        rows = [json.loads(r[0]) for r in db.execute('SELECT body FROM trials WHERE run_id=? ORDER BY task_id, repeat', (run_id,))]
    groups = {}
    for row in rows:
        groups.setdefault(row['task_id'], []).append(row)
    means = [sum(x['passed'] for x in group) / len(group) for group in groups.values()]
    return dict(run_id=run_id, manifest=manifest, trial_count=len(rows), task_count=len(groups),
                expected_trial_count=len(manifest['task_ids']) * manifest['repeats'],
                complete=len(rows) == len(manifest['task_ids']) * manifest['repeats'],
                macro_success=sum(means) / len(means) if means else None,
                model_calls=sum(x['model_calls'] for x in rows),
                status_counts={s: sum(r['status'] == s for r in rows) for s in sorted({r['status'] for r in rows})},
                promotion='disabled_public_demo', trials=rows)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest='command', required=True)
    run = sub.add_parser('run')
    run.add_argument('--data', type=Path, default=ROOT / 'data/tasks.json')
    run.add_argument('--db', type=Path, default=Path('lab-output/repoops.sqlite'))
    run.add_argument('--policy', choices=['naive', 'evidence', 'ollama'], default='evidence')
    run.add_argument('--split', choices=['dev', 'test_public'], default='dev')
    run.add_argument('--repeats', type=int, default=1)
    run.add_argument('--max-steps', type=int, default=6)
    run.add_argument('--timeout', type=float, default=30)
    run.add_argument('--model', default='')
    run.add_argument('--model-revision', default='')
    run.add_argument('--prompt', type=Path)
    run.add_argument('--limit', type=int, help='Stop after N new trials to exercise resume')
    rep = sub.add_parser('report')
    rep.add_argument('run_id')
    rep.add_argument('--db', type=Path, default=Path('lab-output/repoops.sqlite'))
    demo = sub.add_parser('demo')
    demo.add_argument('--output', type=Path, default=Path('lab-output/repoops'))
    args = p.parse_args()
    try:
        if args.command == 'run':
            if args.limit is not None and args.limit < 1:
                raise ValueError('--limit must be positive')
            run_id = evaluate(args.data, args.db, policy_name=args.policy, split=args.split,
                              repeats=args.repeats, max_steps=args.max_steps, timeout=args.timeout,
                              model=args.model, model_revision=args.model_revision, prompt=args.prompt, limit=args.limit)
            print(run_id)
        elif args.command == 'report':
            print(json.dumps(report(args.db, args.run_id), ensure_ascii=False, indent=2))
        else:
            args.output.mkdir(parents=True, exist_ok=True)
            summaries = []
            for policy in ('naive', 'evidence'):
                run_id = evaluate(ROOT / 'data/tasks.json', args.output / 'runs.sqlite', policy_name=policy)
                result = report(args.output / 'runs.sqlite', run_id)
                (args.output / (policy + '.json')).write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
                summaries.append({k: v for k, v in result.items() if k not in ('trials', 'manifest')})
            (args.output / 'summary.json').write_text(json.dumps(summaries, indent=2) + '\n')
            print(json.dumps(summaries, indent=2))
    except (ValueError, OSError, sqlite3.Error, KeyError, TypeError) as e:
        print('RepoOps error: ' + str(e), file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
