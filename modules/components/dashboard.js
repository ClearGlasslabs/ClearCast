// Dashboard tab — assembles KPI grid, activity log, and neural canvas.

import { store } from '../store.js';
import { mountKpiGrid } from './kpiGrid.js';
import { NeuralCanvas } from '../neuralCanvas.js';

export function mountDashboard(el) {
  el.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">COMMAND DASHBOARD</h2>
      <span class="section-subtitle">Real-time intelligence overview</span>
    </div>
    <div id="kpi-grid" class="kpi-grid"></div>
    <div class="dashboard-lower">
      <div class="panel activity-panel">
        <div class="panel-header">◈ ACTIVITY LOG</div>
        <div id="activity-log" class="activity-log"></div>
      </div>
      <div class="panel neural-panel">
        <div class="panel-header">⬡ NEURAL TOPOLOGY</div>
        <div class="neural-canvas-wrap">
          <canvas id="neural-canvas"></canvas>
        </div>
      </div>
    </div>
  `;

  mountKpiGrid(document.getElementById('kpi-grid'));
  _mountActivityLog(document.getElementById('activity-log'));

  // Initialize neural canvas once DOM is in place
  requestAnimationFrame(() => {
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
      const neural = new NeuralCanvas(canvas);
      neural.start();
    }
  });
}

function _mountActivityLog(el) {
  function render(state) {
    const sorted = [...state.activityLog].sort((a, b) => b.ts - a.ts).slice(0, 25);
    el.innerHTML = sorted.map(entry => {
      const time = new Date(entry.ts).toLocaleTimeString('en-CA', { hour12: false });
      return `
        <div class="activity-entry severity-${entry.severity}">
          <span class="activity-time">${time}</span>
          <span class="activity-type">[${entry.type.toUpperCase()}]</span>
          <span class="activity-msg">${entry.message}</span>
        </div>
      `;
    }).join('');
  }

  render(store.getState());
  store.subscribe(render);
}
