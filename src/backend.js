/* ============================================================
   ORA GYM — camada de dados
   Produção: Firebase Auth + Cloud Firestore (src/firebase.js carrega o SDK).
   Testes locais (file:// ou ?local=1 em localhost): adaptador em localStorage.
   ============================================================ */
const uid6 = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const INC = n => ({ __inc: n });

/* ---------------- Adaptador Firestore ---------------- */
function firestoreAdapter(F) {
  const { db, fs } = F;
  const out = d => { if (!d) return null; const o = {}; for (const [k, v] of Object.entries(d)) o[k] = v && typeof v.toMillis === 'function' ? v.toMillis() : v; return o; };
  const inp = data => { const o = {}; for (const [k, v] of Object.entries(data)) o[k] = v && v.__inc !== undefined ? fs.increment(v.__inc) : v; return o; };
  const ref = p => fs.doc(db, p);
  return {
    async get(p) { const s = await fs.getDoc(ref(p)); return s.exists() ? { id: s.id, ...out(s.data()) } : null; },
    async set(p, data, merge = true) { await fs.setDoc(ref(p), inp(data), { merge }); },
    async create(p, data) { await fs.setDoc(ref(p), inp(data)); },
    async update(p, data) { await fs.updateDoc(ref(p), inp(data)); },
    async add(col, data) { const r = await fs.addDoc(fs.collection(db, col), inp(data)); return r.id; },
    async del(p) { await fs.deleteDoc(ref(p)); },
    async query(col, { where = [], order = null, limit = 50, after = null } = {}) {
      const parts = where.map(([f, op, v]) => fs.where(f, op, v));
      if (order) parts.push(fs.orderBy(order[0], order[1] || 'asc'));
      if (after != null && order) parts.push(fs.startAfter(after));
      parts.push(fs.limit(limit));
      const s = await fs.getDocs(fs.query(fs.collection(db, col), ...parts));
      return s.docs.map(d => ({ id: d.id, ...out(d.data()) }));
    },
    async count(col, where = []) { try { const s = await fs.getCountFromServer(fs.query(fs.collection(db, col), ...where.map(([f, op, v]) => fs.where(f, op, v)))); return s.data().count; } catch (e) { return null; } },
    async batch(ops) { const b = fs.writeBatch(db); ops.forEach(([op, p, d]) => op === 'del' ? b.delete(ref(p)) : op === 'set' ? b.set(ref(p), inp(d), { merge: true }) : b.update(ref(p), inp(d))); await b.commit(); },
  };
}

/* ---------------- Adaptador local (somente testes) ---------------- */
function localAdapter() {
  const KEY = 'oragym.localdb'; let T = {};
  try { T = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(T)); } catch (e) {} };
  const apply = (prev, data) => { const o = { ...(prev || {}) }; for (const [k, v] of Object.entries(data)) o[k] = v && v.__inc !== undefined ? (o[k] || 0) + v.__inc : v; return o; };
  const colOf = p => p.split('/').slice(0, -1).join('/');
  const cmp = (a, op, b) => op === '==' ? a === b : op === '!=' ? a !== b : op === '>=' ? a >= b : op === '<=' ? a <= b : op === '>' ? a > b : op === '<' ? a < b : op === 'in' ? b.includes(a) : op === 'array-contains' ? (a || []).includes(b) : false;
  return {
    async get(p) { return T[p] ? { id: p.split('/').pop(), ...T[p] } : null; },
    async set(p, data, merge = true) { T[p] = apply(merge ? T[p] : {}, data); save(); },
    async create(p, data) { if (T[p]) throw Object.assign(new Error('exists'), { code: 'permission-denied' }); T[p] = apply({}, data); save(); },
    async update(p, data) { if (!T[p]) throw Object.assign(new Error('not-found'), { code: 'not-found' }); T[p] = apply(T[p], data); save(); },
    async add(col, data) { const id = uid6(); T[col + '/' + id] = apply({}, data); save(); return id; },
    async del(p) { delete T[p]; save(); },
    async query(col, { where = [], order = null, limit = 50, after = null } = {}) {
      let rows = Object.entries(T).filter(([p]) => colOf(p) === col).map(([p, d]) => ({ id: p.split('/').pop(), ...d }));
      rows = rows.filter(r => where.every(([f, op, v]) => cmp(r[f], op, v)));
      if (order) { const [f, dir] = order; rows.sort((a, b) => (a[f] > b[f] ? 1 : a[f] < b[f] ? -1 : 0) * (dir === 'desc' ? -1 : 1)); if (after != null) rows = rows.filter(r => dir === 'desc' ? r[f] < after : r[f] > after); }
      return rows.slice(0, limit);
    },
    async count(col, where = []) { return (await this.query(col, { where, limit: 1e6 })).length; },
    async batch(ops) { for (const [op, p, d] of ops) op === 'del' ? delete T[p] : (T[p] = apply(T[p], d)); save(); },
    _wipe() { T = {}; save(); },
  };
}
function localAuth() {
  const KEY = 'oragym.localauth'; let S = {}; try { S = JSON.parse(localStorage.getItem(KEY) || '{"users":{},"cur":null}'); } catch (e) { S = { users: {}, cur: null }; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  let cb = () => {};
  const err = code => Object.assign(new Error(code), { code });
  const user = () => S.cur ? { uid: S.cur, email: S.users[S.cur].email, displayName: S.users[S.cur].name } : null;
  return {
    onChange(f) { cb = f; setTimeout(() => f(user()), 0); },
    current: user,
    async signUp(name, email, pass) { if (Object.values(S.users).some(u => u.email === email)) throw err('auth/email-already-in-use'); const id = 'u' + uid6(); S.users[id] = { email, pass, name }; S.cur = id; save(); cb(user()); return user(); },
    async signIn(email, pass) { const e = Object.entries(S.users).find(([, u]) => u.email === email); if (!e || e[1].pass !== pass) throw err('auth/invalid-credential'); S.cur = e[0]; save(); cb(user()); return user(); },
    async google() { throw err('auth/operation-not-supported-in-this-environment'); },
    async reset() { return true; },
    async signOut() { S.cur = null; save(); cb(null); },
    async deleteUser() { delete S.users[S.cur]; S.cur = null; save(); cb(null); },
  };
}
function firebaseAuth(F) {
  const { auth, au } = F;
  return {
    onChange(f) { au.onAuthStateChanged(auth, u => f(u ? { uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL } : null)); },
    current: () => auth.currentUser,
    async signUp(name, email, pass) { const c = await au.createUserWithEmailAndPassword(auth, email, pass); try { await au.updateProfile(c.user, { displayName: name }); } catch (e) {} return c.user; },
    async signIn(email, pass) { return (await au.signInWithEmailAndPassword(auth, email, pass)).user; },
    async google() { const p = new au.GoogleAuthProvider(); try { return (await au.signInWithPopup(auth, p)).user; } catch (e) { if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') { await au.signInWithRedirect(auth, p); return null; } throw e; } },
    async reset(email) { await au.sendPasswordResetEmail(auth, email); return true; },
    async signOut() { await au.signOut(auth); },
    async deleteUser() { await au.deleteUser(auth.currentUser); },
  };
}
const AUTH_ERR = {
  'auth/email-already-in-use': 'Este e-mail já tem conta. Toque em "Entrar".', 'auth/invalid-email': 'E-mail inválido.', 'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.', 'auth/wrong-password': 'E-mail ou senha incorretos.', 'auth/user-not-found': 'Não encontramos conta com este e-mail.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.', 'auth/network-request-failed': 'Sem conexão. Verifique sua internet.', 'auth/popup-closed-by-user': 'Login com Google cancelado.',
  'auth/requires-recent-login': 'Por segurança, saia e entre de novo antes de excluir a conta.', 'auth/operation-not-supported-in-this-environment': 'Login com Google indisponível neste ambiente.',
  'auth/unauthorized-domain': 'Este domínio não está autorizado no Firebase (Authentication › Configurações › Domínios autorizados).', 'permission-denied': 'Sem permissão para esta ação.',
};
const DB_ERR = {
  'failed-precondition': 'Estamos preparando esta parte do app. Tente de novo em alguns minutos.',
  'permission-denied': 'Você não tem permissão para ver ou alterar isso.',
  'unavailable': 'Sem conexão no momento. Verifique a internet e tente de novo.',
  'deadline-exceeded': 'A conexão está lenta. Tente de novo.',
  'resource-exhausted': 'Muitas solicitações agora. Aguarde um pouco e tente de novo.',
  'unauthenticated': 'Sua sessão expirou. Entre de novo.',
  'not-found': 'Não encontrado.',
};
const isIndexErr = e => !!(e && (e.code === 'failed-precondition' || /requires an index/i.test(e.message || '')));
const errMsg = e => { if (e && !AUTH_ERR[e.code]) console.warn('[OraGym]', e.code || '', e.message || e);
  return AUTH_ERR[e && e.code] || DB_ERR[e && e.code] || (isIndexErr(e) ? DB_ERR['failed-precondition'] : null) || (e && typeof e.message === 'string' && /[áéíóúâêôãõç]/i.test(e.message) && !/firebase|firestore|query|index/i.test(e.message) ? e.message : 'Algo deu errado. Tente novamente.'); };

/* ---------------- API do app ---------------- */
const API = (() => {
  let D = null, AU = null, mode = 'none';
  const st = { me: null, acts: [], workouts: [], following: new Set(), joined: [], liked: new Set(), imgCache: {} };
  const uid = () => st.me && st.me.id;
  const strip = o => { const r = {}; for (const [k, v] of Object.entries(o)) if (v !== undefined) r[k] = v; return r; };
  const normHandle = h => (h || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9._]/g, '').replace(/^\.+|\.+$/g, '').slice(0, 24);

  async function init() {
    const local = location.protocol === 'file:' || (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && /[?&]local=1/.test(location.search));
    if (local) { D = localAdapter(); AU = localAuth(); mode = 'local'; return mode; }
    const F = await (window.FB_READY || new Promise(r => { const t0 = Date.now(); const t = setInterval(() => { if (window.FB_READY || Date.now() - t0 > 15000) { clearInterval(t); r(window.FB_READY || null); } }, 20); })); if (!F) { mode = window.FB_ERR === 'noconfig' ? 'unconfigured' : 'error'; return mode; }
    D = firestoreAdapter(F); AU = firebaseAuth(F); mode = 'firebase'; return mode;
  }

  /* ---- sessão ---- */
  async function loadSession(u) {
    st.me = null; st.acts = []; st.workouts = []; st.following = new Set(); st.joined = []; st.liked = new Set();
    if (!u) return null;
    let p = await D.get('users/' + u.uid);
    st.me = p || { id: u.uid, email: u.email, name: u.displayName || '', _new: true };
    if (p) await Promise.all([loadActs(), loadWorkouts(), loadFollowing(), loadJoined()]);
    return st.me;
  }
  async function loadActs() { st.acts = await D.query(`users/${uid()}/activities`, { order: ['startedAt', 'desc'], limit: 1000 }); }
  async function loadWorkouts() { st.workouts = await D.query(`users/${uid()}/workouts`, { order: ['ts', 'asc'], limit: 50 }); }
  async function loadFollowing() { const r = await D.query(`users/${uid()}/following`, { limit: 500 }); st.following = new Set(r.map(x => x.id)); }
  async function loadJoined() { st.joined = (await D.query(`users/${uid()}/joined`, { limit: 100 })).map(x => x.id); }

  /* ---- perfil ---- */
  async function createProfile({ name, handle, sports, goals, level }) {
    const h = normHandle(handle) || normHandle(name) || 'atleta';
    let hh = h; for (let i = 0; i < 6; i++) { const ex = await D.get('handles/' + hh); if (!ex) break; hh = h + Math.floor(Math.random() * 900 + 100); }
    await D.create('handles/' + hh, { uid: uid() });
    const prof = { name: name.trim(), handle: hh, nameLower: name.trim().toLowerCase(), email: st.me.email || '', sports, goals, level: level || 'Intermediário', bio: '', avatar: null, private: false,
      privacy: { hideRouteEnds: true, showWeight: false }, weekly: {}, followersCount: 0, followingCount: 0, postsCount: 0, createdAt: Date.now() };
    await D.set('users/' + uid(), prof, false); st.me = { id: uid(), ...prof }; return st.me;
  }
  async function updateProfile(patch) {
    if (patch.handle !== undefined) { const h = normHandle(patch.handle); if (!h) throw new Error('Usuário inválido'); if (h !== st.me.handle) { const ex = await D.get('handles/' + h); if (ex && ex.uid !== uid()) throw new Error('Esse @ já está em uso.'); await D.create('handles/' + h, { uid: uid() }); await D.del('handles/' + st.me.handle).catch(() => {}); } patch.handle = h; }
    if (patch.name) patch.nameLower = patch.name.toLowerCase();
    await D.set('users/' + uid(), strip(patch)); Object.assign(st.me, patch); return st.me;
  }
  const getUser = id => id === uid() ? Promise.resolve(st.me) : D.get('users/' + id);

  /* ---- imagens (comprimidas, guardadas no Firestore) ---- */
  async function putImage(dataUrl) { const id = await D.add('images', { owner: uid(), data: dataUrl, ts: Date.now() }); st.imgCache[id] = dataUrl; return id; }
  async function getImage(id) { if (!id) return null; if (st.imgCache[id]) return st.imgCache[id]; const d = await D.get('images/' + id); const v = d ? d.data : null; st.imgCache[id] = v; return v; }

  /* ---- atividades ---- */
  async function addActivity(a) {
    const doc = strip({ ...a, uid: uid(), ts: Date.now() }); const id = await D.add(`users/${uid()}/activities`, doc);
    const full = { id, ...doc }; st.acts.unshift(full); st.acts.sort((x, y) => y.startedAt - x.startedAt);
    await syncChallenges(a.sport).catch(() => {}); return full;
  }
  async function removeActivity(id) { await D.del(`users/${uid()}/activities/${id}`); st.acts = st.acts.filter(a => a.id !== id); await syncChallenges().catch(() => {}); }
  const activitiesOf = async id => id === uid() ? st.acts : D.query(`users/${id}/activities`, { order: ['startedAt', 'desc'], limit: 200 });

  /* ---- fichas ---- */
  async function saveWorkout(w) { const data = strip({ name: w.name, focus: w.focus || '', exercises: w.exercises || [], ts: w.ts || Date.now() });
    if (w.id) { await D.set(`users/${uid()}/workouts/${w.id}`, data); const i = st.workouts.findIndex(x => x.id === w.id); st.workouts[i] = { id: w.id, ...data }; return st.workouts[i]; }
    const id = await D.add(`users/${uid()}/workouts`, data); const n = { id, ...data }; st.workouts.push(n); return n; }
  async function removeWorkout(id) { await D.del(`users/${uid()}/workouts/${id}`); st.workouts = st.workouts.filter(w => w.id !== id); }

  /* ---- posts, curtidas, comentários ---- */
  async function createPost({ sport, text, image, activity }) {
    const imageId = image ? await putImage(image) : null;
    const doc = strip({ authorId: uid(), author: { name: st.me.name, handle: st.me.handle, avatar: st.me.avatar || null }, sport, text: (text || '').slice(0, 2000), imageId, activity: activity || null,
      visibility: st.me.private ? 'followers' : 'public', ts: Date.now(), likeCount: 0, commentCount: 0 });
    const id = await D.add('posts', doc); await D.set('users/' + uid(), { postsCount: INC(1) }); st.me.postsCount = (st.me.postsCount || 0) + 1; return { id, ...doc };
  }
  async function feed({ sport = 'all', scope = 'all', after = null } = {}) {
    let rows;
    if (scope === 'following') { const ids = [...st.following, uid()].slice(0, 30); rows = await D.query('posts', { where: [['authorId', 'in', ids], ['visibility', '==', 'public'], ...(sport !== 'all' ? [['sport', '==', sport]] : [])], order: ['ts', 'desc'], limit: 20, after }); }
    else rows = await D.query('posts', { where: [['visibility', '==', 'public'], ...(sport !== 'all' ? [['sport', '==', sport]] : [])], order: ['ts', 'desc'], limit: 20, after });
    await markLiked(rows); return rows;
  }
  async function postsBy(id) { const where = [['authorId', '==', id]]; if (id !== uid()) where.push(['visibility', '==', 'public']); const rows = await D.query('posts', { where, order: ['ts', 'desc'], limit: 30 }); await markLiked(rows); return rows; }
  async function setPostsVisibility(v) { const rows = await D.query('posts', { where: [['authorId', '==', uid()]], limit: 500 }); for (const r of rows) if (r.visibility !== v) await D.update('posts/' + r.id, { visibility: v }).catch(() => {}); }
  async function markLiked(rows) { await Promise.all(rows.filter(p => !st.liked.has(p.id)).map(async p => { const l = await D.get(`posts/${p.id}/likes/${uid()}`).catch(() => null); if (l) st.liked.add(p.id); })); }
  async function like(p) { await D.create(`posts/${p.id}/likes/${uid()}`, { ts: Date.now() }); await D.update('posts/' + p.id, { likeCount: INC(1) }); st.liked.add(p.id); if (p.authorId !== uid()) notify(p.authorId, { type: 'like', postId: p.id }); }
  async function unlike(p) { await D.del(`posts/${p.id}/likes/${uid()}`); await D.update('posts/' + p.id, { likeCount: INC(-1) }); st.liked.delete(p.id); }
  async function comments(pid) { return D.query(`posts/${pid}/comments`, { order: ['ts', 'asc'], limit: 100 }); }
  async function comment(p, text) { const doc = { uid: uid(), name: st.me.name, handle: st.me.handle, avatar: st.me.avatar || null, text: text.slice(0, 600), ts: Date.now() };
    const id = await D.add(`posts/${p.id}/comments`, doc); await D.update('posts/' + p.id, { commentCount: INC(1) }); if (p.authorId !== uid()) notify(p.authorId, { type: 'comment', postId: p.id, text: doc.text.slice(0, 80) }); return { id, ...doc }; }
  async function removePost(p) { await D.del('posts/' + p.id); if (p.imageId) D.del('images/' + p.imageId).catch(() => {}); await D.set('users/' + uid(), { postsCount: INC(-1) }); }

  /* ---- seguidores ---- */
  async function follow(id) { await D.batch([['set', `users/${uid()}/following/${id}`, { ts: Date.now() }], ['set', `users/${id}/followers/${uid()}`, { ts: Date.now() }], ['update', 'users/' + uid(), { followingCount: INC(1) }], ['update', 'users/' + id, { followersCount: INC(1) }]]);
    st.following.add(id); st.me.followingCount = (st.me.followingCount || 0) + 1; notify(id, { type: 'follow' }); }
  async function unfollow(id) { await D.batch([['del', `users/${uid()}/following/${id}`], ['del', `users/${id}/followers/${uid()}`], ['update', 'users/' + uid(), { followingCount: INC(-1) }], ['update', 'users/' + id, { followersCount: INC(-1) }]]);
    st.following.delete(id); st.me.followingCount = Math.max(0, (st.me.followingCount || 1) - 1); }
  async function searchUsers(q) { q = (q || '').trim().toLowerCase().replace(/^@/, ''); if (!q) return [];
    const [a, b] = await Promise.all([D.query('users', { where: [['handle', '>=', q], ['handle', '<=', q + '']], limit: 15 }), D.query('users', { where: [['nameLower', '>=', q], ['nameLower', '<=', q + '']], limit: 15 })]);
    const m = new Map(); [...a, ...b].forEach(u => m.set(u.id, u)); return [...m.values()].filter(u => u.id !== uid()); }
  async function suggestions() { const r = await D.query('users', { order: ['createdAt', 'desc'], limit: 20 }); return r.filter(u => u.id !== uid() && !st.following.has(u.id)).slice(0, 10); }

  /* ---- notificações ---- */
  async function notify(to, n) { try { await D.add(`users/${to}/notifications`, { ...n, from: uid(), fromName: st.me.name, fromHandle: st.me.handle, fromAvatar: st.me.avatar || null, ts: Date.now(), read: false }); } catch (e) {} }
  const notifications = () => D.query(`users/${uid()}/notifications`, { order: ['ts', 'desc'], limit: 40 });
  async function markNotifsRead(list) { await Promise.all(list.filter(n => !n.read).map(n => D.update(`users/${uid()}/notifications/${n.id}`, { read: true }).catch(() => {}))); }

  /* ---- desafios ---- */
  async function createChallenge(c) {
    const doc = strip({ name: c.name, sport: c.sport, metric: c.metric, unit: c.unit, target: +c.target, start: c.start, end: c.end, visibility: c.visibility, ownerId: uid(), ownerName: st.me.name, memberCount: 0, ts: Date.now() });
    const id = await D.add('challenges', doc); await join({ id, ...doc }); return { id, ...doc };
  }
  const listChallenges = () => D.query('challenges', { where: [['visibility', '==', 'public']], order: ['ts', 'desc'], limit: 40 });
  const getChallenge = id => D.get('challenges/' + id);
  async function myChallenges() { const rows = await Promise.all(st.joined.map(id => D.get('challenges/' + id).catch(() => null))); return rows.filter(Boolean); }
  async function join(c) { const prog = progressFor(c);
    await D.set(`challenges/${c.id}/members/${uid()}`, { name: st.me.name, handle: st.me.handle, avatar: st.me.avatar || null, progress: prog, joinedAt: Date.now() }, false);
    await D.set(`users/${uid()}/joined/${c.id}`, { ts: Date.now() }, false); await D.update('challenges/' + c.id, { memberCount: INC(1) }).catch(() => {});
    if (!st.joined.includes(c.id)) st.joined.push(c.id); }
  async function leave(c) { await D.del(`challenges/${c.id}/members/${uid()}`); await D.del(`users/${uid()}/joined/${c.id}`); await D.update('challenges/' + c.id, { memberCount: INC(-1) }).catch(() => {}); st.joined = st.joined.filter(x => x !== c.id); }
  const members = id => D.query(`challenges/${id}/members`, { order: ['progress', 'desc'], limit: 100 });
  async function removeChallenge(c) { await D.del('challenges/' + c.id); await D.del(`users/${uid()}/joined/${c.id}`).catch(() => {}); st.joined = st.joined.filter(x => x !== c.id); }
  function progressFor(c) { return Stats.challengeProgress(st.acts, c); }
  async function syncChallenges(sport) { const list = await myChallenges(); await Promise.all(list.filter(c => !sport || c.sport === sport).map(c => D.set(`challenges/${c.id}/members/${uid()}`, { progress: progressFor(c), name: st.me.name, avatar: st.me.avatar || null }))); }

  /* ---- nutrição ---- */
  const day = d => D.get(`users/${uid()}/days/${d}`);
  const setDay = (d, patch) => D.set(`users/${uid()}/days/${d}`, patch);

  /* ---- LGPD ---- */
  async function exportData() { const days = await D.query(`users/${uid()}/days`, { limit: 400 }); const posts = await postsBy(uid());
    return { perfil: st.me, atividades: st.acts, fichas: st.workouts, seguindo: [...st.following], desafios: st.joined, nutricao: days, posts }; }
  async function deleteAccount() {
    const me = uid(); const posts = await D.query('posts', { where: [['authorId', '==', me]], limit: 500 });
    for (const p of posts) { await D.del('posts/' + p.id).catch(() => {}); if (p.imageId) await D.del('images/' + p.imageId).catch(() => {}); }
    for (const sub of ['activities', 'workouts', 'following', 'followers', 'joined', 'notifications', 'days']) { const rows = await D.query(`users/${me}/${sub}`, { limit: 1000 }).catch(() => []); for (const r of rows) await D.del(`users/${me}/${sub}/${r.id}`).catch(() => {}); }
    for (const cid of st.joined) await D.del(`challenges/${cid}/members/${me}`).catch(() => {});
    if (st.me.avatar) await D.del('images/' + st.me.avatar).catch(() => {});
    await D.del('handles/' + st.me.handle).catch(() => {}); await D.del('users/' + me);
    await AU.deleteUser();
  }

  return {
    init, get mode() { return mode; }, auth: { onChange: f => AU.onChange(f), signUp: (...a) => AU.signUp(...a), signIn: (...a) => AU.signIn(...a), google: () => AU.google(), reset: e => AU.reset(e), signOut: () => AU.signOut() },
    loadSession, createProfile, updateProfile, getUser, putImage, getImage, removeImage: id => D.del('images/' + id), normHandle,
    get me() { return st.me; }, get acts() { return st.acts; }, get workouts() { return st.workouts; }, get following() { return st.following; }, get joined() { return st.joined; }, isLiked: id => st.liked.has(id),
    addActivity, removeActivity, activitiesOf, saveWorkout, removeWorkout,
    createPost, feed, postsBy, setPostsVisibility, like, unlike, comments, comment, removePost,
    follow, unfollow, searchUsers, suggestions, followersOf: id => D.query(`users/${id}/followers`, { limit: 200 }), followingOf: id => D.query(`users/${id}/following`, { limit: 200 }),
    notifications, markNotifsRead, createChallenge, listChallenges, getChallenge, myChallenges, join, leave, members, removeChallenge, syncChallenges,
    day, setDay, exportData, deleteAccount, refreshActs: loadActs,
  };
})();

/* ---------------- Imagens: redimensiona e comprime no navegador ---------------- */
function fileToDataUrl(file, max = 1280, q = .74) {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); let d = c.toDataURL('image/jpeg', q); if (d.length > 900000) d = c.toDataURL('image/jpeg', .55); res(d); };
    img.onerror = () => rej(new Error('Imagem inválida')); img.src = url;
  });
}
function chooseImage(max, q) { return new Promise(res => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = async () => { const f = i.files && i.files[0]; if (!f) return res(null); try { res(await fileToDataUrl(f, max, q)); } catch (e) { toast('Não foi possível ler a imagem', 'x'); res(null); } }; i.click(); }); }
