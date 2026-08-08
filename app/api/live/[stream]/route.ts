import { NextRequest } from "next/server";
import { openStream } from "@/lib/live/sse";
import type { StreamName } from "@/lib/live/contracts";
const streams = new Set<StreamName>(["public", "status", "performance", "content", "dashboard"]);
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, { params }: { params: Promise<{ stream: string }> }) {
  const { stream } = await params;
  if (!streams.has(stream as StreamName)) return Response.json({ error: "unknown_stream" }, { status: 404 });
  return openStream(request, stream as StreamName);
}
