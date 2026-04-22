# ClearGlassInc Artemis — Self-Evolving AI Intelligence Platform

## System Architecture

### 1) End-to-End Reference Architecture (Palantir-aligned)

```text
[External + Internal Data Sources]
   ├─ ISR feeds (video, SIGINT metadata, geospatial)
   ├─ HUMINT reports
   ├─ Cyber telemetry
   ├─ Logistics / mission systems
   ├─ Open-source intel
   └─ Partner coalition data
            │
            ▼
[Ingestion Layer - Foundry Pipelines + Streaming Connectors]
            │
            ▼
[Foundry Data Plane]
   ├─ Bronze (raw immutable)
   ├─ Silver (normalized, schema-enforced)
   ├─ Gold (mission-ready analytical views)
   └─ Ontology-bound Objects + Links
            │
            ├─────────────────────────────────────┐
            ▼                                     ▼
[Gotham Operational Apps]                   [AIP Agent Runtime]
   ├─ Case Management                         ├─ Analyst Copilot
   ├─ Investigation Graph                     ├─ Commander Copilot
   ├─ Alert Workbench                         ├─ Multi-agent orchestrations
   └─ Entity Tracking                         └─ Tool use + policy-gated actions
            │                                     │
            └──────────────► [Policy Decision Point] ◄──────────────┐
                                (OPA / Policy-as-Code)              │
                                             │                       │
                                             ▼                       │
                                 [Action + Approval Services]        │
                                             │                       │
                                             ▼                       │
                              [Audit + Provenance + Eval Layer] ─────┘
                                             │
                                             ▼
                                  [Apollo Deploy/Control Plane]
                             (progressive rollout, rollback, runtime pinning)
```

### 2) Full-stack components

- **Frontend (React/TypeScript + Gotham UI extensions):** mission dashboard, graph explorer, alert triage queue, AI copilot chat, approval queue.
- **API Gateway:** authn/authz, request signing, rate limits, schema validation, multi-tenant routing.
- **Backend Services (Python/FastAPI):** investigation service, recommendations service, case/action service, eval service.
- **Event Bus:** Kafka / Foundry streaming datasets for live event processing.
- **Data Layer:** Foundry lakehouse with immutable lineage and ontology-backed semantic model.
- **Search/Retrieval:** hybrid BM25 + vector search over reports, transcripts, geospatial annotations.
- **AI Runtime (AIP):** model routing, agent orchestration, tool registry, prompt/version controls.
- **Deployment (Apollo):** secure deploy rings, environment promotion, blast-radius-aware rollouts.

---

## Data and Ontology

### 1) Core ontology model

**Entities**
- `Person`, `Organization`, `Device`, `Vessel`, `Vehicle`, `Location`, `Mission`, `Case`, `Alert`, `SignalEvent`, `Artifact`, `Recommendation`, `ActionPackage`.

**Relationships**
- `ASSOCIATED_WITH`, `OBSERVED_AT`, `OWNS`, `COMMUNICATED_WITH`, `PARTICIPATES_IN`, `TRIGGERED`, `DERIVED_FROM`, `RECOMMENDS`, `APPROVED_BY`, `EXECUTED_AS`.

**Entity envelope fields (required)**
- `entity_id` (global UUID)
- `classification` (e.g., SECRET//REL TO X)
- `compartment_tags[]`
- `confidence_score` (0..1)
- `source_reliability` (A-F)
- `lineage_ref`
- `valid_time_start`, `valid_time_end`
- `system_time`
- `mission_context_id`
- `policy_labels[]`

### 2) Example ontology schema (SQL-ish)

```sql
CREATE TABLE ontology_entity (
  entity_id UUID PRIMARY KEY,
  entity_type TEXT NOT NULL,
  name TEXT,
  confidence_score DOUBLE PRECISION NOT NULL,
  classification TEXT NOT NULL,
  mission_context_id UUID,
  valid_time_start TIMESTAMP,
  valid_time_end TIMESTAMP,
  system_time TIMESTAMP NOT NULL DEFAULT NOW(),
  lineage_ref TEXT NOT NULL,
  attributes JSONB NOT NULL
);

CREATE TABLE ontology_link (
  link_id UUID PRIMARY KEY,
  src_entity_id UUID NOT NULL,
  dst_entity_id UUID NOT NULL,
  link_type TEXT NOT NULL,
  confidence_score DOUBLE PRECISION NOT NULL,
  classification TEXT NOT NULL,
  mission_context_id UUID,
  valid_time_start TIMESTAMP,
  valid_time_end TIMESTAMP,
  lineage_ref TEXT NOT NULL,
  FOREIGN KEY (src_entity_id) REFERENCES ontology_entity(entity_id),
  FOREIGN KEY (dst_entity_id) REFERENCES ontology_entity(entity_id)
);
```

### 3) Why ontology is central

- **For operators:** drives consistent investigation views, joins, timelines, and case semantics.
- **For agents:** constrains tool calls and reasoning to allowed object types/relationships.
- **For governance:** directly maps policy checks to entity/link labels and mission context.

---

## AI and Agent Design

### 1) Copilot classes (AIP)

1. **Analyst Copilot**
   - Summarizes incoming alerts and confidence rationale.
   - Suggests enrichment tasks (pull satellite snapshots, correlate comms, cross-case references).

2. **Commander Copilot**
   - Produces COA (course-of-action) options with risk/cost/time tradeoffs.
   - Generates approval-ready action packages.

### 2) Multi-agent workflow

- **Triage Agent:** classify and prioritize event severity.
- **Enrichment Agent:** collect contextual entities/artifacts.
- **Correlation Agent:** link event to active missions/cases.
- **Narrative Agent:** generate concise intel summary.
- **Recommendation Agent:** propose response packages.
- **Policy Agent:** validate every proposed action before operator display.

### 3) Tool-using action model

Agents can call tools:
- `query_ontology_graph`
- `retrieve_reports`
- `create_case`
- `draft_action_package`
- `request_human_approval`

All operationally significant actions are **two-phase**:
1) AI proposes (`PROPOSED`)  
2) Human approves (`APPROVED`) before execution.

---

## Self-Improvement Loop

### 1) Feedback capture signals

- Operator edits to AI summaries.
- Accept/reject of recommendations.
- Time-to-resolution and mission outcomes.
- False-positive/false-negative labels.
- Downstream action success/failure.

### 2) Improvement pipeline

```text
Signals -> Feature Builder -> Eval Dataset Builder -> Candidate Generator
       -> Offline Eval Harness -> Safety/Policy Checks -> Human Review Board
       -> Canary Deploy (Apollo) -> Live A/B -> Promotion or Rollback
```

### 3) What can self-evolve (guardrailed)

- Prompt templates and instruction ordering.
- Workflow branching heuristics.
- Model routing thresholds.
- Tool retry/backoff strategy.
- Confidence calibration curves.

### 4) What cannot self-evolve autonomously

- Mission objectives.
- Access policies.
- Action authority boundaries.
- Hard safety rules.

### 5) Drift + rollback strategy

- Continuous drift monitors on precision/recall/latency/trust.
- Automatic rollback trigger if KPI delta breaches SLO budget.
- Apollo pins last known-good agent package and prompt bundle.

---

## Full-Stack Implementation

### 1) Service topology

```yaml
services:
  api-gateway:
    tech: envoy
    responsibilities: [jwt-validation, rate-limit, request-signing]

  investigation-service:
    tech: fastapi
    responsibilities: [case-queries, graph-joins, timelines]

  ai-orchestrator:
    tech: python-aip-runtime
    responsibilities: [agent-graph, tool-calls, model-routing]

  policy-service:
    tech: opa
    responsibilities: [allow/deny, explain, redaction]

  eval-service:
    tech: python
    responsibilities: [offline-evals, ab-metrics, drift-alerts]

  event-processor:
    tech: kafka-streams
    responsibilities: [triage, dedupe, route-to-workflows]
```

### 2) Web UI blueprint

- **Mission Console:** live map, timeline, case board.
- **Graph Workbench:** ontology entity-link traversal.
- **Copilot Pane:** explainable recommendations + citations + confidence.
- **Approval Queue:** pending action packages with policy explain output.
- **Eval Dashboard:** model version KPIs, drift, trust trend.

### 3) API surface

```http
POST /v1/events/ingest
GET  /v1/cases/{case_id}/graph
POST /v1/ai/recommendations
POST /v1/actions/proposals
POST /v1/actions/{id}/approve
POST /v1/evals/run
GET  /v1/metrics/drift
```

---

## Security and Governance

### 1) Zero-trust + need-to-know

- Mutual TLS between services.
- Every request carries user identity, mission role, and coalition claims.
- PDP/PEP architecture for every read/write/tool invocation.

### 2) Fine-grained controls

- Row-level policies on mission and classification.
- Column/entity redaction by caveat and compartment tags.
- Coalition-aware ABAC + RBAC hybrid model.

### 3) Immutable provenance

- Every transformation has lineage pointers (source dataset, transform version, operator/tool id).
- Every AI response stores prompt hash, model version, tool trace, and policy decision id.

### 4) Governance domains

- **Model governance:** approved model catalog and runtime constraints.
- **Prompt governance:** signed prompt bundles, semantic diff review.
- **Policy governance:** versioned rego bundles with mandatory approvals.

---

## Code Examples

### 1) Python backend: event ingestion + ontology upsert

```python
# services/investigation_service/api.py
from fastapi import FastAPI, Depends
from pydantic import BaseModel, Field
from uuid import uuid4
from datetime import datetime, timezone

app = FastAPI()

class SignalEventIn(BaseModel):
    source: str
    event_type: str
    confidence: float = Field(ge=0.0, le=1.0)
    mission_context_id: str
    payload: dict

@app.post("/v1/events/ingest")
def ingest_event(evt: SignalEventIn, ctx=Depends(lambda: {"user": "operator-123"})):
    event_id = str(uuid4())
    entity = {
        "entity_id": event_id,
        "entity_type": "SignalEvent",
        "confidence_score": evt.confidence,
        "classification": "SECRET//REL",
        "mission_context_id": evt.mission_context_id,
        "valid_time_start": datetime.now(timezone.utc).isoformat(),
        "lineage_ref": f"ingest:{evt.source}",
        "attributes": evt.payload,
    }
    # write_to_foundry_dataset("ontology_entity", entity)
    # emit_kafka("signal_events", {"event_id": event_id, ...})
    return {"event_id": event_id, "status": "INGESTED"}
```

### 2) Python agent orchestration with policy gates

```python
# services/ai_orchestrator/workflow.py
from enum import Enum

class State(str, Enum):
    TRIAGE = "TRIAGE"
    ENRICH = "ENRICH"
    CORRELATE = "CORRELATE"
    RECOMMEND = "RECOMMEND"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"
    EXECUTED = "EXECUTED"


def run_workflow(event_id: str, user_ctx: dict):
    triage = triage_agent(event_id)
    enrich = enrichment_agent(event_id)
    corr = correlation_agent(event_id, enrich)
    rec = recommendation_agent(event_id, corr)

    decision = policy_check(
        action="CREATE_ACTION_PACKAGE",
        subject=user_ctx,
        resource={"mission_context_id": rec["mission_context_id"], "risk": rec["risk"]},
    )

    if not decision["allow"]:
        return {"state": State.RECOMMEND, "recommendation": rec, "policy": decision}

    proposal_id = create_action_package(rec)
    queue_human_approval(proposal_id)
    return {"state": State.APPROVAL_REQUIRED, "proposal_id": proposal_id}
```

### 3) Policy-as-code (Rego)

```rego
package artemis.authz

default allow = false

allow {
  input.action == "CREATE_ACTION_PACKAGE"
  input.subject.clearance in {"SECRET", "TOP_SECRET"}
  input.subject.mission_context_id == input.resource.mission_context_id
  not high_risk_without_commander
}

high_risk_without_commander {
  input.resource.risk == "HIGH"
  input.subject.role != "COMMANDER"
}
```

### 4) Eval pipeline (Python)

```python
# services/eval_service/run_eval.py
from dataclasses import dataclass
from statistics import mean

@dataclass
class EvalResult:
    precision: float
    recall: float
    latency_ms: float
    operator_trust: float


def score_run(samples):
    p = mean([s["tp"] / max(1, (s["tp"] + s["fp"])) for s in samples])
    r = mean([s["tp"] / max(1, (s["tp"] + s["fn"])) for s in samples])
    l = mean([s["latency_ms"] for s in samples])
    t = mean([s["trust_score"] for s in samples])
    return EvalResult(precision=p, recall=r, latency_ms=l, operator_trust=t)


def should_promote(candidate: EvalResult, baseline: EvalResult) -> bool:
    return (
        candidate.precision >= baseline.precision + 0.02
        and candidate.recall >= baseline.recall
        and candidate.latency_ms <= baseline.latency_ms * 1.05
        and candidate.operator_trust >= baseline.operator_trust
    )
```

### 5) Prompt/version registry tables

```sql
CREATE TABLE prompt_bundle (
  prompt_bundle_id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  semantic_version TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  model_route JSONB NOT NULL,
  created_by TEXT NOT NULL,
  approved_by TEXT,
  approval_status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE deployment_release (
  release_id UUID PRIMARY KEY,
  component TEXT NOT NULL,
  version TEXT NOT NULL,
  ring TEXT NOT NULL,
  apollo_env TEXT NOT NULL,
  rollout_status TEXT NOT NULL,
  rollback_parent_release_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## Scenario Walkthrough (Cinematic + Technical)

### T+00:00 — Live event lands
A maritime ISR feed emits anomalous transponder behavior near a protected corridor. Ingestion pipeline writes raw packet (`bronze`), normalizes track (`silver`), then materializes `SignalEvent` + `Vessel` entities (`gold` + ontology).

### T+00:15 — AI triage starts
Triage Agent assigns severity `HIGH` with confidence 0.81 due to route deviation + comms silence pattern match.

### T+00:40 — Multi-agent enrichment/correlation
- Enrichment Agent pulls prior sightings and ownership chain.
- Correlation Agent links vessel to an open case tagged with sanctions-evasion indicators.
- Narrative Agent drafts a 7-line intelligence brief with evidence citations.

### T+01:10 — Recommendation proposed
Recommendation Agent drafts three COAs:
1. Passive monitoring (low risk)
2. Coalition notification + intercept prep (medium)
3. Immediate interdiction request (high)

Policy Agent evaluates each COA against role/clearance/mission rules; COA-3 requires commander approval.

### T+01:30 — Human gate
Commander reviews package in Approval Queue, rejects COA-3, approves COA-2, adds note: “Need corroboration threshold >=0.85 for interdiction next time.”

### T+06:00 — Outcome observed
Mission result indicates COA-2 was successful; false escalation avoided.

### T+06:10 — Self-improvement cycle
- Feedback parser captures rejection reason and outcome.
- Eval builder turns this into a counterfactual sample.
- Candidate prompt/workflow update increases interdiction recommendation threshold from 0.80 -> 0.86 when corroboration signals are sparse.
- Offline eval passes precision gain (+3.1%), no recall regression.
- Human review board approves.
- Apollo canary rollout (10% analyst traffic) shows stable latency and higher operator trust.
- Candidate promoted to prod with full audit chain.

Result: **ClearGlassInc Artemis gets better each mission cycle while preserving strict human authority and policy constraints.**
