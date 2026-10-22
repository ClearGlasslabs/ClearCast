# Agentic Workflow Prototype

Run the dependency-free local prototype from the repository root:

```sh
python -m artemis_core.agentic_workflow "Review this suspicious phishing message"
```

It accepts a request, deterministically plans a classification, selects an
allowlisted action, executes a local-only classification, returns JSON, and
includes a verifiable hash-chained audit trail. The prototype is intentionally
not connected to a model, network, or production system; it demonstrates the
workflow contract rather than making operational decisions.

## Security controls

1. **Prompt injection boundaries:** Request text is untrusted data, not
   instructions. The deterministic planner cannot change its rules or choose
   tools from request content. No model or external tool is invoked.
2. **Data leakage controls:** Requests and outputs are not included in audit
   events; only a request/output digest and workflow metadata are recorded.
   The workflow is local-only and returns a generic classification rather than
   echoing request contents.
3. **Unauthorized automation safeguards:** Execution is restricted to one
   non-mutating allowlisted action. Unknown actions fail closed, and no
   external side effects are available. Production integrations must add
   authenticated identity, policy checks, explicit human approval for
   operational actions, and immutable persistent audit storage.

## Execution note

This prototype turns an agentic workflow from an architecture idea into an
executable, auditable path. A local request is classified and prepared for
human review without exposing it to external services or allowing the
workflow to take action. It provides a small, inspectable foundation for
testing guarded automation before integrating production models or tools.
