/* ============================================================
   ORA GYM — Academia (musculação): check-in e sequência, agenda
   semanal de fichas, modo treino com séries/descanso/cronômetro,
   cardio opcional, avaliação do treino e resumo comparativo.
   ============================================================ */
const WD = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const WD3 = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WD1 = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const CARDIOS = ['Esteira', 'Bicicleta', 'Elíptico', 'Escada', 'Remo', 'Corda'];
const isLift = a => a && a.sport === 'musculacao';
const ddmm = t => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const kgs = v => fmt(v || 0, (v || 0) % 1 ? 1 : 0);
const secStr = s => s >= 60 ? (s % 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s / 60} min`) : `${s} s`;
const noon = d => { const x = new Date(d); x.setHours(12, 0, 0, 0); return x; };

/* ---------- histórico por exercício ---------- */
function lastFor(exn, beforeTs = Infinity) {
  for (const a of API.acts) { if (!isLift(a) || a.startedAt >= beforeTs) continue; const s = (a.sets || []).filter(x => x.ex === exn); if (s.length) return { at: a.startedAt, sets: s }; }
  return null;
}
function lastSetsFor(exn) { const l = lastFor(exn); return l ? l.sets : null; }
const setTxt = s => s.sec != null && s.reps == null ? secStr(s.sec) : `${s.kg ? kgs(s.kg) + ' kg × ' : ''}${s.reps}`;

/* ---------- presença, check-in e sequência ---------- */
function presence() { const s = new Set((API.me && API.me.checkins) || []); API.acts.forEach(a => { if (isLift(a)) s.add(dayKey(new Date(a.startedAt))); }); return s; }
function schedule() { const s = new Set(); API.workouts.forEach(w => (w.days || []).forEach(d => s.add(d))); return s; }
function streakInfo() {
  const P = presence(), sched = schedule(); const today = noon(new Date());
  const breaks = (d, gap) => sched.size ? sched.has(d.getDay()) : gap > 1;
  let cur = 0, gap = 0; const d = new Date(today); if (!P.has(dayKey(d))) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 800; i++) { if (P.has(dayKey(d))) { cur++; gap = 0; } else if (breaks(d, ++gap)) break; d.setDate(d.getDate() - 1); }
  let best = cur; const keys = [...P].sort(); if (keys.length) { const s = noon(new Date(keys[0] + 'T12:00')); let run = 0; gap = 0;
    for (const x = new Date(s); x <= today; x.setDate(x.getDate() + 1)) { if (P.has(dayKey(x))) { run++; gap = 0; if (run > best) best = run; } else if (breaks(x, ++gap)) run = 0; } }
  return { cur, best, today: P.has(dayKey(today)), P, sched };
}
function streakLine(si) {
  if (!si.best) return 'Segure o botão quando chegar na academia para começar sua sequência.';
  if (si.cur >= si.best) return si.cur === 1 ? 'Dia 1 da sequência. Amanhã tem mais.' : `${si.cur} dias seguidos — é o seu recorde.`;
  const f = si.best - si.cur + 1; return `${si.cur ? si.cur + ' dias seguidos. ' : ''}Mais ${f} ${f === 1 ? 'dia' : 'dias'} e você passa o recorde de ${si.best}.`;
}
async function checkIn(silent) {
  const k = dayKey(); const L = new Set((API.me.checkins) || []); if (L.has(k)) return false; L.add(k);
  await API.updateProfile({ checkins: [...L].sort().slice(-500) }); if (!silent) { haptic([10, 40, 14]); toast('Check-in de hoje feito'); } return true;
}
function monthInfo(si) {
  const n = new Date(); const pre = dayKey(n).slice(0, 7); const cnt = [...si.P].filter(k => k.startsWith(pre)).length;
  const dim = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate(); const wk = si.sched.size || Stats.sport(API.acts, 'musculacao', API.me).goal.target || 4;
  return { cnt, goal: API.me.liftMonthGoal || Math.round(wk * dim / 7) };
}

/* ---------- agenda: treino de hoje ---------- */
function todayWorkout() {
  const wd = new Date().getDay(); const t = API.workouts.find(w => (w.days || []).includes(wd)); if (t) return { w: t, today: true };
  const n = nextWorkout(); return n ? { w: n, today: false } : null;
}
function dayLabel(w) {
  const d = w.days || []; if (!d.length) return ''; const wd = new Date().getDay(); if (d.includes(wd)) return 'Hoje';
  return d.slice().sort((a, b) => ((a - wd + 7) % 7) - ((b - wd + 7) % 7)).map(x => WD[x]).join(', ');
}

/* ---------- sessão em andamento (sobrevive a fechar o app) ---------- */
const Sess = {
  key: () => 'lift.' + (API.me ? API.me.id : 'anon'),
  get() { return Store.get()[this.key()] || null; },
  set(s) { Store.set({ [this.key()]: s }); },
  clear() { Store.set({ [this.key()]: null }); },
};
function mkEx(x) {
  const type = x.type || 'reps'; const last = lastFor(x.n); const n = Math.max(1, x.sets || 3);
  const sets = Array.from({ length: n }, (_, i) => { const p = last && (last.sets[i] || last.sets[last.sets.length - 1]);
    if (type === 'time') return { sec: (p && p.sec) || x.sec || 60, t: 0, done: false };
    return { kg: p ? (p.kg || 0) : (x.kg || 0), reps: p ? (p.reps || x.reps || 10) : (x.reps || 10), done: false }; });
  return { n: x.n, type, group: EX_GROUP[x.n] || x.group || '', rest: x.rest == null ? 60 : x.rest, sets };
}
function newSession(w) {
  return { wid: w ? w.id : null, name: w ? w.name : 'Treino livre', focus: w ? (w.focus || '') : '', startedAt: Date.now(), pausedTotal: 0, pausedAt: null, cur: 0,
    ex: (w ? w.exercises : []).map(mkEx), cardio: w && w.cardio && w.cardio.name ? { name: w.cardio.name, min: w.cardio.min || 20, mode: null, doneMin: 0 } : null, restEnd: 0, restTotal: 0, cron: null };
}
const sElapsed = s => Math.max(0, ((s.pausedAt || Date.now()) - s.startedAt - (s.pausedTotal || 0)) / 1000);
const exDone = e => e.sets.every(x => x.done);
const doneCount = s => s.ex.filter(exDone).length;
const estMin = (s, all) => Math.round(s.ex.reduce((m, e) => m + e.sets.filter(x => all || !x.done).reduce((a, x) => a + (e.type === 'reps' ? (x.reps || 10) * 4 : (x.sec || 60)) + (e.rest || 0), 0), 0) / 60 + (s.cardio && s.cardio.mode === 'with' && !s.cardio.doneMin ? s.cardio.min : 0));
const planMin = w => estMin({ ex: w.exercises.map(x => ({ type: x.type || 'reps', rest: x.rest == null ? 60 : x.rest, sets: Array.from({ length: x.sets || 3 }, () => ({ reps: x.reps, sec: x.sec, done: false })) })), cardio: null }, true);
const firstPending = s => { const i = s.ex.findIndex((e, k) => k >= s.cur && !exDone(e)); return i >= 0 ? i : s.ex.findIndex(e => !exDone(e)); };
const exLine = x => x.type === 'time' ? `${x.sets} × ${secStr(x.sec || 60)}${x.rest ? ' · ' + x.rest + 's' : ''}` : x.type === 'cardio' ? `${x.sets[0] ? secStr(x.sets[0].sec) : ''}` : `${x.sets} × ${x.reps}${x.kg ? ' · ' + kgs(x.kg) + ' kg' : ''} · ${x.rest == null ? 60 : x.rest}s`;
const sExLine = e => e.type === 'time' ? `${e.sets.length} × ${secStr(e.sets[0].sec)} · ${e.rest}s` : e.type === 'cardio' ? `Meta ${secStr(e.sets[0].sec)}` : `${e.sets.length} × ${e.sets[0].reps}${e.sets[0].kg ? ' · ' + kgs(e.sets[0].kg) + ' kg' : ''} · ${e.rest}s`;

async function startSession(w) {
  const cur = Sess.get();
  if (cur && cur.wid !== (w ? w.id : null)) { if (!(await confirmDialog('Trocar de treino?', `Você tem “${cur.name}” em andamento. Ele será descartado.`, 'Descartar e começar', true))) return null; }
  if (cur && cur.wid === (w ? w.id : null)) return cur;
  const s = newSession(w); Sess.set(s);
  let ck = false; try { ck = await checkIn(true); } catch (e) {}
  toast(ck ? 'Treino iniciado. Check-in de hoje feito.' : 'Treino iniciado', 'bolt'); haptic([10, 40, 10]); return s;
}

/* ============================================================
   Espaço da musculação — visual OraGym: foto cinematográfica,
   vidro, tipografia grande; check-in segurando o botão
   ============================================================ */
function rhythm(si) {
  const t = noon(new Date()); const mon = new Date(t); mon.setDate(t.getDate() - ((t.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  const done = days.filter(d => si.P.has(dayKey(d))).length; const goal = si.sched.size || (Stats.sport(API.acts, 'musculacao', API.me).goal.target) || 4;
  const caps = days.map(d => { const k = dayKey(d); const on = si.P.has(k), isT = k === dayKey(t), fut = d > t, pl = si.sched.has(d.getDay());
    return `<div class="fx-cap ${on ? 'on' : ''} ${isT ? 'today' : ''} ${fut ? 'fut' : ''} ${pl && !on ? 'plan' : ''}" title="${WD[d.getDay()]} ${d.getDate()}"><i></i><span>${WD3[d.getDay()]}</span><b>${d.getDate()}</b></div>`; }).join('');
  const start = new Date(mon); start.setDate(mon.getDate() - 7 * 11);
  const heat = Array.from({ length: 12 }, (_, w) => `<div class="fx-hcol">${Array.from({ length: 7 }, (_, d) => { const x = new Date(start); x.setDate(start.getDate() + w * 7 + d); const k = dayKey(x); return `<i class="${si.P.has(k) ? 'on' : ''} ${x > t ? 'fut' : ''}"></i>`; }).join('')}</div>`).join('');
  const weeks = Array.from({ length: 12 }, (_, w) => { let n = 0; for (let d = 0; d < 7; d++) { const x = new Date(start); x.setDate(start.getDate() + w * 7 + d); if (si.P.has(dayKey(x))) n++; } return n; });
  const avg = weeks.slice(0, 11).reduce((a, b) => a + b, 0) / 11;
  return { done, goal, html: `<div class="fx-caps">${caps}</div><div class="fx-heatwrap"><div class="fx-heat">${heat}</div><div class="fx-heatlbl"><b>${fmt(avg, 1)}</b><span>dias/semana<br>nas últimas 11</span></div></div>` };
}
const holdRing = (on) => `<svg class="fx-hold-svg" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" class="t"/><circle cx="50" cy="50" r="46" class="f" style="stroke-dashoffset:${on ? 0 : 289}"/></svg>`;
WORLD.musculacao = (sp, S) => {
  const si = streakInfo(); const rh = rhythm(si); const mi = monthInfo(si); const tw = todayWorkout(); const ss = Sess.get();
  const dt = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const twIdx = tw ? Math.max(0, API.workouts.indexOf(tw.w)) : 0;
  return `<div class="fx-hero"><div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('musculacao', 'musculacao', { eager: true, fade: 'background:linear-gradient(180deg,rgba(11,11,11,.5) 0%,transparent 30%,rgba(11,11,11,.35) 55%,#0B0B0B 96%)' })}</div><div class="fx-tint"></div>
    <div class="fx-hero-in">
      <div class="fx-kick" data-e="1"><span class="fx-live"></span>${dt}</div>
      <h1 class="w-title fx-h1">${si.today ? 'Presença' : 'Hora de'}</h1><h1 class="w-title fx-h1 dim">${si.today ? 'confirmada.' : 'evoluir, ' + esc(firstName()) + '.'}</h1>
      <p class="fx-lead" data-e="2">${streakLine(si)}</p>
      <div class="fx-herorow" data-e="3">
        <div class="fx-ribbon"><button data-streak><b class="num">${si.cur}</b><span>sequência</span></button><button data-streak><b class="num">${si.best}</b><span>recorde</span></button><button data-month><b class="num">${mi.cnt}<small>/${mi.goal}</small></b><span>no mês</span><em style="--p:${Math.min(1, mi.cnt / Math.max(1, mi.goal))}"></em></button></div>
        <button class="fx-hold ${si.today ? 'done' : ''}" data-hold-checkin aria-label="${si.today ? 'Check-in de hoje feito' : 'Segure para fazer o check-in de hoje'}">${holdRing(si.today)}<span class="fx-hold-in">${icon(si.today ? 'check' : 'pin', 24, 2.2)}</span><span class="fx-hold-lbl">${si.today ? 'Check-in<br>feito' : 'Segure<br>p/ check-in'}</span></button>
      </div></div></div>
  <div class="pad"><div class="wgrid">
   <div>
    ${ss ? `<button class="fx-live-card press" data-push="workout" data-params='${JSON.stringify({ wid: ss.wid, live: 1 })}' data-e="4"><span class="fx-pulse"></span><div style="flex:1;min-width:0;text-align:left"><div class="fx-k">Em andamento · ${hms(sElapsed(ss))}</div><div class="h3" style="margin-top:3px">${esc(ss.name)}${ss.focus ? ' · ' + esc(ss.focus) : ''}</div></div><div class="fx-seg sm">${ss.ex.map(e => `<i class="${exDone(e) ? 'on' : ''}"></i>`).join('')}</div>${icon('next', 18)}</button>` : ''}
    ${tw ? `<button class="fx-today press" data-push="workout" data-params='${JSON.stringify({ wid: tw.w.id })}' data-e="4"><div class="fx-today-bg">${scene('tw' + twIdx, 'musculacao', { i: twIdx + 1, fade: 'background:linear-gradient(90deg,rgba(11,11,11,.92),rgba(11,11,11,.55) 60%,rgba(11,11,11,.2))' })}</div><span class="fx-letter">${esc(letterOf(tw.w))}</span>
        <div class="fx-today-in"><div class="fx-k">${tw.today ? 'Treino de hoje' : 'Próximo da fila'}</div><div class="fx-t2">${esc(tw.w.name)}</div><div class="fx-focus">${esc(tw.w.focus || '')}</div>
          <div class="fx-chips">${tw.w.exercises.slice(0, 3).map(x => `<span>${esc(x.n)}</span>`).join('')}${tw.w.exercises.length > 3 ? `<span>+${tw.w.exercises.length - 3}</span>` : ''}</div>
          <div class="fx-meta">${icon('dumbbell', 14)}${tw.w.exercises.length} exercícios<i></i>${icon('clock', 14)}~${planMin(tw.w)} min${tw.w.cardio && tw.w.cardio.name ? `<i></i>${icon('heart', 14)}${esc(tw.w.cardio.name)}` : ''}</div></div>
        <span class="fx-playbtn">${icon('play', 22)}</span></button>`
      : `<div class="fx-glass fx-empty" data-e="4"><span class="fx-letter sm">A</span><div class="h2" style="font-size:20px">Monte sua divisão</div><p class="fx-m" style="margin:6px 0 16px;line-height:1.5">Crie fichas como A, B e C e escolha os dias de cada uma. O OraGym sugere o treino do dia.</p><button class="btn btn-white btn-sm" data-new-ficha>${icon('plus', 16)}Criar primeira ficha</button></div>`}
    <div class="fx-glass" data-e="5"><div class="between"><div><div class="fx-k">Seu ritmo</div><div class="h3" style="margin-top:4px">${rh.done} de ${rh.goal} dias nesta semana</div></div><button class="icon-btn glass" style="width:38px;height:38px" data-streak aria-label="Como a sequência funciona">${icon('info', 17)}</button></div>${rh.html}</div>
   </div>
   <div>
    <div class="wsec" data-e="6"><h2>Sua divisão</h2><button class="link" data-new-ficha>+ Nova ficha</button></div>
    <div class="hscroll fx-split" data-e="7">${API.workouts.map((w, i) => { const dl = dayLabel(w); return `<button class="fx-ficha press ${dl === 'Hoje' ? 'today' : ''}" data-push="workout" data-params='${JSON.stringify({ wid: w.id })}'><span class="fx-letter">${esc(letterOf(w))}</span><div class="fx-ficha-in"><div class="h3">${esc(w.name)}</div><div class="fx-m">${esc(w.focus || `${w.exercises.length} exercícios`)}</div><div class="fx-days">${[1, 2, 3, 4, 5, 6, 0].map(d => `<i class="${(w.days || []).includes(d) ? 'on' : ''} ${d === new Date().getDay() ? 'now' : ''}">${WD1[d]}</i>`).join('')}</div></div></button>`; }).join('')}
      <button class="fx-ficha add press" data-new-ficha>${icon('plus', 26, 1.8)}<span>Nova ficha</span></button></div>
    <div class="grid2" style="gap:12px;margin-top:14px" data-e="8">
      <button class="fx-glass fx-tile press" data-push="liftHistory"><span class="fx-ic">${icon('clock', 19)}</span><b>Histórico</b><span class="fx-m">${S.count} ${S.count === 1 ? 'treino' : 'treinos'}</span></button>
      <button class="fx-glass fx-tile press" data-push="nutrition"><span class="fx-ic">${icon('leaf', 19)}</span><b>Dieta</b><span class="fx-m">Refeições e água</span></button></div>
    <div class="wsec"><h2>Evolução do volume</h2></div>${chartCard('fx-glass')}
    <div class="wsec"><h2>Recordes</h2></div>${recList(S, 'fx-glass fx-recrow')}
   </div></div></div>`;
};
const letterOf = w => { const m = (w.name || '').match(/\b([A-Z])\b/); return m ? m[1] : ((w.name || '?').trim()[0] || '?').toUpperCase(); };
WCTA.musculacao = () => { const ss = Sess.get(); if (ss) return `<button class="btn fx-cta" data-push="workout" data-params='${JSON.stringify({ wid: ss.wid, live: 1 })}'>${icon('play', 18)}Continuar treino</button>`;
  const tw = todayWorkout(); return tw ? `<button class="btn fx-cta" data-push="workout" data-params='${JSON.stringify({ wid: tw.w.id })}'>${icon('play', 18)}Começar ${esc(tw.w.name)}</button>` : `<button class="btn fx-cta" data-new-ficha>${icon('plus', 18)}Criar ficha</button>`; };

/* check-in segurando · sequência · meta do mês */
const fxRedraw = node => { const layer = node.closest('.layer, .tabpane'); const top = Nav.stack[Nav.stack.length - 1]; if (top && top.el === layer) { const s = Screens[top.id]; s.onReturn && s.onReturn(top.el, top.params); } else Nav.refresh(); };
async function doCheckin(btn) { try { if (await checkIn()) { btn.classList.add('done'); const c = $('.f', btn); c && (c.style.strokeDashoffset = 0); setTimeout(() => fxRedraw(btn), 650); } else toast('Você já fez o check-in hoje', 'check'); } catch (x) { toast(errMsg(x), 'x'); } }
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-hold-checkin]'); if (!b || b.classList.contains('done')) return; const f = $('.f', b); if (!f) return;
  b.classList.add('holding'); haptic(6); const an = A(f, [{ strokeDashoffset: 289 }, { strokeDashoffset: 0 }], { duration: Motion.reduced ? 1 : 750, easing: 'linear', fill: 'forwards' });
  const stop = () => { b.classList.remove('holding'); if (an.playState === 'running') { an._c = true; an.cancel(); } window.removeEventListener('pointerup', stop); window.removeEventListener('pointercancel', stop); };
  window.addEventListener('pointerup', stop); window.addEventListener('pointercancel', stop);
  an.finished.then(() => { if (!an._c) { b._held = Date.now(); stop(); doCheckin(b); } }).catch(() => {});
});
document.addEventListener('keydown', e => { const b = e.target.closest && e.target.closest('[data-hold-checkin]'); if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (!b.classList.contains('done')) doCheckin(b); } });
document.addEventListener('click', e => {
  const hb = e.target.closest('[data-hold-checkin]'); if (hb) { if (Date.now() - (hb._held || 0) < 2000) return; if (hb.classList.contains('done')) toast('Check-in de hoje já está feito', 'check'); else if (e.detail === 0) doCheckin(hb); else toast('Segure o botão para confirmar o check-in', 'pin'); return; }
  const scope = e.target.closest('.world.w-musculacao, #tr-body, .fx-scope'); if (!scope) return;
  if (e.target.closest('[data-streak]')) { const si = streakInfo();
    Sheet.open(`<div class="fx-k">Sequência</div><div class="row" style="gap:26px;margin-top:12px;align-items:flex-end"><div><div class="num" style="font-size:54px;line-height:1">${si.cur}</div><div class="muted small">dias agora</div></div><div><div class="num" style="font-size:54px;line-height:1;color:#E3192B">${si.best}</div><div class="muted small">seu recorde</div></div></div>
      <p class="muted small" style="line-height:1.6;margin-top:16px">Conta cada dia com check-in ou treino de musculação registrado. ${si.sched.size ? `Os dias sem ficha na sua agenda (${[1, 2, 3, 4, 5, 6, 0].filter(d => !si.sched.has(d)).map(d => WD3[d]).join(', ') || 'nenhum'}) são descanso e não quebram a sequência.` : 'Um dia de descanso entre treinos não quebra a sequência. Escolha os dias de cada ficha para usar a sua agenda.'}</p>`, null, { label: 'Sequência' }); return; }
  if (e.target.closest('[data-month]')) { const mi = monthInfo(streakInfo());
    Sheet.open(`<h3 class="h2">Meta de treinos no mês</h3><div class="field" style="margin-top:14px"><label for="mg">Treinos por mês</label><input class="input" id="mg" type="number" inputmode="numeric" min="1" max="31" value="${mi.goal}"></div><button class="btn btn-white btn-block" data-mg>Salvar</button>`,
      (sh, close) => $('[data-mg]', sh).onclick = async () => { const v = Math.round(+$('#mg', sh).value); if (!(v >= 1 && v <= 31)) return toast('Use um número de 1 a 31', 'x'); try { await API.updateProfile({ liftMonthGoal: v }); close(); fxRedraw(scope); } catch (x) { toast(errMsg(x), 'x'); } }, { label: 'Meta do mês' }); }
});

/* aba Treinar → musculação */
const _trainBody = trainBody;
trainBody = id => id !== 'musculacao' ? _trainBody(id) : (() => { const tw = todayWorkout(); const ss = Sess.get(); const si = streakInfo(); const twIdx = tw ? Math.max(0, API.workouts.indexOf(tw.w)) : 0;
  return `<div class="fx-scope" style="margin-top:18px">
    ${ss ? `<button class="fx-live-card press" data-push="workout" data-params='${JSON.stringify({ wid: ss.wid, live: 1 })}'><span class="fx-pulse"></span><div style="flex:1;min-width:0;text-align:left"><div class="fx-k">Em andamento · ${hms(sElapsed(ss))}</div><div class="h3" style="margin-top:3px">${esc(ss.name)}</div></div><div class="fx-seg sm">${ss.ex.map(e => `<i class="${exDone(e) ? 'on' : ''}"></i>`).join('')}</div>${icon('next', 18)}</button>` : ''}
    <div class="row" style="gap:12px;align-items:stretch">
      ${tw ? `<button class="fx-today press" style="flex:1;margin:0" data-push="workout" data-params='${JSON.stringify({ wid: tw.w.id })}'><div class="fx-today-bg">${scene('tw' + twIdx, 'musculacao', { i: twIdx + 1, sm: true, fade: 'background:linear-gradient(90deg,rgba(11,11,11,.92),rgba(11,11,11,.4))' })}</div><span class="fx-letter">${esc(letterOf(tw.w))}</span><div class="fx-today-in"><div class="fx-k">${tw.today ? 'Treino de hoje' : 'Próximo da fila'}</div><div class="fx-t2" style="font-size:24px">${esc(tw.w.name)}</div><div class="fx-focus">${esc(tw.w.focus || '')}</div><div class="fx-meta">${tw.w.exercises.length} exercícios<i></i>~${planMin(tw.w)} min</div></div><span class="fx-playbtn">${icon('play', 20)}</span></button>` : `<div class="fx-glass fx-empty" style="flex:1;margin:0"><div class="h3">Sem fichas ainda</div><button class="btn btn-white btn-sm" style="margin-top:12px" data-new-ficha>Criar ficha</button></div>`}
      <button class="fx-hold sm ${si.today ? 'done' : ''}" data-hold-checkin aria-label="${si.today ? 'Check-in de hoje feito' : 'Segure para fazer o check-in de hoje'}">${holdRing(si.today)}<span class="fx-hold-in">${icon(si.today ? 'check' : 'pin', 20, 2.2)}</span><span class="fx-hold-lbl">${si.today ? 'Feito' : 'Check-in'}</span></button></div>
    <div class="wsec"><h2>Sua divisão</h2><button class="link" data-new-ficha>+ Nova ficha</button></div>
    <div class="hscroll fx-split">${API.workouts.map(w => { const dl = dayLabel(w); return `<button class="fx-ficha press ${dl === 'Hoje' ? 'today' : ''}" data-push="workout" data-params='${JSON.stringify({ wid: w.id })}'><span class="fx-letter">${esc(letterOf(w))}</span><div class="fx-ficha-in"><div class="h3">${esc(w.name)}</div><div class="fx-m">${esc(w.focus || `${w.exercises.length} exercícios`)}</div><div class="fx-days">${[1, 2, 3, 4, 5, 6, 0].map(d => `<i class="${(w.days || []).includes(d) ? 'on' : ''} ${d === new Date().getDay() ? 'now' : ''}">${WD1[d]}</i>`).join('')}</div></div></button>`; }).join('')}<button class="fx-ficha add press" data-new-ficha>${icon('plus', 26, 1.8)}<span>Nova ficha</span></button></div>
    <div class="grid2" style="gap:12px;margin-top:14px"><button class="fx-glass fx-tile press" data-push="liftLive" data-params='{"free":1}'><span class="fx-ic">${icon('bolt', 19)}</span><b>Treino livre</b><span class="fx-m">Monte na hora</span></button><button class="fx-glass fx-tile press" data-push="liftHistory"><span class="fx-ic">${icon('clock', 19)}</span><b>Histórico</b><span class="fx-m">${SS('musculacao').count} treinos</span></button></div></div>`; })();
/* ============================================================
   Editor de ficha: dias da semana, exercícios (repetições ou tempo),
   ordem, descanso e cardio opcional
   ============================================================ */
function fichaEditor(w, done) {
  const D = w ? JSON.parse(JSON.stringify(w)) : { name: '', focus: '', days: [], exercises: [], cardio: null };
  D.days = D.days || []; D.exercises.forEach(x => { x.type = x.type || 'reps'; });
  const num = (i, k, l, step = 1, u = '') => `<label class="fe-n"><span>${l}</span><input class="input" type="number" inputmode="decimal" min="0" step="${step}" value="${D.exercises[i][k] == null ? '' : D.exercises[i][k]}" data-exf="${i}.${k}"${u ? ` aria-label="${l} (${u})"` : ''}></label>`;
  const exRow = (x, i) => `<div class="fe-ex" data-exi="${i}"><div class="row" style="gap:8px"><span class="fe-i">${i + 1}</span><div class="h3" style="flex:1;min-width:0;font-size:14.5px">${esc(x.n)}</div>
      <button class="fe-b" data-exup="${i}" aria-label="Subir" ${i ? '' : 'disabled'}>${icon('back', 15, 2.2, 'style="transform:rotate(90deg)"')}</button><button class="fe-b" data-exdn="${i}" aria-label="Descer" ${i < D.exercises.length - 1 ? '' : 'disabled'}>${icon('back', 15, 2.2, 'style="transform:rotate(-90deg)"')}</button><button class="fe-b" data-exdel="${i}" aria-label="Remover ${esc(x.n)}">${icon('x', 15, 2)}</button></div>
    <div class="row" style="gap:6px;margin:10px 0 8px"><button class="chip sm ${x.type !== 'time' ? 'on' : ''}" data-ext="${i}.reps">Repetições</button><button class="chip sm ${x.type === 'time' ? 'on' : ''}" data-ext="${i}.time">Tempo</button></div>
    <div class="fe-grid">${num(i, 'sets', 'Séries')}${x.type === 'time' ? num(i, 'sec', 'Tempo (s)', 5) : num(i, 'reps', 'Reps') + num(i, 'kg', 'Carga kg', .5)}${num(i, 'rest', 'Desc. (s)', 5)}</div></div>`;
  const body = () => `<h3 class="h2">${w ? 'Editar ficha' : 'Nova ficha'}</h3>
    ${!w ? `<div class="kicker" style="margin:16px 0 8px">Começar de um modelo</div><div class="row" style="gap:8px;flex-wrap:wrap">${WORKOUT_TEMPLATES.map((t, i) => `<button class="chip" data-tpl="${i}">${t.name} · ${t.focus}</button>`).join('')}</div>` : ''}
    <div class="grid2" style="margin-top:16px"><div class="field"><label for="fe-n">Nome</label><input class="input" id="fe-n" value="${esc(D.name)}" placeholder="Treino A" maxlength="40"></div><div class="field"><label for="fe-f">Foco</label><input class="input" id="fe-f" value="${esc(D.focus)}" placeholder="Peito & Tríceps" maxlength="40"></div></div>
    <div class="field"><label>Dias da semana</label><div class="fe-days">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button class="${D.days.includes(d) ? 'on' : ''}" data-day="${d}" aria-pressed="${D.days.includes(d)}">${WD3[d]}</button>`).join('')}</div></div>
    <div class="between" style="margin:4px 0 10px"><b>Exercícios</b><span class="muted small">${D.exercises.length} · ~${D.exercises.length ? planMin(D) : 0} min</span></div>
    <div class="stack" style="gap:8px">${D.exercises.map(exRow).join('') || '<p class="muted small">Nenhum exercício ainda.</p>'}</div>
    <button class="btn btn-ghost btn-block" style="margin-top:12px" data-fepick>${icon('plus', 18)}Adicionar exercícios</button>
    <div class="fe-ex" style="margin-top:14px"><div class="between"><div><div class="h3" style="font-size:14.5px">Cardio opcional</div><div class="muted small">Aparece no fim do treino; não é obrigatório para concluir</div></div><button class="switch" role="switch" aria-checked="${!!(D.cardio && D.cardio.name)}" data-cardio aria-label="Cardio opcional"></button></div>
      ${D.cardio && D.cardio.name ? `<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:12px">${CARDIOS.map(c => `<button class="chip sm ${D.cardio.name === c ? 'on' : ''}" data-cname="${c}">${c}</button>`).join('')}</div><label class="fe-n" style="margin-top:10px;max-width:160px"><span>Meta (min)</span><input class="input" type="number" inputmode="numeric" min="1" value="${D.cardio.min || 20}" data-cmin></label>` : ''}</div>
    <div class="row" style="gap:10px;margin-top:16px"><button class="btn btn-white" style="flex:1" data-fesave>Salvar ficha</button>${w ? `<button class="btn btn-ghost" style="color:#FF6B76" data-fedel aria-label="Excluir ficha">${icon('trash', 18)}</button>` : ''}</div>`;
  Sheet.open(`<div class="fe">${body()}</div>`, (wrap, close) => {
    const root = $('.fe', wrap); const keep = () => { D.name = $('#fe-n', root).value; D.focus = $('#fe-f', root).value; };
    const redraw = () => { keep(); const y = root.closest('.sheet') ? root.closest('.sheet').scrollTop : 0; root.innerHTML = body(); if (root.closest('.sheet')) root.closest('.sheet').scrollTop = y; };
    root.addEventListener('input', e => { const f = e.target.dataset.exf; if (f) { const [i, k] = f.split('.'); D.exercises[+i][k] = e.target.value === '' ? null : +e.target.value; } if (e.target.hasAttribute('data-cmin')) D.cardio.min = +e.target.value || 20; });
    root.addEventListener('click', async e => {
      const t = e.target.closest('[data-tpl]'); if (t) { const tp = JSON.parse(JSON.stringify(WORKOUT_TEMPLATES[+t.dataset.tpl])); D.name = tp.name; D.focus = tp.focus; D.exercises = tp.exercises.map(x => ({ ...x, type: /Prancha/.test(x.n) ? 'time' : 'reps', sec: /Prancha/.test(x.n) ? 60 : undefined })); root.innerHTML = body(); return; }
      const dy = e.target.closest('[data-day]'); if (dy) { const d = +dy.dataset.day; const k = D.days.indexOf(d); k >= 0 ? D.days.splice(k, 1) : D.days.push(d); haptic(5); redraw(); return; }
      const ty = e.target.closest('[data-ext]'); if (ty) { const [i, v] = ty.dataset.ext.split('.'); const x = D.exercises[+i]; x.type = v; if (v === 'time' && !x.sec) x.sec = 60; redraw(); return; }
      const up = e.target.closest('[data-exup]'), dn = e.target.closest('[data-exdn]'), dl = e.target.closest('[data-exdel]');
      if (up || dn) { const i = +(up || dn).dataset[up ? 'exup' : 'exdn']; const j = up ? i - 1 : i + 1; [D.exercises[i], D.exercises[j]] = [D.exercises[j], D.exercises[i]]; redraw(); return; }
      if (dl) { D.exercises.splice(+dl.dataset.exdel, 1); redraw(); return; }
      if (e.target.closest('[data-fepick]')) { keep(); exercisePicker(D.exercises.map(x => x.n), L => { L.forEach(n => D.exercises.push({ n, type: /Prancha|\(s\)/.test(n) ? 'time' : 'reps', sets: 3, reps: 10, kg: 0, sec: /Prancha/.test(n) ? 60 : undefined, rest: 60 })); root.innerHTML = body(); }); return; }
      if (e.target.closest('[data-cardio]')) { D.cardio = D.cardio && D.cardio.name ? null : { name: 'Esteira', min: 20 }; redraw(); return; }
      const cn = e.target.closest('[data-cname]'); if (cn) { D.cardio.name = cn.dataset.cname; redraw(); return; }
      if (e.target.closest('[data-fesave]')) { keep(); D.name = D.name.trim(); D.focus = D.focus.trim(); if (!D.name) return toast('Dê um nome para a ficha', 'x'); if (!D.exercises.length) return toast('Adicione ao menos um exercício', 'x');
        D.exercises = D.exercises.map(x => { const o = { n: x.n, type: x.type || 'reps', sets: Math.max(1, Math.round(x.sets || 3)), rest: Math.max(0, Math.round(x.rest == null ? 60 : x.rest)) }; if (o.type === 'time') o.sec = Math.max(5, Math.round(x.sec || 60)); else { o.reps = Math.max(1, Math.round(x.reps || 10)); o.kg = Math.max(0, +x.kg || 0); } return o; });
        const b = e.target.closest('[data-fesave]'); b.disabled = true; try { await API.saveWorkout(D); close(); toast('Ficha salva'); done && done(); } catch (x) { b.disabled = false; toast(errMsg(x), 'x'); } }
      if (e.target.closest('[data-fedel]')) { close(); if (await confirmDialog('Excluir ficha?', 'O histórico dos treinos feitos com ela continua salvo.', 'Excluir', true)) { await API.removeWorkout(w.id); const s = Sess.get(); if (s && s.wid === w.id) Sess.clear(); toast('Ficha excluída', 'trash'); done && done(); Nav.back(); } }
    });
  }, { label: 'Ficha' });
};
function exercisePicker(already, cb) {
  const sel = []; let grp = 'Todos', q = '';
  const all = () => Object.entries(EXERCISES).flatMap(([g, L]) => L.map(n => [n, g]));
  const list = () => { const n = q.trim().toLowerCase(); const L = all().filter(([e, g]) => (grp === 'Todos' || g === grp) && (!n || e.toLowerCase().includes(n)));
    return (n && !all().some(([e]) => e.toLowerCase() === n) ? `<button class="list-item" style="text-align:left" data-pk="${esc(q.trim())}"><span class="ico">${icon('plus', 18)}</span><div class="h3">Adicionar “${esc(q.trim())}”</div></button>` : '') +
      L.map(([e, g]) => `<button class="list-item ${sel.includes(e) ? 'on' : ''}" style="text-align:left;${sel.includes(e) ? 'border-color:#E3192B' : ''}" data-pk="${esc(e)}"><div style="flex:1"><div class="h3">${esc(e)}</div><div class="muted small">${g}${already.includes(e) ? ' · já na ficha' : ''}</div></div>${sel.includes(e) ? `<span style="color:#E3192B">${icon('check', 20, 2.4)}</span>` : ''}</button>`).join(''); };
  Sheet.open(`<h3 class="h2">Adicionar exercícios</h3><div class="field" style="margin-top:14px"><label class="sr" for="pk-q">Buscar</label><input class="input" id="pk-q" placeholder="Buscar ou digitar um nome" autocomplete="off"></div>
    <div class="hscroll" style="gap:6px">${['Todos', ...Object.keys(EXERCISES)].map(g => `<button class="chip sm ${g === grp ? 'on' : ''}" data-pg="${g}">${g}</button>`).join('')}</div>
    <div class="stack pk-list" style="gap:8px;margin-top:12px">${list()}</div><button class="btn btn-white btn-block pk-ok" style="position:sticky;bottom:0;margin-top:12px">Adicionar</button>`,
    (w, close) => { const L = $('.pk-list', w), ok = $('.pk-ok', w); const upd = () => { L.innerHTML = list(); ok.textContent = sel.length ? `Adicionar (${sel.length})` : 'Adicionar'; };
      $('#pk-q', w).oninput = e => { q = e.target.value; upd(); };
      w.addEventListener('click', e => { const g = e.target.closest('[data-pg]'); if (g) { grp = g.dataset.pg; $$('[data-pg]', w).forEach(x => x.classList.toggle('on', x === g)); upd(); }
        const p = e.target.closest('[data-pk]'); if (p) { const n = p.dataset.pk; const i = sel.indexOf(n); i >= 0 ? sel.splice(i, 1) : sel.push(n); haptic(4); if (q && !all().some(([x]) => x === n)) { q = ''; $('#pk-q', w).value = ''; } upd(); } });
      ok.onclick = () => { if (!sel.length) return toast('Escolha ao menos um exercício', 'x'); close(); cb(sel); }; }, { label: 'Exercícios' });
}

/* ============================================================
   Ficha / treino do dia — cabeçalho com foto e trilha de exercícios
   ============================================================ */
Screens.workout = {
  render({ wid }) {
    setAccent('musculacao'); const f = wid ? API.workouts.find(x => x.id === wid) : null; const s = Sess.get(); const live = s && s.wid === (wid || null) ? s : null;
    if (!f && !live) return `<div class="topbar"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Treino</div><span style="width:46px"></span></div><div class="pad" style="padding-top:110px">${emptyBox('Ficha não encontrada.')}</div>`;
    const name = live ? live.name : f.name, focus = live ? live.focus : f.focus; const idx = f ? Math.max(0, API.workouts.indexOf(f)) : 0;
    const rows = live ? live.ex.map((e, i) => ({ n: e.n, line: sExLine(e), time: e.type === 'time', cardio: e.type === 'cardio', done: exDone(e), part: e.sets.filter(x => x.done).length, total: e.sets.length, cur: i === firstPending(live) }))
      : f.exercises.map(x => ({ n: x.n, line: exLine(x), time: x.type === 'time', total: x.sets }));
    const total = rows.length; const dn = live ? doneCount(live) : 0; const cardio = live ? live.cardio : (f.cardio && f.cardio.name ? f.cardio : null);
    const nextEx = live ? live.ex[firstPending(live)] : null; const prog = total ? dn / total : 0;
    return `<div class="topbar"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">${esc(name)}</div>${f ? `<button class="icon-btn glass" aria-label="Editar ficha" data-wedit>${icon('edit', 18)}</button>` : '<span style="width:46px"></span>'}</div>
    <div class="scroll fx-scope"><div class="fx-whero"><div class="hero-stack" style="position:absolute;inset:0">${scene('tw' + idx, 'musculacao', { i: idx + 1, fade: 'background:linear-gradient(180deg,rgba(11,11,11,.35),rgba(11,11,11,.2) 40%,#0B0B0B 96%)' })}</div><span class="fx-letter xl">${esc(f ? letterOf(f) : 'L')}</span>
      <div class="pad page fx-whero-in"><div class="fx-k" data-e="0">${live ? '<span class="fx-live"></span>Treino em andamento' : f && dayLabel(f) ? dayLabel(f) : 'Ficha'}</div><h1 class="display fx-wt" data-e="1">${esc(name)}</h1>${focus ? `<div class="fx-focus" data-e="1">${esc(focus)}</div>` : ''}
        <div class="fx-stats3" data-e="2"><div><b class="num" id="wk-clock">${live ? hms(sElapsed(live)) : '—'}</b><span>${live ? (live.pausedAt ? 'pausado' : 'tempo') : 'tempo'}</span></div><div><b class="num">${dn}<small>/${total}</small></b><span>feitos</span></div><div><b class="num">~${live ? estMin(live) : planMin(f)}</b><span>min restantes</span></div></div>
        <div class="fx-seg" data-e="3">${rows.map(r => `<i class="${r.done ? 'on' : r.cur ? 'cur' : ''}"></i>`).join('')}</div></div></div>
      <div class="pad page" style="max-width:760px">
      <ol class="fx-trail" data-e="4">${rows.map((r, i) => `<li class="${r.done ? 'done' : ''} ${r.cur ? 'cur' : ''}"><button class="fx-step press" data-exopen="${i}"><span class="fx-node">${r.done ? icon('check', 16, 2.8) : i + 1}</span><div style="flex:1;min-width:0;text-align:left"><div class="fx-sn">${esc(r.n)}</div><div class="fx-m">${r.line}${live && r.part && !r.done ? ` · <b style="color:#fff">${r.part}/${r.total}</b>` : ''}</div></div>${r.cur ? '<span class="fx-pill red">agora</span>' : r.cardio ? '<span class="fx-pill">cardio</span>' : r.time ? '<span class="fx-pill">tempo</span>' : ''}${icon('next', 16)}</button></li>`).join('')}</ol>
      ${cardio ? `<div class="fx-glass fx-cardio" data-e="5"><span class="fx-ic">${icon('heart', 19, 2)}</span><div style="flex:1;min-width:0"><div class="h3">${esc(cardio.name)} · ${cardio.min} min</div><div class="fx-m">${live && cardio.doneMin ? `Registrado: ${cardio.doneMin} min` : live && cardio.mode === 'with' ? 'Entrou no fim do treino' : 'Opcional — o treino pode terminar sem ele'}</div></div>
        ${!live || !cardio.doneMin ? `<div class="fx-cbtns">${!live || cardio.mode !== 'with' ? '<button class="chip on" data-cwith>Incluir</button>' : ''}<button class="chip" data-cdone>Já fiz</button></div>` : `<span style="color:#A3FF12">${icon('check', 20, 2.4)}</span>`}</div>` : ''}
      ${f && !live ? `<button class="fx-glass fx-addrow press" data-wadd>${icon('plus', 18)}Adicionar exercício à ficha</button>` : ''}
      <div style="height:${live ? 170 : 120}px"></div></div></div>
    <div class="wcta fx-ctas">${live ? `<div class="row" style="gap:10px;width:100%"><button class="icon-btn fx-sq" data-wreset aria-label="Reiniciar treino">${icon('refresh', 19)}</button><button class="btn fx-cta" style="flex:1" data-wgo>${nextEx ? `${icon('play', 17)}<span class="fx-ellip">${esc(nextEx.n)}</span>` : `${icon('flag', 17)}Finalizar treino`}</button><button class="icon-btn fx-sq" data-wend aria-label="Encerrar treino">${icon('stop', 18)}</button></div>` : `<button class="btn fx-cta" data-wstart>${icon('play', 18)}Iniciar treino</button>`}</div>`;
  },
  mount(el, p) {
    const { wid } = p; const f = wid ? API.workouts.find(x => x.id === wid) : null; bindScrollFx(el, { bar: $('.topbar', el), hero: $('.fx-whero .hero-stack', el), threshold: 200 });
    const re = () => { el.innerHTML = Screens.workout.render(p); Screens.workout.mount(el, p); Motion.enter(el, 0, 12); }; el._re = re;
    const iv = setInterval(() => { if (!el.isConnected) return clearInterval(iv); const s = Sess.get(); const c = $('#wk-clock', el); if (s && s.wid === (wid || null) && c) c.textContent = hms(sElapsed(s)); }, 500); el._iv = iv;
    const on = (sel, fn) => { const n = $(sel, el); if (n) n.onclick = fn; };
    on('[data-wedit]', () => fichaEditor(f, () => re()));
    on('[data-wadd]', () => exercisePicker(f.exercises.map(x => x.n), async L => { const w2 = JSON.parse(JSON.stringify(f)); L.forEach(n => w2.exercises.push({ n, type: 'reps', sets: 3, reps: 10, kg: 0, rest: 60 })); try { await API.saveWorkout(w2); re(); toast('Ficha atualizada'); } catch (x) { toast(errMsg(x), 'x'); } }));
    on('[data-wstart]', async () => { const s = await startSession(f); if (!s) return; re(); Nav.push('liftEx', { i: firstPending(s) }); });
    on('[data-wgo]', () => { const s = Sess.get(); const i = firstPending(s); if (i < 0) finishLift(); else Nav.push('liftEx', { i }); });
    on('[data-wend]', async () => { if (await confirmDialog('Encerrar treino?', 'O cronômetro para e salvamos só as séries que você concluiu.', 'Encerrar')) finishLift(); });
    on('[data-wreset]', async () => { if (await confirmDialog('Reiniciar treino?', 'Todas as séries marcadas e o cronômetro voltam a zero.', 'Reiniciar', true)) { const s = Sess.get(); const w = API.workouts.find(x => x.id === s.wid); const n = newSession(w || null); if (!w) n.ex = s.ex.map(e => ({ ...e, sets: e.sets.map(x => ({ ...x, done: false, t: 0 })) })); Sess.set(n); re(); toast('Treino reiniciado', 'refresh'); } });
    on('[data-cwith]', async () => { let s = Sess.get(); if (!s || s.wid !== (wid || null)) { s = await startSession(f); if (!s) return; } if (s.cardio && s.cardio.mode !== 'with') { s.cardio.mode = 'with'; s.ex.push({ n: s.cardio.name, type: 'cardio', group: 'Cardio', rest: 0, sets: [{ sec: s.cardio.min * 60, t: 0, done: false }] }); Sess.set(s); toast(`${s.cardio.name} entrou no fim do treino`, 'heart'); } re(); });
    on('[data-cdone]', () => { const cf = (Sess.get() && Sess.get().cardio) || f.cardio;
      Sheet.open(`<h3 class="h2">Quanto tempo de ${esc(cf.name.toLowerCase())}?</h3><div class="field" style="margin-top:14px"><label for="cdm">Minutos</label><input class="input" id="cdm" type="number" inputmode="numeric" min="1" value="${cf.min}"></div><button class="btn btn-white btn-block" data-cdok>Salvar</button>`,
        (sh, close) => $('[data-cdok]', sh).onclick = async () => { const m = Math.round(+$('#cdm', sh).value); if (!(m > 0)) return toast('Informe os minutos', 'x'); let s = Sess.get(); if (!s || s.wid !== (wid || null)) { s = await startSession(f); if (!s) return; }
          s.cardio.doneMin = m; const k = s.ex.findIndex(e => e.type === 'cardio'); if (k >= 0) s.ex.splice(k, 1); Sess.set(s); close(); toast(`${m} min de ${s.cardio.name.toLowerCase()} registrados`, 'check'); re(); }, { label: 'Cardio' }); });
    el.addEventListener('click', e => { const b = e.target.closest('[data-exopen]'); if (!b) return; const i = +b.dataset.exopen; const s = Sess.get();
      if (s && s.wid === (wid || null)) { Nav.push('liftEx', { i }); return; } Nav.push('exercise', { n: f.exercises[i].n }); });
  },
  unmount(el) { clearInterval(el._iv); },
  onReturn(el) { el._re && el._re(); },
};

Screens.liftLive = {
  render() { return `<div class="pad" style="padding-top:120px"><div class="spinner" style="margin:0 auto"></div></div>`; },
  async mount(el, { wid, free }) {
    const w = wid ? API.workouts.find(x => x.id === wid) : null;
    if (!w && !free && API.workouts.length) { Nav.back(); setTimeout(() => Nav.push('workout', { wid: todayWorkout().w.id }), 380); return; }
    const s = await startSession(w); Nav.back(); if (!s) return;
    setTimeout(() => { Nav.push('workout', { wid: s.wid, live: 1 }); if (s.ex.length) setTimeout(() => Nav.push('liftEx', { i: firstPending(s) }), 420); else setTimeout(() => freeAdd(), 500); }, 380);
  },
};
function freeAdd() {
  const s = Sess.get(); if (!s) return;
  exercisePicker(s.ex.map(e => e.n), L => { const s2 = Sess.get(); const ins = s2.ex.findIndex(e => e.type === 'cardio'); const add = L.map(n => mkEx({ n, type: /Prancha/.test(n) ? 'time' : 'reps', sets: 3, reps: 10, sec: 60, rest: 60 })); ins >= 0 ? s2.ex.splice(ins, 0, ...add) : s2.ex.push(...add); Sess.set(s2);
    const top = Nav.stack[Nav.stack.length - 1]; if (top && Screens[top.id].onReturn) Screens[top.id].onReturn(top.el, top.params); });
}

/* ============================================================
   Modo foco — um exercício por vez, números grandes,
   descanso em tela cheia
   ============================================================ */
const R_C = 2 * Math.PI * 110;
Screens.liftEx = {
  render({ i }) {
    setAccent('musculacao'); const s = Sess.get(); if (!s || !s.ex[i]) return `<div class="topbar"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><span></span><span style="width:46px"></span></div><div class="pad" style="padding-top:110px">${emptyBox('Nenhum treino em andamento.')}</div>`;
    const e = s.ex[i]; const N = s.ex.length; const last = e.type === 'cardio' ? null : lastFor(e.n);
    return `<div class="fx-focusbg">${scene('focus', 'musculacao', { i: i + 2, sm: true, fade: 'background:linear-gradient(180deg,rgba(11,11,11,.55),#0B0B0B 55%)' })}</div>
    <div class="topbar fx-ftop"><button class="icon-btn glass" data-back aria-label="Voltar para a ficha">${icon('back', 20, 2)}</button>
      <div class="fx-seg top">${s.ex.map((x, k) => `<i class="${exDone(x) ? 'on' : k === i ? 'cur' : ''}"></i>`).join('')}</div>
      <button class="fx-timepill" id="lx-pause" aria-label="${s.pausedAt ? 'Retomar' : 'Pausar'} treino"><span id="lx-el">${hms(sElapsed(s))}</span>${icon(s.pausedAt ? 'play' : 'pause', 14, 2.4)}</button></div>
    <div class="scroll fx-scope"><div class="pad live-wide" style="padding-top:calc(var(--safe-top) + 78px)">
      <div class="fx-k">Exercício ${i + 1} de ${N}${e.group ? ' · ' + esc(e.group) : ''}</div>
      <h1 class="display fx-exname">${esc(e.n)}</h1>
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:12px">${e.type !== 'cardio' ? `<a class="chip" href="https://www.youtube.com/results?search_query=${encodeURIComponent('como fazer ' + e.n + ' execução correta')}" target="_blank" rel="noopener">${icon('play', 14)}Ver execução</a><button class="chip" data-hist>${icon('chart', 14)}Evolução</button>` : ''}<button class="chip" id="lx-list">${icon('list', 14)}Exercícios</button></div>
      ${last ? `<div class="fx-last">${icon('refresh', 13)}<span>Última vez (${ddmm(last.at)}): <b>${last.sets.map(setTxt).join(' · ')}</b></span></div>` : `<div class="fx-last">${icon('spark', 13)}<span>${e.type === 'cardio' ? 'Cardio opcional — use o cronômetro ou digite o tempo.' : 'Primeira vez aqui. Registre carga e repetições de cada série.'}</span></div>`}
      <div id="lx-body"></div>
      <div style="height:120px"></div></div></div>
    <div class="wcta fx-ctas"><button class="btn fx-cta" id="lx-cta"></button></div>
    <div class="fx-rest" id="lx-rest" hidden><div class="fx-k" style="color:#fff">Descanso</div>
      <div class="fx-rring"><svg viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="110" class="t"/><circle cx="120" cy="120" r="110" class="f" id="lx-rc" style="stroke-dasharray:${R_C}"/></svg><div class="fx-rnum"><b class="num" id="lx-rt">0</b><span>segundos</span></div></div>
      <div class="fx-rnext" id="lx-rn"></div>
      <div class="row" style="gap:10px;margin-top:26px"><button class="btn btn-ghost" data-p30>+30 s</button><button class="btn btn-white" data-rskip>Pular descanso</button></div></div>`;
  },
  mount(el, p) {
    let { i } = p; const sGet = () => Sess.get(); if (!sGet() || !sGet().ex[i]) return;
    { const s = sGet(); if (s.cur !== i) { s.cur = i; Sess.set(s); } }
    const body = $('#lx-body', el), cta = $('#lx-cta', el), rest = $('#lx-rest', el);
    const E = () => sGet().ex[i]; const save = s => Sess.set(s); const pend = () => E().sets.findIndex(x => !x.done);
    let sel = Math.max(0, pend());
    const fmtSec = x => x >= 60 && x % 60 === 0 ? `${x / 60} min` : secStr(x);
    const draw = () => { const e = E(); const pi = pend(); if (sel >= e.sets.length) sel = e.sets.length - 1; const x = e.sets[sel]; const timed = e.type !== 'reps'; const s = sGet();
      const pills = `<div class="fx-sets">${e.sets.map((y, k) => `<button class="fx-set ${y.done ? 'done' : ''} ${k === sel ? 'sel' : ''} ${k === pi ? 'next' : ''}" data-sel="${k}" aria-pressed="${k === sel}"><span>Série ${k + 1}</span><b>${timed ? (y.done ? fmtSec(y.t || y.sec) : fmtSec(y.sec)) : `${kgs(y.kg)}<small>kg</small> × ${y.reps}`}</b>${y.done ? `<em>${icon('check', 12, 3)}</em>` : ''}</button>`).join('')}<button class="fx-set add" data-addset aria-label="Adicionar série">${icon('plus', 18)}</button></div>`;
      let editor;
      if (!timed) editor = `<div class="fx-steppers ${x.done ? 'locked' : ''}">
          <div class="fx-stp"><span class="fx-k">Carga</span><div class="fx-stp-row"><button data-step="kg,-2.5" aria-label="Menos 2,5 kg">${icon('minus', 20, 2.2)}</button><label><input type="number" inputmode="decimal" step="0.5" min="0" value="${x.kg}" data-f="kg" aria-label="Carga em kg"><em>kg</em></label><button data-step="kg,2.5" aria-label="Mais 2,5 kg">${icon('plus', 20, 2.2)}</button></div></div>
          <div class="fx-stp"><span class="fx-k">Repetições</span><div class="fx-stp-row"><button data-step="reps,-1" aria-label="Menos uma repetição">${icon('minus', 20, 2.2)}</button><label><input type="number" inputmode="numeric" min="0" value="${x.reps}" data-f="reps" aria-label="Repetições"><em>reps</em></label><button data-step="reps,1" aria-label="Mais uma repetição">${icon('plus', 20, 2.2)}</button></div></div></div>`;
      else { const c = s.cron && s.cron.i === i && s.cron.k === sel ? s.cron : null; const tt = x.done ? (x.t || x.sec) : c ? c.acc + (c.run ? (Date.now() - c.run) / 1000 : 0) : 0; const pr = Math.min(1, tt / x.sec);
        editor = `<div class="fx-timer ${c && c.run ? 'run' : ''}"><div class="fx-tring"><svg viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="110" class="t"/><circle cx="120" cy="120" r="110" class="f" id="lx-tc" style="stroke-dasharray:${R_C};stroke-dashoffset:${R_C * (1 - pr)}"/></svg>
          <div class="fx-rnum"><b class="num" id="lx-tt">${hms(tt)}</b><span>meta ${fmtSec(x.sec)}</span></div></div>
          <div class="row" style="gap:10px;justify-content:center;margin-top:14px">${x.done ? '' : `<button class="icon-btn glass" data-tz aria-label="Zerar">${icon('refresh', 18)}</button><button class="icon-btn fx-tplay" data-ts aria-label="${c && c.run ? 'Pausar' : 'Iniciar'} cronômetro">${icon(c && c.run ? 'pause' : 'play', 24)}</button><button class="icon-btn glass" data-tmeta aria-label="Ajustar meta">${icon('edit', 17)}</button>`}</div></div>`; }
      body.innerHTML = pills + editor + (x.done ? `<button class="fx-undo" data-undo>${icon('refresh', 14)}Desfazer série ${sel + 1}</button>` : '') + (e.sets.length > 1 && !x.done ? `<button class="fx-undo" data-delset>${icon('minus', 14)}Remover série ${sel + 1}</button>` : '');
      const nx = sGet().ex.findIndex((y, k) => k !== i && !exDone(y));
      if (pi >= 0) { cta.innerHTML = `${icon('check', 18, 2.6)}Concluir série ${(x.done ? pi : sel) + 1}${!timed ? ` · ${kgs(e.sets[x.done ? pi : sel].kg)} kg × ${e.sets[x.done ? pi : sel].reps}` : ''}`; cta.dataset.mode = 'set'; }
      else if (nx >= 0) { cta.innerHTML = `Próximo: <span class="fx-ellip">${esc(sGet().ex[nx].n)}</span>${icon('arrow', 17, 2.2)}`; cta.dataset.mode = 'next'; cta.dataset.nx = nx; }
      else { cta.innerHTML = `${icon('flag', 17)}Finalizar treino`; cta.dataset.mode = 'finish'; } };
    const restUI = () => { const s = sGet(); const left = s.restEnd ? (s.restEnd - Date.now()) / 1000 : 0;
      if (left <= 0) { if (!rest.hidden) { A(rest, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 }).finished.then(() => { rest.hidden = true; }); } return; }
      if (rest.hidden) { rest.hidden = false; A(rest, [{ opacity: 0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'out' }); const e = E(); const pi = pend(); const nx = sGet().ex.findIndex(y => !exDone(y));
        $('#lx-rn', el).innerHTML = pi >= 0 ? `A seguir: série ${pi + 1}${e.type === 'reps' ? ` · ${kgs(e.sets[pi].kg)} kg × ${e.sets[pi].reps}` : ''}` : nx >= 0 ? `A seguir: ${esc(sGet().ex[nx].n)}` : 'Última série feita'; }
      $('#lx-rt', el).textContent = Math.ceil(left); $('#lx-rc', el).style.strokeDashoffset = R_C * (1 - left / (s.restTotal || 60)); };
    const complete = k => { const s = sGet(); const e = s.ex[i]; const x = e.sets[k]; if (x.done) return;
      if (e.type !== 'reps') { const c = s.cron && s.cron.i === i && s.cron.k === k ? s.cron : null; const t = c ? Math.round(c.acc + (c.run ? (Date.now() - c.run) / 1000 : 0)) : 0; x.t = t || x.sec; s.cron = null; }
      x.done = true; haptic([8, 30, 12]);
      const allDone = e.sets.every(y => y.done); const lastAll = s.ex.every((y, j) => j === i || exDone(y));
      if (e.rest && !(allDone && lastAll)) { s.restTotal = e.rest; s.restEnd = Date.now() + e.rest * 1000; s.restBeeped = false; s.restBeeped3 = false; }
      save(s); const np = e.sets.findIndex(y => !y.done); sel = np >= 0 ? np : k;
      const pill = $(`[data-sel="${k}"]`, body); if (pill) A(pill, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'out' });
      setTimeout(() => { draw(); restUI(); if (allDone) toast(lastAll ? 'Todas as séries feitas!' : 'Exercício concluído', 'check'); }, 160); };
    body.addEventListener('input', e => { const f = e.target.dataset.f; if (!f) return; const s = sGet(); const x = s.ex[i].sets[sel]; if (x.done) return; x[f] = Math.max(0, +e.target.value || 0); save(s); });
    body.addEventListener('change', () => draw());
    body.addEventListener('click', e => { const s = sGet(); const ex = s.ex[i];
      const sp = e.target.closest('[data-sel]'); if (sp) { sel = +sp.dataset.sel; haptic(4); draw(); return; }
      const st = e.target.closest('[data-step]'); if (st) { const [f, d] = st.dataset.step.split(','); const x = ex.sets[sel]; if (x.done) return; x[f] = Math.max(0, Math.round(((+x[f] || 0) + +d) * 10) / 10);
        for (let k = sel + 1; k < ex.sets.length; k++) if (!ex.sets[k].done && f === 'kg' && ex.sets[k].kg < x.kg) ex.sets[k].kg = x.kg; save(s); haptic(4);
        const inp = $(`[data-f="${f}"]`, body); inp.value = x[f]; A(inp, [{ transform: `translateY(${+d > 0 ? -8 : 8}px)`, opacity: .3 }, { transform: 'none', opacity: 1 }], { spring: [320, 22] }); $$('.fx-set', body)[sel].querySelector('b').innerHTML = `${kgs(x.kg)}<small>kg</small> × ${x.reps}`; cta.innerHTML = `${icon('check', 18, 2.6)}Concluir série ${sel + 1} · ${kgs(x.kg)} kg × ${x.reps}`; return; }
      if (e.target.closest('[data-addset]')) { const b = ex.sets[ex.sets.length - 1]; ex.sets.push({ ...b, done: false, t: 0 }); save(s); sel = ex.sets.length - 1; draw(); return; }
      if (e.target.closest('[data-delset]')) { ex.sets.splice(sel, 1); save(s); sel = Math.max(0, Math.min(sel, ex.sets.length - 1)); draw(); return; }
      if (e.target.closest('[data-undo]')) { ex.sets[sel].done = false; save(s); draw(); return; }
      if (e.target.closest('[data-ts]')) { const c = s.cron && s.cron.i === i && s.cron.k === sel ? s.cron : (s.cron = { i, k: sel, acc: 0, run: 0 }); if (c.run) { c.acc += (Date.now() - c.run) / 1000; c.run = 0; } else { c.run = Date.now(); c.hit = false; haptic(8); } save(s); draw(); return; }
      if (e.target.closest('[data-tz]')) { s.cron = { i, k: sel, acc: 0, run: 0 }; save(s); draw(); return; }
      if (e.target.closest('[data-tmeta]')) { const x = ex.sets[sel]; Sheet.open(`<h3 class="h2">Meta da série ${sel + 1}</h3><div class="field" style="margin-top:14px"><label for="tm">Segundos</label><input class="input" id="tm" type="number" inputmode="numeric" min="5" value="${x.sec}"></div><label class="toggle-row" style="margin-bottom:12px"><span class="h3">Aplicar às próximas séries</span><input type="checkbox" id="tma" checked></label><button class="btn btn-white btn-block" data-tmok>Salvar</button>`,
        (sh, close) => $('[data-tmok]', sh).onclick = () => { const v = Math.max(5, Math.round(+$('#tm', sh).value || 0)); const s2 = sGet(); s2.ex[i].sets.forEach((y, k) => { if (k === sel || ($('#tma', sh).checked && k > sel && !y.done)) y.sec = v; }); save(s2); close(); draw(); }, { label: 'Meta' }); return; }
    });
    rest.addEventListener('click', e => { const s = sGet(); if (e.target.closest('[data-p30]')) { if (s.restEnd > Date.now()) { s.restEnd += 30000; s.restTotal += 30; save(s); restUI(); } }
      if (e.target.closest('[data-rskip]')) { s.restEnd = 0; save(s); restUI(); } });
    cta.onclick = () => { const m = cta.dataset.mode; if (m === 'set') { const x = E().sets[sel]; complete(x.done ? pend() : sel); } else if (m === 'next') go(+cta.dataset.nx); else finishLift(); };
    const go = j => { const s = sGet(); s.cur = j; save(s); el._cleanup && el._cleanup(); el.innerHTML = Screens.liftEx.render({ i: j }); p.i = j; Screens.liftEx.mount(el, p); A($('.live-wide', el), [{ opacity: 0, transform: 'translateX(40px)' }, { opacity: 1, transform: 'none' }], { spring: [200, 24] }); };
    $('#lx-pause', el).onclick = () => { const s = sGet(); if (s.pausedAt) { s.pausedTotal += Date.now() - s.pausedAt; s.pausedAt = null; toast('Treino retomado', 'play'); } else { s.pausedAt = Date.now(); toast('Treino pausado', 'pause'); } save(s); const b = $('#lx-pause', el); b.classList.toggle('paused', !!s.pausedAt); b.innerHTML = `<span id="lx-el">${hms(sElapsed(s))}</span>${icon(s.pausedAt ? 'play' : 'pause', 14, 2.4)}`; };
    const hb = $('[data-hist]', el); if (hb) hb.onclick = () => Nav.push('exercise', { n: E().n });
    $('#lx-list', el).onclick = () => { const s = sGet(); Sheet.open(`<h3 class="h2">Exercícios</h3><div class="stack" style="gap:8px;margin-top:12px">${s.ex.map((x, k) => `<button class="list-item" style="text-align:left;${k === i ? 'border-color:#E3192B' : ''}" data-go="${k}"><span class="ico" style="${exDone(x) ? 'background:#E3192B;color:#fff' : ''}">${exDone(x) ? icon('check', 16, 2.6) : k + 1}</span><div style="flex:1"><div class="h3">${esc(x.n)}</div><div class="muted small">${x.sets.filter(y => y.done).length}/${x.sets.length} séries</div></div></button>`).join('')}</div><button class="btn btn-ghost btn-block" style="margin-top:12px" data-addex>${icon('plus', 16)}Adicionar exercício</button>`,
      (w, close) => w.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { close(); go(+b.dataset.go); } if (e.target.closest('[data-addex]')) { close(); freeAdd(); } }), { label: 'Exercícios' }); };
    draw(); restUI();
    const iv = setInterval(() => { if (!el.isConnected) return clearInterval(iv); const s = sGet(); if (!s) return clearInterval(iv); const t = $('#lx-el', el); if (t) t.textContent = hms(sElapsed(s));
      if (s.restEnd) { const left = (s.restEnd - Date.now()) / 1000; if (left <= 3.2 && left > 2.6 && !s.restBeeped3) { s.restBeeped3 = true; beep(660, .1, 2); save(s); }
        if (left <= 0 && !s.restBeeped) { s.restBeeped = true; s.restEnd = 0; save(s); beep(990, .25, 2); haptic([20, 60, 20]); toast('Bora, próxima série', 'bolt'); } restUI(); }
      const c = s.cron && s.cron.i === i && s.cron.run ? s.cron : null; if (c && c.k === sel) { const x = s.ex[i].sets[sel]; const tt = c.acc + (Date.now() - c.run) / 1000; const ce = $('#lx-tt', el); if (ce) ce.textContent = hms(tt); const tc = $('#lx-tc', el); if (tc) tc.style.strokeDashoffset = R_C * (1 - Math.min(1, tt / x.sec));
        if (tt >= x.sec && !c.hit) { c.hit = true; save(s); beep(990, .3, 2); haptic([20, 60, 20]); toast('Meta de tempo atingida', 'check'); } } }, 200);
    let lock = null; keepAwake().then(l => lock = l); el._cleanup = () => { clearInterval(iv); try { lock && lock.release(); } catch (e) {} };
  },
  unmount(el) { el._cleanup && el._cleanup(); },
};
/* ============================================================
   Finalizar: avaliação → salvar → resumo
   ============================================================ */
async function finishLift() {
  const s = Sess.get(); if (!s) return;
  const done = s.ex.filter(e => e.type !== 'cardio').flatMap(e => e.sets.filter(x => x.done)); const cardioEx = s.ex.find(e => e.type === 'cardio');
  const cardioMin = s.cardio ? (s.cardio.doneMin || (cardioEx && cardioEx.sets[0].done ? Math.round((cardioEx.sets[0].t || cardioEx.sets[0].sec) / 60) : 0)) : 0;
  if (!done.length && !cardioMin) { if (await confirmDialog('Nenhuma série concluída', 'Marque pelo menos uma série para salvar o treino. Quer descartar este treino?', 'Descartar', true)) { Sess.clear(); popToWorkout(); toast('Treino descartado', 'trash'); } return; }
  const ZONES = [[0, 'Leve', '#A3FF12'], [4, 'Moderado', '#FFC23D'], [7, 'Intenso', '#FF7426'], [9, 'Máximo', '#E3192B']];
  const zone = v => ZONES.filter(z => v >= z[0]).pop();
  let diff = 6;
  Sheet.open(`<div class="fx-k">Treino finalizado</div><h3 class="h2" style="margin-top:6px">Qual foi a intensidade?</h3>
    <div class="fx-rpe"><b class="num" id="rpe-v">6</b><span id="rpe-z">Intenso</span></div>
    <input type="range" min="0" max="10" step="1" value="6" class="fx-range" id="rpe" aria-label="Intensidade de 0 a 10">
    <div class="fx-zones">${ZONES.map(z => `<span>${z[1]}</span>`).join('')}</div>
    <div class="field" style="margin-top:18px"><label for="rpe-n">Como você se sentiu? (opcional)</label><textarea class="input" id="rpe-n" rows="2" maxlength="400" placeholder="Ex.: senti o ombro no supino"></textarea></div>
    <div class="row" style="gap:10px"><button class="btn btn-ghost" style="flex:1" data-rskip>Pular</button><button class="btn fx-cta" style="flex:2;height:54px" data-rgo>Salvar treino</button></div>`,
    (w, close) => { const r = $('#rpe', w); const upd = () => { diff = +r.value; const z = zone(diff); $('#rpe-v', w).textContent = diff; $('#rpe-z', w).textContent = z[1]; $('#rpe-v', w).style.color = z[2]; r.style.setProperty('--p', diff / 10); }; r.oninput = () => { upd(); haptic(3); }; upd();
      const go = async skip => { const btns = $$('[data-rskip],[data-rgo]', w); btns.forEach(b => b.disabled = true);
        try { const a = await saveLift(s, skip ? null : diff, skip ? '' : $('#rpe-n', w).value.trim(), cardioMin); close(); Sess.clear(); popToWorkout(); setTimeout(() => Nav.push('liftSummary', { id: a.id, fresh: 1 }), 420); }
        catch (x) { btns.forEach(b => b.disabled = false); toast(errMsg(x), 'x'); } };
      $('[data-rskip]', w).onclick = () => go(true); $('[data-rgo]', w).onclick = () => go(false); }, { label: 'Intensidade do treino' });
}
function popToWorkout() {
  const ids = ['liftEx', 'workout', 'liftLive']; const top = () => Nav.stack[Nav.stack.length - 1];
  while (Nav.stack.length > 1 && ids.includes(top().id) && ids.includes(Nav.stack[Nav.stack.length - 2].id)) { const e = Nav.stack.pop(); const sc = Screens[e.id]; sc.unmount && sc.unmount(e.el); e.el.remove(); }
  const t = top(); if (t && ids.includes(t.id)) { t.el.getAnimations().forEach(a => a.cancel()); t.el.style.transform = ''; t.el.style.filter = ''; Nav.back(); }
}
async function saveLift(s, difficulty, notes, cardioMin) {
  const sets = []; const prs = [];
  s.ex.forEach(e => { if (e.type === 'cardio') return; const prevBest = bestKg(e.n);
    e.sets.forEach((x, k) => { if (!x.done) return; if (e.type === 'time') sets.push({ ex: e.n, sec: Math.round(x.t || x.sec), i: k }); else { sets.push({ ex: e.n, kg: +x.kg || 0, reps: Math.round(x.reps || 0), i: k }); if (prevBest > 0 && x.kg > prevBest && !prs.includes(e.n)) prs.push(e.n); } }); });
  const volume = sets.reduce((v, x) => v + (x.kg || 0) * (x.reps || 0), 0);
  const a = { sport: 'musculacao', title: `${s.name}${s.focus ? ' - ' + s.focus : ''}`, workoutId: s.wid || null, startedAt: s.startedAt, duration: Math.round(sElapsed(s)), sets, volume: Math.round(volume),
    plannedSets: s.ex.filter(e => e.type !== 'cardio').reduce((n, e) => n + e.sets.length, 0), plan: s.ex.filter(e => e.type !== 'cardio').map(e => ({ n: e.n, type: e.type, sets: e.sets.length })),
    difficulty: difficulty == null ? null : difficulty, notes: notes || null, cardio: cardioMin ? { name: s.cardio.name, min: cardioMin } : null, prCount: prs.length, prs };
  const saved = await API.addActivity(a); haptic([20, 60, 20]); return saved;
}

/* ---------- resumo: números grandes + comparação em barras ---------- */
const pctBadge = (v, p) => { if (p == null || !p) return v ? '<span class="fx-badge new">novo</span>' : ''; const d = (v - p) / p * 100; if (Math.abs(d) < .5) return '<span class="fx-badge">igual</span>'; return `<span class="fx-badge ${d > 0 ? 'up' : 'dn'}">${d > 0 ? '+' : '−'}${fmt(Math.abs(d), Math.abs(d) < 10 ? 1 : 0)}%</span>`; };
Screens.liftSummary = {
  render({ id }) {
    setAccent('musculacao'); const a = API.acts.find(x => x.id === id); if (!a) return `<div class="topbar"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button></div><div class="pad" style="padding-top:110px">${emptyBox('Treino não encontrado.')}</div>`;
    const prev = API.acts.find(x => isLift(x) && x.id !== a.id && x.startedAt < a.startedAt && (a.workoutId ? x.workoutId === a.workoutId : x.title === a.title));
    const plan = a.plan || Object.values((a.sets || []).reduce((m, x) => { m[x.ex] = m[x.ex] || { n: x.ex, type: x.sec != null && x.reps == null ? 'time' : 'reps', sets: 0 }; m[x.ex].sets++; return m; }, {}));
    const doneN = (a.sets || []).length; const w = a.workoutId ? API.workouts.find(x => x.id === a.workoutId) : null; const idx = w ? API.workouts.indexOf(w) : 0;
    const vol = s => s.reduce((v, x) => v + (x.kg || 0) * (x.reps || 0), 0);
    const row = p => { const S = (a.sets || []).filter(x => x.ex === p.n).sort((x, y) => (x.i || 0) - (y.i || 0)); const P = prev ? (prev.sets || []).filter(x => x.ex === p.n) : []; const timed = p.type === 'time';
      const val = x => timed ? (x.sec || 0) : ((x.kg || 0) * (x.reps || 0) || (x.reps || 0));
      const mxV = Math.max(1, ...S.map(val), ...P.map(val));
      const bars = Array.from({ length: Math.max(p.sets, S.length, P.length) }, (_, k) => { const x = S.find(y => y.i === k) || (S[k] && S[k].i == null ? S[k] : null); const y = P.find(z => z.i === k) || (P[k] && P[k].i == null ? P[k] : null);
        return `<div class="fx-bpair" title="Série ${k + 1}"><i class="prev" style="height:${y ? Math.max(6, val(y) / mxV * 100) : 0}%"></i><i class="now ${x ? '' : 'miss'}" style="height:${x ? Math.max(6, val(x) / mxV * 100) : 100}%"></i><span>${x ? (timed ? secStr(x.sec) : `${x.kg ? kgs(x.kg) + '×' : ''}${x.reps}`) : '—'}</span></div>`; }).join('');
      const mx = S.length ? Math.max(...S.map(x => x.kg || 0)) : 0, pmx = P.length ? Math.max(...P.map(x => x.kg || 0)) : null;
      const key = timed ? ['Tempo', secStr(S.reduce((v, x) => v + (x.sec || 0), 0)), pctBadge(S.reduce((v, x) => v + (x.sec || 0), 0), P.length ? P.reduce((v, x) => v + (x.sec || 0), 0) : null)]
        : mx ? ['Maior carga', kgs(mx) + ' kg', pctBadge(mx, pmx)] : ['Repetições', String(S.reduce((v, x) => v + (x.reps || 0), 0)), pctBadge(S.reduce((v, x) => v + (x.reps || 0), 0), P.length ? P.reduce((v, x) => v + (x.reps || 0), 0) : null)];
      const isPR = (a.prs || []).includes(p.n); if (!S.length) key.splice(0, 3, '', 'Não feito', '');
      return `<div class="fx-glass fx-exsum"><div class="between" style="align-items:flex-start;gap:10px"><div style="min-width:0"><div class="h3">${esc(p.n)}${isPR ? ` <span class="fx-pill red">${icon('medal', 11, 2.4)} recorde</span>` : ''}</div><div class="fx-m" style="margin-top:3px">${S.length}/${p.sets} séries${!timed && mx ? ` · ${fmt(vol(S))} kg de volume` : ''}</div></div>
        <div style="text-align:right;flex:none"><div class="fx-m" style="font-size:11px">${key[0]}</div><div class="num" style="font-size:19px">${key[1]}</div>${key[2]}</div></div>
        <div class="fx-bars">${bars}</div></div>`; };
    const big = (k, v, sub) => `<div class="fx-bigstat"><span class="fx-k">${k}</span><b class="num">${v}</b>${sub}</div>`;
    return `<div class="topbar"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Resumo</div><button class="icon-btn glass" aria-label="Excluir treino" data-sdel>${icon('trash', 18)}</button></div>
    <div class="scroll fx-scope"><canvas id="ls-conf" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5"></canvas>
      <div class="fx-whero" style="height:330px"><div class="hero-stack" style="position:absolute;inset:0">${scene('tw' + idx, 'musculacao', { i: idx + 1, fade: 'background:linear-gradient(180deg,rgba(11,11,11,.3),#0B0B0B 95%)' })}</div>
        <div class="pad page fx-whero-in" style="max-width:760px"><div class="fx-k" data-e="0">${icon('check', 13, 3)} Treino concluído · ${new Date(a.startedAt).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</div><h1 class="display fx-wt" style="font-size:34px" data-e="1">${esc(a.title)}</h1>
          <div class="fx-m" data-e="1">${prev ? `Comparado com ${new Date(prev.startedAt).toLocaleDateString('pt-BR')}` : 'Primeiro registro desta ficha — o próximo já terá comparação'}</div></div></div>
      <div class="pad page" style="max-width:760px">
        ${a.prCount ? `<div class="fx-prbanner" data-e="2">${icon('medal', 20, 2)}<div><b>${a.prCount === 1 ? 'Novo recorde de carga' : a.prCount + ' recordes de carga'}</b><div class="fx-m">${(a.prs || []).map(esc).join(', ')}</div></div></div>` : ''}
        <div class="fx-bigs" data-e="3">${big('Duração', hms(a.duration), prev ? `<span class="fx-m">antes ${hms(prev.duration)}</span>` : '')}${big('Volume', volStr(a.volume), prev ? pctBadge(a.volume || 0, prev.volume || 0) : '')}${big('Séries', `${doneN}<small>/${a.plannedSets || doneN}</small>`, prev ? `<span class="fx-m">antes ${(prev.sets || []).length}</span>` : '')}${big('Intensidade', a.difficulty == null ? '—' : `${a.difficulty}<small>/10</small>`, prev && prev.difficulty != null ? `<span class="fx-m">antes ${prev.difficulty}/10</span>` : '')}</div>
        ${a.cardio ? `<div class="fx-glass fx-cardio" style="margin-top:12px"><span class="fx-ic">${icon('heart', 19, 2)}</span><div class="h3" style="flex:1">${esc(a.cardio.name)}</div><b class="num">${a.cardio.min} min</b></div>` : ''}
        ${a.notes ? `<div class="fx-quote">“${esc(a.notes)}”</div>` : ''}
        <div class="wsec" data-e="4"><h2>Série a série</h2>${prev ? '<span class="fx-legend"><i class="prev"></i>antes <i class="now"></i>hoje</span>' : ''}</div>
        <div class="stack" style="gap:12px" data-e="5">${plan.map(row).join('')}</div>
        <div style="height:150px"></div></div></div>
    <div class="wcta fx-ctas"><div class="row" style="gap:10px;width:100%"><button class="icon-btn fx-sq" data-shome aria-label="Voltar ao início">${icon('home', 19)}</button><button class="btn fx-cta" style="flex:1" data-spub>${icon('share', 18)}Publicar na comunidade</button></div></div>`;
  },
  mount(el, { id, fresh }) {
    const a = API.acts.find(x => x.id === id); if (!a) return; bindScrollFx(el, { bar: $('.topbar', el), hero: $('.fx-whero .hero-stack', el), threshold: 200 });
    $$('.fx-bpair i', el).forEach((b, k) => A(b, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { spring: [160, 18], delay: 300 + k * 25 }));
    if (fresh) { setTimeout(() => confetti($('#ls-conf', el), a.prCount ? 90 : 40), 250); if (a.prCount) setTimeout(() => celebrate({ title: 'Novo recorde pessoal', sub: (a.prs || []).join(', '), big: `${a.prCount} ${a.prCount === 1 ? 'recorde' : 'recordes'}`, points: 0, color: '#E3192B', icon: 'medal', share: false }), 700); }
    $('[data-spub]', el).onclick = () => composePost({ sport: 'musculacao', activity: a });
    $('[data-shome]', el).onclick = () => Nav.go('home');
    $('[data-sdel]', el).onclick = async () => { if (await confirmDialog('Excluir este treino?', 'Ele sai do histórico, das estatísticas e dos desafios. Não dá para desfazer.', 'Excluir', true)) { try { await API.removeActivity(a.id); toast('Treino excluído', 'trash'); Nav.back(); } catch (x) { toast(errMsg(x), 'x'); } } };
  },
};
const _activitySheet = activitySheet;
activitySheet = a => a && isLift(a) && (a.sets || a.plan) && !a.manual ? Nav.push('liftSummary', { id: a.id }) : _activitySheet(a);

/* ---------- histórico ---------- */
Screens.liftHistory = {
  render() {
    setAccent('musculacao'); const L = API.acts.filter(isLift);
    const groups = L.reduce((m, a) => { const k = new Date(a.startedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); (m[k] = m[k] || []).push(a); return m; }, {});
    const mxV = Math.max(1, ...L.map(a => a.volume || 0));
    return `<div class="topbar solid"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Histórico</div><span style="width:46px"></span></div>
    <div class="scroll fx-scope"><div class="pad page" style="padding-top:calc(var(--safe-top) + 74px);max-width:760px">
      <h1 class="display" style="font-size:32px;margin:0 0 6px">Seus treinos</h1><div class="fx-m">${L.length} ${L.length === 1 ? 'treino registrado' : 'treinos registrados'} · ${volStr(L.reduce((v, a) => v + (a.volume || 0), 0))} levantados</div>
      ${L.length ? Object.entries(groups).map(([m, A2]) => `<div class="wsec" style="margin-top:22px"><h2>${m.charAt(0).toUpperCase() + m.slice(1)}</h2><span class="fx-m">${A2.length}</span></div><div class="stack" style="gap:10px">${A2.map(a => `<button class="fx-glass fx-hrow press" data-hs="${a.id}"><div class="fx-hday"><b>${new Date(a.startedAt).getDate()}</b><span>${WD3[new Date(a.startedAt).getDay()]}</span></div><div style="flex:1;min-width:0;text-align:left"><div class="h3" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(a.title || 'Musculação')}${a.prCount ? ` <span style="color:#E3192B">${icon('medal', 13, 2.4)}</span>` : ''}</div><div class="fx-m" style="margin-top:3px">${hms(a.duration || 0)} · ${(a.sets || []).length} séries${a.difficulty != null ? ' · intensidade ' + a.difficulty : ''}</div><div class="fx-hbar"><i style="width:${(a.volume || 0) / mxV * 100}%"></i></div></div><div style="text-align:right"><b class="num" style="font-size:15px">${volStr(a.volume)}</b><div class="fx-m" style="font-size:10.5px">volume</div></div></button>`).join('')}</div>`).join('')
        : `<div style="margin-top:20px">${emptyBox('Nenhum treino ainda. Inicie uma ficha e conclua as séries para ver o histórico aqui.')}</div>`}
      <div style="height:40px"></div></div></div>`;
  },
  mount(el) { el.addEventListener('click', e => { const b = e.target.closest('[data-hs]'); if (!b) return; const a = API.acts.find(x => x.id === b.dataset.hs); if (a && (a.sets || a.plan) && !a.manual) Nav.push('liftSummary', { id: a.id }); else _activitySheet(a); }); },
  onReturn(el) { el.innerHTML = Screens.liftHistory.render(); Screens.liftHistory.mount(el); },
};
