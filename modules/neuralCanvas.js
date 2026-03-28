// Reusable neural-network canvas component.
// Usage: const n = new NeuralCanvas(canvasEl, config); n.start();

const DEFAULT_CONFIG = {
  layers: [4, 7, 7, 5, 3],
  nodeRadius: 5,
  colorTheme: {
    node: '#56f1ff',
    nodePulse: '#ffffff',
    connection: 'rgba(86, 241, 255, 0.12)',
    activeConnection: 'rgba(159, 107, 255, 0.55)',
  },
  animationSpeed: 1.0,
  connectionDensity: 0.55, // probability a given inter-layer edge exists
};

export class NeuralCanvas {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = { ...DEFAULT_CONFIG, ...config, colorTheme: { ...DEFAULT_CONFIG.colorTheme, ...(config.colorTheme || {}) } };
    this.nodes = [];
    this.connections = [];
    this._rafId = null;
    // ResizeObserver keeps canvas in sync with its parent's dimensions
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
    this._buildGraph();
  }

  /** Flash specific node indices for 800 ms. */
  highlightNodes(indices) {
    indices.forEach(i => { if (this.nodes[i]) this.nodes[i].highlight = true; });
    setTimeout(() => {
      indices.forEach(i => { if (this.nodes[i]) this.nodes[i].highlight = false; });
    }, 800);
  }

  _onResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    this.canvas.width  = parent.clientWidth  || 400;
    this.canvas.height = parent.clientHeight || 300;
    this._buildGraph();
  }

  _buildGraph() {
    const { layers, connectionDensity } = this.config;
    const W = this.canvas.width;
    const H = this.canvas.height;
    this.nodes = [];
    this.connections = [];

    let idx = 0;
    layers.forEach((count, li) => {
      const x = (W / (layers.length + 1)) * (li + 1);
      for (let ni = 0; ni < count; ni++) {
        const y = (H / (count + 1)) * (ni + 1);
        this.nodes.push({ x, y, layer: li, phase: Math.random() * Math.PI * 2, highlight: false, idx: idx++ });
      }
    });

    // Build adjacency between adjacent layers only
    for (let li = 0; li < layers.length - 1; li++) {
      const A = this.nodes.filter(n => n.layer === li);
      const B = this.nodes.filter(n => n.layer === li + 1);
      A.forEach(a => {
        B.forEach(b => {
          if (Math.random() < connectionDensity) {
            this.connections.push({ a: a.idx, b: b.idx, phase: Math.random() * Math.PI * 2 });
          }
        });
      });
    }
  }

  _loop() {
    this._rafId = requestAnimationFrame(t => { this._draw(t); this._loop(); });
  }

  _draw(t) {
    const { ctx, config, nodes, connections } = this;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const time = t * 0.001 * config.animationSpeed;

    ctx.clearRect(0, 0, W, H);

    // Connections
    connections.forEach(conn => {
      const a = nodes[conn.a];
      const b = nodes[conn.b];
      const activity = (Math.sin(time * 1.4 + conn.phase) + 1) / 2;
      const active = activity > 0.72;
      ctx.strokeStyle = active ? config.colorTheme.activeConnection : config.colorTheme.connection;
      ctx.lineWidth   = active ? 1.5 : 0.7;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });

    // Nodes
    nodes.forEach(node => {
      const pulse  = (Math.sin(time * 2 + node.phase) + 1) / 2;
      const r      = config.nodeRadius + pulse * 2.5;
      const alpha  = 0.55 + pulse * 0.45;
      const color  = node.highlight ? config.colorTheme.nodePulse : config.colorTheme.node;

      // Glow halo
      const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 3.5);
      grd.addColorStop(0, node.highlight ? 'rgba(255,255,255,0.35)' : `rgba(86,241,255,${alpha * 0.28})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle    = color;
      ctx.globalAlpha  = alpha;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }
}
