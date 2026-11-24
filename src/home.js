/* ============================================================
   ORA GYM — Home ("Seus espaços") + espaço de cada esporte (dados reais)
   ============================================================ */
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };
const firstName = () => ((API.me && API.me.name) || 'Atleta').split(' ')[0];
const mySports = () => (API.me && API.me.sports && API.me.sports.length) ? API.me.sports : ['musculacao'];
const SS = id => Stats.sport(API.acts, id, API.me);
const nv = (v, d = 0) => fmt(v, v % 1 ? d : 0);
const LIVE = { musculacao: 'liftLive', corrida: 'runLive', ciclismo: 'runLive', calistenia: 'genericLive', futebol: 'genericLive', natacao: 'genericLive', boxe: 'genericLive' };
const startLabel = { musculacao: 'Começar treino', corrida: 'Iniciar corrida', ciclismo: 'Começar pedal', calistenia: 'Começar sessão', futebol: 'Registrar partida', natacao: 'Iniciar série', boxe: 'Iniciar rounds' };
function nextWorkout() { const W = API.workouts; if (!W.length) return null; const last = API.acts.find(a => a.sport === 'musculacao' && a.workoutId); if (!last) return W[0]; const i = W.findIndex(w => w.id === last.workoutId); return W[(i + 1) % W.length] || W[0]; }
function todayLine() { const id = mySports()[0]; if (id === 'musculacao') { const w = nextWorkout(); return w ? `${w.name}${w.focus ? ' — ' + w.focus : ''}` : 'Monte sua primeira ficha'; } const S = SS(id); return `${SPORTS[id].name}: ${nv(S.goal.value, 1)} de ${nv(S.goal.target, 1)} ${S.goal.unit} na semana`; }
const emptyBox = (txt, btn = '') => `<div class="card" style="text-align:center;padding:26px 18px"><div class="muted small" style="line-height:1.55">${txt}</div>${btn ? `<div style="margin-top:14px">${btn}</div>` : ''}</div>`;

/* ---------------- Home ---------------- */
Screens.home = {
  render() {
    const me = API.me; const mine = mySports();
    return `<div class="scroll" id="home-scroll"><div class="pad page" style="padding-top:calc(var(--safe-top) + 6px)">
      <div class="between m-only" data-e="0" data-ek="fade">${brandLockup(22)}<div class="row" style="gap:8px"><button class="icon-btn glass" aria-label="Notificações" data-notifs style="position:relative">${icon('bell', 20)}<span class="notif-dot" hidden></span></button><button data-gotab="profile" aria-label="Perfil">${meAv()}</button></div></div>
      <div class="kicker" style="margin-top:26px" data-e="1">${greet()}</div>
      <h1 class="display home-title" style="font-size:40px;margin:8px 0 6px">${esc(firstName())}, bora pra cima?</h1>
      <p class="muted" style="margin:0" data-e="3">Hoje: <b style="color:#fff">${esc(todayLine())}</b></p>
      <div class="wsec" data-e="4"><h2>Seus espaços</h2><button class="link" data-edit-sports>Editar</button></div></div>
      <div class="hscroll spaces page-wide" style="padding:0 20px 8px;margin:0;gap:14px" data-e="5">${mine.map(id => spaceCard(id)).join('')}
        <button class="space-add press" data-edit-sports>${icon('plus', 26, 2)}<span class="small" style="text-align:center">Adicionar<br>esporte</span></button></div>
      <div class="pad page"><div class="home-grid">
      <div><div class="wsec" data-e="6"><h2>Metas da semana</h2><span class="muted small">sequência de ${Stats.streak(API.acts)} ${Stats.streak(API.acts) === 1 ? 'dia' : 'dias'}</span></div>
      <div class="card" data-e="7"><div class="row" style="justify-content:space-around;flex-wrap:wrap;gap:14px">${mine.slice(0, 4).map((id, i) => { const sp = SPORTS[id]; const S = SS(id); return `<button style="text-align:center" data-goal-edit="${id}" aria-label="Editar meta de ${sp.name}">${ring(S.goal.p, { size: 64, sw: 6, color: sp.c, delay: i * 120, inner: `<span style="color:${sp.c}">${icon(sp.icon, 20)}</span>` })}<div class="small" style="margin-top:8px;font-weight:600">${sp.short}</div><div class="muted" style="font-size:11px">${nv(S.goal.value, 1)}/${nv(S.goal.target, 1)} ${S.goal.unit}</div></button>`; }).join('')}</div></div>
      <div class="wsec" data-e="8"><h2>Últimas atividades</h2><button class="link" data-gotab="train">Treinar</button></div>
      <div data-e="9">${API.acts.length ? `<div class="stack">${API.acts.slice(0, 4).map(actRow).join('')}</div>` : emptyBox('Você ainda não registrou nenhuma atividade. Escolha um esporte e comece — tudo fica salvo na sua conta.', `<button class="btn btn-accent btn-sm" data-gotab="train">${icon('bolt', 16)}Registrar agora</button>`)}</div></div>
      <div><div class="wsec" data-e="10"><h2>Seus desafios</h2><button class="link" data-gotab="challenges">Ver todos</button></div>
      <div data-async="home-ch" data-e="11"><div class="card skeleton" style="height:120px"></div></div>
      <div class="wsec" data-e="12"><h2>Quem você segue</h2><button class="link" data-gotab="social">Feed</button></div>
      <div data-async="home-feed" data-e="13"><div class="card skeleton" style="height:90px"></div></div></div></div>
      <div class="bottom-space"></div></div></div>`;
  },
  mount(el) {
    Motion.kinetic($('.home-title', el), 200); hydrateImages(el); wireActRows(el); refreshNotifDot();
    el.addEventListener('click', e => { if (e.target.closest('[data-edit-sports]')) editSportsSheet(); const g = e.target.closest('[data-goal-edit]'); if (g) goalSheet(g.dataset.goalEdit, () => Nav.refresh()); if (e.target.closest('[data-notifs]')) openNotifications(); });
    (async () => { const box = $('[data-async="home-ch"]', el); try { const L = await API.myChallenges(); box.innerHTML = L.length ? `<div class="hscroll">${L.slice(0, 6).map(c => challengeCard(c, 'w')).join('')}</div>` : emptyBox('Crie um desafio e chame seus amigos, ou entre em um desafio público.', `<button class="btn btn-ghost btn-sm" data-gotab="challenges">Explorar desafios</button>`); Motion.fillBars(box); } catch (x) { box.innerHTML = emptyBox(errMsg(x)); } })();
    (async () => { const box = $('[data-async="home-feed"]', el); try { const L = API.following.size ? await API.feed({ scope: 'following' }) : []; const others = L.filter(p => p.authorId !== API.me.id).slice(0, 3);
      box.innerHTML = others.length ? `<div class="stack">${others.map(p => `<button class="list-item press" style="text-align:left" data-open-post="${p.id}">${avatar(p.author)}<div style="flex:1;min-width:0"><div class="h3" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.author.name.split(' ')[0])} · ${esc(p.activity ? p.activity.title : (p.text || '').slice(0, 40))}</div><div class="muted small" style="margin-top:3px">${SPORTS[p.sport] ? SPORTS[p.sport].name : ''} · ${ago(p.ts)}</div></div><span style="color:${(SPORTS[p.sport] || {}).c}">${icon((SPORTS[p.sport] || {}).icon || 'bolt', 20)}</span></button>`).join('')}</div>`
        : emptyBox('Siga atletas para ver as atividades deles aqui.', `<button class="btn btn-ghost btn-sm" data-find-people>Encontrar pessoas</button>`); hydrateImages(box);
      box.addEventListener('click', e => { if (e.target.closest('[data-find-people]')) peopleSheet(); if (e.target.closest('[data-open-post]')) Nav.go('social'); }); } catch (x) { box.innerHTML = emptyBox(errMsg(x)); } })();
  },
  onReturn() { Nav.refresh(); },
};
function spaceCard(id) {
  const sp = SPORTS[id]; const S = SS(id);
  return `<button class="space-card press" data-push="world" data-params='{"id":"${id}"}' data-expand aria-label="Abrir espaço ${sp.name}">
    <img src="${photo(id, 0)}" alt="" style="object-position:${PHOTO_POS[PH[id][0]] || 'center'}"><span class="sc-fade"></span>
    <span class="sc-top"><span class="tag" style="color:${sp.c};background:rgba(0,0,0,.5)">${icon(sp.icon, 13, 2)}${sp.short}</span><span class="tag">${Math.round(S.goal.p * 100)}% da meta</span></span>
    <span class="sc-bot"><span class="display" style="display:block;font-size:26px">${sp.name}</span>
      <span class="between" style="margin-top:10px"><span><span class="num" style="font-size:22px">${nv(S.weekTotal, S.metric.dec)}</span><span class="small" style="opacity:.75"> ${S.metric.u} na semana</span></span><span class="go">${icon('arrow', 20, 2.2)}</span></span></span></button>`;
}
function challengeCard(c, size = 'w') {
  const sp = SPORTS[c.sport] || SPORTS.musculacao; const mine = API.joined.includes(c.id); const prog = mine ? Stats.challengeProgress(API.acts, c) : 0; const p = clamp(prog / (c.target || 1), 0, 1);
  const days = Math.max(0, Math.ceil((startOfDay(c.end) + DAY - Date.now()) / DAY));
  return `<button class="card press ch-card" style="width:${size === 'w' ? '280px' : '100%'};text-align:left;padding:0;min-height:170px" data-push="challenge" data-params='{"id":"${c.id}"}'>
    <img src="${photo(c.sport, 1, true)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.5"><span style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,11,11,.95) 30%,rgba(11,11,11,.5))"></span>
    <div style="position:relative;padding:18px"><div class="between"><span class="tag" style="color:${sp.c}">${icon(sp.icon, 13, 2)}${sp.name}</span><span class="muted small">${days > 0 ? days + ' dias' : 'encerrado'}</span></div>
    <div class="h2" style="margin:14px 0 4px">${esc(c.name)}</div><div class="muted small">${c.visibility === 'public' ? 'Público' : 'Privado'} · ${c.memberCount || 0} ${c.memberCount === 1 ? 'participante' : 'participantes'}</div>
    <div class="between" style="margin-top:14px;align-items:flex-end"><div class="num" style="font-size:22px">${mine ? nv(prog, 1) : '—'}<span style="font-size:12px;color:var(--mute)"> / ${nv(c.target, 1)} ${esc(c.unit)}</span></div>${mine ? '<span class="tag neon">Participando</span>' : ''}</div>
    <div class="bar" style="margin-top:10px"><i data-bar="${p}" style="transform:scaleX(0);background:${sp.c};box-shadow:none"></i></div></div></button>`;
}
function actRow(a) { const sp = SPORTS[a.sport] || SPORTS.musculacao;
  return `<button class="list-item press" style="text-align:left;--accent:${sp.c}" data-act="${a.id}"><span class="ico">${icon(sp.icon, 20)}</span><div style="flex:1;min-width:0"><div class="h3" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(a.title || sp.name)}</div><div class="muted small" style="margin-top:3px">${shortDate(a.startedAt)} · ${statLine(a.sport, a)}</div></div>${icon('next', 18)}</button>`; }
function wireActRows(root) { root.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) activitySheet(API.acts.find(a => a.id === b.dataset.act)); }); }
function activitySheet(a) {
  if (!a) return; const sp = SPORTS[a.sport];
  const sets = a.sets && a.sets.length ? `<div class="stack" style="gap:6px;margin-top:14px">${Object.entries(a.sets.reduce((m, s) => { (m[s.ex] = m[s.ex] || []).push(s); return m; }, {})).map(([ex, L]) => `<div class="list-item" style="padding:10px 14px;display:block"><div class="h3">${esc(ex)}</div><div class="muted small" style="margin-top:4px">${L.map(s => `${s.kg ? fmt(s.kg, s.kg % 1 ? 1 : 0) + ' kg × ' : ''}${s.reps}`).join(' · ')}</div></div>`).join('')}</div>` : '';
  const blocks = a.blocks && a.blocks.length ? `<div class="muted small" style="margin-top:12px;line-height:1.6">${a.blocks.map(b => `${esc(b.ex)}: ${b.reps}`).join(' · ')}</div>` : '';
  Sheet.open(`<div class="between" data-e="0"><div><div class="kicker" style="color:${sp.c}">${sp.name} · ${new Date(a.startedAt).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}</div><h3 class="h2" style="margin-top:6px;font-size:22px">${esc(a.title || sp.name)}</h3></div></div>
    ${a.route && a.route.length > 1 ? `<div style="height:200px;border-radius:22px;overflow:hidden;margin-top:14px" data-e="1">${routeSVG(a.route, { color: sp.c === '#E8ECE6' ? '#fff' : sp.c })}</div>` : ''}
    <div class="grid3" style="margin-top:14px" data-e="2">${postStats(a).map(s => `<div class="card" style="padding:12px"><div class="muted" style="font-size:11px">${s[0]}</div><div class="num" style="font-size:18px;margin-top:4px">${esc(s[1])}</div></div>`).join('')}</div>
    ${sets}${blocks}${a.notes ? `<p class="muted small" style="margin-top:12px">${esc(a.notes)}</p>` : ''}
    <div class="row" style="gap:10px;margin-top:18px" data-e="3"><button class="btn btn-white" style="flex:1" data-ap>${icon('share', 18)}Publicar</button><button class="btn btn-ghost" data-ad style="color:#FF6B76">${icon('trash', 18)}</button></div>`,
    (w, close) => { $('[data-ap]', w).onclick = () => { close(); composePost({ sport: a.sport, activity: a }); };
      $('[data-ad]', w).onclick = async () => { close(); if (await confirmDialog('Excluir atividade?', 'Ela sai do seu histórico e das estatísticas. Não dá para desfazer.', 'Excluir', true)) { try { await API.removeActivity(a.id); toast('Atividade excluída', 'trash'); rerenderAll(); } catch (x) { toast(errMsg(x), 'x'); } } }; }, { label: 'Atividade' });
}
function goalSheet(id, done) {
  const sp = SPORTS[id]; const S = SS(id); const g = { ...S.goal };
  const kinds = { sessions: `${GOAL_DEFAULT[id].kind === 'sessions' ? GOAL_DEFAULT[id].unit : 'treinos'}`, metric: METRIC[id].u };
  Sheet.open(`<h3 class="h2" data-e="0">Meta semanal · ${sp.name}</h3><p class="muted small" data-e="1" style="margin:6px 0 16px">Usada nos anéis, nos espaços e no seu progresso.</p>
    <div class="field" data-e="2"><label>Medir por</label>${seg([['sessions', 'Quantidade de sessões'], ['metric', METRIC[id].k]], g.kind, 'gk')}</div>
    <div class="field" data-e="3"><label>Objetivo por semana</label><div class="stepper"><button class="icon-btn" data-gs="-1" aria-label="Diminuir">${icon('minus', 18)}</button><div class="live-num" style="font-size:42px"><span id="g-t">${g.target}</span> <span class="g-u" style="font-size:15px;color:var(--mute)">${g.kind === 'sessions' ? kinds.sessions : kinds.metric}</span></div><button class="icon-btn" data-gs="1" aria-label="Aumentar">${icon('plus', 18)}</button></div></div>
    <button class="btn btn-white btn-block" data-gsave data-e="4">Salvar meta</button>`, (w, close) => {
      mountSeg($('.seg', w), b => { g.kind = b.dataset.gk; $('.g-u', w).textContent = g.kind === 'sessions' ? kinds.sessions : kinds.metric; });
      w.addEventListener('click', async e => { const s = e.target.closest('[data-gs]'); if (s) { const step = g.kind === 'metric' && g.target >= 10 ? 5 : 1; g.target = Math.max(1, g.target + step * +s.dataset.gs); $('#g-t', w).textContent = g.target; haptic(5); }
        if (e.target.closest('[data-gsave]')) { const weekly = { ...(API.me.weekly || {}) }; weekly[id] = { kind: g.kind, target: g.target, unit: g.kind === 'sessions' ? kinds.sessions : kinds.metric }; try { await API.updateProfile({ weekly }); close(); toast('Meta salva'); done && done(); } catch (x) { toast(errMsg(x), 'x'); } } }); }, { label: 'Meta' });
}

/* ---------------- Espaço de cada esporte ---------------- */
Screens.world = { render({ id }) { return worldShell(id); }, mount(el, { id }) { mountWorld(el, id); }, onReturn(el, p) { const w = $('.world', el); if (!w) return; const id = w.dataset.world; el.innerHTML = worldShell(id); mountWorld(el, id); } };
Screens.sport = Screens.world;
function worldShell(id) {
  const sp = SPORTS[id]; setAccent(id); const mine = mySports().includes(id) ? mySports() : [id, ...mySports()]; const S = SS(id);
  return `<div class="world w-${id}" data-world="${id}">
    <div class="wtop"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button>
      <div class="wswitch glass" role="tablist" aria-label="Seus espaços">${mine.map(s => `<button class="wsw ${s === id ? 'on' : ''}" role="tab" aria-selected="${s === id}" data-wsw="${s}"><img src="${photo(s, 0, true)}" alt=""><span>${SPORTS[s].name}</span></button>`).join('')}</div></div>
    <div class="scroll wscroll"><div class="wpage">${WORLD[id](sp, S)}${worldExtras(id, S)}</div></div>
    <div class="wcta">${WCTA[id]()}</div></div>`;
}
function mountWorld(el, id) {
  const w = $('.world', el) || el; const S = SS(id);
  $$('.w-title', w).forEach((t, i) => Motion.kinetic(t, 220 + i * 120));
  const sc = $('.wscroll', w); const top = $('.wtop', w); const hero = $('.w-hero .hero-stack', w);
  sc.addEventListener('scroll', () => requestAnimationFrame(() => { const y = sc.scrollTop; top.classList.toggle('solid', y > 300); if (hero) hero.style.transform = `translate3d(0,${y * .4}px,0) scale(${1 + y / 3000})`; }), { passive: true });
  const ch = $('.w-chart', w);
  if (ch) { const ax = $('.w-axis', w); const setAx = p => ax && (ax.innerHTML = S.labels[p].map(x => `<span>${x}</span>`).join(''));
    mountChart(ch, S.series.M, { unit: S.metric.u, dec: S.metric.dec, tipLabel: (i) => ['Semana -11', 'Semana -10', 'Semana -9', 'Semana -8', 'Semana -7', 'Semana -6', 'Semana -5', 'Semana -4', 'Semana -3', 'Semana -2', 'Semana passada', 'Esta semana'][i] }); setAx('M');
    const sg = $('.w-seg .seg', w); sg && mountSeg(sg, b => { const p = b.dataset.per; ch._set(S.series[p]); setAx(p); }); }
  const g = $('.w-gauge', w); if (g) setTimeout(() => animateGauge(g), 200);
  const sw = $('.wswitch', w); const on = $('.wsw.on', sw); on && setTimeout(() => on.scrollIntoView({ inline: 'center', block: 'nearest' }), 30);
  sw.addEventListener('click', e => { const b = e.target.closest('[data-wsw]'); if (!b || b.classList.contains('on')) return; switchWorld(el, b.dataset.wsw, b); });
  w.addEventListener('click', e => { const f = e.target.closest('[data-social-filter]'); if (f) { socialFilter = f.dataset.socialFilter; Nav.go('social'); }
    if (e.target.closest('[data-goal]')) goalSheet(id, () => Screens.world.onReturn(el)); const t = e.target.closest('[data-wtoast]'); if (t) toast(t.dataset.wtoast, 'spark');
    if (e.target.closest('[data-new-ficha]')) fichaEditor(null, () => Screens.world.onReturn(el));
    const sk = e.target.closest('[data-skill]'); if (sk) toggleSkill(sk.dataset.skill, () => Screens.world.onReturn(el)); });
  wireActRows(w); wireProducts(w); hydrateImages(w);
  (async () => { const box = $('[data-async="w-ch"]', w); if (!box) return; try { const [mine, pub] = await Promise.all([API.myChallenges(), API.listChallenges()]); const m = new Map(); [...mine, ...pub].filter(c => c.sport === id).forEach(c => m.set(c.id, c)); const L = [...m.values()].slice(0, 8);
    box.innerHTML = L.length ? `<div class="hscroll">${L.map(c => challengeCard(c)).join('')}</div>` : emptyBox(`Nenhum desafio de ${SPORTS[id].name.toLowerCase()} ainda.`, `<button class="btn btn-ghost btn-sm" data-new-ch="${id}">Criar desafio</button>`); Motion.fillBars(box);
    box.addEventListener('click', e => { const n = e.target.closest('[data-new-ch]'); if (n) createChallengeSheet(n.dataset.newCh); }); } catch (x) { box.innerHTML = emptyBox(errMsg(x)); } })();
  (async () => { const box = $('[data-async="w-feed"]', w); if (!box) return; try { const L = await API.feed({ sport: id }); box.innerHTML = L.length ? L.slice(0, 2).map(p => postCard(p, true)).join('<div style="height:18px"></div>') : emptyBox('Ninguém publicou neste esporte ainda. Que tal ser o primeiro?', `<button class="btn btn-ghost btn-sm" data-compose="${id}">Publicar</button>`); hydrateImages(box); wirePosts(box);
    box.addEventListener('click', e => { const c = e.target.closest('[data-compose]'); if (c) composePost({ sport: c.dataset.compose }); }); } catch (x) { box.innerHTML = emptyBox(errMsg(x)); } })();
  Motion.drawLines(w);
}
function switchWorld(layer, id, btn) {
  haptic(10); const old = $('.world', layer); const r = btn.getBoundingClientRect(), pr = $('#app').getBoundingClientRect(); const lr = layer.getBoundingClientRect();
  const cx = r.left - lr.left + r.width / 2, cy = r.top - lr.top + r.height / 2;
  const tmp = document.createElement('div'); tmp.innerHTML = worldShell(id); const nw = tmp.firstElementChild; layer.appendChild(nw);
  const entry = Nav.stack.find(s => s.el === layer); if (entry) entry.params = { id };
  A(nw, [{ clipPath: `circle(20px at ${cx}px ${cy}px)` }, { clipPath: `circle(2200px at ${cx}px ${cy}px)` }], { duration: 760, easing: 'cubic-bezier(.7,0,.2,1)' });
  A(old, [{ transform: 'scale(1)', filter: 'brightness(1)' }, { transform: 'scale(.94)', filter: 'brightness(.4)' }], { duration: 760, easing: 'cubic-bezier(.7,0,.2,1)' }).finished.then(() => old.remove());
  const hero = $('.w-hero .hero-stack', nw); hero && A(hero, [{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 1400, easing: 'out' });
  mountWorld(nw, id); Motion.enter(nw, 260, 45);
}
async function toggleSkill(name, done) { const s = new Set(API.me.skills || []); s.has(name) ? s.delete(name) : s.add(name); try { await API.updateProfile({ skills: [...s] }); haptic(8); done && done(); } catch (x) { toast(errMsg(x), 'x'); } }

function worldExtras(id, S) {
  const sp = SPORTS[id];
  return `<div class="pad">
    <div class="wsec"><h2>Histórico</h2><span class="wmute small">${S.count} ${S.count === 1 ? 'atividade' : 'atividades'}</span></div>
    ${S.count ? `<div class="stack">${S.list.slice(0, 6).map(actRow).join('')}</div>` : emptyBox(`Sua primeira atividade de ${sp.name.toLowerCase()} aparece aqui.`)}
    <div class="wsec"><h2>Desafios de ${sp.name.toLowerCase()}</h2></div><div data-async="w-ch"><div class="card skeleton" style="height:120px"></div></div>
    <div class="wsec"><h2>Comunidade</h2><button class="link" data-social-filter="${id}">Ver feed</button></div><div data-async="w-feed"><div class="card skeleton" style="height:200px"></div></div>
    <div class="wsec"><h2>Equipamentos</h2><span class="wmute small">busca nas lojas</span></div>
    <div class="hscroll">${SHOP[id].map((p, i) => productCard(p, id, i)).join('')}</div>
    <div class="wsec"><h2>Playlists</h2><span class="wmute small">abre no Spotify</span></div>
    <div class="hscroll">${MUSIC[id].map((p, i) => `<a style="width:150px;text-align:left;display:block;color:inherit;text-decoration:none" class="press" href="${spotifyUrl(p[0])}" target="_blank" rel="noopener">${coverArt(p[0], id, p[2], i)}<div class="small wmute" style="margin-top:8px">${p[1]}</div></a>`).join('')}</div>
    <div style="height:40px"></div></div>`;
}
const chartCard = (cls = 'card', extra = '') => `<div class="${cls}" style="${extra}"><div class="w-seg" style="margin-bottom:16px">${seg([['W', 'Semana'], ['M', '12 semanas'], ['Y', '12 meses']], 'M', 'per')}</div>${chartHTML('wch' + Math.random().toString(36).slice(2, 7)).replace('class="chart"', 'class="chart w-chart"')}<div class="axis w-axis"></div></div>`;
const recList = (S, cls = 'list-item', st = '') => S.records.length ? `<div class="stack">${S.records.map(r => `<div class="${cls}" style="${st}display:flex;align-items:center;gap:14px;padding:14px"><span class="ico" style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:rgba(255,255,255,.08)">${icon('medal', 19)}</span><div style="flex:1"><div class="h3">${esc(r.k)}</div><div class="wmute small">${r.d}</div></div><span class="num" style="font-size:18px">${r.v}</span></div>`).join('')}</div>` : emptyBox('Seus recordes pessoais aparecem aqui conforme você treina.');
const WCTA = {
  musculacao: () => { const w = nextWorkout(); return w ? `<button class="btn btn-white" data-push="liftLive" data-params='${JSON.stringify({ wid: w.id })}' style="justify-content:flex-start;padding-left:28px">Começar ${esc(w.name)}<span class="knob" style="background:#0B0B0B">${icon('arrow', 20, 2)}</span></button>` : `<button class="btn btn-white" data-new-ficha>${icon('plus', 18)}Criar minha primeira ficha</button>`; },
  corrida: () => `<button class="btn" style="background:#0E1412;color:#fff;box-shadow:0 14px 30px -12px rgba(0,0,0,.5)" data-push="runLive" data-params='{"id":"corrida"}'>${icon('pin', 18)}Iniciar corrida com GPS</button>`,
  calistenia: () => `<button class="btn" style="background:linear-gradient(90deg,#A3FF12,#1FCB6B);color:#06140A" data-push="genericLive" data-params='{"id":"calistenia"}'>${icon('bolt', 18, 2)}Começar sessão</button>`,
  futebol: () => `<button class="btn" style="background:#FFC23D;color:#1A1200" data-push="genericLive" data-params='{"id":"futebol"}'>${icon('ball', 18, 2)}Registrar partida</button>`,
  natacao: () => `<button class="btn" style="background:#fff;color:#0A2C57" data-push="genericLive" data-params='{"id":"natacao"}'>${icon('swim', 18, 2)}Iniciar treino</button>`,
  boxe: () => `<button class="btn" style="background:#FF3B4E;color:#fff;box-shadow:0 14px 34px -10px #FF3B4E" data-push="genericLive" data-params='{"id":"boxe"}'>${icon('glove', 18, 2)}Iniciar rounds</button>`,
  ciclismo: () => `<button class="btn" style="background:#FF7426;color:#fff;box-shadow:0 14px 34px -10px #FF7426" data-push="runLive" data-params='{"id":"ciclismo"}'>${icon('bike', 18, 2)}Começar pedal com GPS</button>`,
};
const WORLD = {};

/* 1. Musculação — noite azul */
WORLD.musculacao = (sp, S) => { const nw = nextWorkout(); const lastL = S.last; const wk = S.week; const sets = wk.reduce((s, a) => s + (a.sets || []).length, 0); const vol = wk.reduce((s, a) => s + (a.volume || 0), 0) / 1000; const time = wk.reduce((s, a) => s + (a.duration || 0), 0);
  return `<div class="w-hero" style="height:560px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('musculacao', 'musculacao', { eager: true, fade: 'background:linear-gradient(180deg,rgba(6,20,38,.6),transparent 25%,transparent 50%,rgba(6,20,38,.85) 80%,#061426)' })}</div>
    <div class="w-hero-in" style="position:absolute;left:20px;top:calc(var(--safe-top) + 70px)"><h1 class="w-title" style="font-family:var(--display);font-weight:600;font-size:30px;line-height:1.1;margin:0;letter-spacing:-.02em">Olá, ${esc(firstName())},</h1><div style="font-family:var(--display);font-weight:300;font-size:28px;letter-spacing:-.02em" data-e="1">${lastL ? 'Bem-vindo de volta!' : 'Bora começar?'}</div></div>
    <div class="w-hero-in" style="position:absolute;left:16px;right:16px;bottom:10px"><div class="h2" style="font-size:20px;margin-bottom:12px" data-e="2">Sua semana</div>
      <div class="fp-card" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center" data-e="3">${[['bolt', wk.length, 'treinos'], ['flame', fmt(vol, 1), 't volume'], ['grid', sets, 'séries'], ['timer', hms(time), 'tempo']].map(x => `<div><span class="fp-ic" style="margin:0 auto">${icon(x[0], 18)}</span><div class="num" style="font-size:17px;margin-top:8px">${x[1]}</div><div class="wmute" style="font-size:10.5px">${x[2]}</div></div>`).join('')}</div></div></div>
  <div class="pad"><div class="wgrid">
   <div><div class="wsec" data-e="4"><h2>Próximo treino</h2><button class="link" data-new-ficha>+ Nova ficha</button></div>
    ${nw ? `<button class="fp-card press" style="width:100%;text-align:left;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center" data-push="workout" data-params='${JSON.stringify({ wid: nw.id })}' data-e="5"><div><div class="h2" style="font-size:20px;line-height:1.15">${esc(nw.name)}<br><span style="font-weight:400;opacity:.8">${esc(nw.focus || '')}</span></div><div style="height:1px;background:rgba(255,255,255,.15);margin:12px 0"></div><div class="wmute small">${nw.exercises.length} exercícios · ${nw.exercises.reduce((s, e) => s + e.sets, 0)} séries</div></div>
      ${ring(S.goal.p, { size: 76, sw: 6, color: '#4C8DFF', inner: `<span style="font-size:10px;line-height:1.2">Meta<br><b style="font-size:13px">${S.goal.value}/${S.goal.target}</b></span>` })}</button>`
    : `<div class="fp-card" style="text-align:center;padding:24px" data-e="5"><div class="h3">Você ainda não tem fichas</div><p class="wmute small" style="margin:8px 0 14px">Comece de um modelo (A, B, C, D) ou monte do zero.</p><button class="btn btn-white btn-sm" data-new-ficha>Criar ficha</button></div>`}
    <div class="wsec"><h2>Meta da semana</h2><button class="link" data-goal>Editar</button></div>
    <div class="fp-card"><div class="w-gauge">${gauge(S.goal.p, { w: 290, color: '#7FB2FF', label: `${S.goal.value} de ${S.goal.target} ${S.goal.unit}` })}</div>
      ${[['timer', 'Tempo na semana', hms(time)], ['flame', 'Volume na semana', fmt(vol, 1) + ' t'], ['medal', 'Volume total', fmt(S.total, 1) + ' t']].map(r => `<div class="between" style="padding:12px 0;border-top:1px solid rgba(255,255,255,.1)"><div class="row"><span class="fp-ic">${icon(r[0], 18)}</span><span>${r[1]}</span></div><div class="num" style="font-size:17px">${r[2]}</div></div>`).join('')}</div></div>
   <div><div class="wsec"><h2>Suas fichas</h2><span class="wmute small">${API.workouts.length}</span></div>
    ${API.workouts.length ? `<div class="stack">${API.workouts.map(f => `<button class="fp-card press row" style="text-align:left;padding:12px" data-push="workout" data-params='${JSON.stringify({ wid: f.id })}'><span class="fp-ic" style="width:46px;height:46px;font-family:var(--display);font-weight:700;font-size:16px">${esc((f.name.match(/\b([A-Z])\b/) || [0, f.name[0]])[1])}</span><div style="flex:1;min-width:0"><div class="h3">${esc(f.name)}${f.focus ? ' — ' + esc(f.focus) : ''}</div><div class="wmute small">${f.exercises.length} exercícios</div></div>${icon('next', 18)}</button>`).join('')}</div>` : emptyBox('Crie fichas com seus exercícios, séries, repetições e cargas.')}
    <div class="wsec"><h2>Evolução do volume</h2></div>${chartCard('fp-card')}
    <div class="wsec"><h2>Recordes</h2></div>${recList(S, 'fp-card')}</div></div></div>`; };

/* 2. Corrida — run club claro */
WORLD.corrida = (sp, S) => { const L = S.last;
  return `<div class="w-hero" style="height:700px;border-radius:0 0 36px 36px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('corrida', 'corrida', { eager: true, filter: 'grayscale(.55) contrast(1.02) brightness(1.18)', grade: false, fade: 'background:linear-gradient(180deg,rgba(64,104,98,.5),rgba(80,122,116,.18) 35%,rgba(56,92,86,.3) 70%,rgba(36,64,60,.85))' })}</div>
    <div class="w-hero-in" style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 74px)">
      <h1 class="w-title" style="font-family:var(--display);font-weight:700;font-size:40px;line-height:1;margin:0;color:#fff;letter-spacing:-.04em">Cada corrida</h1>
      <h1 class="w-title" style="font-family:var(--display);font-weight:700;font-size:40px;line-height:1;margin:0;color:rgba(255,255,255,.55);letter-spacing:-.04em">conta sua história.</h1>
      <div class="row" style="gap:8px;margin-top:18px;flex-wrap:wrap" data-e="2"><button class="nrc-chip on" data-push="runLive" data-params='{"id":"corrida"}'>Iniciar corrida</button><button class="nrc-chip" data-goal>Meta semanal</button><button class="nrc-chip" data-push="manualAct" data-params='{"id":"corrida"}'>Adicionar manual</button></div></div>
    <div class="w-hero-in grid2" style="position:absolute;left:16px;right:16px;bottom:22px" data-e="3">
      <button class="nrc-glass" style="text-align:left" data-goal><div class="small" style="opacity:.85">${icon('timer', 14, 2, 'style="display:inline;vertical-align:-2px"')} Meta da semana</div><div style="position:relative;height:18px;margin:14px 0 8px"><div style="position:absolute;top:8px;left:0;right:0;height:2px;background:rgba(255,255,255,.25)"></div><div style="position:absolute;top:8px;left:0;width:${S.goal.p * 100}%;height:2px;background:#fff"></div><div style="position:absolute;top:2px;left:calc(${S.goal.p * 100}% - 7px);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:9px solid #fff"></div></div><div class="num" style="font-size:22px">${Math.round(S.goal.p * 100)}%</div></button>
      <div class="nrc-glass"><div class="small" style="opacity:.85">${icon('route', 14, 2, 'style="display:inline;vertical-align:-2px"')} Na semana</div><div style="display:flex;gap:3px;height:18px;align-items:flex-end;margin:14px 0 8px">${Array.from({ length: 22 }, (_, i) => `<i style="flex:1;height:${i % 5 === 0 ? 18 : 10}px;background:rgba(255,255,255,${i / 22 < S.goal.p ? .9 : .3})"></i>`).join('')}</div><div class="num" style="font-size:22px">${nv(S.weekTotal, 1)} <span style="font-size:13px;opacity:.8">km</span></div></div></div></div>
  <div class="pad" style="padding-top:22px"><div class="wgrid">
   <div>${L ? `<div class="between" data-e="4"><div><div class="muted small">Última corrida · ${new Date(L.startedAt).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}</div><div style="font-family:var(--display);font-weight:700;font-size:24px;letter-spacing:-.03em;margin-top:4px">${esc(L.title || 'Corrida')}</div></div></div>
    <div class="grid2" style="margin-top:16px" data-e="5">${[['speed', 'Pace médio', paceOf(L.duration, L.distance)], ['route', 'Distância', fmt((L.distance || 0) / 1000, 2) + ' km'], ['clock', 'Tempo', hms(L.duration)], ['heartbeat', 'Corridas na semana', String(S.weekCount)]].map(c => `<div class="nrc-card"><div class="row small muted" style="gap:8px">${icon(c[0], 16)}${c[1]}</div><div class="num" style="font-size:28px;margin-top:14px;color:#0E1412">${c[2]}</div></div>`).join('')}</div>
    ${L.route && L.route.length > 1 ? `<div class="nrc-card" style="padding:0;overflow:hidden;margin-top:12px;height:280px;position:relative">${routeSVG(L.route, { color: '#0E1412', light: true })}</div>` : ''}
    ${L.splits && L.splits.length ? `<div class="wsec"><h2>Pace por km</h2><span class="muted small">última corrida</span></div><div class="nrc-card stack" style="gap:10px">${(() => { const mx = Math.max(...L.splits), mn = Math.min(...L.splits); return L.splits.slice(0, 12).map((v, i) => `<div class="row" style="gap:12px"><span class="muted small" style="width:38px">km ${i + 1}</span><div style="flex:1;height:8px;border-radius:8px;background:#EEF1F0;overflow:hidden"><i data-bar="${mx === mn ? 1 : .35 + .65 * (mx - v) / (mx - mn)}" data-delay="${i * 70}" style="display:block;height:100%;background:#0E1412;border-radius:8px;transform-origin:left;transform:scaleX(0)"></i></div><span class="num" style="font-size:15px;width:48px;text-align:right">${paceStr(v / 60)}</span></div>`).join(''); })()}</div>` : ''}`
    : `<div class="nrc-card" style="text-align:center;padding:28px" data-e="4"><div style="font-family:var(--display);font-weight:700;font-size:22px">Sua primeira corrida</div><p class="muted small" style="margin:8px 0 0;line-height:1.55">Toque em <b>Iniciar corrida com GPS</b>. Mantenha a tela ligada: o trajeto, a distância e o pace são gravados em tempo real.</p></div>`}</div>
   <div><div class="wsec"><h2>Distância</h2></div>${chartCard('nrc-card')}
    <div class="wsec"><h2>Recordes</h2></div>${recList(S)}</div></div></div>`; };

/* 3. Ciclismo — vidro e laranja */
WORLD.ciclismo = (sp, S) => { const L = S.last; const spd = S.week.length ? S.week.reduce((s, a) => s + (a.distance || 0), 0) / Math.max(1, S.week.reduce((s, a) => s + (a.duration || 0), 0)) * 3.6 : 0;
  return `<div class="w-hero" style="height:600px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('ciclismo', 'ciclismo', { eager: true, grade: false, fade: 'background:linear-gradient(180deg,rgba(30,50,72,.6),transparent 30%,transparent 55%,rgba(30,50,72,.95))' })}</div>
    <div class="w-hero-in" style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 76px)"><h1 class="w-title" style="font-family:var(--display);font-weight:700;font-size:40px;line-height:1.05;margin:0;letter-spacing:-.04em">Pedale forte</h1><div data-e="1" style="font-family:var(--display);font-weight:700;font-size:40px;line-height:1.1;letter-spacing:-.04em">Vá <span class="ax-hl">longe</span></div></div>
    <div class="w-hero-in ax-card" style="position:absolute;left:12px;right:12px;bottom:14px" data-e="3"><div class="row" style="gap:8px;flex-wrap:wrap"><span class="ax-pill">${icon('route', 15)}${nv(S.weekTotal, 1)} km na semana</span><span class="ax-pill">${icon('bike', 15)}${S.weekCount} pedais</span><span class="ax-pill">${icon('speed', 15)}${fmt(spd, 1)} km/h</span></div>
      <div class="row" style="margin-top:14px;gap:10px"><span class="wmute small" style="flex:1">Meta: ${nv(S.goal.value, 1)} de ${nv(S.goal.target, 1)} ${S.goal.unit} nesta semana</span><button class="icon-btn" style="background:radial-gradient(circle at 35% 30%,#FFB07A,#FF7426);color:#fff" aria-label="Começar pedal" data-push="runLive" data-params='{"id":"ciclismo"}'>${icon('arrow', 20, 2)}</button></div></div></div>
  <div class="pad"><div class="wgrid">
   <div><div class="ax-card" style="margin-top:18px" data-e="4"><div class="between"><div class="row"><span class="fp-ic">${icon('chart', 18)}</span><div><div class="h3">Meta da semana</div><div class="wmute small">${S.goal.unit === 'km' ? 'Quilômetros pedalados' : 'Pedais concluídos'}</div></div></div><button class="link" data-goal>Editar</button></div>
      <div style="position:relative;width:260px;height:150px;margin:18px auto 0"><svg viewBox="0 0 260 150" width="260" height="150" aria-hidden="true"><path d="M20 140 A110 110 0 0 1 240 140" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="22" stroke-linecap="round" stroke-dasharray="4 6"/>${S.goal.p > 0 ? `<path d="${arcPath(130, 140, 110, Math.PI, Math.PI + Math.PI * S.goal.p)}" fill="none" stroke="#FF7426" stroke-width="22" stroke-linecap="round" data-draw="1600"/>` : ''}</svg>
        <div style="position:absolute;left:0;right:0;bottom:6px;text-align:center"><div class="num" style="font-size:46px;line-height:1"><span data-count="${Math.round(S.goal.p * 100)}">0</span>%</div><div class="wmute small">${nv(S.goal.value, 1)} / ${nv(S.goal.target, 1)} ${S.goal.unit}</div></div></div>
      <div class="grid2" style="margin-top:14px">${[['speed', 'Vel. média', fmt(spd, 1), 'km/h'], ['clock', 'Tempo', hms(S.week.reduce((s, a) => s + (a.duration || 0), 0)), 'semana']].map(t => `<div class="ax-card" style="padding:14px;border-radius:24px"><div class="row" style="gap:8px"><span class="fp-ic" style="color:#FF7426">${icon(t[0], 16)}</span><span class="h3">${t[1]}</span></div><div class="num" style="font-size:24px;margin-top:10px">${t[2]} <span class="small wmute">${t[3]}</span></div></div>`).join('')}</div></div>
    ${L ? `<div class="ax-card" style="margin-top:12px;padding:0;overflow:hidden;height:${L.route && L.route.length > 1 ? 300 : 170}px;position:relative">${L.route && L.route.length > 1 ? routeSVG(L.route, { color: '#FF7426' }) : `<img src="${photo('ciclismo', 1)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(2px) brightness(.6)">`}
      <div style="position:absolute;left:18px;top:16px" class="row"><span class="fp-ic">${icon('bike', 18)}</span><div><div class="h3">${esc(L.title || 'Último pedal')}</div><div class="small" style="opacity:.8">${shortDate(L.startedAt)}</div></div></div>
      <div class="ax-card" style="position:absolute;left:12px;right:12px;bottom:12px;padding:10px 14px;border-radius:999px;display:flex;justify-content:space-around;text-align:center"><div><div class="num" style="font-size:18px">${fmt((L.distance || 0) / 1000, 1)}</div><div class="wmute" style="font-size:10px">km</div></div><div><div class="num" style="font-size:18px">${hms(L.duration)}</div><div class="wmute" style="font-size:10px">duração</div></div><div><div class="num" style="font-size:18px">${fmt((L.distance || 0) / Math.max(1, L.duration) * 3.6, 1)}</div><div class="wmute" style="font-size:10px">km/h</div></div></div></div>`
      : `<div class="ax-card" style="margin-top:12px;text-align:center;padding:26px"><div class="h3">Nenhum pedal ainda</div><p class="wmute small" style="margin:8px 0 0">Grave com GPS ou adicione manualmente.</p><button class="btn btn-ghost btn-sm" style="margin-top:12px" data-push="manualAct" data-params='{"id":"ciclismo"}'>Adicionar manual</button></div>`}</div>
   <div><div class="wsec"><h2>Distância</h2></div>${chartCard('ax-card')}<div class="wsec"><h2>Recordes</h2></div>${recList(S, 'ax-card')}</div></div></div>`; };

/* 4. Calistenia — preto neon */
WORLD.calistenia = (sp, S) => { const w0 = startOfWeek(Date.now()); const days = new Set(S.list.filter(a => a.startedAt >= w0).map(a => dkey(a.startedAt))); const today = dkey(Date.now()); const skills = new Set(API.me.skills || []);
  return `<div style="position:absolute;left:0;right:0;top:0;height:420px;background:radial-gradient(90% 70% at 30% 0%,rgba(163,255,18,.22),transparent 70%);pointer-events:none"></div>
  <div class="pad" style="padding-top:calc(var(--safe-top) + 70px);position:relative"><div class="wgrid"><div>
    <div class="between" data-e="0"><div class="row">${meAv()}<div><div class="h3" style="font-size:17px">Olá, ${esc(firstName())}</div><div class="wmute small">${S.weekCount ? `${S.weekCount} ${S.weekCount > 1 ? 'sessões' : 'sessão'} nesta semana` : 'Pronto pra barra?'}</div></div></div></div>
    <div class="nn-pill" style="margin-top:20px" data-e="1"><span style="width:56px;height:56px;border-radius:50%;background:#0B1406;color:#A3FF12;display:grid;place-items:center;flex:none">${icon('trophy', 24)}</span><div style="flex:1"><div class="h3" style="font-size:16px">Meta da semana</div><div class="small">${nv(S.goal.value, 1)} de ${nv(S.goal.target, 1)} ${S.goal.unit}</div></div><button class="btn btn-sm" style="background:#fff;color:#06140A" data-goal>Editar</button></div>
    <div class="row" style="margin-top:22px;gap:2px" data-e="2">${['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d, i) => { const k = dkey(w0 + i * DAY); return `<div class="nn-day ${days.has(k) ? 'done' : ''} ${k === today ? 'today' : ''}"><span>${d}</span><b>${new Date(w0 + i * DAY).getDate()}</b></div>`; }).join('')}</div>
    <div class="wsec" data-e="3"><h2>Sessões rápidas</h2></div>
    <div class="hscroll" data-e="4">${[['calistenia', 'Barra & paralelas', ['Barra fixa', 'Paralelas', 'Flexão de braço']], ['calistenia-2', 'Empurrar', ['Paralelas', 'Pike push-up', 'Flexão de braço']], ['calistenia-3', 'Core & equilíbrio', ['L-sit (s)', 'Hollow hold (s)', 'Prancha (s)']]].map(c => `<button class="press" style="position:relative;width:150px;height:190px;border-radius:24px;overflow:hidden;text-align:left" data-push="genericLive" data-params='${JSON.stringify({ id: 'calistenia', preset: c[2] })}'><img src="${pimg(c[0], true)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"><span style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,.85))"></span><span style="position:absolute;left:12px;bottom:12px;right:12px;color:#fff"><b style="font-size:14px">${c[1]}</b><br><span class="small" style="opacity:.8">${c[2].length} blocos</span></span></button>`).join('')}</div>
    <div class="wsec"><h2>Repetições</h2><span class="num" style="color:#A3FF12;font-size:20px">${nv(S.weekTotal)} na semana</span></div>${chartCard('nn-card')}</div>
   <div><div class="wsec"><h2>Árvore de habilidades</h2><span class="wmute small">${skills.size}/${SKILLS.length} · toque para marcar</span></div>
    <div class="stack" style="gap:8px">${SKILLS.map(n => `<button class="skill-node ${skills.has(n) ? 'unlocked' : ''}" style="background:#111311;text-align:left;width:100%" data-skill="${esc(n)}" aria-pressed="${skills.has(n)}"><span class="lv" style="${skills.has(n) ? '' : 'background:rgba(255,255,255,.06)'}">${skills.has(n) ? icon('check', 18, 2.6) : icon('lock', 16)}</span><div style="flex:1"><div class="h3">${esc(n)}</div><div class="wmute small">${skills.has(n) ? 'Dominada' : 'Ainda não'}</div></div></button>`).join('')}</div>
    <div class="wsec"><h2>Recordes por exercício</h2></div>${recList(S, 'nn-card')}</div></div></div>`; };

/* 5. Futebol — dia de jogo */
WORLD.futebol = (sp, S) => { const X = S.extra; const L = S.last;
  return `<div class="w-hero" style="height:640px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('futebol', 'futebol', { eager: true, grade: false, fade: 'background:linear-gradient(180deg,rgba(6,18,11,.55),transparent 28%,transparent 45%,rgba(6,18,11,.92) 78%,#06120B)' })}</div>
    <div class="w-hero-in" style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 76px)"><div class="kicker" style="color:#FFC23D" data-e="1">${S.count} ${S.count === 1 ? 'partida registrada' : 'partidas registradas'}</div><h1 class="w-title" style="font-family:var(--display);font-weight:800;font-size:52px;line-height:.95;margin:10px 0 0;letter-spacing:-.05em">Dia de jogo</h1></div>
    <div class="w-hero-in fb-card" style="position:absolute;left:14px;right:14px;bottom:16px" data-e="2">${L ? `<div class="between"><span class="kicker">Último jogo · ${shortDate(L.startedAt)}</span><span class="tag" style="color:${L.scoreFor > L.scoreAgainst ? '#A3FF12' : L.scoreFor < L.scoreAgainst ? '#FF6B76' : '#ddd'}">${L.scoreFor > L.scoreAgainst ? 'Vitória' : L.scoreFor < L.scoreAgainst ? 'Derrota' : 'Empate'}</span></div>
      <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin:12px 0 6px;text-align:center"><div><div class="h3">${esc(L.team || 'Meu time')}</div></div><div class="num" style="font-size:52px;color:#FFC23D;letter-spacing:-.05em">${L.scoreFor ?? 0} <span style="opacity:.5">:</span> ${L.scoreAgainst ?? 0}</div><div><div class="h3">${esc(L.opponent || 'Adversário')}</div></div></div>
      <div class="wmute small" style="text-align:center">Seus números: ${L.goals || 0} ${L.goals === 1 ? 'gol' : 'gols'} · ${L.assists || 0} ${L.assists === 1 ? 'assistência' : 'assistências'}</div>` : `<div style="text-align:center;padding:8px"><div class="h3">Nenhuma partida ainda</div><p class="wmute small" style="margin:6px 0 0">Registre placar, gols e assistências a cada jogo.</p></div>`}</div></div>
  <div class="pad"><div class="wgrid"><div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);margin-top:20px" data-e="3">${[[S.count, 'Partidas'], [X.goals, 'Gols'], [X.assists, 'Assist.'], [X.w, 'Vitórias']].map(x => `<div><div class="num" style="font-size:28px;color:#FFC23D"><span data-count="${x[0]}">0</span></div><div class="wmute" style="font-size:11px">${x[1]}</div></div>`).join('')}</div>
    <div class="wsec"><h2>Resultados</h2><span class="wmute small">${X.w}V · ${X.d}E · ${X.l}D</span></div>
    <div class="fb-card">${S.count ? `<div style="display:flex;height:14px;border-radius:8px;overflow:hidden;gap:3px">${[[X.w, '#A3FF12'], [X.d, '#8a8a8a'], [X.l, '#FF4D5E']].filter(x => x[0]).map(x => `<i style="flex:${x[0]};background:${x[1]}"></i>`).join('')}</div><div class="between small wmute" style="margin-top:10px"><span>Aproveitamento</span><b style="color:#fff">${Math.round((X.w * 3 + X.d) / Math.max(1, S.count * 3) * 100)}%</b></div>` : '<div class="wmute small">Os resultados aparecem depois da primeira partida.</div>'}</div>
    <div class="wsec"><h2>Meta da semana</h2><button class="link" data-goal>Editar</button></div>
    <div class="fb-card" style="padding:0;overflow:hidden;height:170px;position:relative"><img src="${photo('futebol', 1)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"><span style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,18,11,.95),rgba(6,18,11,.25))"></span>
      <div style="position:absolute;left:18px;top:18px;right:110px"><div class="kicker" style="color:#FFC23D">${S.goal.unit}</div><div class="num" style="font-size:34px;margin-top:8px">${nv(S.goal.value, 1)}<span class="small wmute"> / ${nv(S.goal.target, 1)}</span></div><div class="bar" style="margin-top:10px"><i data-bar="${S.goal.p}" style="transform:scaleX(0);background:#FFC23D;box-shadow:none"></i></div></div></div></div>
   <div><div class="wsec"><h2>Gols + assistências</h2></div>${chartCard('fb-card')}<div class="wsec"><h2>Recordes</h2></div>${recList(S, 'fb-card')}</div></div></div>`; };

/* 6. Natação — aqua editorial */
WORLD.natacao = (sp, S) => { const month = S.month; const laps = month.reduce((s, a) => s + (a.laps || 0), 0); const best = S.records.find(r => r.k.startsWith('Melhor ritmo'));
  const recent = S.list.filter(a => a.startedAt > Date.now() - 30 * DAY && a.distance > 0); const avg = recent.length ? recent.reduce((s, a) => s + a.duration, 0) / recent.reduce((s, a) => s + a.distance, 0) * 100 : 0;
  return `<div class="w-hero" style="height:660px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('natacao', 'natacao', { eager: true, grade: false, fade: 'background:linear-gradient(180deg,rgba(10,44,87,.75),rgba(10,44,87,.15) 35%,transparent 55%,rgba(10,44,87,.7) 85%,#0A2C57)' })}</div>
    <div class="w-hero-in" style="position:absolute;left:22px;right:22px;top:calc(var(--safe-top) + 74px)"><h1 class="w-title" style="font-family:var(--display);font-weight:800;font-size:42px;line-height:.98;margin:0;color:rgba(255,255,255,.62);letter-spacing:-.04em;text-transform:uppercase">Deslize mais longe</h1></div>
    <div class="tx-tilt" style="position:absolute;left:16px;bottom:120px;width:170px;transform:rotate(-9deg)" data-e="2"><div class="num" style="font-size:40px;color:#06213F">${laps}</div><div style="font-size:14px;color:#0A2C57;font-weight:600">Voltas no mês</div></div>
    <div class="tx-tilt" style="position:absolute;right:16px;bottom:110px;width:160px" data-e="3"><div class="num" style="font-size:36px;color:#fff">${best ? best.v : '—'}</div><div style="font-size:14px;color:#fff;font-weight:600">Melhor 100 m</div></div>
    <div class="w-hero-in" style="position:absolute;left:20px;right:20px;bottom:24px;display:grid;grid-template-columns:repeat(4,1fr)" data-e="4">${[[fmt(S.monthTotal, 2), 'km no mês'], [S.weekCount, 'treinos/sem.'], [fmt(S.total, 1), 'km total'], [Stats.streak(API.acts), 'dias seguidos']].map(x => `<div><div class="num" style="font-size:24px;font-style:italic">${x[0]}</div><div style="font-size:11px;opacity:.8">${x[1]}</div></div>`).join('')}</div></div>
  <div class="pad"><div class="wgrid"><div>
    <div class="tx-white" style="margin-top:6px" data-e="5"><div class="between"><div class="h2" style="font-size:20px">Ritmo médio por 100 m</div><span class="small" style="color:#4A6587">Últimos 30 dias</span></div>
      <div class="row" style="gap:10px;align-items:baseline;margin-top:12px"><span class="num" style="font-size:40px;font-style:italic">${avg ? hms(avg) : '—'}</span><span class="small" style="color:#4A6587">${recent.length} ${recent.length === 1 ? 'treino' : 'treinos'}</span></div>
      <div class="between small" style="margin-top:14px"><b>Meta da semana</b><button style="color:#1B6FB0;font-weight:700" data-goal>Editar</button></div>
      <div style="height:8px;border-radius:8px;background:#DCE6F2;margin:8px 0 4px;overflow:hidden"><i data-bar="${S.goal.p}" style="display:block;height:100%;background:#0A2C57;transform-origin:left;transform:scaleX(0)"></i></div><div class="small" style="color:#4A6587">${nv(S.goal.value, 2)} de ${nv(S.goal.target, 1)} ${S.goal.unit}</div>
      <div class="grid2" style="margin-top:14px">${['natacao-2', 'natacao-3'].map(n => `<img src="${pimg(n, true)}" alt="" style="width:100%;height:130px;object-fit:cover;border-radius:22px">`).join('')}</div></div>
    <div class="wsec"><h2>Estilos</h2></div><div class="tx-white stack" style="gap:14px">${S.extra.strokes.length ? S.extra.strokes.map(([n, v], i) => `<div><div class="between small"><b>${n}</b><span style="color:#4A6587">${Math.round(v * 100)}%</span></div><div style="height:6px;border-radius:6px;background:#DCE6F2;margin-top:7px;overflow:hidden"><i data-bar="${v}" data-delay="${i * 100}" style="display:block;height:100%;background:#1B6FB0;transform-origin:left;transform:scaleX(0)"></i></div></div>`).join('') : '<div class="small" style="color:#4A6587">A divisão por estilo aparece depois do primeiro treino.</div>'}</div></div>
   <div><div class="wsec"><h2>Distância</h2></div>${chartCard('card', 'background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.15)')}<div class="wsec"><h2>Recordes</h2></div>${recList(S, 'list-item', 'background:rgba(255,255,255,.07);')}</div></div></div>`; };

/* 7. Boxe — fight night */
WORLD.boxe = (sp, S) => { const wr = S.week.reduce((s, a) => s + (a.rounds || 0), 0); const segs = Math.min(24, Math.max(6, S.goal.kind === 'metric' ? S.goal.target : 12));
  return `<div class="w-hero" style="height:640px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('boxe', 'boxe', { eager: true, grade: false, fade: 'background:linear-gradient(180deg,rgba(11,5,6,.55),transparent 28%,transparent 45%,rgba(11,5,6,.92) 78%,#0B0506)' })}</div>
    <div class="outline-num" style="position:absolute;right:-10px;top:120px;font-size:200px" aria-hidden="true">${wr}</div>
    <div class="w-hero-in" style="position:absolute;left:20px;right:20px;bottom:26px"><div class="kicker" style="color:#FF3B4E" data-e="1">Rounds nesta semana</div><h1 class="w-title" style="font-family:var(--display);font-weight:800;font-size:54px;line-height:.92;margin:10px 0 14px;letter-spacing:-.05em">Guarda alta</h1>
      <div class="row" style="gap:5px" data-e="3">${Array.from({ length: segs }, (_, i) => `<span class="bx-seg ${i < Math.round(S.goal.p * segs) ? 'done' : ''}"></span>`).join('')}</div><div class="between wmute small" style="margin-top:8px"><span>${nv(S.goal.value)} ${S.goal.unit}</span><button class="link" data-goal style="padding:0">meta ${nv(S.goal.target)}</button></div></div></div>
  <div class="pad"><div class="wgrid"><div>
    <div class="grid3" style="margin-top:10px" data-e="4">${[[wr, 'Rounds/sem.'], [S.weekCount, 'Treinos/sem.'], [S.extra.rounds, 'Rounds total']].map((x, i) => `<div class="bx-card"><div class="num" style="font-size:28px"><span data-count="${x[0]}">0</span></div><div class="wmute small">${x[1]}</div></div>`).join('')}</div>
    <div class="bx-card" style="margin-top:12px" data-e="5"><div class="between"><div class="h3">Meta da semana</div><span class="tag" style="color:#FF3B4E">${Math.round(S.goal.p * 100)}%</span></div><div class="w-gauge" style="margin-top:8px">${gauge(S.goal.p, { w: 280, color: '#FF3B4E', label: `${nv(S.goal.value)} de ${nv(S.goal.target)} ${S.goal.unit}` })}</div></div>
    <div class="wsec" data-e="6"><h2>Combinações para treinar</h2></div>
    <div class="stack" style="gap:8px" data-e="7">${BOX_COMBOS.slice(0, 5).map((c, i) => `<div class="bx-card row" style="padding:12px 16px"><span class="num" style="font-size:18px;color:#FF3B4E;width:40px">${i + 1}</span><span style="flex:1">${c}</span></div>`).join('')}</div></div>
   <div><div class="wsec"><h2>Rounds</h2></div>${chartCard('bx-card')}<div class="wsec"><h2>Recordes</h2></div>${recList(S, 'bx-card')}</div></div></div>`; };

function arcPath(cx, cy, r, a0, a1) { const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1); return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; }

/* ---------- Notificações ---------- */
async function refreshNotifDot() { try { const L = await API.notifications(); const n = L.filter(x => !x.read).length; $$('.notif-dot').forEach(d => d.hidden = !n); $$('[data-notif-count]').forEach(d => { d.textContent = n; d.hidden = !n; }); } catch (e) {} }
async function openNotifications() {
  const close = Sheet.open(`<h3 class="h2" data-e="0">Notificações</h3><div class="stack nf" style="margin-top:16px;gap:8px"><div class="card skeleton" style="height:60px"></div></div>`, null, { label: 'Notificações' });
  try { const L = await API.notifications(); const box = $('.sheet-wrap:last-child .nf');
    const txt = n => n.type === 'like' ? 'curtiu seu post' : n.type === 'comment' ? `comentou: “${esc(n.text || '')}”` : n.type === 'follow' ? 'começou a seguir você' : 'interagiu com você';
    box.innerHTML = L.length ? L.map(n => `<button class="list-item" style="text-align:left;${n.read ? '' : 'border-color:rgba(227,25,43,.5)'}" data-profile="${n.from}">${avatar({ name: n.fromName, avatar: n.fromAvatar })}<div style="flex:1"><div style="font-size:14px;line-height:1.4"><b>${esc((n.fromName || '').split(' ')[0])}</b> ${txt(n)}</div><div class="muted small" style="margin-top:2px">${ago(n.ts)}</div></div></button>`).join('') : '<p class="muted small">Nada por aqui ainda.</p>';
    hydrateImages(box); box.addEventListener('click', e => { const b = e.target.closest('[data-profile]'); if (b) { close(); Nav.push('user', { id: b.dataset.profile }); } });
    API.markNotifsRead(L).then(refreshNotifDot); } catch (x) { toast(errMsg(x), 'x'); }
}
function shareSheet(title, text, url) {
  Sheet.open(`<h3 class="h2" data-e="0">Compartilhar</h3><div class="card" style="margin:16px 0" data-e="1"><div class="h3">${esc(title)}</div><div class="muted small" style="margin-top:6px;line-height:1.5">${esc(text)}</div></div>
    <div class="grid2" data-e="2"><button class="btn btn-white" data-sh="copy">${icon('copy', 18)}Copiar</button><button class="btn btn-ghost" data-sh="native">${icon('share', 18)}Enviar</button></div>`,
    (w, close) => w.addEventListener('click', async e => { const b = e.target.closest('[data-sh]'); if (!b) return; const full = `${title} — ${text}${url ? '\n' + url : ''}`;
      if (b.dataset.sh === 'native' && navigator.share) { try { await navigator.share({ title, text, url }); close(); return; } catch (x) { return; } }
      try { await navigator.clipboard.writeText(full); toast('Copiado'); } catch (x) { toast('Não foi possível copiar', 'x'); } close(); }), { label: 'Compartilhar' });
}
