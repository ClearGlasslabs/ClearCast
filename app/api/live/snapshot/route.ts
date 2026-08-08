import { NextRequest } from "next/server";
import { getSnapshot } from "@/lib/live/snapshot";
import type { StreamName } from "@/lib/live/contracts";
const streams = new Set<StreamName>(["public", "status", "performance", "content", "dashboard"]);
export async function GET(request: NextRequest) {
  const stream = request.nextUrl.searchParams.get("stream") as StreamName;
  if (!streams.has(stream)) return Response.json({ error: "unknown_stream" }, { status: 400 });
  if (stream === "dashboard") return Response.json({ error: "authentication_required" }, { status: 401 });
  return Response.json(await getSnapshot(stream), { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" } });
}
