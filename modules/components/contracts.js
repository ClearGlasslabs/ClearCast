// Contracts tab — tabular view of all agreements with risk scoring.

import { store } from '../store.js';

export function mountContracts(el) {
  function render(state) {
    const { contracts } = state;
    el.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">CONTRACT REGISTRY</h2>
        <span class="section-subtitle">${contracts.length} agreements tracked</span>
      </div>
      <div class="data-table">
        <div class="table-header-row">
          <span>CLIENT</span>
          <span>TYPE</span>
          <span>VALUE</span>
          <span>STATUS</span>
          <span>EXPIRES</span>
          <span>RISK</span>
        </div>
        ${contracts.map(c => {
          const riskClass = c.riskScore >= 50 ? 'risk-high' : c.riskScore >= 30 ? 'risk-med' : 'risk-low';
          const expDays   = c.expires ? Math.ceil((new Date(c.expires) - Date.now()) / 86400000) : null;
          return `
            <div class="table-row">
              <span class="col-primary">${c.client}</span>
              <span>${c.type}</span>
              <span>${c.value ? `$${(c.value / 1e6).toFixed(2)}M` : '—'}</span>
              <span class="status-badge status-${c.status.toLowerCase().replace(/\s+/g, '-')}">${c.status}</span>
              <span>${c.expires || '—'}${expDays !== null && expDays <= 90 ? ` <span class="expiry-warn">(${expDays}d)</span>` : ''}</span>
              <span class="${riskClass}">${c.riskScore}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  render(store.getState());
  store.subscribe(render);
}
