/* ============================================================
   ORA GYM — Comunidade (feed) e Desafios
   ============================================================ */
var socialFilter = 'all';
const allPosts = () => [...Store.get().posts, ...FEED];
const who = p => p.who === 'me' ? { n: Store.get().name, i: '' } : PEOPLE[p.who];

function postVisual(p) {
  const sp = SPORTS[p.sport];
  if (p.route != null) return `<div style="position:absolute;inset:0">${mapSVG(p.route, { id: 'pm' + p.id, accent: sp.c, h: 420 })}</div><div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(11,11,11,.9))"></div>`;
  const k = [...String(p.id)].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return `<div style="position:absolute;inset:0">${scene('post-' + p.id, p.sport, { i: k, sm: true, fade: 'background:linear-gradient(180deg,transparent 30%,rgba(11,11,11,.92))' })}</div>`;
}
function postCard(p, compact = false) {
  const s = Store.get(); const sp = SPORTS[p.sport]; const w = who(p); const liked = !!s.liked[p.id]; const saved = !!s.saved[p.id];
  const likes = p.likes + (liked ? 1 : 0); const ncom = p.comments + ((s.comments[p.id] || []).length);
  return `<article class="post" data-post="${p.id}" style="margin-bottom:${compact ? 0 : 26}px">
    <header class="between" style="margin-bottom:12px"><div class="row" style="gap:10px">${p.who === 'me' ? meAv() : av(p.who)}<div><div class="h3">${esc(w.n)}</div><div class="muted small">${sp.name} · ${p.t}</div></div></div>
      ${p.who !== 'me' ? `<button class="chip ${s.following[p.who] ? '' : 'on'}" style="height:32px;font-size:12px" data-follow="${p.who}">${s.following[p.who] ? 'Seguindo' : 'Seguir'}</button>` : `<span class="tag">Você</span>`}</header>
    <div class="post-media press" style="position:relative;height:${compact ? 250 : 330}px;border-radius:28px;overflow:hidden;border:1px solid var(--stroke);--accent:${sp.c}" data-dbl="${p.id}">
      ${postVisual(p)}
      <div style="position:absolute;left:14px;top:14px;display:flex;gap:6px">${p.pr ? `<span class="tag neon">${icon('medal', 13, 2)}Recorde pessoal</span>` : ''}${p.kind === 'achievement' ? `<span class="tag neon">${icon('star', 13, 2)}Conquista</span>` : ''}</div>
      <div style="position:absolute;left:16px;right:16px;bottom:16px"><div class="display" style="font-size:20px;margin-bottom:12px">${esc(p.title)}</div>
        <div class="glass" style="border-radius:20px;padding:12px 6px;display:grid;grid-template-columns:repeat(${p.stats.length},1fr);text-align:center">${p.stats.map((x, i) => `<div style="${i ? 'border-left:1px solid var(--stroke)' : ''};padding:0 4px"><div class="num" style="font-size:18px;white-space:nowrap">${esc(x[1])}</div><div class="muted" style="font-size:10.5px;margin-top:2px">${esc(x[0])}</div></div>`).join('')}</div></div></div>
    <div class="between" style="margin-top:10px"><div class="row" style="gap:2px">
      <button class="icon-btn ${liked ? 'liked' : ''}" data-like="${p.id}" aria-label="Curtir" aria-pressed="${liked}">${icon(liked ? 'heartFill' : 'heart', 23)}</button><span class="small" style="font-weight:600;min-width:28px" data-likes="${p.id}">${fmt(likes)}</span>
      <button class="icon-btn" data-comments="${p.id}" aria-label="Comentários">${icon('comment', 22)}</button><span class="small muted" style="font-weight:600">${fmt(ncom)}</span>
      <button class="icon-btn" data-sharepost="${p.id}" aria-label="Compartilhar">${icon('share', 21)}</button></div>
      <button class="icon-btn ${saved ? 'accent-text' : ''}" data-save="${p.id}" aria-label="Salvar" aria-pressed="${saved}">${icon('bookmark', 21, 1.7, saved ? 'fill="currentColor"' : '')}</button></div>
    <p style="margin:4px 4px 0;font-size:14px;line-height:1.5"><b>${esc(w.n.split(' ')[0])}</b> <span style="color:#D3DCE8">${esc(p.text)}</span></p></article>`;
}
function wirePosts(root) {
  if (root._postsWired) return; root._postsWired = true;
  const like = (id, btn, burst) => {
    const s = Store.get(); const on = !s.liked[id]; if (on) s.liked[id] = 1; else delete s.liked[id]; Store.save(); haptic(on ? [8, 30, 8] : 5);
    $$(`[data-like="${id}"]`, root).forEach(b => { b.classList.toggle('liked', on); b.setAttribute('aria-pressed', on); b.innerHTML = icon(on ? 'heartFill' : 'heart', 23); A($('svg', b), [{ transform: 'scale(.4)' }, { transform: 'scale(1.25)', offset: .5 }, { transform: 'none' }], { duration: 520, easing: 'out' }); });
    const p = allPosts().find(x => x.id === id); $$(`[data-likes="${id}"]`, root).forEach(n => n.textContent = fmt(p.likes + (on ? 1 : 0)));
    if (burst && on) burstOnly(id);
  };
  const burstOnly = id => { const m = $(`[data-dbl="${id}"]`, root); if (!m) return; const h = document.createElement('div'); h.className = 'heart-burst'; h.innerHTML = icon('heartFill', 96); m.appendChild(h); haptic(10);
    A(h, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: .35 }, { transform: 'scale(1)', opacity: 1, offset: .7 }, { transform: 'scale(1.3) translateY(-30px)', opacity: 0 }], { duration: 900, easing: 'out' }).finished.then(() => h.remove()); };
  let lastTap = {};
  root.addEventListener('click', e => {
    const t = e.target;
    const l = t.closest('[data-like]'); if (l) return like(l.dataset.like, l);
    const d = t.closest('[data-dbl]'); if (d) { const id = d.dataset.dbl; const now = Date.now(); if (now - (lastTap[id] || 0) < 320) { if (!Store.get().liked[id]) like(id, null, true); else burstOnly(id); lastTap[id] = 0; } else lastTap[id] = now; return; }
    const c = t.closest('[data-comments]'); if (c) return commentsSheet(c.dataset.comments, root);
    const sh = t.closest('[data-sharepost]'); if (sh) { const p = allPosts().find(x => x.id === sh.dataset.sharepost); return shareSheet(`${p.title} — ${who(p).n}`, p.stats.map(s => s[1]).join(' · ')); }
    const sv = t.closest('[data-save]'); if (sv) { const s = Store.get(); const id = sv.dataset.save; const on = !s.saved[id]; on ? s.saved[id] = 1 : delete s.saved[id]; Store.save(); sv.innerHTML = icon('bookmark', 21, 1.7, on ? 'fill="currentColor"' : ''); sv.classList.toggle('accent-text', on); A($('svg', sv), [{ transform: 'scale(.5)' }, { transform: 'none' }], { spring: [300, 12] }); toast(on ? 'Salvo na sua coleção' : 'Removido dos salvos', 'bookmark'); return; }
    const f = t.closest('[data-follow]'); if (f) { const s = Store.get(); const id = f.dataset.follow; const on = !s.following[id]; on ? s.following[id] = 1 : delete s.following[id]; Store.save(); $$(`[data-follow="${id}"]`, root).forEach(x => { x.textContent = on ? 'Seguindo' : 'Seguir'; x.classList.toggle('on', !on); }); A(f, [{ transform: 'scale(.9)' }, { transform: 'none' }], { spring: [300, 14] }); haptic(6); }
  });
}
function commentsSheet(id, root) {
  const s = Store.get(); const p = allPosts().find(x => x.id === id);
  const base = [['rafa', 'Que ritmo! 🔥'.replace('🔥', '— brabo demais')], ['julia', 'Inspiração pra semana toda.'], ['caio', 'Bora junto na próxima?']];
  const mine = (s.comments[id] || []).map(c => ['me', c]);
  const row = ([w, txt]) => `<div class="row" style="align-items:flex-start;gap:10px;margin-bottom:14px">${w === 'me' ? meAv('sm') : av(w, 'sm')}<div><div class="small"><b>${esc(w === 'me' ? s.name : PEOPLE[w].n.split(' ')[0])}</b> <span style="color:#D3DCE8">${esc(txt)}</span></div><div class="muted" style="font-size:11px;margin-top:3px">${w === 'me' ? 'agora' : '12 min'}</div></div></div>`;
  Sheet.open(`<h3 class="h2" data-e="0">Comentários</h3><div style="margin-top:16px" class="cm-list" data-e="1">${[...base, ...mine].map(row).join('')}</div>
    <form class="row cm-form" style="gap:8px;margin-top:8px" data-e="2"><label class="sr" for="cm-in">Escreva um comentário</label><input class="input" id="cm-in" placeholder="Adicione um comentário…" style="flex:1" autocomplete="off"><button class="icon-btn" style="background:var(--accent);color:#0B0B0B" aria-label="Enviar">${icon('arrow', 20, 2)}</button></form>`,
    w => { $('.cm-form', w).onsubmit = e => { e.preventDefault(); const v = $('#cm-in', w).value.trim(); if (!v) return; (s.comments[id] = s.comments[id] || []).push(v); Store.save(); const list = $('.cm-list', w); list.insertAdjacentHTML('beforeend', row(['me', v])); A(list.lastElementChild, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { spring: [200, 18] }); $('#cm-in', w).value = ''; haptic(6); }; }, { label: 'Comentários' });
}

Screens.social = {
  render() {
    const posts = allPosts().filter(p => socialFilter === 'all' || p.sport === socialFilter);
    const stories = ['marina', 'rafa', 'julia', 'caio', 'bia', 'theo', 'luana', 'gui'];
    return `<div class="scroll" id="feed-scroll"><div class="ptr" aria-hidden="true"><svg viewBox="0 0 38 38" width="38" height="38"><circle cx="19" cy="19" r="15" stroke="rgba(255,255,255,.15)" stroke-width="3" fill="none"/><circle class="ptr-arc" cx="19" cy="19" r="15" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="94.2" stroke-dashoffset="94.2" style="stroke:var(--accent);transform:rotate(-90deg);transform-origin:center"/></svg></div>
      <div class="feed-inner"><div class="pad" style="padding-top:calc(var(--safe-top) + 10px)">
      <div class="between" data-e="0"><h1 class="display" style="font-size:26px">Comunidade</h1><div class="row" style="gap:8px"><button class="icon-btn glass" aria-label="Buscar" id="feed-search">${icon('search', 20)}</button><button class="icon-btn glass" aria-label="Nova publicação" id="feed-new">${icon('plus', 20, 2)}</button></div></div>
      <div class="hscroll" style="margin-top:16px;gap:6px" data-e="1"><div class="story"><button class="ring" style="background:rgba(255,255,255,.14);position:relative" id="my-story" aria-label="Seu story">${meAv()}<span style="position:absolute;right:0;bottom:0;width:22px;height:22px;border-radius:50%;background:var(--accent);color:#0B0B0B;display:grid;place-items:center;border:2px solid var(--bg0)">${icon('plus', 12, 3)}</span></button><span>Seu story</span></div>
        ${stories.map((id, i) => `<div class="story ${i > 4 ? 'seen' : ''}"><button class="ring" style="--s1:${SPORTS[PEOPLE[id].sport].c};--s2:#fff" data-story="${id}" aria-label="Story de ${PEOPLE[id].n}">${av(id)}</button><span>${PEOPLE[id].n.split(' ')[0]}</span></div>`).join('')}</div>
      <div data-e="2" style="margin-top:12px">${sportChipsAll(socialFilter)}</div></div>
      <div class="pad" style="margin-top:18px" id="feed-list">${posts.length ? posts.map((p, i) => `<div data-e="${3 + Math.min(i, 3)}">${postCard(p)}</div>`).join('') : `<div class="card" style="text-align:center;padding:30px"><div class="h3">Nada por aqui ainda</div><div class="muted small" style="margin-top:6px">Seja o primeiro a publicar nessa modalidade.</div></div>`}
      <div style="text-align:center;margin:6px 0 20px">${demoBadge('Perfis e publicações fictícios')}</div></div><div class="bottom-space"></div></div></div>`;
  },
  mount(el) {
    wirePosts(el);
    el.addEventListener('click', e => {
      const f = e.target.closest('[data-feedf]'); if (f) { socialFilter = f.dataset.feedf; haptic(6); if (socialFilter !== 'all') setAccent(socialFilter); else setAccent(Store.get().sport);
        $$('[data-feedf]', el).forEach(b => b.classList.toggle('on', b === f));
        const list = $('#feed-list', el); const posts = allPosts().filter(p => socialFilter === 'all' || p.sport === socialFilter);
        A(list, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(10px)' }], { duration: 160 }).finished.then(() => { list.getAnimations().forEach(a => a.cancel());
          list.innerHTML = (posts.length ? posts.map((p, i) => `<div data-e="${i}">${postCard(p)}</div>`).join('') : `<div class="card" style="text-align:center;padding:30px" data-e="0"><div class="h3">Nada por aqui ainda</div><div class="muted small" style="margin-top:6px">Seja o primeiro a publicar nessa modalidade.</div></div>`) + `<div style="text-align:center;margin:6px 0 20px">${demoBadge('Perfis e publicações fictícios')}</div>`; Motion.enter(list, 0, 60); }); }
      const st = e.target.closest('[data-story]'); if (st) openStory(st.dataset.story, st);
      if (e.target.closest('#my-story') || e.target.closest('#feed-new')) newPostSheet();
      if (e.target.closest('#feed-search')) toast('Busca de atletas e grupos: prévia', 'search');
    });
    pullToRefresh(el);
  },
};
function sportChipsAll(on) { return `<div class="hscroll" role="tablist" aria-label="Filtrar por modalidade"><button class="chip ${on === 'all' ? 'on' : ''}" data-feedf="all">Tudo</button>${SPORT_IDS.map(id => `<button class="chip ${on === id ? 'on' : ''}" data-feedf="${id}">${icon(SPORTS[id].icon, 16)}${SPORTS[id].name}</button>`).join('')}</div>`; }

function pullToRefresh(el) {
  const sc = $('#feed-scroll', el), ptr = $('.ptr', el), arc = $('.ptr-arc', el), inner = $('.feed-inner', el); let y0 = null, dy = 0, busy = false;
  sc.addEventListener('pointerdown', e => { if (sc.scrollTop > 0 || busy || e.pointerType === 'mouse' && e.button !== 0) return; y0 = e.clientY; dy = 0; });
  sc.addEventListener('pointermove', e => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); if (dy < 4) return; const k = Math.min(1, dy / 110);
    inner.style.transform = `translateY(${Math.min(dy * .5, 80)}px)`; ptr.style.opacity = k; ptr.style.transform = `translateY(${Math.min(dy * .3, 40)}px) rotate(${dy * 2}deg)`; arc.style.strokeDashoffset = 94.2 * (1 - k); });
  const end = async () => { if (y0 == null) return; y0 = null;
    if (dy > 110) { busy = true; haptic(12); A(ptr, [{ transform: 'translateY(40px) rotate(0)' }, { transform: 'translateY(40px) rotate(720deg)' }], { duration: 900, easing: 'inout' });
      await wait(900); toast('Feed atualizado', 'refresh'); busy = false; }
    A(inner, [{ transform: inner.style.transform || 'none' }, { transform: 'none' }], { spring: [200, 22] }).finished.then(() => inner.style.transform = '');
    inner.style.transform = ''; A(ptr, [{ opacity: ptr.style.opacity || 0 }, { opacity: 0 }], { duration: 250 }).finished.then(() => ptr.style.opacity = 0); dy = 0; };
  sc.addEventListener('pointerup', end); sc.addEventListener('pointercancel', end); sc.addEventListener('pointerleave', end);
}

function openStory(id, from) {
  const p = PEOPLE[id]; const post = FEED.find(x => x.who === id) || FEED[0]; const sp = SPORTS[post.sport];
  const phone = $('.phone'); const o = document.createElement('div'); o.className = 'layer'; o.style.zIndex = 320; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Story de ' + p.n);
  o.innerHTML = `<div style="position:absolute;inset:0;--accent:${sp.c}">${scene('story-' + post.sport, post.sport, {})}</div>
    <div style="position:absolute;left:12px;right:12px;top:calc(var(--safe-top) + 4px)"><div class="bar" style="height:3px"><i class="st-bar" style="transform:scaleX(0);background:#fff;box-shadow:none"></i></div>
      <div class="between" style="margin-top:12px"><div class="row" style="gap:10px">${av(id, 'sm')}<span class="h3">${p.n}</span><span class="muted small">${post.t}</span></div><button class="icon-btn glass st-x" aria-label="Fechar">${icon('x', 20, 2)}</button></div></div>
    <div style="position:absolute;left:20px;right:20px;bottom:40px"><div class="kicker" style="color:${sp.c}">${sp.name}</div><h2 class="display" style="font-size:38px;margin:8px 0 16px">${esc(post.title)}</h2>
      <div class="glass" style="border-radius:22px;padding:14px;display:grid;grid-template-columns:repeat(3,1fr);text-align:center">${post.stats.map(s => `<div><div class="num" style="font-size:20px">${esc(s[1])}</div><div class="muted" style="font-size:10.5px">${esc(s[0])}</div></div>`).join('')}</div>
      <form class="row st-form" style="gap:8px;margin-top:14px"><label class="sr" for="st-in">Responder</label><input id="st-in" class="input" placeholder="Responder a ${p.n.split(' ')[0]}…" style="flex:1;background:rgba(0,0,0,.35)"><button class="icon-btn glass" aria-label="Curtir story" type="button" data-stlike>${icon('heart', 22)}</button></form></div>`;
  phone.appendChild(o);
  const r = from.getBoundingClientRect(), pr = phone.getBoundingClientRect();
  A(o, [{ clipPath: `circle(30px at ${r.left - pr.left + r.width / 2}px ${r.top - pr.top + r.height / 2}px)` }, { clipPath: `circle(150% at ${r.left - pr.left + r.width / 2}px ${r.top - pr.top + r.height / 2}px)` }], { duration: 650, easing: 'out' });
  const bar = $('.st-bar', o); const an = A(bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 5000, easing: 'linear', fill: 'forwards' });
  const close = () => { if (o._c) return; o._c = true; A(o, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.92)' }], { duration: 280 }).finished.then(() => o.remove()); from.closest('.story') && from.closest('.story').classList.add('seen'); };
  an.finished.then(close); $('.st-x', o).onclick = close;
  $('#st-in', o).onfocus = () => an.pause(); $('#st-in', o).onblur = () => an.play();
  $('.st-form', o).onsubmit = e => { e.preventDefault(); toast(`Resposta enviada para ${p.n.split(' ')[0]} (prévia)`, 'comment'); close(); };
  $('[data-stlike]', o).onclick = e => { e.currentTarget.innerHTML = icon('heartFill', 22); e.currentTarget.classList.add('liked'); A($('svg', e.currentTarget), [{ transform: 'scale(.4)' }, { transform: 'none' }], { spring: [300, 12] }); haptic(8); };
}
function newPostSheet() {
  let sp = Store.get().sport;
  Sheet.open(`<h3 class="h2" data-e="0">Nova publicação</h3><div style="margin-top:16px" data-e="1">
    <div class="field"><label>Modalidade</label>${sportChips(sp, 'np')}</div>
    <div class="field"><label for="np-t">Título</label><input class="input" id="np-t" placeholder="Ex.: Evolução de 3 meses"></div>
    <div class="field"><label for="np-x">Legenda</label><textarea class="input" id="np-x" rows="3" placeholder="Conte como foi"></textarea></div>
    <button class="btn btn-ghost btn-block" style="margin-bottom:10px" data-np-photo>${icon('image', 18)}Adicionar foto de evolução</button>
    <button class="btn btn-white btn-block" data-np-go>Publicar</button></div>`,
    (w, close) => { w.addEventListener('click', e => { const c = e.target.closest('[data-np]'); if (c) { sp = c.dataset.np; $$('[data-np]', w).forEach(x => x.classList.toggle('on', x === c)); setAccent(sp); }
      if (e.target.closest('[data-np-photo]')) pickPhoto('post-' + sp, () => toast('Foto adicionada à publicação'));
      if (e.target.closest('[data-np-go]')) { const t = $('#np-t', w).value.trim() || 'Treino do dia'; Store.get().posts.unshift({ id: 'u' + Date.now(), who: 'me', sport: sp, t: 'agora', kind: 'activity', title: t, text: $('#np-x', w).value.trim() || 'Mais um dia de evolução.', stats: [['Modalidade', SPORTS[sp].name], ['Sequência', '12 dias'], ['Semana', '4 treinos']], likes: 0, comments: 0 }); Store.save(); close(); socialFilter = 'all'; Nav.go('social'); toast('Publicado'); } }); }, { label: 'Nova publicação' });
}

/* ---------------- Desafios ---------------- */
let chTab = 'ativos';
const allChallenges = () => [...(Store.get().customChallenges || []), ...CHALLENGES];
Screens.challenges = {
  render() {
    const s = Store.get(); const joined = allChallenges().filter(c => s.challengesJoined.includes(c.id) || c.custom);
    const disc = allChallenges().filter(c => !s.challengesJoined.includes(c.id) && !c.custom);
    const body = chTab === 'ativos' ? `<div class="stack">${joined.map((c, i) => `<div data-e="${3 + i}">${challengeCard(c, 'full')}</div>`).join('')}</div>`
      : chTab === 'descobrir' ? `<div class="stack">${disc.map((c, i) => `<div data-e="${3 + i}">${challengeCard(c, 'full')}</div>`).join('')}</div>`
      : chTab === 'grupos' ? `<div class="stack">${GROUPS.map((g, i) => `<div class="card" data-e="${3 + i}" style="--accent:${SPORTS[g.sport].c}"><div class="between"><div class="row"><span class="ico" style="width:48px;height:48px;border-radius:16px;display:grid;place-items:center;background:color-mix(in oklab,var(--accent) 18%,transparent);color:var(--accent)">${icon(SPORTS[g.sport].icon, 22)}</span><div><div class="h3">${g.name}</div><div class="muted small" style="margin-top:3px">${g.members} membros · ${g.priv ? 'Privado' : 'Público'}</div></div></div><div class="av-stack">${g.ppl.map(p => av(p, 'sm')).join('')}</div></div>
          <div class="row" style="margin-top:14px;gap:8px"><button class="btn btn-ghost btn-sm" style="flex:1" data-invite="${g.name}">${icon('link', 15)}Convidar</button><button class="btn btn-sm" style="flex:1;background:var(--accent);color:#0B0B0B" data-groupch="${g.sport}">Ver desafios</button></div></div>`).join('')}
          <button class="btn btn-ghost btn-block" data-e="7" id="new-group">${icon('plus', 18)}Criar grupo</button></div>`
      : `<div class="stack">${HISTORY.map((h, i) => `<div class="list-item" data-e="${3 + i}"><span class="ico" style="${h.medal ? 'color:var(--neon);background:rgba(163,255,18,.12)' : ''}">${icon(h.medal ? 'medal' : 'trophy', 21)}</span><div style="flex:1"><div class="h3">${h.name}</div><div class="muted small">${SPORTS[h.sport].name}</div></div><span class="tag ${h.medal ? 'neon' : ''}">${h.res}</span></div>`).join('')}</div>`;
    return `<div class="scroll"><div class="pad" style="padding-top:calc(var(--safe-top) + 10px)">
      <div class="between" data-e="0"><h1 class="display" style="font-size:26px">Desafios</h1><button class="icon-btn" style="background:var(--accent);color:#0B0B0B" aria-label="Criar desafio" id="ch-new">${icon('plus', 22, 2.2)}</button></div>
      <div class="card glass row" style="margin:16px 0;gap:16px" data-e="1">${ring(.76, { size: 76, sw: 7, color: '#A3FF12', inner: `<span class="num" style="font-size:18px">${fmt(2480)}</span>` })}<div style="flex:1"><div class="kicker">Pontuação da temporada</div><div class="h2" style="margin-top:6px">Nível 14 · Constante</div><div class="muted small" style="margin-top:4px">520 pts para o nível 15</div></div></div>
      <div data-e="2">${seg([['ativos', 'Ativos'], ['descobrir', 'Descobrir'], ['grupos', 'Grupos'], ['historico', 'Histórico']], chTab, 'cht')}</div>
      <div style="margin-top:18px" id="ch-body">${body}</div><div class="bottom-space"></div></div></div>`;
  },
  mount(el) {
    mountSeg($('.seg', el), b => { chTab = b.dataset.cht; const body = $('#ch-body', el); const tmp = document.createElement('div'); tmp.innerHTML = Screens.challenges.render(); const nb = $('#ch-body', tmp);
      A(body, [{ opacity: 1 }, { opacity: 0, transform: 'translateX(-16px)' }], { duration: 160 }).finished.then(() => { body.getAnimations().forEach(a => a.cancel()); body.innerHTML = nb.innerHTML; Motion.enter(body, 0, 55); }); });
    el.addEventListener('click', e => {
      if (e.target.closest('#ch-new')) createChallengeSheet();
      const inv = e.target.closest('[data-invite]'); if (inv) inviteSheet(inv.dataset.invite);
      const g = e.target.closest('[data-groupch]'); if (g) { chTab = 'descobrir'; Nav.refresh(); }
      if (e.target.closest('#new-group')) createGroupSheet();
    });
  },
  onReturn(el) { Nav.refresh(); },
};
function inviteSheet(name) {
  const link = `oragym.app/g/${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')}`;
  Sheet.open(`<h3 class="h2" data-e="0">Convidar para ${esc(name)}</h3><p class="muted small" data-e="1" style="margin:8px 0 14px">Link demonstrativo — o convite real exige a conta ativa.</p>
    <div class="row" data-e="2"><input class="input" readonly value="${link}" style="flex:1" aria-label="Link de convite"><button class="icon-btn" style="background:var(--accent);color:#0B0B0B" data-copy aria-label="Copiar link">${icon('copy', 19)}</button></div>
    <div class="section-head" data-e="3"><h3 class="h3">Amigos sugeridos</h3></div><div class="stack" data-e="4">${['marina', 'bia', 'theo'].map(p => `<div class="list-item">${av(p)}<div style="flex:1" class="h3">${PEOPLE[p].n}</div><button class="chip on" data-inv>Convidar</button></div>`).join('')}</div>`,
    w => w.addEventListener('click', async e => { if (e.target.closest('[data-copy]')) { try { await navigator.clipboard.writeText('https://' + link); toast('Link copiado'); } catch (x) { toast('Copie o link manualmente', 'x'); } }
      const b = e.target.closest('[data-inv]'); if (b) { b.textContent = 'Convidado'; b.classList.remove('on'); haptic(6); } }), { label: 'Convidar' });
}
function createGroupSheet() {
  Sheet.open(`<h3 class="h2" data-e="0">Novo grupo</h3><div style="margin-top:16px" data-e="1"><div class="field"><label for="gr-n">Nome do grupo</label><input class="input" id="gr-n" placeholder="Ex.: Corredores da manhã"></div>
    <div class="toggle-row" style="margin-bottom:14px"><span class="small">Grupo privado</span><button class="switch" role="switch" aria-checked="true" data-sw aria-label="Grupo privado"></button></div>
    <button class="btn btn-white btn-block" data-gr>Criar grupo</button></div>`, (w, close) => w.addEventListener('click', e => { const s = e.target.closest('[data-sw]'); if (s) s.setAttribute('aria-checked', s.getAttribute('aria-checked') !== 'true');
      if (e.target.closest('[data-gr]')) { const n = $('#gr-n', w).value.trim() || 'Meu grupo'; GROUPS.unshift({ name: n, members: 1, sport: Store.get().sport, priv: true, ppl: [] }); close(); chTab = 'grupos'; Nav.refresh(); toast('Grupo criado'); } }), { label: 'Novo grupo' });
}
function createChallengeSheet() {
  const d = { sport: Store.get().sport, metric: 0, target: 30, days: 30, priv: true };
  const metrics = { musculacao: [['Treinos concluídos', 'treinos'], ['Volume', 't']], corrida: [['Distância', 'km'], ['Corridas', 'corridas']], ciclismo: [['Distância', 'km'], ['Elevação', 'm']], calistenia: [['Repetições', 'reps'], ['Treinos', 'treinos']], futebol: [['Gols', 'gols'], ['Partidas', 'partidas']], natacao: [['Distância', 'km'], ['Treinos', 'treinos']], boxe: [['Rounds', 'rounds'], ['Dias ativos', 'dias']] };
  const today = new Date(); const iso = x => x.toISOString().slice(0, 10); const end = new Date(today.getTime() + 30 * 864e5);
  Sheet.open(`<h3 class="h2" data-e="0">Criar desafio</h3><div style="margin-top:16px" data-e="1">
    <div class="field"><label for="cc-n">Nome</label><input class="input" id="cc-n" placeholder="Ex.: 100 km em dezembro"></div>
    <div class="field"><label>Modalidade</label>${sportChips(d.sport, 'ccs')}</div>
    <div class="field"><label>Métrica</label><div class="row cc-metrics" style="gap:8px;flex-wrap:wrap">${metrics[d.sport].map((m, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-ccm="${i}">${m[0]}</button>`).join('')}</div></div>
    <div class="field"><label>Objetivo</label><div class="stepper"><button class="icon-btn" data-cct="-5" aria-label="Diminuir objetivo">${icon('minus', 18)}</button><div class="live-num" style="font-size:42px"><span id="cc-t">30</span> <span class="cc-u" style="font-size:16px;font-style:normal;color:var(--mute)">${metrics[d.sport][0][1]}</span></div><button class="icon-btn" data-cct="5" aria-label="Aumentar objetivo">${icon('plus', 18)}</button></div></div>
    <div class="grid2"><div class="field"><label for="cc-a">Início</label><input class="input" type="date" id="cc-a" value="${iso(today)}"></div><div class="field"><label for="cc-b">Término</label><input class="input" type="date" id="cc-b" value="${iso(end)}"></div></div>
    <div class="toggle-row" style="margin-bottom:16px"><span><span class="h3" style="display:block">Desafio privado</span><span class="muted small">Só convidados participam</span></span><button class="switch" role="switch" aria-checked="true" data-ccp aria-label="Desafio privado"></button></div>
    <button class="btn btn-white btn-block" data-ccgo>Criar e convidar amigos</button></div>`,
    (w, close) => w.addEventListener('click', e => {
      const sp = e.target.closest('[data-ccs]'); if (sp) { d.sport = sp.dataset.ccs; d.metric = 0; setAccent(d.sport); $$('[data-ccs]', w).forEach(x => x.classList.toggle('on', x === sp)); $('.cc-metrics', w).innerHTML = metrics[d.sport].map((m, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-ccm="${i}">${m[0]}</button>`).join(''); $('.cc-u', w).textContent = metrics[d.sport][0][1]; }
      const m = e.target.closest('[data-ccm]'); if (m) { d.metric = +m.dataset.ccm; $$('[data-ccm]', w).forEach(x => x.classList.toggle('on', x === m)); $('.cc-u', w).textContent = metrics[d.sport][d.metric][1]; }
      const t = e.target.closest('[data-cct]'); if (t) { d.target = Math.max(1, d.target + +t.dataset.cct); const n = $('#cc-t', w); n.textContent = d.target; A(n, [{ transform: 'translateY(8px)', opacity: .3 }, { transform: 'none', opacity: 1 }], { spring: [300, 18] }); haptic(5); }
      const p = e.target.closest('[data-ccp]'); if (p) p.setAttribute('aria-checked', p.getAttribute('aria-checked') !== 'true');
      if (e.target.closest('[data-ccgo]')) {
        const a = new Date($('#cc-a', w).value), b = new Date($('#cc-b', w).value); const days = Math.max(1, Math.round((b - a) / 864e5));
        const c = { id: 'u' + Date.now(), custom: true, sport: d.sport, name: $('#cc-n', w).value.trim() || `${d.target} ${metrics[d.sport][d.metric][1]} de ${SPORTS[d.sport].name.toLowerCase()}`, metric: metrics[d.sport][d.metric][0], target: d.target, mine: 0, unit: metrics[d.sport][d.metric][1], days, kind: $('[data-ccp]', w).getAttribute('aria-checked') === 'true' ? 'Privado' : 'Público', group: 'Criado por você', rank: [['me', 0]] };
        Store.get().customChallenges.unshift(c); Store.save(); close(); chTab = 'ativos'; Nav.refresh(); setTimeout(() => inviteSheet(c.name), 350);
      } }), { label: 'Criar desafio' });
}

/* ---------------- Challenge detail: ranking with overtakes ---------------- */
Screens.challenge = {
  render({ id }) {
    const c = allChallenges().find(x => x.id === id); const sp = SPORTS[c.sport]; setAccent(c.sport);
    const joined = Store.get().challengesJoined.includes(c.id) || c.custom; const p = clamp(c.mine / c.target, 0, 1);
    const rank = [...c.rank].sort((a, b) => b[1] - a[1]);
    return `<div class="topbar"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">${esc(c.name)}</div><button class="icon-btn glass" aria-label="Convidar" data-chinv>${icon('link', 18)}</button></div>
    <div class="scroll"><div style="position:relative;height:380px"><div class="hero-stack" style="position:absolute;inset:0">${scene('ch-' + c.id, c.sport, { word: c.unit.toUpperCase() })}</div>
      <div style="position:absolute;left:20px;right:20px;bottom:20px"><span class="tag" style="color:${sp.c}" data-e="0">${icon(sp.icon, 13, 2)}${sp.name} · ${c.kind}</span><h1 class="display" style="font-size:34px;margin:12px 0 8px" data-e="1">${esc(c.name)}</h1><div class="muted" data-e="2">${c.metric} · termina em ${c.days} dias</div></div></div>
      <div class="pad">
      <div class="card" data-e="3"><div class="between" style="align-items:flex-end"><div><div class="kicker">Seu progresso</div><div class="num" style="font-size:44px;margin-top:6px"><span id="chd-mine" data-count="${c.mine}" data-dec="${c.mine % 1 ? 1 : 0}">0</span><span style="font-size:16px;font-style:normal;color:var(--mute)"> / ${fmt(c.target)} ${c.unit}</span></div></div>${ring(p, { size: 70, sw: 6, inner: `<span class="num" style="font-size:16px" id="chd-pct">${Math.round(p * 100)}%</span>` })}</div>
        <div class="bar" style="margin-top:14px;height:10px"><i id="chd-bar" data-bar="${p}" style="transform:scaleX(0)"></i></div>
        ${joined ? `<button class="btn btn-accent btn-block" style="margin-top:16px" id="chd-sync">${icon('refresh', 18)}Sincronizar treino de hoje</button>` : `<button class="btn btn-white btn-block" style="margin-top:16px" id="chd-join">Participar do desafio</button>`}</div>
      <div class="section-head" data-e="4"><h2 class="h2">Ranking</h2><span class="muted small">${rank.length} participantes</span></div>
      <div class="stack" id="chd-rank" style="gap:8px" data-e="5">${rank.map((r, i) => rankRow(r, i, c)).join('')}</div>
      <div class="section-head" data-e="6"><h2 class="h2">Regras</h2></div>
      <div class="card small muted" style="line-height:1.6" data-e="7">Vale toda atividade de ${sp.name.toLowerCase()} registrada no Ora Gym entre o início e o término. Ganha quem acumular mais ${c.unit}. Conquista desbloqueada ao atingir ${fmt(c.target)} ${c.unit}.</div>
      <div style="margin-top:20px;text-align:center">${demoBadge()}</div><div style="height:50px"></div></div></div>`;
  },
  mount(el, { id }) {
    const c = allChallenges().find(x => x.id === id);
    bindScrollFx(el, { bar: $('.topbar', el), hero: $('.hero-stack', el), threshold: 260 });
    $('[data-chinv]', el).onclick = () => inviteSheet(c.group || c.name);
    const join = $('#chd-join', el); if (join) join.onclick = () => { Store.get().challengesJoined.push(c.id); Store.save(); haptic([10, 30, 10]); c.rank.push(['me', 0]);
      toast('Você entrou no desafio'); const e = Nav.stack[Nav.stack.length - 1]; e.el.innerHTML = Screens.challenge.render({ id }); Screens.challenge.mount(e.el, { id }); Motion.enter(e.el, 0, 30); };
    const sync = $('#chd-sync', el);
    if (sync) sync.onclick = async () => {
      if (sync._busy) return; sync._busy = true; haptic(10);
      sync.innerHTML = `${icon('refresh', 18)}Sincronizando…`; A($('svg', sync), [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 700, iterations: 1 }); await wait(700);
      const gain = c.target >= 100 ? +(c.target * .09).toFixed(1) : Math.max(1, Math.round(c.target * .12));
      const old = c.mine; c.mine = +(Math.min(c.target, c.mine + gain)).toFixed(1); const me = c.rank.find(r => r[0] === 'me'); if (me) me[1] = c.mine;
      const mEl = $('#chd-mine', el); Motion.tween(old, c.mine, 900, v => mEl.textContent = fmt(v, c.mine % 1 ? 1 : 0));
      const p = clamp(c.mine / c.target, 0, 1); A($('#chd-bar', el), [{ transform: `scaleX(${old / c.target})` }, { transform: `scaleX(${p})` }], { duration: 900, easing: 'out' }); $('#chd-pct', el).textContent = Math.round(p * 100) + '%';
      // Ranking overtake animation (FLIP)
      const list = $('#chd-rank', el); const rows = $$('[data-rk]', list); const before = rows.findIndex(r => r.dataset.rk === 'me');
      const sorted = [...c.rank].sort((a, b) => b[1] - a[1]); const after = sorted.findIndex(r => r[0] === 'me');
      Motion.flip(rows, () => { sorted.forEach((r, i) => { const row = rows.find(x => x.dataset.rk === r[0]); list.appendChild(row); $('.rk-pos', row).textContent = i + 1; $('.rk-val', row).textContent = `${fmt(r[1], r[1] % 1 ? 1 : 0)} ${c.unit}`; }); }, { spring: [120, 16] });
      if (after < before) { const row = rows.find(x => x.dataset.rk === 'me'); A(row, [{ boxShadow: '0 0 0 1px var(--accent), 0 0 30px -4px var(--accent)' }, { boxShadow: '0 0 0 1px var(--accent), 0 0 0 0 transparent' }], { duration: 1600, easing: 'out' });
        setTimeout(() => toast(`Você subiu para #${after + 1} — passou ${PEOPLE[sorted[after + 1][0]].n.split(' ')[0]}`, 'up'), 500); }
      sync.innerHTML = `${icon('refresh', 18)}Sincronizar treino de hoje`; sync._busy = false;
      if (c.mine >= c.target && !c._won) { c._won = true; await wait(900); await celebrate({ title: 'Desafio concluído', sub: c.name, big: `${fmt(c.target)} ${c.unit}`, points: 500, color: '#A3FF12', icon: 'trophy' }); }
    };
  },
};
function rankRow(r, i, c) {
  const me = r[0] === 'me';
  return `<div class="list-item" data-rk="${r[0]}" style="${me ? 'border-color:color-mix(in oklab,var(--accent) 60%,transparent);background:color-mix(in oklab,var(--accent) 10%,transparent)' : ''}">
    <span class="num rk-pos" style="font-size:22px;width:26px;text-align:center;${i < 3 ? 'color:var(--neon)' : 'color:var(--mute)'}">${i + 1}</span>${me ? meAv() : av(r[0])}
    <div style="flex:1"><div class="h3">${me ? 'Você' : PEOPLE[r[0]].n}</div><div class="muted small rk-val">${fmt(r[1], r[1] % 1 ? 1 : 0)} ${c.unit}</div></div>${i === 0 ? `<span style="color:var(--neon)">${icon('trophy', 20)}</span>` : ''}</div>`;
}
