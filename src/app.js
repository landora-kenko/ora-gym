/* ============================================================
   ORA GYM — navegação (abas no celular, barra lateral no PC),
   camadas, sessão e inicialização
   ============================================================ */
const TABS = [['home', 'Início', 'home'], ['social', 'Comunidade', 'users'], ['train', 'Treinar', 'bolt'], ['challenges', 'Desafios', 'trophy'], ['profile', 'Perfil', 'user']];
const isDesk = () => matchMedia('(min-width: 900px)').matches;

const Nav = {
  tab: 'home', stack: [], ready: false,
  init() {
    this.root = $('#app'); this.stage = $('.stage'); this.side = $('.sidenav');
    this.base = document.createElement('div'); this.base.className = 'layer base';
    this.base.innerHTML = `<div class="tabpane" id="pane"></div>
      <nav class="tabbar" aria-label="Navegação principal"><div class="glass-bg glass"></div><span class="tab-ind"></span>
      ${TABS.map(([id, l, ic]) => id === 'train'
        ? `<button class="tab-train" data-tab="train" aria-label="Treinar">${icon('bolt', 26, 2)}</button>`
        : `<button class="tab" data-tab="${id}" aria-label="${l}">${icon(ic, 23, 1.7)}<span>${l}</span></button>`).join('')}</nav>`;
    this.stage.appendChild(this.base);
    this.root.addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) { haptic(8); this.go(b.dataset.tab); } });
    this.edgeSwipe(); this.ready = true;
  },
  buildSide() {
    const me = API.me;
    this.side.innerHTML = `<div class="sn-brand">${brandLockup(26)}</div>
      <button class="btn btn-accent btn-block sn-cta" data-tab="train">${icon('bolt', 18, 2)}Treinar agora</button>
      <nav class="sn-nav" aria-label="Navegação principal">${TABS.map(([id, l, ic]) => `<button class="sn-item" data-tab="${id}">${icon(ic, 21, 1.8)}<span>${l}</span></button>`).join('')}
        <button class="sn-item" data-snotifs>${icon('bell', 21, 1.8)}<span>Notificações</span><span class="sn-badge" data-notif-count hidden></span></button></nav>
      <div class="sn-sports"><div class="kicker" style="margin:0 12px 8px">Seus espaços</div>${mySports().map(id => `<button class="sn-item sm" data-push="world" data-params='{"id":"${id}"}'><span class="sn-dot" style="background:${SPORTS[id].c}"></span><span>${SPORTS[id].name}</span></button>`).join('')}</div>
      <div style="flex:1"></div>
      <div class="sn-more">${[['shop', 'bag', 'Loja'], ['music', 'music', 'Música'], ['nutrition', 'leaf', 'Alimentação']].map(([s, ic, l]) => `<button class="sn-item sm" data-push="${s}" data-params='{"id":"${mySports()[0]}"}'>${icon(ic, 18)}<span>${l}</span></button>`).join('')}</div>
      <button class="sn-me" data-tab="profile">${meAv()}<div style="min-width:0;text-align:left"><div class="h3" style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(me.name)}</div><div class="muted small">@${esc(me.handle)}</div></div><span class="icon-btn" data-push="settings" aria-label="Configurações" style="margin-left:auto;width:36px;height:36px">${icon('settings', 18)}</span></button>`;
    hydrateImages(this.side); this.markSide();
    this.side.onclick = e => { if (e.target.closest('[data-snotifs]')) openNotifs(); };
  },
  markSide() { $$('.sn-item[data-tab]', this.side).forEach(b => { const on = b.dataset.tab === this.tab; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); }); },
  placeInd(anim) {
    const b = $(`.tab[data-tab="${this.tab}"]`, this.base); const ind = $('.tab-ind', this.base); const bar = $('.tabbar', this.base); if (!ind || !bar.offsetWidth) return;
    if (!b) { ind.style.opacity = 0; return; }
    const r = b.getBoundingClientRect(), br = bar.getBoundingClientRect(); const x = r.left - br.left + 4, w = r.width - 8; const to = `translateX(${x}px)`;
    if (anim) { const prev = ind.style.transform || to; A(ind, [{ transform: prev, width: ind.style.width || w + 'px', opacity: getComputedStyle(ind).opacity }, { transform: to, width: w + 'px', opacity: 1 }], { spring: [200, 20] }); }
    ind.style.transform = to; ind.style.width = w + 'px'; ind.style.left = '0'; ind.style.opacity = 1;
  },
  clear() { this.stack.forEach(l => { const sc = Screens[l.id]; sc.unmount && sc.unmount(l.el); l.el.remove(); }); this.stack = []; },
  go(tab, params = {}) {
    if (!Screens[tab]) tab = 'home';
    this.clear();
    this.base.getAnimations().forEach(a => a.cancel()); this.base.style.transform = ''; this.base.style.filter = ''; setAccent('brand');
    const prevIdx = TABS.findIndex(t => t[0] === this.tab), idx = TABS.findIndex(t => t[0] === tab);
    const dir = idx >= prevIdx ? 1 : -1; const pane = $('#pane');
    // só a tela visível (a última) sai com animação; restos de trocas rápidas saem na hora
    const kids = [...pane.children]; const old = kids.pop() || null; kids.forEach(k => { const sc0 = Screens[k.dataset.tab]; sc0 && sc0.unmount && sc0.unmount(k); k.remove(); });
    const same = tab === this.tab && !!old;
    this.tab = tab;
    $$('.tab', this.base).forEach(b => { const on = b.dataset.tab === tab; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
    this.placeInd(true); this.markSide();
    const el = document.createElement('div'); el.className = 'tabpane'; el.dataset.tab = tab;
    const sc = Screens[tab]; el.innerHTML = sc.render(params); pane.appendChild(el);
    if (old) {
      old.style.pointerEvents = 'none';
      const rm = () => { if (old.isConnected) { const sc0 = Screens[old.dataset.tab]; sc0 && sc0.unmount && sc0.unmount(old); old.remove(); } };
      old.dataset.leaving = '1'; old.setAttribute('aria-hidden', 'true');
      try { A(old, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * 40}px) scale(.98)` }], { duration: 260, easing: 'in' }).finished.then(rm, rm); } catch (e) { rm(); }
      setTimeout(rm, 450);
      if (!same) A(el, [{ opacity: 0, transform: `translateX(${dir * 50}px)` }, { opacity: 1, transform: 'none' }], { spring: [170, 22] });
    }
    sc.mount && sc.mount(el, params);
    Motion.enter(el, old ? 90 : 0);
    if (location.hash !== '#' + tab) history.replaceState(null, '', location.pathname + location.search + '#' + tab);
    document.title = `${TABS.find(t => t[0] === tab)[1]} · OraGym`;
  },
  refresh() { const el = $('#pane').lastElementChild; if (!el) return; const sc = Screens[this.tab]; const y = ($('.scroll', el) || {}).scrollTop || 0; el.innerHTML = sc.render({}); el._postsWired = false; sc.mount && sc.mount(el, {}); Motion.enter(el, 0, 30); const s2 = $('.scroll', el); if (s2) s2.scrollTop = y; if (this.side.innerHTML) this.buildSide(); },
  push(id, params = {}, opts = {}) {
    const sc = Screens[id]; if (!sc) return; const el = document.createElement('div'); el.className = 'layer'; el.dataset.screen = id;
    el.innerHTML = sc.render(params); this.stage.appendChild(el);
    const under = this.stack.length ? this.stack[this.stack.length - 1].el : this.base;
    const entry = { el, id, params, from: opts.from || null }; entry.accentSport = setAccent.cur || 'brand';
    this.stack.push(entry);
    sc.mount && sc.mount(el, params, entry);
    if (opts.from && !Motion.reduced) {
      const r = opts.from.getBoundingClientRect(), pr = this.stage.getBoundingClientRect();
      const ins = `inset(${r.top - pr.top}px ${pr.right - r.right}px ${pr.bottom - r.bottom}px ${r.left - pr.left}px round 26px)`; entry.inset = ins;
      A(el, [{ clipPath: ins }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], { spring: [150, 22], fill: 'none' });
      A(under, [{ transform: 'none', filter: 'brightness(1)' }, { transform: 'scale(.94)', filter: 'brightness(.55)' }], { duration: 520, easing: 'out' });
      Motion.enter(el, 160, 45);
    } else {
      A(el, [{ transform: 'translateX(100%)' }, { transform: 'none' }], { spring: [190, 25] });
      A(under, [{ transform: 'none', filter: 'brightness(1)' }, { transform: 'translateX(-28%)', filter: 'brightness(.55)' }], { spring: [190, 25] });
      Motion.enter(el, 140, 45);
    }
    entry.under = under;
    setTimeout(() => { const b = $('button', el); b && b.focus({ preventScroll: true }); }, 60);
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
    if (under === this.base) { const sc2 = Screens[this.tab]; sc2.onReturn && sc2.onReturn($('#pane').lastElementChild); }
    else { const top = this.stack[this.stack.length - 1]; const s3 = Screens[top.id]; s3.onReturn && s3.onReturn(top.el, top.params); }
  },
  edgeSwipe() {
    let x0 = null, layer = null, under = null, dx = 0;
    this.stage.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return; const pr = this.stage.getBoundingClientRect(); if (e.clientX - pr.left > 22 || !this.stack.length) return;
      const top = this.stack[this.stack.length - 1]; if (Screens[top.id].noSwipe) return;
      x0 = e.clientX; layer = top.el; under = top.under; dx = 0; layer.getAnimations().forEach(a => a.cancel()); under.getAnimations().forEach(a => a.finish());
    });
    window.addEventListener('pointermove', e => { if (x0 == null) return; dx = Math.max(0, e.clientX - x0); const w = this.stage.clientWidth;
      layer.style.transform = `translateX(${dx}px)`; layer.style.clipPath = ''; under.style.transform = `translateX(${-28 + dx / w * 28}%)`; under.style.filter = `brightness(${.55 + dx / w * .45})`; });
    window.addEventListener('pointerup', () => { if (x0 == null) return; x0 = null;
      if (dx > 110) { const e = this.stack[this.stack.length - 1]; e.inset = null; this.back(); }
      else { A(layer, [{ transform: `translateX(${dx}px)` }, { transform: 'none' }], { spring: [220, 24] }).finished.then(() => layer.style.transform = ''); under.style.transform = 'translateX(-28%)'; }
    });
  },
};

/* Cabeçalho que fica sólido ao rolar + parallax do herói */
function bindScrollFx(root, { bar, hero, threshold = 220 } = {}) {
  const sc = $('.scroll', root); if (!sc) return; let tick = false;
  const run = () => { tick = false; const y = sc.scrollTop;
    if (bar) bar.classList.toggle('solid', y > threshold);
    if (hero) { hero.style.transform = `translate3d(0,${y * .45}px,0) scale(${1 + Math.max(0, -y) / 600})`; hero.style.opacity = clamp(1 - y / 520, 0, 1); }
  };
  sc.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
}

/* Ações delegadas: data-back / data-push / data-gotab */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-back],[data-push],[data-gotab]'); if (!b || !Nav.ready || !$('#app').contains(b) || b.closest('.ob')) return;
  if (b.hasAttribute('data-back')) { haptic(6); Nav.back(); return; }
  if (b.dataset.gotab) { Nav.go(b.dataset.gotab); return; }
  if (b.dataset.push) { e.stopPropagation(); haptic(8); let p = {}; try { p = JSON.parse(b.dataset.params || '{}'); } catch (x) {} const sw = b.closest('.sheet-wrap'); if (sw) { const bd = $('.sheet-backdrop', sw); bd && bd.click(); } Nav.push(b.dataset.push, p, { from: b.hasAttribute('data-expand') ? b : null }); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && Nav.stack.length && !$('.sheet-wrap') && !$('.celebrate')) { const top = Nav.stack[Nav.stack.length - 1]; if (!Screens[top.id].noSwipe) Nav.back(); } });

function brandLockup(s = 28) { return `<img src="photos/brand/logo.png" alt="OraGym" style="height:${s}px;width:auto;display:block">`; }

/* ---------- Sessão ---------- */
function splash(text = '') {
  let s = $('.boot'); if (!s) { s = document.createElement('div'); s.className = 'boot'; $('#app').appendChild(s); }
  s.innerHTML = `<div style="text-align:center">${brandLockup(34)}<div class="spinner" style="margin:26px auto 0"></div>${text ? `<p class="muted small" style="margin-top:16px">${esc(text)}</p>` : ''}</div>`; return s;
}
const unsplash = () => { const s = $('.boot'); if (s) A(s, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).finished.then(() => s.remove()); };

function enterApp() {
  $$('.ob').forEach(o => { if (!o._leaving) { o._leaving = true; A(o, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }).finished.then(() => o.remove()); } });
  document.body.classList.add('authed'); Nav.buildSide();
  const h = location.hash.slice(1); Nav.go(TABS.some(t => t[0] === h) ? h : 'home');
  const inv = sessionStorage.getItem('oragym.invite'); if (inv) { sessionStorage.removeItem('oragym.invite'); setTimeout(() => Nav.push('challenge', { id: inv }), 400); }
  refreshNotifDot(); clearInterval(enterApp._iv); enterApp._iv = setInterval(() => document.visibilityState === 'visible' && refreshNotifDot(), 60000);
}
function leaveApp() { document.body.classList.remove('authed'); clearInterval(enterApp._iv); Nav.clear(); $('#pane').innerHTML = ''; Nav.side.innerHTML = ''; $$('.sheet-wrap,.celebrate').forEach(x => x.remove()); }

function setupNeeded(mode) {
  $('#app').innerHTML = `<div class="boot" style="padding:24px"><div style="max-width:520px;text-align:left">${brandLockup(30)}<h1 class="display" style="font-size:30px;margin:24px 0 10px">${mode === 'error' ? 'Não foi possível conectar' : 'Conecte o Firebase'}</h1>
    <p class="muted" style="line-height:1.6">${mode === 'error' ? 'Verifique sua conexão com a internet e recarregue a página.' : 'Este app ainda não tem as credenciais do projeto Firebase. Cole o objeto <code>firebaseConfig</code> do console do Firebase em <code>src/config.js</code>, gere o build e publique novamente.'}</p>
    <button class="btn btn-white" style="margin-top:18px" onclick="location.reload()">Recarregar</button></div></div>`;
}

(async function boot() {
  if (Store.get().reduced) Motion.setReduced(true);
  const q = new URLSearchParams(location.search); const inv = q.get('desafio'); if (inv) { sessionStorage.setItem('oragym.invite', inv); q.delete('desafio'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash); }
  splash();
  try { await Photos.load(); } catch (e) {}
  setAccent('brand');
  const mode = await API.init().catch(() => 'error');
  if (mode === 'unconfigured' || mode === 'error') return setupNeeded(mode);
  Nav.init();
  let first = true, seq = 0;
  API.auth.onChange(async u => {
    const my = ++seq;
    if (!u) { leaveApp(); unsplash(); startAuth(first); first = false; return; }
    splash();
    try { const me = await API.loadSession(u); if (my !== seq) return; unsplash(); first = false;
      if (me._new) startSetup(); else enterApp();
    } catch (x) { if (my !== seq) return; splash(errMsg(x)); const s = $('.boot'); s.insertAdjacentHTML('beforeend', `<div style="position:absolute;bottom:40px;left:0;right:0;text-align:center"><button class="btn btn-white btn-sm" onclick="location.reload()">Tentar de novo</button> <button class="btn btn-ghost btn-sm" id="boot-out">Sair</button></div>`); $('#boot-out').onclick = () => API.auth.signOut(); }
  });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => Nav.placeInd(false), 120); });
})();
