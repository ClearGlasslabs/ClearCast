"""Safe, dependency-free agentic workflow prototype."""

from __future__ import annotations

import argparse
from dataclasses import asdict, dataclass
import hashlib
import json
import re
from uuid import uuid4

from .runtime import AppendOnlyAuditLog, MissionContext


@dataclass(frozen=True)
class WorkflowPlan:
    intent: str
    action: str


@dataclass(frozen=True)
class WorkflowResult:
    workflow_id: str
    intent: str
    action: str
    output: str
    audit_events: tuple[dict[str, str], ...]


class RequestPlanner:
    """Classifies untrusted text without interpreting it as instructions."""

    _SECURITY_TERMS = re.compile(
        r"\b(security|cyber|incident|malware|phishing|breach|vulnerability)\b",
        re.IGNORECASE,
    )

    def plan(self, request: str) -> WorkflowPlan:
        intent = "security_review" if self._SECURITY_TERMS.search(request) else "general_review"
        return WorkflowPlan(intent=intent, action="classify_for_human_review")


class ActionSelector:
    ALLOWED_ACTIONS = frozenset({"classify_for_human_review"})

    def select(self, plan: WorkflowPlan) -> str:
        if plan.action not in self.ALLOWED_ACTIONS:
            raise PermissionError(f"action is not allowlisted: {plan.action}")
        return plan.action


class AgenticWorkflow:
    """Runs a local, non-mutating workflow and records metadata-only audit events."""

    def __init__(
        self,
        context: MissionContext,
        audit: AppendOnlyAuditLog | None = None,
        planner: RequestPlanner | None = None,
        selector: ActionSelector | None = None,
    ) -> None:
        self.context = context
        self.audit = audit or AppendOnlyAuditLog()
        self.planner = planner or RequestPlanner()
        self.selector = selector or ActionSelector()

    def run(self, request: str) -> WorkflowResult:
        if not request.strip():
            raise ValueError("request must not be empty")

        workflow_id = str(uuid4())
        first_event = len(self.audit.events)
        request_hash = hashlib.sha256(request.encode("utf-8")).hexdigest()
        self.audit.append(
            "agentic_workflow.received",
            self.context,
            {"workflow_id": workflow_id, "request_sha256": request_hash},
        )

        plan = self.planner.plan(request)
        self.audit.append(
            "agentic_workflow.planned",
            self.context,
            {"workflow_id": workflow_id, "intent": plan.intent},
        )
        try:
            action = self.selector.select(plan)
        except PermissionError:
            self.audit.append(
                "agentic_workflow.action_denied",
                self.context,
                {
                    "workflow_id": workflow_id,
                    "action_sha256": hashlib.sha256(plan.action.encode("utf-8")).hexdigest(),
                },
            )
            raise
        self.audit.append(
            "agentic_workflow.action_selected",
            self.context,
            {"workflow_id": workflow_id, "action": action},
        )

        output = self._execute(action, plan)
        self.audit.append(
            "agentic_workflow.executed",
            self.context,
            {"workflow_id": workflow_id, "action": action},
        )
        self.audit.append(
            "agentic_workflow.output",
            self.context,
            {
                "workflow_id": workflow_id,
                "output_sha256": hashlib.sha256(output.encode("utf-8")).hexdigest(),
            },
        )
        events = tuple(
            asdict(event) for event in self.audit.events[first_event:]
        )
        return WorkflowResult(workflow_id, plan.intent, action, output, events)

    @staticmethod
    def _execute(action: str, plan: WorkflowPlan) -> str:
        if action != "classify_for_human_review":
            raise PermissionError(f"action is not executable: {action}")
        category = "Security-related" if plan.intent == "security_review" else "General"
        return f"{category} request classified for human review; no external action was taken."


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("request", help="untrusted request text to classify locally")
    args = parser.parse_args()
    context = MissionContext(
        actor_id="local-prototype",
        roles=frozenset({"analyst"}),
        mission_id="local-demo",
        clearance=0,
        compartments=frozenset(),
        coalition_tags=frozenset(),
    )
    result = AgenticWorkflow(context).run(args.request)
    print(json.dumps(asdict(result), indent=2))


if __name__ == "__main__":
    main()
