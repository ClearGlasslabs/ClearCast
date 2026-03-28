// Surveillance tab — mounts the SurveillanceCanvas and a sidebar node list.

import { SurveillanceCanvas } from '../surveillanceCanvas.js';
import { store } from '../store.js';

const TRACKING_POINTS = [
  { id: 'p1', x: 0.14, y: 0.30, label: 'NA-EAST-01', alert: false },
  { id: 'p2', x: 0.24, y: 0.58, label: 'NA-EAST-02', alert: false },
  { id: 'p3', x: 0.54, y: 0.32, label: 'EU-WEST-01', alert: false },
  { id: 'p4', x: 0.64, y: 0.56, label: 'EU-WEST-02', alert: false },
  { id: 'p5', x: 0.82, y: 0.38, label: 'APAC-SOUTH-01', alert: true },
  { id: 'p6', x: 0.88, y: 0.62, label: 'APAC-SOUTH-02', alert: false },
];

export function mountSurveillance(el) {
  const state = store.getState();

  el.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">SURVEILLANCE GRID</h2>
      <span class="section-subtitle">Global sensor array — ${TRACKING_POINTS.length} nodes · ${state.envData.regions.length} regions</span>
    </div>
    <div class="surveillance-layout">
      <div class="surv-canvas-wrap">
        <canvas id="surveillance-canvas"></canvas>
      </div>
      <div class="surv-sidebar">
        <div class="surv-sidebar-title">TRACKED NODES</div>
        ${TRACKING_POINTS.map(p => `
          <div class="surv-node-row ${p.alert ? 'alert' : ''}">
            <span class="surv-dot"></span>
            <span class="surv-node-label">${p.label}</span>
            ${p.alert ? '<span class="surv-alert-tag">ALERT</span>' : '<span class="surv-ok-tag">OK</span>'}
          </div>
        `).join('')}
        <div class="surv-sidebar-title" style="margin-top: 1.2rem">ENV SNAPSHOT</div>
        <div class="surv-env-row"><span>Threat</span><span>${state.envData.threatLevel}</span></div>
        <div class="surv-env-row"><span>Anomaly</span><span>${state.envData.anomalyScore}/100</span></div>
        <div class="surv-env-row"><span>Integrity</span><span>${state.envData.systemIntegrity}%</span></div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    const canvas = document.getElementById('surveillance-canvas');
    if (!canvas) return;
    const surv = new SurveillanceCanvas(canvas, { points: TRACKING_POINTS });
    surv.start();

    // Trigger an anomaly zone highlight after 2 s to demo the API
    setTimeout(() => {
      surv.highlightZone({ x: 0.77, y: 0.26, w: 0.18, h: 0.4, label: 'ANOMALY DETECTED', severity: 'critical' });
    }, 2000);
  });
}
