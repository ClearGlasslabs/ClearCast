// Boot sequence: loads persisted state → seeds defaults → animates boot log → mounts app.

import { store } from './store.js';
import { loadState, saveState } from './persistence.js';
import { DEFAULTS } from './data/defaults.js';

const BOOT_LOGS = [
  { text: '[SYS]    NEXUS OMEGA v11.0 — ClearGlass Quantum Intelligence Core initializing...', delay: 0 },
  { text: '[MEM]    Allocating quantum state registers...', delay: 280 },
  { text: '[STORE]  Scanning localStorage for persisted session...', delay: 560 },
  { text: '[GRAPH]  Neural topology configured — 5 layers, 26 nodes, variable density', delay: 840 },
  { text: '[CRYPTO] Verifying cryptographic identity hashes via AES-256 / ZUC / SNOW...', delay: 1100 },
  { text: '[NET]    Establishing secure mesh: NA-EAST · EU-WEST · APAC-SOUTH', delay: 1350 },
  { text: '[AI]     Loading intent registry — 6 intents registered', delay: 1620 },
  { text: '[SYS]    All subsystems nominal. Mounting UI shell...', delay: 1900 },
];

function appendLog(container, text) {
  const line = document.createElement('div');
  line.className = 'boot-log-line';
  line.textContent = text;
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}

function setProgress(pct) {
  const bar = document.getElementById('boot-progress-bar');
  if (bar) bar.style.width = `${Math.min(pct, 100)}%`;
}

function speak(text) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate  = 1.1;
  u.pitch = 0.8;
  window.speechSynthesis.speak(u);
}

/**
 * Run the animated boot sequence, then call mountApp().
 * @param {() => void} mountApp  — called once boot animation completes
 */
export async function bootSequence(mountApp) {
  // 1. Resolve initial state: persisted → merge with defaults
  const persisted     = loadState();
  const initialState  = persisted
    ? { ...DEFAULTS, ...persisted, envData: { ...DEFAULTS.envData, ...persisted.envData }, settings: { ...DEFAULTS.settings, ...persisted.settings } }
    : { ...DEFAULTS };

  store.init(initialState);

  // 2. Wire auto-save on every state mutation
  store.subscribe(state => saveState(state));

  // 3. Animate boot log
  const logContainer  = document.getElementById('boot-log');
  const totalDuration = BOOT_LOGS[BOOT_LOGS.length - 1].delay + 400;

  await Promise.all(
    BOOT_LOGS.map(({ text, delay }) =>
      new Promise(resolve => {
        setTimeout(() => {
          appendLog(logContainer, text);
          setProgress(((delay + 400) / totalDuration) * 100);
          resolve();
        }, delay);
      })
    )
  );

  // 4. Optional voice announcement
  if (initialState.settings.voiceEnabled) {
    speak('NEXUS OMEGA online. All systems operational.');
  }

  // 5. Short pause → crossfade boot screen out
  await new Promise(r => setTimeout(r, 500));

  const bootEl = document.getElementById('boot-screen');
  const appEl  = document.getElementById('app');

  bootEl.classList.add('boot-exit');
  setTimeout(() => {
    bootEl.style.display = 'none';
    appEl.style.display  = 'flex';
    mountApp();
  }, 600);
}
