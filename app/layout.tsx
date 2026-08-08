import type { Metadata } from "next";
import Link from "next/link";
import { LivePageShell } from "@/components/live";
import { getSnapshot } from "@/lib/live/snapshot";
import "./globals.css";

export const metadata: Metadata = { title: { default: "ClearGlassInc Artemis", template: "%s | ClearGlassInc Artemis" }, description: "Secure, governed intelligence engineering and the ClearGlass Live Signal Fabric." };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const snapshot = await getSnapshot("public");
  return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><header className="topbar"><Link className="brand" href="/">ClearGlassInc <span>Artemis</span></Link><nav aria-label="Primary"><Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/status">Status</Link><Link href="/dashboard">Dashboard</Link><Link href="/contact">Contact</Link></nav></header><LivePageShell initialSnapshot={snapshot}><main id="main">{children}</main></LivePageShell><footer>ClearGlassInc Artemis · <Link href="/privacy">Privacy & live-data controls</Link> · Production streams remain approval-gated.</footer></body></html>;
}
