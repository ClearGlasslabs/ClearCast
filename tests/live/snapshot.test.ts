import { describe, expect, it, vi } from "vitest"; import { getSnapshot } from "../../lib/live/snapshot";
describe("snapshot fallback",()=>{it("is explicit and unavailable when disabled",async()=>{vi.stubEnv("LIVE_STATUS_ENABLED","false"); const s=await getSnapshot("status"); expect(s.enabled).toBe(false); expect(s.freshness.state).toBe("unavailable"); expect(s.events).toEqual([]);});});
