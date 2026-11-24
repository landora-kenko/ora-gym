/* ============================================================
   ORA GYM — core: icons, motion, store, photos, navigation
   ============================================================ */
const Screens = {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n, d = 0) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const wait = ms => new Promise(r => setTimeout(r, ms));
const haptic = (p = 10) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

/* ---------------- Icons (inline stroke SVG) ---------------- */
const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M15.5 4.8a3.3 3.3 0 0 1 0 6.4M17.5 14.8c2.2.6 3.6 2.4 4 5.2"/>',
  bolt: '<path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z"/>',
  trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v3M8 21h8M9 17h6v4H9z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" stroke="none"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  back: '<path d="M15 5 8 12l7 7"/>', next: '<path d="m9 5 7 7-7 7"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', up: '<path d="M7 17 17 7M8 7h9v9"/>',
  heart: '<path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4 7 4c2.1 0 3.6 1.1 5 3 1.4-1.9 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 15.4 12 20 12 20z"/>',
  heartFill: '<path fill="currentColor" stroke="none" d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4 7 4c2.1 0 3.6 1.1 5 3 1.4-1.9 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 15.4 12 20 12 20z"/>',
  comment: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z"/>',
  share: '<path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 21h4"/>',
  flame: '<path d="M12 22c4 0 7-2.8 7-7 0-3.5-2.2-5.8-4-8-.4 2.2-1.6 3.6-3 4 0-3.2-1.2-6.2-4-9 .3 3.6-1.5 5.7-2.8 7.6C4.3 11 4 12.6 4 14.6 4 19 7.6 22 12 22z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M9.5 2.5h5M12 2.5V6"/>',
  route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 15H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.4 4.6V4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  bag: '<path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>',
  leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19c3-4 6-6 10-8"/>',
  drop: '<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  more: '<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
  camera: '<path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.8"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-8 9"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  medal: '<circle cx="12" cy="15" r="6"/><path d="M8.5 10 6 3h4l2 5M15.5 10 18 3h-4l-2 5"/><path d="m12 12.5.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4"/>',
  eyeoff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c5 0 8.5 4.5 9.5 7a13 13 0 0 1-2.9 4.1M6.6 6.6C4.4 8 3 10.2 2.5 12c1 2.5 4.5 7 9.5 7 1.7 0 3.2-.5 4.5-1.2M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2"/>',
  video: '<rect x="3" y="5.5" width="13" height="13" rx="3"/><path d="m16 10 5-3v10l-5-3z"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  heartbeat: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  mountain: '<path d="m3 19 6-10 4 6 3-4 5 8z"/>',
  speed: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 17 4-5"/>',
  swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  // Sports
  dumbbell: '<path d="M6.5 7.5v9M17.5 7.5v9M3.5 10v4M20.5 10v4M6.5 12h11"/>',
  run: '<circle cx="14.5" cy="4.5" r="1.8"/><path d="m8 21 3-6 3 2.5V21M6 12.5l3-3.5 4 .5 2.5 3.5 3 1M11 15l1.5-5.5"/>',
  bike: '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5 9 9h6l3.5 7.5M9 9l3.5 7.5L15 9M8 6.5h3"/>',
  rings: '<path d="M8 2.5v7.2M16 2.5v7.2"/><circle cx="8" cy="14" r="4.3"/><circle cx="16" cy="14" r="4.3"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="m12 7.8 3.8 2.8-1.4 4.4H9.6L8.2 10.6z"/><path d="M12 7.8V3.2M15.8 10.6l4.4-1.5M14.4 15l2.7 3.7M9.6 15l-2.7 3.7M8.2 10.6 3.8 9.1"/>',
  swim: '<circle cx="16.5" cy="6" r="2"/><path d="m4 11.5 5-3.5 3.5 2.5 2-1.5M2 16c1.7 0 1.7-1.2 3.4-1.2S7 16 8.7 16s1.7-1.2 3.4-1.2 1.7 1.2 3.4 1.2 1.7-1.2 3.4-1.2 1.7 1.2 3.1 1.2M2 20c1.7 0 1.7-1.2 3.4-1.2S7 20 8.7 20s1.7-1.2 3.4-1.2 1.7 1.2 3.4 1.2 1.7-1.2 3.4-1.2 1.7 1.2 3.1 1.2"/>',
  glove: '<path d="M7.5 20.5h8.5V17c2.2-1.2 3.5-3.4 3.5-6.5A6.5 6.5 0 0 0 13 4h-2.5A4.5 4.5 0 0 0 6 8.5v1.2a2.4 2.4 0 0 0 0 4.6c.1 2.6 1.5 3.7 1.5 3.7z"/><path d="M6 9.7c2.6-.3 5.5.3 7 2.3M7.5 17.5H16"/>',
};
const icon = (n, size = 22, sw = 1.7, extra = '') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${IC[n] || ''}</svg>`;

/* ---------------- Motion ---------------- */
const Motion = (() => {
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = mq.matches;
  const linearOK = CSS.supports('animation-timing-function', 'linear(0, 1)');
  const cache = {};
  // Physically simulated spring → CSS linear() easing
  function spring(stiffness = 180, damping = 22, mass = 1) {
    const k = `${stiffness}-${damping}-${mass}`;
    if (cache[k]) return cache[k];
    let x = 0, v = 0; const dt = 1 / 120; const pts = []; let t = 0, rest = 0;
    while (t < 3) {
      const a = (-stiffness * (x - 1) - damping * v) / mass; v += a * dt; x += v * dt; t += dt; pts.push(x);
      if (Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01) { if (++rest > 12) break; } else rest = 0;
    }
    const dur = Math.round(t * 1000);
    const step = Math.max(1, Math.floor(pts.length / 48));
    const s = []; for (let i = 0; i < pts.length; i += step) s.push(+pts[i].toFixed(4)); s.push(1);
    const res = { duration: dur, easing: linearOK ? `linear(0, ${s.join(', ')})` : 'cubic-bezier(.2,.9,.25,1.15)' };
    cache[k] = res; return res;
  }
  const EASE = { out: 'cubic-bezier(.16,1,.3,1)', inout: 'cubic-bezier(.65,0,.35,1)', in: 'cubic-bezier(.5,0,.75,0)' };
  function animate(el, kf, opt = {}) {
    if (!el) return { finished: Promise.resolve() };
    let o = { fill: 'both', ...opt };
    if (o.spring) { const sp = spring(...o.spring); o.duration = o.duration || sp.duration; o.easing = sp.easing; delete o.spring; }
    if (typeof o.easing === 'string' && EASE[o.easing]) o.easing = EASE[o.easing];
    if (reduced) { o = { ...o, duration: 1, delay: 0 }; }
    const a = el.animate(kf, o);
    return a;
  }
  // Coordinated entrance: [data-e] elements, ordered by value
  function enter(root, base = 0, gap = 55) {
    const els = $$('[data-e]', root).sort((a, b) => (+a.dataset.e || 0) - (+b.dataset.e || 0));
    els.forEach(el => {
      const i = +el.dataset.e || 0; const kind = el.dataset.ek || 'rise';
      const delay = base + i * gap;
      let kf;
      if (kind === 'fade') kf = [{ opacity: 0 }, { opacity: 1 }];
      else if (kind === 'scale') kf = [{ opacity: 0, transform: 'scale(.92)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }];
      else if (kind === 'left') kf = [{ opacity: 0, transform: 'translateX(28px)' }, { opacity: 1, transform: 'none' }];
      else if (kind === 'zoom') kf = [{ opacity: 0, transform: 'scale(1.14)' }, { opacity: 1, transform: 'scale(1)' }];
      else kf = [{ opacity: 0, transform: 'translateY(22px)', filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }];
      const a = animate(el, kf, kind === 'zoom' ? { duration: 1600, delay, easing: 'out' } : { spring: [150, 20], delay });
      a.finished && a.finished.then(() => { try { a.commitStyles && a.cancel(); el.style.filter = ''; el.style.transform = ''; el.style.opacity = ''; } catch (e) {} });
    });
    const after = base + els.length * gap + 120;
    setTimeout(() => { countUp(root); drawLines(root); fillRings(root); fillBars(root); }, reduced ? 0 : Math.min(after, base + 520));
  }
  function countUp(root, sel = '[data-count]') {
    $$(sel, root).forEach(el => {
      if (el._counted) return; el._counted = true;
      const to = parseFloat(el.dataset.count); const dec = +(el.dataset.dec || 0);
      const from = parseFloat(el.dataset.from || 0); const dur = +(el.dataset.dur || 1300);
      tween(from, to, dur, v => el.textContent = fmt(v, dec));
    });
  }
  function tween(from, to, dur, cb, ease = t => 1 - Math.pow(1 - t, 4)) {
    if (reduced) { cb(to); return; }
    const t0 = performance.now();
    const f = now => { const t = clamp((now - t0) / dur, 0, 1); cb(lerp(from, to, ease(t))); if (t < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  function drawLines(root) {
    $$('[data-draw]', root).forEach(p => {
      if (p._drawn) return; p._drawn = true;
      const L = p.getTotalLength ? p.getTotalLength() : 600;
      p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
      animate(p, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: +(p.dataset.draw || 1400), easing: 'out', delay: +(p.dataset.delay || 0) });
    });
  }
  function fillRings(root) {
    $$('[data-ring]', root).forEach(c => {
      if (c._ringed) return; c._ringed = true;
      const r = +c.getAttribute('r'); const C = 2 * Math.PI * r; const frac = +c.dataset.ring * (+(c.dataset.arc || 1));
      c.style.strokeDasharray = `${C}`;
      animate(c, [{ strokeDashoffset: C }, { strokeDashoffset: C * (1 - frac) }], { duration: 1500, easing: 'out', delay: +(c.dataset.delay || 0) });
    });
  }
  function fillBars(root) {
    $$('[data-bar]', root).forEach(b => {
      if (b._barred) return; b._barred = true;
      animate(b, [{ transform: 'scaleX(0)' }, { transform: `scaleX(${b.dataset.bar})` }], { duration: 1200, easing: 'out', delay: +(b.dataset.delay || 0) });
    });
    $$('[data-vbar]', root).forEach((b, i) => {
      if (b._barred) return; b._barred = true;
      animate(b, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { spring: [120, 16], delay: i * 45 });
    });
  }
  // Split title into letters for kinetic typography
  function splitLetters(el) {
    const txt = el.textContent; el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(' ').map(w => `<span class="mask" aria-hidden="true">${[...w].map(ch => `<span class="letter">${esc(ch)}</span>`).join('')}</span>`).join(' ');
    return $$('.letter', el);
  }
  function fit(el) {
    if (!el.isConnected) return; const txt = el.textContent;
    const max = +(el.dataset.max || parseFloat(el.style.fontSize) || parseFloat(getComputedStyle(el).fontSize)); el.dataset.max = max; el.style.fontSize = max + 'px';
    el.innerHTML = txt.split(' ').map(w => `<span style="display:inline-block;white-space:nowrap">${esc(w)}</span>`).join(' ');
    const cw = el.clientWidth; const mw = Math.max(...$$('span', el).map(s => s.offsetWidth)); el.textContent = txt;
    if (cw && mw > cw * .97) el.style.fontSize = Math.max(24, Math.floor(max * cw * .95 / mw)) + 'px';
  }
  function kinetic(el, delay = 0) {
    if (!el) return; el.style.overflowWrap = 'normal'; fit(el);
    const ls = splitLetters(el);
    ls.forEach((l, i) => animate(l, [{ transform: 'translateY(105%) rotate(6deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { spring: [170, 19], delay: delay + i * 28 }));
  }
  // FLIP: animate elements from previous rects
  function flip(els, mutate, opt = {}) {
    const first = new Map(els.map(e => [e, e.getBoundingClientRect()]));
    mutate();
    els.forEach(e => {
      const f = first.get(e); const l = e.getBoundingClientRect();
      const dx = f.left - l.left, dy = f.top - l.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      animate(e, [{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { spring: opt.spring || [160, 20], fill: 'none' });
    });
  }
  mq.addEventListener && mq.addEventListener('change', e => setReduced(e.matches));
  function setReduced(v) { reduced = v; document.documentElement.classList.toggle('rm', v); }
  return { spring, animate, enter, countUp, tween, drawLines, fillRings, fillBars, kinetic, flip, splitLetters, get reduced() { return reduced; }, setReduced };
})();
const A = Motion.animate;

/* ---------------- Store (best-effort local persistence) ---------------- */
const Store = (() => {
  const KEY = 'oragym.v1';
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  const def = {
    onboarded: false, name: 'Atleta', handle: 'atleta', level: 'Intermediário', city: '', goals: ['desempenho', 'forca'],
    sports: ['musculacao', 'corrida', 'boxe'], sport: 'musculacao', email: '', liked: {}, saved: {}, favs: {}, following: {},
    privacy: { privateProfile: false, hideRouteEnds: true, locationOnlyDuringActivity: true, showWeight: false, shareInFeed: true },
    posts: [], challengesJoined: ['c1', 'c2', 'c3'], customChallenges: [], records: {}, meals: null, water: 5, comments: {},
  };
  s = Object.assign({}, def, s || {});
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
  return { get: () => s, set(p) { Object.assign(s, p); save(); }, save, reset() { try { localStorage.removeItem(KEY); } catch (e) {} s = JSON.parse(JSON.stringify(def)); } };
})();

/* ---------------- Photos (IndexedDB slots) ---------------- */
const Photos = (() => {
  const urls = {}; let db = null;
  function open() {
    return new Promise(res => {
      try {
        const r = indexedDB.open('oragym-photos', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('p');
        r.onsuccess = () => { db = r.result; res(db); };
        r.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  }
  async function load() {
    await open(); if (!db) return;
    await new Promise(res => {
      try {
        const tx = db.transaction('p', 'readonly'); const st = tx.objectStore('p'); const req = st.openCursor();
        req.onsuccess = () => { const c = req.result; if (c) { urls[c.key] = URL.createObjectURL(c.value); c.continue(); } else res(); };
        req.onerror = () => res();
      } catch (e) { res(); }
    });
  }
  async function put(slot, file) {
    if (urls[slot]) URL.revokeObjectURL(urls[slot]);
    urls[slot] = URL.createObjectURL(file);
    try { if (!db) await open(); db && db.transaction('p', 'readwrite').objectStore('p').put(file, slot); } catch (e) {}
  }
  async function del(slot) {
    if (urls[slot]) URL.revokeObjectURL(urls[slot]); delete urls[slot];
    try { db && db.transaction('p', 'readwrite').objectStore('p').delete(slot); } catch (e) {}
  }
  return { load, put, del, url: s => urls[s] || null, all: () => ({ ...urls }) };
})();

/* ---------------- Press feedback (pointer-tracked light) ---------------- */
document.addEventListener('pointerdown', e => {
  const p = e.target.closest('.press'); if (!p) return;
  const r = p.getBoundingClientRect();
  p.style.setProperty('--px', `${e.clientX - r.left}px`); p.style.setProperty('--py', `${e.clientY - r.top}px`);
  p.classList.add('is-down');
  const up = () => { p.classList.remove('is-down'); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
}, { passive: true });

/* ---------------- Toast ---------------- */
function toast(msg, ic = 'check') {
  const phone = $('#app'); const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
  t.innerHTML = `${icon(ic, 18, 2)}<span>${esc(msg)}</span>`; phone.appendChild(t);
  A(t, [{ opacity: 0, transform: 'translate(-50%,-20px) scale(.9)' }, { opacity: 1, transform: 'translate(-50%,0) scale(1)' }], { spring: [200, 18] });
  setTimeout(() => { const a = A(t, [{ opacity: 1 }, { opacity: 0, transform: 'translate(-50%,-14px) scale(.96)' }], { duration: 300, easing: 'in' }); a.finished.then(() => t.remove()); }, 2300);
}

/* ---------------- Bottom sheet ---------------- */
const Sheet = {
  open(html, mount, opts = {}) {
    const phone = $('#app'); const w = document.createElement('div'); w.className = 'sheet-wrap';
    w.innerHTML = `<div class="sheet-backdrop"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(opts.label || 'Painel')}"><div class="grab"></div><div class="sheet-body">${html}</div></div>`;
    phone.appendChild(w);
    const sh = $('.sheet', w), bd = $('.sheet-backdrop', w);
    A(bd, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    A(sh, [{ transform: 'translateY(100%)' }, { transform: 'none' }], { spring: [190, 24] });
    Motion.enter(sh, 120, 40);
    const close = () => {
      if (w._closing) return; w._closing = true;
      A(bd, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 });
      const cur = getComputedStyle(sh).transform;
      A(sh, [{ transform: cur === 'none' ? 'none' : cur }, { transform: 'translateY(105%)' }], { duration: 320, easing: 'in' }).finished.then(() => { w.remove(); opts.onClose && opts.onClose(); });
    };
    bd.addEventListener('click', close);
    const onKey = e => { if (e.key === 'Escape' && document.body.contains(w) && $$('.sheet-wrap').pop() === w) { e.stopPropagation(); close(); } }; document.addEventListener('keydown', onKey); const _rm = w.remove.bind(w); w.remove = () => { document.removeEventListener('keydown', onKey); _rm(); };
    // drag to dismiss
    const grab = $('.grab', w); let y0 = null, dy = 0;
    const start = e => { if (e.target.closest('.sheet-body') && $('.sheet-body', w).scrollTop > 0) return; if (e.target.closest('input,textarea,button,select,label')) return; y0 = e.clientY; dy = 0; sh.setPointerCapture && sh.setPointerCapture(e.pointerId); };
    const move = e => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); sh.getAnimations().forEach(a => a.cancel()); sh.style.transform = `translateY(${dy}px)`; bd.style.opacity = 1 - dy / 500; };
    const end = () => { if (y0 == null) return; y0 = null; if (dy > 110) close(); else { A(sh, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { spring: [220, 22] }).finished.then(() => sh.style.transform = ''); bd.style.opacity = ''; } };
    sh.addEventListener('pointerdown', start); sh.addEventListener('pointermove', move); sh.addEventListener('pointerup', end); sh.addEventListener('pointercancel', end);
    w.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
    mount && mount(w, close);
    const f = $('button,input', sh); f && setTimeout(() => f.focus({ preventScroll: true }), 50);
    return close;
  }
};

/* ---------------- Dialog (in-page confirm) ---------------- */
function confirmDialog(title, text, okLabel = 'Confirmar', danger = false) {
  return new Promise(res => {
    Sheet.open(`<div style="padding:8px 4px 4px"><h3 class="h2" data-e="0">${esc(title)}</h3><p class="muted" style="line-height:1.5;margin:10px 0 22px" data-e="1">${esc(text)}</p>
      <div class="stack" data-e="2"><button class="btn btn-block ${danger ? '' : 'btn-white'}" style="${danger ? 'background:#FF4D5E;color:#fff' : ''}" data-ok>${esc(okLabel)}</button><button class="btn btn-ghost btn-block" data-close>Cancelar</button></div></div>`,
      (w, close) => { $('[data-ok]', w).onclick = () => { res(true); close(); }; }, { onClose: () => res(false), label: title });
  });
}

/* ---------- Bloqueia zoom por pinça e por dois toques (iOS ignora user-scalable=no) ---------- */
(() => {
  const inMap = e => e.target && e.target.closest && e.target.closest('.leaflet-container');
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, e => { if (!inMap(e)) e.preventDefault(); }, { passive: false }));
  document.addEventListener('touchmove', e => { if (e.touches.length > 1 && !inMap(e)) e.preventDefault(); }, { passive: false });
  document.addEventListener('dblclick', e => { if (!inMap(e)) e.preventDefault(); }, { passive: false });
})();
