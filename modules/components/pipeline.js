// Pipeline tab — Kanban-style deal board grouped by stage.

import { store } from '../store.js';

const STAGE_ORDER  = ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const STAGE_COLORS = {
  Discovery:   '#56f1ff',
  Proposal:    '#9f6bff',
  Negotiation: '#ffb84d',
  'Closed Won':  '#4dff91',
  'Closed Lost': '#ff4d4d',
};

export function mountPipeline(el) {
  function render(state) {
    const { deals } = state;
    const grouped = STAGE_ORDER.reduce((acc, s) => { acc[s] = deals.filter(d => d.stage === s); return acc; }, {});
    const totalV  = deals.reduce((s, d) => s + d.value, 0);
    const wonV    = deals.filter(d => d.stage === 'Closed Won').reduce((s, d) => s + d.value, 0);

    el.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">DEAL PIPELINE</h2>
        <span class="section-subtitle">Total: $${(totalV / 1e6).toFixed(2)}M · Won: $${(wonV / 1e6).toFixed(2)}M</span>
      </div>
      <div class="pipeline-board">
        ${STAGE_ORDER.map(stage => `
          <div class="pipeline-column">
            <div class="pipeline-col-header" style="border-color: ${STAGE_COLORS[stage]}; color: ${STAGE_COLORS[stage]}">
              ${stage}
              <span class="pipeline-col-count">${grouped[stage].length}</span>
            </div>
            <div class="pipeline-cards">
              ${grouped[stage].map(deal => `
                <div class="deal-card">
                  <div class="deal-name">${deal.name}</div>
                  <div class="deal-value">$${(deal.value / 1e6).toFixed(2)}M</div>
                  <div class="deal-meta">
                    <span class="deal-prob" style="color: ${STAGE_COLORS[stage]}">${deal.probability}%</span>
                    <span class="deal-owner">${deal.owner}</span>
                  </div>
                  <div class="deal-sector">${deal.sector}</div>
                  <div class="deal-progress-track">
                    <div class="deal-progress-fill" style="width: ${deal.probability}%; background: ${STAGE_COLORS[stage]}"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  render(store.getState());
  store.subscribe(render);
}
