// Night lagoon: a single warm light on the horizon, reflected in slow water.
(() => {
  const c = document.getElementById('bg');
  if (!c) return;
  const x = c.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, dpr, mx = 0.5, tmx = 0.5, stars = [];

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    c.width = w * dpr; c.height = h * dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    let s = 7;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    stars = Array.from({ length: Math.round(w / 22) }, () => ({
      x: rnd() * w, y: rnd() * h * 0.5, r: 0.3 + rnd() * 0.8, p: rnd() * 6.28, a: 0.15 + rnd() * 0.45,
    }));
  }

  function draw(ms) {
    if (!w || !h) { size(); if (!w || !h) { requestAnimationFrame(draw); return; } }
    const t = ms * 0.001;
    if (!isFinite(tmx)) tmx = 0.5;
    mx += (tmx - mx) * 0.03;
    const hz = h * 0.6;
    const gx = w * (0.5 + (mx - 0.5) * 0.14);

    // sky
    let g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#06090c');
    g.addColorStop(0.6, '#0e181c');
    g.addColorStop(0.601, '#070b0e');
    g.addColorStop(1, '#05080a');
    x.fillStyle = g; x.fillRect(0, 0, w, h);

    // stars
    for (const s of stars) {
      x.globalAlpha = s.a * (0.6 + 0.4 * Math.sin(t * 0.7 + s.p));
      x.fillStyle = '#ebe6da';
      x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.283); x.fill();
    }
    x.globalAlpha = 1;

    // glow above the horizon
    const R = Math.max(w, h) * 0.6;
    x.save();
    x.beginPath(); x.rect(0, 0, w, hz); x.clip();
    g = x.createRadialGradient(gx, hz, 0, gx, hz, R);
    g.addColorStop(0, 'rgba(236,178,104,0.50)');
    g.addColorStop(0.12, 'rgba(224,150,84,0.24)');
    g.addColorStop(0.4, 'rgba(120,130,120,0.07)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, hz);
    x.restore();

    // the lamp
    g = x.createRadialGradient(gx, hz - 3, 0, gx, hz - 3, 26);
    g.addColorStop(0, 'rgba(255,232,190,0.95)');
    g.addColorStop(0.25, 'rgba(244,190,120,0.5)');
    g.addColorStop(1, 'rgba(244,190,120,0)');
    x.fillStyle = g; x.fillRect(gx - 30, hz - 33, 60, 34);

    // horizon line
    g = x.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(111,179,173,0)');
    g.addColorStop(0.5 + (mx - 0.5) * 0.14, 'rgba(240,200,140,0.55)');
    g.addColorStop(1, 'rgba(111,179,173,0)');
    x.fillStyle = g; x.fillRect(0, hz - 0.5, w, 1);

    // water
    const N = 58, gn = gx / w;
    for (let i = 0; i < N; i++) {
      const p = i / (N - 1);
      const y = hz + 3 + (h - hz) * p * p * 1.04;
      const amp = 0.6 + p * p * 13;
      const f = 0.013 - p * 0.008;
      const spread = 0.035 + p * 0.33;
      const core = 0.75 * (1 - p * 0.55);
      const side = 0.05 + p * 0.1;
      g = x.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, `rgba(111,179,173,${side * 0.4})`);
      g.addColorStop(Math.max(0.001, gn - spread), `rgba(111,179,173,${side})`);
      g.addColorStop(Math.min(0.998, Math.max(0.002, gn)), `rgba(240,188,120,${core})`);
      g.addColorStop(Math.min(0.999, gn + spread), `rgba(111,179,173,${side})`);
      g.addColorStop(1, `rgba(111,179,173,${side * 0.4})`);
      x.strokeStyle = g;
      x.lineWidth = 0.6 + p * 1.2;
      x.beginPath();
      for (let xx = -8; xx <= w + 8; xx += 6) {
        const yy = y
          + Math.sin(xx * f + t * (0.5 + p * 0.7) + i * 1.7) * amp * 0.5
          + Math.sin(xx * f * 2.3 - t * 0.35 + i * 0.9) * amp * 0.25;
        xx === -8 ? x.moveTo(xx, yy) : x.lineTo(xx, yy);
      }
      x.stroke();
    }

    // vignette
    g = x.createRadialGradient(w / 2, h * 0.55, Math.min(w, h) * 0.3, w / 2, h * 0.55, Math.max(w, h) * 0.8);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.55)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);

    if (!still) requestAnimationFrame(draw);
  }

  addEventListener('resize', () => { size(); if (still) draw(0); });
  addEventListener('pointermove', (e) => { tmx = e.clientX / w; });
  size();
  requestAnimationFrame(draw);
})();
