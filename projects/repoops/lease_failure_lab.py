"""P5: deterministic SQLite lease/fencing mechanism lab, not a worker service.

Run with Python 3.10+ and no dependencies. Logical ticks replace wall clocks;
two temporary databases separate scheduler commits from synthetic side effects.
No model, network request, real charge, or parallel worker is involved.
"""
from contextlib import closing
import hashlib
import json
from pathlib import Path
import sqlite3
from tempfile import TemporaryDirectory


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def result_hash(result):
    return hashlib.sha256(result.encode('utf-8')).hexdigest()


def initialize(db):
    db.executescript('''
        CREATE TABLE trials (
            id TEXT PRIMARY KEY,
            state TEXT NOT NULL CHECK(state IN ('queued','running','succeeded','cancelled')),
            token INTEGER NOT NULL DEFAULT 0,
            lease_until INTEGER,
            result TEXT,
            result_hash TEXT,
            CHECK ((state = 'succeeded') = (result IS NOT NULL)),
            CHECK ((result IS NULL) = (result_hash IS NULL))
        );
        CREATE TABLE attempts (
            trial_id TEXT NOT NULL REFERENCES trials(id),
            token INTEGER NOT NULL,
            state TEXT NOT NULL CHECK(state IN ('running','expired','succeeded','cancelled')),
            PRIMARY KEY(trial_id, token)
        );
        INSERT INTO trials(id, state, token) VALUES ('late', 'queued', 6);
        INSERT INTO trials(id, state) VALUES ('cancel-first', 'queued');
        INSERT INTO trials(id, state) VALUES ('complete-first', 'queued');
    ''')


def claim(db, trial, now, ttl=5):
    # Each operation commits before any slow/external work starts.
    with db:
        db.execute('BEGIN IMMEDIATE')
        changed = db.execute('''
            UPDATE trials SET state='running', token=token+1, lease_until=?
            WHERE id=? AND (state='queued' OR (state='running' AND lease_until<=?))
        ''', (now + ttl, trial, now)).rowcount
        if not changed:
            return None
        token = db.execute('SELECT token FROM trials WHERE id=?', (trial,)).fetchone()[0]
        db.execute("UPDATE attempts SET state='expired' WHERE trial_id=? AND state='running'", (trial,))
        db.execute("INSERT INTO attempts VALUES (?, ?, 'running')", (trial, token))
        return token


def heartbeat(db, trial, token, now, ttl=5):
    with db:
        db.execute('BEGIN IMMEDIATE')
        return db.execute('''
            UPDATE trials SET lease_until=MAX(lease_until, ?)
            WHERE id=? AND state='running' AND token=? AND lease_until>?
        ''', (now + ttl, trial, token, now)).rowcount


def complete(db, trial, token, now, result):
    digest = result_hash(result)
    with db:
        db.execute('BEGIN IMMEDIATE')
        changed = db.execute('''
            UPDATE trials SET state='succeeded', result=?, result_hash=?
            WHERE id=? AND state='running' AND token=? AND lease_until>?
        ''', (result, digest, trial, token, now)).rowcount
        if changed:
            db.execute("UPDATE attempts SET state='succeeded' WHERE trial_id=? AND token=?", (trial, token))
            return {'outcome': 'accepted', 'updated_rows': changed}
        row = db.execute('SELECT state, token, result_hash FROM trials WHERE id=?', (trial,)).fetchone()
        # A retry of an already committed operation is a read, not a new write.
        # An old attempt is not a duplicate of a different winning attempt.
        if row and row[0] == 'succeeded' and row[1] == token:
            outcome = 'idempotent' if row[2] == digest else 'conflict'
        else:
            outcome = 'rejected'
        return {'outcome': outcome, 'updated_rows': 0}


def cancel(db, trial):
    with db:
        db.execute('BEGIN IMMEDIATE')
        changed = db.execute("UPDATE trials SET state='cancelled' WHERE id=? AND state IN ('queued','running')", (trial,)).rowcount
        if changed:
            db.execute("UPDATE attempts SET state='cancelled' WHERE trial_id=? AND state='running'", (trial,))
        return changed


def run(db, external):
    initialize(db)
    external.execute('CREATE TABLE charges(token INTEGER NOT NULL, units INTEGER NOT NULL)')
    timeline = []

    def record(now, event, observed, expected):
        require(observed == expected, f'{event}: expected {expected!r}, got {observed!r}')
        timeline.append({'tick': now, 'event': event, 'observed': observed})

    def charge(token):
        # Independent durable commit: intentionally no downstream idempotency.
        with external:
            external.execute('INSERT INTO charges VALUES (?, 7)', (token,))
        return 7

    record(0, 'W1 claim, lease_until=5', claim(db, 'late', 0), 7)
    record(1, 'W1 synthetic external charge, then pause', charge(7), 7)
    record(2, 'W2 cannot steal a live lease', claim(db, 'late', 2), None)
    record(5, 'W1 cannot renew at exact expiry', heartbeat(db, 'late', 7, 5), 0)
    record(5, 'W1 cannot complete even before reclaim', complete(db, 'late', 7, 5, 'old-result'),
           {'outcome': 'rejected', 'updated_rows': 0})
    record(6, 'W2 claim, lease_until=11', claim(db, 'late', 6), 8)
    record(7, 'W2 synthetic external charge', charge(8), 7)
    record(7, 'W1 fenced while W2 lease is live', complete(db, 'late', 7, 7, 'old-result'),
           {'outcome': 'rejected', 'updated_rows': 0})
    record(8, 'W2 completes', complete(db, 'late', 8, 8, 'new-result'),
           {'outcome': 'accepted', 'updated_rows': 1})
    record(9, 'W1 late completion', complete(db, 'late', 7, 9, 'old-result'),
           {'outcome': 'rejected', 'updated_rows': 0})
    record(12, 'W2 same result retry after lease expiry', complete(db, 'late', 8, 12, 'new-result'),
           {'outcome': 'idempotent', 'updated_rows': 0})
    record(12, 'W2 changed result retry', complete(db, 'late', 8, 12, 'different-result'),
           {'outcome': 'conflict', 'updated_rows': 0})

    record(20, 'claim cancel-first', claim(db, 'cancel-first', 20), 1)
    record(21, 'cancellation wins', cancel(db, 'cancel-first'), 1)
    record(22, 'completion cannot resurrect cancelled trial', complete(db, 'cancel-first', 1, 22, 'late-result'),
           {'outcome': 'rejected', 'updated_rows': 0})
    record(22, 'heartbeat cannot resurrect cancelled trial', heartbeat(db, 'cancel-first', 1, 22), 0)
    record(23, 'claim cannot resurrect cancelled trial', claim(db, 'cancel-first', 23), None)
    record(30, 'claim complete-first', claim(db, 'complete-first', 30), 1)
    record(31, 'completion wins', complete(db, 'complete-first', 1, 31, 'kept-result'),
           {'outcome': 'accepted', 'updated_rows': 1})
    record(32, 'cancellation cannot erase committed success', cancel(db, 'complete-first'), 0)

    trials = [dict(zip(('id', 'state', 'token', 'result'), row)) for row in db.execute(
        'SELECT id, state, token, result FROM trials ORDER BY id')]
    require(trials == [
        {'id': 'cancel-first', 'state': 'cancelled', 'token': 1, 'result': None},
        {'id': 'complete-first', 'state': 'succeeded', 'token': 1, 'result': 'kept-result'},
        {'id': 'late', 'state': 'succeeded', 'token': 8, 'result': 'new-result'},
    ], 'terminal results must be immutable')
    attempts = [list(row) for row in db.execute('SELECT trial_id, token, state FROM attempts ORDER BY trial_id, token')]
    require(attempts == [['cancel-first', 1, 'cancelled'], ['complete-first', 1, 'succeeded'],
                         ['late', 7, 'expired'], ['late', 8, 'succeeded']], 'attempt history must survive reclaim')
    charges = [list(row) for row in external.execute('SELECT token, units FROM charges ORDER BY token')]
    require(charges == [[7, 7], [8, 7]], 'fencing must not pretend to undo external charges')
    return {
        'scope': 'synthetic mechanism lab; real SQLite updates; no model or production concurrency',
        'timeline': timeline,
        'final_trials': trials,
        'attempts': attempts,
        'external_effects': {'charges': charges, 'total_units': sum(row[1] for row in charges),
                             'rolled_back_by_fencing': False},
        'checks': {'scripted_observations': len(timeline), 'final_state_checks': 3, 'all_passed': True},
    }


def main():
    with TemporaryDirectory(prefix='repoops-lease-lab-') as directory:
        with closing(sqlite3.connect(Path(directory) / 'scheduler.sqlite')) as db, \
                closing(sqlite3.connect(Path(directory) / 'external.sqlite')) as external:
            db.execute('PRAGMA foreign_keys=ON')
            report = run(db, external)
    report['temporary_databases_removed'] = not Path(directory).exists()
    require(report['temporary_databases_removed'], 'temporary databases must be removed')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
