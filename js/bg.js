/* =========================================================
   SQA motion background
   Dot grid + cursor spotlight, floating test signals, a QA scan
   beam, and bugs that turn into green checks when the beam finds them.
   Runs on one <canvas id="qaBg"> fixed behind the page.
   ========================================================= */
function qaBackground(canvas, options) {
  options = options || {};
  if (!canvas || !canvas.getContext) return function () {};
  const ctx = canvas.getContext('2d');

  const ACCENT = options.accentRgb || '15, 118, 110';
  const INK = '15, 30, 54';
  const PASS = '22, 163, 74';
  const BUG = '220, 38, 38';

  const TOKENS = [
    { t: 'PASS', k: 'pass' }, { t: '✓ test_login', k: 'pass' }, { t: '200 OK', k: 'pass' },
    { t: 'assert status == 200', k: 'code' }, { t: 'GET /api/v1/invoices', k: 'code' },
    { t: '401 Unauthorized', k: 'ink' }, { t: 'regression ✓', k: 'pass' }, { t: 'smoke ✓', k: 'pass' },
    { t: 'p95 < 300ms', k: 'code' }, { t: 'k6 run load.js', k: 'code' }, { t: 'BUG-001 → FIXED', k: 'ink' },
    { t: 'pytest -q', k: 'code' }, { t: 'Postman ✓', k: 'pass' }, { t: '0 critical bugs', k: 'pass' },
    { t: 'retest ✓', k: 'pass' }, { t: 'JMeter · 500 users', k: 'code' }, { t: 'expected == actual', k: 'ink' },
    { t: 'UAT sign-off', k: 'pass' }
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, DPR = 1;
  let tokens = [], bugs = [], bursts = [], orbs = [];
  let clock = 0;
  let scanY = 0;
  const mouse = { x: -9999, y: -9999, px: 0, py: 0, tx: 0, ty: 0 };
  let last = 0, running = false, rafId = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = options.width ? options.width() : window.innerWidth;
    H = options.height ? options.height() : window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  function build() {
    const small = W < 700;
    const nTokens = small ? 8 : 16;
    const nBugs = small ? 3 : 5;
    tokens = Array.from({ length: nTokens }, (_, i) => {
      const def = TOKENS[i % TOKENS.length];
      const depth = rand(0.4, 1); // closer tokens move faster and look stronger
      return { ...def, x: rand(0, W), y: rand(0, H), vy: -rand(8, 18) * depth, depth, w: 0 };
    });
    bugs = Array.from({ length: nBugs }, () => newBug());
    bursts = [];
    scanY = rand(0, H);
    // Soft colour glows that drift slowly behind the glass cards
    orbs = [
      { rgb: ACCENT, a: 0.22, r: 0.42, fx: 0.07, fy: 0.05, px: 0.18, py: 0.22, ph: 0 },
      { rgb: '59, 130, 246', a: 0.16, r: 0.38, fx: 0.05, fy: 0.08, px: 0.82, py: 0.30, ph: 2 },
      { rgb: '45, 212, 191', a: 0.18, r: 0.34, fx: 0.06, fy: 0.04, px: 0.62, py: 0.85, ph: 4 },
      { rgb: '139, 92, 246', a: 0.10, r: 0.30, fx: 0.04, fy: 0.06, px: 0.10, py: 0.80, ph: 1 }
    ];
  }

  function newBug() {
    return {
      x: rand(40, W - 40), y: rand(60, H - 60), angle: rand(0, Math.PI * 2),
      speed: rand(14, 26), wobble: rand(0, 10), state: 'bug', t: 0, alpha: 0
    };
  }

  // ---- drawing helpers ----
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Glows are drawn on a small canvas (1/8 size) and scaled up: they are soft anyway,
  // and this keeps the animation light even with glass blur on top.
  const orbCanvas = document.createElement('canvas');
  const octx = orbCanvas.getContext('2d');
  const ORB_SCALE = 8;
  function drawOrbs() {
    const ow = Math.max(1, Math.ceil(W / ORB_SCALE)), oh = Math.max(1, Math.ceil(H / ORB_SCALE));
    if (orbCanvas.width !== ow || orbCanvas.height !== oh) { orbCanvas.width = ow; orbCanvas.height = oh; }
    octx.clearRect(0, 0, ow, oh);
    const base = Math.max(ow, oh);
    orbs.forEach((o) => {
      const x = (o.px + Math.sin(clock * o.fx + o.ph) * 0.12) * ow;
      const y = (o.py + Math.cos(clock * o.fy + o.ph) * 0.10) * oh;
      const r = o.r * base;
      const g = octx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${o.rgb}, ${o.a})`);
      g.addColorStop(1, `rgba(${o.rgb}, 0)`);
      octx.fillStyle = g;
      octx.fillRect(x - r, y - r, r * 2, r * 2);
    });
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(orbCanvas, 0, 0, W, H);
  }

  function drawGrid() {
    const gap = 30;
    const spot = 200;
    for (let x = gap / 2; x < W; x += gap) {
      for (let y = gap / 2; y < H; y += gap) {
        const dx = x - mouse.x, dy = y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < spot) {
          const k = 1 - d / spot;
          ctx.fillStyle = `rgba(${ACCENT}, ${0.12 + k * 0.45})`;
          ctx.fillRect(x - 1.2, y - 1.2, 2.4 + k, 2.4 + k);
        } else {
          ctx.fillStyle = `rgba(${INK}, 0.07)`;
          ctx.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
        }
      }
    }
  }

  function drawScan() {
    const g = ctx.createLinearGradient(0, scanY - 70, 0, scanY + 2);
    g.addColorStop(0, `rgba(${ACCENT}, 0)`);
    g.addColorStop(1, `rgba(${ACCENT}, 0.05)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, scanY - 70, W, 72);
    ctx.fillStyle = `rgba(${ACCENT}, 0.22)`;
    ctx.fillRect(0, scanY, W, 1);
  }

  function drawTokens() {
    ctx.font = '500 12px "IBM Plex Mono", ui-monospace, monospace';
    ctx.textBaseline = 'middle';
    tokens.forEach((tk) => {
      if (!tk.w) tk.w = ctx.measureText(tk.t).width + 20;
      const ox = mouse.px * 14 * tk.depth;   // gentle parallax
      const oy = mouse.py * 10 * tk.depth;
      const x = tk.x + ox, y = tk.y + oy;
      const a = 0.11 + tk.depth * 0.17;
      const rgb = tk.k === 'pass' ? PASS : tk.k === 'code' ? ACCENT : INK;
      roundRect(x, y - 12, tk.w, 24, 12);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.35 * tk.depth})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${rgb}, ${a * 0.9})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = `rgba(${rgb}, ${a + 0.1})`;
      ctx.fillText(tk.t, x + 10, y + 0.5);
    });
  }

  function drawBug(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle + Math.PI / 2);
    ctx.globalAlpha = b.alpha;
    ctx.strokeStyle = `rgba(${BUG}, 0.45)`;
    ctx.fillStyle = `rgba(${BUG}, 0.12)`;
    ctx.lineWidth = 1.4;
    // legs (wiggle while walking)
    const leg = Math.sin(b.t * 14) * 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(-5, i * 4); ctx.lineTo(-10, i * 5 + leg * (i === 0 ? -1 : 1)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(5, i * 4); ctx.lineTo(10, i * 5 - leg * (i === 0 ? -1 : 1)); ctx.stroke();
    }
    // body + head + antennae
    ctx.beginPath(); ctx.ellipse(0, 2, 6, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -8, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1.5, -11); ctx.lineTo(-4, -15); ctx.moveTo(1.5, -11); ctx.lineTo(4, -15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(0, 10); ctx.stroke();
    ctx.restore();
  }

  function drawCheck(b) {
    const k = Math.min(b.t / 0.35, 1);
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = `rgba(${PASS}, 0.14)`;
    ctx.strokeStyle = `rgba(${PASS}, 0.7)`;
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-5 + 3.5 * Math.min(k * 2, 1), 3.5 * Math.min(k * 2, 1));
    if (k > 0.5) ctx.lineTo(-1.5 + 7 * (k - 0.5) * 2, 3.5 - 8 * (k - 0.5) * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawBursts() {
    bursts.forEach((br) => {
      ctx.strokeStyle = `rgba(${PASS}, ${0.45 * (1 - br.t)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(br.x, br.y, 12 + br.t * 34, 0, Math.PI * 2); ctx.stroke();
    });
  }

  // ---- update ----
  function update(dt) {
    clock += dt;
    // smooth mouse parallax (-1..1)
    mouse.px += (mouse.tx - mouse.px) * Math.min(dt * 3, 1);
    mouse.py += (mouse.ty - mouse.py) * Math.min(dt * 3, 1);

    tokens.forEach((tk) => {
      tk.y += tk.vy * dt;
      if (tk.y < -30) { tk.y = H + 30; tk.x = rand(0, Math.max(W - tk.w, 0)); }
    });

    const prevScan = scanY;
    scanY += H / 9 * dt; // one sweep about every 9 seconds
    if (scanY > H + 10) scanY = -10;

    bugs.forEach((b, i) => {
      b.t += dt;
      if (b.state === 'bug') {
        b.alpha = Math.min(b.alpha + dt * 1.5, 1);
        b.angle += Math.sin(b.t * 1.3 + b.wobble) * dt * 1.2;
        b.x += Math.cos(b.angle) * b.speed * dt;
        b.y += Math.sin(b.angle) * b.speed * dt;
        if (b.x < 20 || b.x > W - 20) b.angle = Math.PI - b.angle;
        if (b.y < 20 || b.y > H - 20) b.angle = -b.angle;
        b.x = Math.max(20, Math.min(W - 20, b.x));
        b.y = Math.max(20, Math.min(H - 20, b.y));
        // caught by the scan beam
        if (prevScan < b.y && scanY >= b.y && b.t > 1.5) {
          b.state = 'check'; b.t = 0;
          bursts.push({ x: b.x, y: b.y, t: 0 });
        }
      } else {
        if (b.t > 1.6) b.alpha = Math.max(b.alpha - dt * 1.2, 0);
        if (b.t > 2.6) bugs[i] = newBug();
      }
    });

    bursts.forEach((br) => { br.t += dt * 1.4; });
    bursts = bursts.filter((br) => br.t < 1);
  }

  // The background drifts slowly, so 30 updates a second look the same as 60
  // and halve the work for the frosted-glass blur on top of it.
  const FRAME_MS = 1000 / 30;
  function frame(now) {
    if (!running) return;
    rafId = requestAnimationFrame(frame);
    if (now - last < FRAME_MS - 2) return;
    const dt = Math.min((now - last) / 1000 || 0, 0.08);
    last = now;
    update(dt);
    render();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    drawOrbs();
    drawGrid();
    drawScan();
    drawTokens();
    bugs.forEach((b) => (b.state === 'bug' ? drawBug(b) : drawCheck(b)));
    drawBursts();
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  // ---- events ----
  const onResize = () => { resize(); if (!running) render(); };
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    mouse.tx = (mouse.x / W) * 2 - 1;
    mouse.ty = (mouse.y / H) * 2 - 1;
  };
  const onLeave = () => { mouse.x = mouse.y = -9999; };
  const onVis = () => (document.hidden ? stop() : start());
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  document.addEventListener('visibilitychange', onVis);

  resize();
  // Re-measure token pills once the web font has loaded
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { tokens.forEach((t) => { t.w = 0; }); if (!running) render(); });
  render();          // reduced motion: this single still frame is all that's shown
  start();

  // Returns a function that stops the animation and removes listeners
  return function destroy() {
    stop();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', onVis);
  };
}

// Start it on the page, using the theme colour from css/style.css
(function () {
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
  qaBackground(document.getElementById('qaBg'), { accentRgb: accent || '15, 118, 110' });
})();
