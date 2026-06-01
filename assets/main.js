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

    // Full-width burst: straight beams radiating up from a bright horizon at
    // the bottom-centre, fanning right across the page (text legibility is
    // handled by a dark scrim layer in CSS, not by clipping).
    var ox = W * 0.6, oy = H * 0.94;       // source on a low horizon, just right of centre
    var a0 = -174, a1 = -6;                // fan span (degrees): a full upward sweep
    var M = 40;
    var maxLen = Math.max(W, H) * 1.35;
    for (var i = 0; i < M; i++) {
      var ang = (a0 + (i / (M - 1)) * (a1 - a0) + rnd(-1.4, 1.4)) * Math.PI / 180;
      var len = rnd(0.7, 1.0) * maxLen;    // long — reach the top edge
      var ex = ox + Math.cos(ang) * len;
      var ey = oy + Math.sin(ang) * len;
      var c = cols[i % 3];
      var bright = (i % 3 === 0);           // crisp cores + softer wide beams
      var g = ctx.createLinearGradient(ox, oy, ex, ey);
      g.addColorStop(0, rgba(c, bright ? 0.95 : 0.62));
      g.addColorStop(0.4, rgba(c, bright ? 0.5 : 0.28));
      g.addColorStop(1, rgba(c, 0));        // fade out toward the top
      ctx.strokeStyle = g;
      ctx.lineWidth = bright ? rnd(1, 2) : rnd(2.5, 6);
      ctx.shadowColor = rgba(c, 0.6);
      ctx.shadowBlur = bright ? 6 : 14;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    // Bright horizon line where the beams originate.
    var hl = ctx.createLinearGradient(0, 0, W, 0);
    hl.addColorStop(0.0, 'rgba(120, 200, 255, 0)');
    hl.addColorStop(0.5, 'rgba(170, 225, 255, 0.85)');
    hl.addColorStop(1.0, 'rgba(120, 200, 255, 0)');
    ctx.strokeStyle = hl;
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(150, 210, 255, 0.8)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(W * 0.06, oy);
    ctx.lineTo(W * 0.94, oy);
    ctx.stroke();

    // Bright bloom at the source.
    var rg = ctx.createRadialGradient(ox, oy, 0, ox, oy, 220);
    rg.addColorStop(0, 'rgba(170, 225, 255, 0.6)');
    rg.addColorStop(1, 'rgba(170, 225, 255, 0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(ox, oy, 220, 0, 6.2832); ctx.fill();

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
