/* ============================================================
   ORA GYM — estatísticas calculadas das atividades reais
   ============================================================ */
const DAY = 864e5;
const startOfDay = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const startOfWeek = t => { const d = new Date(startOfDay(t)); const wd = (d.getDay() + 6) % 7; return d.getTime() - wd * DAY; };
const startOfMonth = t => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), 1).getTime(); };
const dkey = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const hms = s => { s = Math.max(0, Math.round(s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`; };
const paceOf = (sec, m) => m > 0 ? paceStr((sec / 60) / (m / 1000)) : '—';
const ago = t => { const s = (Date.now() - t) / 1000; if (s < 60) return 'agora'; if (s < 3600) return Math.floor(s / 60) + ' min'; if (s < 86400) return Math.floor(s / 3600) + ' h'; if (s < 604800) return Math.floor(s / 86400) + ' d'; return new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); };
const shortDate = t => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

const METRIC = {
  musculacao: { k: 'Volume', u: 't', dec: 1, of: a => (a.volume || 0) / 1000 },
  corrida: { k: 'Distância', u: 'km', dec: 1, of: a => (a.distance || 0) / 1000 },
  ciclismo: { k: 'Distância', u: 'km', dec: 1, of: a => (a.distance || 0) / 1000 },
  calistenia: { k: 'Repetições', u: 'reps', dec: 0, of: a => a.reps || 0 },
  futebol: { k: 'Gols + assistências', u: 'G+A', dec: 0, of: a => (a.goals || 0) + (a.assists || 0) },
  natacao: { k: 'Distância', u: 'km', dec: 2, of: a => (a.distance || 0) / 1000 },
  boxe: { k: 'Rounds', u: 'rounds', dec: 0, of: a => a.rounds || 0 },
};
const GOAL_DEFAULT = {
  musculacao: { kind: 'sessions', target: 4, unit: 'treinos' }, corrida: { kind: 'metric', target: 20, unit: 'km' }, ciclismo: { kind: 'metric', target: 80, unit: 'km' },
  calistenia: { kind: 'sessions', target: 3, unit: 'treinos' }, futebol: { kind: 'sessions', target: 1, unit: 'partidas' }, natacao: { kind: 'metric', target: 3, unit: 'km' }, boxe: { kind: 'metric', target: 20, unit: 'rounds' },
};
const CH_METRICS = {
  musculacao: [['sessions', 'Treinos concluídos', 'treinos'], ['volume', 'Volume levantado', 't']],
  corrida: [['distance', 'Distância', 'km'], ['sessions', 'Corridas', 'corridas'], ['duration', 'Tempo correndo', 'min']],
  ciclismo: [['distance', 'Distância', 'km'], ['sessions', 'Pedais', 'pedais'], ['duration', 'Tempo pedalando', 'min']],
  calistenia: [['reps', 'Repetições', 'reps'], ['sessions', 'Treinos', 'treinos']],
  futebol: [['goals', 'Gols', 'gols'], ['sessions', 'Partidas', 'partidas']],
  natacao: [['distance', 'Distância', 'km'], ['sessions', 'Treinos', 'treinos']],
  boxe: [['rounds', 'Rounds', 'rounds'], ['sessions', 'Treinos', 'treinos']],
};

const Stats = {
  challengeProgress(acts, c) {
    const end = startOfDay(c.end) + DAY; const L = acts.filter(a => a.sport === c.sport && a.startedAt >= startOfDay(c.start) && a.startedAt < end);
    const m = c.metric; let v = 0;
    L.forEach(a => { v += m === 'sessions' ? 1 : m === 'distance' ? (a.distance || 0) / 1000 : m === 'volume' ? (a.volume || 0) / 1000 : m === 'duration' ? (a.duration || 0) / 60 : (a[m] || 0); });
    return Math.round(v * 100) / 100;
  },
  streak(acts) {
    const days = new Set(acts.map(a => dkey(a.startedAt))); let t = startOfDay(Date.now()); if (!days.has(dkey(t))) t -= DAY; let n = 0;
    while (days.has(dkey(t))) { n++; t -= DAY; } return n;
  },
  sport(acts, id, me) {
    const M = METRIC[id]; const L = acts.filter(a => a.sport === id); const now = Date.now(); const w0 = startOfWeek(now);
    const val = a => M.of(a);
    const W = Array.from({ length: 7 }, (_, i) => L.filter(a => a.startedAt >= w0 + i * DAY && a.startedAt < w0 + (i + 1) * DAY).reduce((s, a) => s + val(a), 0));
    const Mo = Array.from({ length: 12 }, (_, i) => { const a0 = w0 - (11 - i) * 7 * DAY; return L.filter(a => a.startedAt >= a0 && a.startedAt < a0 + 7 * DAY).reduce((s, a) => s + val(a), 0); });
    const Y = Array.from({ length: 12 }, (_, i) => { const d = new Date(); const s0 = new Date(d.getFullYear(), d.getMonth() - (11 - i), 1).getTime(); const s1 = new Date(d.getFullYear(), d.getMonth() - (10 - i), 1).getTime(); return L.filter(a => a.startedAt >= s0 && a.startedAt < s1).reduce((s, a) => s + val(a), 0); });
    const monthNames = Array.from({ length: 12 }, (_, i) => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() - (11 - i), 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''); });
    const week = L.filter(a => a.startedAt >= w0); const month = L.filter(a => a.startedAt >= startOfMonth(now));
    const g = Object.assign({}, GOAL_DEFAULT[id], (me && me.weekly && me.weekly[id]) || {});
    const gv = g.kind === 'sessions' ? week.length : week.reduce((s, a) => s + val(a), 0);
    const r = round1;
    return {
      id, list: L, count: L.length, week, month, weekTotal: r(W.reduce((a, b) => a + b, 0)), weekCount: week.length, monthTotal: r(month.reduce((s, a) => s + val(a), 0)),
      total: r(L.reduce((s, a) => s + val(a), 0)), totalTime: L.reduce((s, a) => s + (a.duration || 0), 0), last: L[0] || null,
      series: { W: W.map(r), M: Mo.map(r), Y: Y.map(r) }, labels: { W: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'], M: ['12 sem', '', '', '9', '', '', '6', '', '', '3', '', 'Esta'], Y: monthNames },
      goal: { ...g, value: r(gv), p: g.target ? Math.min(1, gv / g.target) : 0 }, metric: M, records: Stats.records(L, id), extra: Stats.extra(L, id),
    };
  },
  records(L, id) {
    const out = [];
    if (id === 'musculacao') {
      const best = {}; L.forEach(a => (a.sets || []).forEach(s => { if (s.kg > 0 && (!best[s.ex] || s.kg > best[s.ex].kg)) best[s.ex] = { kg: s.kg, t: a.startedAt }; }));
      Object.entries(best).sort((a, b) => b[1].kg - a[1].kg).slice(0, 4).forEach(([k, v]) => out.push({ k, v: fmt(v.kg, v.kg % 1 ? 1 : 0) + ' kg', d: shortDate(v.t) }));
      const mv = maxBy(L, a => a.volume || 0); if (mv && mv.volume) out.push({ k: 'Maior volume num treino', v: volStr(mv.volume), d: shortDate(mv.startedAt) });
    }
    if (id === 'corrida' || id === 'ciclismo') {
      const long = maxBy(L, a => a.distance || 0); if (long && long.distance) out.push({ k: 'Maior distância', v: fmt(long.distance / 1000, 2) + ' km', d: shortDate(long.startedAt) });
      const valid = L.filter(a => (a.distance || 0) >= 1000 && a.duration > 0);
      if (id === 'corrida') { const bp = minBy(valid, a => a.duration / a.distance); if (bp) out.push({ k: 'Melhor pace médio', v: paceOf(bp.duration, bp.distance) + '/km', d: shortDate(bp.startedAt) });
        [5, 10, 21.1].forEach(km => { const c = minBy(L.filter(a => (a.distance || 0) >= km * 1000 && a.duration > 0), a => a.duration / a.distance); if (c) out.push({ k: `${fmt(km, km % 1 ? 1 : 0)} km (estimado)`, v: hms(c.duration / c.distance * km * 1000), d: shortDate(c.startedAt) }); }); }
      else { const bs = maxBy(valid, a => a.distance / a.duration); if (bs) out.push({ k: 'Maior velocidade média', v: fmt(bs.distance / bs.duration * 3.6, 1) + ' km/h', d: shortDate(bs.startedAt) }); }
      const lt = maxBy(L, a => a.duration || 0); if (lt) out.push({ k: 'Mais tempo em movimento', v: hms(lt.duration), d: shortDate(lt.startedAt) });
    }
    if (id === 'natacao') { const long = maxBy(L, a => a.distance || 0); if (long && long.distance) out.push({ k: 'Maior treino', v: fmt(long.distance) + ' m', d: shortDate(long.startedAt) });
      const bp = minBy(L.filter(a => (a.distance || 0) >= 200 && a.duration > 0), a => a.duration / a.distance); if (bp) out.push({ k: 'Melhor ritmo /100 m', v: hms(bp.duration / bp.distance * 100), d: shortDate(bp.startedAt) }); }
    if (id === 'boxe') { const m = maxBy(L, a => a.rounds || 0); if (m && m.rounds) out.push({ k: 'Mais rounds num treino', v: String(m.rounds), d: shortDate(m.startedAt) }); const lt = maxBy(L, a => a.duration || 0); if (lt) out.push({ k: 'Treino mais longo', v: hms(lt.duration), d: shortDate(lt.startedAt) }); }
    if (id === 'futebol') { const m = maxBy(L, a => a.goals || 0); if (m && m.goals) out.push({ k: 'Mais gols numa partida', v: String(m.goals), d: shortDate(m.startedAt) }); const as = maxBy(L, a => a.assists || 0); if (as && as.assists) out.push({ k: 'Mais assistências numa partida', v: String(as.assists), d: shortDate(as.startedAt) }); }
    if (id === 'calistenia') { const best = {}; L.forEach(a => (a.blocks || []).forEach(b => { if (b.reps > 0 && (!best[b.ex] || b.reps > best[b.ex].reps)) best[b.ex] = { reps: b.reps, t: a.startedAt }; }));
      Object.entries(best).sort((a, b) => b[1].reps - a[1].reps).slice(0, 4).forEach(([k, v]) => out.push({ k, v: v.reps + ' reps', d: shortDate(v.t) })); }
    return out;
  },
  extra(L, id) {
    if (id === 'futebol') { const w = L.filter(a => a.scoreFor > a.scoreAgainst).length, d = L.filter(a => a.scoreFor === a.scoreAgainst && a.scoreFor != null).length, l = L.filter(a => a.scoreFor < a.scoreAgainst).length;
      return { goals: L.reduce((s, a) => s + (a.goals || 0), 0), assists: L.reduce((s, a) => s + (a.assists || 0), 0), w, d, l, last: L[0] || null }; }
    if (id === 'natacao') { const st = {}; L.forEach(a => { const k = a.stroke || 'Livre'; st[k] = (st[k] || 0) + (a.distance || 0); }); const tot = Object.values(st).reduce((a, b) => a + b, 0) || 1; return { strokes: Object.entries(st).map(([k, v]) => [k, v / tot]).sort((a, b) => b[1] - a[1]) }; }
    if (id === 'boxe') return { rounds: L.reduce((s, a) => s + (a.rounds || 0), 0), time: L.reduce((s, a) => s + (a.duration || 0), 0) };
    if (id === 'musculacao') { const sets = L.reduce((s, a) => s + (a.sets || []).length, 0); return { sets }; }
    if (id === 'corrida' || id === 'ciclismo') { const last = L.find(a => a.splits && a.splits.length); return { splits: last ? last.splits : [] }; }
    return {};
  },
  achievements(acts, me) {
    const run = acts.filter(a => a.sport === 'corrida').reduce((s, a) => s + (a.distance || 0), 0) / 1000;
    const sports = new Set(acts.map(a => a.sport)).size; const streak = Stats.streak(acts);
    const lift = acts.filter(a => a.sport === 'musculacao').length;
    return [
      ['Primeira atividade', 'bolt', acts.length >= 1, Math.min(1, acts.length)],
      ['3 dias seguidos', 'flame', streak >= 3, Math.min(1, streak / 3)], ['7 dias seguidos', 'flame', streak >= 7, Math.min(1, streak / 7)],
      ['10 treinos de força', 'dumbbell', lift >= 10, Math.min(1, lift / 10)], ['50 km corridos', 'route', run >= 50, Math.min(1, run / 50)],
      ['Multiatleta (3 esportes)', 'grid', sports >= 3, Math.min(1, sports / 3)], ['Primeiro post', 'share', (me.postsCount || 0) >= 1, Math.min(1, me.postsCount || 0)],
      ['Desafiante', 'trophy', API.joined.length >= 1, Math.min(1, API.joined.length)], ['Social (10 seguidores)', 'users', (me.followersCount || 0) >= 10, Math.min(1, (me.followersCount || 0) / 10)],
    ];
  },
};
function round1(v) { return Math.round(v * 100) / 100; }
function maxBy(L, f) { let b = null, bv = -Infinity; L.forEach(x => { const v = f(x); if (v > bv) { bv = v; b = x; } }); return b; }
function minBy(L, f) { let b = null, bv = Infinity; L.forEach(x => { const v = f(x); if (v < bv) { bv = v; b = x; } }); return b; }
const volStr = v => (v = v || 0) >= 1000 ? fmt(v / 1000, 1) + ' t' : fmt(v) + ' kg';
const statLine = (sid, a) => {
  if (!a) return '';
  if (sid === 'musculacao') return `${(a.sets || []).length} séries · ${volStr(a.volume)} · ${hms(a.duration)}`;
  if (sid === 'corrida') return `${fmt((a.distance || 0) / 1000, 2)} km · ${hms(a.duration)} · ${paceOf(a.duration, a.distance)}/km`;
  if (sid === 'ciclismo') return `${fmt((a.distance || 0) / 1000, 1)} km · ${hms(a.duration)} · ${fmt((a.distance || 0) / Math.max(1, a.duration) * 3.6, 1)} km/h`;
  if (sid === 'natacao') return `${fmt(a.distance || 0)} m · ${a.laps || 0} voltas · ${hms(a.duration)}`;
  if (sid === 'boxe') return `${a.rounds || 0} rounds · ${hms(a.duration)}`;
  if (sid === 'futebol') return `${a.scoreFor ?? '-'} × ${a.scoreAgainst ?? '-'} · ${a.goals || 0} G · ${a.assists || 0} A`;
  if (sid === 'calistenia') return `${a.reps || 0} reps · ${(a.blocks || []).length} blocos · ${hms(a.duration)}`;
  return hms(a.duration);
};
const postStats = a => {
  const s = a.sport;
  if (s === 'musculacao') return [['Volume', volStr(a.volume)], ['Séries', String((a.sets || []).length)], ['Duração', hms(a.duration)]];
  if (s === 'corrida') return [['Distância', fmt((a.distance || 0) / 1000, 2) + ' km'], ['Tempo', hms(a.duration)], ['Pace', paceOf(a.duration, a.distance) + '/km']];
  if (s === 'ciclismo') return [['Distância', fmt((a.distance || 0) / 1000, 1) + ' km'], ['Tempo', hms(a.duration)], ['Vel. média', fmt((a.distance || 0) / Math.max(1, a.duration) * 3.6, 1) + ' km/h']];
  if (s === 'natacao') return [['Distância', fmt(a.distance || 0) + ' m'], ['Voltas', String(a.laps || 0)], ['Tempo', hms(a.duration)]];
  if (s === 'boxe') return [['Rounds', String(a.rounds || 0)], ['Duração', hms(a.duration)], ['Tipo', a.title || 'Treino']];
  if (s === 'futebol') return [['Placar', `${a.scoreFor ?? 0} × ${a.scoreAgainst ?? 0}`], ['Gols', String(a.goals || 0)], ['Assist.', String(a.assists || 0)]];
  return [['Repetições', String(a.reps || 0)], ['Blocos', String((a.blocks || []).length)], ['Duração', hms(a.duration)]];
};

/* Estatísticas que vão para publicações (respeita 'mostrar cargas') */
const publicStats = a => { const s = postStats(a); if (a.sport === 'musculacao' && !((API.me && API.me.privacy) || {}).showWeight) s[0] = ['Exercícios', String(new Set((a.sets || []).map(x => x.ex)).size || '—')]; return s; };
