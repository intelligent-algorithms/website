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
  var GRAV = 0.07;

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
    var ang = (-90 + (Math.random() * 64 - 32)) * Math.PI / 180; // upward, spread +/-32deg
    var sp = 3.4 + Math.random() * 2.8;
    particles.push({
      x: ox, y: oy,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      life: 0, max: 95 + Math.random() * 55,
      c: colours[(Math.random() * 3) | 0],
      len: 5 + Math.random() * 7
    });
  }

  var running = true;
  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    var i;
    for (i = 0; i < 2; i++) emit();
    for (i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.vy += GRAV;
      p.x += p.vx; p.y += p.vy;
      p.life++;
      if (p.life >= p.max || p.y > H + 16) { particles.splice(i, 1); continue; }
      var a = (1 - p.life / p.max) * 0.85;
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
