// Header component — subscribes to state for live threat/integrity updates.

import { store } from '../store.js';

export function mountHeader(el) {
  function render(state) {
    const { envData, settings } = state;
    const threatClass = { CRITICAL: 'critical', ELEVATED: 'elevated', NOMINAL: 'nominal' }[envData.threatLevel] || 'nominal';

    el.innerHTML = `
      <div class="header-brand">
        <span class="header-hex">⬡</span>
        <span class="header-title">NEXUS OMEGA</span>
        <span class="header-ver">v11.0</span>
      </div>
      <div class="header-meta">
        <span class="header-badge threat-${threatClass}">THREAT: ${envData.threatLevel}</span>
        <span class="header-badge">INTEGRITY: ${envData.systemIntegrity}%</span>
        <span class="header-badge">COHERENCE: ${envData.quantumCoherence}%</span>
        <span id="live-clock" class="header-clock"></span>
        <button class="header-voice-btn ${settings.voiceEnabled ? 'active' : ''}" id="toggle-voice" title="Toggle Voice Synthesis">
          ${settings.voiceEnabled ? '🔊' : '🔇'}
        </button>
      </div>
    `;

    document.getElementById('toggle-voice')?.addEventListener('click', () => {
      const s = store.getState();
      store.setState({ settings: { ...s.settings, voiceEnabled: !s.settings.voiceEnabled } });
    });
  }

  render(store.getState());
  const unsub = store.subscribe(render);

  // Live clock runs on its own interval — independent of store updates
  const tick = () => {
    const clockEl = document.getElementById('live-clock');
    if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('en-CA', { hour12: false });
  };
  tick();
  const clockInterval = setInterval(tick, 1000);

  // Return cleanup in case header is ever unmounted
  return () => { unsub(); clearInterval(clockInterval); };
}
