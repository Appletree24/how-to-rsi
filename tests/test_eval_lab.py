import copy
import math
import unittest
from labs.eval_lab import compare, demo_report, selection_bias


class EvaluationTests(unittest.TestCase):
    def test_improvement_and_provenance(self):
        r = compare(demo_report())
        self.assertEqual(r['decision'], 'keep')
        self.assertAlmostEqual(r['delta'], .6)
        self.assertEqual(len(r['input_sha256']), 64)
        self.assertGreater(r['one_sided_hoeffding_lower'], .02)

    def test_gate_failure_modes(self):
        for kind, expected in [('tie', 'inconclusive'), ('regression', 'reject'),
                               ('violation', 'reject'), ('expensive', 'reject')]:
            with self.subTest(kind=kind):
                self.assertEqual(compare(demo_report(kind))['decision'], expected)

    def test_small_sample_does_not_prove_improvement(self):
        self.assertEqual(compare(demo_report(n=5))['decision'], 'inconclusive')

    def test_repeats_do_not_inflate_independent_sample_size(self):
        a, b = compare(demo_report(repeats=1)), compare(demo_report(repeats=10))
        self.assertEqual(a['one_sided_hoeffding_lower'], b['one_sided_hoeffding_lower'])
        self.assertEqual(a['paired_task_bootstrap_95'], b['paired_task_bootstrap_95'])

    def test_reported_score_ignored(self):
        r = demo_report('tie')
        r['candidate']['reported_score'] = 1.0
        self.assertEqual(compare(r)['decision'], 'inconclusive')

    def test_fail_closed_for_invalid_records(self):
        source = demo_report()
        edits = [
            lambda r: r['candidate']['trials'].pop(),
            lambda r: r['candidate']['trials'].append(copy.deepcopy(r['candidate']['trials'][0])),
            lambda r: r['candidate']['trials'][0].update(cost_units=math.nan),
            lambda r: r['candidate']['trials'][0].update(cost_units=-1),
            lambda r: r['candidate']['trials'][0].update(passed='true'),
            lambda r: r['candidate']['trials'][0].update(run_id=True),
            lambda r: r['candidate']['trials'][0].update(status='timeout', passed=True),
            lambda r: r['task_ids'].append(r['task_ids'][0]),
            lambda r: r.update(candidate_frozen=False),
            lambda r: r.update(split='development'),
            lambda r: r.update(model_id=''),
            lambda r: r['candidate']['conditions'].update(evaluator_id='other-grader'),
            lambda r: r['baseline']['conditions'].update(model_id='other-model'),
        ]
        for edit in edits:
            r = copy.deepcopy(source)
            edit(r)
            with self.subTest(edit=edit), self.assertRaises(ValueError):
                compare(r)

    def test_failed_trials_are_counted(self):
        r = demo_report('tie')
        r['candidate']['trials'][0].update(status='crash', passed=False)
        self.assertLess(compare(r)['delta'], 0)

    def test_non_object_input_rejected(self):
        for value in ([], None, 1):
            with self.assertRaises(ValueError):
                compare(value)

    def test_zero_baseline_cost(self):
        r = demo_report()
        for row in r['baseline']['trials']:
            row['cost_units'] = 0
        self.assertEqual(compare(r)['decision'], 'reject')

    def test_seeded_selection_bias(self):
        r = selection_bias(experiments=150)
        self.assertEqual(r, selection_bias(experiments=150))
        self.assertGreater(r['selected_development_mean'], .6)
        self.assertLess(abs(r['fresh_confirmation_mean'] - .5), .03)

    def test_row_order_independence(self):
        r = demo_report()
        expected = compare(r)
        r['candidate']['trials'].reverse()
        actual = compare(r)
        self.assertEqual(actual['delta'], expected['delta'])
        self.assertEqual(actual['decision'], expected['decision'])


if __name__ == '__main__':
    unittest.main()
