// Navigation tab component — config-driven tab list with store integration.

import { store } from '../store.js';

// Add or reorder tabs here; no other code needs to change.
export const TAB_CONFIG = [
  { id: 'dashboard',    label: 'DASHBOARD',    icon: '◈' },
  { id: 'pipeline',     label: 'PIPELINE',     icon: '◉' },
  { id: 'contracts',    label: 'CONTRACTS',    icon: '◧' },
  { id: 'tasks',        label: 'TASKS',        icon: '◫' },
  { id: 'quantum',      label: 'QUANTUM',      icon: '⬡' },
  { id: 'ai',           label: 'AI CORE',      icon: '◎' },
  { id: 'surveillance', label: 'SURVEILLANCE', icon: '⊕' },
];

export function mountNav(el, onTabChange) {
  function render(state) {
    const active = state.settings.selectedTab;
    el.innerHTML = TAB_CONFIG.map(tab => `
      <button class="nav-tab ${active === tab.id ? 'active' : ''}" data-tab="${tab.id}">
        <span class="nav-tab-icon">${tab.icon}</span>
        <span class="nav-tab-label">${tab.label}</span>
      </button>
    `).join('');

    el.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        store.setState({ settings: { ...store.getState().settings, selectedTab: tabId } });
        onTabChange(tabId);
      });
    });
  }

  render(store.getState());
  store.subscribe(render);
}

/** Show one tab pane, hide all others. */
export function showTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabId}`);
  });
}
