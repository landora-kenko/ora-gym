/* ============================================================
   ORA GYM — navegação, camadas, barra inferior e boot
   ============================================================ */

const TABS = [['home', 'Início', 'home'], ['social', 'Comunidade', 'users'], ['train', 'Treinar', 'bolt'], ['challenges', 'Desafios', 'trophy'], ['profile', 'Perfil', 'user']];

const Nav = {
  tab: 'home', stack: [],
  init() {
    this.phone = $('.phone'); this.stage = $('.stage');
    this.base = document.createElement('div'); this.base.className = 'layer base';
    this.base.innerHTML = `<div class="tabpane" id="pane"></div>
      <nav class="tabbar" aria-label="Navegação principal"><div class="glass-bg glass"></div><span class="tab-ind"></span>
      ${TABS.map(([id, l, ic]) => id === 'train'
        ? `<button class="tab-train" data-tab="train" aria-label="Treinar">${icon('bolt', 26, 2)}</button>`
        : `<button class="tab" data-tab="${id}" aria-label="${l}">${icon(ic, 23, 1.7)}<span>${l}</span></button>`).join('')}</nav>`;
    this.stage.appendChild(this.base);
    $('.tabbar', this.base).addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) { haptic(8); this.go(b.dataset.tab); } });
    this.edgeSwipe();
  },
  placeInd(anim) {
    const b = $(`.tab[data-tab="${this.tab}"]`, this.base); const ind = $('.tab-ind', this.base); const bar = $('.tabbar', this.base);
    if (!b) { A(ind, [{ opacity: 1 }, { opacity: 0, transform: ind.style.transform + ' scale(.6)' }], { duration: 250 }); return; }
    const r = b.getBoundingClientRect(), br = bar.getBoundingClientRect(); const x = r.left - br.left + 4, w = r.width - 8;
    const to = `translateX(${x}px)`;
    if (anim) { const prev = ind.style.transform || to; A(ind, [{ transform: prev, width: ind.style.width || w + 'px', opacity: getComputedStyle(ind).opacity }, { transform: to, width: w + 'px', opacity: 1 }], { spring: [200, 20] }); }
    ind.style.transform = to; ind.style.width = w + 'px'; ind.style.left = '0';
  },
  go(tab, params = {}) {
    // pop everything above base
    if (this.stack.length) { this.stack.forEach(l => l.el.remove()); this.stack = []; }
    this.base.getAnimations().forEach(a => a.cancel()); this.base.style.transform = ''; this.base.style.filter = ''; setAccent('brand');
    const prevIdx = TABS.findIndex(t => t[0] === this.tab), idx = TABS.findIndex(t => t[0] === tab);
    const dir = idx >= prevIdx ? 1 : -1; const same = tab === this.tab && $('#pane').children.length;
    this.tab = tab;
    $$('.tab', this.base).forEach(b => { const on = b.dataset.tab === tab; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
    this.placeInd(true);
    const pane = $('#pane'); const old = pane.firstElementChild;
    const el = document.createElement('div'); el.className = 'tabpane';
    const sc = Screens[tab]; el.innerHTML = sc.render(params); pane.appendChild(el);
    if (old) {
      A(old, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * 40}px) scale(.98)` }], { duration: 260, easing: 'in' }).finished.then(() => old.remove());
      if (!same) A(el, [{ opacity: 0, transform: `translateX(${dir * 50}px)` }, { opacity: 1, transform: 'none' }], { spring: [170, 22] });
    }
    sc.mount && sc.mount(el, params);
    Motion.enter(el, old ? 90 : 0);
    location.hash !== '#' + tab && history.replaceState(null, '', '#' + tab);
  },
  refresh() { const pane = $('#pane'); const el = pane.firstElementChild; if (!el) return; const sc = Screens[this.tab]; el.innerHTML = sc.render({}); sc.mount && sc.mount(el, {}); Motion.enter(el, 0, 30); },
  push(id, params = {}, opts = {}) {
    const sc = Screens[id]; const el = document.createElement('div'); el.className = 'layer'; el.dataset.screen = id;
    el.innerHTML = sc.render(params); this.stage.appendChild(el);
    const prevAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent');
    const under = this.stack.length ? this.stack[this.stack.length - 1].el : this.base;
    const entry = { el, id, params, from: opts.from || null, prevAccent: document.documentElement.style.getPropertyValue('--accent') ? Store.get().sport : null };
    entry.accentSport = setAccent.cur || 'brand';
    this.stack.push(entry);
    sc.mount && sc.mount(el, params, entry);
    if (opts.from && !Motion.reduced) {
      const r = opts.from.getBoundingClientRect(), pr = this.phone.getBoundingClientRect();
      const ins = `inset(${r.top - pr.top}px ${pr.right - r.right}px ${pr.bottom - r.bottom}px ${r.left - pr.left}px round 26px)`;
      entry.inset = ins;
      A(el, [{ clipPath: ins }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], { spring: [150, 22], fill: 'none' });
      A(under, [{ transform: 'none', filter: 'brightness(1)' }, { transform: 'scale(.94)', filter: 'brightness(.55)' }], { duration: 520, easing: 'out' });
      Motion.enter(el, 160, 45);
    } else {
      A(el, [{ transform: 'translateX(100%)' }, { transform: 'none' }], { spring: [190, 25] });
      A(under, [{ transform: 'none', filter: 'brightness(1)' }, { transform: 'translateX(-28%)', filter: 'brightness(.55)' }], { spring: [190, 25] });
      Motion.enter(el, 140, 45);
    }
    entry.under = under;
    if (sc.focusable !== false) setTimeout(() => { const b = $('button', el); b && b.focus({ preventScroll: true }); }, 60);
    return entry;
  },
  back() {
    const e = this.stack.pop(); if (!e) return;
    const sc = Screens[e.id]; sc.unmount && sc.unmount(e.el);
    const under = e.under;
    if (e.inset && e.from && document.body.contains(e.from) && !Motion.reduced) {
      A(e.el, [{ clipPath: 'inset(0px 0px 0px 0px round 0px)', opacity: 1 }, { clipPath: e.inset, opacity: .4 }], { duration: 420, easing: 'inout' }).finished.then(() => e.el.remove());
      A(under, [{ transform: 'scale(.94)', filter: 'brightness(.55)' }, { transform: 'none', filter: 'brightness(1)' }], { duration: 420, easing: 'out' });
    } else {
      const cur = e.el.style.transform || 'none';
      A(e.el, [{ transform: cur }, { transform: 'translateX(100%)' }], { duration: 330, easing: 'out' }).finished.then(() => e.el.remove());
      A(under, [{ transform: 'translateX(-28%)', filter: 'brightness(.55)' }, { transform: 'none', filter: 'brightness(1)' }], { duration: 380, easing: 'out' });
    }
    setAccent(e.accentSport || 'brand');
    if (under === this.base) { const sc2 = Screens[this.tab]; sc2.onReturn && sc2.onReturn($('#pane').firstElementChild); }
    else { const top = this.stack[this.stack.length - 1]; const s3 = Screens[top.id]; s3.onReturn && s3.onReturn(top.el, top.params); }
  },
  edgeSwipe() {
    let x0 = null, layer = null, under = null, dx = 0;
    this.stage.addEventListener('pointerdown', e => {
      const pr = this.phone.getBoundingClientRect(); if (e.clientX - pr.left > 22 || !this.stack.length) return;
      const top = this.stack[this.stack.length - 1]; if (Screens[top.id].noSwipe) return;
      x0 = e.clientX; layer = top.el; under = top.under; dx = 0; layer.getAnimations().forEach(a => a.cancel()); under.getAnimations().forEach(a => a.finish());
    });
    window.addEventListener('pointermove', e => { if (x0 == null) return; dx = Math.max(0, e.clientX - x0); const w = this.phone.clientWidth;
      layer.style.transform = `translateX(${dx}px)`; layer.style.clipPath = ''; under.style.transform = `translateX(${-28 + dx / w * 28}%)`; under.style.filter = `brightness(${.55 + dx / w * .45})`; });
    window.addEventListener('pointerup', () => { if (x0 == null) return; x0 = null;
      if (dx > 110) { const e = this.stack[this.stack.length - 1]; e.inset = null; this.back(); }
      else { A(layer, [{ transform: `translateX(${dx}px)` }, { transform: 'none' }], { spring: [220, 24] }).finished.then(() => layer.style.transform = ''); under.style.transform = 'translateX(-28%)'; }
    });
  },
};

/* Scroll-linked header + hero parallax (rAF-throttled, transform-only) */
function bindScrollFx(root, { bar, hero, threshold = 220 } = {}) {
  const sc = $('.scroll', root); if (!sc) return; let tick = false;
  const run = () => { tick = false; const y = sc.scrollTop;
    if (bar) bar.classList.toggle('solid', y > threshold);
    if (hero) { hero.style.transform = `translate3d(0,${y * .45}px,0) scale(${1 + Math.max(0, -y) / 600})`; hero.style.opacity = clamp(1 - y / 520, 0, 1); }
  };
  sc.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
}

/* Delegated "data-go" / "data-push" / "data-back" actions */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-back],[data-push],[data-gotab]'); if (!b || !$('.phone').contains(b)) return;
  if (b.hasAttribute('data-back')) { haptic(6); Nav.back(); return; }
  if (b.dataset.gotab) { Nav.go(b.dataset.gotab); return; }
  if (b.dataset.push) { haptic(8); let p = {}; try { p = JSON.parse(b.dataset.params || '{}'); } catch (x) {} Nav.push(b.dataset.push, p, { from: b.hasAttribute('data-expand') ? b : null }); }
});

/* ---------- Desktop presentation panel ---------- */
const FLOWS = [
  ['Cadastro e escolha de esportes', '5 telas', () => { Store.set({ onboarded: false }); startOnboarding(); }],
  ['Home personalizada', 'troque a modalidade', () => Nav.go('home')],
  ['Espaço Musculação', 'noite azul', () => { Nav.go('home'); setTimeout(() => Nav.push('world', { id: 'musculacao' }), 50); }],
  ['Musculação — treino ao vivo', 'séries, descanso, PR', () => { Nav.go('train'); setTimeout(() => Nav.push('liftLive', {}), 50); }],
  ['Espaço Corrida', 'run club claro', () => { Nav.go('home'); setTimeout(() => Nav.push('world', { id: 'corrida' }), 50); }],
  ['Espaço Ciclismo', 'vidro e laranja', () => { Nav.go('home'); setTimeout(() => Nav.push('world', { id: 'ciclismo' }), 50); }],
  ['Espaço Calistenia', 'preto neon', () => { Nav.go('home'); setTimeout(() => Nav.push('world', { id: 'calistenia' }), 50); }],
  ['Espaço Futebol · Natação · Boxe', 'dia de jogo, aqua, ringue', () => { Nav.go('home'); setTimeout(() => Nav.push('world', { id: 'futebol' }), 50); }],
  ['Corrida — ao vivo', 'mapa e rota', () => { Nav.go('train'); setTimeout(() => Nav.push('runLive', { id: 'corrida' }), 50); }],
  ['Comunidade', 'feed e stories', () => Nav.go('social')],
  ['Desafios e grupos', 'ranking animado', () => Nav.go('challenges')],
  ['Perfil do atleta', 'conquistas e privacidade', () => Nav.go('profile')],
  ['Shopping · Música · Nutrição', 'prévias navegáveis', () => { Nav.go('home'); setTimeout(() => Nav.push('shop', { id: Store.get().sport }), 50); }],
];
function buildDesk() {
  const L = $('#desk-left'), R = $('#desk-right');
  L.innerHTML = `<div class="brandmark">${brandLockup(34)}</div>
    <h1>Sete esportes.<br>Um só app.</h1>
    <p>Protótipo interativo de uma plataforma social multiesportiva: performance, comunidade, desafios, compras e música em uma experiência única.</p>
    <span class="pill-note"><span class="dot"></span>Dados demonstrativos — nenhuma integração real ativa</span>`;
  R.innerHTML = `<div class="kicker">Fluxos principais</div><div class="flowlist">${FLOWS.map((f, i) => `<button data-flow="${i}"><span>${f[0]}</span><small>${f[1]}</small></button>`).join('')}</div>
    <div class="toggle-row"><span>Reduzir movimento</span><button class="switch" role="switch" aria-checked="${Motion.reduced}" id="rm-toggle" aria-label="Reduzir movimento"></button></div>
    <button class="btn btn-ghost" id="desk-photos">${icon('image', 18)}Adicionar fotografias</button>`;
  R.addEventListener('click', e => { const b = e.target.closest('[data-flow]'); if (b) FLOWS[+b.dataset.flow][2](); });
  $('#rm-toggle').onclick = e => { const v = e.currentTarget.getAttribute('aria-checked') !== 'true'; e.currentTarget.setAttribute('aria-checked', v); Motion.setReduced(v); };
  $('#desk-photos').onclick = () => openPhotoSlots();
}
let _lm = 0;
function logoMark(s = 30) {
  return `<svg width="${s * 1.6}" height="${s}" viewBox="0 0 64 40" aria-hidden="true"><g fill="#E3192B"><path d="M30 6h22c6 0 9 4 7.5 9.5l-3 9.5c-1.7 5.5-6.6 9-12 9H22.5c-6 0-9-4-7.5-9.5l3-9.5C19.7 9.5 24.6 6 30 6zm2.4 7.5c-1.6 0-3 1-3.5 2.6l-1.9 6.4c-.5 1.5.6 2.9 2.2 2.9h13.4c1.6 0 3-1 3.5-2.6l1.9-6.4c.5-1.5-.6-2.9-2.2-2.9z"/><path d="M9 6h7.5l-6 9H3zM19.5 6H27l-6 9h-7.5z" opacity=".95"/></g></svg>`;
}
function brandLockup(s = 28) { return `<img src="photos/brand/logo.png" alt="OraGym" style="height:${s}px;width:auto;display:block">`; }

/* ---------- Boot ---------- */
(async function boot() {
  await Photos.load();
  setAccent('brand');
  Nav.init(); buildDesk();
  const h = location.hash.slice(1);
  const valid = TABS.map(t => t[0]);
  Nav.go(valid.includes(h) ? h : 'home');
  if (!Store.get().onboarded) startOnboarding(true);
  window.addEventListener('resize', () => Nav.placeInd(false));
})();
