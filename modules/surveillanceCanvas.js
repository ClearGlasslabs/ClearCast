// Reusable surveillance-map canvas component.
// Usage: const s = new SurveillanceCanvas(canvasEl, config); s.start();

const DEFAULT_CONFIG = {
  gridDivisions: 10,
  colorTheme: {
    grid: 'rgba(86, 241, 255, 0.07)',
    gridMajor: 'rgba(86, 241, 255, 0.18)',
    point: '#56f1ff',
    pointAlert: '#ff4d4d',
    sweep: 'rgba(86, 241, 255, 0.14)',
    sweepLine: 'rgba(86, 241, 255, 0.7)',
    text: 'rgba(86, 241, 255, 0.65)',
  },
  animationSpeed: 1.0,
  points: [], // { id, x, y, label, alert } — normalized 0–1 coords
  zones: [],  // { x, y, w, h, label, severity } — normalized 0–1 coords
};

export class SurveillanceCanvas {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = { ...DEFAULT_CONFIG, ...config, colorTheme: { ...DEFAULT_CONFIG.colorTheme, ...(config.colorTheme || {}) } };
    this._rafId = null;
    this._ro = new ResizeObserver(() => this._onResize());
    this._ro.observe(canvas.parentElement || document.body);
  }

  start() {
    this._onResize();
    this._loop();
  }

  stop() {
    cancelAnimationFrame(this._rafId);
    this._ro.disconnect();
  }

  updateConfig(partial) {
    this.config = { ...this.config, ...partial };
  }

  /** Temporarily highlight a region; auto-removes after 3 s. */
  highlightZone(zone) {
    this.config.zones.push(zone);
    setTimeout(() => {
      this.config.zones = this.config.zones.filter(z => z !== zone);
    }, 3000);
  }

  _onResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    this.canvas.width  = parent.clientWidth  || 600;
    this.canvas.height = parent.clientHeight || 360;
  }

  _loop() {
    this._rafId = requestAnimationFrame(t => { this._draw(t); this._loop(); });
  }

  _draw(t) {
    const { ctx, config } = this;
    const W = this.canvas.width;
    const H = this.canvas.height;

    ctx.clearRect(0, 0, W, H);

    this._drawGrid(W, H);
    this._drawSweep(W, H, t);
    this._drawZones(W, H, t);
    this._drawPoints(W, H, t);
    this._drawHUD(W, H);
  }

  _drawGrid(W, H) {
    const { ctx, config } = this;
    const div = config.gridDivisions;
    for (let i = 0; i <= div; i++) {
      const major = i % 5 === 0;
      ctx.strokeStyle = major ? config.colorTheme.gridMajor : config.colorTheme.grid;
      ctx.lineWidth   = major ? 1 : 0.5;
      ctx.beginPath(); ctx.moveTo((W / div) * i, 0);  ctx.lineTo((W / div) * i, H);  ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, (H / div) * i);  ctx.lineTo(W, (H / div) * i);  ctx.stroke();
    }
  }

  _drawSweep(W, H, t) {
    const { ctx, config } = this;
    const cx     = W / 2;
    const cy     = H / 2;
    const radius = Math.max(W, H);
    const angle  = (t * 0.0008 * config.animationSpeed) % (Math.PI * 2);

    // Sweep fill
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const sweepGrad = ctx.createLinearGradient(0, 0, radius, 0);
    sweepGrad.addColorStop(0, config.colorTheme.sweep);
    sweepGrad.addColorStop(1, 'rgba(86,241,255,0)');
    ctx.fillStyle = sweepGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, -0.45, 0.45);
    ctx.closePath();
    ctx.fill();

    // Sweep leading edge
    ctx.strokeStyle = config.colorTheme.sweepLine;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.stroke();
    ctx.restore();

    // Center origin
    ctx.fillStyle = '#56f1ff';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawZones(W, H, t) {
    const { ctx, config } = this;
    const flash = Math.sin(t * 0.005) > 0;
    config.zones.forEach(zone => {
      const color = zone.severity === 'critical' ? '#ff4d4d' : '#ffb84d';
      ctx.strokeStyle = flash ? color : 'transparent';
      ctx.lineWidth   = 2;
      ctx.strokeRect(zone.x * W, zone.y * H, zone.w * W, zone.h * H);
      if (zone.label) {
        ctx.fillStyle = color;
        ctx.font      = '10px "Share Tech Mono", monospace';
        ctx.fillText(`⚠ ${zone.label}`, zone.x * W + 4, zone.y * H - 5);
      }
    });
  }

  _drawPoints(W, H, t) {
    const { ctx, config } = this;
    const pulse = (Math.sin(t * 0.003) + 1) / 2;
    config.points.forEach(pt => {
      const x     = pt.x * W;
      const y     = pt.y * H;
      const color = pt.alert ? config.colorTheme.pointAlert : config.colorTheme.point;

      // Pulse ring
      ctx.strokeStyle  = color;
      ctx.globalAlpha  = 0.25 + pulse * 0.45;
      ctx.lineWidth    = 1;
      ctx.beginPath();
      ctx.arc(x, y, 10 + pulse * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Core dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();

      if (pt.label) {
        ctx.fillStyle = color;
        ctx.font      = '9px "Share Tech Mono", monospace';
        ctx.fillText(pt.label, x + 7, y - 5);
      }
    });
  }

  _drawHUD(W, H) {
    const { ctx, config } = this;
    // Status readout — top-left
    ctx.fillStyle = config.colorTheme.text;
    ctx.font      = '9px "Share Tech Mono", monospace';
    ctx.fillText('SURVEILLANCE GRID ACTIVE', 10, 14);
    ctx.fillText(`SECTORS: ${config.points.length} TRACKED`, 10, 27);
    ctx.fillText(`ALERT ZONES: ${config.zones.length}`, 10, 40);

    // Corner bracket decorations
    const b = 14;
    ctx.strokeStyle = 'rgba(86, 241, 255, 0.35)';
    ctx.lineWidth   = 1.5;
    [[0, 0, b, 0, 0, b], [W - b, 0, W, 0, W, b], [0, H - b, 0, H, b, H], [W, H - b, W, H, W - b, H]]
      .forEach(([x1, y1, x2, y2, x3, y3]) => {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.stroke();
      });
  }
}
