import type { LiveSnapshot, StreamName } from "./contracts";
import { streamEnabled } from "./config";

export async function getSnapshot(stream: StreamName): Promise<LiveSnapshot> {
  if (!streamEnabled(stream)) return { stream, enabled: false, events: [], freshness: { state: "unavailable" }, message: "No verified source is configured." };
  // Provider adapters are deliberately not activated until credentials, scope, retention and owner approval exist.
  return { stream, enabled: true, events: [], freshness: { state: "unavailable" }, message: "Source enabled; awaiting a verified measurement." };
}
