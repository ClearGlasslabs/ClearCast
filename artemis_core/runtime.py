"""Small, executable model of Artemis' safety-critical control plane.

This module deliberately uses only the Python standard library.  It is not a
replacement for Foundry/AIP APIs; it makes the contracts described in the
architecture blueprint executable and testable before those adapters exist.
"""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from datetime import datetime, timezone
from enum import Enum
import hashlib
import json
from typing import Any, Callable, Iterable, Mapping
from uuid import uuid4


class ActionDecision(str, Enum):
    DENY = "deny"
    REQUIRE_APPROVAL = "require_approval"
    ALLOW = "allow"


class WorkflowState(str, Enum):
    RECEIVED = "received"
    TRIAGED = "triaged"
    ENRICHED = "enriched"
    RECOMMENDED = "recommended"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"


@dataclass(frozen=True)
class MissionContext:
    actor_id: str
    roles: frozenset[str]
    mission_id: str
    clearance: int
    compartments: frozenset[str]
    coalition_tags: frozenset[str]


@dataclass(frozen=True)
class ProtectedResource:
    resource_id: str
    classification: int
    compartments: frozenset[str]
    coalition_tags: frozenset[str]
    mission_id: str


@dataclass(frozen=True)
class AuditEvent:
    event_id: str
    occurred_at: str
    event_type: str
    actor_id: str
    mission_id: str
    payload_hash: str
    previous_hash: str
    event_hash: str


class AppendOnlyAuditLog:
    """Hash-chained audit sink; production adapters persist to immutable storage."""

    def __init__(self) -> None:
        self._events: list[AuditEvent] = []

    @staticmethod
    def _canonical(payload: Mapping[str, Any]) -> str:
        return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)

    def append(self, event_type: str, context: MissionContext, payload: Mapping[str, Any]) -> AuditEvent:
        previous_hash = self._events[-1].event_hash if self._events else "GENESIS"
        payload_hash = hashlib.sha256(self._canonical(payload).encode()).hexdigest()
        envelope = {
            "event_type": event_type,
            "actor_id": context.actor_id,
            "mission_id": context.mission_id,
            "payload_hash": payload_hash,
            "previous_hash": previous_hash,
        }
        event = AuditEvent(
            event_id=str(uuid4()),
            occurred_at=datetime.now(timezone.utc).isoformat(),
            event_hash=hashlib.sha256(self._canonical(envelope).encode()).hexdigest(),
            **envelope,
        )
        self._events.append(event)
        return event

    def verify(self) -> bool:
        previous = "GENESIS"
        for event in self._events:
            envelope = {
                "event_type": event.event_type,
                "actor_id": event.actor_id,
                "mission_id": event.mission_id,
                "payload_hash": event.payload_hash,
                "previous_hash": previous,
            }
            if event.previous_hash != previous:
                return False
            if hashlib.sha256(self._canonical(envelope).encode()).hexdigest() != event.event_hash:
                return False
            previous = event.event_hash
        return True

    @property
    def events(self) -> tuple[AuditEvent, ...]:
        return tuple(self._events)


class PolicyEngine:
    """Fail-closed ABAC check applied before retrieval and before side effects."""

    OPERATIONAL_ACTIONS = frozenset({"open_case", "publish_product", "prepare_action_package"})

    def authorize(
        self, context: MissionContext, resource: ProtectedResource, action: str
    ) -> ActionDecision:
        if context.mission_id != resource.mission_id:
            return ActionDecision.DENY
        if context.clearance < resource.classification:
            return ActionDecision.DENY
        if not resource.compartments.issubset(context.compartments):
            return ActionDecision.DENY
        if resource.coalition_tags and not resource.coalition_tags.intersection(context.coalition_tags):
            return ActionDecision.DENY
        if action in self.OPERATIONAL_ACTIONS:
            return ActionDecision.REQUIRE_APPROVAL
        return ActionDecision.ALLOW


@dataclass(frozen=True)
class WorkflowTransition:
    from_state: WorkflowState
    to_state: WorkflowState
    actor_id: str
    reason: str


class TriageWorkflow:
    """Deterministic state machine with explicit human gates."""

    _ALLOWED = {
        WorkflowState.RECEIVED: {WorkflowState.TRIAGED},
        WorkflowState.TRIAGED: {WorkflowState.ENRICHED},
        WorkflowState.ENRICHED: {WorkflowState.RECOMMENDED},
        WorkflowState.RECOMMENDED: {WorkflowState.PENDING_APPROVAL},
        WorkflowState.PENDING_APPROVAL: {WorkflowState.APPROVED, WorkflowState.REJECTED},
    }

    def __init__(self, workflow_id: str, audit: AppendOnlyAuditLog) -> None:
        self.workflow_id = workflow_id
        self.state = WorkflowState.RECEIVED
        self.history: list[WorkflowTransition] = []
        self.audit = audit

    def transition(self, target: WorkflowState, context: MissionContext, reason: str) -> None:
        if target not in self._ALLOWED.get(self.state, set()):
            raise ValueError(f"invalid transition: {self.state.value} -> {target.value}")
        if target in {WorkflowState.APPROVED, WorkflowState.REJECTED} and "operator" not in context.roles:
            raise PermissionError("only an operator may resolve an approval gate")
        transition = WorkflowTransition(self.state, target, context.actor_id, reason)
        self.state = target
        self.history.append(transition)
        self.audit.append(
            "workflow.transition",
            context,
            {"workflow_id": self.workflow_id, "from": transition.from_state.value,
             "to": target.value, "reason": reason},
        )


@dataclass(frozen=True)
class FeedbackEvent:
    mission_id: str
    artifact_name: str
    outcome: str
    accepted: bool
    precision: float
    latency_ms: int
    operator_edit_distance: float


@dataclass(frozen=True)
class EvaluationResult:
    sample_count: int
    acceptance_rate: float
    mean_precision: float
    p95_latency_ms: int
    mean_edit_distance: float


def evaluate_feedback(events: Iterable[FeedbackEvent]) -> EvaluationResult:
    samples = list(events)
    if not samples:
        raise ValueError("at least one feedback event is required")
    latencies = sorted(item.latency_ms for item in samples)
    p95_index = min(len(latencies) - 1, max(0, int(0.95 * len(latencies) + 0.9999) - 1))
    return EvaluationResult(
        sample_count=len(samples),
        acceptance_rate=sum(item.accepted for item in samples) / len(samples),
        mean_precision=sum(item.precision for item in samples) / len(samples),
        p95_latency_ms=latencies[p95_index],
        mean_edit_distance=sum(item.operator_edit_distance for item in samples) / len(samples),
    )


@dataclass(frozen=True)
class ArtifactCandidate:
    name: str
    version: str
    content: str
    status: str = "draft"
    approved_by: str | None = None
    content_hash: str = field(init=False)

    def __post_init__(self) -> None:
        object.__setattr__(self, "content_hash", hashlib.sha256(self.content.encode()).hexdigest())


class ArtifactRegistry:
    """Promotion controller: proposals never self-activate."""

    def __init__(self, audit: AppendOnlyAuditLog) -> None:
        self.audit = audit
        self._artifacts: dict[str, list[ArtifactCandidate]] = {}

    def propose(self, candidate: ArtifactCandidate, context: MissionContext) -> None:
        versions = self._artifacts.setdefault(candidate.name, [])
        if any(item.version == candidate.version for item in versions):
            raise ValueError("artifact version already exists")
        versions.append(candidate)
        self.audit.append("artifact.proposed", context, {"name": candidate.name,
                                                          "version": candidate.version,
                                                          "hash": candidate.content_hash})

    def approve(
        self,
        name: str,
        version: str,
        context: MissionContext,
        gate: Callable[[ArtifactCandidate], bool],
    ) -> ArtifactCandidate:
        if "model_governor" not in context.roles:
            raise PermissionError("model_governor role required")
        candidate = self._find(name, version)
        if not gate(candidate):
            raise ValueError("candidate failed evaluation gate")
        approved = replace(candidate, status="approved", approved_by=context.actor_id)
        self._replace(approved)
        self.audit.append("artifact.approved", context, {"name": name, "version": version,
                                                          "hash": approved.content_hash})
        return approved

    def activate(self, name: str, version: str, context: MissionContext) -> ArtifactCandidate:
        candidate = self._find(name, version)
        if candidate.status != "approved":
            raise ValueError("only an approved artifact may be activated")
        for prior in tuple(self._artifacts[name]):
            if prior.status == "active":
                self._replace(replace(prior, status="retired"))
        active = replace(candidate, status="active")
        self._replace(active)
        self.audit.append("artifact.activated", context, {"name": name, "version": version})
        return active

    def rollback(self, name: str, context: MissionContext) -> ArtifactCandidate:
        history = self._artifacts.get(name, [])
        active = next((item for item in history if item.status == "active"), None)
        retired = [item for item in history if item.status == "retired"]
        if active is None or not retired:
            raise ValueError("rollback requires an active and a previously active artifact")
        self._replace(replace(active, status="rolled_back"))
        restored = replace(retired[-1], status="active")
        self._replace(restored)
        self.audit.append("artifact.rolled_back", context,
                          {"name": name, "from": active.version, "to": restored.version})
        return restored

    def _find(self, name: str, version: str) -> ArtifactCandidate:
        candidate = next((item for item in self._artifacts.get(name, []) if item.version == version), None)
        if candidate is None:
            raise KeyError(f"unknown artifact {name}@{version}")
        return candidate

    def _replace(self, replacement: ArtifactCandidate) -> None:
        versions = self._artifacts[replacement.name]
        index = next(index for index, item in enumerate(versions) if item.version == replacement.version)
        versions[index] = replacement
