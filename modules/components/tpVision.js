import { store } from '../store.js';

function metric(label, value, trend = '+0.0%') {
  return `<article class="kpi-card"><p class="kpi-label">${label}</p><h3>${value}</h3><span class="kpi-trend">${trend}</span></article>`;
}

export function mountTpVision(el) {
  if (!el) return;
  function render(state) {
    const now = new Date().toLocaleTimeString('en-CA', { hour12: false });
    const s = state.envData || {};
    el.innerHTML = `
      <section class="panel tp-vision-grid">
        <div class="tp-hero glass">
          <div class="chip">TP-VISION • LIVE</div>
          <h2>Artemis Vision Command Surface</h2>
          <p>Live camera operations, event triage, VLM prompt console, and operator-controlled response packaging.</p>
          <div class="cta-row">
            <button class="btn primary" data-action="open-frigate">Open Frigate</button>
            <button class="btn" data-action="open-events">Review Events</button>
          </div>
        </div>
        <div class="tp-camera-grid glass">
          <h3>Camera Grid</h3>
          <div class="camera-cells">
            ${[1,2,3,4].map(i => `<div class="camera-cell"><span>CAM-${i.toString().padStart(2,'0')}</span></div>`).join('')}
          </div>
        </div>
        <div class="tp-feed glass">
          <h3>Event Feed</h3>
          <ul>
            <li>${now} • Person detected • Sector A2</li>
            <li>${now} • Vehicle detected • Loading Bay</li>
            <li>${now} • Face match confidence 0.83 • Watchlist Beta</li>
          </ul>
        </div>
        <div class="tp-vlm glass">
          <h3>VLM Prompt Console</h3>
          <textarea rows="5" readonly>Analyze this frame for suspicious behavior, PPE non-compliance, tailgating, and visible anomalies. Return JSON with severity, rationale, and recommended operator action.</textarea>
          <div class="chip-row"><span class="chip">model:qwen3-vl</span><span class="chip">route:local-ollama</span><span class="chip">policy:human-gated</span></div>
        </div>
        <div class="tp-metrics">${metric('Pipeline Latency', `${s.networkLatency ?? 12}ms`, '-2.1%')}${metric('Detection Precision', '0.94', '+0.6%')}${metric('MQTT Throughput', '2.8k msg/h', '+3.2%')}</div>
      </section>`;
  }

  render(store.getState());
  store.subscribe(render);
}
