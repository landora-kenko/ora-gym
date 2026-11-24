/* ============================================================
   ORA GYM — Treinar: fichas, exercícios e atividades ao vivo
   ============================================================ */
const mmss = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`; };

function trainBody(id) {
  const sp = SPORTS[id];
  if (id === 'musculacao') return `<div class="section-head"><h2 class="h2">Fichas</h2><button class="link" id="new-ficha">+ Nova ficha</button></div>
    <div class="stack">${FICHAS.map((f, i) => `<button class="card press" style="text-align:left;padding:16px" data-push="workout" data-params='{"f":"${f.id}"}' data-expand data-e="${i}">
      <div class="row"><span class="display" style="font-size:26px;width:44px;color:var(--accent)">${f.id}</span><div style="flex:1"><div class="h3">${f.sub}</div><div class="muted small" style="margin-top:3px">${f.ex} exercícios · ~${f.min} min · último ${f.last}</div></div>${icon('next', 18)}</div></button>`).join('')}</div>`;
  if (id === 'corrida' || id === 'ciclismo') return `<div class="section-head"><h2 class="h2">Modo</h2></div>
    <div class="stack">${(id === 'corrida' ? [['Corrida livre', 'GPS, ritmo e distância em tempo real', 'route'], ['Meta de distância', '5 km · 10 km · 21 km', 'pin'], ['Intervalado', '6 × 400 m com descanso guiado', 'timer']] : [['Pedal livre', 'Velocidade, distância e elevação', 'route'], ['Rota salva', 'Subida da serra · 82 km', 'mountain'], ['Treino de cadência', 'Blocos de 5 min', 'speed']]).map((m, i) =>
      `<button class="list-item press" style="text-align:left" data-push="runLive" data-params='{"id":"${id}","mode":${i}}' data-e="${i}"><span class="ico">${icon(m[2], 21)}</span><div style="flex:1"><div class="h3">${m[0]}</div><div class="muted small" style="margin-top:3px">${m[1]}</div></div>${icon('play', 16)}</button>`).join('')}</div>
    <div class="card row" style="margin-top:14px;gap:12px"><span style="color:var(--neon)">${icon('shield', 22)}</span><div class="small muted" style="line-height:1.5">Localização usada apenas durante a atividade. Início e fim do trajeto ficam ocultos no seu perfil público.</div></div>`;
  const presets = { calistenia: [['Progressão de muscle-up', '6 blocos · ~40 min'], ['Core e L-sit', '4 blocos · 25 min'], ['Empurrar: paralelas e pike', '5 blocos · 35 min']],
    futebol: [['Registrar partida', 'Placar, gols e assistências'], ['Treino técnico', 'Passe e finalização'], ['Físico para futebol', 'Tiros e mudanças de direção']],
    natacao: [['Série técnica 1.500 m', 'Contador de voltas · piscina 25 m'], ['Resistência 2.000 m', 'Ritmo constante'], ['Tiros de 50 m', '12 × 50 m']],
    boxe: [['8 rounds de saco', '3 min · 1 min descanso'], ['Sombra técnica', '5 rounds · combinações guiadas'], ['Corda + core', '6 rounds de 2 min']] }[id];
  return `<div class="section-head"><h2 class="h2">Sessões</h2></div><div class="stack">${presets.map((p, i) => `<button class="list-item press" style="text-align:left" data-push="genericLive" data-params='{"id":"${id}","p":${i}}' data-e="${i}"><span class="ico">${icon(sp.icon, 21)}</span><div style="flex:1"><div class="h3">${p[0]}</div><div class="muted small" style="margin-top:3px">${p[1]}</div></div>${icon('play', 16)}</button>`).join('')}</div>`;
}

Screens.train = {
  render() {
    const id = Store.get().sport;
    return `<div class="scroll"><div class="pad" style="padding-top:calc(var(--safe-top) + 14px)">
      <div class="between" data-e="0"><div class="kicker">Treinar</div>${demoBadge()}</div>
      <h1 class="display tr-title" style="font-size:40px;margin:10px 0 20px">Bora treinar</h1>
      <div class="hscroll" style="gap:10px" data-e="2" id="tr-cards">${mySports().map(sid => { const s = SPORTS[sid]; return `<button class="sport-tile ${sid === id ? 'on' : ''}" style="--sc:${s.c};width:128px;height:168px" data-tsport="${sid}" aria-pressed="${sid === id}">
        <div style="position:absolute;inset:0">${scene('tile-' + sid, sid, { word: '', fade: 'background:linear-gradient(180deg,transparent 25%,rgba(11,11,11,.95))' })}</div>
        <span class="lbl"><span style="color:${s.c}">${icon(s.icon, 20)}</span><span class="display" style="display:block;font-size:18px;margin-top:6px">${s.name}</span></span></button>`; }).join('')}</div>
      <div id="tr-body">${trainBody(id)}</div>
      <button class="card press" style="width:100%;text-align:left;margin-top:16px" data-push="sport" data-params='{"id":"${id}"}' id="tr-evo"><div class="between"><div><div class="kicker">Área de evolução</div><div class="h3" style="margin-top:6px">Gráficos, recordes e histórico</div></div>${icon('chart', 22)}</div></button>
      <div class="bottom-space"></div></div></div>`;
  },
  mount(el) {
    Motion.kinetic($('.tr-title', el), 120);
    el.addEventListener('click', e => { const b = e.target.closest('[data-tsport]'); if (!b) return; const id = b.dataset.tsport; if (id === Store.get().sport) return;
      haptic(8); Store.set({ sport: id }); setAccent(id);
      $$('[data-tsport]', el).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      A(b, [{ transform: 'scale(.93)' }, { transform: 'scale(1)' }], { spring: [260, 14] });
      const body = $('#tr-body', el);
      A(body, [{ opacity: 1 }, { opacity: 0, transform: 'translateX(-20px)' }], { duration: 180, easing: 'in' }).finished.then(() => { body.getAnimations().forEach(a => a.cancel()); body.innerHTML = trainBody(id); Motion.enter(body, 0, 50); });
      $('#tr-evo', el).dataset.params = JSON.stringify({ id });
    });
    const nf = () => $('#new-ficha', el); el.addEventListener('click', e => { if (e.target.closest('#new-ficha')) newFichaSheet(); });
  },
};
function newFichaSheet() {
  Sheet.open(`<h3 class="h2" data-e="0">Nova ficha</h3><div style="margin-top:16px" data-e="1"><div class="field"><label for="nf-n">Nome</label><input class="input" id="nf-n" placeholder="Ex.: Treino E — Full body"></div>
    <div class="field"><label>Foco</label><div class="row" style="flex-wrap:wrap;gap:8px">${['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'].map(m => `<button class="chip" data-m>${m}</button>`).join('')}</div></div>
    <button class="btn btn-white btn-block" data-close data-save>Salvar ficha</button></div>`,
    w => { w.addEventListener('click', e => { const c = e.target.closest('[data-m]'); if (c) c.classList.toggle('on'); if (e.target.closest('[data-save]')) toast('Ficha salva (prévia local)'); }); }, { label: 'Nova ficha' });
}

/* ---------------- Ficha (workout) detail ---------------- */
Screens.workout = {
  render({ f = 'A' }) {
    setAccent('musculacao'); const fi = FICHAS.find(x => x.id === f) || FICHAS[0];
    return `<div class="topbar"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">${fi.name}</div><button class="icon-btn glass" aria-label="Editar ficha" data-edit>${icon('edit', 18)}</button></div>
    <div class="scroll"><div style="position:relative;height:330px"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('musculacao', 'musculacao', { word: fi.id })}</div>
      <div style="position:absolute;left:20px;right:20px;bottom:18px"><div class="kicker" style="color:var(--accent)" data-e="1">Ficha ${fi.id} · ${fi.last}</div><h1 class="display" style="font-size:34px;margin:8px 0 14px" data-e="2">${fi.sub}</h1>
      <div class="row" style="gap:8px" data-e="3"><span class="tag">${icon('clock', 13)}~${fi.min} min</span><span class="tag">${icon('dumbbell', 13)}${WORKOUT_A.ex.length} exercícios</span><span class="tag">${icon('flame', 13)}~420 kcal</span></div></div></div>
      <div class="pad"><div class="stack" style="margin-top:14px">${WORKOUT_A.ex.map((x, i) => `<button class="list-item press" style="text-align:left" data-push="exercise" data-params='{"i":${i}}' data-e="${4 + i}">
        <span class="ico"><span class="num" style="font-size:18px">${i + 1}</span></span><div style="flex:1;min-width:0"><div class="h3">${x.n}</div><div class="muted small" style="margin-top:3px">${x.sets} × ${x.reps} · ${x.kg ? x.kg + ' kg' : 'peso corporal'} · descanso ${x.rest}s</div></div>${icon('next', 18)}</button>`).join('')}</div>
      <div style="height:110px"></div></div></div>
      <div style="position:absolute;left:20px;right:20px;bottom:26px;z-index:20" data-e="10"><button class="btn btn-accent btn-block" data-push="liftLive" data-params='{"f":"${fi.id}"}'>${icon('play', 18)}Começar treino</button></div>`;
  },
  mount(el) { bindScrollFx(el, { bar: $('.topbar', el), hero: $('.hero-stack', el), threshold: 200 }); $('[data-edit]', el).onclick = () => toast('Edição de ficha disponível na próxima versão', 'edit'); },
};

/* ---------------- Exercise detail: animated execution guide ---------------- */
Screens.exercise = {
  render({ i = 0 }) {
    const x = WORKOUT_A.ex[i]; const hist = [x.kg * .82, x.kg * .86, x.kg * .9, x.kg * .88, x.kg * .95, x.kg].map(v => Math.round(v * 2) / 2);
    return `<div class="topbar"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">${x.n}</div><span style="width:46px"></span></div>
    <div class="scroll"><div style="position:relative;height:360px;background:radial-gradient(80% 70% at 60% 40%,color-mix(in oklab,var(--accent) 22%,#0b1a30),#0B0B0B)" data-e="0" data-ek="fade">
      <svg viewBox="0 0 390 360" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
        <line x1="120" y1="80" x2="120" y2="290" stroke="rgba(255,255,255,.12)" stroke-dasharray="4 6"/>
        <path d="M120 100 C 128 150, 128 230, 120 270" stroke="var(--accent)" stroke-width="2" fill="none" style="stroke:var(--accent)" opacity=".6"/>
        <g class="ex-bar"><line x1="60" y1="0" x2="330" y2="0" stroke="#fff" stroke-width="6" stroke-linecap="round"/>${[70, 86, 304, 320].map(cx => `<rect x="${cx - 6}" y="-34" width="12" height="68" rx="4" fill="#0d1d33" stroke="#fff" stroke-opacity=".7"/>`).join('')}<circle cx="120" cy="0" r="7" style="fill:var(--accent)"/></g>
        </svg>
      <div class="glass" style="position:absolute;right:16px;top:calc(var(--safe-top) + 64px);border-radius:16px;padding:10px 14px;text-align:center"><div class="kicker" style="font-size:9.5px">Fase</div><div class="h3 ex-phase" style="margin-top:4px">Descida</div></div>
      <div style="position:absolute;left:16px;right:16px;bottom:16px" class="row"><button class="icon-btn" style="background:#fff;color:#0B0B0B" id="ex-play" aria-label="Pausar guia">${icon('pause', 18)}</button>
        <div style="flex:1"><div class="bar" style="height:5px"><i class="ex-prog" style="transform:scaleX(0);transition:none"></i></div><div class="between small muted" style="margin-top:6px"><span>Guia animado · cadência 2-1-2</span><span>Vídeo do treinador em breve</span></div></div></div></div>
      <div class="pad"><div class="between" style="margin-top:20px" data-e="1"><div><h1 class="h2" style="font-size:24px">${x.n}</h1><div class="muted small" style="margin-top:4px">${x.m}</div></div><span class="tag">${icon('timer', 13)}${x.rest}s descanso</span></div>
      <p class="muted" style="line-height:1.6;margin:14px 0 0" data-e="2">${x.cue}</p>
      <div class="section-head" data-e="3"><h2 class="h2">Meu progresso</h2><span class="num accent-text" style="font-size:24px">${x.kg} kg</span></div>
      <div class="card" data-e="4">${chartHTML('exch')}<div class="axis">${['Set', '', 'Out', '', '', 'Nov'].map(t => `<span>${t}</span>`).join('')}</div></div>
      <div class="grid3" style="margin-top:12px" data-e="5">${[['Recorde', x.pr ? x.pr + ' kg' : '—'], ['Séries', x.sets + ' × ' + x.reps], ['1RM est.', x.kg ? Math.round(x.kg * (1 + x.reps / 30)) + ' kg' : '—']].map(s => `<div class="card" style="padding:14px"><div class="muted small">${s[0]}</div><div class="num" style="font-size:22px;margin-top:6px">${s[1]}</div></div>`).join('')}</div>
      <div style="height:40px"></div></div></div>`;
  },
  mount(el, { i = 0 }) {
    const x = WORKOUT_A.ex[i]; bindScrollFx(el, { bar: $('.topbar', el), threshold: 240 });
    mountChart($('#exch', el), [x.kg * .82, x.kg * .86, x.kg * .9, x.kg * .88, x.kg * .95, x.kg], { unit: 'kg', floor: true, tipLabel: k => ['Set', 'Set', 'Out', 'Out', 'Nov', 'Nov'][k] });
    const bar = $('.ex-bar', el), ph = $('.ex-phase', el), prog = $('.ex-prog', el); let playing = true, t0 = performance.now(), acc = 0, raf;
    const loop = now => { if (!el.isConnected) return; if (playing) { acc += now - t0; } t0 = now;
      const T = 5000, t = (acc % T) / T; let y; // 2s down, 1s hold, 2s up
      if (t < .4) { y = lerp(100, 270, (1 - Math.cos(t / .4 * Math.PI)) / 2); ph.textContent = 'Descida'; } else if (t < .6) { y = 270; ph.textContent = 'Pausa'; } else { y = lerp(270, 100, (1 - Math.cos((t - .6) / .4 * Math.PI)) / 2); ph.textContent = 'Subida'; }
      bar.setAttribute('transform', `translate(0 ${y})`); prog.style.transform = `scaleX(${(acc % 20000) / 20000})`; raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    $('#ex-play', el).onclick = e => { playing = !playing; e.currentTarget.innerHTML = icon(playing ? 'pause' : 'play', 18); e.currentTarget.setAttribute('aria-label', playing ? 'Pausar guia' : 'Reproduzir guia'); };
    if (Motion.reduced) playing = false;
  },
};

/* ---------------- Live strength session ---------------- */
Screens.liftLive = {
  noSwipe: true,
  render() {
    setAccent('musculacao');
    return `<div style="position:absolute;inset:0;background:radial-gradient(90% 50% at 80% 0%,color-mix(in oklab,var(--accent) 26%,transparent),transparent 70%),#0B0B0B"></div>
    <div style="position:absolute;inset:0;opacity:.35">${scene('musculacao', 'musculacao', { word: '', fade: 'background:linear-gradient(180deg,rgba(11,11,11,.3),#0B0B0B 62%)' })}</div>
    <div class="topbar"><button class="icon-btn glass" id="ll-close" aria-label="Encerrar treino">${icon('x', 20, 2)}</button>
      <div class="glass" style="border-radius:999px;padding:8px 14px;display:flex;gap:8px;align-items:center"><span class="dot" style="background:#FF4D5E;box-shadow:0 0 10px #FF4D5E"></span><span class="num" style="font-size:18px" id="ll-elapsed">00:00</span></div>
      <span class="tag" id="ll-idx">1/${WORKOUT_A.ex.length}</span></div>
    <div style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 74px);bottom:24px;display:flex;flex-direction:column">
      <div id="ll-head" data-e="0"></div>
      <div class="set-dots" style="margin:18px 0 0" id="ll-dots" data-e="1"></div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:14px" data-e="2">
        <div class="stepper"><button class="icon-btn" data-kg="-2.5" aria-label="Diminuir carga">${icon('minus', 22, 2)}</button><div style="text-align:center"><div class="live-num" style="font-size:86px"><span id="ll-kg">0</span><span style="font-size:24px;font-style:normal;color:var(--mute);margin-left:6px">kg</span></div><div class="muted small" id="ll-pr">Recorde: —</div></div><button class="icon-btn" data-kg="2.5" aria-label="Aumentar carga">${icon('plus', 22, 2)}</button></div>
        <div class="stepper"><button class="icon-btn" data-rp="-1" aria-label="Menos repetições">${icon('minus', 20, 2)}</button><div style="text-align:center"><div class="live-num" style="font-size:52px" id="ll-reps">0</div><div class="muted small">repetições</div></div><button class="icon-btn" data-rp="1" aria-label="Mais repetições">${icon('plus', 20, 2)}</button></div></div>
      <button class="btn btn-accent btn-block" id="ll-done" style="height:62px;font-size:16px" data-e="3">${icon('check', 20, 2.4)}<span>Concluir série</span></button>
      <div class="list-item" style="margin-top:12px" id="ll-next" data-e="4"></div></div>
    <div id="ll-rest" style="position:absolute;inset:0;z-index:60;display:none;flex-direction:column;align-items:center;justify-content:center;background:rgba(4,10,20,.9);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)">
      <div class="kicker">Descanso</div>
      <div style="position:relative;width:260px;height:260px;margin:22px 0 26px"><svg width="260" height="260" style="transform:rotate(-90deg)" aria-hidden="true"><circle cx="130" cy="130" r="118" stroke="rgba(255,255,255,.08)" stroke-width="10" fill="none"/><circle id="ll-rest-c" cx="130" cy="130" r="118" stroke-width="10" fill="none" stroke-linecap="round" style="stroke:var(--accent);filter:drop-shadow(0 0 12px var(--accent))" stroke-dasharray="${2 * Math.PI * 118}"/></svg>
        <div style="position:absolute;inset:0;display:grid;place-items:center"><div style="text-align:center"><div class="live-num" style="font-size:78px" id="ll-rest-t">90</div><div class="muted small">segundos</div></div></div></div>
      <div class="row"><button class="btn btn-ghost" id="ll-rest-add">+15 s</button><button class="btn btn-white" id="ll-rest-skip">Pular descanso</button></div>
      <div class="muted small" style="margin-top:24px" id="ll-rest-next"></div></div>`;
  },
  mount(el) {
    const S = { ex: 0, set: 0, kg: 0, reps: 0, t0: Date.now(), vol: 0, sets: 0, prs: [], rest: null };
    const tick = setInterval(() => { if (!el.isConnected) return clearInterval(tick); $('#ll-elapsed', el).textContent = mmss((Date.now() - S.t0) / 1000); }, 500);
    el._cleanup = () => { clearInterval(tick); S.rest && clearInterval(S.rest.iv); };
    const kgEl = $('#ll-kg', el), repsEl = $('#ll-reps', el);
    const loadEx = (anim) => {
      const x = WORKOUT_A.ex[S.ex]; S.kg = x.kg; S.reps = x.reps;
      $('#ll-idx', el).textContent = `${S.ex + 1}/${WORKOUT_A.ex.length}`;
      const head = $('#ll-head', el);
      head.innerHTML = `<div class="kicker" style="color:var(--accent)">Exercício ${S.ex + 1} · ${x.m}</div><h1 class="display ll-title" style="font-size:29px;margin:8px 0 0">${x.n}</h1>`;
      Motion.kinetic($('.ll-title', head), anim ? 60 : 300);
      renderDots(); kgEl.textContent = fmt(S.kg, S.kg % 1 ? 1 : 0); repsEl.textContent = S.reps; $('#ll-pr', el).textContent = `Recorde: ${x.pr ? fmt(x.pr, x.pr % 1 ? 1 : 0) + ' kg' : '—'}`;
      const nx = WORKOUT_A.ex[S.ex + 1];
      $('#ll-next', el).innerHTML = nx ? `<span class="ico">${icon('next', 20)}</span><div><div class="muted small">A seguir</div><div class="h3">${nx.n} · ${nx.sets} × ${nx.reps}</div></div>` : `<span class="ico" style="color:var(--neon)">${icon('trophy', 20)}</span><div><div class="muted small">Último exercício</div><div class="h3">Finalize para ver o resumo</div></div>`;
    };
    const renderDots = () => { const x = WORKOUT_A.ex[S.ex]; $('#ll-dots', el).innerHTML = Array.from({ length: x.sets }, (_, i) => `<i class="${i < S.set ? 'done' : i === S.set ? 'cur' : ''}"></i>`).join(''); };
    const roll = (node, val, dir) => { node.textContent = val; A(node, [{ transform: `translateY(${dir * 14}px)`, opacity: .2 }, { transform: 'none', opacity: 1 }], { spring: [320, 20] }); };
    el.addEventListener('click', e => {
      const k = e.target.closest('[data-kg]'), r = e.target.closest('[data-rp]');
      if (k) { haptic(5); const d = +k.dataset.kg; S.kg = Math.max(0, S.kg + d); roll(kgEl, fmt(S.kg, S.kg % 1 ? 1 : 0), d > 0 ? 1 : -1); const x = WORKOUT_A.ex[S.ex]; $('#ll-pr', el).innerHTML = S.kg > x.pr ? `<span style="color:var(--neon)">Acima do recorde (${fmt(x.pr, 1)} kg)</span>` : `Recorde: ${fmt(x.pr, x.pr % 1 ? 1 : 0)} kg`; }
      if (r) { haptic(5); const d = +r.dataset.rp; S.reps = Math.max(1, S.reps + d); roll(repsEl, S.reps, d > 0 ? 1 : -1); }
    });
    $('#ll-done', el).onclick = async e => {
      const btn = e.currentTarget; haptic([8, 30, 12]); const x = WORKOUT_A.ex[S.ex];
      // confirmation micro-interaction
      A(btn, [{ transform: 'scale(1)' }, { transform: 'scale(.95)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'out' });
      const dots = $$('#ll-dots i', el); const d = dots[S.set]; d && (d.className = 'done', A(d, [{ transform: 'scaleY(2.2)' }, { transform: 'none' }], { spring: [300, 12] }));
      S.vol += S.kg * S.reps; S.sets++;
      const isPR = S.kg > x.pr && x.kg > 0;
      if (isPR) { S.prs.push([x.n, S.kg]); x.pr = S.kg; await celebrate({ title: 'Novo recorde pessoal', sub: x.n, big: fmt(S.kg, S.kg % 1 ? 1 : 0) + ' kg', points: 150, color: '#A3FF12', icon: 'medal' }); }
      S.set++;
      if (S.set >= x.sets) {
        if (S.ex >= WORKOUT_A.ex.length - 1) return finish();
        startRest(x.rest, () => { S.ex++; S.set = 0; const h = $('#ll-head', el); A(h, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-40px)' }], { duration: 220, easing: 'in' }).finished.then(() => { h.getAnimations().forEach(a => a.cancel()); loadEx(true); }); }, `Próximo: ${WORKOUT_A.ex[S.ex + 1].n}`);
      } else { renderDots(); startRest(x.rest, () => {}, `Série ${S.set + 1} de ${x.sets} · ${fmt(S.kg, S.kg % 1 ? 1 : 0)} kg × ${S.reps}`); }
    };
    const startRest = (secs, then, label) => {
      const ov = $('#ll-rest', el), c = $('#ll-rest-c', el), t = $('#ll-rest-t', el); const C = 2 * Math.PI * 118;
      let left = secs, total = secs; $('#ll-rest-next', el).textContent = label;
      ov.style.display = 'flex'; A(ov, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 }); A($('svg', ov).parentElement, [{ transform: 'scale(.85)', opacity: 0 }, { transform: 'none', opacity: 1 }], { spring: [170, 18] });
      const upd = () => { t.textContent = Math.ceil(left); c.style.strokeDashoffset = C * (1 - left / total); };
      upd(); const t1 = Date.now(); let base = left;
      const iv = setInterval(() => { left = base - (Date.now() - t1) / 1000; if (left <= 0) end(); else upd(); }, 100);
      const end = () => { clearInterval(iv); S.rest = null; haptic([20, 60, 20]); A(ov, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 }).finished.then(() => ov.style.display = 'none'); then(); };
      S.rest = { iv };
      $('#ll-rest-add', el).onclick = () => { base += 15; total += 15; haptic(5); };
      $('#ll-rest-skip', el).onclick = end;
    };
    const finish = () => {
      el._cleanup(); const dur = (Date.now() - S.t0) / 1000;
      const post = { sport: 'musculacao', title: 'Treino A concluído', stats: [['Volume', fmt(S.vol / 1000, 1) + ' t'], ['Séries', String(S.sets)], ['Duração', mmss(dur)]], pr: S.prs.length > 0, text: S.prs.length ? `Novo recorde: ${S.prs.map(p => p[0] + ' ' + fmt(p[1], 1) + ' kg').join(', ')}` : 'Ficha completa, foco total.' };
      Nav.push('summary', { post, big: fmt(S.vol / 1000, 1), bigU: 't de volume' });
    };
    $('#ll-close', el).onclick = async () => { if (await confirmDialog('Encerrar treino?', 'As séries concluídas até agora serão salvas no seu histórico.', 'Encerrar e salvar')) { if (S.sets) finish(); else { el._cleanup(); Nav.back(); } } };
    loadEx(false);
  },
  unmount(el) { el._cleanup && el._cleanup(); },
};

/* ---------------- Live run / ride with map ---------------- */
Screens.runLive = {
  noSwipe: true,
  render({ id = 'corrida' }) {
    setAccent(id); const isRun = id === 'corrida';
    return `<div style="position:absolute;inset:0" id="rl-map">${mapSVG(isRun ? 0 : 1, { id: 'rl', live: true, h: 834, top: 110, span: .62 })}</div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,11,11,.7),transparent 26%,transparent 46%,rgba(11,11,11,.92) 70%);pointer-events:none"></div>
    <div class="topbar"><button class="icon-btn glass" id="rl-close" aria-label="Fechar">${icon('back', 20, 2)}</button>
      <div class="glass" style="border-radius:999px;padding:9px 14px;font-size:12.5px;font-weight:600;display:flex;gap:8px;align-items:center"><span class="dot" id="rl-gps"></span>${isRun ? 'Corrida livre' : 'Pedal livre'} · GPS simulado</div>
      <button class="icon-btn glass" aria-label="Música" data-push="music" data-params='{"id":"${id}"}'>${icon('music', 19)}</button></div>
    <div style="position:absolute;left:16px;top:calc(var(--safe-top) + 64px)" data-e="0"><span class="demo-badge" style="background:rgba(0,0,0,.4)">Simulação acelerada 20×</span></div>
    <div style="position:absolute;left:16px;right:16px;bottom:22px" data-e="1">
      <div style="text-align:center;margin-bottom:16px"><div class="live-num" style="font-size:96px" id="rl-time">00:00</div><div class="muted small">Tempo total</div></div>
      <div class="glass" style="border-radius:30px;padding:18px 10px;display:grid;grid-template-columns:repeat(3,1fr);text-align:center">
        <div><div class="num" style="font-size:30px" id="rl-dist">0,00</div><div class="muted small">km</div></div>
        <div style="border-left:1px solid var(--stroke);border-right:1px solid var(--stroke)"><div class="num" style="font-size:30px" id="rl-pace">--</div><div class="muted small">${isRun ? 'pace /km' : 'km/h'}</div></div>
        <div><div class="num" style="font-size:30px" id="rl-kcal">0</div><div class="muted small">kcal est.</div></div></div>
      <div id="rl-ctrl" style="display:flex;justify-content:center;gap:16px;margin-top:18px;height:84px;align-items:center">
        <button class="icon-btn" id="rl-pause" style="width:84px;height:84px;background:var(--accent);color:#0B0B0B;box-shadow:0 14px 36px -10px var(--accent)" aria-label="Pausar">${icon('pause', 30)}</button></div></div>
    <div id="rl-count" style="position:absolute;inset:0;z-index:80;display:grid;place-items:center;background:rgba(4,10,20,.82);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)"><div class="live-num" style="font-size:200px;color:var(--accent)" id="rl-cn">3</div></div>`;
  },
  mount(el, { id = 'corrida' }) {
    const isRun = id === 'corrida'; const path = $('#rl-route', el), dot = $('#rl-dot', el); const L = path.getTotalLength();
    path.style.strokeDasharray = L; path.style.strokeDashoffset = L; const glow = $('#rl-glow', el); glow.style.strokeDasharray = L; glow.style.strokeDashoffset = L;
    const p0 = path.getPointAtLength(0); dot.setAttribute('cx', p0.x); dot.setAttribute('cy', p0.y);
    const S = { t: 0, d: 0, running: false, last: 0, km: 0, speed: isRun ? 3.2 : 7.6 /* m/s */ };
    const routeLen = isRun ? 3000 : 12000;
    const upd = () => {
      $('#rl-time', el).textContent = mmss(S.t); $('#rl-dist', el).textContent = fmt(S.d / 1000, 2);
      $('#rl-pace', el).textContent = S.d > 30 ? (isRun ? paceStr((S.t / 60) / (S.d / 1000)) : fmt((S.d / 1000) / (S.t / 3600), 1)) : '--';
      $('#rl-kcal', el).textContent = Math.round(S.d / 1000 * (isRun ? 62 : 28));
      const f = clamp((S.d % routeLen) / routeLen, 0, 1); path.style.strokeDashoffset = L * (1 - f); glow.style.strokeDashoffset = L * (1 - f);
      const p = path.getPointAtLength(L * f); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
    };
    let raf; const loop = now => { if (!el.isConnected) return; if (S.running) { const dt = Math.min(.1, (now - S.last) / 1000) * 20; S.t += dt; const v = S.speed * (1 + Math.sin(S.t / 40) * .08); S.d += v * dt;
        const k = Math.floor(S.d / 1000); if (k > S.km) { S.km = k; haptic([15, 40, 15]); toast(`${k} km · ${isRun ? 'pace ' + paceStr((S.t / 60) / (S.d / 1000)) : fmt((S.d / 1000) / (S.t / 3600), 1) + ' km/h'}`, 'route'); } upd(); }
      S.last = now; raf = requestAnimationFrame(loop); };
    el._cleanup = () => cancelAnimationFrame(raf);
    // 3-2-1 countdown
    (async () => { const cn = $('#rl-cn', el); for (const n of [3, 2, 1]) { cn.textContent = n; haptic(10); A(cn, [{ transform: 'scale(1.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.8)', opacity: 0 }], { duration: 900, easing: 'out' }); await wait(Motion.reduced ? 150 : 900); }
      cn.textContent = 'VAI'; A(cn, [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { spring: [200, 14] }); await wait(450);
      const c = $('#rl-count', el); A(c, [{ opacity: 1 }, { opacity: 0 }], { duration: 350 }).finished.then(() => c.remove());
      S.running = true; S.last = performance.now(); raf = requestAnimationFrame(loop); })();
    const ctrl = $('#rl-ctrl', el);
    const setPaused = paused => {
      S.running = !paused; S.last = performance.now(); haptic(12);
      if (paused) {
        ctrl.innerHTML = `<button class="icon-btn" id="rl-resume" style="width:74px;height:74px;background:var(--accent);color:#0B0B0B" aria-label="Retomar">${icon('play', 28)}</button>
          <button class="btn hold-btn" id="rl-finish" style="height:74px;padding:0 26px;background:#fff;color:#0B0B0B"><span class="fill"></span><span style="position:relative">${icon('stop', 18)}</span><span style="position:relative">Segure para finalizar</span></button>`;
        $$('button', ctrl).forEach((b, i) => A(b, [{ transform: `translateX(${i ? -60 : 60}px) scale(.7)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { spring: [200, 18], delay: i * 40 }));
        $('#rl-resume', el).onclick = () => setPaused(false);
        const fb = $('#rl-finish', el), fill = $('.fill', fb); let ha;
        const down = () => { ha = A(fill, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: Motion.reduced ? 1 : 1000, easing: 'linear' }); ha.finished.then(() => { if (ha._c) return; done(); }); };
        const up = () => { if (ha && ha.playState === 'running') { ha._c = true; ha.cancel(); } };
        fb.addEventListener('pointerdown', down); fb.addEventListener('pointerup', up); fb.addEventListener('pointerleave', up);
        fb.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); done(); } });
        $('#rl-gps', el).style.background = 'var(--orange)';
      } else {
        ctrl.innerHTML = `<button class="icon-btn" id="rl-pause" style="width:84px;height:84px;background:var(--accent);color:#0B0B0B;box-shadow:0 14px 36px -10px var(--accent)" aria-label="Pausar">${icon('pause', 30)}</button>`;
        A($('#rl-pause', el), [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { spring: [220, 16] });
        $('#rl-pause', el).onclick = () => setPaused(true); $('#rl-gps', el).style.background = '';
      }
    };
    $('#rl-pause', el).onclick = () => setPaused(true);
    const done = () => {
      el._cleanup(); const km = S.d / 1000;
      const pace = isRun ? paceStr((S.t / 60) / Math.max(km, .01)) : fmt(km / Math.max(S.t / 3600, .001), 1) + ' km/h';
      const isPR = isRun && km >= 5 && (S.t / km) < (23 * 60 + 41) / 5;
      const post = { sport: id, title: isRun ? 'Corrida concluída' : 'Pedal concluído', stats: [['Distância', fmt(km, 2) + ' km'], ['Tempo', mmss(S.t)], [isRun ? 'Pace' : 'Vel. média', isRun ? pace + '/km' : pace]], pr: isPR, route: isRun ? 0 : 1, text: isRun ? `${fmt(km, 1)} km no ritmo certo.` : `${fmt(km, 1)} km de estrada.` };
      Nav.push('summary', { post, big: fmt(km, 2), bigU: 'quilômetros', route: post.route });
    };
    $('#rl-close', el).onclick = async () => { if (!S.d) { el._cleanup(); return Nav.back(); } const was = S.running; S.running = false; if (await confirmDialog('Descartar atividade?', 'O percurso registrado até agora não será salvo.', 'Descartar', true)) { el._cleanup(); Nav.back(); } else { S.running = was; S.last = performance.now(); } };
  },
  unmount(el) { el._cleanup && el._cleanup(); },
};

/* ---------------- Generic live: boxe, natação, futebol, calistenia ---------------- */
Screens.genericLive = {
  noSwipe: true,
  render({ id = 'boxe', p = 0 }) {
    setAccent(id); const sp = SPORTS[id];
    const frame = inner => `<div style="position:absolute;inset:0;opacity:.45">${scene(id, id, { word: '', fade: 'background:linear-gradient(180deg,rgba(11,11,11,.2),#0B0B0B 60%)' })}</div>
      <div class="topbar"><button class="icon-btn glass" id="gl-close" aria-label="Encerrar">${icon('x', 20, 2)}</button><div class="glass" style="border-radius:999px;padding:8px 14px" class="row"><span class="num" style="font-size:18px" id="gl-el">00:00</span></div><span class="tag" style="color:${sp.c}">${icon(sp.icon, 13, 2)}${sp.name}</span></div>
      <div style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 74px);bottom:24px;display:flex;flex-direction:column">${inner}</div>`;
    if (id === 'boxe') return frame(`<div class="kicker" id="bx-phase" style="color:var(--accent)" data-e="0">Round 1 de 8 · Luta</div><h1 class="display" style="font-size:26px;margin:8px 0 0" data-e="1">${['8 rounds de saco', 'Sombra técnica', 'Corda + core'][p]}</h1>
      <div style="flex:1;display:grid;place-items:center" data-e="2"><div style="position:relative;width:280px;height:280px"><svg width="280" height="280" style="transform:rotate(-90deg)" aria-hidden="true"><circle cx="140" cy="140" r="128" stroke="rgba(255,255,255,.08)" stroke-width="12" fill="none"/><circle id="bx-c" cx="140" cy="140" r="128" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 128}" style="stroke:var(--accent);filter:drop-shadow(0 0 14px var(--accent));transition:stroke .6s"/></svg>
        <div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center"><div><div class="live-num" style="font-size:84px" id="bx-t">3:00</div><div class="h3" id="bx-combo" style="margin-top:8px;color:#fff">Jab · Direto</div></div></div></div></div>
      <div class="row" style="justify-content:center;gap:14px" data-e="3"><button class="icon-btn" id="gl-pp" style="width:78px;height:78px;background:var(--accent);color:#fff" aria-label="Pausar">${icon('pause', 28)}</button><button class="btn btn-ghost" id="bx-skip">Pular fase</button><button class="btn btn-white" id="gl-fin">Finalizar</button></div>`);
    if (id === 'natacao') return frame(`<div class="kicker" style="color:var(--accent)" data-e="0">Piscina 25 m</div><h1 class="display" style="font-size:26px;margin:8px 0 14px" data-e="1">${['Série técnica', 'Resistência', 'Tiros de 50 m'][p]}</h1>
      <div class="row" style="gap:8px;flex-wrap:wrap" data-e="2">${['Livre', 'Costas', 'Peito', 'Borboleta'].map((s, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-stroke="${s}">${s}</button>`).join('')}</div>
      <button id="sw-tap" class="press" style="position:relative;flex:1;margin:18px 0;border-radius:34px;border:1px dashed var(--stroke-hi);background:rgba(56,189,248,.06);display:grid;place-items:center;overflow:hidden" data-e="3" aria-label="Registrar volta">
        <div style="text-align:center"><div class="live-num" style="font-size:120px" id="sw-laps">0</div><div class="muted">voltas · toque a cada parede</div><div class="num" style="font-size:22px;margin-top:10px" id="sw-m">0 m</div></div></button>
      <div class="grid2" data-e="4"><div class="card" style="padding:14px"><div class="muted small">Ritmo /100 m</div><div class="num" style="font-size:26px;margin-top:4px" id="sw-pace">--</div></div><button class="btn btn-white" id="gl-fin" style="height:auto">Finalizar</button></div>`);
    if (id === 'futebol') return frame(`<div class="kicker" style="color:var(--accent)" data-e="0">${['Registrar partida', 'Treino técnico', 'Físico para futebol'][p]}</div>
      <div class="card glass" style="margin:16px 0;padding:22px" data-e="1"><div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;text-align:center;gap:10px">
        <div><div class="muted small">Meu time</div><div class="live-num" style="font-size:80px" id="fb-a">0</div><div class="row" style="justify-content:center;gap:6px"><button class="icon-btn" style="width:40px;height:40px;background:rgba(255,255,255,.08)" data-sc="a,-1" aria-label="Menos gol do meu time">${icon('minus', 16)}</button><button class="icon-btn" style="width:40px;height:40px;background:rgba(255,255,255,.08)" data-sc="a,1" aria-label="Gol do meu time">${icon('plus', 16)}</button></div></div>
        <div class="display muted" style="font-size:18px">×</div>
        <div><div class="muted small">Adversário</div><div class="live-num" style="font-size:80px" id="fb-b">0</div><div class="row" style="justify-content:center;gap:6px"><button class="icon-btn" style="width:40px;height:40px;background:rgba(255,255,255,.08)" data-sc="b,-1" aria-label="Menos gol adversário">${icon('minus', 16)}</button><button class="icon-btn" style="width:40px;height:40px;background:rgba(255,255,255,.08)" data-sc="b,1" aria-label="Gol adversário">${icon('plus', 16)}</button></div></div></div></div>
      <div class="grid2" data-e="2"><button class="card press" style="text-align:center;padding:22px" data-me="g"><div class="live-num" style="font-size:56px" id="fb-g">0</div><div class="h3">Meus gols</div></button><button class="card press" style="text-align:center;padding:22px" data-me="a"><div class="live-num" style="font-size:56px" id="fb-as">0</div><div class="h3">Assistências</div></button></div>
      <div style="flex:1"></div><button class="btn btn-white btn-block" id="gl-fin" data-e="3">Encerrar partida</button>`);
    // calistenia
    return frame(`<div class="kicker" style="color:var(--accent)" data-e="0">Progressão</div><h1 class="display" style="font-size:26px;margin:8px 0 6px" data-e="1">${['Rumo ao muscle-up', 'Core e L-sit', 'Paralelas e pike'][p]}</h1>
      <div class="card" style="margin-top:12px" data-e="2"><div class="between"><span class="h3">Muscle-up</span><span class="num" style="font-size:20px" id="cl-p">55%</span></div><div class="bar" style="margin-top:10px;height:10px"><i id="cl-bar" style="transform:scaleX(.55);background:var(--neon)"></i></div><div class="muted small" style="margin-top:8px">Cada bloco concluído aproxima o desbloqueio</div></div>
      <div class="stack" style="margin-top:14px;gap:8px" id="cl-list">${[['Barra explosiva', '4 × 5'], ['Transição na faixa', '4 × 3'], ['Mergulho profundo', '3 × 8'], ['Negativa de muscle-up', '3 × 3'], ['Hollow hold', '3 × 30 s'], ['False grip hang', '3 × 20 s']].map((b, i) => `<button class="list-item press" style="text-align:left" data-blk="${i}" data-e="${3 + i}"><span class="ico">${icon('rings', 20)}</span><div style="flex:1"><div class="h3">${b[0]}</div><div class="muted small">${b[1]}</div></div><span class="opt-check" style="width:28px;height:28px;border-radius:50%;border:1.5px solid var(--stroke-hi);display:grid;place-items:center"></span></button>`).join('')}</div>
      <div style="flex:1"></div><button class="btn btn-white btn-block" id="gl-fin" style="margin-top:12px">Finalizar sessão</button>`);
  },
  mount(el, { id = 'boxe', p = 0 }) {
    const t0 = Date.now(); let pausedAt = 0, pausedTotal = 0;
    const iv = setInterval(() => { if (!el.isConnected) return clearInterval(iv); if (!pausedAt) $('#gl-el', el).textContent = mmss((Date.now() - t0 - pausedTotal) / 1000); }, 250);
    let extra = () => {}; el._cleanup = () => { clearInterval(iv); extra(); };
    const elapsed = () => (Date.now() - t0 - pausedTotal) / 1000;
    let summary = () => ({ stats: [['Duração', mmss(elapsed())]], text: 'Sessão concluída.', big: mmss(elapsed()), bigU: 'de treino' });
    if (id === 'boxe') {
      const R = 8, FIGHT = 180, REST = 60; const C = 2 * Math.PI * 128; let round = 1, phase = 'fight', left = FIGHT, last = performance.now(), run = true, raf;
      const combos = ['Jab · Direto', 'Jab duplo · Direto', 'Direto · Gancho · Direto', 'Jab · Esquiva · Cruzado', 'Upper · Gancho', 'Jab · Saída lateral'];
      const c = $('#bx-c', el), t = $('#bx-t', el), cb = $('#bx-combo', el), ph = $('#bx-phase', el); let lastCombo = -1;
      const nextPhase = () => { haptic([30, 60, 30]); if (phase === 'fight') { if (round >= R) { run = false; return; } phase = 'rest'; left = REST; c.style.stroke = '#A3FF12'; ph.style.color = '#A3FF12'; cb.textContent = 'Respire'; }
        else { phase = 'fight'; round++; left = FIGHT; c.style.stroke = ''; ph.style.color = ''; }
        ph.textContent = `Round ${round} de ${R} · ${phase === 'fight' ? 'Luta' : 'Descanso'}`; A(t, [{ transform: 'scale(1.2)', opacity: .3 }, { transform: 'none', opacity: 1 }], { spring: [200, 14] }); };
      const loop = now => { if (!el.isConnected) return; if (run) { left -= (now - last) / 1000 * (Motion.reduced ? 1 : 6); if (left <= 0) nextPhase(); }
        last = now; const tot = phase === 'fight' ? FIGHT : REST; t.textContent = `${Math.floor(Math.max(0, left) / 60)}:${String(Math.floor(Math.max(0, left) % 60)).padStart(2, '0')}`; c.style.strokeDashoffset = C * (1 - Math.max(0, left) / tot);
        if (phase === 'fight') { const k = Math.floor((tot - left) / 20) % combos.length; if (k !== lastCombo) { lastCombo = k; cb.textContent = combos[k]; A(cb, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'out' }); } }
        raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop); extra = () => cancelAnimationFrame(raf);
      $('#gl-pp', el).onclick = e => { run = !run; e.currentTarget.innerHTML = icon(run ? 'pause' : 'play', 28); e.currentTarget.setAttribute('aria-label', run ? 'Pausar' : 'Retomar'); haptic(8); };
      $('#bx-skip', el).onclick = nextPhase;
      $('.topbar .glass', el).insertAdjacentHTML('afterend', '');
      $('#bx-phase', el).insertAdjacentHTML('beforebegin', `<span class="demo-badge" style="margin-bottom:10px;align-self:flex-start">Tempo acelerado 6×</span>`);
      summary = () => ({ stats: [['Rounds', `${round - (phase === 'fight' && left > 0 ? 1 : 0)}`], ['Duração', mmss(elapsed())], ['Intensidade', '84%']], text: 'Rounds com foco em combinação e saída.', big: String(Math.max(1, round - (phase === 'fight' && left > 0 ? 1 : 0))), bigU: 'rounds' });
    }
    if (id === 'natacao') {
      let laps = 0, stroke = 'Livre'; const tap = $('#sw-tap', el);
      tap.onclick = () => { laps++; haptic(12); const n = $('#sw-laps', el); n.textContent = laps; A(n, [{ transform: 'scale(1.25)' }, { transform: 'none' }], { spring: [300, 14] }); $('#sw-m', el).textContent = `${fmt(laps * 25)} m · ${stroke}`;
        const r = document.createElement('span'); r.style.cssText = 'position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px;border-radius:50%;border:2px solid var(--accent);pointer-events:none'; tap.appendChild(r);
        A(r, [{ transform: 'scale(1)', opacity: .9 }, { transform: 'scale(9)', opacity: 0 }], { duration: 900, easing: 'out' }).finished.then(() => r.remove());
        const per100 = elapsed() / 60 / (laps * 25 / 100); $('#sw-pace', el).textContent = laps >= 2 ? paceStr(per100) : '--'; };
      el.addEventListener('click', e => { const s = e.target.closest('[data-stroke]'); if (!s) return; stroke = s.dataset.stroke; $$('[data-stroke]', el).forEach(x => x.classList.toggle('on', x === s)); });
      summary = () => ({ stats: [['Distância', fmt(laps * 25) + ' m'], ['Voltas', String(laps)], ['Duração', mmss(elapsed())]], text: `${fmt(laps * 25)} m de ${stroke.toLowerCase()}.`, big: fmt(laps * 25), bigU: 'metros' });
    }
    if (id === 'futebol') {
      const sc = { a: 0, b: 0, g: 0, as: 0 };
      el.addEventListener('click', e => { const b = e.target.closest('[data-sc]'), m = e.target.closest('[data-me]');
        if (b) { const [k, d] = b.dataset.sc.split(','); sc[k] = Math.max(0, sc[k] + +d); const n = $('#fb-' + k, el); n.textContent = sc[k]; A(n, [{ transform: `translateY(${+d > 0 ? 20 : -20}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { spring: [260, 18] }); haptic(8); }
        if (m) { const k = m.dataset.me === 'g' ? 'g' : 'as'; sc[k]++; const n = $(k === 'g' ? '#fb-g' : '#fb-as', el); n.textContent = sc[k]; A(m, [{ transform: 'scale(.94)' }, { transform: 'none' }], { spring: [300, 12] }); haptic([10, 30, 10]);
          if (k === 'g') { sc.a++; $('#fb-a', el).textContent = sc.a; toast('Gol registrado', 'ball'); } } });
      summary = () => ({ stats: [['Placar', `${sc.a} × ${sc.b}`], ['Gols', String(sc.g)], ['Assist.', String(sc.as)]], text: sc.a > sc.b ? 'Vitória com o time de sempre.' : sc.a === sc.b ? 'Empate disputado.' : 'Derrota hoje, revanche semana que vem.', big: `${sc.a}×${sc.b}`, bigU: 'placar final' });
    }
    if (id === 'calistenia') {
      let done = 0;
      el.addEventListener('click', e => { const b = e.target.closest('[data-blk]'); if (!b || b._done) return; b._done = true; done++; haptic([8, 30, 12]);
        const ck = $('.opt-check', b); ck.style.background = 'var(--neon)'; ck.style.borderColor = 'transparent'; ck.innerHTML = `<span style="color:#0b1406">${icon('check', 15, 2.6)}</span>`; A(ck, [{ transform: 'scale(.3)' }, { transform: 'none' }], { spring: [300, 12] });
        const p = .55 + done * .025; A($('#cl-bar', el), [{ transform: `scaleX(${p - .025})` }, { transform: `scaleX(${p})` }], { spring: [140, 18] }); $('#cl-p', el).textContent = Math.round(p * 100) + '%'; });
      summary = () => ({ stats: [['Blocos', `${done}/6`], ['Progressão', `${Math.round((.55 + done * .025) * 100)}%`], ['Duração', mmss(elapsed())]], text: `Muscle-up cada vez mais perto: ${Math.round((.55 + done * .025) * 100)}%.`, big: String(done), bigU: 'blocos concluídos' });
    }
    const fin = async () => { el._cleanup(); const s = summary(); Nav.push('summary', { post: { sport: id, title: `${SPORTS[id].name} concluído`, stats: s.stats, pr: false, text: s.text }, big: s.big, bigU: s.bigU }); };
    $('#gl-fin', el).onclick = fin;
    $('#gl-close', el).onclick = async () => { if (await confirmDialog('Encerrar sessão?', 'Você pode salvar o que já registrou.', 'Encerrar e salvar')) fin(); };
  },
  unmount(el) { el._cleanup && el._cleanup(); },
};

/* ---------------- Activity summary + completion animation ---------------- */
Screens.summary = {
  noSwipe: true,
  render({ post, big, bigU, route }) {
    const sp = SPORTS[post.sport]; setAccent(post.sport);
    return `<div style="position:absolute;inset:0">${route != null ? mapSVG(route, { id: 'sm', accent: sp.c }) : scene(post.sport, post.sport, { word: '' })}</div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,11,11,.4),rgba(11,11,11,.6) 35%,#0B0B0B 62%)"></div>
    <canvas id="sm-conf" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5"></canvas>
    <div class="scroll" style="z-index:4"><div class="pad" style="padding-top:calc(var(--safe-top) + 120px);text-align:center">
      <div class="kicker" style="color:var(--accent)" data-e="0">${post.pr ? 'Novo recorde pessoal' : 'Atividade salva'}</div>
      <div class="live-num" style="font-size:120px;margin-top:14px" data-e="1" data-ek="scale">${big}</div><div class="muted" data-e="2">${bigU}</div>
      <h1 class="display sm-title" style="font-size:31px;margin:26px 0 22px">${esc(post.title)}</h1>
      <div class="glass" style="border-radius:28px;padding:18px 8px;display:grid;grid-template-columns:repeat(${post.stats.length},1fr);text-align:center" data-e="4">${post.stats.map((s, i) => `<div style="${i ? 'border-left:1px solid var(--stroke)' : ''}"><div class="num" style="font-size:22px">${esc(s[1])}</div><div class="muted small" style="margin-top:4px">${esc(s[0])}</div></div>`).join('')}</div>
      <div class="field" style="text-align:left;margin-top:20px" data-e="5"><label for="sm-txt">Legenda</label><textarea class="input" id="sm-txt" rows="2">${esc(post.text)}</textarea></div>
      <div class="toggle-row" style="text-align:left" data-e="6"><span class="small">Ocultar início e fim do trajeto</span><button class="switch" role="switch" aria-checked="${Store.get().privacy.hideRouteEnds}" id="sm-hide" aria-label="Ocultar início e fim do trajeto"></button></div>
      <div class="stack" style="margin-top:18px" data-e="7"><button class="btn btn-white btn-block" id="sm-post">${icon('share', 18)}Publicar na comunidade</button><button class="btn btn-ghost btn-block" id="sm-save">Salvar sem publicar</button></div>
      <div style="height:40px"></div></div></div>`;
  },
  mount(el, { post }) {
    Motion.kinetic($('.sm-title', el), 500); haptic([20, 60, 20, 60, 40]);
    if (post.pr || true) confetti($('#sm-conf', el), post.pr ? 90 : 40);
    $('#sm-hide', el).onclick = e => { const v = e.currentTarget.getAttribute('aria-checked') !== 'true'; e.currentTarget.setAttribute('aria-checked', v); Store.get().privacy.hideRouteEnds = v; Store.save(); };
    const close = () => { Nav.go(Store.get().onboarded ? 'social' : 'home'); };
    $('#sm-post', el).onclick = () => { const s = Store.get(); const p = { ...post, id: 'u' + Date.now(), who: 'me', t: 'agora', kind: post.pr ? 'pr' : 'activity', text: $('#sm-txt', el).value, likes: 0, comments: 0 };
      s.posts.unshift(p); Store.save(); socialFilter = 'all'; Nav.go('social'); setTimeout(() => toast('Publicado na comunidade'), 400); };
    $('#sm-save', el).onclick = () => { Nav.go('home'); setTimeout(() => toast('Atividade salva no histórico'), 400); };
  },
};

/* ---------------- Celebration overlay (medal reveal) ---------------- */
function celebrate({ title, sub, big, points = 100, color = '#A3FF12', icon: ic = 'medal', share = true }) {
  return new Promise(res => {
    const phone = $('.phone'); const o = document.createElement('div'); o.className = 'celebrate'; o.style.setProperty('--cc', color); o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', title);
    o.innerHTML = `<canvas></canvas><div class="medal"><div class="disc">${icon(ic, 64, 1.6)}</div><div class="shine"></div></div>
      <div class="kicker" style="color:${color}">${esc(sub || '')}</div><h2 class="display cel-title" style="font-size:31px;margin:10px 0 6px">${esc(title)}</h2>
      ${big ? `<div class="live-num" style="font-size:64px;margin:6px 0">${esc(big)}</div>` : ''}
      <div class="tag" style="height:32px;padding:0 14px;font-size:13px;color:${color};margin:8px 0 26px">+<span class="cel-pts">0</span> pontos</div>
      <div class="row" style="gap:10px">${share ? `<button class="btn btn-ghost cel-share">${icon('share', 18)}Compartilhar</button>` : ''}<button class="btn btn-white cel-ok">Continuar</button></div>`;
    phone.appendChild(o);
    A(o, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    const m = $('.medal', o);
    A(m, [{ transform: 'scale(.2) rotateY(180deg)', opacity: 0 }, { transform: 'scale(1.08) rotateY(-10deg)', opacity: 1, offset: .7 }, { transform: 'scale(1) rotateY(0)', opacity: 1 }], { duration: 1100, easing: 'out' });
    Motion.kinetic($('.cel-title', o), 350);
    $$('.kicker,.live-num,.tag,.row', o).forEach((x, i) => A(x, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { spring: [170, 20], delay: 500 + i * 80 }));
    setTimeout(() => Motion.tween(0, points, 1200, v => $('.cel-pts', o).textContent = Math.round(v)), 700);
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
