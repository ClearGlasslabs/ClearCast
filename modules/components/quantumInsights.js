// Quantum Insights tab — SVG dial, predictive alerts, environment matrix.

import { store } from '../store.js';

export function mountQuantumInsights(el) {
  function render(state) {
    const { envData, deals, tasks } = state;

    const criticalTasks = tasks.filter(t => t.priority === 'Critical' && t.status !== 'Done');
    const closingDeals  = deals.filter(d => {
      const days = (new Date(d.dueDate) - Date.now()) / 86400000;
      return days >= 0 && days <= 14 && d.stage !== 'Closed Won';
    });

    // SVG arc for coherence dial (circumference of r=40: ~251.3)
    const circumference = 251.3;
    const arcLength     = (envData.quantumCoherence / 100) * circumference;

    el.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">QUANTUM INSIGHTS</h2>
        <span class="section-subtitle">Predictive intelligence matrix</span>
      </div>
      <div class="quantum-grid">

        <div class="quantum-card">
          <div class="quantum-label">QUANTUM COHERENCE</div>
          <div class="dial-wrap">
            <svg viewBox="0 0 100 100" class="dial-svg" aria-label="${envData.quantumCoherence}% coherence">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(86,241,255,0.12)" stroke-width="8"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#56f1ff" stroke-width="8"
                stroke-dasharray="${arcLength.toFixed(1)} ${circumference}"
                stroke-dashoffset="62.8" stroke-linecap="round"
                style="transition: stroke-dasharray 0.6s ease"/>
            </svg>
            <div class="dial-value">${envData.quantumCoherence}%</div>
          </div>
        </div>

        <div class="quantum-card">
          <div class="quantum-label">PREDICTIVE ALERTS</div>
          <ul class="insights-list">
            ${closingDeals.length
              ? closingDeals.map(d => `<li class="insight-warn">⚠ Closing &lt;14d: ${d.name} ($${(d.value / 1e6).toFixed(2)}M)</li>`).join('')
              : '<li class="insight-ok">✓ No urgent deal closures</li>'}
            ${criticalTasks.map(t => `<li class="insight-critical">🔴 CRITICAL: ${t.title}</li>`).join('')}
            <li class="insight-info">ℹ Coherence ${envData.quantumCoherence >= 80 ? 'nominal' : 'below threshold'} at ${envData.quantumCoherence}%</li>
            <li class="insight-info">ℹ ${envData.activeNodes.toLocaleString()} nodes · ${envData.regions.length} regions online</li>
          </ul>
        </div>

        <div class="quantum-card">
          <div class="quantum-label">ENVIRONMENT MATRIX</div>
          <div class="env-matrix">
            ${[
              ['LATENCY',   `${envData.networkLatency}ms`],
              ['INGESTION', `${envData.dataIngestionRate} GB/s`],
              ['NODES',     envData.activeNodes.toLocaleString()],
              ['REGIONS',   envData.regions.length],
              ['ANOMALY',   `${envData.anomalyScore}/100`],
              ['INTEGRITY', `${envData.systemIntegrity}%`],
            ].map(([label, val]) => `
              <div class="env-row"><span class="env-label">${label}</span><span class="env-val">${val}</span></div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  render(store.getState());
  store.subscribe(render);
}
