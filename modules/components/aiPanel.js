// AI Intelligence Core panel — intent engine UI.
// Calls resolveQuery(), renders structured responses, optionally speaks results.

import { store } from '../store.js';
import { resolveQuery } from '../intentEngine.js';

// In-module history; not persisted (session-only).
const queryHistory = [];

const QUICK_ACTIONS = [
  'pipeline status',
  'threat assessment',
  'environment check',
  'task briefing',
  'contract review',
  'surveillance report',
];

export function mountAIPanel(el) {
  el.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">AI INTELLIGENCE CORE</h2>
      <span class="section-subtitle">NEXUS OMEGA · Quantum Intent Engine · 6 intents loaded</span>
    </div>
    <div class="ai-layout">
      <div class="ai-console">
        <div id="ai-output" class="ai-output"></div>
        <div class="ai-input-row">
          <span class="ai-prompt-glyph">NEXUS://&gt;</span>
          <input id="ai-input" class="ai-input" type="text"
            placeholder="Query the intelligence core..." autocomplete="off" spellcheck="false"/>
          <button id="ai-submit" class="ai-submit-btn">EXECUTE</button>
        </div>
        <div class="ai-quick-actions">
          ${QUICK_ACTIONS.map(q => `
            <button class="ai-quick-btn" data-query="${q}">${q.toUpperCase()}</button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  const inputEl  = el.querySelector('#ai-input');
  const submitEl = el.querySelector('#ai-submit');
  const outputEl = el.querySelector('#ai-output');

  function executeQuery(rawQuery) {
    const query = rawQuery.trim();
    if (!query) return;

    const state  = store.getState();
    const result = resolveQuery(query, state);

    queryHistory.unshift({ query, result, ts: Date.now() });
    _renderOutput(outputEl, queryHistory);

    // Voice readout (capped at 200 chars to avoid long TTS)
    if (state.settings.voiceEnabled && window.speechSynthesis) {
      const u   = new SpeechSynthesisUtterance(result.text.slice(0, 200));
      u.rate    = 1.1;
      u.pitch   = 0.8;
      window.speechSynthesis.speak(u);
    }

    // Append to activity log
    const existing = store.getState().activityLog;
    store.setState({
      activityLog: [
        { id: `ai-${Date.now()}`, ts: Date.now(), type: 'ai', message: `Query: "${query}" → intent: ${result.intent}`, severity: 'info' },
        ...existing,
      ].slice(0, 200),
    });

    inputEl.value = '';
    inputEl.focus();
  }

  submitEl.addEventListener('click', () => executeQuery(inputEl.value));
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') executeQuery(inputEl.value); });
  el.querySelectorAll('.ai-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => executeQuery(btn.dataset.query));
  });

  // Seed welcome message
  queryHistory.push({
    query: null,
    result: {
      intent: 'system',
      type: 'text',
      text: 'NEXUS OMEGA Intelligence Core online. Quantum intent engine loaded with 6 registered intents. Enter a query or select a quick action.',
      payload: null,
    },
    ts: Date.now(),
  });
  _renderOutput(outputEl, queryHistory);
}

function _renderOutput(el, history) {
  el.innerHTML = [...history].reverse().map(({ query, result, ts }) => {
    const time = new Date(ts).toLocaleTimeString('en-CA', { hour12: false });

    let payloadHtml = '';
    if (result.payload?.kpis?.length) {
      payloadHtml += `<div class="ai-kpi-row">${result.payload.kpis.map(k =>
        `<div class="ai-kpi-card"><span class="ai-kpi-label">${k.label}</span><strong class="ai-kpi-value">${k.value}</strong></div>`
      ).join('')}</div>`;
    }
    if (result.payload?.items?.length) {
      payloadHtml += `<ul class="ai-list">${result.payload.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }

    return `
      <div class="ai-entry intent-${result.intent}">
        ${query ? `<div class="ai-query-line"><span class="ai-ts">${time}</span><span class="ai-q">&gt; ${query}</span></div>` : ''}
        <div class="ai-response-line">
          <span class="ai-badge">[${result.intent.toUpperCase()}]</span>
          <span class="ai-text">${result.text}</span>
          ${payloadHtml}
        </div>
      </div>
    `;
  }).join('');

  el.scrollTop = el.scrollHeight;
}
