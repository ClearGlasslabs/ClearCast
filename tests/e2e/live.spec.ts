import { expect, test } from "@playwright/test";
test("server snapshot and disabled fallback remain accessible",async({page})=>{await page.goto("/");await expect(page.getByRole("heading",{name:/Verified signals/})).toBeVisible();await expect(page.getByText("No verified source configured.").first()).toBeVisible();await expect(page.getByRole("status").first()).toContainText(/off|DISABLED/i);});
test("reduced motion and mobile layout preserve controls",async({page})=>{await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/");await expect(page.getByText(/Reduced motion: on/)).toBeAttached();await expect(page.getByRole("navigation",{name:"Primary"})).toBeVisible();});
test("dashboard SSE is denied without identity",async({request})=>expect((await request.get("/api/live/dashboard")).status()).toBe(401));
test("snapshot validates stream names",async({request})=>expect((await request.get("/api/live/snapshot?stream=secret")).status()).toBe(400));
