import type { NextRequest } from "next/server";
import type { StreamName } from "./contracts";

export type Principal = { userId: string; tenantId: string; roles: string[] };
export function authorize(request: NextRequest, stream: StreamName): Principal | null {
  if (stream !== "dashboard") return null;
  // Production integration point: replace trusted gateway headers with the organization's verified session provider.
  const userId = request.headers.get("x-clearglass-user-id");
  const tenantId = request.headers.get("x-clearglass-workspace-id");
  const role = request.headers.get("x-clearglass-role");
  if (!userId || !tenantId || !role || !["member", "workspace-admin", "platform-admin"].includes(role)) throw new Error("unauthorized");
  return { userId, tenantId, roles: [role] };
}

export function validateOrigin(request: NextRequest): void {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const allowed = new Set((process.env.LIVE_ALLOWED_ORIGINS ?? "http://localhost:3000").split(","));
  if (!allowed.has(origin)) throw new Error("origin rejected");
}
