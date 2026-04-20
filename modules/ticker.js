// Ticker bar — live data summary derived from store state.

import { store } from './store.js';

function buildItems(state) {
  const { deals, contracts, tasks, envData } = state;
  const open   = deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage));
  const totalV = deals.reduce((s, d) => s + d.value, 0);
  return [
    `PIPELINE  $${(totalV / 1e6).toFixed(2)}M TOTAL`,
    `ACTIVE DEALS  ${open.length}`,
    `THREAT LEVEL  ${envData.threatLevel}`,
    `INTEGRITY  ${envData.systemIntegrity}%`,
    `QUANTUM COHERENCE  ${envData.quantumCoherence}%`,
    `ACTIVE NODES  ${envData.activeNodes.toLocaleString()}`,
    `LATENCY  ${envData.networkLatency}ms`,
    `INGESTION  ${envData.dataIngestionRate} GB/s`,
    `CONTRACTS  ${contracts.length}`,
    `TASKS OPEN  ${tasks.filter(t => t.status !== 'Done').length}`,
  ];
}

export function mountTicker(el) {
  function render(state) {
    el.textContent = buildItems(state).join('   ·   ');
  }

  render(store.getState());
  store.subscribe(render);
}
