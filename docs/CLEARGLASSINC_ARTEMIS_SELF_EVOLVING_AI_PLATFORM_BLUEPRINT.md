# ClearGlassInc Artemis — Self-Evolving AI Intelligence Platform (Gotham + Foundry + AIP + Apollo)

> **Objective:** Build a coalition-aware, audited, low-latency, self-improving intelligence platform that fuses live + historical data, reasons with AI agents, and proposes safe, human-governed improvements to prompts, workflows, and model routing.

---

## 0) Linked Navigation

- [1) System Architecture](#1-system-architecture)
- [2) Data and Ontology](#2-data-and-ontology)
- [3) AI and Agent Design](#3-ai-and-agent-design)
- [4) Self-Improvement Loop](#4-self-improvement-loop)
- [5) Full-Stack Implementation Blueprint](#5-full-stack-implementation-blueprint)
- [6) Security and Governance](#6-security-and-governance)
- [7) Code Examples (Python-first)](#7-code-examples-python-first)
- [8) Scenario Walkthrough (Live Intel Event)](#8-scenario-walkthrough-live-intel-event)
- [9) Delivery Plan and SLO Targets](#9-delivery-plan-and-slo-targets)

---

## 1) System Architecture

### 1.1 Layered View

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend Layer (React/TS)                                                                   │
│  - Mission COP, Case Workspace, Entity Graph, Alert Triage, Eval Console, Guardrail Review │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ API + Policy Edge                                                                            │
│  - API Gateway, GraphQL/BFF, OPA policy check, token introspection, coalition routing       │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ Backend Services                                                                              │
│  - Case service, entity resolution, intel product service, feedback/eval service             │
│  - Workflow orchestrator, action-approval service, audit/provenance service                  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ Streaming + Data Plane                                                                        │
│  - Kafka/PubSub event bus, CDC ingestion, Foundry pipelines, feature store                   │
│  - Lakehouse, search index, vector index, ontology-backed graph                              │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ AI Orchestration Plane (AIP)                                                                  │
│  - Copilots, multi-agent runs, model router, tool-calling, eval harness                      │
│  - Prompt registry, workflow registry, safe self-upgrade proposal engine                      │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ Runtime + Deployment (Apollo)                                                                 │
│  - Environment promotion, canary, rollback, drift watch, signed bundles, kill switches       │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Palantir Responsibilities (Precise)

- **Gotham:** mission operations UI, investigations, link analysis, case and entity tracking, operational decisions.
- **Foundry:** ontology, data integration, transformations, batch + streaming pipelines, object-centric app logic.
- **AIP:** copilots, agents, tool execution, evaluations, prompt/workflow/model routing governance.
- **Apollo:** secure deployment + updates for services/models/policies, staged rollout, rollback, runtime controls.

### 1.3 Control Planes

1. **Data Control Plane:** schema contracts, lineage, quality thresholds, SLA gates.
2. **AI Control Plane:** prompt/model/workflow versioning + approvals.
3. **Ops Control Plane:** runtime health, deployment governance, incident kill switches.

---

## 2) Data and Ontology

### 2.1 Core Ontology Objects

```yaml
Entity:
  id: UUID
  type: [Person, Organization, Device, Vehicle, Account, Location, Event, Asset]
  canonical_name: string
  aliases: [string]
  confidence: float(0..1)
  provenance_refs: [SourceRef]
  first_seen_ts: timestamp
  last_seen_ts: timestamp
  classification: [UNCLASS, SECRET, TS]
  releasability: [USA, FVEY, NATO, ...]

Relationship:
  id: UUID
  source_entity_id: UUID
  target_entity_id: UUID
  predicate: [owns, contacted, co-located, funded, traveled_with, controls]
  confidence: float
  valid_time: {start_ts, end_ts}
  transaction_time: {ingested_ts, updated_ts}
  mission_context_id: UUID
  lineage_run_id: string

Observation:
  id: UUID
  sensor_type: [SIGINT, HUMINT, OSINT, CYBER, FININT]
  raw_ref: URI
  extracted_facts: [Fact]
  extraction_model_version: string
  source_reliability: [A,B,C,D,E,F]
  info_credibility: [1,2,3,4,5,6]
  confidence: float

MissionContext:
  id: UUID
  operation_name: string
  area_of_ops: GeoPolygon
  objective: string
  roeset_id: string
  active_from: timestamp
  active_to: timestamp

DecisionRecord:
  id: UUID
  recommendation_id: UUID
  operator_id: string
  action: [approved, rejected, modified]
  rationale: text
  outcome_linked_metrics: [MetricRef]
  signed_at: timestamp
```

### 2.2 Temporal + Lineage Semantics

- **Bitemporal model:** every fact stores valid time + transaction time.
- **Lineage graph:** each analytic output links to pipeline run, model version, prompt hash, tool calls.
- **Confidence propagation:** relation confidence computed from source reliability × extraction confidence × corroboration score.

### 2.3 Permissions Model Driven by Ontology

- ABAC + ReBAC + mission tags.
- Entity-level and relationship-level checks before retrieval.
- Column masking for PII/PHI and compartmented fields.
- Coalition filters at query time and render time.

---

## 3) AI and Agent Design

### 3.1 Copilot Modes

1. **Analyst Copilot**
   - “What changed in this target network in last 6h?”
   - Produces explainable summaries, confidence bars, evidence citations.
2. **Commander Copilot**
   - “Recommend options with risk matrix + expected mission impact.”
   - Requires policy-satisfied tool paths and explicit approvals.

### 3.2 Multi-Agent Workflow

```text
Ingress Agent  ->  Triage Agent  ->  Enrichment Agent  ->  Correlation Agent
      │                  │                  │                    │
      └──────────►  Risk Scoring Agent  ◄──┴──────────────┬─────┘
                                                           ▼
                                                Recommendation Agent
                                                           ▼
                                                Human Approval Gateway
                                                           ▼
                                                  Action Execution Agent
```

### 3.3 Tool-Using Agent Capabilities

- Query ontology graph with permission-aware filters.
- Open/update Gotham cases.
- Generate intel products (SITREP, executive summary, action package).
- Trigger workflows in Foundry/AIP.
- Never execute high-impact action without approval token.

### 3.4 Guardrail Taxonomy

- **G0 (Read-only):** data lookups, summaries.
- **G1 (Advisory):** recommendations + draft products.
- **G2 (Operational):** opening/assigning cases.
- **G3 (Mission-significant):** resource movement / takedown request / coalition dissemination.

G2/G3 require quorum or designated approver chain.

---

## 4) Self-Improvement Loop

### 4.1 Signals Collected

- Prompt-level logs (input class, route, model, token, latency).
- Operator edits (delta between draft and final product).
- Recommendation disposition (approve/reject/modify).
- Downstream mission outcomes (precision, recall, false alarms, time-to-action).
- Drift signals (data distribution and embedding shift).

### 4.2 Optimization Objects

1. Prompt templates + system constraints.
2. Workflow DAG step ordering and retry policies.
3. Model router rules (cost/latency/quality envelope).
4. Heuristics (risk thresholds, escalation gates).

### 4.3 Safe Improvement Pipeline

```text
Collect -> Label -> Build Eval Set -> Candidate Change Generation
      -> Offline Replay + Scoring -> Human Review Board
      -> Canary Deploy (Apollo) -> Online A/B -> Promote or Rollback
```

### 4.4 Versioning and Rollback

- `prompt_registry`: semantic version + hash + owner + approved_by.
- `workflow_registry`: DAG version + policy signatures.
- `router_registry`: route tables with constraints.
- Apollo deploy channels: `dev -> staging -> canary -> prod`.
- Automatic rollback if precision/latency/trust drops below SLO budget.

### 4.5 Drift and Regression Control

- Data drift: PSI/KS tests on key features.
- Concept drift: drop in agreement between human adjudication and model recommendation.
- Alerting: trigger “freeze self-upgrade lane” when drift > threshold.

---

## 5) Full-Stack Implementation Blueprint

### 5.1 Web UI

- **React + TypeScript + GraphQL**
- Screens:
  - Mission COP map
  - Live triage queue
  - Entity timeline/graph explorer
  - Recommendation review (approve/reject with rationale)
  - Prompt/workflow change review console
  - Eval dashboards + drift panels

### 5.2 API Gateway and BFF

- Envoy/API Gateway + JWT + mTLS.
- BFF performs policy pre-check + response shaping by role.

### 5.3 Backend Microservices

- `case-service`
- `entity-service`
- `recommendation-service`
- `workflow-orchestrator`
- `eval-service`
- `policy-decision-service`
- `audit-ledger-service`

### 5.4 Event Bus / Streaming

- Kafka topics (example):
  - `intel.raw.events`
  - `intel.enriched.events`
  - `intel.recommendations`
  - `intel.operator.decisions`
  - `intel.outcomes`
  - `ai.self_improvement.proposals`

### 5.5 Data Layer

- Foundry pipelines for ETL + ELT + quality checks.
- Lakehouse tables (Parquet/Iceberg/Delta pattern).
- Search index (keyword/entity fields).
- Vector index for semantically similar incidents.
- Graph store for ontology relationships.

### 5.6 Model Router / Inference

- Router chooses model based on:
  - classification level compatibility
  - latency budget
  - tool-use capability
  - historical task-quality metrics
- Uses constrained decoding + policy interceptors.

### 5.7 Observability

- OpenTelemetry traces end-to-end (UI click → recommendation output).
- Metrics: p50/p95 latency, precision, recall, trust score, override rate.
- Eval board with stratified slices (region, mission type, data source mix).

### 5.8 Deployment (Apollo)

- Signed artifacts and immutable release metadata.
- Automated progressive rollout with policy gates.
- Hot rollback and model route failover.

---

## 6) Security and Governance

### 6.1 Need-to-Know + Coalition Boundaries

- Multi-tenant + compartment tags on each object.
- Access check = subject clearance + mission assignment + releasability.

### 6.2 Zero-Trust Execution

- mTLS everywhere.
- SPIFFE/SPIRE-style workload identity.
- Short-lived tokens and session binding.

### 6.3 Immutable Provenance

- Append-only audit ledger for:
  - data access
  - tool calls
  - model invocations
  - recommendation approvals
  - prompt/workflow changes

### 6.4 Policy-as-Code

- OPA/Rego policies for:
  - read/write authorization
  - tool execution restrictions
  - high-impact action gating
  - model routing constraints

### 6.5 Model and Prompt Governance

- Every prompt/model/workflow change has:
  - owner
  - rationale
  - eval results
  - approval signature
  - rollback pointer

---

## 7) Code Examples (Python-first)

### 7.1 Backend Service Skeleton (FastAPI)

```python
# services/recommendation_service/app.py
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from uuid import uuid4

app = FastAPI(title="ClearGlassInc Artemis Recommendation Service")

class RecommendationRequest(BaseModel):
    mission_context_id: str
    alert_id: str
    operator_id: str

class RecommendationResponse(BaseModel):
    recommendation_id: str
    summary: str
    confidence: float
    required_approval_level: str
    evidence_refs: List[str]


def policy_check(subject: str, action: str, resource: str) -> bool:
    # In production: call policy decision point (OPA / platform policy service)
    return True


@app.post("/recommend", response_model=RecommendationResponse)
def recommend(req: RecommendationRequest):
    if not policy_check(req.operator_id, "generate_recommendation", req.mission_context_id):
        raise HTTPException(status_code=403, detail="Policy denied")

    rec_id = f"rec-{uuid4()}"
    return RecommendationResponse(
        recommendation_id=rec_id,
        summary="Escalate to watchlist tier-2 and open case for corroboration.",
        confidence=0.82,
        required_approval_level="G2",
        evidence_refs=["obs://a1", "ent://network/42", "case://draft/991"]
    )
```

### 7.2 Event Handler for Operator Feedback

```python
# services/eval_service/feedback_consumer.py
import json
from kafka import KafkaConsumer
from datastore import write_feedback_event

consumer = KafkaConsumer(
    "intel.operator.decisions",
    bootstrap_servers=["kafka:9092"],
    value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    group_id="eval-service"
)

for msg in consumer:
    event = msg.value
    # expected payload: recommendation_id, operator_action, rationale, mission_outcome_ref
    write_feedback_event(event)
```

### 7.3 Ontology-Driven Query (SQL + Graph Join)

```sql
-- Retrieve high-risk relationship changes in last 6h for an operation
WITH recent_edges AS (
  SELECT
    r.source_entity_id,
    r.target_entity_id,
    r.predicate,
    r.confidence,
    r.valid_time_start,
    r.valid_time_end,
    r.mission_context_id,
    r.updated_at
  FROM ontology_relationships r
  WHERE r.updated_at >= NOW() - INTERVAL '6 hours'
    AND r.mission_context_id = :mission_context_id
    AND r.confidence >= 0.70
),
scored AS (
  SELECT
    re.*,
    (re.confidence * m.threat_multiplier) AS risk_score
  FROM recent_edges re
  JOIN mission_risk_model m ON m.predicate = re.predicate
)
SELECT *
FROM scored
WHERE risk_score >= 0.80
ORDER BY risk_score DESC;
```

### 7.4 Agent Tool Call Contract

```python
# aip/tools/contracts.py
from pydantic import BaseModel, Field
from typing import Literal, Optional

class OpenCaseInput(BaseModel):
    mission_context_id: str
    title: str
    priority: Literal["P1", "P2", "P3"]
    recommendation_id: str
    approval_token: Optional[str] = Field(default=None)


def open_case_tool(payload: OpenCaseInput) -> dict:
    if payload.priority == "P1" and not payload.approval_token:
        return {"status": "blocked", "reason": "approval_token_required_for_P1"}

    # create case in Gotham/Foundry app backend
    return {
        "status": "created",
        "case_id": "case-2026-004231",
        "linked_recommendation": payload.recommendation_id
    }
```

### 7.5 Workflow State Machine (Self-Improvement)

```python
# services/self_improvement/workflow.py
from enum import Enum
from dataclasses import dataclass

class Stage(str, Enum):
    DRAFT = "draft"
    OFFLINE_EVAL = "offline_eval"
    REVIEW = "review"
    CANARY = "canary"
    PRODUCTION = "production"
    ROLLED_BACK = "rolled_back"

@dataclass
class ChangeProposal:
    proposal_id: str
    target: str  # prompt|workflow|router
    current_version: str
    candidate_version: str
    quality_delta: float
    latency_delta_ms: int
    trust_delta: float
    stage: Stage = Stage.DRAFT


def advance(p: ChangeProposal, approved: bool, canary_ok: bool) -> ChangeProposal:
    if p.stage == Stage.DRAFT:
        p.stage = Stage.OFFLINE_EVAL
    elif p.stage == Stage.OFFLINE_EVAL:
        p.stage = Stage.REVIEW if approved else Stage.ROLLED_BACK
    elif p.stage == Stage.REVIEW:
        p.stage = Stage.CANARY if approved else Stage.ROLLED_BACK
    elif p.stage == Stage.CANARY:
        p.stage = Stage.PRODUCTION if canary_ok else Stage.ROLLED_BACK
    return p
```

### 7.6 Rego Policy Example

```rego
# policy/agent_actions.rego
package artemis.authz

default allow = false

allow {
  input.subject.clearance_level >= input.resource.classification_level
  input.subject.mission_ids[_] == input.resource.mission_context_id
  input.action == "read_entity"
}

allow {
  input.action == "execute_operational_action"
  input.request.guardrail_level == "G2"
  input.request.approval_token_valid == true
}
```

### 7.7 Eval Pipeline (Python)

```python
# services/eval_service/run_eval.py
from dataclasses import dataclass
from typing import List

@dataclass
class EvalCase:
    query: str
    expected_label: str
    mission_context_id: str


def evaluate(cases: List[EvalCase], runner) -> dict:
    tp = fp = fn = 0
    latencies = []

    for c in cases:
        out = runner(c.query, c.mission_context_id)
        latencies.append(out["latency_ms"])
        pred = out["label"]
        if pred == c.expected_label:
            tp += 1
        else:
            fp += 1
            fn += 1

    precision = tp / max(tp + fp, 1)
    recall = tp / max(tp + fn, 1)
    p95_latency = sorted(latencies)[int(0.95 * (len(latencies)-1))] if latencies else 0

    return {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "p95_latency_ms": p95_latency,
    }
```

### 7.8 UI Snippet (TypeScript) for Approval Gate

```ts
// ui/src/components/RecommendationApproval.tsx
export async function submitDecision(params: {
  recommendationId: string;
  decision: "approved" | "rejected" | "modified";
  rationale: string;
}) {
  const res = await fetch(`/api/recommendations/${params.recommendationId}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Decision submission failed");
  return await res.json();
}
```

---

## 8) Scenario Walkthrough (Live Intel Event)

### T+00s — Event Ingestion
A SIGINT event arrives on `intel.raw.events`, is normalized in Foundry, and linked to existing device and person entities in ontology.

### T+04s — Triage + Enrichment
Triage Agent flags anomaly score 0.91 (unusual cross-border communication pattern). Enrichment Agent pulls historical relationships and financial linkages.

### T+09s — Correlation + Recommendation
Correlation Agent finds corroborating OSINT + FININT edges. Recommendation Agent proposes:

- Open P1 case.
- Notify mission commander.
- Add two entities to surge watchlist.

Confidence = 0.86, guardrail classification = G2.

### T+15s — Human Approval
Operator reviews evidence graph and rationale, modifies one action (watchlist only one entity), and approves with signed token.

### T+20s — Action Execution
Action Execution Agent calls `open_case_tool` with approval token; case created and command notification dispatched.

### T+2h — Outcome and Learning
Outcome label: action successful, false-positive risk reduced by operator modification.

Self-improvement lane proposes:
- Prompt tweak for Recommendation Agent to emphasize “minimum necessary watchlist scope”.
- Router update: choose lower-latency model for early triage, higher-reasoning model for final recommendation.

### T+1d — Safe Promotion
Proposal passes offline eval (+3.1% precision, -120ms p95 latency), approved by review board, canaried at 10% traffic via Apollo, then promoted to production after no regressions.

Audit trail links every step: event → entities → recommendation → operator decision → outcome → change proposal → deployment.

---

## 9) Delivery Plan and SLO Targets

### 9.1 Milestones

1. **M1 (0-60 days):** ontology + ingestion + baseline copilot + policy gate.
2. **M2 (60-120 days):** multi-agent orchestration + approval workflows + eval harness.
3. **M3 (120-180 days):** self-improvement pipeline with canary/rollback + drift controls.
4. **M4 (180+ days):** coalition-scale optimization + mission-level adaptive automation.

### 9.2 SLOs

- Recommendation precision: **≥ 0.90** on critical mission slices.
- p95 end-to-end recommendation latency: **≤ 2.5s**.
- Operator override rate (undesired): **< 15%** with downward trend.
- Audit completeness: **100%** of AI and operator decisions.
- Rollback readiness: **< 5 min** to stable release.

### 9.3 Final Principle

ClearGlassInc Artemis gets better through **bounded adaptation**: it can propose improvements continuously, but only humans can authorize operationally meaningful behavioral changes.
