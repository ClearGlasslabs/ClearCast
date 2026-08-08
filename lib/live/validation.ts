import { liveEventSchema, type LiveEvent } from "./contracts";
import { knownSources, LIMITS } from "./config";

const seen = new Map<string, { sequence: number; observedAt: number }>();
export function validateEvent(input: unknown): LiveEvent {
  const bytes = new TextEncoder().encode(JSON.stringify(input)).byteLength;
  if (bytes > LIMITS.payloadBytes) throw new Error("event payload exceeds limit");
  const event = liveEventSchema.parse(input) as LiveEvent;
  if (!knownSources().has(event.source)) throw new Error("unknown event source");
  const prior = seen.get(event.id);
  if (prior !== undefined && event.sequence <= prior.sequence) throw new Error("duplicate or replayed event");
  seen.set(event.id, { sequence: event.sequence, observedAt: Date.now() });
  const cutoff = Date.now() - LIMITS.retentionHours * 3_600_000;
  for (const [id, record] of seen) if (record.observedAt < cutoff) seen.delete(id);
  return event;
}
export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [/secret|token|password|email|prompt|customer/i.test(k) ? [k, "[REDACTED]"] : [k, redact(v)]][0]));
}
