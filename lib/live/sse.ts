import type { NextRequest } from "next/server";
import { authorize, validateOrigin } from "./auth";
import { LIMITS, streamEnabled } from "./config";
import type { StreamName } from "./contracts";

const connections = new Map<string, number>();
const encoder = new TextEncoder();
export async function openStream(request: NextRequest, stream: StreamName): Promise<Response> {
  try { validateOrigin(request); } catch { return Response.json({ error: "origin_not_allowed" }, { status: 403 }); }
  let principal;
  try { principal = authorize(request, stream); } catch { return Response.json({ error: "authentication_required" }, { status: 401 }); }
  if (!streamEnabled(stream)) return Response.json({ error: "stream_disabled", fallback: `/api/live/snapshot?stream=${stream}` }, { status: 503, headers: { "Retry-After": "60" } });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = principal ? `user:${principal.userId}` : `ip:${ip}`;
  const limit = principal ? LIMITS.authenticatedConnectionsPerUser : LIMITS.publicConnectionsPerIp;
  if ((connections.get(key) ?? 0) >= limit) return Response.json({ error: "connection_limit" }, { status: 429 });
  connections.set(key, (connections.get(key) ?? 0) + 1);
  let released = false;
  const release = () => { if (!released) { released = true; connections.set(key, Math.max(0, (connections.get(key) ?? 1) - 1)); } };
  const lastId = request.headers.get("last-event-id") ?? request.nextUrl.searchParams.get("lastEventId") ?? "none";
  console.info(JSON.stringify({ event: "live.connection.open", stream, authenticated: Boolean(principal), resumeRequested: lastId !== "none" }));
  let heartbeat: ReturnType<typeof setInterval>; let closeTimer: ReturnType<typeof setTimeout>;
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`: connected stream=${stream}\nretry: 5000\n\n`));
      heartbeat = setInterval(() => controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`)), LIMITS.heartbeatMs);
      closeTimer = setTimeout(() => { clearInterval(heartbeat); release(); controller.close(); }, LIMITS.connectionTtlMs);
    },
    cancel() { clearInterval(heartbeat); clearTimeout(closeTimer); release(); }
  });
  return new Response(body, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no", "Content-Encoding": "none" } });
}
