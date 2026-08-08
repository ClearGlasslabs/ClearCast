"use client";
import { useEffect, useState, type ReactNode } from "react";
import type { LiveSnapshot, StreamName } from "@/lib/live/contracts";
import { useLiveStream } from "./useLiveStream";
import { LiveConnectionIndicator, LiveDataConsentControl, LiveErrorBoundary, LiveReconnectButton, LiveStatusBanner } from "./LiveComponents";

export function LivePageShell({ children, initialSnapshot, stream = "public" }: { children: ReactNode; initialSnapshot: LiveSnapshot; stream?: StreamName }) {
  const [consent, setConsent] = useState(false), [reduced, setReduced] = useState(false);
  useEffect(() => { setConsent(localStorage.getItem("clearglass-live-consent") === "true"); const query = matchMedia("(prefers-reduced-motion: reduce)"); setReduced(query.matches); const change = () => setReduced(query.matches); query.addEventListener("change", change); return () => query.removeEventListener("change", change); }, []);
  const updateConsent = (value: boolean) => { localStorage.setItem("clearglass-live-consent", String(value)); setConsent(value); };
  const live = useLiveStream(initialSnapshot, stream, consent && !reduced);
  return <LiveErrorBoundary><div className="live-shell" data-reduced-motion={reduced}><div className="live-toolbar"><LiveConnectionIndicator state={live.state} /><LiveReconnectButton onReconnect={live.refresh} disabled={!initialSnapshot.enabled} /><details><summary>Live data controls</summary><LiveDataConsentControl enabled={consent} onChange={updateConsent} /><p>Reduced motion: {reduced ? "on; nonessential streams paused" : "off"}</p>{process.env.NODE_ENV === "development" && <pre>stream={stream} attempts={live.attempt} events={live.snapshot.events.length}</pre>}</details></div>{live.state !== "LIVE" && <LiveStatusBanner state={live.state} message={initialSnapshot.message} />}<noscript><div className="status-banner">JavaScript is off. Verified server snapshots and all primary page content remain available.</div></noscript>{children}</div></LiveErrorBoundary>;
}
