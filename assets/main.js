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

// Hero fountain: a fine three-colour spray that fires up from the logo,
// arcs, and spills back down under gravity. Replaces the static beams when
// JavaScript and motion are available; otherwise the CSS beams remain.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.getElementById('fountainCanvas');
  if (!canvas || reduce) return;
  var ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return;
  var fountain = canvas.closest('.hero-fountain');
  if (fountain) fountain.classList.add('js-spray');

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var colours = ['#5aa2f5', '#4cd4ec', '#2fe0c4'];
  var particles = [];
  var W = 0, H = 0, ox = 53, oy = 0;
  var GRAV = 0.010; // very low gravity → very long, wide arcs that ripple out
  var MAX = 130;    // safety cap (emission is throttled in frame())

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    ox = 53; oy = H - 53; // centre of the logo
  }
  resize();
  window.addEventListener('resize', resize);

  function emit() {
    var ang = (-82 + (Math.random() * 148 - 74)) * Math.PI / 180; // upward, very wide spread +/-74deg
    var sp = 0.9 + Math.random() * 0.9;                            // very slow
    particles.push({
      x: ox, y: oy,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      life: 0, max: 320 + Math.random() * 120,                     // long-lived → ripples far out
      c: colours[(Math.random() * 3) | 0],
      len: 64 + sp * 18 + Math.random() * 46                       // very long thin beams
    });
  }

  var running = true, tick = 0;
  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    var i;
    tick++;
    if (tick % 5 === 0 && particles.length < MAX) emit();          // throttled → fewer beams
    for (i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.vy += GRAV;
      p.x += p.vx; p.y += p.vy;
      p.life++;
      if (p.life > p.max || p.y > H + 30 || p.x < -70 || p.x > W + 70) { particles.splice(i, 1); continue; }
      var t = p.life / p.max;
      var a = 0.8;
      if (p.life < 16) a *= p.life / 16;                                       // fade in
      if (t > 0.72) a *= Math.max(0, 1 - (t - 0.72) / 0.28);                   // fade out near end
      if (p.y > oy) a *= Math.max(0.15, 1 - (p.y - oy) / (H - oy + 30));       // dim as it spills below the logo
      var spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 1;
      ctx.globalAlpha = a;
      ctx.strokeStyle = p.c;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - (p.vx / spd) * p.len, p.y - (p.vy / spd) * p.len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { running = false; }
    else if (!running) { running = true; requestAnimationFrame(frame); }
  });
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
