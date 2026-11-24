/* ============================================================
   ORA GYM — Comunidade (feed real), perfis de usuários e Desafios
   ============================================================ */
var socialFilter = 'all'; let socialScope = 'all';
const postCache = new Map();

function postVisual(p) {
  const sp = SPORTS[p.sport] || SPORTS.musculacao;
  if (p.imageId) return `<img data-img="${p.imageId}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#151515"><div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(11,11,11,.9))"></div>`;
  if (p.activity && p.activity.route && p.activity.route.length > 1) return `<div style="position:absolute;inset:0">${routeSVG(p.activity.route, { color: sp.c })}</div><div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(11,11,11,.9))"></div>`;
  const k = [...String(p.id)].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return `<div style="position:absolute;inset:0">${scene('post', p.sport, { i: k, sm: true, fade: 'background:linear-gradient(180deg,transparent 30%,rgba(11,11,11,.92))' })}</div>`;
}
function postCard(p, compact = false) {
  postCache.set(p.id, p); const sp = SPORTS[p.sport] || SPORTS.musculacao; const liked = API.isLiked(p.id); const mine = p.authorId === API.me.id; const A2 = p.activity;
  const media = A2 || p.imageId;
  return `<article class="post" data-post="${p.id}" style="margin-bottom:${compact ? 0 : 26}px">
    <header class="between" style="margin-bottom:12px"><button class="row" style="gap:10px;text-align:left" data-profile="${p.authorId}">${avatar(p.author)}<div><div class="h3">${esc(p.author.name)}</div><div class="muted small">@${esc(p.author.handle)} · ${sp.name} · ${ago(p.ts)}</div></div></button>
      ${mine ? `<button class="icon-btn" data-pmore="${p.id}" aria-label="Opções do post">${icon('more', 20)}</button>` : (API.following.has(p.authorId) ? '' : `<button class="chip on" style="height:32px;font-size:12px" data-follow="${p.authorId}">Seguir</button>`)}</header>
    ${media ? `<div class="post-media" style="position:relative;height:${compact ? 250 : 340}px;border-radius:28px;overflow:hidden;border:1px solid var(--stroke)" data-dbl="${p.id}">
      ${postVisual(p)}
      ${A2 && A2.pr ? `<div style="position:absolute;left:14px;top:14px"><span class="tag neon">${icon('medal', 13, 2)}Recorde pessoal</span></div>` : ''}
      ${A2 ? `<div style="position:absolute;left:16px;right:16px;bottom:16px"><div class="display" style="font-size:22px;margin-bottom:12px;color:#fff">${esc(A2.title || sp.name)}</div>
        <div class="glass" style="border-radius:20px;padding:12px 6px;display:grid;grid-template-columns:repeat(${A2.stats.length},1fr);text-align:center">${A2.stats.map((x, i) => `<div style="${i ? 'border-left:1px solid var(--stroke)' : ''};padding:0 4px"><div class="num" style="font-size:17px;white-space:nowrap;color:#fff">${esc(x[1])}</div><div class="muted" style="font-size:10.5px;margin-top:2px">${esc(x[0])}</div></div>`).join('')}</div></div>` : ''}</div>` : ''}
    <div class="between" style="margin-top:10px"><div class="row" style="gap:2px">
      <button class="icon-btn ${liked ? 'liked' : ''}" data-like="${p.id}" aria-label="Curtir" aria-pressed="${liked}">${icon(liked ? 'heartFill' : 'heart', 23)}</button><span class="small" style="font-weight:600;min-width:24px" data-likes="${p.id}">${fmt(p.likeCount || 0)}</span>
      <button class="icon-btn" data-comments="${p.id}" aria-label="Comentários">${icon('comment', 22)}</button><span class="small muted" style="font-weight:600" data-ccount="${p.id}">${fmt(p.commentCount || 0)}</span>
      <button class="icon-btn" data-sharepost="${p.id}" aria-label="Compartilhar">${icon('share', 21)}</button></div></div>
    ${p.text ? `<p style="margin:4px 4px 0;font-size:14px;line-height:1.5;white-space:pre-wrap"><b>${esc(p.author.name.split(' ')[0])}</b> <span style="color:#D3DCE8">${esc(p.text)}</span></p>` : ''}</article>`;
}
function wirePosts(root) {
  if (root._postsWired) return; root._postsWired = true;
  const toggleLike = async (id, burst) => { const p = postCache.get(id); if (!p || root._busyLike) return; root._busyLike = true; const on = !API.isLiked(id);
    try { on ? await API.like(p) : await API.unlike(p); p.likeCount = Math.max(0, (p.likeCount || 0) + (on ? 1 : -1)); haptic(on ? [8, 30, 8] : 5);
      $$(`[data-like="${id}"]`, root).forEach(b => { b.classList.toggle('liked', on); b.setAttribute('aria-pressed', on); b.innerHTML = icon(on ? 'heartFill' : 'heart', 23); A($('svg', b), [{ transform: 'scale(.4)' }, { transform: 'scale(1.25)', offset: .5 }, { transform: 'none' }], { duration: 520, easing: 'out' }); });
      $$(`[data-likes="${id}"]`, root).forEach(n => n.textContent = fmt(p.likeCount)); if (burst && on) heartBurst(id);
    } catch (x) { toast(errMsg(x), 'x'); } root._busyLike = false; };
  const heartBurst = id => { const m = $(`[data-dbl="${id}"]`, root); if (!m) return; const h = document.createElement('div'); h.className = 'heart-burst'; h.innerHTML = icon('heartFill', 96); m.appendChild(h);
    A(h, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: .35 }, { transform: 'scale(1)', opacity: 1, offset: .7 }, { transform: 'scale(1.3) translateY(-30px)', opacity: 0 }], { duration: 900, easing: 'out' }).finished.then(() => h.remove()); };
  let lastTap = {};
  root.addEventListener('click', async e => {
    const t = e.target;
    const l = t.closest('[data-like]'); if (l) return toggleLike(l.dataset.like);
    const d = t.closest('[data-dbl]'); if (d) { const id = d.dataset.dbl; const now = Date.now(); if (now - (lastTap[id] || 0) < 320) { if (!API.isLiked(id)) toggleLike(id, true); else heartBurst(id); lastTap[id] = 0; } else lastTap[id] = now; return; }
    const c = t.closest('[data-comments]'); if (c) return commentsSheet(postCache.get(c.dataset.comments), root);
    const sh = t.closest('[data-sharepost]'); if (sh) { const p = postCache.get(sh.dataset.sharepost); return shareSheet(`${p.activity ? p.activity.title : 'Post'} — ${p.author.name}`, p.activity ? p.activity.stats.map(s => s[1]).join(' · ') : (p.text || ''), location.origin + location.pathname); }
    const f = t.closest('[data-follow]'); if (f) { const id = f.dataset.follow; f.disabled = true; try { await API.follow(id); $$(`[data-follow="${id}"]`, root).forEach(x => x.remove()); toast('Seguindo'); } catch (x) { f.disabled = false; toast(errMsg(x), 'x'); } return; }
    const pr = t.closest('[data-profile]'); if (pr) { const id = pr.dataset.profile; if (id === API.me.id) Nav.go('profile'); else Nav.push('user', { id }); return; }
    const m = t.closest('[data-pmore]'); if (m) { const p = postCache.get(m.dataset.pmore); if (await confirmDialog('Excluir post?', 'O post, as curtidas e os comentários somem para todos.', 'Excluir', true)) { try { await API.removePost(p); $(`[data-post="${p.id}"]`, root).remove(); toast('Post excluído', 'trash'); } catch (x) { toast(errMsg(x), 'x'); } } }
  });
}
async function commentsSheet(p, root) {
  if (!p) return;
  const row = c => `<div class="row" style="align-items:flex-start;gap:10px;margin-bottom:14px">${avatar(c, 'sm')}<div><div class="small"><b>${esc(c.name.split(' ')[0])}</b> <span style="color:#D3DCE8">${esc(c.text)}</span></div><div class="muted" style="font-size:11px;margin-top:3px">${ago(c.ts)}</div></div></div>`;
  Sheet.open(`<h3 class="h2">Comentários</h3><div style="margin-top:16px" class="cm-list"><div class="skeleton" style="height:40px;border-radius:12px"></div></div>
    <form class="row cm-form" style="gap:8px;margin-top:8px"><label class="sr" for="cm-in">Escreva um comentário</label><input class="input" id="cm-in" placeholder="Adicione um comentário…" style="flex:1" autocomplete="off" maxlength="600"><button class="icon-btn" style="background:var(--accent);color:#0B0B0B" aria-label="Enviar">${icon('arrow', 20, 2)}</button></form>`,
    async w => { const list = $('.cm-list', w);
      try { const L = await API.comments(p.id); list.innerHTML = L.length ? L.map(row).join('') : '<p class="muted small">Seja o primeiro a comentar.</p>'; hydrateImages(list); } catch (x) { list.innerHTML = `<p class="muted small">${errMsg(x)}</p>`; }
      $('.cm-form', w).onsubmit = async e => { e.preventDefault(); const v = $('#cm-in', w).value.trim(); if (!v) return; $('#cm-in', w).value = '';
        try { const c = await API.comment(p, v); if (!list.querySelector('.row')) list.innerHTML = ''; list.insertAdjacentHTML('beforeend', row(c)); hydrateImages(list); p.commentCount = (p.commentCount || 0) + 1; $$(`[data-ccount="${p.id}"]`).forEach(n => n.textContent = fmt(p.commentCount)); haptic(6); } catch (x) { toast(errMsg(x), 'x'); } }; }, { label: 'Comentários' });
}
function composePost({ sport, activity } = {}) {
  let sp = sport || mySports()[0]; let img = null;
  Sheet.open(`<h3 class="h2">Nova publicação</h3><div style="margin-top:16px">
    <div class="field"><label>Esporte</label>${sportChips(sp, 'np', SPORT_IDS)}</div>
    ${activity ? `<div class="list-item" style="margin-bottom:12px"><span class="ico">${icon(SPORTS[activity.sport].icon, 20)}</span><div><div class="h3">${esc(activity.title)}</div><div class="muted small">${statLine(activity.sport, activity)}</div></div></div>` : ''}
    <div class="field"><label for="np-x">Legenda</label><textarea class="input" id="np-x" rows="4" maxlength="2000" placeholder="Conte como foi"></textarea></div>
    <button class="btn btn-ghost btn-block" style="margin-bottom:10px" data-np-photo>${icon('image', 18)}Adicionar foto</button><div class="np-prev"></div>
    <button class="btn btn-white btn-block" data-np-go>Publicar</button></div>`,
    (w, close) => w.addEventListener('click', async e => { const c = e.target.closest('[data-np]'); if (c) { sp = c.dataset.np; $$('[data-np]', w).forEach(x => x.classList.toggle('on', x === c)); }
      if (e.target.closest('[data-np-photo]')) { const d = await chooseImage(1280, .74); if (d) { img = d; $('.np-prev', w).innerHTML = `<img src="${d}" alt="" style="width:100%;max-height:240px;object-fit:cover;border-radius:18px;margin-bottom:12px">`; } }
      const go = e.target.closest('[data-np-go]'); if (go) { const text = $('#np-x', w).value.trim(); if (!text && !img && !activity) return toast('Escreva algo ou adicione uma foto', 'x'); go.disabled = true; go.textContent = 'Publicando…';
        try { const hide = API.me.privacy && API.me.privacy.hideRouteEnds; await API.createPost({ sport: sp, text, image: img, activity: activity ? { id: activity.id, title: activity.title, stats: publicStats(activity), route: activity.route ? downsample(hide ? trimRoute(activity.route) : activity.route, 120) : null, pr: !!activity.prCount } : null });
          close(); socialFilter = 'all'; socialScope = 'all'; Nav.go('social'); toast('Publicado'); } catch (x) { go.disabled = false; go.textContent = 'Publicar'; toast(errMsg(x), 'x'); } } }), { label: 'Nova publicação' });
}
function sportChipsAll(on) { return `<div class="hscroll" role="tablist" aria-label="Filtrar por esporte"><button class="chip ${on === 'all' ? 'on' : ''}" data-feedf="all">Tudo</button>${SPORT_IDS.map(id => `<button class="chip ${on === id ? 'on' : ''}" data-feedf="${id}">${icon(SPORTS[id].icon, 16)}${SPORTS[id].name}</button>`).join('')}</div>`; }

Screens.social = {
  render() {
    return `<div class="scroll" id="feed-scroll"><div class="pad page" style="padding-top:calc(var(--safe-top) + 10px)">
      <div class="between" data-e="0"><h1 class="display" style="font-size:30px">Comunidade</h1><div class="row" style="gap:8px"><button class="icon-btn glass" aria-label="Buscar pessoas" data-people>${icon('search', 20)}</button><button class="icon-btn" style="background:var(--accent);color:#fff" aria-label="Nova publicação" data-compose-any>${icon('plus', 20, 2)}</button></div></div>
      <div style="margin-top:16px" data-e="1">${seg([['all', 'Para você'], ['following', 'Seguindo']], socialScope, 'scope')}</div>
      <div data-e="2" style="margin-top:12px">${sportChipsAll(socialFilter)}</div>
      <div class="feed-cols"><div id="feed-list" style="margin-top:18px"><div class="card skeleton" style="height:340px"></div></div><aside class="d-only feed-side"><div class="wsec" style="margin-top:18px"><h2>Pessoas para seguir</h2></div><div data-async="sugg"></div></aside></div>
      <div class="bottom-space"></div></div></div>`;
  },
  mount(el) {
    wirePosts(el); let last = null, loading = false;
    const load = async (more = false) => { if (loading) return; loading = true; const list = $('#feed-list', el);
      try { const L = await API.feed({ sport: socialFilter, scope: socialScope, after: more ? last : null }); if (!more) list.innerHTML = '';
        $('.feed-more', list) && $('.feed-more', list).remove();
        if (!L.length && !more) list.innerHTML = `<div class="card" style="text-align:center;padding:30px"><div class="h3">${socialScope === 'following' ? 'Nada de quem você segue ainda' : 'Nenhuma publicação por aqui'}</div><div class="muted small" style="margin:6px 0 14px">${socialScope === 'following' ? 'Encontre pessoas para seguir.' : 'Seja o primeiro a publicar.'}</div><button class="btn btn-white btn-sm" ${socialScope === 'following' ? 'data-people' : 'data-compose-any'}>${socialScope === 'following' ? 'Buscar pessoas' : 'Publicar'}</button></div>`;
        L.forEach((p, i) => { const d = document.createElement('div'); d.innerHTML = postCard(p); list.appendChild(d.firstElementChild); });
        if (L.length) { last = L[L.length - 1].ts; if (L.length >= 20) list.insertAdjacentHTML('beforeend', `<button class="btn btn-ghost btn-block feed-more">Carregar mais</button>`); }
        hydrateImages(list); Motion.drawLines(list);
      } catch (x) { list.innerHTML = emptyBox(errMsg(x)); } loading = false; };
    mountSeg($('.seg', el), b => { socialScope = b.dataset.scope; load(); });
    el.addEventListener('click', e => {
      const f = e.target.closest('[data-feedf]'); if (f) { socialFilter = f.dataset.feedf; haptic(6); $$('[data-feedf]', el).forEach(b => b.classList.toggle('on', b === f)); load(); }
      if (e.target.closest('[data-people]')) peopleSheet(); if (e.target.closest('[data-compose-any]')) composePost({ sport: socialFilter !== 'all' ? socialFilter : undefined });
      if (e.target.closest('.feed-more')) load(true);
    });
    load();
    (async () => { const box = $('[data-async="sugg"]', el); if (!box || getComputedStyle(box.parentElement).display === 'none') return; try { const L = await API.suggestions(); box.innerHTML = L.length ? `<div class="stack">${L.map(userRow).join('')}</div>` : '<p class="muted small">Sem sugestões por enquanto.</p>'; hydrateImages(box); wireUserRows(box); } catch (x) {} })();
  },
  onReturn() { Nav.refresh(); },
};
const userRow = u => `<div class="list-item" data-urow="${u.id}"><button class="row" style="flex:1;min-width:0;gap:12px;text-align:left" data-profile-open="${u.id}">${avatar(u)}<div style="min-width:0"><div class="h3" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(u.name)}</div><div class="muted small">@${esc(u.handle)}${u.sports ? ' · ' + u.sports.slice(0, 2).map(s => SPORTS[s] ? SPORTS[s].short : '').join(', ') : ''}</div></div></button>
  ${u.id === API.me.id ? '' : `<button class="chip ${API.following.has(u.id) ? '' : 'on'}" style="height:34px" data-ufollow="${u.id}">${API.following.has(u.id) ? 'Seguindo' : 'Seguir'}</button>`}</div>`;
function wireUserRows(root, onOpen) {
  root.addEventListener('click', async e => { const o = e.target.closest('[data-profile-open]'); if (o) { onOpen && onOpen(); Nav.push('user', { id: o.dataset.profileOpen }); return; }
    const f = e.target.closest('[data-ufollow]'); if (!f) return; const id = f.dataset.ufollow; f.disabled = true;
    try { if (API.following.has(id)) { await API.unfollow(id); f.textContent = 'Seguir'; f.classList.add('on'); } else { await API.follow(id); f.textContent = 'Seguindo'; f.classList.remove('on'); } haptic(6); } catch (x) { toast(errMsg(x), 'x'); } f.disabled = false; });
}
function peopleSheet() {
  Sheet.open(`<h3 class="h2">Encontrar pessoas</h3><div class="field" style="margin-top:14px"><label for="ps-q" class="sr">Buscar</label><input class="input" id="ps-q" placeholder="Busque por nome ou @usuário" autocomplete="off"></div><div class="ps-res stack" style="gap:8px"><div class="skeleton" style="height:56px;border-radius:16px"></div></div>`,
    async (w, close) => { const res = $('.ps-res', w); wireUserRows(res, close);
      const show = L => { res.innerHTML = L.length ? L.map(userRow).join('') : '<p class="muted small">Ninguém encontrado.</p>'; hydrateImages(res); };
      try { show(await API.suggestions()); } catch (x) { res.innerHTML = `<p class="muted small">${errMsg(x)}</p>`; }
      let tm; $('#ps-q', w).oninput = e => { clearTimeout(tm); const q = e.target.value; tm = setTimeout(async () => { try { show(q.trim() ? await API.searchUsers(q) : await API.suggestions()); } catch (x) {} }, 300); }; }, { label: 'Pessoas' });
}

/* ---------------- Perfil de outro usuário ---------------- */
Screens.user = {
  render({ id }) { return `<div class="topbar solid"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Perfil</div><span style="width:46px"></span></div><div class="scroll"><div class="pad page u-body" style="padding-top:calc(var(--safe-top) + 74px)"><div class="card skeleton" style="height:180px"></div></div></div>`; },
  async mount(el, { id }) {
    const box = $('.u-body', el);
    try { const u = await API.getUser(id); if (!u) { box.innerHTML = emptyBox('Usuário não encontrado.'); return; }
      const [acts, posts] = await Promise.all([API.activitiesOf(id).catch(() => null), API.postsBy(id).catch(() => [])]);
      const main = (u.sports || [])[0] || 'musculacao'; const fol = API.following.has(id);
      box.innerHTML = `<div class="row" style="gap:16px">${avatar(u, 'lg')}<div style="flex:1;min-width:0"><h1 class="display" style="font-size:26px;margin:0">${esc(u.name)}</h1><div class="muted small">@${esc(u.handle)}${u.private ? ' · ' + icon('lock', 12, 2, 'style="display:inline;vertical-align:-1px"') + ' privado' : ''}</div></div></div>
        ${u.bio ? `<p style="margin:14px 0 0;line-height:1.5">${esc(u.bio)}</p>` : ''}
        <div class="row" style="gap:18px;margin:18px 0;justify-content:space-around">${[[u.postsCount || 0, 'Posts'], [u.followersCount || 0, 'Seguidores'], [u.followingCount || 0, 'Seguindo']].map(x => `<div style="text-align:center"><div class="h2">${fmt(x[0])}</div><div class="muted small">${x[1]}</div></div>`).join('')}</div>
        <button class="btn ${fol ? 'btn-ghost' : 'btn-white'} btn-block" data-ufollow-big>${fol ? 'Seguindo' : 'Seguir'}</button>
        <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:16px">${(u.sports || []).map(s => `<span class="tag" style="color:${SPORTS[s].c}">${icon(SPORTS[s].icon, 13, 2)}${SPORTS[s].name}</span>`).join('')}</div>
        ${acts ? `<div class="wsec"><h2>Atividades recentes</h2><span class="muted small">${acts.length}</span></div>${acts.length ? `<div class="stack">${acts.slice(0, 5).map(a => `<div class="list-item"><span class="ico" style="color:${SPORTS[a.sport].c}">${icon(SPORTS[a.sport].icon, 20)}</span><div style="flex:1;min-width:0"><div class="h3">${esc(a.title || SPORTS[a.sport].name)}</div><div class="muted small">${shortDate(a.startedAt)} · ${statLine(a.sport, a)}</div></div></div>`).join('')}</div>` : emptyBox('Sem atividades ainda.')}` : `<div class="card" style="margin-top:20px;text-align:center"><span>${icon('lock', 22)}</span><div class="muted small" style="margin-top:8px">Este perfil é privado. As atividades não são exibidas.</div></div>`}
        <div class="wsec"><h2>Publicações</h2></div><div class="u-posts">${posts.length ? posts.map(p => postCard(p)).join('') : emptyBox('Nenhuma publicação.')}</div>`;
      hydrateImages(box); wirePosts(box); Motion.drawLines(box);
      $('[data-ufollow-big]', box).onclick = async e => { const b = e.currentTarget; b.disabled = true; try { if (API.following.has(id)) { await API.unfollow(id); b.textContent = 'Seguir'; b.className = 'btn btn-white btn-block'; } else { await API.follow(id); b.textContent = 'Seguindo'; b.className = 'btn btn-ghost btn-block'; } } catch (x) { toast(errMsg(x), 'x'); } b.disabled = false; };
    } catch (x) { box.innerHTML = emptyBox(errMsg(x)); }
  },
};

/* ---------------- Desafios ---------------- */
let chTab = 'ativos';
Screens.challenges = {
  render() {
    return `<div class="scroll"><div class="pad page" style="padding-top:calc(var(--safe-top) + 10px)">
      <div class="between" data-e="0"><h1 class="display" style="font-size:30px">Desafios</h1><button class="icon-btn" style="background:var(--accent);color:#fff" aria-label="Criar desafio" data-ch-new>${icon('plus', 22, 2.2)}</button></div>
      <div class="card glass row" style="margin:16px 0;gap:16px" data-e="1">${ring(Math.min(1, Stats.streak(API.acts) / 7), { size: 72, sw: 7, color: '#E3192B', inner: `<span class="num" style="font-size:20px">${Stats.streak(API.acts)}</span>` })}<div style="flex:1"><div class="kicker">Sequência atual</div><div class="h2" style="margin-top:6px">${Stats.streak(API.acts)} ${Stats.streak(API.acts) === 1 ? 'dia' : 'dias'} seguidos</div><div class="muted small" style="margin-top:4px">${API.joined.length} ${API.joined.length === 1 ? 'desafio ativo' : 'desafios ativos'}</div></div></div>
      <div data-e="2">${seg([['ativos', 'Meus desafios'], ['descobrir', 'Descobrir']], chTab, 'cht')}</div>
      <div style="margin-top:18px" id="ch-body"><div class="card skeleton" style="height:170px"></div></div><div class="bottom-space"></div></div></div>`;
  },
  mount(el) {
    const load = async () => { const box = $('#ch-body', el); box.innerHTML = '<div class="card skeleton" style="height:170px"></div>';
      try { let L = chTab === 'ativos' ? await API.myChallenges() : (await API.listChallenges()).filter(c => !API.joined.includes(c.id));
        L = L.sort((a, b) => (b.end - a.end));
        box.innerHTML = L.length ? `<div class="ch-grid">${L.map(c => challengeCard(c, 'full')).join('')}</div>` : emptyBox(chTab === 'ativos' ? 'Você ainda não participa de nenhum desafio.' : 'Nenhum desafio público aberto. Crie o primeiro!', `<button class="btn btn-white btn-sm" data-ch-new>Criar desafio</button>`);
        Motion.fillBars(box); } catch (x) { box.innerHTML = emptyBox(errMsg(x)); } };
    mountSeg($('.seg', el), b => { chTab = b.dataset.cht; load(); });
    el.addEventListener('click', e => { if (e.target.closest('[data-ch-new]')) createChallengeSheet(); });
    load();
  },
  onReturn() { Nav.refresh(); },
};
function createChallengeSheet(sport) {
  const d = { sport: sport || mySports()[0], metric: CH_METRICS[sport || mySports()[0]][0][0], target: 30, vis: 'private' };
  const iso = x => new Date(x - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const mopts = () => CH_METRICS[d.sport].map(([k, l], i) => `<button class="chip ${k === d.metric ? 'on' : ''}" data-ccm="${k}">${l}</button>`).join('');
  const unit = () => CH_METRICS[d.sport].find(m => m[0] === d.metric)[2];
  Sheet.open(`<h3 class="h2">Criar desafio</h3><div style="margin-top:16px">
    <div class="field"><label for="cc-n">Nome</label><input class="input" id="cc-n" placeholder="Ex.: 100 km em dezembro" maxlength="60"></div>
    <div class="field"><label>Esporte</label>${sportChips(d.sport, 'ccs', SPORT_IDS)}</div>
    <div class="field"><label>Métrica</label><div class="row cc-m" style="gap:8px;flex-wrap:wrap">${mopts()}</div></div>
    <div class="field"><label for="cc-t">Objetivo (<span class="cc-u">${unit()}</span>)</label><input class="input" id="cc-t" type="number" inputmode="decimal" min="1" value="30"></div>
    <div class="grid2"><div class="field"><label for="cc-a">Início</label><input class="input" type="date" id="cc-a" value="${iso(Date.now())}"></div><div class="field"><label for="cc-b">Término</label><input class="input" type="date" id="cc-b" value="${iso(Date.now() + 30 * DAY)}"></div></div>
    <div class="field"><label>Quem pode entrar</label>${seg([['private', 'Só com o link'], ['public', 'Qualquer pessoa']], 'private', 'ccv')}</div>
    <p class="muted small" style="line-height:1.5">O progresso é calculado automaticamente a partir das atividades que cada participante registra no período.</p>
    <button class="btn btn-white btn-block" data-ccgo>Criar desafio</button></div>`,
    (w, close) => { mountSeg($$('.seg', w)[0], b => d.vis = b.dataset.ccv);
      w.addEventListener('click', async e => { const s = e.target.closest('[data-ccs]'); if (s) { d.sport = s.dataset.ccs; d.metric = CH_METRICS[d.sport][0][0]; $$('[data-ccs]', w).forEach(x => x.classList.toggle('on', x === s)); $('.cc-m', w).innerHTML = mopts(); $('.cc-u', w).textContent = unit(); }
        const m = e.target.closest('[data-ccm]'); if (m) { d.metric = m.dataset.ccm; $$('[data-ccm]', w).forEach(x => x.classList.toggle('on', x === m)); $('.cc-u', w).textContent = unit(); }
        const go = e.target.closest('[data-ccgo]'); if (go) { const name = $('#cc-n', w).value.trim(); const target = +$('#cc-t', w).value; const a = new Date($('#cc-a', w).value + 'T00:00').getTime(), b = new Date($('#cc-b', w).value + 'T00:00').getTime();
          if (name.length < 3) return toast('Dê um nome ao desafio', 'x'); if (!(target > 0)) return toast('Defina um objetivo', 'x'); if (!(b >= a)) return toast('A data de término deve ser depois do início', 'x');
          go.disabled = true; go.textContent = 'Criando…';
          try { const c = await API.createChallenge({ name, sport: d.sport, metric: d.metric, unit: unit(), target, start: a, end: b, visibility: d.vis }); close(); chTab = 'ativos'; Nav.push('challenge', { id: c.id }); setTimeout(() => inviteSheet(c), 500); } catch (x) { go.disabled = false; go.textContent = 'Criar desafio'; toast(errMsg(x), 'x'); } } }); }, { label: 'Criar desafio' });
}
const inviteLink = c => `${location.origin}${location.pathname}?desafio=${c.id}`;
function inviteSheet(c) {
  const link = inviteLink(c);
  Sheet.open(`<h3 class="h2">Convidar para “${esc(c.name)}”</h3><p class="muted small" style="margin:8px 0 14px">Quem abrir o link e entrar na conta pode participar.</p>
    <div class="row"><input class="input" readonly value="${esc(link)}" style="flex:1" aria-label="Link do convite"><button class="icon-btn" style="background:var(--accent);color:#fff" data-copy aria-label="Copiar link">${icon('copy', 19)}</button></div>
    <button class="btn btn-ghost btn-block" style="margin-top:12px" data-nshare>${icon('share', 18)}Enviar por outro app</button>`,
    w => w.addEventListener('click', async e => { if (e.target.closest('[data-copy]')) { try { await navigator.clipboard.writeText(link); toast('Link copiado'); } catch (x) { toast('Copie o link manualmente', 'x'); } }
      if (e.target.closest('[data-nshare]')) { if (navigator.share) { try { await navigator.share({ title: c.name, text: `Bora participar do desafio “${c.name}” no OraGym?`, url: link }); } catch (x) {} } else { try { await navigator.clipboard.writeText(link); toast('Link copiado'); } catch (x) {} } } }), { label: 'Convidar' });
}
Screens.challenge = {
  render({ id }) { return `<div class="topbar"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Desafio</div><span style="width:46px"></span></div><div class="scroll ch-scroll"><div class="pad page" style="padding-top:120px"><div class="card skeleton" style="height:200px"></div></div></div>`; },
  async mount(el, { id }) {
    const sc = $('.ch-scroll', el);
    try { const c = await API.getChallenge(id); if (!c) { sc.innerHTML = `<div class="pad" style="padding-top:120px">${emptyBox('Desafio não encontrado ou excluído.')}</div>`; return; }
      const sp = SPORTS[c.sport]; setAccent(c.sport); const joined = API.joined.includes(c.id); const owner = c.ownerId === API.me.id;
      const mine = joined ? Stats.challengeProgress(API.acts, c) : 0; const p = clamp(mine / c.target, 0, 1); const days = Math.max(0, Math.ceil((startOfDay(c.end) + DAY - Date.now()) / DAY));
      if (joined) API.syncChallenges(c.sport).catch(() => {});
      const mem = await API.members(id).catch(() => []);
      sc.innerHTML = `<div style="position:relative;height:360px"><div class="hero-stack" style="position:absolute;inset:0">${scene('ch', c.sport, { i: 1 })}</div>
        <div class="pad page" style="position:absolute;left:0;right:0;bottom:20px"><span class="tag" style="color:${sp.c}">${icon(sp.icon, 13, 2)}${sp.name} · ${c.visibility === 'public' ? 'Público' : 'Privado'}</span><h1 class="display" style="font-size:34px;margin:12px 0 8px">${esc(c.name)}</h1><div class="muted">${esc(CH_METRICS[c.sport].find(m => m[0] === c.metric)?.[1] || c.metric)} · ${shortDate(c.start)} → ${shortDate(c.end)} · ${days > 0 ? days + ' dias restantes' : 'encerrado'}</div></div></div>
        <div class="pad page"><div class="card">${joined ? `<div class="between" style="align-items:flex-end"><div><div class="kicker">Seu progresso</div><div class="num" style="font-size:40px;margin-top:6px">${nv(mine, 1)}<span style="font-size:15px;color:var(--mute)"> / ${nv(c.target, 1)} ${esc(c.unit)}</span></div></div>${ring(p, { size: 70, sw: 6, inner: `<span class="num" style="font-size:15px">${Math.round(p * 100)}%</span>` })}</div><div class="bar" style="margin-top:14px;height:10px"><i data-bar="${p}" style="transform:scaleX(0)"></i></div>
          <div class="row" style="gap:10px;margin-top:16px"><button class="btn btn-accent" style="flex:1;color:#0B0B0B" data-push="${LIVE[c.sport]}" data-params='{"id":"${c.sport}"}'>${icon('play', 18)}Registrar atividade</button><button class="btn btn-ghost" data-inv aria-label="Convidar">${icon('link', 18)}</button></div>`
          : `<div class="h3">Entre no desafio</div><p class="muted small" style="margin:6px 0 14px">Seu progresso conta a partir das atividades de ${sp.name.toLowerCase()} registradas no período.</p><button class="btn btn-white btn-block" data-join>Participar</button>`}</div>
        <div class="wsec"><h2>Ranking</h2><span class="muted small">${mem.length} ${mem.length === 1 ? 'participante' : 'participantes'}</span></div>
        <div class="stack" style="gap:8px">${mem.length ? mem.map((m, i) => `<button class="list-item" style="text-align:left;${m.id === API.me.id ? 'border-color:color-mix(in oklab,var(--accent) 60%,transparent)' : ''}" data-profile-open="${m.id}"><span class="num" style="font-size:20px;width:26px;text-align:center;${i < 3 ? 'color:#E3192B' : 'color:var(--mute)'}">${i + 1}</span>${avatar(m)}<div style="flex:1;min-width:0"><div class="h3">${m.id === API.me.id ? 'Você' : esc(m.name)}</div><div class="muted small">${nv(m.progress || 0, 1)} ${esc(c.unit)}</div></div>${(m.progress || 0) >= c.target ? `<span style="color:#A3FF12">${icon('trophy', 20)}</span>` : ''}</button>`).join('') : emptyBox('Ninguém ainda.')}</div>
        <div class="wsec"><h2>Regras</h2></div><div class="card small muted" style="line-height:1.6">Vale toda atividade de ${sp.name.toLowerCase()} registrada no OraGym entre ${shortDate(c.start)} e ${shortDate(c.end)}. Ganha quem acumular mais ${esc(c.unit)}. Criado por ${esc(c.ownerName || '—')}.</div>
        <div class="row" style="gap:10px;margin-top:16px">${joined && !owner ? '<button class="btn btn-ghost" data-leave style="flex:1">Sair do desafio</button>' : ''}${owner ? '<button class="btn btn-ghost" data-delch style="flex:1;color:#FF6B76">Excluir desafio</button>' : ''}</div>
        <div style="height:60px"></div></div>`;
      hydrateImages(sc); Motion.fillBars(sc); Motion.fillRings(sc); wireUserRows(sc);
      bindScrollFx(el, { bar: $('.topbar', el), hero: $('.hero-stack', el), threshold: 260 });
      const reload = () => { el.innerHTML = Screens.challenge.render({ id }); Screens.challenge.mount(el, { id }); };
      const j = $('[data-join]', sc); if (j) j.onclick = async () => { j.disabled = true; try { await API.join(c); haptic([10, 30, 10]); toast('Você entrou no desafio'); reload(); } catch (x) { j.disabled = false; toast(errMsg(x), 'x'); } };
      const iv = $('[data-inv]', sc); if (iv) iv.onclick = () => inviteSheet(c);
      const lv = $('[data-leave]', sc); if (lv) lv.onclick = async () => { if (await confirmDialog('Sair do desafio?', 'Seu nome sai do ranking.', 'Sair')) { await API.leave(c); toast('Você saiu do desafio'); reload(); } };
      const dl = $('[data-delch]', sc); if (dl) dl.onclick = async () => { if (await confirmDialog('Excluir desafio?', 'O desafio some para todos os participantes.', 'Excluir', true)) { await API.removeChallenge(c); toast('Desafio excluído', 'trash'); Nav.back(); } };
      if (joined && mine >= c.target && !sessionStorage.getItem('won-' + id)) { sessionStorage.setItem('won-' + id, 1); celebrate({ title: 'Desafio concluído', sub: c.name, big: `${nv(c.target, 1)} ${c.unit}`, points: 0, color: '#A3FF12', icon: 'trophy', share: false }); }
    } catch (x) { sc.innerHTML = `<div class="pad" style="padding-top:120px">${emptyBox(errMsg(x))}</div>`; }
  },
};
