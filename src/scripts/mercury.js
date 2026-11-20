/* GRAPHITE MERCURY · motion layer
 * Kinetic precision: spring scroll reveals, text-scramble headings, magnetic buttons,
 * 3D card tilt with chrome glare, ring cursor with labels, blueprint grid parallax and a
 * section scroll rail. Adds .mx-* classes and aria-hidden decorative nodes only. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  function el(tag, cls, parent) { var n = doc.createElement(tag); n.className = cls; n.setAttribute('aria-hidden', 'true'); (parent || doc.body).appendChild(n); return n; }
  function all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  var outside = function (n) { return !n.closest('header.hw-header, .hw-header, nav, footer, .elementor-location-header, [aria-hidden="true"]'); };

  /* Some pages render inside shadow DOM; give those roots the theme sheet too (buttons, type, grade). */
  all('*').forEach(function (host) {
    var sr = host.shadowRoot;
    if (!sr || sr.querySelector('link[data-mx]')) return;
    var l = doc.createElement('link'); l.rel = 'stylesheet'; l.href = '/styles/mercury.css'; l.setAttribute('data-mx', '');
    sr.appendChild(l);
  });

  /* ---------- scroll rail + grid parallax ------------------------------------------------ */
  var rail = el('div', 'mx-rail'), label = el('span', '', rail), bar = el('div', 'mx-bar');
  el('i', '', rail);
  var sections = all('header.hwh-hero, section')
    .filter(function (s) { return s.offsetHeight > 160 && outside(s) && !(s.parentElement && s.parentElement.closest('section')); });
  if (sections.length < 3) sections = all('.elementor-section.elementor-top-section, .e-con.e-parent').filter(function (s) { return s.offsetHeight > 160 && outside(s); });
  var ticks = sections.map(function () { return el('b', '', rail); });
  function layoutTicks() {
    var max = Math.max(1, root.scrollHeight - innerHeight);
    sections.forEach(function (s, i) { ticks[i].style.top = Math.min(100, (s.getBoundingClientRect().top + scrollY) / max * 100) + '%'; });
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var max = Math.max(1, root.scrollHeight - innerHeight), p = Math.min(1, scrollY / max), cur = 0;
      rail.style.setProperty('--p', p.toFixed(4)); bar.style.setProperty('--p', p.toFixed(4));
      if (!reduced) root.style.setProperty('--grid-y', (-scrollY * 0.12).toFixed(1) + 'px');
      sections.forEach(function (s, i) { if (s.getBoundingClientRect().top < innerHeight * .45) cur = i; });
      ticks.forEach(function (t, i) { t.classList.toggle('on', i <= cur); });
      if (sections.length) label.textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(sections.length).padStart(2, '0');
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { layoutTicks(); onScroll(); });
  addEventListener('load', function () { layoutTicks(); onScroll(); });
  layoutTicks(); onScroll();

  /* ---------- cards: 3D tilt + glare ------------------------------------------------------- */
  var CARDS = '.hwh-bx, .hwh-ccard, .hwh-mcard, .hwh-suite-card, .hwh-award, .hwh-eng-card, .hwh-belief, ' +
              '.elementor-widget-call-to-action .elementor-cta, .e-loop-item, .elementor-post, .hwh-res a';
  var cards = all(CARDS).filter(outside);
  cards.forEach(function (c) {
    c.classList.add('mx-card');
    if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
    if (fine) el('span', 'mx-glare', c);
  });
  if (fine && !reduced) {
    cards.forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.classList.add('mx-tilting');
        c.style.setProperty('--ry', ((x - .5) * 9).toFixed(2) + 'deg');
        c.style.setProperty('--rx', ((.5 - y) * 7).toFixed(2) + 'deg');
        c.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        c.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      }, { passive: true });
      c.addEventListener('pointerleave', function () { c.classList.remove('mx-tilting'); });
    });
  }

  /* ---------- magnetic buttons ---------------------------------------------------------------- */
  if (fine && !reduced) {
    all('a.cta, .hwh-cta, .hw-btn--cta, .hwf-cta, .hwh-work-cta, .elementor-button, .hs-button, .hw-btn--ghost, .hwh-textlink').forEach(function (b) {
      b.classList.add('mx-mag');
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = 'translate(' + (dx * .22).toFixed(1) + 'px,' + (dy * .3).toFixed(1) + 'px)';
      }, { passive: true });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- ring cursor ------------------------------------------------------------------------ */
  if (fine && !reduced) {
    var ring = el('div', 'mx-ring'), dot = el('div', 'mx-dot'), tx = -100, ty = -100, rx = tx, ry = ty, run = false;
    root.classList.add('mx-has-cursor');
    var loop = function () {
      rx += (tx - rx) * .2; ry += (ty - ry) * .2;
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      if (Math.abs(tx - rx) + Math.abs(ty - ry) > .3) requestAnimationFrame(loop); else run = false;
    };
    addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY; root.classList.add('mx-cursor-on');
      dot.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
      if (!run) { run = true; requestAnimationFrame(loop); }
      var t = e.target, link = t.closest && t.closest('a, button, [role=button], summary, label');
      var text = !link && t.closest && t.closest('input, textarea, select, [contenteditable]');
      ring.classList.toggle('is-link', !!link); ring.classList.toggle('is-text', !!text);
      var lab = '';
      if (link) {
        if (link.closest('.hwh-ccard, .hwh-tlogo--cs')) lab = 'View';
        else if (link.closest('.hwh-res, .elementor-post, .e-loop-item')) lab = 'Read';
        else if (link.target === '_blank') lab = 'Open';
      }
      if (ring.textContent !== lab) ring.textContent = lab;
    }, { passive: true });
    doc.addEventListener('pointerdown', function () { ring.classList.add('is-down'); });
    doc.addEventListener('pointerup', function () { ring.classList.remove('is-down'); });
    doc.addEventListener('pointerleave', function () { root.classList.remove('mx-cursor-on'); });
  }

  /* ---------- text scramble ------------------------------------------------------------------------ */
  var GLYPHS = '!<>-_/[]{}=+*^?#0123456789ABCDEFXYZ';
  function scramble(h) {
    if (reduced || h.dataset.mxScr) return;
    h.dataset.mxScr = '1';
    var nodes = [], w = doc.createTreeWalker(h, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) if (n.nodeValue.trim()) nodes.push({ node: n, text: n.nodeValue });
    if (!nodes.length) return;
    var total = nodes.reduce(function (a, o) { return a + o.text.length; }, 0), dur = Math.min(1100, 380 + total * 14), t0 = performance.now();
    if (!h.hasAttribute('aria-label')) { h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim()); h.dataset.mxAria = '1'; }
    h.classList.add('mx-scr');
    function frame(now) {
      var p = Math.min(1, (now - t0) / dur), shown = Math.floor(p * total), seen = 0;
      nodes.forEach(function (o) {
        var out = '';
        for (var i = 0; i < o.text.length; i++, seen++) {
          var ch = o.text[i];
          out += (seen < shown || /\s/.test(ch)) ? ch : (seen < shown + 10 ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : ch);
        }
        o.node.nodeValue = out;
      });
      if (p < 1) requestAnimationFrame(frame);
      else {
        nodes.forEach(function (o) { o.node.nodeValue = o.text; });
        h.classList.remove('mx-scr');
        if (h.dataset.mxAria) h.removeAttribute('aria-label');
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- reveals -------------------------------------------------------------------------------- */
  if (!('IntersectionObserver' in window)) return;
  var heads = all('h2, .elementor-widget-heading .elementor-heading-title, .hwh-leader-h').filter(function (h) { return outside(h) && !h.closest('.hwh-hero'); });
  var media = all('.hwh-ccard-media, .elementor-widget-image .elementor-widget-container').filter(outside);
  if (!reduced) {
    heads.forEach(function (h) { h.classList.add('mx-rv-h'); });
    media.forEach(function (m) { m.classList.add('mx-rv-m'); });
    cards.forEach(function (c) {
      if (c.closest('.hwh-trust-marquee')) return;
      var idx = c.parentElement ? Array.prototype.indexOf.call(c.parentElement.children, c) : 0;
      c.classList.add('mx-rv-c'); c.style.setProperty('--d', (Math.min(idx, 6) * .07).toFixed(2) + 's');
    });
    root.classList.add('mx-js');
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var t = en.target; io.unobserve(t);
      t.classList.add('mx-in');
      if (heads.indexOf(t) > -1) scramble(t);
      setTimeout(function () { t.style.removeProperty('--d'); }, 1600);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  heads.concat(media, cards).forEach(function (n) { io.observe(n); });
})();
