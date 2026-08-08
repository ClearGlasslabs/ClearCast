import type { DataFreshness, LiveEvent, StreamName } from "./contracts";
export type SourceHealth = { healthy: boolean; checkedAt: string; detail?: string };
export type SnapshotInput = { stream: StreamName; tenantId?: string };
export type SubscriptionInput = SnapshotInput & { afterId?: string; signal?: AbortSignal };
export interface LiveDataSource<T extends Record<string, unknown>> {
  readonly name: string; readonly classification: "PUBLIC" | "AUTHENTICATED" | "WORKSPACE" | "ADMIN" | "INTERNAL" | "SECRET";
  healthCheck(): Promise<SourceHealth>; fetchSnapshot(input: SnapshotInput): Promise<{ events: LiveEvent<T>[]; freshness: DataFreshness }>;
  subscribe(input: SubscriptionInput): AsyncIterable<LiveEvent<T>>;
}

/** Development-only adapter. It emits no invented metrics; its sole event says that the source is a labeled simulation. */
export class DevelopmentMockSource implements LiveDataSource<Record<string, unknown>> {
  readonly name = "development-mock"; readonly classification = "PUBLIC" as const;
  healthCheck = async () => ({ healthy: true, checkedAt: new Date().toISOString(), detail: "development simulation only" });
  fetchSnapshot = async () => ({ events: [], freshness: { state: "unavailable" as const, source: this.name } });
  async *subscribe(): AsyncIterable<LiveEvent> { return; }
}
