import { z } from "zod";

export const classificationSchema = z.enum(["PUBLIC", "AUTHENTICATED", "WORKSPACE", "ADMIN", "INTERNAL", "SECRET"]);
export const freshnessSchema = z.object({
  state: z.enum(["live", "recent", "cached", "stale", "estimated", "unavailable"]),
  measuredAt: z.string().datetime().optional(), receivedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(), source: z.string().max(80).optional(),
});
export type DataFreshness = z.infer<typeof freshnessSchema>;

export const liveEventSchema = z.object({
  id: z.string().regex(/^evt_[A-Za-z0-9_-]{6,128}$/), type: z.string().regex(/^[a-z]+\.[a-z.]+$/), version: z.literal(1),
  occurredAt: z.string().datetime(), publishedAt: z.string().datetime(), source: z.string().min(1).max(80),
  environment: z.enum(["development", "staging", "production"]), visibility: z.enum(["public", "authenticated", "internal"]),
  tenantId: z.string().uuid().optional(), correlationId: z.string().min(8).max(128), sequence: z.number().int().nonnegative(),
  payload: z.record(z.unknown()),
}).superRefine((event, ctx) => {
  const occurred = Date.parse(event.occurredAt), published = Date.parse(event.publishedAt);
  if (occurred > published || published > Date.now() + 60_000) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "invalid event chronology" });
});
export type LiveEvent<T extends Record<string, unknown> = Record<string, unknown>> = Omit<z.infer<typeof liveEventSchema>, "payload"> & { payload: T };

export type ConnectionState = "CONNECTING" | "LIVE" | "DEGRADED" | "STALE" | "OFFLINE" | "ERROR" | "DISABLED";
export type StreamName = "public" | "status" | "performance" | "content" | "dashboard";

export const snapshotSchema = z.object({ stream: z.enum(["public", "status", "performance", "content", "dashboard"]),
  enabled: z.boolean(), events: z.array(liveEventSchema), freshness: freshnessSchema, message: z.string().max(240).optional() });
export type LiveSnapshot = z.infer<typeof snapshotSchema>;
