"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { liveEventSchema, snapshotSchema, type ConnectionState, type LiveEvent, type LiveSnapshot, type StreamName } from "@/lib/live/contracts";

export function useLiveStream(initial: LiveSnapshot, stream: StreamName, consent: boolean) {
  const [snapshot, setSnapshot] = useState(initial), [state, setState] = useState<ConnectionState>(!consent || !initial.enabled ? "DISABLED" : "CONNECTING");
  const [attempt, setAttempt] = useState(0); const lastId = useRef<string>(); const source = useRef<EventSource>();
  const refresh = useCallback(async () => { try { const r = await fetch(`/api/live/snapshot?stream=${stream}`, { cache: "no-store" }); if (!r.ok) throw Error(); setSnapshot(snapshotSchema.parse(await r.json())); } catch { setState(navigator.onLine ? "DEGRADED" : "OFFLINE"); } }, [stream]);
  useEffect(() => {
    if (!consent || !initial.enabled || document.visibilityState === "hidden") return;
    let cancelled = false, timer: ReturnType<typeof setTimeout>;
    const connect = () => {
      setState("CONNECTING"); const url = `/api/live/${stream}${lastId.current ? `?lastEventId=${encodeURIComponent(lastId.current)}` : ""}`; const es = new EventSource(url); source.current = es;
      es.onopen = () => { setState("LIVE"); setAttempt(0); };
      es.onmessage = e => { try { const event = liveEventSchema.parse(JSON.parse(e.data)) as LiveEvent; if (event.id === lastId.current) return; lastId.current = event.id; setSnapshot(s => ({ ...s, events: [...s.events.slice(-49), event], freshness: { state: "live", receivedAt: new Date().toISOString(), source: event.source } })); } catch { setState("ERROR"); } };
      es.onerror = () => { es.close(); if (cancelled) return; setAttempt(a => { const next = a + 1; if (next > 6) { setState("DEGRADED"); void refresh(); return next; } const delay = Math.min(30_000, 1000 * 2 ** a) * (0.8 + Math.random() * 0.4); timer = setTimeout(connect, delay); return next; }); };
    };
    const visibility = () => { if (document.hidden) { source.current?.close(); setState("DEGRADED"); } else connect(); };
    const offline = () => { source.current?.close(); setState("OFFLINE"); }; const online = () => connect();
    connect(); document.addEventListener("visibilitychange", visibility); window.addEventListener("offline", offline); window.addEventListener("online", online);
    return () => { cancelled = true; clearTimeout(timer); source.current?.close(); document.removeEventListener("visibilitychange", visibility); window.removeEventListener("offline", offline); window.removeEventListener("online", online); };
  }, [consent, initial.enabled, refresh, stream]);
  return { snapshot, state, attempt, refresh };
}
