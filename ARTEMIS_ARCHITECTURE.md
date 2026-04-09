# ClearGlassInc Artemis — Self-Evolving AI Intelligence Platform

## System Architecture

### 1) End-to-End Layered Architecture

```text
[Web UI (Analyst Console, Commander COP, Admin)]
   -> [API Gateway + BFF]
      -> [Domain Services: Case, Entity, Alert, Mission, Workflow]
         -> [Event Bus / Stream Processing]
            -> [Foundry Pipelines + Ontology + Lakehouse]
               -> [Search/RAG Index + Feature Store]
                  -> [AIP Agent Orchestrator + Model Router + Tool Layer]
                     -> [Policy Decision Point + Guardrails]
                        -> [Gotham Operational Views + Action Apps]
                           -> [Apollo Deployment + Runtime Control]
```

### 2) Platform Mapping (Palantir-native)

- **Gotham**: operational investigation UI, case management, entity link analysis, mission timelines.
- **Foundry**: data ingestion, transforms, ontology objects/links, lineage, metrics, app backend logic.
- **AIP**: copilots, agent workflows, tool orchestration, eval harnesses, prompt/model routing.
- **Apollo**: deployment, release channels, canary/rollback, policy-locked runtime updates.

### 3) Runtime Components

- **Frontend**: React + TypeScript mission consoles with live map/timeline and confidence overlays.
- **API Gateway/BFF**: GraphQL + REST gateway with ABAC/RBAC enforcement and request-level audit IDs.
- **Microservices**: Python/FastAPI + Kotlin/Java services for cases, recommendations, and workflow execution.
- **Streaming**: Kafka/PubSub topics for event ingestion, enrichment outputs, feedback, and outcome events.
- **Storage**:
  - Lakehouse tables for immutable raw + curated intelligence facts.
  - OLTP store for case/workflow state.
  - Vector + keyword retrieval index for retrieval augmentation.
- **AI Orchestration**: AIP tool-enabled agents, evaluator services, model router, prompt registry.
- **Governance**: policy-as-code (OPA style), immutable audit log, change-approval workflow.

---

## Data and Ontology

### 1) Core Entity Model

```yaml
Entity:
  Person:
    fields: [person_id, names[], aliases[], dob, nationality, risk_score, confidence]
  Organization:
    fields: [org_id, names[], sector, ownership, risk_score, confidence]
  Asset:
    fields: [asset_id, type, geolocation, owner_ref, status, confidence]
  Event:
    fields: [event_id, event_type, time_start, time_end, location, source_refs[], confidence]
  Case:
    fields: [case_id, title, mission_id, status, priority, assigned_team, created_at]
  Mission:
    fields: [mission_id, theater, objective, commander, start_time, classification]
```

### 2) Relationship Model

```yaml
Relationships:
  ASSOCIATED_WITH: [Person <-> Organization]
  OWNS: [Organization -> Asset]
  PARTICIPATED_IN: [Person/Organization -> Event]
  LINKED_TO: [Case -> Entity/Event]
  PRECEDES: [Event -> Event]
  LOCATED_AT: [Entity/Event -> GeoCell]
```

### 3) Required Cross-Cutting Fields

Every object/edge carries:
- `confidence` (0-1), `source_reliability`, `extraction_method`
- `valid_time` + `system_time` (bi-temporal state)
- `lineage` (upstream dataset + transform version)
- `classification`, `compartment`, `coalition_tags`
- `policy_labels` for row/column/entity-level controls

### 4) Ontology-Driven Behavior

- Analyst views are ontology-native: timeline, relationship graph, mission context panes.
- AI tools are permission-scoped by ontology type and mission context.
- Agents query ontology abstractions (not raw table names), so schema drift is contained.

---

## AI and Agent Design

### 1) Copilots

- **Analyst Copilot**: triage support, source-backed summaries, anomaly explanations, hypothesis generation.
- **Commander Copilot**: mission impact forecasts, recommended courses of action (COAs), confidence rationale.

### 2) Multi-Agent Workflow Topology

```text
Intake Agent -> Enrichment Agent -> Correlation Agent -> Summarization Agent -> Recommendation Agent
                                     |                                     |
                                     +-> Risk Scoring Agent               +-> Policy Review Agent
```

### 3) Tooling Contract

Each agent can call only whitelisted tools:
- `search_entities`, `query_events`, `build_timeline`, `open_case`, `draft_action_package`, `request_human_approval`
- Tool calls include: `mission_id`, `purpose`, `justification`, `max_scope`, `policy_context`

### 4) Operational Approval Gates

- Any action changing operational state (dispatch, escalation, cross-domain sharing) requires:
  1. policy pre-check,
  2. human approval step,
  3. immutable approval artifact.

---

## Self-Improvement Loop

### 1) Signal Collection

Capture:
- operator edits to AI outputs,
- accept/reject decisions,
- query/tool traces,
- alert precision outcomes,
- mission-level success/failure labels,
- latency/token cost/error metrics.

### 2) Learning Pipeline

```text
Signals -> Feature Builder -> Eval Dataset Builder -> Candidate Changes
         -> Offline Eval (quality/safety) -> Human Review Board
         -> Canary Rollout -> Online Eval -> Promote/Rollback
```

### 3) What Can Improve (Under Guardrails)

- prompt templates + retrieval instructions,
- workflow branching heuristics,
- model routing policy (small/fast vs large/accurate),
- confidence threshold tuning,
- alert prioritization logic.

### 4) Hard Guardrails

- No autonomous objective changes.
- No policy bypass on low confidence.
- No privilege elevation by agents.
- No promotion of candidate updates without signed approval.

### 5) Versioning and Rollback

- Version every prompt/workflow/model-route as immutable artifacts.
- Track compatibility matrix with ontology/API versions.
- Apollo-controlled canary rollout + one-click rollback.

---

## Full-Stack Implementation

### 1) Web UI

- React app with mission workspace modules:
  - live event feed,
  - entity graph explorer,
  - case board,
  - copilot panel with citation drawer,
  - decision/approval modal with policy reason display.

### 2) API Gateway

- JWT/mTLS auth, request signing, mission context propagation.
- GraphQL for analyst queries; REST/webhooks for workflow actions.

### 3) Backend Services

- `intel-intake-service`: receives and normalizes inbound events.
- `entity-resolution-service`: dedupe/link entities with confidence outputs.
- `case-service`: case lifecycle + assignment rules.
- `agent-orchestrator-service`: AIP workflow runner and tool mediation.
- `eval-service`: continuous offline/online evaluations.

### 4) Streaming + Storage

- Topics:
  - `intel.raw`, `intel.enriched`, `intel.correlated`, `ops.feedback`, `ops.outcomes`, `ai.eval.results`
- Stores:
  - bronze/silver/gold lakehouse zones,
  - vector index for documents/events,
  - graph projection for ontology traversals.

### 5) Inference and Model Router

- Router policy chooses model by:
  - sensitivity/classification,
  - latency SLO,
  - expected complexity,
  - historical task quality.

### 6) Observability

- OpenTelemetry traces for every tool call.
- Structured logs with `trace_id`, `case_id`, `mission_id`, `agent_id`, `policy_decision_id`.
- Dashboards: precision@k, false positive rate, time-to-triage, acceptance rate, mission impact.

---

## Security and Governance

### 1) Access Control

- Need-to-know + attribute-based access (ABAC) + role-based overlays.
- Entity-level ACL + row/column masks by coalition and compartment.
- Just-in-time delegated access with expiry and full audit.

### 2) Zero-Trust Execution

- mTLS between services, workload identities, signed artifacts.
- No direct DB access from UI; policy mediation at gateway and service layer.
- Secret management with HSM-backed keys and key rotation.

### 3) Provenance & Audit

- Immutable append-only audit records for:
  - data ingestion,
  - ontology updates,
  - tool calls,
  - approvals/rejections,
  - model/prompt/workflow version promotions.

### 4) Model & Prompt Governance

- Prompt registry with signed versions + threat-reviewed templates.
- Model registry with usage constraints (classification, region, data handling).
- Policy-as-code checks before runtime invocation.

---

## Code Examples

### 1) Event Intake (Python/FastAPI)

```python
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

class IntelEvent(BaseModel):
    event_id: str
    mission_id: str
    payload: dict
    source: str
    classification: str

@app.post("/v1/intel/events")
def ingest_event(evt: IntelEvent, x_request_id: str = Header(default="")):
    if evt.classification not in {"UNCLAS", "SECRET", "TS"}:
        raise HTTPException(status_code=400, detail="invalid classification")

    envelope = {
        "trace_id": x_request_id or f"evt-{evt.event_id}",
        "received_at": datetime.utcnow().isoformat(),
        "event": evt.model_dump(),
    }
    publish("intel.raw", envelope)  # Kafka/PubSub
    return {"status": "accepted", "trace_id": envelope["trace_id"]}
```

### 2) Policy Check Middleware (TypeScript)

```ts
export async function authorizeAction(ctx: {
  userId: string;
  missionId: string;
  action: string;
  entityRefs: string[];
  coalition: string;
}) {
  const decision = await policyClient.evaluate({
    principal: ctx.userId,
    action: ctx.action,
    resource: { missionId: ctx.missionId, entities: ctx.entityRefs },
    attrs: { coalition: ctx.coalition }
  });

  audit.log("policy.decision", {
    decisionId: decision.id,
    allow: decision.allow,
    reason: decision.reason,
    userId: ctx.userId,
    action: ctx.action
  });

  if (!decision.allow) throw new Error(`Denied: ${decision.reason}`);
  return decision;
}
```

### 3) Ontology Query (SQL-like)

```sql
-- High-risk entities linked to active mission cases in last 24h
SELECT
  c.case_id,
  e.entity_id,
  e.entity_type,
  e.risk_score,
  l.relationship_type,
  ev.event_time
FROM ontology.case_entity_link l
JOIN ontology.cases c ON c.case_id = l.case_id
JOIN ontology.entities e ON e.entity_id = l.entity_id
LEFT JOIN ontology.events ev ON ev.event_id = l.event_id
WHERE c.mission_id = :mission_id
  AND c.status IN ('OPEN', 'ACTIVE')
  AND e.risk_score >= 0.8
  AND ev.event_time >= NOW() - INTERVAL '24 HOURS';
```

### 4) Agent Workflow State Machine (Python)

```python
from enum import Enum

class State(str, Enum):
    TRIAGE = "triage"
    ENRICH = "enrich"
    CORRELATE = "correlate"
    SUMMARIZE = "summarize"
    RECOMMEND = "recommend"
    HUMAN_REVIEW = "human_review"
    COMPLETE = "complete"

TRANSITIONS = {
    State.TRIAGE: State.ENRICH,
    State.ENRICH: State.CORRELATE,
    State.CORRELATE: State.SUMMARIZE,
    State.SUMMARIZE: State.RECOMMEND,
    State.RECOMMEND: State.HUMAN_REVIEW,
    State.HUMAN_REVIEW: State.COMPLETE,
}

def run_workflow(ctx):
    state = State.TRIAGE
    while state != State.COMPLETE:
        ctx = run_agent_step(state, ctx)
        if state == State.HUMAN_REVIEW and not ctx["approved"]:
            return {"status": "rejected", "ctx": ctx}
        state = TRANSITIONS[state]
    return {"status": "approved", "ctx": ctx}
```

### 5) Eval Pipeline Skeleton

```python
def evaluate_candidate(candidate_version: str, dataset_id: str):
    baseline = run_eval_suite(version="prod", dataset=dataset_id)
    candidate = run_eval_suite(version=candidate_version, dataset=dataset_id)

    gates = {
      "precision_min": 0.82,
      "recall_min": 0.78,
      "hallucination_max": 0.02,
      "latency_p95_ms": 1800,
    }

    verdict = compare_with_gates(candidate, baseline, gates)
    publish("ai.eval.results", {
      "candidate": candidate_version,
      "baseline": "prod",
      "verdict": verdict,
      "metrics": candidate,
    })
    return verdict
```

### 6) Proposed Self-Upgrade Object

```json
{
  "proposal_id": "prop-2026-04-09-0012",
  "type": "prompt_update",
  "target": "analyst_copilot.v14",
  "change": {
    "instruction_delta": "Require at least 2 independent corroborating sources before high-confidence recommendation"
  },
  "justification": {
    "observed_failure_mode": "false positive escalation",
    "offline_eval_delta": {"precision": "+3.1%", "recall": "-0.4%"}
  },
  "risk": "low",
  "required_approvals": ["mission_ai_lead", "security_officer"]
}
```

---

## Scenario Walkthrough (Cinematic + Operationally Credible)

1. **Live Event Arrival**
   - A maritime sensor emits anomalous transponder behavior near a protected corridor.
   - Intake service validates classification and writes to `intel.raw`.

2. **Automated Triage & Enrichment**
   - Triage agent assigns severity medium-high based on route deviation.
   - Enrichment agent resolves vessel, owner shell entities, and historical flags.

3. **Correlation & Recommendation**
   - Correlation agent links event to two prior incidents and one sanctioned intermediary.
   - Recommendation agent drafts COA:
     - open priority case,
     - request coalition cross-check,
     - initiate surveillance escalation.

4. **Human Approval Gate**
   - Commander copilot presents confidence, evidence graph, and policy checks.
   - Operator approves opening case and coalition query, rejects escalation pending new evidence.

5. **Execution & Outcome**
   - Case created in Gotham-linked operations workflow.
   - Follow-on data disproves escalation necessity; false-positive risk reduced.

6. **Self-Improvement Update**
   - Feedback event records rejection rationale: “insufficient corroboration.”
   - Eval service tags this as a failure mode and generates a prompt/workflow candidate.
   - Candidate passes offline safety + quality gates, reviewed by AI governance board.
   - Apollo canary deploys to 10% users; online precision rises without latency regression.
   - Promotion to production with full audit trail and rollback token.

---

## Implementation Phasing

1. **Phase 1 (0-90 days)**
   - Baseline ontology, ingestion, case workflows, analyst copilot MVP, strict approval gates.
2. **Phase 2 (90-180 days)**
   - Multi-agent correlation, model router, eval harness, canary rollout controls.
3. **Phase 3 (180-365 days)**
   - Advanced self-improvement loop, drift detection, mission impact optimization, coalition scaling.

## Success Metrics

- Precision/recall by mission type.
- p95 end-to-end triage latency.
- Analyst acceptance + trust score.
- Reduction in false escalations.
- Time-to-decision and mission outcome uplift.

