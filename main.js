// NEXUS OMEGA v11.0 — Main entry point.
// Wires boot sequence → mounts all components → starts live data simulation.

import { bootSequence }         from './modules/boot.js';
import { store }                from './modules/store.js';
import { mountHeader }          from './modules/components/header.js';
import { mountNav, showTab }    from './modules/components/tabs.js';
import { mountDashboard }       from './modules/components/dashboard.js';
import { mountPipeline }        from './modules/components/pipeline.js';
import { mountContracts }       from './modules/components/contracts.js';
import { mountTasks }           from './modules/components/tasks.js';
import { mountQuantumInsights } from './modules/components/quantumInsights.js';
import { mountAIPanel }         from './modules/components/aiPanel.js';
import { mountSurveillance }    from './modules/components/surveillance.js';
import { mountTicker }          from './modules/ticker.js';

// ── Starfield background (preserved, enhanced) ────────────────────────────────
function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx    = canvas.getContext('2d');
  let stars    = [];

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: Math.min(200, Math.floor(window.innerWidth / 7)) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5,
      v: 0.15 + Math.random() * 0.5,
      alpha: 0.4 + Math.random() * 0.6,
    }));
  };

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.y += s.v;
      if (s.y > canvas.height) { s.y = -2; s.x = Math.random() * canvas.width; }
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle   = '#56f1ff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(render);
  };

  window.addEventListener('resize', resize);
  resize();
  render();
}

// ── Mount all UI components after boot ───────────────────────────────────────
function mountApp() {
  const state = store.getState();

  mountHeader(document.getElementById('app-header'));
  mountTicker(document.getElementById('ticker-content'));
  mountNav(document.getElementById('app-nav'), showTab);

  // Each tab pane is mounted eagerly so state subscriptions are active immediately.
  // Inactive panes are hidden via CSS (display:none on .tab-pane:not(.active)).
  mountDashboard(document.getElementById('tab-dashboard'));
  mountPipeline(document.getElementById('tab-pipeline'));
  mountContracts(document.getElementById('tab-contracts'));
  mountTasks(document.getElementById('tab-tasks'));
  mountQuantumInsights(document.getElementById('tab-quantum'));
  mountAIPanel(document.getElementById('tab-ai'));
  mountSurveillance(document.getElementById('tab-surveillance'));

  // Restore persisted tab selection
  showTab(state.settings.selectedTab);

  // ── Live telemetry simulation (30 s interval) ────────────────────────────
  setInterval(() => {
    const s = store.getState();
    store.setState({
      envData: {
        ...s.envData,
        networkLatency:    Math.floor(8  + Math.random() * 22),
        anomalyScore:      Math.floor(10 + Math.random() * 45),
        activeNodes:       Math.floor(1800 + Math.random() * 120),
        systemIntegrity:   parseFloat((95 + Math.random() * 4.5).toFixed(1)),
        quantumCoherence:  parseFloat((78 + Math.random() * 18).toFixed(1)),
      },
      activityLog: [
        {
          id:       `tel-${Date.now()}`,
          ts:       Date.now(),
          type:     'system',
          message:  `Telemetry refresh — ${new Date().toLocaleTimeString('en-CA', { hour12: false })}`,
          severity: 'info',
        },
        ...s.activityLog,
      ].slice(0, 200),
    });
  }, 30_000);
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
initStarfield();
bootSequence(mountApp);
