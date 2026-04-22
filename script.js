(() => {
  const state = {
    signalStrength: 0,
    nerveActivity: 0,
    trackingStatus: 'Online',
  };

  function updateDataDisplay() {
    const signalElem = document.getElementById('signalStrength');
    const activityElem = document.getElementById('nerveActivity');
    const statusElem = document.getElementById('trackingStatus');
    if (signalElem) signalElem.textContent = `Signal Strength: ${state.signalStrength}%`;
    if (activityElem) activityElem.textContent = `Nerve Activity: ${state.nerveActivity} units`;
    if (statusElem) statusElem.textContent = `Tracking Status: ${state.trackingStatus}`;
  }

  function updateSimulatedData() {
    state.signalStrength = Math.floor(Math.random() * 101);
    state.nerveActivity = Math.floor(Math.random() * 51);
    updateDataDisplay();
  }

  function animateCounter(el) {
    const target = Number(el.dataset.target || 0);
    const start = performance.now();
    const duration = 900;

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = String(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach((counter) => animateCounter(counter));
  }

  function initNerveCanvas() {
    const canvas = document.getElementById('nerveCanvas');
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resizeCanvas() {
      const width = Math.min(900, Math.floor(window.innerWidth * 0.88));
      canvas.width = width;
      canvas.height = Math.floor(width * 0.55);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function loop() {
      const t = Date.now() / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = state.signalStrength > 50 ? '#56f1ff' : '#ff4f87';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(40, canvas.height * 0.25);
      ctx.quadraticCurveTo(canvas.width * 0.45, canvas.height * 0.55 + Math.sin(t) * 20, canvas.width - 40, canvas.height * 0.75);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(canvas.width - 50 + Math.cos(t * 2) * 8, canvas.height * 0.75, 8, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(loop);
    }

    loop();
  }

  function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: Math.min(180, Math.floor(window.innerWidth / 10)) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 0.4 + Math.random() * 1.5,
        v: 0.2 + Math.random() * 0.6,
      }));
    }

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(86,241,255,0.9)';
      for (const s of stars) {
        s.y += s.v;
        if (s.y > canvas.height) {
          s.y = -2;
          s.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(render);
    }

    resize();
    window.addEventListener('resize', resize);
    render();
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch((err) => {
        console.warn('Service worker registration failed:', err.message);
      });
    });
  }

  function init() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    initCounters();
    initNerveCanvas();
    initStarfield();
    updateDataDisplay();
    setInterval(updateSimulatedData, 1000);
    registerServiceWorker();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
