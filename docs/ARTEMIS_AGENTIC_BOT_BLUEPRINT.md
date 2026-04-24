# ClearGlassInc Artemis Agentic Intelligence Bot

## System Architecture

### 1) Platform intent
**ClearGlassInc Artemis** operates as a high-trust, enterprise-grade intelligence platform for mission-critical cybersecurity operations. The bot architecture below is designed for Palantir-native environments where every action is policy-checked, audited, reversible, and attributable.

### 2) Layered architecture (end-to-end)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Web UI (React/TypeScript)                                                 │
│ Analyst Console | Commander Console | Trust & Governance Console          │
└──────────────┬─────────────────────────────────────────────────────────────┘
               │ OIDC + mTLS
┌──────────────▼─────────────────────────────────────────────────────────────┐
│ API Gateway / BFF (FastAPI + GraphQL façade)                              │
│ Auth context propagation | schema shaping | rate policy                   │
└──────────────┬─────────────────────────────────────────────────────────────┘
               │ signed event envelopes
┌──────────────▼─────────────────────────────────────────────────────────────┐
│ Core Services (Python)                                                     │
│ CaseSvc | AlertSvc | EvidenceSvc | PolicySvc | RecommendationSvc          │
└──────────────┬─────────────────────────────────────────────────────────────┘
               │ Kafka/Pulsar + Temporal workflows
┌──────────────▼─────────────────────────────────────────────────────────────┐
│ Data + Ontology Layer (Palantir Foundry)                                  │
│ Datasets | Ontology Objects/Links/Actions | Pipelines | Lineage           │
└──────────────┬─────────────────────────────────────────────────────────────┘
               │ AIP tool APIs
┌──────────────▼─────────────────────────────────────────────────────────────┐
│ AI Orchestration Layer (Palantir AIP)                                      │
│ Copilots | Multi-agent plans | Evals | Prompt/Router registry            │
└──────────────┬─────────────────────────────────────────────────────────────┘
               │ release policies
┌──────────────▼─────────────────────────────────────────────────────────────┐
│ Deployment Runtime (Palantir Apollo)                                       │
│ Ring deploy | kill switch | signed bundles | rollback                     │
└────────────────────────────────────────────────────────────────────────────┘
```

### 3) Product-role mapping
- **Gotham:** operational investigations, case-centric graph exploration, watchlist operations.
- **Foundry:** integration pipelines, ontology, data contracts, provenance.
- **AIP:** copilots, tool agents, evaluation harness, prompt/workflow routing.
- **Apollo:** secure deployment, progressive release, rollback, runtime compliance.

### 4) Runtime topology
- Frontend: React + TypeScript, strict CSP, feature flags, offline-safe caches.
- API gateway: FastAPI, OPA policy hook, scoped token exchange.
- Services: Python 3.12, async I/O, idempotent handlers, deterministic workflow IDs.
- Stream/event: Kafka topics for alert ingress, enrichment, decisions, learning signals.
- Storage: lakehouse + OLTP + vector index + graph view over ontology links.
- Observability: OpenTelemetry traces, Prometheus metrics, immutable audit store.

---

## Data and Ontology

### 1) Canonical entities
- `Person`, `Organization`, `Device`, `IPIndicator`, `MalwareFamily`, `Incident`, `Case`, `ActionPackage`, `Mission`, `PolicyDecision`.

### 2) Relationship grammar
- `ASSOCIATED_WITH`, `OWNS`, `COMMUNICATED_WITH`, `MENTIONED_IN`, `TRIGGERED`, `PART_OF_CAMPAIGN`, `ASSIGNED_TO`, `APPROVED_BY`.

### 3) Required metadata (every object + edge)
- Confidence (`0.0-1.0`)
- Temporal validity (`valid_from`, `valid_to`)
- Lineage (`source_system`, `pipeline_run_id`, `checksum`)
- Security context (`classification`, `compartment`, `coalition_tags`)
- Mission context (`mission_id`, `priority`, `region`)
- Governance references (`policy_version`, `decision_trace_id`)

### 4) SQL schema starter

```sql
CREATE TABLE artemis_incident (
  incident_id           TEXT PRIMARY KEY,
  mission_id            TEXT NOT NULL,
  severity              TEXT NOT NULL,
  status                TEXT NOT NULL,
  confidence            NUMERIC(4,3) NOT NULL,
  summary               TEXT,
  occurred_at           TIMESTAMPTZ NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_system         TEXT NOT NULL,
  lineage_run_id        TEXT NOT NULL,
  classification        TEXT NOT NULL,
  coalition_tags        JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE artemis_edge (
  edge_id               TEXT PRIMARY KEY,
  src_type              TEXT NOT NULL,
  src_id                TEXT NOT NULL,
  dst_type              TEXT NOT NULL,
  dst_id                TEXT NOT NULL,
  relation              TEXT NOT NULL,
  confidence            NUMERIC(4,3) NOT NULL,
  first_seen_at         TIMESTAMPTZ NOT NULL,
  last_seen_at          TIMESTAMPTZ NOT NULL,
  provenance_ref        TEXT NOT NULL
);

CREATE TABLE artemis_feedback (
  feedback_id           TEXT PRIMARY KEY,
  artifact_type         TEXT NOT NULL,
  artifact_id           TEXT NOT NULL,
  operator_id           TEXT NOT NULL,
  feedback_type         TEXT NOT NULL,
  rating                INT,
  correction_payload    JSONB,
  mission_outcome_label TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5) Ontology-driven behavior contract
- Agents must cite supporting ontology nodes before recommending action.
- Any recommendation without evidence lineage is blocked at policy gate.
- Retrieval weighting = `recency * confidence * mission_relevance * source_reliability`.

---

## AI and Agent Design

### 1) Copilot design
- **Analyst Copilot:** triage assistance, evidence summaries, contradiction detection.
- **Commander Copilot:** option ranking, policy viability, mission-impact projection.

### 2) Multi-agent chain
1. `TriageAgent`
2. `EnrichmentAgent`
3. `CorrelationAgent`
4. `SummaryAgent`
5. `RecommendationAgent`
6. `ApprovalGateAgent`

### 3) Tooling interface

```python
# services/ai/tools.py
from dataclasses import dataclass
from typing import Any, Dict

@dataclass(frozen=True)
class ToolResult:
    ok: bool
    payload: Dict[str, Any]
    evidence_ids: list[str]

class ArtemisTools:
    async def query_ontology(self, query: Dict[str, Any], auth_ctx: Dict[str, Any]) -> ToolResult: ...
    async def open_case(self, incident_id: str, auth_ctx: Dict[str, Any]) -> ToolResult: ...
    async def run_policy_precheck(self, proposed_action: Dict[str, Any], auth_ctx: Dict[str, Any]) -> ToolResult: ...
    async def request_approval(self, package_id: str, role: str, auth_ctx: Dict[str, Any]) -> ToolResult: ...
```

### 4) Agent routing policy
- Low-latency events route to compact model + deterministic heuristics.
- Ambiguous or high-severity events route to larger reasoning model.
- Routing rules are versioned and evaluated before promotion.

---

## Self-Improvement Loop

### 1) Signal capture
- Operator edits to summaries and action packages.
- Approve/reject decision outcomes.
- False-positive and false-negative labels.
- Mission KPIs (time-to-triage, precision@k, analyst trust score).

### 2) Improvement pipeline

```text
Feedback Ingest -> Label Normalization -> Eval Dataset Build
-> Candidate Generator (prompt/workflow/router)
-> Offline Evals -> Policy Risk Scan -> Human Review
-> Canary Deploy (Apollo ring 1) -> Monitor -> Promote or Rollback
```

### 3) Change governance
- Prompt changes: single reviewer + eval threshold.
- Workflow graph changes: AI Ops + mission owner approval.
- Decision policy changes: governance board quorum.

### 4) Drift controls
- Data drift: PSI/KL thresholds on feature windows.
- Behavioral drift: rising override rate by operators.
- Mission drift: KPI decay for two consecutive review periods.

### 5) Safe rollback mechanics
- Every deploy carries a rollback pointer (`prev_release_sha`).
- Apollo can hard-stop a faulty ring and revert within defined SLO.
- Failed canaries automatically lock promotion pipeline.

---

## Full-Stack Implementation

### 1) Web UI (TypeScript)

```ts
// ui/src/api/client.ts
export async function fetchRecommendations(caseId: string, token: string) {
  const r = await fetch(`/api/v1/cases/${caseId}/recommendations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`Recommendation fetch failed: ${r.status}`);
  return r.json();
}
```

### 2) API gateway + backend (Python)

```python
# services/api/main.py
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel

app = FastAPI(title="ClearGlassInc Artemis API")

class RecommendationRequest(BaseModel):
    incident_id: str

@app.post("/api/v1/recommendations")
async def create_recommendation(req: RecommendationRequest, auth_ctx=Depends(...)):
    # 1) policy pre-check
    # 2) run orchestration workflow
    # 3) persist outputs + audit trail
    # 4) return evidence-backed recommendation
    return {"incident_id": req.incident_id, "status": "queued"}
```

### 3) Event handlers (Python)

```python
# services/events/handlers.py
import json
from aiokafka import AIOKafkaConsumer

async def consume_alerts(loop, broker: str):
    consumer = AIOKafkaConsumer("alerts.raw.v1", bootstrap_servers=broker, loop=loop)
    await consumer.start()
    try:
        async for msg in consumer:
            event = json.loads(msg.value)
            # deterministic dedupe key
            dedupe_key = f"{event['source']}::{event['external_id']}"
            # publish to triage workflow topic
            await route_to_workflow(event, dedupe_key)
    finally:
        await consumer.stop()
```

### 4) Workflow state machine (Python)

```python
# services/workflows/triage.py
from enum import Enum

class TriageState(str, Enum):
    RECEIVED = "RECEIVED"
    ENRICHED = "ENRICHED"
    CORRELATED = "CORRELATED"
    RECOMMENDED = "RECOMMENDED"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    EXECUTED = "EXECUTED"
    CLOSED = "CLOSED"

TRANSITIONS = {
    TriageState.RECEIVED: [TriageState.ENRICHED],
    TriageState.ENRICHED: [TriageState.CORRELATED],
    TriageState.CORRELATED: [TriageState.RECOMMENDED],
    TriageState.RECOMMENDED: [TriageState.AWAITING_APPROVAL],
    TriageState.AWAITING_APPROVAL: [TriageState.EXECUTED, TriageState.CLOSED],
    TriageState.EXECUTED: [TriageState.CLOSED],
}
```

### 5) Policy-as-code check (OPA/Rego)

```rego
package artemis.authz

default allow = false

allow {
  input.action == "approve_action_package"
  input.user.role == "commander"
  input.resource.classification <= input.user.clearance
  input.resource.mission_id == input.user.mission_id
}
```

### 6) Eval pipeline (Python)

```python
# services/evals/pipeline.py
from dataclasses import dataclass

@dataclass
class EvalResult:
    precision: float
    recall: float
    latency_ms_p95: int
    trust_score: float


def gate(result: EvalResult) -> bool:
    return (
        result.precision >= 0.91
        and result.recall >= 0.88
        and result.latency_ms_p95 <= 1800
        and result.trust_score >= 4.2
    )
```

### 7) Deployment manifest (Apollo-style)

```yaml
release:
  name: artemis-ai-runtime
  version: 2.8.4
  signed: true
rollout:
  strategy: canary
  rings:
    - name: ring-0-internal
      traffic_percent: 5
    - name: ring-1-analyst
      traffic_percent: 25
    - name: ring-2-global
      traffic_percent: 100
rollback:
  auto_on:
    - metric: recommendation_error_rate
      threshold: 0.03
    - metric: operator_override_rate
      threshold: 0.30
```

---

## Security and Governance

### 1) Access control
- Need-to-know by default.
- RBAC + ABAC + relationship-scoped case permissions.
- Row/column/entity-level filtering for coalition boundaries.

### 2) Zero-trust execution
- Every service call includes short-lived identity and policy decision point checks.
- Tool calls are signed, traced, and replay-protected.

### 3) Immutable audit and provenance
- Write-once audit ledger for actions, approvals, and model decisions.
- All recommendations include model version, prompt version, evidence IDs.

### 4) Governance registries
- Prompt registry with semantic versions and owners.
- Workflow registry with test evidence.
- Model routing policy registry with SLA and risk class.

---

## Code Examples (bot starter skeleton)

### 1) Bot orchestration service (Python)

```python
# services/agentic_bot/orchestrator.py
from typing import Dict, Any

class ArtemisOrchestrator:
    def __init__(self, tools, router, policy, store):
        self.tools = tools
        self.router = router
        self.policy = policy
        self.store = store

    async def handle_incident(self, incident: Dict[str, Any], auth_ctx: Dict[str, Any]) -> Dict[str, Any]:
        route = await self.router.select_route(incident)
        triage = await self.tools.query_ontology({"incident_id": incident["incident_id"]}, auth_ctx)

        recommendation = {
            "incident_id": incident["incident_id"],
            "route": route,
            "evidence_ids": triage.evidence_ids,
            "action_options": ["monitor", "contain", "escalate"],
        }

        decision = await self.policy.precheck(recommendation, auth_ctx)
        await self.store.audit("recommendation.generated", recommendation)

        if not decision["allowed"]:
            return {"status": "blocked", "reason": decision["reason"]}

        return {"status": "awaiting_approval", "payload": recommendation}
```

### 2) Feedback ingestion (Python)

```python
# services/learning/ingest.py
async def ingest_feedback(event: dict, repository):
    normalized = {
        "artifact_id": event["artifact_id"],
        "feedback_type": event["type"],
        "rating": event.get("rating"),
        "correction_payload": event.get("correction", {}),
        "outcome": event.get("outcome_label"),
    }
    await repository.save_feedback(normalized)
    return normalized
```

### 3) Candidate proposer (Python)

```python
# services/learning/proposer.py
async def propose_prompt_update(metrics_before, metrics_after, current_prompt):
    delta_precision = metrics_after["precision"] - metrics_before["precision"]
    if delta_precision < 0.01:
        return None
    return {
        "proposal_type": "prompt_update",
        "from_version": current_prompt,
        "expected_gain": {"precision": delta_precision},
        "requires_approval": True,
    }
```

---

## Scenario Walkthrough (cinematic + technical)

1. **08:14:22 UTC** — A high-severity phishing cluster event enters `alerts.raw.v1`.
2. `TriageAgent` scores severity, deduplicates signatures, opens `INC-20419`.
3. `EnrichmentAgent` correlates domains, sender infrastructure, and prior campaign links from Foundry ontology.
4. `CorrelationAgent` discovers overlap with an active mission and elevates confidence from `0.71 -> 0.89`.
5. `RecommendationAgent` prepares three actions: `monitor`, `contain`, `escalate` with evidence graph.
6. `ApprovalGateAgent` submits an action package to commander queue; OPA verifies authorization.
7. Commander approves **contain**. Gotham case updates immediately; playbook workflow executes.
8. Outcome: false positives remain below threshold, containment latency improves by 17%.
9. Learning pipeline ingests feedback (approved action + analyst edits), generates a prompt proposal.
10. Proposal passes offline evals, enters Apollo canary ring, then promotes after stable trust metrics.
11. Full audit trail stores policy decision IDs, model versions, prompt versions, and approver identity.

---

## Implementation Notes for GitHub Deployment

- Place this document in `/docs` and reference it from `README.md`.
- Add architecture diagrams in `/assets/architecture` and link from GitHub Pages.
- Publish API examples in `/docs/api` with OpenAPI schema.
- Wire CI checks:
  - markdown lint,
  - policy unit tests,
  - eval gate tests,
  - link checks for docs.
- Maintain a changelog for all prompt/workflow/router versions.

This blueprint is intentionally implementation-ready, Python-forward, and structured for secure enterprise delivery under ClearGlassInc Artemis governance.
