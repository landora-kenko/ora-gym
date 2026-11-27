/* ============================================================
   ORA GYM — Corrida (e pedal): GPS real com modos (livre, distância,
   tempo, intervalado), voz em português, pausa automática, corrida
   em andamento que sobrevive a recarregar, resumo com mapa, parciais,
   melhores marcas e controle de tênis.
   ============================================================ */
const RUN_C = '#D4FF3A';
const isRunAct = a => a && (a.sport === 'corrida' || a.sport === 'ciclismo');
const km2 = m => fmt((m || 0) / 1000, 2);
const kmStr = m => { const k = (m || 0) / 1000; return fmt(k, k >= 100 ? 0 : k >= 10 ? 1 : 2); };
const RUN_MODES = { free: 'Livre', dist: 'Distância', time: 'Tempo', int: 'Intervalado' };
const runPrefs = () => ({ voice: true, auto: true, ...(Store.get().runPrefs || {}) });
const setRunPrefs = p => Store.set({ runPrefs: { ...runPrefs(), ...p } });

/* ---------- voz ---------- */
const Voice = {
  say(t) { if (!runPrefs().voice || !('speechSynthesis' in window)) return; try { const u = new SpeechSynthesisUtterance(t); u.lang = 'pt-BR'; u.rate = 1.04; const v = speechSynthesis.getVoices().find(x => /pt(-|_)BR/i.test(x.lang)); if (v) u.voice = v; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} },
  dur(s) { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return [h ? `${h} ${h > 1 ? 'horas' : 'hora'}` : '', m ? `${m} ${m > 1 ? 'minutos' : 'minuto'}` : '', x && !h ? `${x} segundos` : ''].filter(Boolean).join(' e ') || '0 segundos'; },
  pace(secPerKm) { const m = Math.floor(secPerKm / 60), s = Math.round(secPerKm % 60); return `${m} e ${String(s).padStart(2, '0')} por quilômetro`; },
};

/* ---------- melhores marcas a partir das parciais ---------- */
const EFFORTS = [[1, '1 km'], [5, '5 km'], [10, '10 km'], [21, '21 km']];
function bestWindow(splits, k) { if (!splits || splits.length < k) return null; let s = 0, best = Infinity; for (let i = 0; i < splits.length; i++) { s += splits[i]; if (i >= k) s -= splits[i - k]; if (i >= k - 1 && s < best) best = s; } return best; }
function effortOf(a, k) { const w = bestWindow(a.splits, k); if (w) return w; const d = (a.distance || 0) / 1000; if (d >= k * .99 && d <= k * 1.03 && a.duration) return a.duration * (k / d); return null; }
function runRecords(acts) {
  const R = acts.filter(a => a.sport === 'corrida' && a.distance > 0 && a.duration > 0);
  const out = EFFORTS.map(([k, l]) => { let best = null; R.forEach(a => { const t = effortOf(a, k); if (t && (!best || t < best.t)) best = { t, a }; }); return { k: l, v: best ? hms(best.t) : '—', sub: best ? `${paceOf(best.t, k * 1000)}/km · ${shortDate(best.a.startedAt)}` : 'ainda sem marca', a: best && best.a }; });
  const longest = R.reduce((b, a) => !b || a.distance > b.distance ? a : b, null);
  out.push({ k: 'Mais longa', v: longest ? kmStr(longest.distance) + ' km' : '—', sub: longest ? shortDate(longest.startedAt) : 'ainda sem marca', a: longest });
  const fast = R.filter(a => a.distance >= 3000).reduce((b, a) => !b || a.duration / a.distance < b.duration / b.distance ? a : b, null);
  out.push({ k: 'Melhor pace', v: fast ? paceOf(fast.duration, fast.distance) : '—', sub: fast ? `média · ${kmStr(fast.distance)} km` : 'corridas de 3 km+', a: fast });
  return out;
}
function prsIn(a) { if (a.sport !== 'corrida') return []; const others = API.acts.filter(x => x.sport === 'corrida' && x.id !== a.id && x.startedAt < (a.startedAt || Infinity)); const out = [];
  EFFORTS.forEach(([k, l]) => { const t = effortOf(a, k); if (!t) return; const prev = others.map(x => effortOf(x, k)).filter(Boolean); if (prev.length && t < Math.min(...prev)) out.push({ l, t }); });
  if (others.length && a.distance > Math.max(...others.map(x => x.distance || 0))) out.push({ l: 'Mais longa', t: null }); return out; }

/* ---------- tênis ---------- */
const shoes = () => (API.me && API.me.shoes) || [];
const shoeKm = id => API.acts.filter(a => a.shoeId === id).reduce((s, a) => s + (a.distance || 0), 0) / 1000;
const defaultShoe = () => { const L = shoes().filter(s => !s.retired); return (L.find(s => s.def) || L[0] || null); };
function shoesSheet(done) {
  const draw = () => { const L = shoes();
    return `<h3 class="h2">Seus tênis</h3><p class="muted small" style="margin:6px 0 14px">A quilometragem soma sozinha a cada corrida. A maioria dos tênis rende de 600 a 800 km.</p>
    <div class="stack" style="gap:10px">${L.length ? L.map(s => { const k = shoeKm(s.id); const p = Math.min(1, k / (s.limit || 700)); return `<div class="rx-shoe ${s.retired ? 'off' : ''}"><div class="between"><div style="min-width:0"><div class="h3">${esc(s.name)}${s.def && !s.retired ? ' <span class="rx-tag">padrão</span>' : ''}${s.retired ? ' <span class="rx-tag">aposentado</span>' : ''}</div><div class="muted small">${fmt(k, 1)} de ${s.limit || 700} km</div></div>
      <div class="row" style="gap:6px">${!s.retired && !s.def ? `<button class="chip sm" data-sdef="${s.id}">Padrão</button>` : ''}<button class="chip sm" data-sret="${s.id}">${s.retired ? 'Reativar' : 'Aposentar'}</button></div></div><div class="rx-bar ${p >= .9 ? 'warn' : ''}"><i style="width:${p * 100}%"></i></div></div>`; }).join('') : '<p class="muted small">Nenhum tênis cadastrado.</p>'}</div>
    <div class="grid2" style="margin-top:16px;grid-template-columns:minmax(0,2fr) minmax(0,1fr)"><div class="field"><label for="sh-n">Novo tênis</label><input class="input" id="sh-n" placeholder="Ex.: Pegasus 41" maxlength="40"></div><div class="field"><label for="sh-l">Limite (km)</label><input class="input" id="sh-l" type="number" inputmode="numeric" value="700" min="100"></div></div>
    <button class="btn btn-white btn-block" data-sadd>${icon('plus', 16)}Adicionar tênis</button>`; };
  Sheet.open(`<div class="rx-shoes">${draw()}</div>`, (w) => { const root = $('.rx-shoes', w);
    const save = async L => { try { await API.updateProfile({ shoes: L }); root.innerHTML = draw(); done && done(); } catch (x) { toast(errMsg(x), 'x'); } };
    root.addEventListener('click', async e => {
      if (e.target.closest('[data-sadd]')) { const n = $('#sh-n', root).value.trim(); if (!n) return toast('Dê um nome ao tênis', 'x'); const lim = Math.max(100, Math.round(+$('#sh-l', root).value || 700)); const L = shoes().map(s => ({ ...s })); L.push({ id: 's' + Date.now().toString(36), name: n, limit: lim, def: !L.some(s => s.def && !s.retired), retired: false, added: Date.now() }); await save(L); toast('Tênis adicionado'); }
      const d = e.target.closest('[data-sdef]'); if (d) await save(shoes().map(s => ({ ...s, def: s.id === d.dataset.sdef })));
      const r = e.target.closest('[data-sret]'); if (r) await save(shoes().map(s => s.id === r.dataset.sret ? { ...s, retired: !s.retired, def: s.retired ? s.def : false } : s));
    }); }, { label: 'Tênis' });
}

/* ============================================================
   Espaço da corrida
   ============================================================ */
let runPick = { mode: 'free', target: 0 };
const PRESETS = [['free', 0, 'Livre'], ['dist', 5, '5 km'], ['dist', 10, '10 km'], ['time', 30, '30 min'], ['int', 6, 'Intervalado']];
function weekDays(acts) { const t = noon(new Date()); const mon = new Date(t); mon.setDate(t.getDate() - ((t.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); const k = dayKey(d); const m = acts.filter(a => a.sport === 'corrida' && dayKey(new Date(a.startedAt)) === k).reduce((s, a) => s + (a.distance || 0), 0); return { d, m, today: k === dayKey(t), fut: d > t }; }); }
WORLD.corrida = (sp, S) => {
  const runs = API.acts.filter(a => a.sport === 'corrida'); const wd = weekDays(API.acts); const wk = wd.reduce((s, x) => s + x.m, 0); const g = S.goal; const tgt = g.kind === 'metric' ? g.target : null;
  const wkRuns = runs.filter(a => a.startedAt >= wd[0].d.getTime() - 12 * 3600e3); const wkTime = wkRuns.reduce((s, a) => s + (a.duration || 0), 0);
  const mx = Math.max(1, ...wd.map(x => x.m)); const L = runs[0]; const recs = runRecords(API.acts); const sh = shoes().filter(s => !s.retired);
  const wn = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); const w1 = new Date(d.getFullYear(), 0, 4); return 1 + Math.round(((d - w1) / 864e5 - 3 + (w1.getDay() + 6) % 7) / 7); })();
  return `<div class="rx-hero"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('corrida', 'corrida', { eager: true, i: 1, fade: 'background:linear-gradient(180deg,rgba(6,8,6,.55),rgba(6,8,6,.15) 35%,rgba(6,8,6,.55) 62%,#060806 97%)' })}</div><div class="rx-grain"></div>
    <div class="rx-hero-in"><div class="rx-kick" data-e="1"><span>SEMANA ${wn}</span><i></i>${wd[0].d.getDate()}–${wd[6].d.getDate()} ${wd[6].d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</div>
      <div class="rx-big" data-e="2"><b class="num">${kmStr(wk)}</b><span>km${tgt ? `<em>/ ${tgt}</em>` : ''}</span></div>
      ${tgt ? `<button class="rx-goal" data-goal data-e="3" aria-label="Meta semanal de ${tgt} km"><i style="--p:${Math.min(1, wk / 1000 / tgt)}"></i><span>${wk / 1000 >= tgt ? 'Meta da semana batida' : `faltam ${fmt(Math.max(0, tgt - wk / 1000), 1)} km para a meta`}</span></button>` : `<button class="rx-goal" data-goal data-e="3"><span>Definir meta semanal em km</span></button>`}
      <div class="rx-sub" data-e="3">${wkRuns.length} ${wkRuns.length === 1 ? 'corrida' : 'corridas'}<i></i>${hms(wkTime)}${wk > 0 ? `<i></i>${paceOf(wkTime, wk)}/km` : ''}</div>
      <div class="rx-week" data-e="4">${wd.map(x => `<div class="${x.today ? 'today' : ''} ${x.fut ? 'fut' : ''}"><span style="--h:${x.m ? Math.max(.12, x.m / mx) : 0}"><i></i></span><b>${x.m ? fmt(x.m / 1000, x.m >= 10000 ? 0 : 1) : ''}</b><em>${WD1[x.d.getDay()]}</em></div>`).join('')}</div>
    </div></div>
  <div class="pad"><div class="wgrid">
   <div>
    <div class="rx-start" data-e="5"><div class="rx-k">Próxima corrida</div><div class="rx-modes">${PRESETS.map(([m, t, l]) => `<button class="${runPick.mode === m && (m !== 'dist' && m !== 'time' || runPick.target === t) ? 'on' : ''}" data-rpick="${m},${t}">${l}</button>`).join('')}<button data-rcustom>${icon('edit', 14)}</button></div>
      <button class="rx-go press" data-push="runLive" data-params='${JSON.stringify({ id: 'corrida', ...runPick })}'><span>${icon('play', 26)}</span><b>Correr</b><em>${runPick.mode === 'free' ? 'sem meta' : runPick.mode === 'dist' ? `meta ${runPick.target} km` : runPick.mode === 'time' ? `meta ${runPick.target} min` : intervalLabel(runPick)}</em></button>
      <button class="rx-manual" data-push="manualAct" data-params='{"id":"corrida"}'>${icon('edit', 14)}Registrar corrida feita sem o app</button></div>
    ${L ? `<button class="rx-last press" data-runopen="${L.id}" data-e="6"><div class="rx-last-map">${L.route && L.route.length > 1 ? routeSVG(L.route, { color: RUN_C }) : `<div class="rx-nomap">${icon('run', 28)}</div>`}</div>
        <div class="rx-last-in"><div class="rx-k">Última corrida · ${shortDate(L.startedAt)}</div><div class="h2" style="margin-top:4px;font-size:19px">${esc(L.title || 'Corrida')}</div>
        <div class="rx-tri"><div><b class="num">${km2(L.distance)}</b><span>km</span></div><div><b class="num">${paceOf(L.duration, L.distance)}</b><span>/km</span></div><div><b class="num">${hms(L.duration)}</b><span>tempo</span></div></div></div></button>`
      : `<div class="rx-glass" style="text-align:center;padding:26px 18px" data-e="6"><div class="rx-k" style="justify-content:center">Comece do zero</div><div class="h2" style="font-size:20px;margin-top:8px">Sua primeira corrida</div><p class="muted small" style="margin:8px 0 0;line-height:1.5">Toque em Correr, espere o GPS ficar forte e mantenha a tela ligada durante a atividade.</p></div>`}
    <div class="wsec" data-e="7"><h2>Melhores marcas</h2></div>
    <div class="rx-recs" data-e="8">${recs.map(r => `<button class="rx-rec ${r.a ? 'press' : 'empty'}" ${r.a ? `data-runopen="${r.a.id}"` : ''}><span>${r.k}</span><b class="num">${r.v}</b><em>${r.sub}</em></button>`).join('')}</div>
   </div>
   <div>
    <div class="wsec" data-e="9"><h2>Tênis</h2><button class="link" data-shoes>Gerenciar</button></div>
    ${sh.length ? `<div class="stack" style="gap:10px" data-e="10">${sh.map(s => { const k = shoeKm(s.id); const p = Math.min(1, k / (s.limit || 700)); return `<button class="rx-shoe press" data-shoes><div class="between"><div style="text-align:left;min-width:0"><div class="h3">${esc(s.name)}${s.def ? ' <span class="rx-tag">padrão</span>' : ''}</div><div class="muted small">${fmt(k, 1)} km${p >= .9 ? ' · hora de trocar' : ''}</div></div><span class="muted small">${s.limit || 700} km</span></div><div class="rx-bar ${p >= .9 ? 'warn' : ''}"><i style="width:${p * 100}%"></i></div></button>`; }).join('')}</div>`
      : `<button class="rx-glass rx-addshoe press" data-shoes data-e="10">${icon('plus', 18)}<span>Cadastre seu tênis para acompanhar a quilometragem</span></button>`}
    <div class="wsec"><h2>Volume</h2></div>${chartCard('rx-glass')}
    <button class="rx-glass rx-hist press" data-push="runHistory"><span class="rx-ic">${icon('clock', 19)}</span><div style="flex:1;text-align:left"><div class="h3">Histórico de corridas</div><div class="muted small">${runs.length} ${runs.length === 1 ? 'corrida' : 'corridas'} · ${kmStr(runs.reduce((s, a) => s + (a.distance || 0), 0))} km no total</div></div>${icon('next', 18)}</button>
    <div class="wsec"><h2>Desafios de corrida</h2></div><div data-async="w-ch"><div class="card skeleton" style="height:120px"></div></div>
   </div></div></div>`;
};
WCTA.corrida = () => `<button class="btn rx-cta" data-push="runLive" data-params='${JSON.stringify({ id: 'corrida', ...runPick })}'>${icon('play', 18)}Correr agora</button>`;
const intervalLabel = p => `${p.reps || p.target || 6}× ${p.fast || 1}′ forte / ${p.slow || 2}′ leve`;
function customRunSheet(done) {
  const d = { mode: runPick.mode === 'free' ? 'dist' : runPick.mode, dist: runPick.mode === 'dist' ? runPick.target : 5, time: runPick.mode === 'time' ? runPick.target : 30, reps: runPick.reps || 6, fast: runPick.fast || 1, slow: runPick.slow || 2 };
  const body = () => `<h3 class="h2">Meta da corrida</h3><div style="margin-top:14px">${seg([['dist', 'Distância'], ['time', 'Tempo'], ['int', 'Intervalado']], d.mode, 'cm')}</div>
    ${d.mode === 'dist' ? `<div class="field" style="margin-top:16px"><label for="cm-d">Distância (km)</label><input class="input" id="cm-d" type="number" inputmode="decimal" min="0.5" step="0.5" value="${d.dist}"></div><div class="row" style="gap:6px;flex-wrap:wrap">${[3, 5, 8, 10, 15, 21.1, 42.2].map(v => `<button class="chip sm" data-cv="${v}">${fmt(v, v % 1 ? 1 : 0)} km</button>`).join('')}</div>`
      : d.mode === 'time' ? `<div class="field" style="margin-top:16px"><label for="cm-t">Tempo (min)</label><input class="input" id="cm-t" type="number" inputmode="numeric" min="5" step="5" value="${d.time}"></div><div class="row" style="gap:6px;flex-wrap:wrap">${[20, 30, 45, 60, 90].map(v => `<button class="chip sm" data-cv="${v}">${v} min</button>`).join('')}</div>`
      : `<div class="grid3" style="margin-top:16px"><div class="field"><label for="cm-r">Tiros</label><input class="input" id="cm-r" type="number" inputmode="numeric" min="1" value="${d.reps}"></div><div class="field"><label for="cm-f">Forte (min)</label><input class="input" id="cm-f" type="number" inputmode="decimal" min="0.25" step="0.25" value="${d.fast}"></div><div class="field"><label for="cm-s">Leve (min)</label><input class="input" id="cm-s" type="number" inputmode="decimal" min="0.25" step="0.25" value="${d.slow}"></div></div><p class="muted small" style="margin:0 0 12px">A voz avisa cada troca de ritmo.</p>`}
    <button class="btn btn-white btn-block" style="margin-top:14px" data-cmok>Usar esta meta</button>`;
  Sheet.open(`<div class="cm">${body()}</div>`, (w, close) => { const root = $('.cm', w); const keep = () => { const v = id => { const x = $(id, root); return x ? +x.value : null; }; if (d.mode === 'dist') d.dist = v('#cm-d') || d.dist; if (d.mode === 'time') d.time = v('#cm-t') || d.time; if (d.mode === 'int') { d.reps = v('#cm-r') || d.reps; d.fast = v('#cm-f') || d.fast; d.slow = v('#cm-s') || d.slow; } };
    const wire = () => mountSeg($('.seg', root), b => { keep(); d.mode = b.dataset.cm; root.innerHTML = body(); wire(); }); wire();
    root.addEventListener('click', e => { const c = e.target.closest('[data-cv]'); if (c) { const i = $('#cm-d', root) || $('#cm-t', root); i.value = c.dataset.cv; }
      if (e.target.closest('[data-cmok]')) { keep(); runPick = d.mode === 'dist' ? { mode: 'dist', target: Math.max(.5, d.dist) } : d.mode === 'time' ? { mode: 'time', target: Math.max(5, Math.round(d.time)) } : { mode: 'int', target: Math.round(d.reps), reps: Math.max(1, Math.round(d.reps)), fast: Math.max(.25, d.fast), slow: Math.max(.25, d.slow) }; close(); done && done(); } }); }, { label: 'Meta da corrida' });
}
document.addEventListener('click', e => {
  const w = e.target.closest('.world.w-corrida'); if (!w) return; const layer = w.closest('.layer'); const re = () => { const top = Nav.stack.find(x => x.el === layer); top && Screens.world.onReturn(layer); };
  const p = e.target.closest('[data-rpick]'); if (p) { const [m, t] = p.dataset.rpick.split(','); runPick = m === 'int' ? { mode: 'int', target: 6, reps: 6, fast: 1, slow: 2 } : { mode: m, target: +t }; haptic(5); re(); return; }
  if (e.target.closest('[data-rcustom]')) { customRunSheet(re); return; }
  if (e.target.closest('[data-shoes]')) { shoesSheet(re); return; }
  const o = e.target.closest('[data-runopen]'); if (o) { Nav.push('runDetail', { id: o.dataset.runopen }); return; }
});

/* ============================================================
   Corrida ao vivo
   ============================================================ */
const RUN_KEY = () => 'run.' + (API.me ? API.me.id : 'anon');
function intervalPlan(p) { const out = []; for (let i = 0; i < (p.reps || 6); i++) { out.push({ k: 'fast', s: Math.round((p.fast || 1) * 60), n: i + 1 }); out.push({ k: 'slow', s: Math.round((p.slow || 2) * 60), n: i + 1 }); } return out; }
Screens.runLive = {
  noSwipe: true,
  render({ id = 'corrida' }) {
    setAccent(id); const isRun = id === 'corrida'; const pr = runPrefs();
    return `<div class="rl-map" id="rl-map"></div><div class="rl-shade"></div>
    <div class="topbar" style="z-index:500"><button class="icon-btn glass" id="rl-close" aria-label="Fechar">${icon('back', 20, 2)}</button>
      <div class="rl-gps glass"><span class="dot" id="rl-gps" style="background:#FFC23D"></span><span id="rl-gpst">Procurando GPS…</span></div>
      <button class="icon-btn glass" id="rl-set" aria-label="Ajustes da corrida">${icon('settings', 19)}</button></div>
    <div class="rl-target" id="rl-target" hidden></div>
    <div class="rl-panel live-col">
      <button class="rl-primary" id="rl-prim" aria-label="Trocar métrica principal"><b class="num" id="rl-pv">0,00</b><span id="rl-pl">quilômetros</span></button>
      <div class="rl-row"><div><b class="num" id="rl-a">00:00</b><span id="rl-al">tempo</span></div><div><b class="num" id="rl-b">--</b><span>${isRun ? 'pace atual' : 'km/h'}</span></div><div><b class="num" id="rl-c">--</b><span>${isRun ? 'pace médio' : 'média'}</span></div></div>
      <div class="rl-ctrl" id="rl-ctrl"></div></div>
    <div class="rl-autopause" id="rl-ap" hidden>${icon('pause', 16, 2.4)}Pausa automática — volte a se mover</div>`;
  },
  mount(el, { id = 'corrida', mode = 'free', target = 0, reps, fast, slow }) {
    const isRun = id === 'corrida'; const color = isRun ? RUN_C : (SPORTS[id] || {}).c || '#FF7426';
    let S = { v: 1, id, mode, target, plan: mode === 'int' ? intervalPlan({ reps: reps || target || 6, fast, slow }) : null, state: 'wait', pts: [], dist: 0, moving: 0, lastT: 0, last: null, startedAt: 0, splits: [], kmMark: 1000, kmT: 0, elev: 0, alt: null, lastMove: 0, saved: 0, hit: false, phase: 0, phaseT: 0 };
    const saved = Store.get()[RUN_KEY()]; let resume = saved && saved.v === 1 && saved.id === id && Date.now() - (saved.savedAt || 0) < 6 * 3600e3 && saved.dist > 0;
    let map = null, line = null, dot = null, lock = null, watch = null, fix = null, prim = 0;
    const mapBox = $('#rl-map', el);
    if (window.L) { try { map = L.map(mapBox, { zoomControl: false, attributionControl: true }).setView([-14.2, -51.9], 4);
      map.attributionControl.setPrefix(''); L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '© OpenStreetMap © CARTO' }).addTo(map);
      line = L.polyline([], { color, weight: 6, opacity: .95, lineCap: 'round' }).addTo(map); dot = L.circleMarker([0, 0], { radius: 9, color: '#0B0B0B', weight: 4, fillColor: color, fillOpacity: 1 }); setTimeout(() => map.invalidateSize(), 300); } catch (e) { map = null; } }
    const persist = (force) => { if (S.state === 'wait' || S.state === 'done') return; if (!force && Date.now() - S.saved < 4000) return; S.saved = Date.now(); Store.set({ [RUN_KEY()]: { ...S, pts: S.pts.length > 3000 ? downsample(S.pts, 3000) : S.pts, last: null, savedAt: Date.now() } }); };
    const clearSaved = () => Store.set({ [RUN_KEY()]: null });
    const $t = sel => $(sel, el);
    const gpsUI = (t, c) => { $t('#rl-gpst').textContent = t; $t('#rl-gps').style.background = c; };
    const primVals = () => { const kmv = fmt(S.dist / 1000, 2); return [[kmv, 'quilômetros'], [hms(S.moving), 'tempo em movimento'], [S.dist > 50 ? (isRun ? paceOf(S.moving, S.dist) : fmt(S.dist / S.moving * 3.6, 1)) : '--', isRun ? 'pace médio /km' : 'km/h médio']][prim]; };
    const upd = () => { const [v, l] = primVals(); $t('#rl-pv').textContent = v; $t('#rl-pl').textContent = l;
      const sec = [[hms(S.moving), 'tempo'], [fmt(S.dist / 1000, 2), 'km'], [fmt(S.dist / 1000, 2), 'km']][prim]; $t('#rl-a').textContent = sec[0]; $t('#rl-al').textContent = sec[1];
      $t('#rl-c').textContent = S.dist > 50 ? (isRun ? paceOf(S.moving, S.dist) : fmt(S.dist / S.moving * 3.6, 1)) : '--'; targetUI(); };
    const targetUI = () => { const t = $t('#rl-target'); if (S.mode === 'free') { t.hidden = true; return; } t.hidden = false;
      if (S.mode === 'dist') { const p = Math.min(1, S.dist / (S.target * 1000)); t.innerHTML = `<div class="between"><span>Meta ${fmt(S.target, S.target % 1 ? 1 : 0)} km</span><b>${p >= 1 ? 'Concluída!' : 'faltam ' + fmt(Math.max(0, S.target - S.dist / 1000), 2) + ' km'}</b></div><div class="rl-tbar"><i style="width:${p * 100}%"></i></div>`; }
      if (S.mode === 'time') { const p = Math.min(1, S.moving / (S.target * 60)); t.innerHTML = `<div class="between"><span>Meta ${S.target} min</span><b>${p >= 1 ? 'Concluída!' : 'faltam ' + hms(Math.max(0, S.target * 60 - S.moving))}</b></div><div class="rl-tbar"><i style="width:${p * 100}%"></i></div>`; }
      if (S.mode === 'int') { const ph = S.plan[S.phase]; if (!ph) { t.innerHTML = `<div class="between"><span>Intervalado</span><b>Concluído — desaqueça</b></div><div class="rl-tbar"><i style="width:100%"></i></div>`; return; }
        const left = Math.max(0, ph.s - S.phaseT); t.className = 'rl-target ' + ph.k; t.innerHTML = `<div class="between"><span>${ph.k === 'fast' ? 'FORTE' : 'LEVE'} · tiro ${ph.n} de ${S.plan.length / 2}</span><b class="num">${hms(left)}</b></div><div class="rl-tbar"><i style="width:${(S.phaseT / ph.s) * 100}%"></i></div>`; } };
    const onPos = p => { const { latitude: la, longitude: lo, accuracy: acc, speed, altitude: alt, altitudeAccuracy: aacc } = p.coords; const now = p.timestamp || Date.now(); fix = [la, lo];
      gpsUI(acc <= 20 ? `GPS forte · ±${Math.round(acc)} m` : acc <= 40 ? `GPS médio · ±${Math.round(acc)} m` : `GPS fraco · ±${Math.round(acc)} m`, acc <= 20 ? '#A3FF12' : acc <= 40 ? '#FFC23D' : '#FF4D5E');
      if (S.state === 'wait') { const b = $t('#rl-start'); if (b && acc <= 50) { b.disabled = false; $('b', b).textContent = resume ? 'Retomar' : 'Iniciar'; } if (map) { map.setView([la, lo], 16); dot.setLatLng([la, lo]).addTo(map); } return; }
      if (map) dot.setLatLng([la, lo]).addTo(map);
      if ((S.state !== 'run' && S.state !== 'auto') || acc > 35) return;
      if (S.last) { const d = haversine(S.last.c, [la, lo]); const dt = (now - S.last.t) / 1000; if (dt <= 0) return; const v = d / dt;
        if (v > (isRun ? 12 : 30)) return;
        const moving = (speed != null && speed > .8) || (d >= 3 && v > .8);
        if (moving) { S.lastMove = Date.now(); if (S.state === 'auto') { S.state = 'run'; S.lastT = Date.now(); $t('#rl-ap').hidden = true; Voice.say('Retomando'); haptic(12); } }
        if (S.state !== 'run' || d < 2) { S.last = { c: [la, lo], t: now }; return; }
        S.dist += d; $t('#rl-b').textContent = isRun ? (speed > .6 ? paceStr(1000 / speed / 60) : paceOf(dt, d)) : fmt((speed || v) * 3.6, 1);
        if (alt != null && (aacc == null || aacc <= 15)) { S.alt = S.alt == null ? alt : S.alt * .7 + alt * .3; if (S._alt0 == null) S._alt0 = S.alt; if (S.alt - S._alt0 > 1.5) { S.elev += S.alt - S._alt0; S._alt0 = S.alt; } else if (S.alt < S._alt0) S._alt0 = S.alt; }
        while (S.dist >= S.kmMark) { const sp = S.moving - S.kmT; S.splits.push(Math.round(sp)); S.kmT = S.moving; const k = S.kmMark / 1000;
          toast(`${k} km · ${isRun ? paceStr(sp / 60) + '/km' : hms(sp)}`, 'route'); beep(880, .15, 2); haptic([15, 40, 15]);
          Voice.say(`${k} ${k > 1 ? 'quilômetros' : 'quilômetro'}. Tempo ${Voice.dur(S.moving)}. ${isRun ? 'Último quilômetro em ' + Voice.pace(sp) : ''}`); S.kmMark += 1000; }
        if (S.mode === 'dist' && !S.hit && S.dist >= S.target * 1000) { S.hit = true; beep(990, .3, 3); haptic([30, 60, 30]); Voice.say(`Meta de ${fmt(S.target, S.target % 1 ? 1 : 0)} quilômetros concluída. Mandou bem!`); toast('Meta de distância concluída!', 'trophy'); } }
      S.last = { c: [la, lo], t: now }; S.pts.push([+la.toFixed(6), +lo.toFixed(6)]); if (line) { line.addLatLng([la, lo]); map.panTo([la, lo], { animate: true }); } upd(); persist(); };
    const onErr = e => { if (e.code === 1) { gpsUI('Localização bloqueada', '#FF4D5E'); $t('#rl-ctrl').innerHTML = `<div class="rx-glass" style="text-align:center;margin:0"><div class="h3">Precisamos da sua localização</div><p class="muted small" style="margin:8px 0 12px;line-height:1.5">No iPhone: Ajustes › Privacidade › Serviços de Localização › Safari › “Ao Usar o App”. Depois recarregue a página.</p><button class="btn btn-white btn-sm" data-push="manualAct" data-params='{"id":"${id}"}'>Registrar manualmente</button></div>`; }
      else gpsUI('Sem sinal de GPS — vá para um lugar aberto', '#FF4D5E'); };
    if (!('geolocation' in navigator)) onErr({ code: 1 }); else watch = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
    const clock = setInterval(() => { if (!el.isConnected) return; const n = Date.now();
      if (S.state === 'run') { const dt = (n - S.lastT) / 1000; S.moving += dt; S.lastT = n;
        if (S.mode === 'int' && S.plan[S.phase]) { S.phaseT += dt; const ph = S.plan[S.phase]; if (S.phaseT >= ph.s) { S.phase++; S.phaseT = 0; const nx = S.plan[S.phase]; haptic([30, 60, 30]); beep(nx && nx.k === 'fast' ? 990 : 660, .3, 2); Voice.say(nx ? (nx.k === 'fast' ? `Tiro ${nx.n}. Acelera!` : 'Recupera. Ritmo leve.') : 'Intervalado concluído. Desaqueça.'); } }
        if (S.mode === 'time' && !S.hit && S.moving >= S.target * 60) { S.hit = true; beep(990, .3, 3); Voice.say(`Meta de ${S.target} minutos concluída!`); toast('Meta de tempo concluída!', 'trophy'); }
        if (runPrefs().auto && S.lastMove && n - S.lastMove > 10000) { S.state = 'auto'; $t('#rl-ap').hidden = false; Voice.say('Pausa automática'); }
        upd(); persist(); } }, 500);
    el._cleanup = () => { clearInterval(clock); if (watch != null) navigator.geolocation.clearWatch(watch); try { lock && lock.release(); } catch (e) {} try { map && map.remove(); } catch (e) {} };
    const ctrl = $t('#rl-ctrl');
    const waitUI = () => { ctrl.innerHTML = `${resume ? `<div class="rl-resume">${icon('refresh', 15)}Corrida de ${km2(saved.dist)} km em andamento <button class="link" id="rl-disc">Descartar</button></div>` : `<div class="rl-modechip" id="rl-mode">${icon('flag', 14)}${S.mode === 'free' ? 'Corrida livre' : S.mode === 'dist' ? `Meta ${fmt(S.target, S.target % 1 ? 1 : 0)} km` : S.mode === 'time' ? `Meta ${S.target} min` : intervalLabel({ reps: S.plan.length / 2, fast: S.plan[0].s / 60, slow: S.plan[1].s / 60 })}</div>`}
      <button class="rl-go" id="rl-start" disabled><span>${icon('play', 30)}</span><b>Aguardando GPS</b></button><p class="rl-tip">Mantenha a tela ligada — no navegador o GPS para quando o celular bloqueia.</p>`;
      const ds = $t('#rl-disc'); if (ds) ds.onclick = () => { clearSaved(); resume = false; waitUI(); toast('Corrida anterior descartada', 'trash'); };
      $t('#rl-start').onclick = start; if (fix) { const b = $t('#rl-start'); b.disabled = false; $('b', b).textContent = resume ? 'Retomar' : 'Iniciar'; } };
    const running = () => { ctrl.innerHTML = `<div class="rl-btns"><button class="icon-btn rl-sq" id="rl-lockb" aria-label="Bloquear toques">${icon('lock', 20)}</button><button class="rl-pause" id="rl-pause" aria-label="Pausar">${icon('pause', 32)}</button><button class="icon-btn rl-sq" id="rl-say" aria-label="Ouvir status">${icon('volume', 20)}</button></div>`;
      $t('#rl-pause').onclick = paused; $t('#rl-say').onclick = () => Voice.say(`${fmt(S.dist / 1000, 2).replace(',', ' vírgula ')} quilômetros em ${Voice.dur(S.moving)}${S.dist > 200 && isRun ? '. Pace médio ' + Voice.pace(S.moving / (S.dist / 1000)) : ''}`);
      $t('#rl-lockb').onclick = () => { const ov = document.createElement('div'); ov.className = 'rl-lock'; ov.innerHTML = `<div>${icon('lock', 26)}<b>Toques bloqueados</b><span>Segure para desbloquear</span><button class="hold-btn btn btn-white"><span class="fill"></span><span style="position:relative">Segure</span></button></div>`; el.appendChild(ov); const hb = $('button', ov), f = $('.fill', hb); let an;
        hb.addEventListener('pointerdown', () => { an = A(f, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 700, easing: 'linear' }); an.finished.then(() => { if (!an._c) ov.remove(); }).catch(() => {}); }); const up = () => { if (an && an.playState === 'running') { an._c = true; an.cancel(); } }; hb.addEventListener('pointerup', up); hb.addEventListener('pointerleave', up); }; };
    const paused = () => { S.state = 'pause'; haptic(12); S.last = null; persist(true); Voice.say('Corrida pausada'); $t('#rl-ap').hidden = true;
      ctrl.innerHTML = `<div class="rl-btns"><button class="icon-btn rl-sq" id="rl-trash" aria-label="Descartar corrida">${icon('trash', 19)}</button><button class="rl-pause play" id="rl-resume" aria-label="Retomar">${icon('play', 32)}</button><button class="rl-hold hold-btn" id="rl-finish" aria-label="Segure para finalizar"><span class="fill"></span><span style="position:relative">${icon('stop', 20)}</span></button></div><p class="rl-tip">Segure o quadrado para finalizar</p>`;
      $t('#rl-resume').onclick = () => { S.state = 'run'; S.lastT = Date.now(); S.lastMove = Date.now(); running(); Voice.say('Retomando'); };
      $t('#rl-trash').onclick = async () => { if (await confirmDialog('Descartar corrida?', 'O percurso gravado não será salvo.', 'Descartar', true)) { clearSaved(); el._cleanup(); Nav.back(); } };
      const fb = $t('#rl-finish'), fill = $('.fill', fb); let ha;
      fb.addEventListener('pointerdown', () => { ha = A(fill, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: Motion.reduced ? 1 : 800, easing: 'linear' }); ha.finished.then(() => { if (!ha._c) done(); }).catch(() => {}); });
      const up = () => { if (ha && ha.playState === 'running') { ha._c = true; ha.cancel(); toast('Segure para finalizar', 'stop'); } }; fb.addEventListener('pointerup', up); fb.addEventListener('pointerleave', up); fb.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); done(); } }); };
    const start = async () => {
      if (resume) { Object.assign(S, saved, { state: 'pause', last: null }); resume = false; if (line && S.pts.length) { line.setLatLngs(S.pts); try { map.fitBounds(line.getBounds(), { padding: [40, 40] }); } catch (e) {} } upd(); lock = await keepAwake(); paused(); toast('Corrida retomada — toque em continuar', 'play'); return; }
      Voice.say(' '); const cn = document.createElement('div'); cn.className = 'rl-count'; cn.innerHTML = `<b class="num">3</b>`; el.appendChild(cn);
      for (const n of [3, 2, 1]) { $('b', cn).textContent = n; beep(660, .12); haptic(10); A($('b', cn), [{ transform: 'scale(1.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 500, easing: 'out' }); await wait(Motion.reduced ? 200 : 900); }
      beep(990, .3); cn.remove(); lock = await keepAwake(); S.state = 'run'; S.startedAt = Date.now(); S.lastT = Date.now(); S.lastMove = Date.now();
      Voice.say(S.mode === 'int' ? 'Intervalado iniciado. Tiro 1, acelera!' : 'Corrida iniciada'); if (fix) { S.last = { c: fix, t: Date.now() }; S.pts.push(fix); } running(); persist(true); };
    const done = () => { if (S.dist < 50) { toast('Distância muito curta para salvar', 'x'); return; } S.state = 'done'; el._cleanup(); clearSaved();
      Nav.push('runSummary', { act: { sport: id, title: isRun ? runTitle(S.startedAt) : 'Pedal', startedAt: S.startedAt, duration: Math.round(S.moving), distance: Math.round(S.dist), route: downsample(S.pts, 700), splits: S.splits, elev: Math.round(S.elev), mode: S.mode, target: S.target || null } }); };
    $t('#rl-prim').onclick = () => { prim = (prim + 1) % 3; haptic(5); upd(); A($t('#rl-pv'), [{ transform: 'translateY(10px)', opacity: .2 }, { transform: 'none', opacity: 1 }], { spring: [300, 22] }); };
    $t('#rl-set').onclick = () => { const pr = runPrefs(); Sheet.open(`<h3 class="h2">Ajustes da corrida</h3><div class="stack" style="gap:8px;margin-top:14px">
      <div class="toggle-row"><span><span class="h3" style="display:block">Voz em português</span><span class="muted small">Avisos a cada km, metas e tiros</span></span><button class="switch" role="switch" aria-checked="${pr.voice}" data-rp="voice" aria-label="Voz"></button></div>
      <div class="toggle-row"><span><span class="h3" style="display:block">Pausa automática</span><span class="muted small">Pausa quando você para por 10 s</span></span><button class="switch" role="switch" aria-checked="${pr.auto}" data-rp="auto" aria-label="Pausa automática"></button></div></div>
      ${S.state === 'wait' && !resume ? `<button class="btn btn-ghost btn-block" style="margin-top:14px" data-rmode>${icon('flag', 16)}Mudar a meta</button>` : ''}`,
      (w, close) => w.addEventListener('click', e => { const s = e.target.closest('[data-rp]'); if (s) { const v = s.getAttribute('aria-checked') !== 'true'; s.setAttribute('aria-checked', v); setRunPrefs({ [s.dataset.rp]: v }); if (s.dataset.rp === 'voice' && v) Voice.say('Voz ligada'); }
        if (e.target.closest('[data-rmode]')) { close(); customRunSheet(() => { Object.assign(S, { mode: runPick.mode, target: runPick.target, plan: runPick.mode === 'int' ? intervalPlan(runPick) : null }); waitUI(); targetUI(); }); } }), { label: 'Ajustes' }); };
    $t('#rl-close').onclick = async () => { if (S.state === 'wait') { el._cleanup(); return Nav.back(); } if (S.dist < 10) { if (await confirmDialog('Sair da corrida?', 'Ainda não há percurso gravado.', 'Sair', true)) { clearSaved(); el._cleanup(); Nav.back(); } return; }
      if (S.state === 'run' || S.state === 'auto') paused(); toast('Pause e segure o quadrado para finalizar, ou descarte', 'stop'); };
    waitUI(); upd();
  },
  unmount(el) { el._cleanup && el._cleanup(); },
};
const runTitle = t => { const h = new Date(t || Date.now()).getHours(); return h < 5 ? 'Corrida da madrugada' : h < 12 ? 'Corrida da manhã' : h < 18 ? 'Corrida da tarde' : 'Corrida da noite'; };

/* ============================================================
   Resumo da corrida (novo) e detalhe (salva)
   ============================================================ */
function runMap(box, route, color) {
  if (!box || !route || route.length < 2) return null;
  if (!window.L) { box.innerHTML = routeSVG(route, { color }); return null; }
  try { const m = L.map(box, { zoomControl: false, attributionControl: true, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false, tap: false });
    m.attributionControl.setPrefix(''); L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '© OpenStreetMap © CARTO' }).addTo(m);
    const pl = L.polyline(route, { color, weight: 5, opacity: 1, lineCap: 'round' }).addTo(m);
    L.circleMarker(route[0], { radius: 6, color: '#0B0B0B', weight: 3, fillColor: '#fff', fillOpacity: 1 }).addTo(m); L.circleMarker(route[route.length - 1], { radius: 6, color: '#0B0B0B', weight: 3, fillColor: color, fillOpacity: 1 }).addTo(m);
    const fit = () => { try { m.invalidateSize(); m.fitBounds(pl.getBounds(), { padding: [28, 28] }); } catch (e) {} }; fit(); setTimeout(fit, 350); return m; } catch (e) { box.innerHTML = routeSVG(route, { color }); return null; }
}
function splitsHTML(a) {
  const sp = a.splits || []; const isRun = a.sport === 'corrida'; if (!sp.length) return '';
  const rest = (a.distance || 0) - sp.length * 1000; const restT = Math.max(0, (a.duration || 0) - sp.reduce((x, y) => x + y, 0));
  const rows = sp.map((s, i) => ({ k: `${i + 1}`, s, pace: s })); if (rest >= 100 && restT > 0) rows.push({ k: fmt(sp.length + rest / 1000, 2), s: restT, pace: restT / (rest / 1000), part: true });
  const best = Math.min(...rows.map(r => r.pace)), worst = Math.max(...rows.map(r => r.pace));
  return `<div class="rx-splits"><div class="rx-sh"><span>km</span><span>${isRun ? 'pace' : 'tempo'}</span><span></span></div>${rows.map(r => { const w = worst === best ? 1 : .35 + .65 * (worst - r.pace) / (worst - best);
    return `<div class="rx-split ${r.pace === best && rows.length > 1 ? 'best' : ''}"><span>${r.k}</span><b class="num">${isRun ? paceStr(r.pace / 60) : hms(r.s)}</b><i><em style="width:${w * 100}%"></em></i></div>`; }).join('')}</div>`;
}
function runBody(a, editable) {
  const isRun = a.sport === 'corrida'; const prs = prsIn(a); const effs = isRun ? EFFORTS.map(([k, l]) => [l, effortOf(a, k)]).filter(x => x[1] && (a.splits || []).length >= 1) : [];
  const sh = shoes().filter(s => !s.retired || s.id === a.shoeId); const cur = a.shoeId === undefined ? (defaultShoe() || {}).id : a.shoeId;
  const stat = (v, l) => `<div><b class="num">${v}</b><span>${l}</span></div>`;
  return `<div class="rx-sum-map" id="rs-map"></div>
    <div class="pad page" style="max-width:760px;position:relative">
      <div class="rx-k" style="margin-top:18px">${new Date(a.startedAt).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} · ${new Date(a.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
      ${editable ? `<input class="rx-title" id="rs-title" value="${esc(a.title || runTitle(a.startedAt))}" maxlength="60" aria-label="Título">` : `<h1 class="display" style="font-size:30px;margin:6px 0 0">${esc(a.title || 'Corrida')}</h1>`}
      ${prs.length ? `<div class="rx-prs">${prs.map(p => `<span>${icon('medal', 13, 2.4)}${p.l}${p.t ? ' · ' + hms(p.t) : ''}</span>`).join('')}</div>` : ''}
      <div class="rx-stats">${stat(km2(a.distance), 'km')}${stat(hms(a.duration), 'tempo')}${stat(isRun ? paceOf(a.duration, a.distance) : fmt(a.distance / a.duration * 3.6, 1), isRun ? 'pace /km' : 'km/h')}${stat(a.elev != null ? Math.round(a.elev) + ' m' : '—', 'subida')}</div>
      ${a.mode && a.mode !== 'free' ? `<div class="rx-modebadge">${icon('flag', 14)}${a.mode === 'dist' ? `Meta de ${fmt(a.target, a.target % 1 ? 1 : 0)} km ${a.distance >= a.target * 1000 ? 'concluída' : 'não alcançada'}` : a.mode === 'time' ? `Meta de ${a.target} min ${a.duration >= a.target * 60 ? 'concluída' : 'não alcançada'}` : 'Treino intervalado'}</div>` : ''}
      ${(a.splits || []).length ? `<div class="wsec"><h2>Parciais</h2><span class="muted small">${isRun ? 'pace por km' : 'tempo por km'}</span></div>${splitsHTML(a)}` : ''}
      ${effs.length ? `<div class="wsec"><h2>Melhores trechos</h2></div><div class="rx-effs">${effs.map(([l, t]) => `<div><span>${l}</span><b class="num">${hms(t)}</b></div>`).join('')}</div>` : ''}
      ${isRun ? `<div class="wsec"><h2>Tênis</h2><button class="link" data-shoes2>Gerenciar</button></div>${sh.length ? `<div class="row" style="gap:8px;flex-wrap:wrap">${sh.map(s => `<button class="chip ${cur === s.id ? 'on' : ''}" data-shoe="${s.id}" ${editable ? '' : 'disabled'}>${esc(s.name)}</button>`).join('')}${editable ? `<button class="chip ${!cur ? 'on' : ''}" data-shoe="">Nenhum</button>` : ''}</div>` : `<button class="rx-glass rx-addshoe press" data-shoes2>${icon('plus', 18)}<span>Cadastrar tênis</span></button>`}` : ''}
      ${editable ? `<div class="wsec"><h2>Como foi?</h2></div><div class="fx-rpe" style="margin:0 0 6px"><b class="num" id="rpe-v">5</b><span id="rpe-z">Moderado</span></div><input type="range" min="0" max="10" step="1" value="5" class="fx-range" id="rpe" aria-label="Esforço de 0 a 10"><div class="fx-zones"><span>Leve</span><span>Moderado</span><span>Intenso</span><span>Máximo</span></div>
        <div class="field" style="margin-top:16px"><label for="rs-txt">Legenda / anotações</label><textarea class="input" id="rs-txt" rows="2" maxlength="600" placeholder="Como foi a corrida?"></textarea></div>`
        : `${a.difficulty != null ? `<div class="wsec"><h2>Esforço</h2></div><div class="fx-rpe" style="margin:0"><b class="num">${a.difficulty}</b><span>de 10</span></div>` : ''}${a.notes ? `<div class="fx-quote">“${esc(a.notes)}”</div>` : ''}`}
      <div style="height:170px"></div></div>`;
}
const ZN = [[0, 'Leve', '#A3FF12'], [4, 'Moderado', '#FFC23D'], [7, 'Intenso', '#FF7426'], [9, 'Máximo', '#E3192B']];
Screens.runSummary = {
  noSwipe: true,
  render({ act }) { setAccent(act.sport);
    return `<div class="topbar" style="z-index:600"><span style="width:46px"></span><div class="title">Resumo</div><span style="width:46px"></span></div>
    <div class="scroll rx-scope"><canvas id="rs-conf" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5"></canvas>${runBody(act, true)}</div>
    <div class="wcta fx-ctas" style="flex-direction:column;gap:6px"><div class="row" style="gap:10px;width:100%"><button class="icon-btn fx-sq" id="rs-photo" aria-label="Adicionar foto">${icon('camera', 19)}</button><button class="btn rx-cta" style="flex:1" id="rs-post">${icon('share', 18)}Salvar e publicar</button></div><div class="rs-sec"><button class="btn btn-ghost btn-sm" id="rs-save">Salvar sem publicar</button><button class="btn btn-ghost btn-sm" style="color:#FF6B76" id="rs-discard">Descartar</button></div></div>`; },
  mount(el, { act }) {
    const color = act.sport === 'corrida' ? RUN_C : SPORTS[act.sport].c; runMap($('#rs-map', el), act.route, color); haptic([20, 60, 20]);
    const prs = prsIn(act); setTimeout(() => confetti($('#rs-conf', el), prs.length ? 90 : 36), 300);
    if (prs.length) { Voice.say(`Novo recorde: ${prs[0].l}!`); }
    let shoeId = act.sport === 'corrida' ? ((defaultShoe() || {}).id || null) : null; let diff = 5; let img = null;
    const r = $('#rpe', el); if (r) { const upd = () => { diff = +r.value; const z = ZN.filter(x => diff >= x[0]).pop(); $('#rpe-v', el).textContent = diff; $('#rpe-v', el).style.color = z[2]; $('#rpe-z', el).textContent = z[1]; }; r.oninput = () => { upd(); haptic(3); }; upd(); }
    el.addEventListener('click', e => { const s = e.target.closest('[data-shoe]'); if (s) { shoeId = s.dataset.shoe || null; $$('[data-shoe]', el).forEach(x => x.classList.toggle('on', x === s)); }
      if (e.target.closest('[data-shoes2]')) shoesSheet(() => { const box = $('.rx-scope', el); const y = box.scrollTop; const t = $('#rs-title', el).value, n = $('#rs-txt', el).value; box.innerHTML = `<canvas id="rs-conf" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5"></canvas>` + runBody({ ...act, shoeId: shoeId === null ? undefined : shoeId }, true); runMap($('#rs-map', el), act.route, color); $('#rs-title', el).value = t; $('#rs-txt', el).value = n; box.scrollTop = y; const r2 = $('#rpe', el); r2.value = diff; r2.oninput = () => { diff = +r2.value; const z = ZN.filter(x => diff >= x[0]).pop(); $('#rpe-v', el).textContent = diff; $('#rpe-v', el).style.color = z[2]; $('#rpe-z', el).textContent = z[1]; }; r2.oninput(); shoeId = shoeId || (defaultShoe() || {}).id || null; }); });
    $('#rs-photo', el).onclick = async () => { const d = await chooseImage(1280, .74); if (d) { img = d; toast('Foto adicionada ao post', 'camera'); $('#rs-photo', el).classList.add('on'); } };
    const save = async publish => { const btns = $$('#rs-post,#rs-save', el); btns.forEach(b => b.disabled = true);
      try { const notes = $('#rs-txt', el).value.trim(); const a = await API.addActivity({ ...act, title: $('#rs-title', el).value.trim() || act.title, difficulty: diff, notes: notes || null, shoeId: shoeId || null, prCount: prs.length });
        if (publish) { const hide = API.me.privacy && API.me.privacy.hideRouteEnds; await API.createPost({ sport: a.sport, text: notes, image: img, activity: { id: a.id, title: a.title, stats: publicStats(a), route: a.route ? downsample(hide ? trimRoute(a.route) : a.route, 160) : null, pr: prs.length > 0 } }); }
        toast(publish ? 'Corrida salva e publicada' : 'Corrida salva'); Nav.go('home'); setTimeout(() => Nav.push('runDetail', { id: a.id }), 420);
      } catch (x) { btns.forEach(b => b.disabled = false); toast(errMsg(x), 'x'); } };
    $('#rs-post', el).onclick = () => save(true); $('#rs-save', el).onclick = () => save(false);
    $('#rs-discard', el).onclick = async () => { if (await confirmDialog('Descartar corrida?', 'Nada será salvo.', 'Descartar', true)) Nav.go('home'); };
  },
};
Screens.runDetail = {
  render({ id }) { const a = API.acts.find(x => x.id === id); if (!a) return `<div class="topbar"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button></div><div class="pad" style="padding-top:110px">${emptyBox('Corrida não encontrada.')}</div>`; setAccent(a.sport);
    return `<div class="topbar" style="z-index:600"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">${esc(a.title || 'Corrida')}</div><button class="icon-btn glass" data-rmore aria-label="Excluir corrida">${icon('trash', 18)}</button></div>
    <div class="scroll rx-scope">${runBody(a, false)}</div>
    <div class="wcta fx-ctas"><button class="btn rx-cta" style="flex:1" data-rpub>${icon('share', 18)}Publicar na comunidade</button></div>`; },
  mount(el, { id }) { const a = API.acts.find(x => x.id === id); if (!a) return; runMap($('#rs-map', el), a.route, a.sport === 'corrida' ? RUN_C : SPORTS[a.sport].c); bindScrollFx(el, { bar: $('.topbar', el), threshold: 200 });
    $('[data-rpub]', el).onclick = () => composePost({ sport: a.sport, activity: a });
    $('[data-rmore]', el).onclick = async () => { if (await confirmDialog('Excluir esta corrida?', 'Ela sai do histórico, das marcas, dos tênis e dos desafios. Não dá para desfazer.', 'Excluir', true)) { try { await API.removeActivity(a.id); toast('Corrida excluída', 'trash'); Nav.back(); } catch (x) { toast(errMsg(x), 'x'); } } };
    el.addEventListener('click', e => { if (e.target.closest('[data-shoes2]')) shoesSheet(); }); },
};
Screens.runHistory = {
  render() { setAccent('corrida'); const L = API.acts.filter(a => a.sport === 'corrida');
    const groups = L.reduce((m, a) => { const k = new Date(a.startedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); (m[k] = m[k] || []).push(a); return m; }, {});
    return `<div class="topbar solid"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Corridas</div><span style="width:46px"></span></div>
    <div class="scroll rx-scope"><div class="pad page" style="padding-top:calc(var(--safe-top) + 74px);max-width:760px"><h1 class="display" style="font-size:32px;margin:0 0 6px">Suas corridas</h1><div class="muted small">${L.length} ${L.length === 1 ? 'corrida' : 'corridas'} · ${kmStr(L.reduce((s, a) => s + (a.distance || 0), 0))} km · ${hms(L.reduce((s, a) => s + (a.duration || 0), 0))}</div>
      ${L.length ? Object.entries(groups).map(([m, A2]) => `<div class="wsec" style="margin-top:22px"><h2>${m.charAt(0).toUpperCase() + m.slice(1)}</h2><span class="muted small">${kmStr(A2.reduce((s, a) => s + (a.distance || 0), 0))} km</span></div><div class="stack" style="gap:10px">${A2.map(a => `<button class="rx-hrow press" data-runopen2="${a.id}"><div class="rx-thumb">${a.route && a.route.length > 1 ? routeSVG(a.route, { color: RUN_C, pad: 8 }) : icon('run', 20)}</div><div style="flex:1;min-width:0;text-align:left"><div class="h3" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(a.title || 'Corrida')}${a.prCount ? ` <span style="color:${RUN_C}">${icon('medal', 13, 2.4)}</span>` : ''}</div><div class="muted small" style="margin-top:3px">${shortDate(a.startedAt)} · ${hms(a.duration)} · ${paceOf(a.duration, a.distance)}/km</div></div><b class="num" style="font-size:18px">${km2(a.distance)}<small class="muted" style="font-size:11px"> km</small></b></button>`).join('')}</div>`).join('')
        : `<div style="margin-top:20px">${emptyBox('Nenhuma corrida ainda.')}</div>`}<div style="height:40px"></div></div></div>`; },
  mount(el) { el.addEventListener('click', e => { const b = e.target.closest('[data-runopen2]'); if (b) Nav.push('runDetail', { id: b.dataset.runopen2 }); }); },
  onReturn(el) { el.innerHTML = Screens.runHistory.render(); Screens.runHistory.mount(el); },
};
/* corridas abrem no detalhe novo */
const _actSheetRun = activitySheet;
activitySheet = a => a && a.sport === 'corrida' ? Nav.push('runDetail', { id: a.id }) : _actSheetRun(a);
