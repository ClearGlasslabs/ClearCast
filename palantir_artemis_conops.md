# Architecture

ClearGlassInc Artemis is designed as a **closed-loop operational intelligence stack** on Palantir’s four platform layers:

- **Gotham** for mission/intelligence operations and investigation workflows.
- **Foundry** for data integration, streaming + batch pipelines, Ontology, and operational apps.
- **AIP (Artificial Intelligence Platform)** for LLM-backed agents, copilots, Evals, and AI workflow runtime.
- **Apollo** for secure deployment, updates, and runtime control across connected/disconnected environments.

## 1) End-to-end real-time pipeline

### A. Ingest (stream + batch)
- **Streaming telemetry/sensor feeds** (e.g., ISR tracks, RF detections, platform status) enter Foundry Streaming via stream-capable connectors and streaming sync patterns.
- **Batch sources** (e.g., HUMINT reports, historic watchlists, mission logs, imagery metadata) are integrated through Foundry data integration pipelines.
- Pipeline Builder streaming architecture is designed for **low-latency** stream/batch join behavior (with documented refresh and operational limits).

### B. Transform + fuse
- Pipeline Builder (or code transforms) standardizes schema, time normalization, geospatial references, and source reliability tags.
- Streaming joins combine hot streams with batch context (e.g., current track events joined to known vehicles or prior pattern-of-life baselines).
- Fused outputs are indexed into Ontology-backed object types (including streaming indexing/funnel paths for low-latency operational workflows).

### C. Operationalize in Ontology + apps
- Foundry Ontology (Palantir’s semantic + operational layer) models entities, links, and actions.
- Gotham and Foundry apps read from the same operational data backbone via Ontology-integrated workflows.
- Workshop/Object Explorer/Map/Timeline surfaces provide live mission views: entities, relationships, alerts, and event time windows.

### D. AI runtime and action loop
- AIP agents/coplots query Ontology entities, documents, and tools.
- AI proposes analytic outputs or next actions; writeback occurs through governed **Action types** and/or **Approvals** workflows.
- Accepted actions update Ontology state and downstream timelines/alerts in near real time.

### E. Deployment + resilience
- Apollo manages controlled rollout, configuration, upgrade, and rollback of services/assets across secure and even disconnected/air-gapped environments.

## 2) Concrete runtime topology (reference implementation)

```text
[External Sources]
  SIGINT streams | GEOINT detections | HUMINT forms | OSINT feeds | Sensor buses
        |
        v
[Foundry Data Integration + Streaming]
  - stream ingestion
  - batch sync
  - transforms/joins/enrichment
        |
        v
[Foundry Ontology]
  Object Types + Link Types + Action Types + Functions + Markings
        |
        +--> [Gotham operational workflows / investigation / targeting views]
        +--> [Foundry apps: Workshop, Object Explorer, Map, Timelines, Alerts]
        +--> [AIP Agent Studio / AIP Logic / AIP Threads]
                     |
                     v
                [Approvals + Actions]
                     |
                     v
             [Operator decision + writeback]
                     |
                     v
               [Audit + Lineage + Observability]

[Cross-env deploy/ops plane: Apollo]
```

# Data & Ontology

Palantir Ontology is the mission “source-of-truth contract” joining data, logic, and actions. For ClearGlassInc Artemis, use a mission ontology with explicit temporal, confidence, and access metadata.

## 1) Entity model (illustrative)

### Core object types
- `Person`
- `Organization`
- `MilitaryUnit`
- `Platform` (vehicle, aircraft, vessel, UAS)
- `Sensor`
- `Location` (point, route, AOI)
- `Event` (meeting, crossing, launch, transfer, comms event)
- `CommsSignal`
- `Track`
- `Alert`
- `Mission`
- `CollectionTask`
- `TargetPackage`

### Essential properties
- `primary_id`, `source_system`, `ingest_time`, `event_time`, `last_observed_time`
- `confidence_score`, `confidence_method`, `source_reliability`
- `classification_marking`, `releasability`, `compartment_tags`
- `lineage_ref`, `provenance_ref`

### Link types (examples)
- `Person -> associated_with -> Organization`
- `Platform -> operated_by -> MilitaryUnit`
- `Track -> likely_matches -> Platform`
- `CommsSignal -> geolocated_near -> Location`
- `Event -> involves -> Person/Unit/Platform`
- `Alert -> derived_from -> Event/Track/Signal`
- `TargetPackage -> supported_by -> EvidenceObject`

## 2) Temporal + confidence design

- Maintain both **event time** and **system/ingest time** for replays and timeline correctness.
- Keep confidence as first-class property on entities/events and on relationship hypotheses.
- Preserve alternative hypotheses as parallel linked objects (instead of destructive overwrite), enabling analyst adjudication.

## 3) Shared human/AI contract

- Humans and agents operate on same Ontology objects/links/actions.
- Agent tool calls return object references and evidence links, not free-text-only conclusions.
- Any operational recommendation must attach:
  - evidence objects,
  - confidence/uncertainty,
  - permissions-constrained view,
  - proposed action for human disposition.

## 4) Python ontology access pattern (representative)

```python
# Representative pattern using Foundry/Ontology APIs (illustrative)
from dataclasses import dataclass
from typing import List

@dataclass
class TrackSignalJoin:
    track_id: str
    signal_id: str
    score: float


def fuse_track_signal(track, signal) -> TrackSignalJoin:
    # Domain scoring logic managed in transform/function repos
    spatial = 1.0 if track["aoi"] == signal["aoi"] else 0.2
    temporal = max(0.0, 1.0 - abs(track["ts"] - signal["ts"]) / 600)
    score = 0.6 * spatial + 0.4 * temporal
    return TrackSignalJoin(track_id=track["id"], signal_id=signal["id"], score=score)


def propose_alert(join: TrackSignalJoin) -> dict:
    if join.score < 0.75:
        return {}
    return {
        "objectType": "Alert",
        "properties": {
            "alert_type": "CrossCue_SIGINT_GEOINT",
            "severity": "high",
            "confidence_score": join.score,
        },
        "links": [
            {"type": "derived_from_track", "target": join.track_id},
            {"type": "derived_from_signal", "target": join.signal_id},
        ],
    }
```

# Real-Time Use Cases

## 1) Cross-cueing GEOINT + SIGINT
- Streamed track anomalies from GEOINT pipeline create candidate `Alert` objects.
- Streaming join searches contemporaneous SIGINT `CommsSignal` detections in shared AOI/time window.
- If joint confidence exceeds threshold, Action-ready alert is raised to targeteer queue.
- Operator can pivot from alert -> track -> linked unit/platform -> historical events in Object Explorer and map timeline.

## 2) Pattern-of-life tripwire
- Rolling baseline for `Platform` route cadence and stop durations is computed in streaming transforms.
- Deviation beyond configured envelope creates `Alert` with explainable feature deltas.
- Automation can assign alert to specific watchfloor role, with escalation timers.

## 3) Time-sensitive targeting support
- `TargetPackage` assembled by workflow from entity graph + supporting evidence objects.
- AIP copilot drafts summary, identifies missing collection, and proposes next best collection task.
- Final action paths (e.g., publish package, task collector, mark target state) are gated by submission criteria + approvals.

## 4) Mission command risk board
- Commander-facing module displays live indicators: open high-priority alerts, confidence trend, unresolved decisions, and expiring windows.
- Recommended COAs are shown with evidence links and required decision deadline.

# AI & AIP Behavior

## 1) Role of AIP in ClearGlassInc Artemis

AIP is used as the secure AI orchestration layer across Ontology + tools:
- **AIP Agent Studio**: build mission-specific agents.
- **AIP Logic**: define LLM-backed workflows/functions.
- **AIP Evals**: systematic test/compare of prompts/models/workflows before production promotion.
- **AIP Observability**: trace model calls, prompts, outputs, timings, and failures.

## 2) Permission-respecting copilot behavior

Copilot responses are constrained by platform permissions and markings available to the requesting user context. Agent tools read/write via governed ontology interfaces rather than bypass paths.

## 3) Agent action protocol (human-on-the-loop)

1. Agent retrieves authorized context.
2. Agent produces recommendation + evidence refs + confidence.
3. Agent emits a **proposed action** (not direct mission-critical execution).
4. Human reviewer accepts/rejects in Approvals/Action workflow.
5. Executed action is logged; outcome fed to eval datasets.

## 4) Model orchestration

- Palantir supports multiple LLM providers and BYOM registration; model selection can be varied by workflow/function.
- For sensitive workloads, route models by policy (classification, latency class, mission priority) with explicit allowlists.
- Any routing/prompt update is versioned, evaluated, and approval-gated before promotion.

# Operator Workflows

## 1) Intelligence analyst (tactical/strategic)

- Receive prioritized alert queue.
- Open alert object -> inspect provenance, supporting signals, linked entities.
- Pivot across object graph (person/unit/platform/location/event).
- Use map + timeline for temporal/geospatial reconstruction.
- Use copilot for “summarize what changed in last 2 hours” and “show competing hypotheses”.
- Submit structured disposition action (`valid threat`, `insufficient evidence`, `false positive`, `retask collection`).

## 2) Targeteer / collection manager

- Start from candidate target package.
- Review confidence stack and unresolved data gaps.
- Trigger governed actions: request ISR retask, request SIGINT collection, update target status.
- Track SLA clocks and approval status in workflow module.

## 3) Ops officer / battle captain

- Monitor live mission timeline and operational constraints.
- Evaluate AI-proposed branch/sequel options with readiness and risk indicators.
- Approve operationally significant recommendations under explicit authority gates.

## 4) Commander view

- Executive dashboard with plain-language outputs:
  - “What changed?”
  - “What matters now?”
  - “What are options in next 15/30/60 minutes?”
- Each recommendation includes evidence drill-down and confidence rationale.

# Security & Governance

## 1) Access control and compartmentalization

- Enforce need-to-know through platform authorization (resource permissions + object/data permissions).
- Use markings and policy controls for sensitive compartments and coalition release boundaries.
- Where required, use restricted views / multi-datasource patterns for row/column constrained sharing.

## 2) Controlled writeback and approvals

- Operational writeback is channeled through Ontology **Action types**.
- Submission criteria encode who can execute which action under what conditions.
- Approvals workflows provide request/approve/invoke control for sensitive changes.

## 3) Provenance, lineage, auditability

- Data Lineage captures upstream/downstream flow from source to operational artifact.
- Workflow/AIP observability provides execution traces and model interaction details.
- Audit log pipelines support security monitoring and investigation.
- User edit history and action/automation history provide object-level change accountability.

## 4) Self-improvement with hard guardrails

ClearGlassInc Artemis improves safely by design:
- Collect feedback labels from dispositions and mission outcomes.
- Convert to eval suites in AIP Evals.
- Propose prompt/model/workflow updates as versioned artifacts.
- Require designated human approval before promotion.
- Keep rollback path (Apollo/runtime version controls + previous prompt/model config) always available.

# Example Scenario

## Suspicious convoy at AOI edge: near-real-time flow

1. **Detection ingress**
   - GEOINT feed emits moving-platform detections at AOI boundary.
   - Events enter Foundry Streaming pipeline and are standardized into `Track` objects.

2. **Immediate enrichment**
   - Streaming join correlates tracks with known `Platform` signatures and prior route patterns.
   - Concurrent SIGINT stream contributes `CommsSignal` hits in same corridor/time window.

3. **Fusion + alert object creation**
   - Correlation function computes confidence and creates high-priority `Alert` linked to evidence objects.
   - Alert appears in analyst queue and commander risk board.

4. **AI-assisted triage**
   - AIP analyst copilot summarizes: what is new, why it matters, uncertainty drivers.
   - Agent proposes next steps:
     - retask ISR for confirmation,
     - query historical convoy behavior,
     - notify battle captain if confidence remains above threshold for N minutes.

5. **Human decision gate**
   - Targeteer reviews evidence and approves “retask ISR + escalate watch condition” action bundle.
   - Action execution writes changes to Ontology (`CollectionTask`, `MissionState`, `AlertStatus`).

6. **Commander recommendation**
   - Commander dashboard receives a time-bounded recommendation:
     - **COA-1:** shadow convoy, low escalation.
     - **COA-2:** interdict staging route, medium risk.
     - **COA-3:** defer kinetic decision pending second-source confirmation.
   - Each COA contains confidence and direct evidence links.

7. **Outcome + learning loop**
   - Final mission outcome and operator labels are stored.
   - AIP Evals compares whether the recommendation/prompt/workflow met precision/recall/latency targets.
   - Candidate improvements are proposed but held for human approval before production deployment.

---

Primary sources used (official Palantir docs/public releases, accessed April 2026):
- https://investors.palantir.com/files/2025%20FY%20PLTR%2010-K.pdf
- https://www.palantir.com/docs/foundry/ontology/overview
- https://www.palantir.com/docs/foundry/building-pipelines/streaming-overview/
- https://www.palantir.com/docs/foundry/data-integration/streams/
- https://www.palantir.com/docs/foundry/pipeline-builder/transforms-streaming-joins
- https://www.palantir.com/docs/foundry/object-indexing/funnel-streaming-pipelines/
- https://www.palantir.com/docs/foundry/object-permissioning/managing-object-security/
- https://www.palantir.com/docs/foundry/ontologies/ontology-permissions
- https://www.palantir.com/docs/foundry/action-types/permissions/
- https://www.palantir.com/docs/foundry/approvals/overview/
- https://www.palantir.com/docs/foundry/aip/aip-features
- https://www.palantir.com/docs/foundry/aip-evals/experiments/
- https://www.palantir.com/docs/foundry/aip-observability/trace-view/
- https://www.palantir.com/docs/foundry/aip/supported-llms/
- https://www.palantir.com/docs/foundry/aip/bring-your-own-model/
- https://www.palantir.com/docs/foundry/workshop/overview
- https://www.palantir.com/docs/foundry/object-explorer/overview
- https://www.palantir.com/docs/foundry/object-explorer/search-objects
- https://www.palantir.com/docs/foundry/object-explorer/pivot-linked/
- https://www.palantir.com/docs/foundry/map/events
- https://www.palantir.com/docs/foundry/security/audit-logs-overview
- https://www.palantir.com/docs/foundry/data-lineage/overview/
- https://www.palantir.com/docs/apollo/apollo-getting-started/introduction-welcome
- https://www.palantir.com/assets/xrfr7uokpv1b/3A0y10xksgXENvRMNaAsUu/ed8f7f1ed534c0101f64536a85f7297b/Gotham_AI-Enabled_Operations_White_Paper.pdf
