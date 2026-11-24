/* ============================================================
   ORA GYM — componentes visuais
   ============================================================ */
const paceStr = m => { const mm = Math.floor(m); const ss = Math.round((m - mm) * 60); return `${mm}'${String(ss).padStart(2, '0')}"`; };
const statVal = s => s.fmt === 'pace' ? `<span>${paceStr(s.v)}</span>` : `<span data-count="${s.v}" data-dec="${s.d}">0</span>`;

/* ---------- Sport art: editorial graphic motifs per modality ---------- */
function sportArt(id, c) {
  const L = (o) => `stroke="${c}" stroke-opacity="${o}" fill="none"`;
  const W = `stroke="#fff" fill="none"`;
  const glow = `<defs><radialGradient id="g-${id}" cx="78%" cy="28%" r="60%"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
    <linearGradient id="lg-${id}" x1="0" x2="1"><stop offset="0" stop-color="${c}" stop-opacity="0"/><stop offset=".6" stop-color="${c}" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient>
    <filter id="bl-${id}"><feGaussianBlur stdDeviation="6"/></filter></defs><rect width="390" height="560" fill="url(#g-${id})"/>`;
  let a = '';
  switch (id) {
    case 'musculacao': a = `<g transform="translate(280 230)">${[150, 124, 96, 62, 22].map((r, i) => `<circle r="${r}" ${L(.16 + i * .1)} stroke-width="${i === 4 ? 6 : 1.2}"/>`).join('')}
      ${Array.from({ length: 48 }, (_, i) => { const t = i / 48 * Math.PI * 2; return `<line x1="${Math.cos(t) * 132}" y1="${Math.sin(t) * 132}" x2="${Math.cos(t) * 142}" y2="${Math.sin(t) * 142}" ${L(.35)} stroke-width="1"/>`; }).join('')}
      <path d="M-150 0 A150 150 0 0 1 106 -106" stroke="url(#lg-${id})" stroke-width="3" fill="none" stroke-linecap="round" data-draw="1800"/></g>
      <line x1="-20" y1="230" x2="420" y2="230" ${W} stroke-opacity=".35" stroke-width="7"/><line x1="-20" y1="230" x2="420" y2="230" stroke="${c}" stroke-opacity=".5" stroke-width="14" filter="url(#bl-${id})"/>
      <g transform="translate(40 230)"><rect x="-6" y="-70" width="16" height="140" rx="4" ${L(.5)} stroke-width="1.5"/><rect x="16" y="-52" width="12" height="104" rx="3" ${L(.4)} stroke-width="1.5"/></g>`; break;
    case 'corrida': a = `${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${-60 + i * 38} 560 C ${60 + i * 26} 380, ${250 + i * 8} 260, ${430} ${150 + i * 14}" ${L(.12 + i * .05)} stroke-width="${1 + i * .25}"/>`).join('')}
      <path d="M-60 560 C 60 380, 250 260, 430 150" stroke="url(#lg-${id})" stroke-width="3" fill="none" data-draw="1700"/>
      ${[1, 2, 3, 4, 5, 6].map(i => `<text x="${12 + i * 46}" y="${540 - i * 3}" fill="${c}" fill-opacity=".35" font-family="Archivo" font-weight="800" font-size="22" font-style="italic">${i}</text>`).join('')}
      <path d="M0 120 L390 70" ${W} stroke-opacity=".06" stroke-width="50" filter="url(#bl-${id})"/>`; break;
    case 'ciclismo': a = `<g transform="translate(250 250)"><circle r="150" ${L(.45)} stroke-width="3"/><circle r="138" ${L(.2)} stroke-width="1"/><circle r="16" ${L(.6)} stroke-width="3"/>
      ${Array.from({ length: 28 }, (_, i) => { const t = i / 28 * Math.PI * 2; return `<line x1="${Math.cos(t) * 16}" y1="${Math.sin(t) * 16}" x2="${Math.cos(t + .25) * 138}" y2="${Math.sin(t + .25) * 138}" ${L(.22)} stroke-width=".8"/>`; }).join('')}
      <path d="M-150 0 A150 150 0 0 1 0 -150" stroke="url(#lg-${id})" stroke-width="4" fill="none" stroke-linecap="round" data-draw="1600"/></g>
      <path d="M0 500 L40 470 L80 480 L130 420 L170 440 L220 380 L260 400 L300 350 L340 370 L390 330 V560 H0Z" fill="${c}" fill-opacity=".06" ${L(.4)} stroke-width="1.2"/>`; break;
    case 'calistenia': a = `<line x1="40" y1="70" x2="390" y2="70" ${W} stroke-opacity=".25" stroke-width="6"/>
      ${[[190, 330], [300, 330]].map(([x, y]) => `<line x1="${x}" y1="70" x2="${x}" y2="${y - 48}" ${L(.5)} stroke-width="2"/><circle cx="${x}" cy="${y}" r="48" ${L(.65)} stroke-width="7"/><circle cx="${x}" cy="${y}" r="48" stroke="${c}" stroke-opacity=".55" stroke-width="16" fill="none" filter="url(#bl-${id})"/>`).join('')}
      <path d="M142 330 A48 48 0 0 1 238 330" stroke="#fff" stroke-opacity=".8" stroke-width="2" fill="none" data-draw="1400"/>
      ${Array.from({ length: 9 }, (_, i) => `<line x1="20" y1="${400 + i * 18}" x2="370" y2="${400 + i * 18}" ${L(.06)} stroke-width="1"/>`).join('')}`; break;
    case 'futebol': a = `<g transform="translate(195 330)"><ellipse rx="150" ry="58" ${L(.45)} stroke-width="2"/><ellipse rx="6" ry="3" fill="${c}" fill-opacity=".8"/>
      <line x1="-400" y1="0" x2="400" y2="0" ${L(.35)} stroke-width="2"/></g>
      <path d="M-40 560 L120 150 M430 560 L270 150 M120 150 H270" ${L(.25)} stroke-width="1.6"/>
      <path d="M150 150 L140 190 H250 L240 150" ${L(.35)} stroke-width="1.6"/>
      <path d="M45 330 C 120 300, 270 300, 345 330" stroke="url(#lg-${id})" stroke-width="3" fill="none" data-draw="1500"/>`; break;
    case 'natacao': a = `${Array.from({ length: 6 }, (_, i) => { const y = 170 + i * 70; let d = `M-20 ${y}`; for (let x = -20; x <= 410; x += 20) d += ` L${x} ${y + Math.sin(x / 30 + i) * 4}`; return `<path d="${d}" ${L(.18 + i * .06)} stroke-width="${i % 2 ? 1 : 2.5}" stroke-dasharray="${i % 2 ? '0' : '2 10'}" stroke-linecap="round"/>`; }).join('')}
      ${[60, 110, 160].map((r, i) => `<ellipse cx="270" cy="260" rx="${r}" ry="${r * .32}" ${L(.4 - i * .1)} stroke-width="1.4"/>`).join('')}
      <path d="M-20 330 C 90 310, 200 350, 410 320" stroke="url(#lg-${id})" stroke-width="3" fill="none" data-draw="1500"/>`; break;
    case 'boxe': a = `${[0, 1, 2].map(i => `<path d="M-30 ${260 + i * 70} L 330 ${170 + i * 58}" ${W} stroke-opacity="${.22 - i * .04}" stroke-width="${5 - i}"/><path d="M-30 ${260 + i * 70} L 330 ${170 + i * 58}" stroke="${c}" stroke-opacity=".35" stroke-width="12" filter="url(#bl-${id})"/>`).join('')}
      <rect x="322" y="110" width="22" height="300" rx="6" ${L(.6)} stroke-width="2"/><rect x="322" y="110" width="22" height="300" rx="6" fill="${c}" fill-opacity=".12"/>
      <path d="M-30 260 L 330 170" stroke="url(#lg-${id})" stroke-width="3" data-draw="1300" fill="none"/>`; break;
    default: a = '';
  }
  return `<svg class="scene-art" viewBox="0 0 390 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${glow}${a}</svg>`;
}

/* ---------- Scene = cinematic photo with grading ---------- */
function scene(slot, sportId, opts = {}) {
  const sp = SPORTS[sportId] || SPORTS.musculacao; const c = sp.c;
  const idx = opts.i || 0;
  const src = opts.src || Photos.url(slot) || photo(sportId, idx, opts.sm);
  const nm = (PH[sportId] || [])[idx % ((PH[sportId] || [1]).length)];
  const pos = opts.pos || PHOTO_POS[nm] || 'center 30%';
  const word = opts.word || '';
  return `<div class="scene has-photo" style="--sc:${c}" data-slot="${slot}">
    <img class="scene-photo" src="${src}" alt="" loading="${opts.eager ? 'eager' : 'lazy'}" decoding="async" style="--pos:${pos};${opts.filter ? 'filter:' + opts.filter : ''}">
    ${word ? `<div class="scene-word" aria-hidden="true" style="${opts.wordStyle || ''}">${word}</div>` : ''}
    ${opts.grade === false ? '' : '<div class="scene-grade"></div><div class="scene-rim"></div>'}<div class="scene-grain"></div><div class="scene-fade" style="${opts.fade || ''}"></div>
  </div>`;
}

/* ---------- Progress ring & tick gauge ---------- */
function ring(frac, { size = 64, sw = 6, color = 'var(--accent)', track = 'rgba(255,255,255,.1)', inner = '', delay = 0 } = {}) {
  const r = (size - sw) / 2;
  return `<div style="position:relative;width:${size}px;height:${size}px;flex:none"><svg class="ring-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)" aria-hidden="true">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${track}" stroke-width="${sw}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${sw}" stroke-linecap="round" data-ring="${frac}" data-delay="${delay}" style="stroke:${color};stroke-dasharray:${2 * Math.PI * r};stroke-dashoffset:${2 * Math.PI * r};filter:drop-shadow(0 0 6px ${color})"/></svg>
    <div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center">${inner}</div></div>`;
}
function gauge(frac, { w = 290, color = 'var(--accent)', label = 'Progresso' } = {}) {
  const cx = w / 2, cy = w / 2, R = w / 2 - 14, n = 46; let ticks = '';
  for (let i = 0; i <= n; i++) {
    const t = Math.PI + (i / n) * Math.PI; const on = i / n <= frac; const long = i % 5 === 0;
    const r1 = R - (long ? 18 : 12), r2 = R;
    ticks += `<line x1="${cx + Math.cos(t) * r1}" y1="${cy + Math.sin(t) * r1}" x2="${cx + Math.cos(t) * r2}" y2="${cy + Math.sin(t) * r2}" stroke-width="${long ? 2.4 : 1.6}" style="opacity:0;stroke:${on ? color : 'rgba(255,255,255,.18)'}" data-tick="${i}"/>`;
  }
  const t = Math.PI + frac * Math.PI;
  return `<div style="position:relative;width:${w}px;height:${w / 2 + 10}px;margin:0 auto"><svg class="tick-ring" width="${w}" height="${w / 2 + 10}" aria-hidden="true">${ticks}
    <circle cx="${cx + Math.cos(t) * (R + 6)}" cy="${cy + Math.sin(t) * (R + 6)}" r="4" fill="#fff" style="opacity:0" data-tick="${n + 1}"/></svg>
    <div style="position:absolute;left:0;right:0;bottom:4px;text-align:center"><div class="num" style="font-size:46px"><span data-count="${Math.round(frac * 100)}">0</span>%</div><div class="muted small">${label}</div></div></div>`;
}
function animateGauge(root) { $$('[data-tick]', root).forEach(l => A(l, [{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 250 + (+l.dataset.tick) * 18 })); }

/* ---------- Charts: smooth line with morphing periods + scrubbing ---------- */
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
function resample(vals, n) { const out = []; for (let i = 0; i < n; i++) { const t = i / (n - 1) * (vals.length - 1); const a = Math.floor(t), b = Math.min(vals.length - 1, a + 1); out.push(lerp(vals[a], vals[b], t - a)); } return out; }
function chartHTML(id) {
  return `<div class="chart" id="${id}"><svg viewBox="0 0 350 160" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="${id}-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.35"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></linearGradient></defs>
    ${[0, 1, 2, 3].map(i => `<line x1="0" x2="350" y1="${10 + i * 46}" y2="${10 + i * 46}" stroke="rgba(255,255,255,.06)" stroke-dasharray="3 5"/>`).join('')}
    <path class="area" fill="url(#${id}-g)"/><path class="line" fill="none" stroke-width="2.6" stroke-linecap="round" style="stroke:var(--accent);filter:drop-shadow(0 4px 10px color-mix(in oklab,var(--accent) 60%,transparent))"/>
    <line class="cursor" y1="0" y2="150" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 4" style="opacity:0"/></svg>
    <div class="cdot" style="position:absolute;width:14px;height:14px;margin:-7px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px color-mix(in oklab,var(--accent) 45%,transparent);opacity:0;transition:opacity .2s;pointer-events:none"></div>
    <div class="tip"></div></div>`;
}
function mountChart(el, series, { unit = '', labels = [], dec = 1, tipLabel = i => '', floor = false } = {}) {
  const svg = $('svg', el), line = $('.line', el), area = $('.area', el), cur = $('.cursor', el), dot = $('.cdot', el), tip = $('.tip', el);
  const N = 40, W = 350, H = 150; let shown = resample(series, N), vals = series;
  const range = () => { const mx = Math.max(...vals, 1) * 1.15; const lo = floor ? Math.min(...vals) * .85 : 0; return [lo, mx]; };
  const yOf = v => { const [lo, mx] = range(); return H - ((v - lo) / (mx - lo)) * (H - 10); };
  const geom = (arr) => arr.map((v, i) => [i / (arr.length - 1) * W, yOf(v)]);
  const draw = arr => { const p = geom(arr); const d = smoothPath(p); line.setAttribute('d', d); area.setAttribute('d', `${d} L${W},${H + 10} L0,${H + 10} Z`); };
  draw(shown);
  line.setAttribute('data-draw', '1500'); // initial draw handled by Motion.drawLines
  el._set = (next, nextLabels) => {
    const from = shown.slice(); const target = resample(next, N); vals = next; labels = nextLabels || labels;
    line.style.strokeDasharray = ''; line.style.strokeDashoffset = '';
    Motion.tween(0, 1, 700, t => { shown = from.map((v, i) => lerp(v, target[i], t)); draw(shown); }, t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  };
  const scrub = e => {
    const r = el.getBoundingClientRect(); const x = clamp((e.clientX - r.left) / r.width, 0, 1);
    const i = Math.round(x * (vals.length - 1));
    const px = i / (vals.length - 1) * r.width; const py = yOf(vals[i]) / 160 * r.height;
    cur.setAttribute('x1', i / (vals.length - 1) * W); cur.setAttribute('x2', i / (vals.length - 1) * W); cur.style.opacity = 1;
    dot.style.left = px + 'px'; dot.style.top = py + 'px'; dot.style.opacity = 1;
    tip.style.left = clamp(px, 50, r.width - 50) + 'px'; tip.style.top = py + 'px';
    tip.innerHTML = `${fmt(vals[i], vals[i] % 1 ? dec : 0)} ${unit}<small>${tipLabel(i, vals.length)}</small>`; el.classList.add('active');
  };
  const leave = () => { el.classList.remove('active'); cur.style.opacity = 0; dot.style.opacity = 0; };
  el.addEventListener('pointermove', scrub); el.addEventListener('pointerdown', scrub); el.addEventListener('pointerleave', leave); el.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') setTimeout(leave, 1200); });
}
const periodTip = p => (i, n) => p === 'W' ? ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][i] : p === 'M' ? `Semana ${i + 1}` : ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i];

/* ---------- Segmented control with sliding indicator ---------- */
function seg(opts, on, attr) { return `<div class="seg" role="tablist">${opts.map(([k, l]) => `<button role="tab" aria-selected="${k === on}" class="${k === on ? 'on' : ''}" data-${attr}="${k}">${l}</button>`).join('')}<span class="seg-ind"></span></div>`; }
function mountSeg(root, onChange) {
  const ind = $('.seg-ind', root);
  const place = (b, anim) => { const r = b.getBoundingClientRect(), pr = root.getBoundingClientRect(); const x = r.left - pr.left, w = r.width;
    if (anim) { const from = ind.getBoundingClientRect(); A(ind, [{ transform: `translateX(${from.left - pr.left}px)`, width: from.width + 'px' }, { transform: `translateX(${x}px)`, width: w + 'px' }], { spring: [210, 22] }); }
    ind.style.transform = `translateX(${x}px)`; ind.style.width = w + 'px'; ind.style.left = '0'; };
  requestAnimationFrame(() => place($('.on', root) || $('button', root), false));
  root.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.classList.contains('on')) return;
    $$('button', root).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); }); place(b, true); haptic(6); onChange && onChange(b); });
}

/* ---------- Minimal map with route ---------- */
const ROUTES = [
  'M70 400 C 70 330, 120 300, 150 260 S 200 170, 250 150 S 330 120, 320 200 S 270 300, 240 340 S 160 420, 70 400',
  'M40 420 C 90 380, 110 300, 170 290 S 260 260, 290 190 S 340 90, 300 70',
  'M60 380 C 120 400, 170 360, 200 300 S 260 230, 300 260 S 350 340, 300 380 S 200 430, 120 420',
];
function mapSVG(routeIdx = 0, { id = 'map', live = false, accent = 'var(--accent)', h = 500, top = 0, span = 1, light = false } = {}) {
  const RC = light ? '20,30,28' : '190,210,240';
  let roads = '';
  const rnd = (s => () => (s = (s * 9301 + 49297) % 233280) / 233280)(routeIdx + 7);
  for (let i = 0; i < Math.ceil(h / 34) + 1; i++) { const y = i * 34 + rnd() * 12; const major = i % 4 === 1; roads += `<path d="M-10 ${y} C 120 ${y + rnd() * 30 - 15}, 260 ${y + rnd() * 30 - 15}, 400 ${y + rnd() * 24 - 12}" stroke="rgba(${RC},${major ? (light ? .16 : .13) : (light ? .07 : .05)})" stroke-width="${major ? 3.2 : 1.2}"/>`; }
  for (let i = 0; i < 12; i++) { const x = i * 36 + rnd() * 14; const major = i % 4 === 2; roads += `<path d="M${x} -10 C ${x + rnd() * 30 - 15} ${h * .32}, ${x + rnd() * 40 - 20} ${h * .68}, ${x + rnd() * 24 - 12} ${h + 20}" stroke="rgba(${RC},${major ? (light ? .15 : .12) : (light ? .06 : .045)})" stroke-width="${major ? 3 : 1.1}"/>`; }
  const ky = h * span / 500; const r = ROUTES[routeIdx % ROUTES.length].replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${x} ${(top + (+y - 60) * ky).toFixed(1)}`);
  return `<svg viewBox="0 0 390 ${h}" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;overflow:hidden" aria-hidden="true" class="mapgrid">
    <rect width="390" height="${h}" fill="${light ? '#F1F3F2' : '#081326'}"/>
    <path d="M262 -10 C 236 120, 336 200, 306 300 S 362 460, 400 520 L 400 -10Z" fill="rgba(56,140,255,.09)"/>
    <path d="M262 -10 C 236 120, 336 200, 306 300 S 362 460, 400 520" stroke="rgba(120,180,255,.18)" stroke-width="1.2" fill="none"/>
    <rect x="28" y="118" width="96" height="74" rx="14" fill="rgba(163,255,18,.05)"/><rect x="150" y="380" width="70" height="56" rx="12" fill="rgba(163,255,18,.04)"/>
    ${roads}
    <path d="${r}" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="2 7" style="stroke:${light ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.28)'}"/>
    <path d="${r}" stroke-opacity=".22" stroke-width="14" fill="none" stroke-linecap="round" style="stroke:${accent};filter:blur(6px)" ${live ? `id="${id}-glow"` : ''}/>
    <path id="${id}-route" d="${r}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" ${live ? '' : 'data-draw="1800"'} style="stroke:${accent};filter:drop-shadow(0 0 6px ${accent})"/>
    <circle id="${id}-dot" r="8" fill="#fff" stroke-width="4" style="stroke:${accent};${live ? '' : 'opacity:0'}"/>
  </svg>`;
}

/* ---------- Product line-art ---------- */
function productArt(t) {
  const P = {
    shoe: '<path d="M10 58 C 14 44, 22 40, 30 40 L 44 34 L 52 44 C 62 48, 78 50, 88 56 C 92 60, 90 66, 84 66 L 14 66 C 10 66, 9 62, 10 58Z"/><path d="M10 60 H 90"/><path d="M38 40 l4 6 M44 37 l4 6 M50 40 l2 4"/>',
    shirt: '<path d="M34 18 L 22 24 L 12 38 L 22 44 L 28 38 V 82 H 72 V 38 L 78 44 L 88 38 L 78 24 L 66 18 C 62 26, 38 26, 34 18Z"/>',
    bottle: '<rect x="38" y="24" width="24" height="62" rx="8"/><rect x="42" y="14" width="16" height="10" rx="3"/><path d="M38 44 H 62 M38 66 H 62"/>',
    sock: '<path d="M40 14 H 60 V 56 C 60 66, 66 70, 74 72 C 82 74, 82 86, 72 86 H 50 C 40 86, 38 76, 40 66Z"/><path d="M40 24 H 60"/>',
    strap: '<path d="M30 20 V 70 C 30 80, 46 82, 50 72 L 54 60"/><path d="M70 20 V 70 C 70 80, 54 82, 50 72"/><rect x="26" y="14" width="48" height="10" rx="4"/>',
    belt: '<path d="M10 40 C 30 30, 70 30, 90 40 V 60 C 70 50, 30 50, 10 60Z"/><rect x="42" y="38" width="16" height="16" rx="3"/>',
    glove2: '<path d="M30 84 V 50 L 26 30 C 25 25, 32 23, 34 28 L 38 44 V 20 C 38 14, 46 14, 46 20 V 42 V 16 C 46 10, 54 10, 54 16 V 42 V 20 C 54 14, 62 14, 62 20 V 46 V 30 C 62 24, 70 24, 70 30 V 60 C 70 72, 64 84, 64 84Z"/>',
    helmet: '<path d="M14 62 C 14 34, 36 20, 56 20 C 76 20, 90 36, 88 56 L 76 62 Z"/><path d="M30 34 L 40 60 M48 24 L 54 60 M66 26 L 66 60"/><path d="M14 62 H 76"/>',
    glasses: '<path d="M10 44 H 90"/><path d="M14 44 C 14 60, 44 62, 46 46 M54 46 C 56 62, 86 60, 86 44"/>',
    bars: '<path d="M20 30 H 44 M56 30 H 80 M26 30 V 80 M38 30 V 80 M62 30 V 80 M74 30 V 80 M18 80 H 46 M54 80 H 82"/>',
    ringsP: '<path d="M34 10 V 46 M66 10 V 46"/><circle cx="34" cy="62" r="16"/><circle cx="66" cy="62" r="16"/>',
    band: '<path d="M16 50 C 16 30, 84 30, 84 50 C 84 70, 16 70, 16 50Z"/><path d="M24 50 C 24 38, 76 38, 76 50 C 76 62, 24 62, 24 50Z"/>',
    ballP: '<circle cx="50" cy="50" r="34"/><path d="M50 34 L 63 43 L 58 58 H 42 L 37 43Z M50 34 V 16 M63 43 L 80 38 M58 58 L 68 76 M42 58 L 32 76 M37 43 L 20 38"/>',
    guard: '<path d="M30 16 H 70 V 70 C 70 82, 30 82, 30 70Z"/><path d="M38 30 H 62 M38 44 H 62 M38 58 H 62"/>',
    goggles: '<ellipse cx="32" cy="50" rx="16" ry="12"/><ellipse cx="68" cy="50" rx="16" ry="12"/><path d="M48 50 H 52 M8 48 C 4 50, 4 54, 16 52 M92 48 C 96 50, 96 54, 84 52"/>',
    cap: '<path d="M14 64 C 14 34, 34 20, 50 20 C 66 20, 86 34, 86 64 Z"/><path d="M14 64 H 86"/>',
    paddle: '<path d="M30 20 H 70 C 78 20, 80 28, 80 36 V 70 C 80 82, 70 86, 50 86 C 30 86, 20 82, 20 70 V 36 C 20 28, 22 20, 30 20Z"/><circle cx="40" cy="44" r="3"/><circle cx="60" cy="44" r="3"/><circle cx="50" cy="62" r="3"/>',
    board: '<path d="M26 86 V 30 C 26 14, 74 14, 74 30 V 86Z"/>',
    boxglove: '<path d="M28 86 H 66 V 74 C 78 68, 84 58, 84 44 C 84 26, 70 14, 54 14 H 44 C 32 14, 24 22, 24 34 V 40 C 16 42, 16 56, 24 58 C 24 70, 28 74, 28 74Z"/><path d="M24 40 C 36 38, 48 42, 54 52 M28 74 H 66"/>',
    rope: '<path d="M22 20 V 40 M78 20 V 40"/><rect x="18" y="12" width="8" height="16" rx="3"/><rect x="74" y="12" width="8" height="16" rx="3"/><path d="M22 40 C 22 90, 78 90, 78 40"/>',
  };
  return `<svg class="art" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[t] || P.bottle}</svg>`;
}

/* ---------- Playlist cover ---------- */
function coverArt(title, sportId, bpm, i = 0, extra = '') {
  const sp = SPORTS[sportId]; const ang = [135, 200, 60][i % 3];
  return `<div class="cover" style="${extra}background:linear-gradient(${ang}deg, ${sp.c}, ${sp.c2} 55%, #050B16)">
    <svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%;opacity:.5" aria-hidden="true">${Array.from({ length: 6 }, (_, k) => `<circle cx="${[80, 20, 50][i % 3]}" cy="${[20, 80, 50][i % 3]}" r="${12 + k * 14}" fill="none" stroke="#fff" stroke-opacity="${.25 - k * .035}"/>`).join('')}</svg>
    ${title ? `<div style="position:absolute;left:12px;right:12px;bottom:10px"><div class="display" style="font-size:${extra ? 40 : 24}px;line-height:.9">${esc(title)}</div><div style="font-size:10.5px;opacity:.8;margin-top:4px">${bpm} BPM</div></div>` : `<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:10px;font-weight:700">${bpm}</div>`}</div>`;
}

/* ---------- Sport selector ---------- */
function sportChips(active, attr = 'sport', list = SPORT_IDS) {
  return `<div class="hscroll" role="tablist" aria-label="Modalidades">${list.map(id => { const s = SPORTS[id];
    return `<button class="chip ${id === active ? 'on' : ''}" role="tab" aria-selected="${id === active}" data-${attr}="${id}">${icon(s.icon, 16, 1.8)}${s.name}</button>`; }).join('')}</div>`;
}
function setAccent(id) { const s = id === 'brand' ? { c: '#E3192B', c2: '#9E0B14' } : SPORTS[id]; if (!s) return; setAccent.cur = id; const r = document.documentElement; r.style.setProperty('--accent', s.c); r.style.setProperty('--accent2', s.c2); }
const demoBadge = (t = 'Dados demonstrativos') => `<span class="demo-badge">${icon('spark', 12, 2)}${t}</span>`;
