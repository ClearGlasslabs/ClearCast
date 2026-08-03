import unittest

from artemis_core.runtime import (
    ActionDecision,
    AppendOnlyAuditLog,
    ArtifactCandidate,
    ArtifactRegistry,
    FeedbackEvent,
    MissionContext,
    PolicyEngine,
    ProtectedResource,
    TriageWorkflow,
    WorkflowState,
    evaluate_feedback,
)


class ArtemisRuntimeTests(unittest.TestCase):
    def setUp(self):
        self.operator = MissionContext(
            actor_id="operator-7", roles=frozenset({"operator", "model_governor"}),
            mission_id="mission-a", clearance=3, compartments=frozenset({"ORION"}),
            coalition_tags=frozenset({"FVEY"}),
        )

    def test_policy_fails_closed_and_gates_side_effects(self):
        resource = ProtectedResource("alert-1", 2, frozenset({"ORION"}),
                                     frozenset({"FVEY"}), "mission-a")
        policy = PolicyEngine()
        self.assertEqual(policy.authorize(self.operator, resource, "read"), ActionDecision.ALLOW)
        self.assertEqual(policy.authorize(self.operator, resource, "open_case"),
                         ActionDecision.REQUIRE_APPROVAL)
        outsider = MissionContext("x", frozenset(), "mission-b", 9,
                                  frozenset({"ORION"}), frozenset({"FVEY"}))
        self.assertEqual(policy.authorize(outsider, resource, "read"), ActionDecision.DENY)

    def test_workflow_requires_order_and_human_approval(self):
        audit = AppendOnlyAuditLog()
        workflow = TriageWorkflow("wf-1", audit)
        for target in (WorkflowState.TRIAGED, WorkflowState.ENRICHED,
                       WorkflowState.RECOMMENDED, WorkflowState.PENDING_APPROVAL,
                       WorkflowState.APPROVED):
            workflow.transition(target, self.operator, "test")
        self.assertEqual(workflow.state, WorkflowState.APPROVED)
        self.assertTrue(audit.verify())

    def test_invalid_transition_is_rejected(self):
        workflow = TriageWorkflow("wf-2", AppendOnlyAuditLog())
        with self.assertRaises(ValueError):
            workflow.transition(WorkflowState.APPROVED, self.operator, "skip gates")

    def test_artifact_promotion_and_rollback(self):
        audit = AppendOnlyAuditLog()
        registry = ArtifactRegistry(audit)
        first = ArtifactCandidate("triage-prompt", "1.0.0", "stable")
        registry.propose(first, self.operator)
        registry.approve(first.name, first.version, self.operator, lambda _: True)
        registry.activate(first.name, first.version, self.operator)
        second = ArtifactCandidate("triage-prompt", "1.1.0", "candidate")
        registry.propose(second, self.operator)
        registry.approve(second.name, second.version, self.operator, lambda _: True)
        registry.activate(second.name, second.version, self.operator)
        self.assertEqual(registry.rollback(second.name, self.operator).version, "1.0.0")
        self.assertTrue(audit.verify())

    def test_feedback_evaluation(self):
        result = evaluate_feedback([
            FeedbackEvent("m", "p", "correct", True, 0.9, 100, 0.1),
            FeedbackEvent("m", "p", "edited", False, 0.7, 200, 0.3),
        ])
        self.assertEqual(result.sample_count, 2)
        self.assertAlmostEqual(result.acceptance_rate, 0.5)
        self.assertAlmostEqual(result.mean_precision, 0.8)
        self.assertEqual(result.p95_latency_ms, 200)


if __name__ == "__main__":
    unittest.main()
