"""Observable evidence and ownership contracts used in the P3/P5 labs."""
from contextlib import closing
import sqlite3
import unittest

from projects.repoops import retrieval_failure_lab as retrieval
from projects.repoops import lease_failure_lab as lease


class RetrievalFailureTests(unittest.TestCase):
    def test_more_candidates_do_not_repair_dropped_context(self):
        small = retrieval.run_case('small', retrieval.retrieve(
            retrieval.INDEX_ORDER, 'operator', 'v2', 2))
        expanded = retrieval.run_case('expanded', retrieval.retrieve(
            retrieval.INDEX_ORDER, 'operator', 'v2', 4))
        repaired = retrieval.run_case('repaired', retrieval.retrieve(
            retrieval.INDEX_ORDER, 'operator', 'v2', 4, enforce_version=True))
        self.assertGreater(expanded['candidate_recall'], small['candidate_recall'])
        self.assertEqual(expanded['context_coverage'], small['context_coverage'])
        self.assertFalse(expanded['answer_correct'])
        self.assertTrue(repaired['answer_correct'])
        self.assertTrue(repaired['citations_complete'])
        self.assertLessEqual(repaired['context_units'], retrieval.BUDGET)

    def test_private_hit_neither_leaks_nor_displaces_visible_evidence(self):
        public = tuple(chunk for chunk in retrieval.INDEX_ORDER if chunk != retrieval.PRIVATE)
        for version_filter in (False, True):
            with self.subTest(version_filter=version_filter):
                responses = [retrieval.run_case('visible', retrieval.retrieve(
                    corpus, 'operator', 'v2', 2, enforce_version=version_filter))
                    for corpus in (public, retrieval.INDEX_ORDER)]
                self.assertEqual(responses[0], responses[1])
        revoked = retrieval.retrieve(retrieval.INDEX_ORDER, 'revoked', 'v2', 4)
        self.assertEqual(retrieval.rule_reader(revoked), {'action': 'abstain', 'citations': []})


class LeaseFailureTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        self.addCleanup(self.db.close)
        lease.initialize(self.db)

    def test_expiry_and_new_ownership_are_independent_write_barriers(self):
        old = lease.claim(self.db, 'late', 0)
        self.assertEqual(lease.complete(self.db, 'late', old, 5, 'expired')['outcome'], 'rejected')
        self.assertEqual(lease.heartbeat(self.db, 'late', old, 5), 0)
        new = lease.claim(self.db, 'late', 6)
        self.assertEqual(lease.complete(self.db, 'late', old, 7, 'stale')['outcome'], 'rejected')
        self.assertEqual(lease.complete(self.db, 'late', new, 8, 'current')['outcome'], 'accepted')
        self.assertEqual(lease.complete(self.db, 'late', old, 9, 'overwrite')['outcome'], 'rejected')
        self.assertEqual(self.db.execute("SELECT result FROM trials WHERE id='late'").fetchone()[0], 'current')

    def test_committed_retry_is_idempotent_but_changed_payload_conflicts(self):
        token = lease.claim(self.db, 'late', 0)
        lease.complete(self.db, 'late', token, 1, 'accepted')
        self.assertEqual(lease.complete(self.db, 'late', token, 10, 'accepted')['outcome'], 'idempotent')
        self.assertEqual(lease.complete(self.db, 'late', token, 10, 'changed')['outcome'], 'conflict')
        self.assertEqual(self.db.execute("SELECT result FROM trials WHERE id='late'").fetchone()[0], 'accepted')

    def test_first_terminal_commit_wins_both_cancellation_orders(self):
        token = lease.claim(self.db, 'cancel-first', 0)
        lease.cancel(self.db, 'cancel-first')
        self.assertEqual(lease.complete(self.db, 'cancel-first', token, 1, 'late')['outcome'], 'rejected')
        self.assertEqual(lease.heartbeat(self.db, 'cancel-first', token, 1), 0)
        self.assertIsNone(lease.claim(self.db, 'cancel-first', 10))
        token = lease.claim(self.db, 'complete-first', 0)
        lease.complete(self.db, 'complete-first', token, 1, 'kept')
        self.assertEqual(lease.cancel(self.db, 'complete-first'), 0)
        self.assertEqual(self.db.execute("SELECT state, result FROM trials WHERE id='cancel-first'").fetchone(), ('cancelled', None))
        self.assertEqual(self.db.execute("SELECT state, result FROM trials WHERE id='complete-first'").fetchone(), ('succeeded', 'kept'))

    def test_fencing_does_not_erase_external_charges(self):
        with closing(sqlite3.connect(':memory:')) as db, closing(sqlite3.connect(':memory:')) as external:
            report = lease.run(db, external)
            self.assertEqual(external.execute('SELECT SUM(units) FROM charges').fetchone()[0], 14)
            self.assertEqual(report['external_effects']['total_units'], 14)
            self.assertEqual(db.execute("SELECT result FROM trials WHERE id='late'").fetchone()[0], 'new-result')


if __name__ == '__main__':
    unittest.main()
