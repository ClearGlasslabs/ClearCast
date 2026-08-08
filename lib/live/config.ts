import type { StreamName } from "./contracts";

export const LIMITS = { publicConnectionsPerIp: 3, authenticatedConnectionsPerUser: 5, streamsPerPage: 3,
  eventsPerSecond: 4, payloadBytes: 16_384, reconnectAttempts: 6, reconnectMaxMs: 30_000, domUpdatesPerSecond: 4,
  gpuFps: 30, clientBundleKb: 80, heartbeatMs: 15_000, connectionTtlMs: 55_000, retentionHours: 24 } as const;

export function streamEnabled(stream: StreamName): boolean {
  const flag = process.env[`LIVE_${stream.toUpperCase()}_ENABLED`] === "true";
  return flag && (process.env.NODE_ENV !== "production" || process.env.LIVE_OWNER_APPROVED === "true");
}
export function knownSources(): Set<string> { return new Set((process.env.LIVE_KNOWN_SOURCES ?? "internal-health").split(",").map(v => v.trim()).filter(Boolean)); }
