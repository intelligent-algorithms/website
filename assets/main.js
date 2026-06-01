// Scroll-reveal: fade/slide elements in as they enter the viewport.
// Progressive enhancement — without JS (or with reduced motion) everything
// is shown normally. Elements already on screen at load are never hidden,
// so there is no flash of invisible content.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  var selector = '.entry, .anchor, .cred-card, .writing-list .item, .pub-list li';
  var els = Array.prototype.slice.call(document.querySelectorAll(selector));
  if (!els.length) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  var vh = window.innerHeight || document.documentElement.clientHeight;
  els.forEach(function (el) {
    if (el.getBoundingClientRect().top < vh * 0.92) {
      el.classList.add('in'); // already visible: show immediately, no hide
    } else {
      el.classList.add('reveal');
      io.observe(el);
    }
  });
})();

// Dropdown navigation. CSS already opens menus on hover / keyboard focus;
// this layer adds click-to-toggle (touch) and keeps aria-expanded honest.
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.site-nav .has-menu'));
  if (!items.length) return;

  function closeAll(except) {
    items.forEach(function (item) {
      if (item === except) return;
      item.classList.remove('open');
      var b = item.querySelector('.nav-top');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  items.forEach(function (item) {
    var btn = item.querySelector('.nav-top');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var willOpen = !item.classList.contains('open');
      closeAll(item);
      item.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-menu')) closeAll(null);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();

// Hero network: a static spread of curved, glowing light filaments that fan
// out from the logo across the hero. Drawn once (and on resize) — no motion.
(function () {
  var canvas = document.getElementById('heroNet');
  if (!canvas) return;
  var ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return;
  var logo = document.querySelector('.hero-logo');
  var cols = [[90, 162, 245], [76, 212, 236], [47, 224, 196]]; // blue, cyan, teal
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  function draw() {
    var r = canvas.getBoundingClientRect();
    var W = Math.max(1, r.width), H = Math.max(1, r.height);
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    // Measure the text block so the light never crosses the wording.
    var sel = ['.hero-logo', '.eyebrow', '.hero-slogan', '.lede', '.cta-row'];
    var tL = 1e9, tT = 1e9, tR = -1e9, tB = -1e9, k;
    for (k = 0; k < sel.length; k++) {
      var el = document.querySelector('.hero-home ' + sel[k]);
      if (!el) continue;
      var b = el.getBoundingClientRect();
      tL = Math.min(tL, b.left - r.left); tT = Math.min(tT, b.top - r.top);
      tR = Math.max(tR, b.right - r.left); tB = Math.max(tB, b.bottom - r.top);
    }
    if (tR < 0) { tL = 0; tT = 0; tR = W * 0.55; tB = H; }
    // beams live to the right of the wording and fade out before reaching it
    var safeRight = Math.min(W * 0.74, Math.max(W * 0.46, tR + 56));

    // Hard safeguard: clip the text box out so nothing can paint over the words.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.rect(tL - 14, tT - 14, (tR - tL) + 28, (tB - tT) + 28);
    ctx.clip('evenodd');

    // Straight long laser beams, fanned out like rays from a bright source
    // at the bottom-right. Bright at the source, fading in toward the centre.
    var ox = W * 0.9, oy = H * 1.04;       // source just off the bottom-right
    var a0 = -150, a1 = -8;                // fan span (degrees), upward
    var M = 24;
    var maxLen = Math.max(W, H);
    for (var i = 0; i < M; i++) {
      var ang = (a0 + (i / (M - 1)) * (a1 - a0) + rnd(-1.5, 1.5)) * Math.PI / 180;
      var len = rnd(0.78, 1.25) * maxLen;  // long — reaches toward the centre
      var ex = ox + Math.cos(ang) * len;
      var ey = oy + Math.sin(ang) * len;
      var c = cols[i % 3];
      var bright = (i % 3 === 0);           // crisp laser cores + softer wide beams
      var g = ctx.createLinearGradient(ox, oy, ex, ey);
      g.addColorStop(0, rgba(c, bright ? 0.95 : 0.6));
      g.addColorStop(0.45, rgba(c, bright ? 0.55 : 0.3));
      g.addColorStop(1, rgba(c, 0));        // fade toward the centre / tip
      ctx.strokeStyle = g;
      ctx.lineWidth = bright ? rnd(1, 2) : rnd(2.5, 6);
      ctx.shadowColor = rgba(c, 0.6);
      ctx.shadowBlur = bright ? 6 : 14;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    // Bright bloom at the source.
    var rg = ctx.createRadialGradient(ox, oy, 0, ox, oy, 150);
    rg.addColorStop(0, 'rgba(150, 220, 255, 0.55)');
    rg.addColorStop(1, 'rgba(150, 220, 255, 0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(ox, oy, 150, 0, 6.2832); ctx.fill();

    // A scatter of glowing nodes on the right.
    for (var j = 0; j < 14; j++) {
      var nx = rnd(safeRight, W), ny = rnd(0, H), nc = cols[j % 3];
      ctx.fillStyle = rgba(nc, 0.7); ctx.shadowColor = rgba(nc, 0.85); ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(nx, ny, rnd(1, 2.2), 0, 6.2832); ctx.fill();
    }

    ctx.restore();
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
  }

  draw();
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(draw, 150); });
})();

// Rotating hero headline: cycle the slogan lines (bytes.co.uk-style).
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var rotator = document.querySelector('.hero-slogan.rotator');
  if (!rotator) return;
  var lines = Array.prototype.slice.call(rotator.querySelectorAll('.rot-line'));
  if (lines.length < 2) return;

  var i = 0;
  setInterval(function () {
    lines[i].classList.remove('is-active');
    i = (i + 1) % lines.length;
    lines[i].classList.add('is-active');
  }, 3800);
})();
