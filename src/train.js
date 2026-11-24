/* ============================================================
   ORA GYM — Treinar: fichas, musculação ao vivo, GPS (corrida/pedal),
   boxe, natação, futebol, calistenia e registro manual
   ============================================================ */
const mmss = hms;
const lastSetsFor = exn => { for (const a of API.acts) { if (a.sport !== 'musculacao') continue; const s = (a.sets || []).filter(x => x.ex === exn); if (s.length) return s; } return null; };
const bestKg = exn => { let b = 0; API.acts.forEach(a => (a.sets || []).forEach(s => { if (s.ex === exn && s.kg > b) b = s.kg; })); return b; };
let audioCtx = null;
function beep(f = 880, d = .15, n = 1) { try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); for (let i = 0; i < n; i++) { const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.value = f; o.connect(g); g.connect(audioCtx.destination); const t = audioCtx.currentTime + i * (d + .08); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.3, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.start(t); o.stop(t + d + .02); } } catch (e) {} }
async function keepAwake() { try { if ('wakeLock' in navigator) return await navigator.wakeLock.request('screen'); } catch (e) {} return null; }

/* ---------------- Aba Treinar ---------------- */
function trainBody(id) {
  const sp = SPORTS[id]; const S = SS(id);
  const recent = S.count ? `<div class="wsec"><h2>Recentes</h2><button class="link" data-push="world" data-params='{"id":"${id}"}'>Ver espaço</button></div><div class="stack">${S.list.slice(0, 3).map(actRow).join('')}</div>` : '';
  if (id === 'musculacao') return `<div class="wsec"><h2>Suas fichas</h2><button class="link" data-new-ficha>+ Nova ficha</button></div>
    ${API.workouts.length ? `<div class="stack tr-list">${API.workouts.map((f, i) => `<button class="card press" style="text-align:left;padding:16px" data-push="workout" data-params='${JSON.stringify({ wid: f.id })}' data-e="${i}"><div class="row"><span class="display" style="font-size:24px;width:44px;color:var(--accent)">${esc((f.name.match(/\b([A-Z])\b/) || [0, f.name[0]])[1])}</span><div style="flex:1;min-width:0"><div class="h3">${esc(f.name)}${f.focus ? ' — ' + esc(f.focus) : ''}</div><div class="muted small" style="margin-top:3px">${f.exercises.length} exercícios · ${f.exercises.reduce((s, e) => s + e.sets, 0)} séries</div></div><span class="icon-btn" style="background:var(--accent);color:#0B0B0B;width:42px;height:42px" data-push="liftLive" data-params='${JSON.stringify({ wid: f.id })}' aria-label="Começar ${esc(f.name)}">${icon('play', 16)}</span></div></button>`).join('')}</div>`
      : emptyBox('Crie sua primeira ficha a partir de um modelo ou do zero.', `<button class="btn btn-accent btn-sm" data-new-ficha>${icon('plus', 16)}Criar ficha</button>`)}
    <button class="list-item press" style="text-align:left;margin-top:10px;width:100%" data-push="liftLive" data-params='{"free":1}'><span class="ico">${icon('bolt', 20)}</span><div style="flex:1"><div class="h3">Treino livre</div><div class="muted small">Escolha os exercícios na hora</div></div>${icon('next', 18)}</button>${recent}`;
  if (id === 'corrida' || id === 'ciclismo') return `<div class="wsec"><h2>Registrar</h2></div><div class="stack">
    <button class="list-item press" style="text-align:left" data-push="runLive" data-params='{"id":"${id}"}'><span class="ico">${icon('pin', 21)}</span><div style="flex:1"><div class="h3">${id === 'corrida' ? 'Corrida' : 'Pedal'} com GPS</div><div class="muted small" style="margin-top:3px">Trajeto, distância e ${id === 'corrida' ? 'pace' : 'velocidade'} em tempo real</div></div>${icon('play', 16)}</button>
    <button class="list-item press" style="text-align:left" data-push="manualAct" data-params='{"id":"${id}"}'><span class="ico">${icon('edit', 21)}</span><div style="flex:1"><div class="h3">Adicionar manualmente</div><div class="muted small" style="margin-top:3px">Esteira, rolo ou atividade feita sem o app</div></div>${icon('next', 16)}</button></div>
    <div class="card row" style="margin-top:14px;gap:12px"><span style="color:#A3FF12">${icon('shield', 22)}</span><div class="small muted" style="line-height:1.5">A localização só é usada enquanto você grava. Mantenha a tela ligada durante a atividade para o GPS não pausar.</div></div>${recent}`;
  const L = { calistenia: ['Sessão de calistenia', 'Blocos, séries e repetições'], futebol: ['Registrar partida', 'Placar, gols e assistências'], natacao: ['Treino na piscina', 'Contador de voltas e ritmo'], boxe: ['Rounds no timer', 'Round, descanso e combinações'] }[id];
  return `<div class="wsec"><h2>Registrar</h2></div><div class="stack"><button class="list-item press" style="text-align:left" data-push="genericLive" data-params='{"id":"${id}"}'><span class="ico">${icon(sp.icon, 21)}</span><div style="flex:1"><div class="h3">${L[0]}</div><div class="muted small" style="margin-top:3px">${L[1]}</div></div>${icon('play', 16)}</button>
    <button class="list-item press" style="text-align:left" data-push="manualAct" data-params='{"id":"${id}"}'><span class="ico">${icon('edit', 21)}</span><div style="flex:1"><div class="h3">Adicionar manualmente</div><div class="muted small" style="margin-top:3px">Atividade que você já fez</div></div>${icon('next', 16)}</button></div>${recent}`;
}
let trainSport = null;
Screens.train = {
  render() {
    const mine = mySports(); const id = trainSport && mine.includes(trainSport) ? trainSport : mine[0]; trainSport = id; setAccent(id);
    return `<div class="scroll"><div class="pad page" style="padding-top:calc(var(--safe-top) + 14px)">
      <div class="kicker" data-e="0">Treinar</div><h1 class="display tr-title" style="font-size:40px;margin:10px 0 20px">Bora treinar</h1>
      <div class="hscroll tr-tiles" style="gap:10px" data-e="2">${mine.map(sid => { const s = SPORTS[sid]; return `<button class="sport-tile ${sid === id ? 'on' : ''}" style="--sc:${s.c};width:128px;height:168px" data-tsport="${sid}" aria-pressed="${sid === id}">
        <div style="position:absolute;inset:0">${scene('tile-' + sid, sid, { sm: true, fade: 'background:linear-gradient(180deg,transparent 25%,rgba(11,11,11,.95))' })}</div>
        <span class="lbl"><span style="color:${s.c}">${icon(s.icon, 20)}</span><span class="display" style="display:block;font-size:17px;margin-top:6px">${s.name}</span></span></button>`; }).join('')}
        <button class="space-add" style="width:110px;height:168px" data-edit-sports>${icon('plus', 22, 2)}<span class="small">Esporte</span></button></div>
      <div id="tr-body">${trainBody(id)}</div><div class="bottom-space"></div></div></div>`;
  },
  mount(el) {
    Motion.kinetic($('.tr-title', el), 120); wireActRows(el);
    el.addEventListener('click', e => {
      if (e.target.closest('[data-new-ficha]')) { fichaEditor(null, () => Nav.refresh()); return; }
      if (e.target.closest('[data-edit-sports]')) { editSportsSheet(); return; }
      const b = e.target.closest('[data-tsport]'); if (!b) return; const id = b.dataset.tsport; if (id === trainSport) return; haptic(8); trainSport = id; setAccent(id);
      $$('[data-tsport]', el).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      const body = $('#tr-body', el); A(body, [{ opacity: 1 }, { opacity: 0, transform: 'translateX(-20px)' }], { duration: 160, easing: 'in' }).finished.then(() => { body.getAnimations().forEach(a => a.cancel()); body.innerHTML = trainBody(id); Motion.enter(body, 0, 50); Motion.fillBars(body); });
    });
  },
  onReturn() { Nav.refresh(); },
};

/* ---------------- Editor de ficha ---------------- */
function fichaEditor(w, done) {
  const draft = w ? JSON.parse(JSON.stringify(w)) : { name: '', focus: '', exercises: [] };
  const exRow = (x, i) => `<div class="list-item" style="display:block;padding:12px 14px" data-exi="${i}"><div class="between"><div class="h3" style="flex:1;min-width:0">${esc(x.n)}</div><button class="icon-btn" style="width:34px;height:34px;background:rgba(255,255,255,.06)" data-exdel="${i}" aria-label="Remover ${esc(x.n)}">${icon('x', 15)}</button></div>
    <div class="grid3" style="margin-top:10px;grid-template-columns:repeat(4,1fr);gap:6px">${[['sets', 'Séries'], ['reps', 'Reps'], ['kg', 'Carga kg'], ['rest', 'Desc. s']].map(([k, l]) => `<label style="display:flex;flex-direction:column;gap:4px;font-size:10.5px;color:var(--mute)">${l}<input class="input" style="height:40px;padding:0 10px" type="number" inputmode="decimal" min="0" step="${k === 'kg' ? .5 : 1}" value="${x[k]}" data-exf="${i}.${k}"></label>`).join('')}</div></div>`;
  const body = () => `<h3 class="h2" data-e="0">${w ? 'Editar ficha' : 'Nova ficha'}</h3>
    ${!w ? `<div class="kicker" style="margin:16px 0 8px">Começar de um modelo</div><div class="row" style="gap:8px;flex-wrap:wrap">${WORKOUT_TEMPLATES.map((t, i) => `<button class="chip" data-tpl="${i}">${t.name} · ${t.focus}</button>`).join('')}</div>` : ''}
    <div class="grid2" style="margin-top:16px"><div class="field"><label for="fe-n">Nome</label><input class="input" id="fe-n" value="${esc(draft.name)}" placeholder="Ex.: Treino A"></div><div class="field"><label for="fe-f">Foco</label><input class="input" id="fe-f" value="${esc(draft.focus)}" placeholder="Ex.: Peito & Tríceps"></div></div>
    <div class="between" style="margin:6px 0 10px"><b>Exercícios</b><span class="muted small">${draft.exercises.length}</span></div>
    <div class="stack fe-list" style="gap:8px">${draft.exercises.map(exRow).join('') || '<p class="muted small">Adicione exercícios abaixo.</p>'}</div>
    <div class="field" style="margin-top:14px"><label for="fe-add">Adicionar exercício</label><input class="input" id="fe-add" list="fe-cat" placeholder="Busque ou digite um nome"><datalist id="fe-cat">${Object.values(EXERCISES).flat().map(e => `<option value="${esc(e)}">`).join('')}</datalist></div>
    <button class="btn btn-ghost btn-block" data-feadd>${icon('plus', 18)}Adicionar</button>
    <div class="row" style="gap:10px;margin-top:16px"><button class="btn btn-white" style="flex:1" data-fesave>Salvar ficha</button>${w ? `<button class="btn btn-ghost" style="color:#FF6B76" data-fedel aria-label="Excluir ficha">${icon('trash', 18)}</button>` : ''}</div>`;
  Sheet.open(`<div class="fe">${body()}</div>`, (wrap, close) => {
    const root = $('.fe', wrap); const redraw = () => { draft.name = $('#fe-n', root).value; draft.focus = $('#fe-f', root).value; root.innerHTML = body(); };
    root.addEventListener('input', e => { const f = e.target.dataset.exf; if (f) { const [i, k] = f.split('.'); draft.exercises[+i][k] = +e.target.value || 0; } });
    root.addEventListener('click', async e => {
      const t = e.target.closest('[data-tpl]'); if (t) { const tp = WORKOUT_TEMPLATES[+t.dataset.tpl]; Object.assign(draft, JSON.parse(JSON.stringify(tp))); root.innerHTML = body(); return; }
      const d = e.target.closest('[data-exdel]'); if (d) { draft.name = $('#fe-n', root).value; draft.focus = $('#fe-f', root).value; draft.exercises.splice(+d.dataset.exdel, 1); root.innerHTML = body(); return; }
      if (e.target.closest('[data-feadd]')) { const n = $('#fe-add', root).value.trim(); if (!n) return; draft.name = $('#fe-n', root).value; draft.focus = $('#fe-f', root).value; draft.exercises.push({ n, sets: 3, reps: 10, kg: 0, rest: 90 }); root.innerHTML = body(); haptic(6); return; }
      if (e.target.closest('[data-fesave]')) { draft.name = $('#fe-n', root).value.trim(); draft.focus = $('#fe-f', root).value.trim(); if (!draft.name) return toast('Dê um nome para a ficha', 'x'); if (!draft.exercises.length) return toast('Adicione ao menos um exercício', 'x');
        try { await API.saveWorkout(draft); close(); toast('Ficha salva'); done && done(); } catch (x) { toast(errMsg(x), 'x'); } }
      if (e.target.closest('[data-fedel]')) { close(); if (await confirmDialog('Excluir ficha?', 'O histórico dos treinos feitos com ela continua salvo.', 'Excluir', true)) { await API.removeWorkout(w.id); toast('Ficha excluída', 'trash'); done && done(); Nav.back(); } }
    });
  }, { label: 'Ficha' });
}

/* ---------------- Detalhe da ficha ---------------- */
Screens.workout = {
  render({ wid }) {
    setAccent('musculacao'); const f = API.workouts.find(x => x.id === wid); if (!f) return `<div class="pad" style="padding-top:100px"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><p class="muted">Ficha não encontrada.</p></div>`;
    const done = API.acts.filter(a => a.workoutId === wid);
    return `<div class="topbar"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">${esc(f.name)}</div><button class="icon-btn glass" aria-label="Editar ficha" data-edit>${icon('edit', 18)}</button></div>
    <div class="scroll"><div style="position:relative;height:330px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('musculacao', 'musculacao', { i: 1 })}</div>
      <div class="pad page" style="position:absolute;left:0;right:0;bottom:18px"><div class="kicker" style="color:var(--accent)" data-e="1">${esc(f.name)} · ${done.length ? 'feito ' + done.length + 'x' : 'nunca feito'}</div><h1 class="display" style="font-size:34px;margin:8px 0 14px" data-e="2">${esc(f.focus || f.name)}</h1>
      <div class="row" style="gap:8px" data-e="3"><span class="tag">${icon('dumbbell', 13)}${f.exercises.length} exercícios</span><span class="tag">${icon('grid', 13)}${f.exercises.reduce((s, e) => s + e.sets, 0)} séries</span>${done[0] ? `<span class="tag">${icon('clock', 13)}último: ${shortDate(done[0].startedAt)}</span>` : ''}</div></div></div>
      <div class="pad page"><div class="stack" style="margin-top:14px">${f.exercises.map((x, i) => { const b = bestKg(x.n); return `<button class="list-item press" style="text-align:left" data-push="exercise" data-params='${JSON.stringify({ n: x.n })}' data-e="${4 + i}"><span class="ico"><span class="num" style="font-size:17px">${i + 1}</span></span><div style="flex:1;min-width:0"><div class="h3">${esc(x.n)}</div><div class="muted small" style="margin-top:3px">${x.sets} × ${x.reps}${x.kg ? ' · ' + fmt(x.kg, x.kg % 1 ? 1 : 0) + ' kg' : ''} · descanso ${x.rest}s${b ? ' · recorde ' + fmt(b, b % 1 ? 1 : 0) + ' kg' : ''}</div></div>${icon('next', 18)}</button>`; }).join('')}</div>
      <div style="height:110px"></div></div></div>
      <div class="wcta" data-e="10"><button class="btn btn-accent" data-push="liftLive" data-params='${JSON.stringify({ wid })}'>${icon('play', 18)}Começar treino</button></div>`;
  },
  mount(el, { wid }) { bindScrollFx(el, { bar: $('.topbar', el), hero: $('.hero-stack', el), threshold: 200 }); const ed = $('[data-edit]', el); if (ed) ed.onclick = () => fichaEditor(API.workouts.find(x => x.id === wid), () => { el.innerHTML = Screens.workout.render({ wid }); Screens.workout.mount(el, { wid }); Motion.enter(el, 0, 20); }); },
};
Screens.exercise = {
  render({ n }) {
    const hist = []; API.acts.slice().reverse().forEach(a => { const s = (a.sets || []).filter(x => x.ex === n); if (s.length) hist.push([a.startedAt, Math.max(...s.map(x => x.kg || 0)), s]); });
    const b = bestKg(n); const g = EX_GROUP[n] || 'Exercício';
    return `<div class="topbar solid"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">${esc(n)}</div><span style="width:46px"></span></div>
    <div class="scroll"><div class="pad page" style="padding-top:calc(var(--safe-top) + 74px)"><div class="kicker" style="color:var(--accent)">${esc(g)}</div><h1 class="display" style="font-size:30px;margin:8px 0 18px">${esc(n)}</h1>
      <div class="grid3">${[['Recorde', b ? fmt(b, b % 1 ? 1 : 0) + ' kg' : '—'], ['Treinos', String(hist.length)], ['1RM estimado', (() => { let best = 0; hist.forEach(h => h[2].forEach(s => { const v = (s.kg || 0) * (1 + (s.reps || 0) / 30); if (v > best) best = v; })); return best ? Math.round(best) + ' kg' : '—'; })()]].map(s => `<div class="card" style="padding:14px"><div class="muted small">${s[0]}</div><div class="num" style="font-size:22px;margin-top:6px">${s[1]}</div></div>`).join('')}</div>
      <div class="wsec"><h2>Carga máxima por treino</h2></div>${hist.length > 1 ? `<div class="card">${chartHTML('exch')}</div>` : emptyBox('Faça este exercício em pelo menos dois treinos para ver a evolução.')}
      <div class="wsec"><h2>Histórico</h2></div>${hist.length ? `<div class="stack">${hist.slice().reverse().slice(0, 12).map(h => `<div class="list-item" style="display:block"><div class="between"><b>${shortDate(h[0])}</b><span class="num" style="font-size:16px">${fmt(h[1], h[1] % 1 ? 1 : 0)} kg</span></div><div class="muted small" style="margin-top:4px">${h[2].map(s => `${fmt(s.kg || 0, (s.kg || 0) % 1 ? 1 : 0)}×${s.reps}`).join(' · ')}</div></div>`).join('')}</div>` : emptyBox('Nenhuma série registrada ainda.')}
      <div style="height:40px"></div></div></div>`;
  },
  mount(el, { n }) { const hist = []; API.acts.slice().reverse().forEach(a => { const s = (a.sets || []).filter(x => x.ex === n); if (s.length) hist.push([a.startedAt, Math.max(...s.map(x => x.kg || 0))]); }); const c = $('#exch', el); if (c && hist.length > 1) mountChart(c, hist.map(h => h[1]), { unit: 'kg', floor: true, tipLabel: i => shortDate(hist[i][0]) }); },
};

/* ---------------- Musculação ao vivo ---------------- */
Screens.liftLive = {
  noSwipe: true,
  render() {
    setAccent('musculacao');
    return `<div style="position:absolute;inset:0;background:radial-gradient(90% 50% at 80% 0%,color-mix(in oklab,var(--accent) 26%,transparent),transparent 70%),#0B0B0B"></div>
    <div style="position:absolute;inset:0;opacity:.3">${scene('musculacao', 'musculacao', { fade: 'background:linear-gradient(180deg,rgba(11,11,11,.3),#0B0B0B 62%)' })}</div>
    <div class="topbar"><button class="icon-btn glass" id="ll-close" aria-label="Encerrar treino">${icon('x', 20, 2)}</button>
      <div class="glass" style="border-radius:999px;padding:8px 14px;display:flex;gap:8px;align-items:center"><span class="dot" style="background:#FF4D5E;box-shadow:0 0 10px #FF4D5E"></span><span class="num" style="font-size:18px" id="ll-elapsed">00:00</span></div>
      <button class="tag" id="ll-idx" style="height:34px">—</button></div>
    <div class="live-col" style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 74px);bottom:24px;display:flex;flex-direction:column">
      <div id="ll-head"></div><div class="set-dots" style="margin:18px 0 0" id="ll-dots"></div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:14px">
        <div class="stepper"><button class="icon-btn" data-kg="-2.5" aria-label="Diminuir carga">${icon('minus', 22, 2)}</button><div style="text-align:center"><div class="live-num" style="font-size:72px"><span id="ll-kg">0</span><span style="font-size:22px;color:var(--mute);margin-left:6px">kg</span></div><div class="muted small" id="ll-pr"></div></div><button class="icon-btn" data-kg="2.5" aria-label="Aumentar carga">${icon('plus', 22, 2)}</button></div>
        <div class="stepper"><button class="icon-btn" data-rp="-1" aria-label="Menos repetições">${icon('minus', 20, 2)}</button><div style="text-align:center"><div class="live-num" style="font-size:46px" id="ll-reps">0</div><div class="muted small">repetições</div></div><button class="icon-btn" data-rp="1" aria-label="Mais repetições">${icon('plus', 20, 2)}</button></div></div>
      <button class="btn btn-accent btn-block" id="ll-done" style="height:62px;font-size:16px;color:#0B0B0B">${icon('check', 20, 2.4)}<span>Concluir série</span></button>
      <div class="row" style="gap:8px;margin-top:10px"><button class="btn btn-ghost btn-sm" style="flex:1" id="ll-next">Próximo exercício</button><button class="btn btn-ghost btn-sm" style="flex:1" id="ll-add">+ Exercício</button><button class="btn btn-ghost btn-sm" style="flex:1" id="ll-fin">Finalizar</button></div></div>
    <div id="ll-rest" style="position:absolute;inset:0;z-index:60;display:none;flex-direction:column;align-items:center;justify-content:center;background:rgba(4,4,6,.92);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)">
      <div class="kicker">Descanso</div><div style="position:relative;width:260px;height:260px;margin:22px 0 26px"><svg width="260" height="260" style="transform:rotate(-90deg)" aria-hidden="true"><circle cx="130" cy="130" r="118" stroke="rgba(255,255,255,.08)" stroke-width="10" fill="none"/><circle id="ll-rest-c" cx="130" cy="130" r="118" stroke-width="10" fill="none" stroke-linecap="round" style="stroke:var(--accent);filter:drop-shadow(0 0 12px var(--accent))" stroke-dasharray="${2 * Math.PI * 118}"/></svg>
      <div style="position:absolute;inset:0;display:grid;place-items:center"><div style="text-align:center"><div class="live-num" style="font-size:72px" id="ll-rest-t">90</div><div class="muted small">segundos</div></div></div></div>
      <div class="row"><button class="btn btn-ghost" id="ll-rest-add">+15 s</button><button class="btn btn-white" id="ll-rest-skip">Pular descanso</button></div><div class="muted small" style="margin-top:24px" id="ll-rest-next"></div></div>`;
  },
  mount(el, { wid, free }) {
    const W = wid ? API.workouts.find(x => x.id === wid) : null;
    const plan = W ? W.exercises.map(x => ({ ...x })) : [];
    const S = { i: 0, set: 0, kg: 0, reps: 10, t0: Date.now(), sets: [], prs: [], rest: null };
    const tick = setInterval(() => { if (!el.isConnected) return clearInterval(tick); $('#ll-elapsed', el).textContent = hms((Date.now() - S.t0) / 1000); }, 500);
    let lock = null; keepAwake().then(l => lock = l);
    el._cleanup = () => { clearInterval(tick); S.rest && clearInterval(S.rest.iv); try { lock && lock.release(); } catch (e) {} };
    const kgEl = $('#ll-kg', el), repsEl = $('#ll-reps', el);
    const cur = () => plan[S.i];
    const load = anim => { const x = cur(); const head = $('#ll-head', el);
      if (!x) { head.innerHTML = `<div class="kicker">Treino livre</div><h1 class="display" style="font-size:30px;margin:8px 0 0">Adicione um exercício</h1>`; $('#ll-dots', el).innerHTML = ''; $('#ll-idx', el).textContent = '0/0'; return; }
      const prev = lastSetsFor(x.n); S.kg = x.kg || (prev ? prev[0].kg : 0); S.reps = x.reps || (prev ? prev[0].reps : 10); S.set = S.sets.filter(s => s.ex === x.n).length;
      $('#ll-idx', el).textContent = `${S.i + 1}/${plan.length}`;
      head.innerHTML = `<div class="kicker" style="color:var(--accent)">Exercício ${S.i + 1} · ${esc(EX_GROUP[x.n] || '')}</div><h1 class="display ll-title" style="font-size:30px;margin:8px 0 0">${esc(x.n)}</h1>${prev ? `<div class="muted small" style="margin-top:6px">Última vez: ${prev.map(s => `${fmt(s.kg || 0, (s.kg || 0) % 1 ? 1 : 0)}×${s.reps}`).join(' · ')}</div>` : ''}`;
      Motion.kinetic($('.ll-title', head), anim ? 60 : 300); dots(); kgEl.textContent = fmt(S.kg, S.kg % 1 ? 1 : 0); repsEl.textContent = S.reps; prText(); };
    const dots = () => { const x = cur(); if (!x) return; $('#ll-dots', el).innerHTML = Array.from({ length: Math.max(x.sets, S.set + 1) }, (_, i) => `<i class="${i < S.set ? 'done' : i === S.set ? 'cur' : ''}"></i>`).join(''); };
    const prText = () => { const x = cur(); if (!x) return; const b = Math.max(bestKg(x.n), ...S.sets.filter(s => s.ex === x.n).map(s => s.kg), 0); $('#ll-pr', el).innerHTML = b ? (S.kg > b ? `<span style="color:#A3FF12">Acima do seu recorde (${fmt(b, b % 1 ? 1 : 0)} kg)</span>` : `Recorde: ${fmt(b, b % 1 ? 1 : 0)} kg`) : 'Primeira vez neste exercício'; };
    const roll = (node, val, dir) => { node.textContent = val; A(node, [{ transform: `translateY(${dir * 14}px)`, opacity: .2 }, { transform: 'none', opacity: 1 }], { spring: [320, 20] }); };
    el.addEventListener('click', e => { const k = e.target.closest('[data-kg]'), r = e.target.closest('[data-rp]');
      if (k) { haptic(5); const d = +k.dataset.kg; S.kg = Math.max(0, S.kg + d); roll(kgEl, fmt(S.kg, S.kg % 1 ? 1 : 0), d > 0 ? 1 : -1); prText(); }
      if (r) { haptic(5); const d = +r.dataset.rp; S.reps = Math.max(1, S.reps + d); roll(repsEl, S.reps, d > 0 ? 1 : -1); } });
    const addEx = () => { Sheet.open(`<h3 class="h2">Adicionar exercício</h3><div class="field" style="margin-top:14px"><label for="la-n">Exercício</label><input class="input" id="la-n" list="la-cat" placeholder="Busque ou digite"><datalist id="la-cat">${Object.values(EXERCISES).flat().map(e => `<option value="${esc(e)}">`).join('')}</datalist></div><button class="btn btn-white btn-block" data-la>Adicionar</button>`,
      (w, close) => { $('[data-la]', w).onclick = () => { const n = $('#la-n', w).value.trim(); if (!n) return; plan.push({ n, sets: 3, reps: 10, kg: 0, rest: 90 }); S.i = plan.length - 1; close(); load(true); }; }, { label: 'Exercício' }); };
    $('#ll-add', el).onclick = addEx; $('#ll-idx', el).onclick = () => { if (!plan.length) return; Sheet.open(`<h3 class="h2">Exercícios</h3><div class="stack" style="margin-top:12px;gap:8px">${plan.map((x, i) => `<button class="list-item" style="text-align:left;${i === S.i ? 'border-color:var(--accent)' : ''}" data-go="${i}"><span class="ico">${i + 1}</span><div style="flex:1"><div class="h3">${esc(x.n)}</div><div class="muted small">${S.sets.filter(s => s.ex === x.n).length}/${x.sets} séries</div></div></button>`).join('')}</div>`, (w, close) => w.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { S.i = +b.dataset.go; close(); load(true); } }), { label: 'Exercícios' }); };
    $('#ll-next', el).onclick = () => { if (S.i < plan.length - 1) { S.i++; load(true); } else toast('Esse é o último exercício', 'check'); };
    $('#ll-done', el).onclick = async () => {
      const x = cur(); if (!x) return addEx(); haptic([8, 30, 12]);
      const prevBest = Math.max(bestKg(x.n), ...S.sets.filter(s => s.ex === x.n).map(s => s.kg), 0);
      S.sets.push({ ex: x.n, kg: S.kg, reps: S.reps }); S.set++; dots();
      if (S.kg > prevBest && prevBest > 0 && !S.prs.includes(x.n)) { S.prs.push(x.n); await celebrate({ title: 'Novo recorde pessoal', sub: x.n, big: fmt(S.kg, S.kg % 1 ? 1 : 0) + ' kg', points: 0, color: '#A3FF12', icon: 'medal', share: false }); }
      if (S.set >= x.sets) { if (S.i < plan.length - 1) startRest(x.rest || 90, () => { S.i++; load(true); }, `Próximo: ${plan[S.i + 1].n}`); else { toast('Último exercício concluído — finalize quando quiser', 'trophy'); prText(); } }
      else startRest(x.rest || 90, () => {}, `Série ${S.set + 1} de ${x.sets}`);
    };
    const startRest = (secs, then, label) => {
      const ov = $('#ll-rest', el), c = $('#ll-rest-c', el), t = $('#ll-rest-t', el); const C = 2 * Math.PI * 118; let total = secs, base = secs; const t1 = Date.now(); $('#ll-rest-next', el).textContent = label;
      ov.style.display = 'flex'; A(ov, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
      const upd = left => { t.textContent = Math.ceil(left); c.style.strokeDashoffset = C * (1 - left / total); };
      const iv = setInterval(() => { const left = base - (Date.now() - t1) / 1000; if (left <= 0) end(); else { upd(left); if (Math.ceil(left) === 3 && !iv._b) { iv._b = 1; beep(660, .12, 2); } } }, 100); upd(secs);
      const end = () => { clearInterval(iv); S.rest = null; beep(990, .25); haptic([20, 60, 20]); A(ov, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 }).finished.then(() => ov.style.display = 'none'); then(); };
      S.rest = { iv }; $('#ll-rest-add', el).onclick = () => { base += 15; total += 15; }; $('#ll-rest-skip', el).onclick = end;
    };
    const finish = () => { if (!S.sets.length) { toast('Conclua ao menos uma série', 'x'); return; } el._cleanup();
      const dur = (Date.now() - S.t0) / 1000; const vol = S.sets.reduce((s, x) => s + (x.kg || 0) * x.reps, 0);
      Nav.push('summary', { act: { sport: 'musculacao', title: W ? `${W.name}${W.focus ? ' — ' + W.focus : ''}` : 'Treino livre', startedAt: S.t0, duration: Math.round(dur), sets: S.sets, volume: vol, workoutId: W ? W.id : null, prs: S.prs } }); };
    $('#ll-fin', el).onclick = finish;
    $('#ll-close', el).onclick = async () => { if (!S.sets.length) { el._cleanup(); return Nav.back(); } if (await confirmDialog('Encerrar treino?', 'Você pode salvar as séries que já concluiu.', 'Ir para o resumo')) finish(); };
    load(false); if (!plan.length) addEx();
  },
  unmount(el) { el._cleanup && el._cleanup(); },
};

/* ---------------- Corrida / pedal com GPS real ---------------- */
Screens.runLive = {
  noSwipe: true,
  render({ id = 'corrida' }) {
    setAccent(id); const isRun = id === 'corrida';
    return `<div style="position:absolute;inset:0;background:#0B141F" id="rl-map"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,11,11,.75),transparent 24%,transparent 46%,rgba(11,11,11,.92) 70%);pointer-events:none;z-index:400"></div>
    <div class="topbar" style="z-index:500"><button class="icon-btn glass" id="rl-close" aria-label="Fechar">${icon('back', 20, 2)}</button>
      <div class="glass" style="border-radius:999px;padding:9px 14px;font-size:12.5px;font-weight:600;display:flex;gap:8px;align-items:center"><span class="dot" id="rl-gps" style="background:#FFC23D"></span><span id="rl-gpst">Procurando GPS…</span></div><span style="width:46px"></span></div>
    <div class="live-col" style="position:absolute;left:16px;right:16px;bottom:22px;z-index:500">
      <div style="text-align:center;margin-bottom:16px"><div class="live-num" style="font-size:84px" id="rl-time">00:00</div><div class="muted small">Tempo em movimento</div></div>
      <div class="glass" style="border-radius:30px;padding:18px 10px;display:grid;grid-template-columns:repeat(3,1fr);text-align:center">
        <div><div class="num" style="font-size:28px" id="rl-dist">0,00</div><div class="muted small">km</div></div>
        <div style="border-left:1px solid var(--stroke);border-right:1px solid var(--stroke)"><div class="num" style="font-size:28px" id="rl-pace">--</div><div class="muted small">${isRun ? 'pace atual' : 'km/h'}</div></div>
        <div><div class="num" style="font-size:28px" id="rl-avg">--</div><div class="muted small">${isRun ? 'pace médio' : 'média km/h'}</div></div></div>
      <div id="rl-ctrl" style="display:flex;justify-content:center;gap:16px;margin-top:18px;min-height:84px;align-items:center"><button class="btn btn-white" id="rl-start" style="height:64px;padding:0 34px" disabled>${icon('play', 18)}Aguardando sinal…</button></div></div>`;
  },
  mount(el, { id = 'corrida' }) {
    const isRun = id === 'corrida'; const color = isRun ? '#FFFFFF' : '#FF7426';
    const S = { state: 'wait', pts: [], dist: 0, moving: 0, lastT: 0, last: null, startedAt: 0, splits: [], kmMark: 1000, kmT: 0, watch: null, fix: null, best: 999 };
    let map = null, line = null, dot = null, lock = null, svgTimer = null;
    const mapBox = $('#rl-map', el);
    if (window.L) { try { map = L.map(mapBox, { zoomControl: false, attributionControl: true }).setView([-15.78, -47.93], 4);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '© OpenStreetMap © CARTO' }).addTo(map);
      line = L.polyline([], { color, weight: 5, opacity: .95 }).addTo(map); dot = L.circleMarker([0, 0], { radius: 8, color: '#fff', weight: 3, fillColor: color, fillOpacity: 1 }); setTimeout(() => map.invalidateSize(), 300); } catch (e) { map = null; } }
    if (!map) { svgTimer = setInterval(() => { if (S.pts.length > 1) mapBox.innerHTML = routeSVG(S.pts, { color }); }, 3000); }
    const gpsUI = (txt, col) => { $('#rl-gpst', el).textContent = txt; $('#rl-gps', el).style.background = col; };
    const upd = () => { $('#rl-time', el).textContent = hms(S.moving); $('#rl-dist', el).textContent = fmt(S.dist / 1000, 2);
      const avg = S.dist > 20 ? (isRun ? paceOf(S.moving, S.dist) : fmt(S.dist / S.moving * 3.6, 1)) : '--'; $('#rl-avg', el).textContent = avg; };
    const onPos = p => { const { latitude: la, longitude: lo, accuracy: acc, speed } = p.coords; const now = p.timestamp || Date.now(); S.fix = [la, lo];
      gpsUI(acc <= 25 ? `GPS forte · ±${Math.round(acc)} m` : `GPS fraco · ±${Math.round(acc)} m`, acc <= 25 ? '#A3FF12' : '#FFC23D');
      if (S.state === 'wait') { if (acc <= 50) { const b = $('#rl-start', el); b.disabled = false; b.innerHTML = `${icon('play', 18)}Iniciar`; } if (map) { map.setView([la, lo], 16); dot.setLatLng([la, lo]).addTo(map); } return; }
      if (map) dot.setLatLng([la, lo]);
      if (S.state !== 'run' || acc > 35) return;
      if (S.last) { const d = haversine(S.last.c, [la, lo]); const dt = (now - S.last.t) / 1000; if (dt <= 0) return; const v = d / dt;
        if (v > (isRun ? 12 : 30) || d < 2) return; S.dist += d; $('#rl-pace', el).textContent = isRun ? (speed > .5 ? paceStr(1000 / speed / 60) : paceOf(dt, d)) : fmt((speed || v) * 3.6, 1);
        if (S.dist >= S.kmMark) { const sp = S.moving - S.kmT; S.splits.push(Math.round(sp)); S.kmT = S.moving; toast(`${S.kmMark / 1000} km · ${isRun ? paceStr(sp / 60) + '/km' : hms(sp)}`, 'route'); beep(880, .15, 2); haptic([15, 40, 15]); S.kmMark += 1000; } }
      S.last = { c: [la, lo], t: now }; S.pts.push([+la.toFixed(6), +lo.toFixed(6)]); if (line) { line.addLatLng([la, lo]); map.panTo([la, lo], { animate: true }); } upd(); };
    const onErr = e => { if (e.code === 1) { gpsUI('Permissão de localização negada', '#FF4D5E'); $('#rl-ctrl', el).innerHTML = `<div class="card" style="text-align:center"><div class="h3">Precisamos da sua localização</div><p class="muted small" style="margin:8px 0 12px">Libere a localização para este site nas configurações do navegador e tente de novo. Ou registre manualmente.</p><button class="btn btn-white btn-sm" data-push="manualAct" data-params='{"id":"${id}"}'>Adicionar manualmente</button></div>`; }
      else gpsUI('Sem sinal de GPS — vá para área aberta', '#FF4D5E'); };
    if (!('geolocation' in navigator)) onErr({ code: 1 }); else S.watch = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
    setTimeout(() => { if (S.state === 'wait' && S.fix) { const b = $('#rl-start', el); if (b && b.disabled) { b.disabled = false; b.innerHTML = `${icon('play', 18)}Iniciar mesmo assim`; } } }, 12000);
    const clock = setInterval(() => { if (S.state === 'run') { const n = Date.now(); S.moving += (n - S.lastT) / 1000; S.lastT = n; upd(); } }, 500);
    el._cleanup = () => { clearInterval(clock); clearInterval(svgTimer); if (S.watch != null) navigator.geolocation.clearWatch(S.watch); try { lock && lock.release(); } catch (e) {} try { map && map.remove(); } catch (e) {} };
    const ctrl = $('#rl-ctrl', el);
    const running = () => { ctrl.innerHTML = `<button class="icon-btn" id="rl-pause" style="width:84px;height:84px;background:var(--accent);color:#0B0B0B;box-shadow:0 14px 36px -10px var(--accent)" aria-label="Pausar">${icon('pause', 30)}</button>`; $('#rl-pause', el).onclick = paused; };
    const paused = () => { S.state = 'pause'; haptic(12); S.last = null;
      ctrl.innerHTML = `<button class="icon-btn" id="rl-resume" style="width:74px;height:74px;background:var(--accent);color:#0B0B0B" aria-label="Retomar">${icon('play', 28)}</button><button class="btn hold-btn" id="rl-finish" style="height:74px;padding:0 26px;background:#fff;color:#0B0B0B"><span class="fill"></span><span style="position:relative">${icon('stop', 18)}</span><span style="position:relative">Segure para finalizar</span></button>`;
      $('#rl-resume', el).onclick = () => { S.state = 'run'; S.lastT = Date.now(); running(); };
      const fb = $('#rl-finish', el), fill = $('.fill', fb); let ha;
      const down = () => { ha = A(fill, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: Motion.reduced ? 1 : 900, easing: 'linear' }); ha.finished.then(() => { if (!ha._c) done(); }); };
      const up = () => { if (ha && ha.playState === 'running') { ha._c = true; ha.cancel(); } };
      fb.addEventListener('pointerdown', down); fb.addEventListener('pointerup', up); fb.addEventListener('pointerleave', up); fb.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); done(); } }); };
    $('#rl-start', el).onclick = async () => {
      const cn = document.createElement('div'); cn.style.cssText = 'position:absolute;inset:0;z-index:800;display:grid;place-items:center;background:rgba(4,8,14,.85)'; cn.innerHTML = `<div class="live-num" style="font-size:180px;color:var(--accent)">3</div>`; el.appendChild(cn);
      for (const n of [3, 2, 1]) { $('.live-num', cn).textContent = n; beep(660, .12); haptic(10); A($('.live-num', cn), [{ transform: 'scale(1.5)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 500, easing: 'out' }); await wait(Motion.reduced ? 200 : 900); }
      beep(990, .3); cn.remove(); lock = await keepAwake(); S.state = 'run'; S.startedAt = Date.now(); S.lastT = Date.now(); if (S.fix) { S.last = { c: S.fix, t: Date.now() }; S.pts.push(S.fix); } running(); };
    const done = () => { if (S.dist < 50) { toast('Distância muito curta para salvar', 'x'); return; } el._cleanup();
      Nav.push('summary', { act: { sport: id, title: isRun ? 'Corrida' : 'Pedal', startedAt: S.startedAt, duration: Math.round(S.moving), distance: Math.round(S.dist), route: downsample(S.pts, 600), splits: S.splits } }); };
    $('#rl-close', el).onclick = async () => { if (S.state === 'wait' || S.dist < 10) { el._cleanup(); return Nav.back(); } const was = S.state; S.state = 'pause'; if (await confirmDialog('Descartar atividade?', 'O percurso gravado não será salvo.', 'Descartar', true)) { el._cleanup(); Nav.back(); } else { S.state = was; S.lastT = Date.now(); } };
  },
  unmount(el) { el._cleanup && el._cleanup(); },
};

/* ---------------- Boxe, natação, futebol, calistenia ---------------- */
Screens.genericLive = {
  noSwipe: true,
  render({ id = 'boxe' }) {
    setAccent(id); const sp = SPORTS[id];
    return `<div style="position:absolute;inset:0;opacity:.4">${scene(id, id, { fade: 'background:linear-gradient(180deg,rgba(11,11,11,.2),#0B0B0B 60%)' })}</div>
      <div class="topbar"><button class="icon-btn glass" id="gl-close" aria-label="Encerrar">${icon('x', 20, 2)}</button><div class="glass" style="border-radius:999px;padding:8px 14px"><span class="num" style="font-size:18px" id="gl-el">00:00</span></div><span class="tag" style="color:${sp.c}">${icon(sp.icon, 13, 2)}${sp.name}</span></div>
      <div class="live-col gl-body" style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 74px);bottom:24px;display:flex;flex-direction:column"></div>`;
  },
  mount(el, { id = 'boxe', preset }) {
    const body = $('.gl-body', el); const t0 = Date.now(); let paused = 0, pAt = 0; let lock = null; keepAwake().then(l => lock = l);
    const elapsed = () => ((pAt || Date.now()) - t0 - paused) / 1000;
    const iv = setInterval(() => { if (!el.isConnected) return clearInterval(iv); $('#gl-el', el).textContent = hms(elapsed()); }, 250);
    let extra = () => {}; el._cleanup = () => { clearInterval(iv); extra(); try { lock && lock.release(); } catch (e) {} };
    let build = () => null; let hasData = () => true;
    const finish = () => { const a = build(); if (!a) return; el._cleanup(); Nav.push('summary', { act: { sport: id, startedAt: t0, duration: Math.round(elapsed()), ...a } }); };
    if (id === 'boxe') {
      const cfg = { rounds: 8, fight: 180, rest: 60 }; let round = 0, phase = 'setup', left = 0, run = false, last = 0, raf, done = 0, combo = -1;
      const setup = () => { body.innerHTML = `<div class="kicker" style="color:var(--accent)">Configurar rounds</div><h1 class="display" style="font-size:32px;margin:8px 0 18px">Treino no timer</h1>
        ${[['rounds', 'Rounds', 1, ''], ['fight', 'Duração do round', 30, 's'], ['rest', 'Descanso', 15, 's']].map(([k, l, s, u]) => `<div class="field"><label>${l}</label><div class="stepper"><button class="icon-btn" data-bc="${k},-${s}" aria-label="Diminuir ${l}">${icon('minus', 18)}</button><div class="live-num" style="font-size:38px" id="bc-${k}">${k === 'rounds' ? cfg[k] : hms(cfg[k])}</div><button class="icon-btn" data-bc="${k},${s}" aria-label="Aumentar ${l}">${icon('plus', 18)}</button></div></div>`).join('')}
        <div style="flex:1"></div><button class="btn btn-accent btn-block" id="bx-go" style="height:60px;color:#fff">${icon('play', 18)}Começar</button>`;
        body.onclick = e => { const b = e.target.closest('[data-bc]'); if (!b) return; const [k, d] = b.dataset.bc.split(','); cfg[k] = Math.max(k === 'rounds' ? 1 : 15, cfg[k] + +d); $('#bc-' + k, body).textContent = k === 'rounds' ? cfg[k] : hms(cfg[k]); haptic(5); };
        $('#bx-go', body).onclick = () => { body.onclick = null; start(); }; };
      const start = () => { round = 1; phase = 'fight'; left = cfg.fight; run = true; last = performance.now(); beep(990, .4); const C = 2 * Math.PI * 128;
        body.innerHTML = `<div class="kicker" id="bx-ph" style="color:var(--accent)">Round 1 de ${cfg.rounds} · Luta</div>
          <div style="flex:1;display:grid;place-items:center"><div style="position:relative;width:280px;height:280px"><svg width="280" height="280" style="transform:rotate(-90deg)" aria-hidden="true"><circle cx="140" cy="140" r="128" stroke="rgba(255,255,255,.08)" stroke-width="12" fill="none"/><circle id="bx-c" cx="140" cy="140" r="128" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="${C}" style="stroke:var(--accent);transition:stroke .6s"/></svg>
          <div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center"><div><div class="live-num" style="font-size:76px" id="bx-t">${hms(cfg.fight)}</div><div class="h3" id="bx-combo" style="margin-top:8px">${BOX_COMBOS[0]}</div></div></div></div></div>
          <div class="row" style="justify-content:center;gap:12px"><button class="icon-btn" id="bx-pp" style="width:74px;height:74px;background:var(--accent);color:#fff" aria-label="Pausar">${icon('pause', 26)}</button><button class="btn btn-ghost" id="bx-skip">Pular fase</button><button class="btn btn-white" id="bx-fin">Finalizar</button></div>`;
        const c = $('#bx-c', body), t = $('#bx-t', body), cb = $('#bx-combo', body), ph = $('#bx-ph', body);
        const next = () => { haptic([30, 60, 30]); if (phase === 'fight') { done = round; if (round >= cfg.rounds) { run = false; beep(990, .5, 3); ph.textContent = 'Treino concluído'; return; } phase = 'rest'; left = cfg.rest; c.style.stroke = '#A3FF12'; cb.textContent = 'Respire'; beep(520, .3, 2); }
          else { phase = 'fight'; round++; left = cfg.fight; c.style.stroke = ''; beep(990, .4); } ph.textContent = `Round ${round} de ${cfg.rounds} · ${phase === 'fight' ? 'Luta' : 'Descanso'}`; };
        const loop = now => { if (!el.isConnected) return; if (run) { left -= (now - last) / 1000; if (Math.ceil(left) === 10 && phase === 'fight' && !loop._w) { loop._w = 1; beep(740, .1, 3); } if (left <= 0) { loop._w = 0; next(); } }
          last = now; const tot = phase === 'fight' ? cfg.fight : cfg.rest; t.textContent = hms(Math.max(0, left)); c.style.strokeDashoffset = C * (1 - Math.max(0, left) / tot);
          if (phase === 'fight') { const k = Math.floor((tot - left) / 20) % BOX_COMBOS.length; if (k !== combo) { combo = k; cb.textContent = BOX_COMBOS[k]; } } raf = requestAnimationFrame(loop); };
        raf = requestAnimationFrame(loop); extra = () => cancelAnimationFrame(raf);
        $('#bx-pp', body).onclick = e => { run = !run; if (!run) pAt = Date.now(); else { paused += Date.now() - pAt; pAt = 0; } e.currentTarget.innerHTML = icon(run ? 'pause' : 'play', 26); }; $('#bx-skip', body).onclick = next; $('#bx-fin', body).onclick = finish; };
      build = () => { const r = Math.max(done, phase === 'fight' && cfg.fight - left >= 30 ? round : done); if (!r) { toast('Complete pelo menos 1 round', 'x'); return null; } return { title: `${r} ${r > 1 ? 'rounds' : 'round'} de boxe`, rounds: r }; }; hasData = () => phase !== 'setup';
      setup();
    }
    if (id === 'natacao') {
      let laps = 0, pool = 25, stroke = 'Livre';
      body.innerHTML = `<div class="row" style="gap:8px;flex-wrap:wrap"><span class="muted small" style="width:100%">Piscina</span>${[25, 50].map(p => `<button class="chip ${p === 25 ? 'on' : ''}" data-pool="${p}">${p} m</button>`).join('')}</div>
        <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px">${STROKES.map((s, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-stroke="${s}">${s}</button>`).join('')}</div>
        <button id="sw-tap" class="press" style="position:relative;flex:1;margin:16px 0;border-radius:34px;border:1px dashed var(--stroke-hi);background:rgba(56,189,248,.06);display:grid;place-items:center;overflow:hidden" aria-label="Registrar volta"><div style="text-align:center"><div class="live-num" style="font-size:110px" id="sw-laps">0</div><div class="muted">voltas · toque a cada parede</div><div class="num" style="font-size:22px;margin-top:10px" id="sw-m">0 m</div></div></button>
        <div class="row" style="gap:10px"><button class="btn btn-ghost" id="sw-undo">Desfazer</button><div class="card" style="flex:1;padding:10px 14px"><div class="muted small">Ritmo /100 m</div><div class="num" style="font-size:20px" id="sw-pace">--</div></div><button class="btn btn-white" id="gl-fin">Finalizar</button></div>`;
      const upd = () => { $('#sw-laps', body).textContent = laps; $('#sw-m', body).textContent = `${fmt(laps * pool)} m · ${stroke}`; $('#sw-pace', body).textContent = laps >= 2 ? hms(elapsed() / (laps * pool) * 100) : '--'; };
      body.addEventListener('click', e => { const s = e.target.closest('[data-stroke]'), p = e.target.closest('[data-pool]'); if (s) { stroke = s.dataset.stroke; $$('[data-stroke]', body).forEach(x => x.classList.toggle('on', x === s)); upd(); } if (p) { pool = +p.dataset.pool; $$('[data-pool]', body).forEach(x => x.classList.toggle('on', x === p)); upd(); } });
      $('#sw-tap', body).onclick = () => { laps++; haptic(12); A($('#sw-laps', body), [{ transform: 'scale(1.25)' }, { transform: 'none' }], { spring: [300, 14] }); upd(); };
      $('#sw-undo', body).onclick = () => { laps = Math.max(0, laps - 1); upd(); };
      build = () => { if (!laps) { toast('Registre pelo menos uma volta', 'x'); return null; } return { title: `${fmt(laps * pool)} m · ${stroke}`, laps, pool, stroke, distance: laps * pool }; };
      $('#gl-fin', body).onclick = finish;
    }
    if (id === 'futebol') {
      const sc = { a: 0, b: 0, g: 0, as: 0 };
      body.innerHTML = `<div class="grid2"><div class="field"><label for="fb-ta">Seu time</label><input class="input" id="fb-ta" placeholder="Meu time"></div><div class="field"><label for="fb-tb">Adversário</label><input class="input" id="fb-tb" placeholder="Adversário"></div></div>
        <div class="card glass" style="padding:20px"><div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;text-align:center;gap:10px">${['a', 'b'].map((k, i) => `${i ? '<div class="display muted" style="font-size:26px">×</div>' : ''}<div><div class="live-num" style="font-size:70px" id="fb-${k}">0</div><div class="row" style="justify-content:center;gap:6px"><button class="icon-btn" style="width:40px;height:40px;background:rgba(255,255,255,.08)" data-sc="${k},-1" aria-label="Menos">${icon('minus', 16)}</button><button class="icon-btn" style="width:40px;height:40px;background:rgba(255,255,255,.08)" data-sc="${k},1" aria-label="Mais">${icon('plus', 16)}</button></div></div>`).join('')}</div></div>
        <div class="grid2" style="margin-top:12px">${[['g', 'Meus gols'], ['as', 'Assistências']].map(([k, l]) => `<div class="card" style="text-align:center;padding:16px"><div class="live-num" style="font-size:50px" id="fb-${k}">0</div><div class="h3">${l}</div><div class="row" style="justify-content:center;gap:6px;margin-top:8px"><button class="icon-btn" style="width:40px;height:40px;background:rgba(255,255,255,.08)" data-sc="${k},-1" aria-label="Menos ${l}">${icon('minus', 16)}</button><button class="icon-btn" style="width:40px;height:40px;background:var(--accent);color:#1A1200" data-sc="${k},1" aria-label="Mais ${l}">${icon('plus', 16)}</button></div></div>`).join('')}</div>
        <div style="flex:1"></div><button class="btn btn-white btn-block" id="gl-fin">Encerrar partida</button>`;
      body.addEventListener('click', e => { const b = e.target.closest('[data-sc]'); if (!b) return; const [k, d] = b.dataset.sc.split(','); sc[k] = Math.max(0, sc[k] + +d); if (k === 'g' && +d > 0 && sc.g > sc.a) { sc.a = sc.g; $('#fb-a', body).textContent = sc.a; } $('#fb-' + k, body).textContent = sc[k]; A($('#fb-' + k, body), [{ transform: 'scale(1.2)' }, { transform: 'none' }], { spring: [300, 14] }); haptic(8); });
      build = () => ({ title: `${$('#fb-ta', body).value.trim() || 'Meu time'} ${sc.a} × ${sc.b} ${$('#fb-tb', body).value.trim() || 'Adversário'}`, team: $('#fb-ta', body).value.trim(), opponent: $('#fb-tb', body).value.trim(), scoreFor: sc.a, scoreAgainst: sc.b, goals: sc.g, assists: sc.as });
      $('#gl-fin', body).onclick = finish;
    }
    if (id === 'calistenia') {
      const blocks = (preset || ['Barra fixa', 'Paralelas', 'Flexão de braço']).map(ex => ({ ex, sets: [] })); let cur = 0, reps = 10;
      const draw = () => { body.innerHTML = `<div class="hscroll" style="gap:8px">${blocks.map((b, i) => `<button class="chip ${i === cur ? 'on' : ''}" data-blk="${i}">${esc(b.ex)}${b.sets.length ? ` · ${b.sets.length}` : ''}</button>`).join('')}<button class="chip" data-addb>+ Bloco</button></div>
        <h1 class="display" style="font-size:30px;margin:18px 0 4px">${esc(blocks[cur].ex)}</h1><div class="muted small">${blocks[cur].sets.length ? 'Séries: ' + blocks[cur].sets.join(' · ') : 'Nenhuma série ainda'}</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center"><div class="stepper"><button class="icon-btn" data-r="-1" aria-label="Menos">${icon('minus', 20, 2)}</button><div style="text-align:center"><div class="live-num" style="font-size:80px">${reps}</div><div class="muted small">${/\(s\)/.test(blocks[cur].ex) ? 'segundos' : 'repetições'}</div></div><button class="icon-btn" data-r="1" aria-label="Mais">${icon('plus', 20, 2)}</button></div></div>
        <button class="btn btn-accent btn-block" data-logset style="height:60px;color:#06140A">${icon('check', 20, 2.4)}Registrar série</button><button class="btn btn-white btn-block" id="gl-fin" style="margin-top:10px">Finalizar sessão</button>`; $('#gl-fin', body).onclick = finish; };
      body.addEventListener('click', e => { const b = e.target.closest('[data-blk]'); if (b) { cur = +b.dataset.blk; draw(); } const r = e.target.closest('[data-r]'); if (r) { reps = Math.max(1, reps + +r.dataset.r); draw(); haptic(4); }
        if (e.target.closest('[data-logset]')) { blocks[cur].sets.push(reps); haptic([8, 30, 12]); toast(`${blocks[cur].ex}: ${reps}`, 'check'); draw(); }
        if (e.target.closest('[data-addb]')) Sheet.open(`<h3 class="h2">Adicionar bloco</h3><div class="row" style="gap:8px;flex-wrap:wrap;margin-top:14px">${CALI_BLOCKS.map(x => `<button class="chip" data-nb="${esc(x)}">${esc(x)}</button>`).join('')}</div>`, (w, close) => w.addEventListener('click', ev => { const n = ev.target.closest('[data-nb]'); if (n) { blocks.push({ ex: n.dataset.nb, sets: [] }); cur = blocks.length - 1; close(); draw(); } }), { label: 'Bloco' }); });
      draw();
      build = () => { const used = blocks.filter(b => b.sets.length); if (!used.length) { toast('Registre pelo menos uma série', 'x'); return null; } const total = used.reduce((s, b) => s + (/\(s\)/.test(b.ex) ? 0 : b.sets.reduce((a, c) => a + c, 0)), 0);
        return { title: used.map(b => b.ex.replace(' (s)', '')).slice(0, 3).join(' · '), blocks: used.map(b => ({ ex: b.ex, sets: b.sets, reps: Math.max(...b.sets) })), reps: total }; };
    }
    $('#gl-close', el).onclick = async () => { if (!hasData()) { el._cleanup(); return Nav.back(); } if (await confirmDialog('Encerrar sessão?', 'Vá para o resumo para salvar o que já registrou.', 'Ir para o resumo')) finish(); };
  },
  unmount(el) { el._cleanup && el._cleanup(); },
};

/* ---------------- Registro manual ---------------- */
Screens.manualAct = {
  render({ id }) { setAccent(id); const sp = SPORTS[id]; const now = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
    const f = (k, l, t = 'number', ph = '') => `<div class="field"><label for="ma-${k}">${l}</label><input class="input" id="ma-${k}" type="${t}" inputmode="decimal" step="any" placeholder="${ph}"></div>`;
    const specific = { corrida: f('km', 'Distância (km)', 'number', '5'), ciclismo: f('km', 'Distância (km)', 'number', '30'), natacao: f('m', 'Distância (m)', 'number', '1500') + f('laps', 'Voltas', 'number', '60') + `<div class="field"><label for="ma-stroke">Estilo</label><select class="input" id="ma-stroke">${STROKES.map(s => `<option>${s}</option>`).join('')}</select></div>`,
      boxe: f('rounds', 'Rounds', 'number', '8'), futebol: `<div class="grid2">${f('sf', 'Gols do seu time', 'number', '0')}${f('sa', 'Gols do adversário', 'number', '0')}</div><div class="grid2">${f('g', 'Seus gols', 'number', '0')}${f('as', 'Assistências', 'number', '0')}</div><div class="grid2">${f('team', 'Seu time', 'text', 'Meu time')}${f('opp', 'Adversário', 'text', '')}</div>`,
      calistenia: f('reps', 'Repetições totais', 'number', '120'), musculacao: f('vol', 'Volume total (kg)', 'number', '8000') }[id];
    return `<div class="topbar solid"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Adicionar ${sp.name.toLowerCase()}</div><span style="width:46px"></span></div>
      <div class="scroll"><form class="pad page ma-form" style="padding-top:calc(var(--safe-top) + 74px);max-width:620px" novalidate><h1 class="display" style="font-size:30px;margin:0 0 18px">Registrar ${sp.name.toLowerCase()}</h1>
        ${f('title', 'Título', 'text', sp.name)}<div class="grid2"><div class="field"><label for="ma-when">Quando</label><input class="input" id="ma-when" type="datetime-local" value="${now}"></div>${f('min', 'Duração (min)', 'number', '45')}</div>
        ${specific}<div class="field"><label for="ma-notes">Anotações</label><textarea class="input" id="ma-notes" rows="3"></textarea></div>
        <button class="btn btn-white btn-block" type="submit">Continuar</button><div style="height:40px"></div></form></div>`; },
  mount(el, { id }) { $('.ma-form', el).onsubmit = e => { e.preventDefault(); const v = k => { const x = $('#ma-' + k, el); return x ? x.value : ''; }; const n = k => +(v(k) || 0);
    const dur = n('min') * 60; if (!dur) return toast('Informe a duração', 'x'); const when = new Date(v('when')).getTime() || Date.now();
    const a = { sport: id, title: v('title').trim() || SPORTS[id].name, startedAt: when, duration: Math.round(dur), notes: v('notes').trim() || undefined, manual: true };
    if (id === 'corrida' || id === 'ciclismo') { a.distance = Math.round(n('km') * 1000); if (!a.distance) return toast('Informe a distância', 'x'); }
    if (id === 'natacao') { a.distance = Math.round(n('m')); a.laps = n('laps') || undefined; a.stroke = v('stroke'); if (!a.distance) return toast('Informe a distância', 'x'); }
    if (id === 'boxe') a.rounds = n('rounds'); if (id === 'calistenia') a.reps = n('reps'); if (id === 'musculacao') a.volume = n('vol');
    if (id === 'futebol') Object.assign(a, { scoreFor: n('sf'), scoreAgainst: n('sa'), goals: n('g'), assists: n('as'), team: v('team').trim(), opponent: v('opp').trim() });
    Nav.push('summary', { act: a }); }; },
};

/* ---------------- Resumo: salvar / publicar ---------------- */
Screens.summary = {
  noSwipe: true,
  render({ act }) {
    const sp = SPORTS[act.sport]; setAccent(act.sport); const st = postStats(act); const big = st[0];
    return `<div style="position:absolute;inset:0">${act.route && act.route.length > 1 ? routeSVG(act.route, { color: sp.c }) : scene(act.sport, act.sport, {})}</div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,11,11,.4),rgba(11,11,11,.65) 35%,#0B0B0B 62%)"></div><canvas id="sm-conf" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5"></canvas>
    <div class="scroll" style="z-index:4"><div class="pad page" style="padding-top:calc(var(--safe-top) + 110px);text-align:center;max-width:620px">
      <div class="kicker" style="color:var(--accent)" data-e="0">${act.prs && act.prs.length ? 'Novo recorde pessoal' : 'Atividade concluída'}</div>
      <div class="live-num" style="font-size:84px;margin-top:14px" data-e="1" data-ek="scale">${esc(big[1])}</div><div class="muted" data-e="2">${esc(big[0])}</div>
      <div class="glass" style="border-radius:28px;padding:18px 8px;display:grid;grid-template-columns:repeat(${st.length},1fr);text-align:center;margin-top:24px" data-e="4">${st.map((s, i) => `<div style="${i ? 'border-left:1px solid var(--stroke)' : ''}"><div class="num" style="font-size:19px">${esc(s[1])}</div><div class="muted small" style="margin-top:4px">${esc(s[0])}</div></div>`).join('')}</div>
      <div style="text-align:left;margin-top:20px" data-e="5"><div class="field"><label for="sm-title">Título</label><input class="input" id="sm-title" value="${esc(act.title || sp.name)}"></div>
        <div class="field"><label for="sm-txt">Legenda do post (opcional)</label><textarea class="input" id="sm-txt" rows="2" placeholder="Como foi?"></textarea></div>
        <button class="btn btn-ghost btn-sm" id="sm-photo" type="button">${icon('camera', 16)}Adicionar foto ao post</button><div id="sm-prev" style="margin-top:10px"></div></div>
      <div class="stack" style="margin-top:18px" data-e="7"><button class="btn btn-white btn-block" id="sm-post">${icon('share', 18)}Salvar e publicar</button><button class="btn btn-ghost btn-block" id="sm-save">Salvar sem publicar</button><button class="link" id="sm-discard" style="color:#FF6B76;margin-top:4px">Descartar</button></div>
      <div style="height:40px"></div></div></div>`;
  },
  mount(el, { act }) {
    haptic([20, 60, 20]); confetti($('#sm-conf', el), act.prs && act.prs.length ? 80 : 36); let img = null;
    $('#sm-photo', el).onclick = async () => { const d = await chooseImage(1280, .74); if (!d) return; img = d; $('#sm-prev', el).innerHTML = `<img src="${d}" alt="" style="width:100%;max-height:260px;object-fit:cover;border-radius:20px">`; };
    const save = async publish => { const btns = $$('#sm-post,#sm-save', el); btns.forEach(b => b.disabled = true);
      try { const a = await API.addActivity({ ...act, title: $('#sm-title', el).value.trim() || act.title, prs: undefined, prCount: act.prs ? act.prs.length : 0 });
        if (publish) { const hide = API.me.privacy && API.me.privacy.hideRouteEnds; await API.createPost({ sport: a.sport, text: $('#sm-txt', el).value.trim(), image: img, activity: { id: a.id, title: a.title, stats: publicStats(a), route: a.route ? downsample(hide ? trimRoute(a.route) : a.route, 120) : null, pr: !!(act.prs && act.prs.length) } }); }
        toast(publish ? 'Salvo e publicado' : 'Atividade salva'); socialFilter = 'all'; Nav.go(publish ? 'social' : 'home');
      } catch (x) { btns.forEach(b => b.disabled = false); toast(errMsg(x), 'x'); } };
    $('#sm-post', el).onclick = () => save(true); $('#sm-save', el).onclick = () => save(false);
    $('#sm-discard', el).onclick = async () => { if (await confirmDialog('Descartar atividade?', 'Nada será salvo.', 'Descartar', true)) Nav.go('home'); };
  },
};
/* ---------------- Celebration overlay (medal reveal) ---------------- */
function celebrate({ title, sub, big, points = 100, color = '#A3FF12', icon: ic = 'medal', share = true }) {
  return new Promise(res => {
    const phone = $('#app'); const o = document.createElement('div'); o.className = 'celebrate'; o.style.setProperty('--cc', color); o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', title);
    o.innerHTML = `<canvas></canvas><div class="medal"><div class="disc">${icon(ic, 64, 1.6)}</div><div class="shine"></div></div>
      <div class="kicker" style="color:${color}">${esc(sub || '')}</div><h2 class="display cel-title" style="font-size:31px;margin:10px 0 6px">${esc(title)}</h2>
      ${big ? `<div class="live-num" style="font-size:64px;margin:6px 0">${esc(big)}</div>` : ''}
      ${points ? `<div class="tag" style="height:32px;padding:0 14px;font-size:13px;color:${color};margin:8px 0 26px">+<span class="cel-pts">0</span> pontos</div>` : '<div style="height:22px"></div>'}
      <div class="row" style="gap:10px">${share ? `<button class="btn btn-ghost cel-share">${icon('share', 18)}Compartilhar</button>` : ''}<button class="btn btn-white cel-ok">Continuar</button></div>`;
    phone.appendChild(o);
    A(o, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    const m = $('.medal', o);
    A(m, [{ transform: 'scale(.2) rotateY(180deg)', opacity: 0 }, { transform: 'scale(1.08) rotateY(-10deg)', opacity: 1, offset: .7 }, { transform: 'scale(1) rotateY(0)', opacity: 1 }], { duration: 1100, easing: 'out' });
    Motion.kinetic($('.cel-title', o), 350);
    $$('.kicker,.live-num,.tag,.row', o).forEach((x, i) => A(x, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { spring: [170, 20], delay: 500 + i * 80 }));
    if (points) setTimeout(() => Motion.tween(0, points, 1200, v => $('.cel-pts', o).textContent = Math.round(v)), 700);
    confetti($('canvas', o), 70, color);
    haptic([20, 50, 20, 50, 60]);
    const close = () => { A(o, [{ opacity: 1 }, { opacity: 0, transform: 'scale(1.04)' }], { duration: 300 }).finished.then(() => { o.remove(); res(); }); };
    $('.cel-ok', o).onclick = close; const sb = $('.cel-share', o); if (sb) sb.onclick = () => { close(); shareSheet(title, `${sub || ''} ${big || ''} — pelo Ora Gym`); };
    setTimeout(() => $('.cel-ok', o).focus({ preventScroll: true }), 100);
  });
}
/* Discreet one-shot confetti (canvas, ~1.8s, then stops) */
function confetti(cv, n = 60, main) {
  if (Motion.reduced || !cv) return; const r = cv.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = r.width * dpr; cv.height = r.height * dpr; const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
  const cols = [main || getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4C8DFF', '#FFFFFF', '#A3FF12', '#FF7426'];
  const ps = Array.from({ length: n }, () => ({ x: r.width / 2 + (Math.random() - .5) * 80, y: r.height * .36, vx: (Math.random() - .5) * 9, vy: -Math.random() * 11 - 4, s: 4 + Math.random() * 5, a: Math.random() * 6, va: (Math.random() - .5) * .3, c: cols[Math.floor(Math.random() * cols.length)] }));
  const t0 = performance.now();
  const f = now => { const t = (now - t0) / 1000; ctx.clearRect(0, 0, r.width, r.height);
    ps.forEach(p => { p.vy += .32; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.globalAlpha = Math.max(0, 1 - t / 2.2); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
    if (t < 2.3) requestAnimationFrame(f); else ctx.clearRect(0, 0, r.width, r.height); };
  requestAnimationFrame(f);
}
