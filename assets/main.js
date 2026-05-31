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

    // origin = centre of the logo (fall back to the upper-left)
    var ox = W * 0.14, oy = H * 0.4;
    if (logo) {
      var lr = logo.getBoundingClientRect();
      ox = lr.left - r.left + lr.width / 2;
      oy = lr.top - r.top + lr.height / 2;
    }

    var N = 52;
    var ends = [];
    for (var i = 0; i < N; i++) {
      var ang = (-104 + (i / (N - 1)) * 220 + rnd(-7, 7)) * Math.PI / 180; // wide fan, up -> down-right
      var len = rnd(170, Math.max(300, W * 0.82));
      var dx = Math.cos(ang), dy = Math.sin(ang);
      var ex = ox + dx * len, ey = oy + dy * len;
      var perp = ang + Math.PI / 2;
      var b1 = rnd(-0.28, 0.28) * len, b2 = rnd(-0.5, 0.5) * len; // bend / curl
      var c1x = ox + dx * len * 0.34 + Math.cos(perp) * b1;
      var c1y = oy + dy * len * 0.34 + Math.sin(perp) * b1;
      var c2x = ox + dx * len * 0.68 + Math.cos(perp) * b2;
      var c2y = oy + dy * len * 0.68 + Math.sin(perp) * b2;
      var c = cols[i % 3];
      var g = ctx.createLinearGradient(ox, oy, ex, ey);
      g.addColorStop(0, rgba(c, 0));
      g.addColorStop(0.12, rgba(c, 0.5));
      g.addColorStop(0.55, rgba(c, 0.2));
      g.addColorStop(1, rgba(c, 0));
      ctx.strokeStyle = g;
      ctx.lineWidth = rnd(0.7, 1.5);
      ctx.shadowColor = rgba(c, 0.5);
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
      ctx.stroke();
      ends.push([ex, ey, c]);
      if (Math.random() < 0.5) ends.push([c2x, c2y, c]); // a node mid-curl too
    }

    // glowing nodes at the filament ends
    for (var j = 0; j < ends.length; j++) {
      var p = ends[j];
      ctx.fillStyle = rgba(p[2], 0.75);
      ctx.shadowColor = rgba(p[2], 0.85);
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p[0], p[1], rnd(1.1, 2.1), 0, 6.2832);
      ctx.fill();
    }

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
