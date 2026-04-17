// KPI grid — config-driven cards, each with a compute function over state.

import { store } from '../store.js';

// To add a new KPI card: push an entry here. No other code changes needed.
const KPI_DEFS = [
  {
    id: 'pipeline-face',
    label: 'Pipeline Face Value',
    icon: '◉',
    compute: ({ deals }) => {
      const v = deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).reduce((s, d) => s + d.value, 0);
      return { value: `$${(v / 1e6).toFixed(2)}M`, trend: '+8.3%', up: true };
    },
  },
  {
    id: 'pipeline-weighted',
    label: 'Weighted Revenue',
    icon: '◈',
    compute: ({ deals }) => {
      const w = deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).reduce((s, d) => s + d.value * d.probability / 100, 0);
      return { value: `$${(w / 1e6).toFixed(2)}M`, trend: '+5.1%', up: true };
    },
  },
  {
    id: 'deals-open',
    label: 'Active Deals',
    icon: '⬡',
    compute: ({ deals }) => {
      const n = deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).length;
      return { value: n, trend: `${n} open`, up: true };
    },
  },
  {
    id: 'threat-score',
    label: 'Anomaly Score',
    icon: '⚠',
    compute: ({ envData }) => ({ value: `${envData.anomalyScore}/100`, trend: envData.threatLevel, up: false }),
  },
  {
    id: 'integrity',
    label: 'System Integrity',
    icon: '◎',
    compute: ({ envData }) => ({ value: `${envData.systemIntegrity}%`, trend: 'Stable', up: true }),
  },
  {
    id: 'active-nodes',
    label: 'Active Nodes',
    icon: '◉',
    compute: ({ envData }) => ({ value: envData.activeNodes.toLocaleString(), trend: `${envData.regions.length} regions`, up: true }),
  },
];

export function mountKpiGrid(el) {
  function render(state) {
    el.innerHTML = KPI_DEFS.map(def => {
      const { value, trend, up } = def.compute(state);
      return `
        <div class="kpi-card" data-kpi="${def.id}">
          <div class="kpi-icon">${def.icon}</div>
          <div class="kpi-body">
            <div class="kpi-value">${value}</div>
            <div class="kpi-label">${def.label}</div>
            <div class="kpi-trend ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${trend}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  render(store.getState());
  store.subscribe(render);
}
