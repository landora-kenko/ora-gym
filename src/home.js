/* ============================================================
   ORA GYM — Home ("Seus espaços") + espaços por esporte
   ============================================================ */
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };
const firstName = () => (Store.get().name || 'Atleta').split(' ')[0];
const mySports = () => { const s = Store.get().sports; return [...s, ...SPORT_IDS.filter(x => !s.includes(x))]; };
const nextSession = id => ({
  musculacao: ['Treino A — Peito & Tríceps', '5 exercícios · ~58 min', 'liftLive'], corrida: ['Corrida leve · 6 km', 'Zona 2 · pace alvo 5\'40"', 'runLive'],
  ciclismo: ['Pedal de base · 40 km', 'Cadência 85–90 rpm', 'runLive'], calistenia: ['Progressão de muscle-up', '6 blocos · ~40 min', 'genericLive'],
  futebol: ['Pelada de quinta', 'Quadra · 20h', 'genericLive'], natacao: ['Série técnica 1.500 m', 'Livre e costas', 'genericLive'], boxe: ['8 rounds de saco', '3 min · 1 min descanso', 'genericLive'],
}[id]);

/* ---------------- Home ---------------- */
Screens.home = {
  render() {
    const s = Store.get(); const mine = s.sports;
    const chs = CHALLENGES.filter(c => s.challengesJoined.includes(c.id)).concat(s.customChallenges || []);
    return `<div class="scroll" id="home-scroll"><div class="pad" style="padding-top:calc(var(--safe-top) + 6px)">
      <div class="between" data-e="0" data-ek="fade">${brandLockup(22)}<div class="row" style="gap:8px"><button class="icon-btn glass" aria-label="Notificações" id="home-bell" style="position:relative">${icon('bell', 20)}<span style="position:absolute;top:11px;right:12px;width:8px;height:8px;border-radius:50%;background:#E3192B;box-shadow:0 0 0 2px #1A1A1A"></span></button>${Photos.url('avatar') ? `<img src="${Photos.url('avatar')}" alt="" class="av" style="width:46px;height:46px;object-fit:cover">` : meAv()}</div></div>
      <div class="kicker" style="margin-top:26px" data-e="1">${greet()}</div>
      <h1 class="display home-title" style="font-size:40px;margin:8px 0 6px">${esc(firstName())}, bora pra cima?</h1>
      <p class="muted" style="margin:0" data-e="3">Hoje: <b style="color:#fff">${nextSession(mine[0])[0]}</b></p>
      <div class="wsec" data-e="4"><h2>Seus espaços</h2><button class="link" id="home-edit">Editar</button></div></div>
      <div class="hscroll" style="padding:0 20px 8px;margin:0;gap:14px" data-e="5">${mine.map(id => spaceCard(id)).join('')}
        <button class="space-add press" id="home-add">${icon('plus', 26, 2)}<span class="small" style="text-align:center">Adicionar<br>esporte</span></button></div>
      <div class="pad">
      <div class="wsec" data-e="6"><h2>Sua semana</h2><span class="muted small">${mine.length} ${mine.length > 1 ? 'esportes' : 'esporte'}</span></div>
      <div class="card" data-e="7"><div class="row" style="justify-content:space-around;flex-wrap:wrap;gap:14px">${mine.slice(0, 4).map((id, i) => { const sp = SPORTS[id]; return `<div style="text-align:center"><div style="position:relative">${ring(sp.goal.p, { size: 64, sw: 6, color: sp.c, delay: i * 120, inner: `<span style="color:${sp.c}">${icon(sp.icon, 20)}</span>` })}</div><div class="small" style="margin-top:8px;font-weight:600">${sp.short}</div><div class="muted" style="font-size:11px">${Math.round(sp.goal.p * 100)}% da meta</div></div>`; }).join('')}</div></div>
      <div class="wsec" data-e="8"><h2>Desafios ativos</h2><button class="link" data-gotab="challenges">Ver todos</button></div>
      <div class="hscroll" data-e="9">${chs.map(c => challengeCard(c, 'w')).join('')}</div>
      <div class="wsec" data-e="10"><h2>Amigos em movimento</h2><button class="link" data-gotab="social">Feed</button></div>
      <div class="stack" data-e="11">${FEED.slice(0, 3).map(p => `<div class="list-item"><img src="${photo(p.sport, 1, true)}" alt="" style="width:48px;height:48px;border-radius:14px;object-fit:cover;flex:none"><div style="flex:1;min-width:0"><div class="h3" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${PEOPLE[p.who].n.split(' ')[0]} · ${p.title}</div><div class="muted small" style="margin-top:3px">${p.stats.slice(0, 2).map(s => s[1]).join(' · ')} · ${p.t}</div></div>${av(p.who, 'sm')}</div>`).join('')}</div>
      <div style="margin-top:22px;text-align:center">${demoBadge()}</div><div class="bottom-space"></div></div></div>`;
  },
  mount(el) {
    Motion.kinetic($('.home-title', el), 200);
    $('#home-bell', el).onclick = () => openNotifications();
    el.addEventListener('click', e => { if (e.target.closest('#home-add') || e.target.closest('#home-edit')) editSportsSheet(); });
  },
  onReturn() { Nav.refresh(); },
};
function spaceCard(id) {
  const sp = SPORTS[id]; const s0 = sp.stats[0];
  return `<button class="space-card press" data-push="world" data-params='{"id":"${id}"}' data-expand aria-label="Abrir espaço ${sp.name}">
    <img src="${photo(id, 0)}" alt="" style="object-position:${PHOTO_POS[PH[id][0]] || 'center'}"><span class="sc-fade"></span>
    <span class="sc-top"><span class="tag" style="color:${sp.c};background:rgba(0,0,0,.5)">${icon(sp.icon, 13, 2)}${sp.short}</span><span class="tag">${Math.round(sp.goal.p * 100)}%</span></span>
    <span class="sc-bot"><span class="display" style="display:block;font-size:30px">${sp.name}</span>
      <span class="between" style="margin-top:10px"><span><span class="num" style="font-size:22px">${s0.fmt === 'pace' ? paceStr(s0.v) : fmt(s0.v, s0.d)}</span><span class="small" style="opacity:.75"> ${s0.u} · ${s0.k.toLowerCase()}</span></span><span class="go">${icon('arrow', 20, 2.2)}</span></span></span></button>`;
}
function challengeCard(c, size = 'w') {
  const sp = SPORTS[c.sport]; const p = clamp(c.mine / c.target, 0, 1); const pos = (c.rank || []).findIndex(r => r[0] === 'me') + 1;
  return `<button class="card press" style="width:${size === 'w' ? '280px' : '100%'};text-align:left;padding:0;min-height:170px" data-push="challenge" data-params='{"id":"${c.id}"}' data-expand>
    <img src="${photo(c.sport, 1, true)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55">
    <span style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,11,11,.95) 30%,rgba(11,11,11,.5))"></span>
    <div style="position:relative;padding:18px"><div class="between"><span class="tag" style="color:${sp.c}">${icon(sp.icon, 13, 2)}${sp.name}</span><span class="muted small">${c.days} dias</span></div>
    <div class="h2" style="margin:14px 0 4px">${esc(c.name)}</div><div class="muted small">${esc(c.group || c.kind)}</div>
    <div class="between" style="margin-top:14px;align-items:flex-end"><div class="num" style="font-size:24px">${fmt(c.mine, c.mine % 1 ? 1 : 0)}<span style="font-size:12px;color:var(--mute)"> / ${fmt(c.target)} ${c.unit}</span></div>${pos ? `<span class="tag neon">#${pos}</span>` : ''}</div>
    <div class="bar" style="margin-top:10px"><i data-bar="${p}" style="transform:scaleX(0);background:${sp.c};box-shadow:none"></i></div></div></button>`;
}

/* ---------------- World shell: switcher + per-sport design ---------------- */
Screens.world = {
  render({ id }) { return worldShell(id); },
  mount(el, { id }) { mountWorld(el, id); },
  onReturn(el, p) { },
};
Screens.sport = Screens.world;

function worldShell(id) {
  const sp = SPORTS[id]; setAccent(id); const mine = Store.get().sports.includes(id) ? Store.get().sports : [id, ...Store.get().sports];
  const ns = nextSession(id);
  return `<div class="world w-${id}" data-world="${id}">
    <div class="wtop"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button>
      <div class="wswitch glass" role="tablist" aria-label="Seus espaços">${mine.map(s => `<button class="wsw ${s === id ? 'on' : ''}" role="tab" aria-selected="${s === id}" data-wsw="${s}"><img src="${photo(s, 0, true)}" alt=""><span>${SPORTS[s].name}</span></button>`).join('')}</div></div>
    <div class="scroll wscroll">${WORLD[id](sp)}${worldExtras(id)}</div>
    <div class="wcta">${WCTA[id] ? WCTA[id](ns) : `<button class="btn btn-accent" data-push="${ns[2]}" data-params='{"id":"${id}"}'>${icon('play', 18)}Iniciar ${sp.short.toLowerCase()}</button>`}</div></div>`;
}
function mountWorld(el, id) {
  const w = $('.world', el) || el; const sp = SPORTS[id];
  $$('.w-title', w).forEach((t, i) => Motion.kinetic(t, 220 + i * 120));
  const sc = $('.wscroll', w); const top = $('.wtop', w); const hero = $('.w-hero .hero-stack', w);
  sc.addEventListener('scroll', () => { requestAnimationFrame(() => { const y = sc.scrollTop; top.classList.toggle('solid', y > 300); if (hero) hero.style.transform = `translate3d(0,${y * .4}px,0) scale(${1 + y / 3000})`; }); }, { passive: true });
  const ch = $('.w-chart', w);
  if (ch) { const ax = $('.w-axis', w); const setAx = p => ax && (ax.innerHTML = (p === 'M' ? ['S1', '', '', 'S4', '', '', 'S7', '', '', 'S10', '', 'S12'] : AXES[p]).map(x => `<span>${x}</span>`).join(''));
    mountChart(ch, sp.metric.M, { unit: sp.metric.u, tipLabel: periodTip('M') }); setAx('M');
    const sg = $('.w-seg .seg', w); sg && mountSeg(sg, b => { const p = b.dataset.per; ch._set(sp.metric[p]); setAx(p); }); }
  const g = $('.w-gauge', w); if (g) setTimeout(() => animateGauge(g), 200);
  const sw = $('.wswitch', w); const on = $('.wsw.on', sw); on && setTimeout(() => on.scrollIntoView({ inline: 'center', block: 'nearest' }), 30);
  sw.addEventListener('click', e => { const b = e.target.closest('[data-wsw]'); if (!b || b.classList.contains('on')) return; switchWorld(el, b.dataset.wsw, b); });
  w.addEventListener('click', e => { const f = e.target.closest('[data-social-filter]'); if (f) { socialFilter = f.dataset.socialFilter; Nav.go('social'); }
    const h = e.target.closest('[data-history]'); if (h) historySheet(id); const t = e.target.closest('[data-wtoast]'); if (t) toast(t.dataset.wtoast, 'spark'); });
  wirePosts(w); wireProducts(w);
  (WMOUNT[id] || (() => {}))(w);
  Motion.drawLines(w);
}
function switchWorld(layer, id, btn) {
  haptic(10); const old = $('.world', layer); const r = btn.getBoundingClientRect(), pr = $('.phone').getBoundingClientRect();
  const cx = r.left - pr.left + r.width / 2, cy = r.top - pr.top + r.height / 2;
  const tmp = document.createElement('div'); tmp.innerHTML = worldShell(id); const nw = tmp.firstElementChild; layer.appendChild(nw);
  const entry = Nav.stack.find(s => s.el === layer); if (entry) entry.params = { id };
  A(nw, [{ clipPath: `circle(20px at ${cx}px ${cy}px)` }, { clipPath: `circle(1200px at ${cx}px ${cy}px)` }], { duration: 760, easing: 'cubic-bezier(.7,0,.2,1)' });
  A(old, [{ transform: 'scale(1)', filter: 'brightness(1)' }, { transform: 'scale(.94)', filter: 'brightness(.4)' }], { duration: 760, easing: 'cubic-bezier(.7,0,.2,1)' }).finished.then(() => old.remove());
  const hero = $('.w-hero .hero-stack', nw); hero && A(hero, [{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 1400, easing: 'out' });
  mountWorld(nw, id); Motion.enter(nw, 260, 45);
}

/* ---------- Shared bottom sections inside a world ---------- */
function worldExtras(id) {
  const sp = SPORTS[id]; const chs = CHALLENGES.filter(c => c.sport === id); const post = FEED.find(p => p.sport === id);
  return `<div class="pad">
    ${chs.length ? `<div class="wsec"><h2>Desafios de ${sp.name.toLowerCase()}</h2></div><div class="hscroll">${chs.map(c => challengeCard(c)).join('')}</div>` : ''}
    ${post ? `<div class="wsec"><h2>Comunidade</h2><button class="link" data-social-filter="${id}">Ver feed</button></div>${postCard(post, true)}` : ''}
    <div class="wsec"><h2>Equipamentos</h2><button class="link" data-push="shop" data-params='{"id":"${id}"}'>Loja</button></div>
    <div class="hscroll">${PRODUCTS[id].map((p, i) => productCard(p, id, i)).join('')}</div>
    <div class="wsec"><h2>Playlists</h2><button class="link" data-push="music" data-params='{"id":"${id}"}'>Música</button></div>
    <div class="hscroll">${PLAYLISTS[id].map((p, i) => `<button style="width:150px;text-align:left" class="press" data-push="music" data-params='{"id":"${id}"}'>${coverArt(p[0], id, p[2], i)}<div class="small wmute" style="margin-top:8px">${p[1]}</div></button>`).join('')}</div>
    <div style="margin-top:26px;text-align:center">${demoBadge()}</div><div style="height:40px"></div></div>`;
}
const chartCard = (cls = 'card', extra = '') => `<div class="${cls}" style="${extra}"><div class="w-seg" style="margin-bottom:16px">${seg([['W', 'Semana'], ['M', '12 semanas'], ['Y', 'Ano']], 'M', 'per')}</div>${chartHTML('wch' + Math.random().toString(36).slice(2, 7)).replace('class="chart"', 'class="chart w-chart"')}<div class="axis w-axis"></div></div>`;

const WCTA = {
  corrida: ns => `<button class="btn" style="background:#0E1412;color:#fff;box-shadow:0 14px 30px -12px rgba(0,0,0,.5)" data-push="runLive" data-params='{"id":"corrida"}'>Iniciar corrida</button>`,
  calistenia: ns => `<button class="btn" style="background:linear-gradient(90deg,#A3FF12,#1FCB6B);color:#06140A" data-push="genericLive" data-params='{"id":"calistenia","p":0}'>${icon('bolt', 18, 2)}Começar progressão</button>`,
  futebol: ns => `<button class="btn" style="background:#FFC23D;color:#1A1200" data-push="genericLive" data-params='{"id":"futebol","p":0}'>${icon('ball', 18, 2)}Registrar partida</button>`,
  natacao: ns => `<button class="btn" style="background:#0A2C57;color:#fff;border:1px solid rgba(255,255,255,.25)" data-push="genericLive" data-params='{"id":"natacao","p":0}'>${icon('swim', 18, 2)}Iniciar série</button>`,
  boxe: ns => `<button class="btn" style="background:#FF3B4E;color:#fff;box-shadow:0 14px 34px -10px #FF3B4E" data-push="genericLive" data-params='{"id":"boxe","p":0}'>${icon('glove', 18, 2)}Iniciar rounds</button>`,
  ciclismo: ns => `<button class="btn" style="background:#FF7426;color:#fff;box-shadow:0 14px 34px -10px #FF7426" data-push="runLive" data-params='{"id":"ciclismo"}'>${icon('bike', 18, 2)}Começar pedal</button>`,
  musculacao: ns => `<button class="btn btn-white" data-push="liftLive" data-params='{}' style="justify-content:flex-start;padding-left:28px">Começar treino A<span class="knob" style="background:#0B0B0B">${icon('arrow', 20, 2)}</span></button>`,
};
const WMOUNT = {};

/* ================= 1. Musculação — noite azul (ref. FitPulse) ================= */
const WORLD = {};
WORLD.musculacao = sp => `
  <div class="w-hero" style="height:560px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('musculacao', 'musculacao', { eager: true, fade: 'background:linear-gradient(180deg,rgba(6,20,38,.6),transparent 25%,transparent 50%,rgba(6,20,38,.85) 80%,#061426)', grade: true })}</div>
    <div style="position:absolute;left:20px;top:calc(var(--safe-top) + 70px)"><h1 class="w-title" style="font-family:var(--display);font-weight:600;font-size:30px;line-height:1.1;margin:0;letter-spacing:-.02em">Olá, ${esc(firstName())},</h1><div style="font-family:var(--display);font-weight:300;font-size:28px;letter-spacing:-.02em" data-e="1">Bem-vindo de volta!</div></div>
    <div style="position:absolute;left:16px;right:16px;bottom:10px">
      <div class="h2" style="font-size:20px;margin-bottom:12px" data-e="2">Minha saúde</div>
      <div class="fp-card row" style="gap:0;padding:14px" data-e="3"><div style="flex:1"><div class="h3" style="margin-bottom:12px">Estatísticas da semana</div><div class="row" style="gap:10px">${['route', 'timer', 'flame', 'medal'].map(i => `<span class="fp-ic">${icon(i, 19)}</span>`).join('')}</div></div>
        <span style="width:1px;align-self:stretch;background:rgba(255,255,255,.15);margin:0 14px"></span><button class="row" style="flex-direction:column;gap:6px;font-size:11px;text-align:center" data-push="workout" data-params='{"f":"A"}'><span class="fp-ic">${icon('plus', 20)}</span>Novo<br>treino</button></div></div></div>
  <div class="pad">
    <div class="wsec" data-e="4"><h2>Treino ativo</h2></div>
    <button class="fp-card press" style="width:100%;text-align:left;display:grid;grid-template-columns:1.2fr auto auto;gap:12px;align-items:center" data-push="workout" data-params='{"f":"A"}' data-e="5">
      <div><div class="h2" style="font-size:20px;line-height:1.15">Força<br>Peito & Tríceps</div><div style="height:1px;background:rgba(255,255,255,.15);margin:12px 0"></div><div class="wmute small">Calorias</div><div class="num" style="font-size:18px">450 kcal</div></div>
      <div class="stack" style="gap:8px;align-items:center"><span class="fp-pill">Sequência<b style="font-size:13px">5 dias</b></span><span class="fp-ic">${icon('flame', 18)}</span></div>
      <div class="stack" style="gap:8px;align-items:center">${ring(.75, { size: 70, sw: 6, color: '#4C8DFF', inner: `<span style="font-size:10px;line-height:1.2">Progresso<br><b style="font-size:13px">75%</b></span>` })}<span class="fp-pill"><span><span class="dot" style="display:inline-block;width:6px;height:6px"></span> Treinos</span><b style="font-size:13px">12/16</b></span></div></button>
    <div class="wsec" data-e="6"><h2>Hoje</h2></div>
    <div class="fp-card" data-e="7"><div style="text-align:center" class="h2">Treino de força</div>
      <div class="row" style="justify-content:center;gap:10px;margin:12px 0">${['route', 'timer', 'flame', 'medal'].map(i => `<span class="fp-ic">${icon(i, 18)}</span>`).join('')}</div>
      <div class="between"><div><div class="h3">Registro</div><span class="tag" style="margin-top:6px;background:#000"><span class="dot"></span>Modo automático</span></div><button class="fp-ic" aria-label="Expandir" data-push="exercise" data-params='{"i":0}'>${icon('expand', 18)}</button></div>
      <div class="w-gauge" style="margin:8px 0">${gauge(.75, { w: 290, color: '#7FB2FF', label: 'Progresso' })}</div>
      ${[['timer', 'Duração', '60:25', 'min'], ['flame', 'Volume', '18,4', 't']].map(r => `<div class="between" style="padding:12px 0;border-top:1px solid rgba(255,255,255,.1)"><div class="row"><span class="fp-ic">${icon(r[0], 18)}</span><span>${r[1]}</span></div><div style="text-align:right"><div class="num" style="font-size:18px">${r[2]}</div><div class="wmute" style="font-size:11px">${r[3]}</div></div></div>`).join('')}</div>
    <div class="fp-card between" style="margin-top:12px;border-radius:999px;padding:10px 18px" data-e="8"><div class="row"><button class="switch" role="switch" aria-checked="true" aria-label="Registro inteligente" onclick="this.setAttribute('aria-checked',this.getAttribute('aria-checked')!=='true')"></button><span>Ativo</span></div><span>Registro inteligente</span></div>
    <div class="wsec"><h2>Suas fichas</h2><button class="link" data-history>Histórico</button></div>
    <div class="stack">${FICHAS.map(f => `<button class="fp-card press row" style="text-align:left;padding:12px" data-push="workout" data-params='{"f":"${f.id}"}'><span class="fp-ic" style="width:46px;height:46px;font-family:var(--display);font-weight:700;font-size:18px">${f.id}</span><div style="flex:1"><div class="h3">${f.sub}</div><div class="wmute small">${f.ex} exercícios · ${f.min} min · ${f.last}</div></div>${icon('next', 18)}</button>`).join('')}</div>
    <div class="wsec"><h2>Evolução de volume</h2></div>${chartCard('fp-card')}
    <div class="wsec"><h2>Recordes</h2></div><div class="fp-card stack" style="gap:12px">${sp.records.map(r => `<div class="between"><div class="row"><span class="fp-ic" style="color:#7FB2FF">${icon('medal', 18)}</span>${r.k}</div><div style="text-align:right"><div class="num" style="font-size:17px">${r.v}</div><div class="wmute" style="font-size:11px">${r.d}</div></div></div>`).join('')}</div>
  </div>`;

/* ================= 2. Corrida — run club claro (ref. Nike Run Club) ================= */
WORLD.corrida = sp => `
  <div class="w-hero" style="height:700px;border-radius:0 0 36px 36px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('corrida', 'corrida', { eager: true, filter: 'grayscale(.55) contrast(1.02) brightness(1.18)', grade: false, fade: 'background:linear-gradient(180deg,rgba(64,104,98,.5),rgba(80,122,116,.18) 35%,rgba(56,92,86,.3) 70%,rgba(36,64,60,.85))' })}</div>
    <div style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 74px)">
      <h1 class="w-title" style="font-family:var(--display);font-weight:700;font-size:40px;line-height:1;margin:0;color:#fff;letter-spacing:-.04em">Cada corrida</h1>
      <h1 class="w-title" style="font-family:var(--display);font-weight:700;font-size:40px;line-height:1;margin:0;color:rgba(255,255,255,.55);letter-spacing:-.04em">conta sua história.</h1>
      <div class="row" style="gap:8px;margin-top:18px;overflow-x:auto;scrollbar-width:none" data-e="2"><button class="nrc-chip on" data-push="runLive" data-params='{"id":"corrida"}'>Iniciar corrida</button><button class="nrc-chip" data-wtoast="Corridas guiadas: prévia">Corridas guiadas</button><button class="nrc-chip" data-wtoast="Aquecimento guiado: prévia">Aquecimento</button></div></div>
    <div style="position:absolute;left:16px;right:16px;bottom:22px" class="grid2" data-e="3">
      <div class="nrc-glass"><div class="small" style="opacity:.85">${icon('timer', 14, 2, 'style="display:inline;vertical-align:-2px"')} Tempo na zona</div><div style="position:relative;height:18px;margin:14px 0 8px"><div style="position:absolute;top:8px;left:0;right:0;height:2px;background:linear-gradient(90deg,rgba(255,255,255,.2),#fff)"></div><div style="position:absolute;top:2px;right:14%;width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:9px solid #fff"></div></div><div class="num" style="font-size:22px">92%</div></div>
      <div class="nrc-glass"><div class="small" style="opacity:.85">${icon('route', 14, 2, 'style="display:inline;vertical-align:-2px"')} Distância total</div><div style="display:flex;gap:3px;height:18px;align-items:flex-end;margin:14px 0 8px">${Array.from({ length: 22 }, (_, i) => `<i style="flex:1;height:${i % 5 === 0 ? 18 : 10}px;background:rgba(255,255,255,${i < 16 ? .9 : .35})"></i>`).join('')}</div><div class="num" style="font-size:22px">28,6 <span style="font-size:13px;opacity:.8">km</span></div></div></div></div>
  <div class="pad" style="padding-top:22px">
    <div class="between" data-e="4"><div><div class="muted small">Hoje · 6:34</div><div style="font-family:var(--display);font-weight:700;font-size:26px;letter-spacing:-.03em;margin-top:4px">Semana 3 — Corrida leve</div></div><button class="icon-btn" style="background:#fff" aria-label="Editar plano" data-wtoast="Plano de treino: prévia">${icon('edit', 18)}</button></div>
    <div class="grid2" style="margin-top:16px" data-e="5">${[['speed', 'Pace médio', `5'07"`], ['mountain', 'Elevação', '86 m'], ['clock', 'Tempo', '30:48'], ['heartbeat', 'Cadência', '172']].map(c => `<div class="nrc-card"><div class="row small muted" style="gap:8px">${icon(c[0], 16)}${c[1]}</div><div class="num" style="font-size:30px;margin-top:14px;color:#0E1412">${c[2]}</div></div>`).join('')}</div>
    <div class="nrc-card" style="padding:0;overflow:hidden;margin-top:12px;height:280px;position:relative" data-e="6">${mapSVG(0, { id: 'nrcmap', accent: '#0E1412', light: true, h: 500 })}
      ${[['Parque da orla', 18, 16], ['1 km', 60, 64], ['3 km', 10, 70], ['5 km', 70, 22]].map(l => `<span style="position:absolute;left:${l[2]}%;top:${l[1]}%;background:#fff;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.12)">${l[0]}</span>`).join('')}</div>
    <div class="wsec"><h2>Pace por km</h2><span class="muted small">última corrida</span></div>
    <div class="nrc-card stack" style="gap:10px">${[5.32, 5.18, 5.1, 5.05, 4.96].map((v, i) => `<div class="row" style="gap:12px"><span class="muted small" style="width:34px">km ${i + 1}</span><div style="flex:1;height:8px;border-radius:8px;background:#EEF1F0;overflow:hidden"><i data-bar="${(5.6 - v) / .8}" data-delay="${i * 90}" style="display:block;height:100%;background:#0E1412;border-radius:8px;transform-origin:left;transform:scaleX(0)"></i></div><span class="num" style="font-size:15px;width:44px;text-align:right">${paceStr(v)}</span></div>`).join('')}</div>
    <div class="wsec"><h2>Distância</h2></div>${chartCard('nrc-card')}
    <div class="wsec"><h2>Recordes</h2></div><div class="stack">${sp.records.map(r => `<div class="list-item"><span class="ico">${icon('medal', 20)}</span><div style="flex:1"><div class="h3">${r.k}</div><div class="muted small">${r.d}</div></div><span class="num" style="font-size:18px">${r.v}</span></div>`).join('')}</div>
  </div>`;

/* ================= 3. Ciclismo — vidro e laranja (ref. azul/laranja) ================= */
WORLD.ciclismo = sp => `
  <div class="w-hero" style="height:600px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('ciclismo', 'ciclismo', { eager: true, grade: false, fade: 'background:linear-gradient(180deg,rgba(30,50,72,.6),transparent 30%,transparent 55%,rgba(30,50,72,.95))' })}</div>
    <div style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 76px)"><h1 class="w-title" style="font-family:var(--display);font-weight:700;font-size:40px;line-height:1.05;margin:0;letter-spacing:-.04em">Pedale forte</h1><div data-e="1" style="font-family:var(--display);font-weight:700;font-size:40px;line-height:1.1;letter-spacing:-.04em">Vá <span class="ax-hl">longe</span></div></div>
    <div style="position:absolute;right:16px;top:340px" class="row" data-e="2"><span style="width:10px;height:10px;border-radius:50%;background:#FF7426;box-shadow:0 0 0 4px rgba(255,116,38,.3)"></span><span style="width:50px;border-top:2px dashed rgba(255,255,255,.6)"></span><span class="ax-pill">${icon('heartbeat', 16)}<b>148</b> bpm</span></div>
    <div style="position:absolute;left:12px;right:12px;bottom:14px" class="ax-card" data-e="3"><div class="row" style="gap:8px;flex-wrap:wrap">${[['flame', 'Potência'], ['speed', 'Cadência'], ['mountain', 'Subidas']].map(c => `<span class="ax-pill">${icon(c[0], 15)}${c[1]}</span>`).join('')}</div>
      <div class="row" style="margin-top:14px;gap:10px"><span class="wmute small" style="flex:1">Plano de hoje: base aeróbica, 40 km em zona 2</span><button class="icon-btn" style="background:radial-gradient(circle at 35% 30%,#FFB07A,#FF7426);color:#fff" aria-label="Iniciar" data-push="runLive" data-params='{"id":"ciclismo"}'>${icon('arrow', 20, 2)}</button></div></div></div>
  <div class="pad">
    <div class="ax-card" style="margin-top:18px" data-e="4"><div class="row"><span class="fp-ic">${icon('chart', 18)}</span><div><div class="h3">Atividade diária</div><div class="wmute small">Continue pedalando todo dia.</div></div></div>
      <div style="position:relative;width:260px;height:150px;margin:18px auto 0"><svg viewBox="0 0 260 150" width="260" height="150" aria-hidden="true"><path d="M20 140 A110 110 0 0 1 240 140" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="22" stroke-linecap="round" stroke-dasharray="4 6"/><path d="M20 140 A110 110 0 0 1 207 62" fill="none" stroke="#FF7426" stroke-width="22" stroke-linecap="round" data-draw="1600"/><circle cx="207" cy="62" r="7" fill="#fff"/></svg>
        <div style="position:absolute;left:0;right:0;bottom:6px;text-align:center"><div class="num" style="font-size:50px;line-height:1"><span data-count="80">0</span></div><div class="wmute small">Pontuação</div></div></div>
      <div class="grid2" style="margin-top:14px">${[['speed', 'Cadência', '88', 'rpm'], ['mountain', 'Elevação', '640', 'm']].map(t => `<div class="ax-card" style="padding:14px;border-radius:24px"><div class="row" style="gap:8px">${ring(.7, { size: 40, sw: 3, color: '#FF7426', inner: icon(t[0], 16) })}<span class="h3">${t[1]}</span></div><div class="num" style="font-size:28px;margin-top:10px">${t[2]} <span class="small wmute">${t[3]}</span></div></div>`).join('')}</div></div>
    <div class="ax-card" style="margin-top:12px;padding:0;overflow:hidden;height:190px" data-e="5"><img src="${photo('ciclismo', 1)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(2px) brightness(.7)">
      <div style="position:absolute;left:18px;top:16px" class="row"><span class="fp-ic">${icon('bike', 18)}</span><div><div class="h3">Pedal matinal</div><div class="small" style="opacity:.8">Comece o dia na estrada.</div></div></div>
      <button class="icon-btn" style="position:absolute;right:16px;top:16px;background:rgba(255,255,255,.85);color:#1E3248" aria-label="Abrir pedal" data-push="runLive" data-params='{"id":"ciclismo"}'>${icon('up', 20, 2)}</button>
      <div class="num" style="position:absolute;left:18px;bottom:14px;font-size:40px">42,6<span style="font-size:16px"> km</span></div></div>
    <div class="wsec"><h2>Modo pedal</h2><span class="wmute small">21 pedalando hoje</span></div>
    <div class="ax-card" style="padding:0;overflow:hidden;height:300px;position:relative">${mapSVG(1, { id: 'axmap', accent: '#FF7426', h: 500 })}
      ${[['theo', 22, 58, '4,3 km'], ['gui', 62, 30, '4,5 km'], ['marina', 70, 64, '2,1 km']].map(p => `<span style="position:absolute;left:${p[2]}%;top:${p[1]}%;display:flex;flex-direction:column;align-items:center;gap:6px"><span class="tag" style="background:rgba(30,50,72,.85)">${p[3]}</span>${av(p[0], 'sm')}</span>`).join('')}
      <div class="ax-card" style="position:absolute;left:12px;right:12px;bottom:12px;padding:10px 14px;border-radius:999px;display:flex;justify-content:space-around;text-align:center"><div><div class="num" style="font-size:18px">638</div><div class="wmute" style="font-size:10px">kcal</div></div><div><div class="num" style="font-size:18px">45:25</div><div class="wmute" style="font-size:10px">duração</div></div><div><div class="num" style="font-size:18px">27,4</div><div class="wmute" style="font-size:10px">km/h</div></div></div></div>
    <div class="wsec"><h2>Distância</h2></div>${chartCard('ax-card')}
  </div>`;

/* ================= 4. Calistenia — preto neon (ref. verde neon) ================= */
WORLD.calistenia = sp => `
  <div style="position:absolute;left:0;right:0;top:0;height:420px;background:radial-gradient(90% 70% at 30% 0%,rgba(163,255,18,.22),transparent 70%);pointer-events:none"></div>
  <div class="pad" style="padding-top:calc(var(--safe-top) + 70px);position:relative">
    <div class="between" data-e="0"><div class="row">${Photos.url('avatar') ? `<img src="${Photos.url('avatar')}" class="av" alt="" style="object-fit:cover">` : meAv()}<div><div class="h3" style="font-size:17px">Olá, ${esc(firstName())}</div><div class="wmute small">Pronto pra barra?</div></div></div><div class="row" style="gap:8px"><span class="icon-btn" style="background:#141614">${icon('bell', 19)}</span><span class="icon-btn" style="background:#141614">${icon('flame', 19)}</span></div></div>
    <div class="nn-pill" style="margin-top:20px" data-e="1"><span style="width:56px;height:56px;border-radius:50%;background:#0B1406;color:#A3FF12;display:grid;place-items:center;flex:none">${icon('trophy', 24)}</span><div style="flex:1"><div class="h3" style="font-size:17px">Novo desafio</div><div class="small">2 semanas de controle</div></div><button class="btn btn-sm" style="background:#fff;color:#06140A" data-push="challenge" data-params='{"id":"c4"}'>Entrar</button></div>
    <div class="row" style="margin-top:22px;gap:2px" data-e="2">${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => `<div class="nn-day ${[1, 3, 5].includes(i) ? 'done' : ''} ${i === 3 ? 'today' : ''}"><span>${d}</span><b>${12 + i}</b></div>`).join('')}</div>
    <div class="row" style="gap:8px;margin-top:20px;overflow-x:auto;scrollbar-width:none" data-e="3"><button class="nn-chip on">${icon('bolt', 16)}Aquecimento</button><button class="nn-chip">${icon('heartbeat', 16)}Core</button><button class="nn-chip">${icon('rings', 16)}Força</button><button class="nn-chip">${icon('spark', 16)}Mobilidade</button></div>
    <div class="hscroll" style="margin-top:14px" data-e="4">${[['calistenia', 'Barra & argolas', 15], ['calistenia-2', 'Paralelas', 10], ['calistenia-3', 'Equilíbrio', 15]].map(c => `<button class="press" style="position:relative;width:150px;height:190px;border-radius:24px;overflow:hidden;text-align:left" data-push="genericLive" data-params='{"id":"calistenia","p":0}'><img src="${pimg(c[0], true)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"><span style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,.85))"></span><span style="position:absolute;left:12px;bottom:12px;color:#fff"><b style="font-size:14px">${c[1]}</b><br><span class="small" style="opacity:.8">${icon('clock', 12, 2, 'style="display:inline;vertical-align:-2px"')} ${c[2]} min</span></span></button>`).join('')}</div>
    <div class="wsec" data-e="5"><h2>Atividade recente</h2>${icon('filter', 20)}</div>
    <div class="stack" data-e="6">${[['rings', 'Barra fixa', 'Hoje às 07:20', '18', 'reps', '#A3FF12'], ['heartbeat', 'Core & L-sit', 'Ontem às 19:00', '28', 's', '#FF4D5E']].map(r => `<div class="nn-card row" style="border-radius:999px;padding:10px 20px 10px 10px"><span style="width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,${r[5]},color-mix(in oklab,${r[5]} 50%,#000));color:#06140A">${icon(r[0], 24)}</span><div style="flex:1"><div class="h3">${r[1]}</div><div class="wmute small">${r[2]}</div></div><div style="text-align:right"><div class="num" style="font-size:24px">${r[3]}</div><div class="wmute small">/${r[4]}</div></div></div>`).join('')}</div>
    <div class="wsec"><h2>Guia da habilidade</h2><span class="demo-badge">prévia</span></div>
    <div class="nn-card" style="padding:0;overflow:hidden"><div style="position:relative;height:250px"><img src="${pimg('calistenia')}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 25%"><span style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.6))"></span>
      <button class="icon-btn" style="position:absolute;left:50%;top:50%;margin:-28px;width:56px;height:56px;background:rgba(255,255,255,.2);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)" aria-label="Abrir guia" data-push="genericLive" data-params='{"id":"calistenia","p":0}'>${icon('play', 22)}</button>
      <div style="position:absolute;left:14px;right:14px;bottom:12px"><div class="row" style="gap:10px;font-size:12px">${icon('play', 14)}<span>0:00 / 5:40</span></div><div style="height:4px;border-radius:4px;background:rgba(255,255,255,.3);margin-top:8px"><i style="display:block;width:38%;height:100%;border-radius:4px;background:#fff"></i></div></div></div>
      <div style="padding:16px"><div class="between"><div><div class="h2" style="font-size:20px">Muscle-up</div><div class="small" style="color:#A3FF12;margin-top:4px">${icon('rings', 13, 2, 'style="display:inline;vertical-align:-2px"')} Transição na barra</div></div><span class="nn-chip" style="height:34px">${icon('timer', 15)}15 min</span></div>
      <p class="wmute small" style="line-height:1.6;margin:12px 0 0">Pegada falsa, puxada explosiva até o peito e transição rápida dos punhos por cima da barra.</p></div></div>
    <div class="wsec"><h2>Meu progresso</h2><span class="num" style="color:#A3FF12;font-size:22px">18 reps</span></div>${chartCard('nn-card')}
    <div class="wsec"><h2>Árvore de habilidades</h2><span class="wmute small">${SKILLS.filter(s => s[1]).length}/${SKILLS.length}</span></div>
    <div class="stack" style="gap:8px">${SKILLS.slice(4, 11).map(([n, u], i) => { const next = !u && SKILLS.slice(4, 11).findIndex(s => !s[1]) === i; return `<div class="skill-node ${u ? 'unlocked' : next ? 'next' : 'locked'}" style="background:#111311"><span class="lv" style="${u ? '' : 'background:rgba(255,255,255,.06)'}">${u ? icon('check', 18, 2.6) : icon(next ? 'bolt' : 'lock', 16)}</span><div style="flex:1"><div class="h3">${n}</div><div class="wmute small">${u ? 'Desbloqueada' : next ? 'Próxima — 55%' : 'Bloqueada'}</div></div></div>`; }).join('')}</div>
  </div>`;

/* ================= 5. Futebol — dia de jogo ================= */
WORLD.futebol = sp => `
  <div class="w-hero" style="height:640px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('futebol', 'futebol', { eager: true, grade: false, fade: 'background:linear-gradient(180deg,rgba(6,18,11,.55),transparent 28%,transparent 45%,rgba(6,18,11,.92) 78%,#06120B)' })}</div>
    <div style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 76px)"><div class="kicker" style="color:#FFC23D" data-e="1">Próximo jogo · Qui 20h · Society</div><h1 class="w-title" style="font-family:var(--display);font-weight:800;font-size:52px;line-height:.95;margin:10px 0 0;letter-spacing:-.05em">Dia de jogo</h1></div>
    <div style="position:absolute;left:14px;right:14px;bottom:16px" class="fb-card" data-e="2"><div class="between"><span class="kicker">Último jogo</span><span class="tag" style="color:#A3FF12">Vitória</span></div>
      <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin:12px 0 6px;text-align:center"><div><div class="h3">Liga dos Amigos</div><div class="wmute small">Você</div></div><div class="num" style="font-size:52px;color:#FFC23D;letter-spacing:-.05em">3 <span style="opacity:.5">:</span> 2</div><div><div class="h3">Rivais FC</div><div class="wmute small">Visitante</div></div></div>
      <div class="wmute small" style="text-align:center">Seus números: 1 gol · 2 assistências · nota 8,1</div></div></div>
  <div class="pad">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);margin-top:20px" data-e="3">${[['23', 'Partidas'], ['14', 'Gols'], ['9', 'Assist.'], ['7,8', 'Nota média']].map(x => `<div><div class="num" style="font-size:28px;color:#FFC23D"><span data-count="${x[0].replace(',', '.')}" data-dec="${x[0].includes(',') ? 1 : 0}">0</span></div><div class="wmute" style="font-size:11px">${x[1]}</div></div>`).join('')}</div>
    <div class="wsec" data-e="4"><h2>Mapa de calor</h2><span class="wmute small">últimos 5 jogos</span></div>
    <div class="fb-card" style="padding:12px" data-e="5"><svg viewBox="0 0 340 210" style="width:100%;height:auto;border-radius:16px;background:linear-gradient(90deg,#0E3A1E,#0B2F18 50%,#0E3A1E)" aria-hidden="true"><defs><radialGradient id="hm"><stop offset="0" stop-color="#FF4D2E" stop-opacity=".9"/><stop offset=".5" stop-color="#FFC23D" stop-opacity=".5"/><stop offset="1" stop-color="#FFC23D" stop-opacity="0"/></radialGradient></defs>
      ${[[230, 80, 60], [260, 130, 46], [190, 110, 40], [290, 95, 30]].map(b => `<circle cx="${b[0]}" cy="${b[1]}" r="${b[2]}" fill="url(#hm)"/>`).join('')}
      <g fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.5"><rect x="8" y="8" width="324" height="194" rx="4"/><line x1="170" y1="8" x2="170" y2="202"/><circle cx="170" cy="105" r="30"/><rect x="8" y="55" width="46" height="100"/><rect x="286" y="55" width="46" height="100"/><rect x="8" y="80" width="16" height="50"/><rect x="316" y="80" width="16" height="50"/></g></svg>
      <div class="between small wmute" style="margin-top:8px"><span>Defesa</span><span>Você atua mais pela direita no ataque</span><span>Ataque</span></div></div>
    <div class="wsec"><h2>Últimas partidas</h2></div>
    <div class="stack">${[['Pelada de quinta', '7 × 5', 'V', '2 G · 1 A'], ['Society — Liga dos Amigos', '3 × 4', 'D', '1 A'], ['Campo — Amistoso', '2 × 2', 'E', '1 G']].map(m => `<div class="fb-card row"><span style="width:44px;height:44px;border-radius:14px;display:grid;place-items:center;font-family:var(--display);font-weight:700;background:${m[2] === 'V' ? 'rgba(163,255,18,.15);color:#A3FF12' : m[2] === 'D' ? 'rgba(255,77,94,.15);color:#FF4D5E' : 'rgba(255,255,255,.08);color:#ccc'}">${m[2]}</span><div style="flex:1"><div class="h3">${m[0]}</div><div class="wmute small">Placar ${m[1]} · ${m[3]}</div></div></div>`).join('')}</div>
    <div class="wsec"><h2>Seu time</h2><button class="link" data-wtoast="Convocação enviada (prévia)">Convocar</button></div>
    <div class="fb-card row"><div class="av-stack">${['luana', 'caio', 'rafa', 'gui', 'theo'].map(p => av(p, 'sm')).join('')}</div><div style="flex:1"><div class="h3">Liga dos Amigos</div><div class="wmute small">10 jogadores · 3º lugar</div></div>${icon('next', 18)}</div>
    <div class="fb-card" style="margin-top:12px;padding:0;overflow:hidden;height:180px;position:relative"><img src="${photo('futebol', 1)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"><span style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,18,11,.95),rgba(6,18,11,.2))"></span>
      <div style="position:absolute;left:18px;top:18px;right:120px"><div class="kicker" style="color:#FFC23D">Meta da temporada</div><div class="h2" style="margin-top:8px">20 gols</div><div class="num" style="font-size:34px;margin-top:6px">14<span class="small wmute"> / 20</span></div><div class="bar" style="margin-top:8px"><i data-bar=".7" style="transform:scaleX(0);background:#FFC23D;box-shadow:none"></i></div></div></div>
  </div>`;

/* ================= 6. Natação — editorial aqua (ref. Tenneox) ================= */
WORLD.natacao = sp => `
  <div class="w-hero" style="height:660px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('natacao', 'natacao', { eager: true, grade: false, fade: 'background:linear-gradient(180deg,rgba(10,44,87,.75),rgba(10,44,87,.15) 35%,transparent 55%,rgba(10,44,87,.7) 85%,#0A2C57)' })}</div>
    <div style="position:absolute;left:22px;right:22px;top:calc(var(--safe-top) + 74px)"><h1 class="w-title" style="font-family:var(--display);font-weight:800;font-size:42px;line-height:.98;margin:0;color:rgba(255,255,255,.62);letter-spacing:-.04em;text-transform:uppercase">Deslize mais longe</h1><div class="small" style="color:rgba(255,255,255,.7);margin-top:8px" data-e="1">Seu companheiro de piscina</div></div>
    <div class="tx-tilt" style="position:absolute;left:16px;bottom:120px;width:170px;transform:rotate(-9deg)" data-e="2"><span class="fp-ic" style="position:absolute;right:10px;top:-14px;background:rgba(255,255,255,.6);color:#0A2C57">${icon('swim', 18)}</span><div class="num" style="font-size:40px;color:#06213F">256</div><div style="font-size:14px;color:#0A2C57;font-weight:600">Voltas no mês</div></div>
    <div class="tx-tilt" style="position:absolute;right:16px;bottom:110px;width:160px" data-e="3"><span class="fp-ic" style="position:absolute;right:10px;top:-14px;background:rgba(255,255,255,.6);color:#0A2C57">${icon('timer', 18)}</span><div class="num" style="font-size:40px;color:#fff">1:31</div><div style="font-size:14px;color:#fff;font-weight:600">Melhor 100 m</div></div>
    <div style="position:absolute;left:20px;right:20px;bottom:24px;display:grid;grid-template-columns:repeat(4,1fr)" data-e="4">${[['#4', 'Ranking'], ['6,4', 'km no mês'], ['92%', 'Constância'], ['18', 'Treinos']].map(x => `<div><div class="num" style="font-size:26px;font-style:italic">${x[0]}</div><div style="font-size:11px;opacity:.8">${x[1]}</div></div>`).join('')}</div></div>
  <div class="pad">
    <div class="tx-white" style="margin-top:6px" data-e="5"><div class="between"><div class="h2" style="font-size:20px">Ritmo por 100 m</div><span class="small" style="color:#4A6587">Últimos 30 dias</span></div>
      <div style="height:8px;border-radius:8px;background:#DCE6F2;margin:18px 0 12px;overflow:hidden"><i data-bar=".86" style="display:block;height:100%;background:#0A2C57;transform-origin:left;transform:scaleX(0)"></i></div>
      <div class="row" style="gap:10px;align-items:baseline"><span class="num" style="font-size:40px;font-style:italic">1:38</span><span class="small" style="color:#4A6587">média · 6 s mais rápido que outubro</span></div>
      <button class="btn btn-block" style="background:#0A2C57;color:#fff;margin-top:16px" data-push="challenge" data-params='{"id":"c5"}'>${icon('trophy', 18)}Ver ranking da piscina</button>
      <div class="grid2" style="margin-top:14px">${['natacao-2', 'natacao-3'].map(n => `<img src="${pimg(n, true)}" alt="" style="width:100%;height:140px;object-fit:cover;border-radius:22px">`).join('')}</div></div>
    <div class="wsec"><h2>Estilos no mês</h2></div>
    <div class="tx-white stack" style="gap:14px">${[['Livre', .62], ['Costas', .18], ['Peito', .12], ['Borboleta', .08]].map(([n, v], i) => `<div><div class="between small"><b>${n}</b><span style="color:#4A6587">${Math.round(v * 100)}%</span></div><div style="height:6px;border-radius:6px;background:#DCE6F2;margin-top:7px;overflow:hidden"><i data-bar="${v}" data-delay="${i * 100}" style="display:block;height:100%;background:#1B6FB0;transform-origin:left;transform:scaleX(0)"></i></div></div>`).join('')}</div>
    <div class="wsec"><h2>Distância</h2></div>${chartCard('card', 'background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.15)')}
    <div class="wsec"><h2>Recordes</h2></div><div class="stack">${sp.records.map(r => `<div class="list-item" style="background:rgba(255,255,255,.07)"><span class="ico">${icon('medal', 20)}</span><div style="flex:1"><div class="h3">${r.k}</div><div class="wmute small">${r.d}</div></div><span class="num" style="font-size:18px;font-style:italic">${r.v}</span></div>`).join('')}</div>
  </div>`;

/* ================= 7. Boxe — fight night ================= */
WORLD.boxe = sp => `
  <div class="w-hero" style="height:640px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('boxe', 'boxe', { eager: true, grade: false, fade: 'background:linear-gradient(180deg,rgba(11,5,6,.55),transparent 28%,transparent 45%,rgba(11,5,6,.92) 78%,#0B0506)' })}</div>
    <div class="outline-num" style="position:absolute;right:-10px;top:120px;font-size:230px" aria-hidden="true">12</div>
    <div style="position:absolute;left:20px;right:20px;bottom:26px"><div class="kicker" style="color:#FF3B4E" data-e="1">Sessão de hoje · 8 rounds</div><h1 class="w-title" style="font-family:var(--display);font-weight:800;font-size:54px;line-height:.92;margin:10px 0 14px;letter-spacing:-.05em">Guarda alta</h1>
      <div class="row" style="gap:6px" data-e="3">${Array.from({ length: 12 }, (_, i) => `<span class="bx-seg ${i < 7 ? 'done' : i === 7 ? 'cur' : ''}"></span>`).join('')}</div><div class="between wmute small" style="margin-top:8px"><span>R1</span><span>7 de 12 rounds na semana</span><span>R12</span></div></div></div>
  <div class="pad">
    <div class="grid3" style="margin-top:10px" data-e="4">${[['486', 'Jabs', .9], ['312', 'Diretos', .64], ['158', 'Ganchos', .35]].map((x, i) => `<div class="bx-card"><div class="num" style="font-size:28px"><span data-count="${x[0]}">0</span></div><div class="wmute small">${x[1]}</div><div style="height:4px;border-radius:4px;background:rgba(255,255,255,.08);margin-top:10px;overflow:hidden"><i data-bar="${x[2]}" data-delay="${i * 120}" style="display:block;height:100%;background:#FF3B4E;transform-origin:left;transform:scaleX(0)"></i></div></div>`).join('')}</div>
    <div class="bx-card" style="margin-top:12px" data-e="5"><div class="between"><div class="h3">Intensidade média</div><span class="tag" style="color:#FF3B4E">semana</span></div><div class="w-gauge" style="margin-top:8px">${gauge(.82, { w: 280, color: '#FF3B4E', label: 'Intensidade' })}</div></div>
    <div class="wsec" data-e="6"><h2>Combinações do dia</h2></div>
    <div class="stack" style="gap:8px" data-e="7">${[['1-2', 'Jab · Direto'], ['1-1-2', 'Jab duplo · Direto'], ['1-2-3', 'Jab · Direto · Gancho'], ['1-esq-2', 'Jab · Esquiva · Direto']].map((c, i) => `<div class="bx-card row" style="padding:12px 16px"><span class="num" style="font-size:20px;color:#FF3B4E;width:84px;white-space:nowrap">${c[0]}</span><span style="flex:1">${c[1]}</span><span class="wmute small">R${i + 1}</span></div>`).join('')}</div>
    <div class="bx-card" style="margin-top:12px;padding:0;overflow:hidden;height:220px;position:relative"><img src="${photo('boxe', 1)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.1)"><span style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,5,6,.95) 35%,rgba(120,10,20,.35))"></span>
      <div style="position:absolute;left:18px;top:18px;right:18px"><div class="kicker" style="color:#FF3B4E">Notas do treinador</div><div class="row" style="gap:12px;margin-top:14px">${[['Jab', .82], ['Direto', .74], ['Esquiva', .61]].map((t, i) => `<div style="text-align:center">${ring(t[1], { size: 56, sw: 5, color: '#FF3B4E', delay: i * 120, inner: `<span class="num" style="font-size:14px">${Math.round(t[1] * 100)}</span>` })}<div class="small" style="margin-top:6px">${t[0]}</div></div>`).join('')}</div></div></div>
    <div class="wsec"><h2>Rounds</h2></div>${chartCard('bx-card')}
  </div>`;

/* ---------- Misc sheets ---------- */
function historySheet(id) {
  const sp = SPORTS[id];
  const rows = Array.from({ length: 8 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i * 2 - 1); return [d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }), nextSession(id)[0], sp.metric.W[i % 7] || sp.metric.M[i]]; });
  Sheet.open(`<div class="between" data-e="0"><h3 class="h2">Histórico de ${sp.name.toLowerCase()}</h3>${demoBadge()}</div><div class="stack" style="margin-top:16px;gap:8px">${rows.map((r, i) => `<div class="list-item" data-e="${1 + i}"><span class="ico">${icon(sp.icon, 20)}</span><div style="flex:1"><div class="h3">${r[1]}</div><div class="muted small">${r[0]}</div></div><span class="num" style="font-size:16px">${fmt(r[2], r[2] % 1 ? 1 : 0)} ${sp.metric.u}</span></div>`).join('')}</div>`, null, { label: 'Histórico' });
}
function openNotifications() {
  const items = [['rafa', 'curtiu seu recorde no supino', '2 min'], ['marina', 'te ultrapassou no desafio 100 km em novembro', '18 min'], ['julia', 'convidou você para “Rei da barra”', '1 h'], ['caio', 'comentou: “bora pro sparring sábado?”', '3 h']];
  Sheet.open(`<h3 class="h2" data-e="0">Notificações</h3><div class="stack" style="margin-top:16px;gap:8px">${items.map((n, i) => `<div class="list-item" data-e="${1 + i}">${av(n[0])}<div style="flex:1"><div style="font-size:14px;line-height:1.4"><b>${PEOPLE[n[0]].n.split(' ')[0]}</b> ${n[1]}</div><div class="muted small" style="margin-top:2px">${n[2]}</div></div></div>`).join('')}</div>`, null, { label: 'Notificações' });
}
function shareSheet(title, text) {
  Sheet.open(`<h3 class="h2" data-e="0">Compartilhar</h3><div class="card" style="margin:16px 0" data-e="1"><div class="h3">${esc(title)}</div><div class="muted small" style="margin-top:6px;line-height:1.5">${esc(text)}</div></div>
    <div class="grid3" data-e="2">${[['copy', 'Copiar texto'], ['image', 'Story (prévia)'], ['users', 'Enviar a amigos']].map(([ic, l], i) => `<button class="card press" style="padding:14px 10px;text-align:center" data-sh="${i}"><span style="display:grid;place-items:center;color:var(--accent)">${icon(ic, 22)}</span><span class="small" style="display:block;margin-top:8px">${l}</span></button>`).join('')}</div>`,
    (w, close) => w.addEventListener('click', async e => { const b = e.target.closest('[data-sh]'); if (!b) return;
      if (b.dataset.sh === '0') { try { await navigator.clipboard.writeText(`${title} — ${text}`); toast('Texto copiado'); } catch (x) { toast('Não foi possível copiar aqui', 'x'); } }
      else toast(b.dataset.sh === '1' ? 'Exportação para stories é uma prévia' : 'Envio para amigos é uma prévia', 'spark'); close(); }), { label: 'Compartilhar' });
}
