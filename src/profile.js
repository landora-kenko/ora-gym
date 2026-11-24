/* ============================================================
   ORA GYM — Perfil, configurações (privacidade/LGPD/conta),
   loja, música e alimentação — tudo ligado à conta
   ============================================================ */
const LEVELS = ['Iniciante', 'Intermediário', 'Avançado'];

Screens.profile = {
  render() {
    const me = API.me; const main = mySports()[0]; const ach = Stats.achievements(API.acts, me); const got = ach.filter(a => a[2]).length;
    const streak = Stats.streak(API.acts);
    return `<div class="scroll"><div class="pf-hero" style="position:relative;height:500px">
      <div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('profile', main, { pos: 'center 15%' })}</div>
      <div class="between" style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 4px)"><div class="m-only" data-e="1" data-ek="fade">${brandLockup(22)}</div><span class="d-only"></span>
        <button class="icon-btn glass" aria-label="Configurações" data-push="settings" data-e="1" data-ek="fade">${icon('settings', 20)}</button></div>
      <div class="page" style="position:absolute;left:0;right:0;bottom:22px;padding:0 20px">
        <div class="row" style="gap:14px;margin-bottom:14px" data-e="2">${meAv('lg')}<div><div class="row" style="gap:6px"><span class="tag">${me.private ? icon('lock', 12, 2) + 'Privado' : 'Público'}</span><span class="tag neon">${esc(me.level || 'Intermediário')}</span></div><div class="muted small" style="margin-top:8px">@${esc(me.handle)}</div></div></div>
        <h1 class="display pf-name" style="font-size:43px;margin:0 0 18px">${esc(me.name)}</h1>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);max-width:560px" data-e="4">${[[API.acts.length, 'Atividades'], [streak, 'Dias seguidos'], [got, 'Conquistas'], [mySports().length, 'Esportes']].map(x => `<div><div class="num" style="font-size:32px;line-height:1"><span data-count="${x[0]}">0</span></div><div class="muted" style="font-size:11px;margin-top:6px">${x[1]}</div></div>`).join('')}</div></div></div>
      <div class="pad page">
        ${me.bio ? `<p style="margin:4px 0 14px;line-height:1.55;color:#D3DCE8">${esc(me.bio)}</p>` : ''}
        <div class="row" style="gap:10px;margin-top:6px;max-width:560px" data-e="5"><button class="btn btn-white" style="flex:1" id="pf-edit">Editar perfil</button><button class="icon-btn" style="width:56px;height:56px;background:rgba(255,255,255,.06);border:1px solid var(--stroke)" aria-label="Compartilhar perfil" id="pf-share">${icon('share', 20)}</button></div>
        <div class="row" style="gap:18px;margin-top:18px;justify-content:space-around;max-width:560px" data-e="6">${[[me.postsCount || 0, 'Publicações', ''], [me.followersCount || 0, 'Seguidores', 'followers'], [me.followingCount || 0, 'Seguindo', 'following']].map(x => `<button style="text-align:center" ${x[2] ? `data-flist="${x[2]}"` : ''}><div class="h2">${fmt(x[0])}</div><div class="muted small">${x[1]}</div></button>`).join('')}</div>
        <div class="wsec" data-e="7"><h2>Modalidades</h2><button class="link" id="pf-sports">Editar</button></div>
        <div class="hscroll" data-e="8">${mySports().map(id => { const x = SPORTS[id]; const S = SS(id); return `<button class="card press" style="width:160px;flex:none;text-align:left;--accent:${x.c}" data-push="world" data-params='{"id":"${id}"}'><span style="color:${x.c}">${icon(x.icon, 24)}</span><div class="h3" style="margin-top:14px">${x.name}</div><div class="num" style="font-size:22px;margin-top:4px">${S.count}</div><div class="muted" style="font-size:11px">${S.count === 1 ? 'atividade' : 'atividades'}</div></button>`; }).join('')}</div>
        <div class="wsec" data-e="9"><h2>Conquistas</h2><span class="muted small">${got}/${ach.length}</span></div>
        <div class="grid3 pf-ach" data-e="10">${ach.map((b, i) => `<button class="card press" style="padding:16px 8px;text-align:center;${b[2] ? '' : 'opacity:.5'}" data-badge="${i}" aria-label="${b[0]}${b[2] ? '' : ' (bloqueada)'}">
          <span style="display:grid;place-items:center;width:54px;height:54px;margin:0 auto;border-radius:50%;${b[2] ? 'background:radial-gradient(circle at 35% 30%,#5c0a10,#1a0507);color:#FF4A57;box-shadow:0 0 0 1px rgba(227,25,43,.45),0 0 24px -6px #E3192B' : 'background:rgba(255,255,255,.05);color:var(--mute)'}">${icon(b[2] ? b[1] : 'lock', 24)}</span><span class="small" style="display:block;margin-top:10px">${b[0]}</span></button>`).join('')}</div>
        <div class="wsec" data-e="11"><h2>Recordes pessoais</h2></div>
        <div data-e="12">${(() => { const R = mySports().flatMap(id => SS(id).records.slice(0, 2).map(r => [id, r])); return R.length ? `<div class="stack pf-rec">${R.map(([id, r]) => `<div class="list-item" style="--accent:${SPORTS[id].c}"><span class="ico" style="color:${SPORTS[id].c}">${icon(SPORTS[id].icon, 20)}</span><div style="flex:1;min-width:0"><div class="h3">${esc(r.k)}</div><div class="muted small">${SPORTS[id].name} · ${esc(r.d)}</div></div><span class="num" style="font-size:18px">${esc(r.v)}</span></div>`).join('')}</div>` : emptyBox('Seus recordes aparecem aqui conforme você registra atividades.'); })()}</div>
        <div class="wsec" data-e="13"><h2>Publicações</h2><button class="link" data-compose-me>+ Publicar</button></div>
        <div data-async="pf-posts" data-e="14"><div class="card skeleton" style="height:120px"></div></div>
        <div class="wsec"><h2>Atalhos</h2></div>
        <div class="grid2 pf-short">${[['shop', 'bag', 'Loja esportiva'], ['music', 'music', 'Música'], ['nutrition', 'leaf', 'Alimentação'], ['settings', 'shield', 'Privacidade e conta']].map(([sc, ic, l]) => `<button class="list-item press" style="text-align:left" data-push="${sc}" data-params='{"id":"${main}"}'><span class="ico">${icon(ic, 20)}</span><span class="h3">${l}</span></button>`).join('')}</div>
        <div class="bottom-space"></div></div></div>`;
  },
  mount(el) {
    Motion.kinetic($('.pf-name', el), 300); bindScrollFx(el, { hero: $('.hero-stack', el) }); hydrateImages(el);
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-badge]'); if (b) { const x = Stats.achievements(API.acts, API.me)[+b.dataset.badge];
        Sheet.open(`<div style="text-align:center;padding:10px 0"><span style="display:grid;place-items:center;width:70px;height:70px;margin:0 auto;border-radius:50%;background:${x[2] ? 'rgba(227,25,43,.16);color:#FF4A57' : 'rgba(255,255,255,.06)'}" data-e="0">${icon(x[2] ? x[1] : 'lock', 28)}</span><h3 class="h2" style="margin-top:16px" data-e="1">${x[0]}</h3><p class="muted small" data-e="2">${x[2] ? 'Conquista desbloqueada.' : `Progresso: ${Math.round(x[3] * 100)}%`}</p><div class="bar" style="margin:16px 30px 0" data-e="3"><i data-bar="${x[3]}" style="transform:scaleX(0)"></i></div></div>`, w => Motion.fillBars(w), { label: x[0] }); }
      if (e.target.closest('#pf-edit')) editProfileSheet();
      if (e.target.closest('#pf-share')) shareSheet(`${API.me.name} no OraGym`, `@${API.me.handle} · ${mySports().map(i => SPORTS[i].name).join(', ')}`, location.origin + location.pathname);
      if (e.target.closest('#pf-sports')) editSportsSheet();
      if (e.target.closest('[data-compose-me]')) composePost({});
      const fl = e.target.closest('[data-flist]'); if (fl) followListSheet(API.me.id, fl.dataset.flist);
    });
    (async () => { const box = $('[data-async="pf-posts"]', el); try { const L = await API.postsBy(API.me.id);
      box.innerHTML = L.length ? `<div class="pf-posts">${L.map(p => postCard(p, true)).join('')}</div>` : emptyBox('Sem publicações ainda. Conclua uma atividade e publique o resultado.'); hydrateImages(box); wirePosts(box); } catch (x) { box.innerHTML = emptyBox(errMsg(x)); } })();
  },
  onReturn() { Nav.refresh(); },
};
async function followListSheet(id, kind) {
  Sheet.open(`<h3 class="h2">${kind === 'followers' ? 'Seguidores' : 'Seguindo'}</h3><div class="stack fl-list" style="gap:8px;margin-top:14px"><div class="skeleton" style="height:56px;border-radius:16px"></div></div>`,
    async (w, close) => { const box = $('.fl-list', w); wireUserRows(box, close);
      try { const rows = kind === 'followers' ? await API.followersOf(id) : await API.followingOf(id); const users = (await Promise.all(rows.map(r => API.getUser(r.id).catch(() => null)))).filter(Boolean);
        box.innerHTML = users.length ? users.map(userRow).join('') : '<p class="muted small">Ninguém por aqui ainda.</p>'; hydrateImages(box); } catch (x) { box.innerHTML = `<p class="muted small">${errMsg(x)}</p>`; } }, { label: 'Pessoas' });
}
function editProfileSheet() {
  const me = API.me; let avatarData = null; let lvl = me.level || 'Intermediário';
  Sheet.open(`<h3 class="h2" data-e="0">Editar perfil</h3><div style="margin-top:16px" data-e="1"><div class="row ep-av" style="margin-bottom:16px;gap:14px">${meAv('lg')}<button class="btn btn-ghost btn-sm" data-av>${icon('camera', 16)}Trocar foto</button></div>
    <div class="field"><label for="ep-n">Nome</label><input class="input" id="ep-n" value="${esc(me.name)}" maxlength="50" autocomplete="name"></div>
    <div class="field"><label for="ep-h">Usuário</label><input class="input" id="ep-h" value="@${esc(me.handle)}" maxlength="25" autocapitalize="off" spellcheck="false"></div>
    <div class="field"><label for="ep-b">Bio</label><textarea class="input" id="ep-b" rows="3" maxlength="160" placeholder="Conte um pouco sobre seus treinos">${esc(me.bio || '')}</textarea></div>
    <div class="field"><label>Nível</label>${seg(LEVELS.map(l => [l, l]), lvl, 'eplvl')}</div>
    <button class="btn btn-white btn-block" data-ep>Salvar</button></div>`,
    (w, close) => { mountSeg($('.seg', w), b => lvl = b.dataset.eplvl); hydrateImages(w);
      w.addEventListener('click', async e => {
        if (e.target.closest('[data-av]')) { const d = await chooseImage(480, .82); if (d) { avatarData = d; const av = $('.ep-av .av', w); av.style.backgroundImage = `url("${d}")`; av.style.backgroundSize = 'cover'; av.textContent = ''; } }
        const s = e.target.closest('[data-ep]'); if (s) { const name = $('#ep-n', w).value.trim(); if (name.length < 2) return toast('Informe seu nome', 'x'); s.disabled = true; s.textContent = 'Salvando…';
          try { const patch = { name, handle: $('#ep-h', w).value.replace(/^@/, '').trim(), bio: $('#ep-b', w).value.trim(), level: lvl };
            if (avatarData) { const old = API.me.avatar; patch.avatar = await API.putImage(avatarData); if (old) API.removeImage && API.removeImage(old).catch(() => {}); }
            await API.updateProfile(patch); close(); Nav.refresh(); toast('Perfil atualizado'); } catch (x) { s.disabled = false; s.textContent = 'Salvar'; toast(errMsg(x), 'x'); } } }); }, { label: 'Editar perfil' });
}
function editSportsSheet() {
  const sel = [...mySports()];
  Sheet.open(`<h3 class="h2" data-e="0">Seus esportes</h3><p class="muted small" style="margin:6px 0 0">O primeiro da lista é o seu principal.</p><div class="grid2" style="margin-top:16px" data-e="1">${SPORT_IDS.map(id => `<button class="opt ${sel.includes(id) ? 'on' : ''}" style="--accent:${SPORTS[id].c};padding:14px" data-es="${id}" aria-pressed="${sel.includes(id)}"><span style="color:${SPORTS[id].c}">${icon(SPORTS[id].icon, 20)}</span><span class="h3" style="font-size:14px">${SPORTS[id].name}</span><span class="check">${icon('check', 15, 2.6)}</span></button>`).join('')}</div>
    <button class="btn btn-white btn-block" style="margin-top:16px" data-es-ok>Salvar</button>`,
    (w, close) => w.addEventListener('click', async e => { const b = e.target.closest('[data-es]'); if (b) { const i = sel.indexOf(b.dataset.es); i >= 0 ? sel.splice(i, 1) : sel.push(b.dataset.es); b.classList.toggle('on'); b.setAttribute('aria-pressed', i < 0); haptic(5); }
      if (e.target.closest('[data-es-ok]')) { if (!sel.length) return toast('Escolha ao menos um esporte', 'x'); try { await API.updateProfile({ sports: sel }); close(); trainSport = null; Nav.refresh(); toast('Esportes atualizados'); } catch (x) { toast(errMsg(x), 'x'); } } }), { label: 'Esportes' });
}

/* ---------------- Configurações: privacidade, conta, LGPD ---------------- */
Screens.settings = {
  render() {
    const me = API.me; const pv = me.privacy || {};
    const sw = (k, on, t, d) => `<div class="toggle-row"><span><span class="h3" style="display:block">${t}</span><span class="muted small">${d}</span></span><button class="switch" role="switch" aria-checked="${!!on}" data-pv="${k}" aria-label="${t}"></button></div>`;
    return `<div class="topbar solid"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Configurações</div><span style="width:46px"></span></div>
    <div class="scroll"><div class="pad page" style="padding-top:calc(var(--safe-top) + 70px);max-width:680px">
      <div class="kicker" data-e="0">Conta</div><div class="stack" style="gap:8px;margin-top:12px" data-e="1">
        <div class="list-item"><span class="ico">${icon('mail', 20)}</span><div style="flex:1;min-width:0"><div class="h3">E-mail</div><div class="muted small" style="overflow:hidden;text-overflow:ellipsis">${esc(me.email || '—')}</div></div></div>
        <button class="list-item press" style="text-align:left" id="st-pass"><span class="ico">${icon('lock', 20)}</span><div style="flex:1"><div class="h3">Redefinir senha</div><div class="muted small">Enviamos um link para o seu e-mail</div></div>${icon('next', 18)}</button>
        <button class="list-item press" style="text-align:left" id="st-out"><span class="ico">${icon('back', 20)}</span><div style="flex:1"><div class="h3">Sair da conta</div></div></button></div>
      <div class="kicker" style="margin-top:28px" data-e="2">Privacidade</div><div class="stack" style="gap:8px;margin-top:12px" data-e="3">
        ${sw('private', me.private, 'Perfil privado', 'Suas atividades e publicações ficam visíveis só para você')}
        ${sw('hideRouteEnds', pv.hideRouteEnds, 'Zona de privacidade', 'Oculta os primeiros e últimos 200 m dos trajetos publicados')}
        ${sw('showWeight', pv.showWeight, 'Mostrar cargas nas publicações', 'Exibe o volume levantado nos posts de musculação')}</div>
      <div class="card row" style="margin-top:10px;gap:12px"><span style="color:#A3FF12">${icon('pin', 20)}</span><div class="small muted" style="line-height:1.5">A localização é usada somente enquanto você grava uma corrida ou pedal, e nunca em segundo plano.</div></div>
      <div class="kicker" style="margin-top:28px" data-e="4">Seus dados (LGPD)</div><div class="stack" style="gap:8px;margin-top:12px" data-e="5">
        <button class="list-item press" style="text-align:left" id="st-export"><span class="ico">${icon('copy', 20)}</span><div style="flex:1"><div class="h3">Baixar meus dados</div><div class="muted small">Arquivo JSON com perfil, atividades, fichas, posts e alimentação</div></div></button>
        <button class="list-item press" style="text-align:left" id="st-delete"><span class="ico" style="color:#FF4D5E;background:rgba(255,77,94,.12)">${icon('trash', 20)}</span><div style="flex:1"><div class="h3">Excluir minha conta</div><div class="muted small">Apaga a conta e todos os seus dados de forma permanente</div></div></button></div>
      <div class="kicker" style="margin-top:28px" data-e="6">Acessibilidade</div><div class="stack" style="gap:8px;margin-top:12px" data-e="7">
        <div class="toggle-row"><span><span class="h3" style="display:block">Reduzir movimento</span><span class="muted small">Troca animações por transições simples</span></span><button class="switch" role="switch" aria-checked="${Motion.reduced}" id="st-rm" aria-label="Reduzir movimento"></button></div></div>
      <div class="kicker" style="margin-top:28px">Sobre</div><div class="stack" style="gap:8px;margin-top:12px"><button class="list-item press" style="text-align:left" id="st-terms"><span class="ico">${icon('shield', 20)}</span><div style="flex:1"><div class="h3">Termos e privacidade</div></div>${icon('next', 18)}</button></div>
      <p class="muted" style="font-size:11px;text-align:center;margin-top:24px">OraGym · versão 1.0</p>
      <div style="height:40px"></div></div></div>`;
  },
  mount(el) {
    el.addEventListener('click', async e => {
      const s = e.target.closest('[data-pv]'); if (s) { const k = s.dataset.pv; const v = s.getAttribute('aria-checked') !== 'true'; s.setAttribute('aria-checked', v); haptic(6);
        try { if (k === 'private') { await API.updateProfile({ private: v }); await API.setPostsVisibility(v ? 'followers' : 'public'); } else await API.updateProfile({ privacy: { ...(API.me.privacy || {}), [k]: v } }); toast('Preferência salva'); } catch (x) { s.setAttribute('aria-checked', !v); toast(errMsg(x), 'x'); } }
      if (e.target.closest('#st-pass')) { try { await API.auth.reset(API.me.email); toast('Link enviado para ' + API.me.email, 'mail'); } catch (x) { toast(errMsg(x), 'x'); } }
      if (e.target.closest('#st-out')) { if (await confirmDialog('Sair da conta?', 'Você pode entrar de novo quando quiser.', 'Sair')) await API.auth.signOut(); }
      if (e.target.closest('#st-export')) { try { const d = await API.exportData(); const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `oragym-${API.me.handle}-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('Arquivo gerado'); } catch (x) { toast(errMsg(x), 'x'); } }
      if (e.target.closest('#st-delete')) { if (!(await confirmDialog('Excluir sua conta?', 'Perfil, atividades, fichas, publicações, comentários e fotos serão apagados para sempre. Isso não pode ser desfeito.', 'Excluir tudo', true))) return;
        const t = document.createElement('div'); t.className = 'busy-veil'; t.innerHTML = '<div class="spinner"></div><div class="muted small" style="margin-top:14px">Excluindo seus dados…</div>'; document.body.appendChild(t);
        try { await API.deleteAccount(); toast('Conta excluída', 'trash'); } catch (x) { toast(x && x.code === 'auth/requires-recent-login' ? 'Por segurança, saia e entre de novo antes de excluir a conta.' : errMsg(x), 'x'); } t.remove(); }
      const rm = e.target.closest('#st-rm'); if (rm) { const v = rm.getAttribute('aria-checked') !== 'true'; rm.setAttribute('aria-checked', v); Motion.setReduced(v); Store.set({ reduced: v }); }
      if (e.target.closest('#st-terms')) termsSheet();
    });
  },
};

/* ---------------- Loja: curadoria com busca real em lojas ---------------- */
const favs = () => Store.get().favs || {};
function productCard(p, sid, i, auto) {
  const k = sid + i; const fav = !!favs()[k];
  return `<div class="product" style="position:relative;--sc:${SPORTS[sid].c};${auto ? 'width:auto' : ''}"><a class="pimg press" style="width:100%;display:block" href="${shopUrl(p[0] + ' ' + SPORTS[sid].name)}" target="_blank" rel="noopener" aria-label="Buscar ${esc(p[0])} nas lojas">${productArt(p[2])}</a>
    <button class="fav ${fav ? 'on' : ''}" data-fav="${k}" aria-label="Favoritar ${esc(p[0])}" aria-pressed="${fav}" style="top:10px;right:10px;position:absolute">${icon(fav ? 'heartFill' : 'heart', 17)}</button>
    <div style="margin-top:10px"><div class="h3" style="font-size:14px">${esc(p[0])}</div><div class="muted small" style="margin-top:3px">${esc(p[1])} · comparar preços ${icon('up', 12, 2, 'style="display:inline;vertical-align:-1px;transform:rotate(45deg)"')}</div></div></div>`;
}
function wireProducts(root) {
  if (root._prodWired) return; root._prodWired = true;
  root.addEventListener('click', e => { const f = e.target.closest('[data-fav]'); if (!f) return; e.preventDefault(); const F = { ...favs() }; const k = f.dataset.fav; const on = !F[k]; on ? F[k] = 1 : delete F[k]; Store.set({ favs: F });
    f.classList.toggle('on', on); f.setAttribute('aria-pressed', on); f.innerHTML = icon(on ? 'heartFill' : 'heart', 17); A($('svg', f), [{ transform: 'scale(.4)' }, { transform: 'none' }], { spring: [300, 12] }); haptic(6); });
}
Screens.shop = {
  render({ id }) {
    id = SPORTS[id] ? id : mySports()[0]; setAccent(id); const sp = SPORTS[id];
    return `<div class="topbar"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Loja</div><button class="icon-btn glass" aria-label="Favoritos" id="shop-favs">${icon('heart', 19)}</button></div>
    <div class="scroll"><div style="position:relative;height:300px"><div style="position:absolute;inset:0" class="shop-hero">${scene(id, id, {})}</div>
      <div class="page" style="position:absolute;left:0;right:0;bottom:18px;padding:0 20px"><div class="kicker" data-e="0">Seleção esportiva</div><h1 class="display shop-title" style="font-size:36px;margin:8px 0 0">Equipe-se para ${sp.name.toLowerCase()}</h1></div></div>
      <div class="pad page"><div data-e="1">${sportChips(id, 'shs')}</div>
      <div id="shop-grid" class="shop-grid" style="margin-top:18px" data-e="3">${SHOP[id].map((p, i) => productCard(p, id, i, true)).join('')}</div>
      <div class="card row" style="margin-top:20px;gap:12px" data-e="4"><span style="color:var(--accent)">${icon('link', 20)}</span><div class="small muted" style="line-height:1.5">Os produtos abrem uma busca de preços em lojas online. A compra acontece direto na loja escolhida — o OraGym não processa pagamentos.</div></div>
      <div style="height:40px"></div></div></div>`;
  },
  mount(el, { id }) {
    let cur = SPORTS[id] ? id : mySports()[0]; Motion.kinetic($('.shop-title', el), 200); bindScrollFx(el, { bar: $('.topbar', el), threshold: 200 }); wireProducts(el);
    el.addEventListener('click', e => {
      const s = e.target.closest('[data-shs]'); if (s) { cur = s.dataset.shs; setAccent(cur); $$('[data-shs]', el).forEach(x => x.classList.toggle('on', x === s));
        const h = $('.shop-hero', el); h.innerHTML = scene(cur, cur, {}); A(h, [{ opacity: 0, transform: 'scale(1.08)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'out' });
        const t = $('.shop-title', el); t.textContent = `Equipe-se para ${SPORTS[cur].name.toLowerCase()}`; Motion.kinetic(t, 0);
        const g = $('#shop-grid', el); g.innerHTML = SHOP[cur].map((p, i) => productCard(p, cur, i, true)).join(''); $$('.product', g).forEach((x, k) => A(x, [{ opacity: 0, transform: 'translateY(16px) scale(.96)' }, { opacity: 1, transform: 'none' }], { spring: [180, 20], delay: k * 50 })); }
      if (e.target.closest('#shop-favs')) { const f = Object.keys(favs()).filter(k => { const sid = k.replace(/\d+$/, ''); return SHOP[sid] && SHOP[sid][+k.match(/\d+$/)[0]]; });
        Sheet.open(`<h3 class="h2" data-e="0">Favoritos</h3><div class="stack" style="margin-top:14px" data-e="1">${f.length ? f.map(k => { const sid = k.replace(/\d+$/, ''), i = +k.match(/\d+$/)[0]; const p = SHOP[sid][i]; return `<a class="list-item press" href="${shopUrl(p[0] + ' ' + SPORTS[sid].name)}" target="_blank" rel="noopener" style="--accent:${SPORTS[sid].c}"><span class="ico" style="color:${SPORTS[sid].c}">${icon(SPORTS[sid].icon, 20)}</span><div style="flex:1"><div class="h3">${p[0]}</div><div class="muted small">${SPORTS[sid].name}</div></div>${icon('next', 18)}</a>`; }).join('') : '<p class="muted">Toque no coração de um produto para salvá-lo aqui.</p>'}</div>`, null, { label: 'Favoritos' }); }
    });
  },
};

/* ---------------- Música: abre playlists reais no Spotify / Apple Music ---------------- */
Screens.music = {
  render({ id }) {
    id = SPORTS[id] ? id : mySports()[0]; setAccent(id);
    return `<div class="topbar solid"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Música</div><span style="width:46px"></span></div>
    <div class="scroll"><div class="pad page" style="padding-top:calc(var(--safe-top) + 70px)">
      <div data-e="0">${sportChips(id, 'mus')}</div>
      <div id="mus-body">${musicBody(id)}</div><div style="height:40px"></div></div></div>`;
  },
  mount(el) {
    el.addEventListener('click', e => { const s = e.target.closest('[data-mus]'); if (s) { setAccent(s.dataset.mus); $$('[data-mus]', el).forEach(x => x.classList.toggle('on', x === s)); const b = $('#mus-body', el); b.innerHTML = musicBody(s.dataset.mus); Motion.enter(b, 0, 50); } });
  },
};
function musicBody(id) {
  const sp = SPORTS[id]; const pl = MUSIC[id];
  const links = p => `<div class="row" style="gap:8px;margin-top:10px"><a class="btn btn-sm" style="background:#1DB954;color:#04140A" href="${spotifyUrl(p[0])}" target="_blank" rel="noopener">${icon('play', 14)}Spotify</a><a class="btn btn-ghost btn-sm" href="${appleUrl(p[0])}" target="_blank" rel="noopener">Apple Music</a></div>`;
  return `<div class="mus-grid"><div style="margin-top:18px" data-e="1"><a class="press" style="display:block;position:relative;border-radius:30px;overflow:hidden" href="${spotifyUrl(pl[0][0])}" target="_blank" rel="noopener" aria-label="Abrir ${esc(pl[0][0])} no Spotify">${coverArt(pl[0][0], id, pl[0][2], 0, 'aspect-ratio:1.25;')}</a>
    <div style="margin-top:14px" data-e="2"><div class="kicker" style="color:var(--accent)">Destaque para ${sp.name.toLowerCase()}</div><div class="h2" style="margin-top:6px">${pl[0][0]}</div><div class="muted small">${pl[0][1]} · ~${pl[0][2]} BPM</div>${links(pl[0])}</div></div>
    <div><div class="wsec" data-e="3"><h2>Mais estilos</h2></div>
    <div class="stack" data-e="4">${pl.slice(1).map((p, i) => `<div class="list-item" style="display:block"><div class="row" style="gap:12px"><div style="width:56px;flex:none">${coverArt('', id, p[2], i + 1)}</div><div style="flex:1"><div class="h3">${p[0]}</div><div class="muted small">${p[1]} · ~${p[2]} BPM</div></div></div>${links(p)}</div>`).join('')}</div>
    <div class="card row" style="margin-top:14px;gap:12px" data-e="7"><span style="color:var(--accent)">${icon('shield', 20)}</span><div class="small muted" style="line-height:1.5">As playlists abrem no app oficial de cada serviço, com a sua conta deles. Dica: o BPM indicado combina com o ritmo do esporte.</div></div></div></div>`;
}

/* ---------------- Alimentação: diário real por dia ---------------- */
const dayKey = (d = new Date()) => { const x = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return x.toISOString().slice(0, 10); };
let nuDate = null;
Screens.nutrition = {
  render() {
    return `<div class="topbar solid"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Alimentação</div><button class="icon-btn glass" aria-label="Adicionar refeição" id="nu-add">${icon('plus', 20, 2)}</button></div>
    <div class="scroll"><div class="pad page nu-body" style="padding-top:calc(var(--safe-top) + 70px);max-width:760px"><div class="card skeleton" style="height:160px"></div></div></div>`;
  },
  async mount(el) {
    const body = $('.nu-body', el); nuDate = nuDate || dayKey();
    const draw = async () => {
      let d; try { d = (await API.day(nuDate)) || {}; } catch (x) { body.innerHTML = emptyBox(errMsg(x)); return; }
      const meals = d.meals || []; const water = d.water || 0; const goal = d.goal || API.me.kcalGoal || 2400; const kcal = meals.reduce((a, m) => a + (m.kcal || 0), 0);
      const mac = k => meals.reduce((a, m) => a + (m[k] || 0), 0); const isToday = nuDate === dayKey();
      const label = isToday ? 'Hoje' : new Date(nuDate + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' });
      body.innerHTML = `<div class="between" data-e="0"><button class="icon-btn glass" data-nd="-1" aria-label="Dia anterior">${icon('back', 18, 2)}</button><h1 class="display" style="font-size:26px;text-transform:capitalize">${label}</h1><button class="icon-btn glass" data-nd="1" aria-label="Próximo dia" ${isToday ? 'disabled style="opacity:.3"' : ''}>${icon('next', 18, 2)}</button></div>
        <div class="card glass row" style="gap:18px;margin-top:14px" data-e="1">${ring(Math.min(1, kcal / goal), { size: 112, sw: 9, color: kcal > goal ? '#FF7426' : '#A3FF12', inner: `<div><div class="num" style="font-size:24px"><span data-count="${kcal}">0</span></div><div class="muted" style="font-size:10.5px">de ${fmt(goal)} kcal</div></div>` })}
          <div style="flex:1"><div class="kicker">Meta do dia</div><div class="h2" style="margin-top:6px">${kcal <= goal ? fmt(goal - kcal) + ' kcal restantes' : fmt(kcal - goal) + ' kcal acima'}</div><button class="link" style="margin-top:6px" data-goalk>Ajustar meta</button></div></div>
        <div class="grid3" style="margin-top:12px" data-e="2">${[['Proteínas', 'p', '#4C8DFF'], ['Carboidratos', 'c', '#FF7426'], ['Gorduras', 'f', '#FFC23D']].map(m => `<div class="card" style="padding:14px"><div class="muted small">${m[0]}</div><div class="num" style="font-size:24px;margin-top:4px;color:${m[2]}">${fmt(mac(m[1]))}<span style="font-size:12px;color:var(--mute)"> g</span></div></div>`).join('')}</div>
        <div class="wsec" data-e="3"><h2>Hidratação</h2><span class="muted small" id="nu-w">${water} de 10 copos (250 ml)</span></div>
        <div class="row" style="gap:6px" data-e="4">${Array.from({ length: 10 }, (_, i) => `<button class="press" style="flex:1;height:52px;border-radius:14px;display:grid;place-items:center;border:1px solid var(--stroke);${i < water ? 'background:rgba(56,189,248,.22);color:#38BDF8' : 'color:var(--mute2)'}" data-cup="${i}" aria-label="${i + 1} copos">${icon('drop', 18)}</button>`).join('')}</div>
        <div class="wsec" data-e="5"><h2>Refeições</h2><span class="muted small">${meals.length}</span></div>
        <div data-e="6">${meals.length ? `<div class="stack">${meals.map((m, i) => `<div class="list-item"><span class="ico" style="color:#A3FF12;background:rgba(163,255,18,.1)">${icon('leaf', 20)}</span><div style="flex:1;min-width:0"><div class="between"><span class="h3">${esc(m.n)}</span><span class="num" style="font-size:16px">${fmt(m.kcal || 0)} kcal</span></div><div class="muted small" style="margin-top:3px">${esc(m.t || '')}${m.items ? ' · ' + esc(m.items) : ''}${m.p || m.c || m.f ? ` · P${m.p || 0} C${m.c || 0} G${m.f || 0}` : ''}</div></div><button class="icon-btn" style="width:34px;height:34px;background:rgba(255,255,255,.06)" data-mdel="${i}" aria-label="Remover ${esc(m.n)}">${icon('x', 14)}</button></div>`).join('')}</div>` : emptyBox('Nenhuma refeição registrada neste dia.', `<button class="btn btn-white btn-sm" id="nu-add2">${icon('plus', 16)}Adicionar refeição</button>`)}</div>
        <div class="card row" style="margin-top:14px;gap:12px"><span style="color:var(--accent)">${icon('shield', 20)}</span><div class="small muted" style="line-height:1.5">Os valores são os que você informa. Para um plano alimentar, procure um nutricionista.</div></div><div style="height:40px"></div>`;
      Motion.countUp(body); Motion.fillRings(body);
      body.onclick = async e => {
        const nd = e.target.closest('[data-nd]'); if (nd && !nd.disabled) { const t = new Date(nuDate + 'T12:00'); t.setDate(t.getDate() + +nd.dataset.nd); nuDate = dayKey(t); draw(); return; }
        const c = e.target.closest('[data-cup]'); if (c) { const n = +c.dataset.cup + 1; const w = water === n ? n - 1 : n; haptic(6); try { await API.setDay(nuDate, { water: w }); draw(); } catch (x) { toast(errMsg(x), 'x'); } return; }
        const dl = e.target.closest('[data-mdel]'); if (dl) { const L = meals.slice(); L.splice(+dl.dataset.mdel, 1); try { await API.setDay(nuDate, { meals: L }); draw(); } catch (x) { toast(errMsg(x), 'x'); } return; }
        if (e.target.closest('#nu-add2')) addMeal();
        if (e.target.closest('[data-goalk]')) Sheet.open(`<h3 class="h2">Meta diária</h3><div class="field" style="margin-top:14px"><label for="gk">Calorias por dia</label><input class="input" id="gk" type="number" inputmode="numeric" value="${goal}" min="800" max="8000"></div><button class="btn btn-white btn-block" data-gk>Salvar</button>`,
          (w, close) => $('[data-gk]', w).onclick = async () => { const v = +$('#gk', w).value; if (!(v >= 800)) return toast('Informe um valor válido', 'x'); try { await API.updateProfile({ kcalGoal: v }); close(); draw(); } catch (x) { toast(errMsg(x), 'x'); } }, { label: 'Meta' });
      };
      const addMeal = () => Sheet.open(`<h3 class="h2" data-e="0">Adicionar refeição</h3><div style="margin-top:16px" data-e="1"><div class="field"><label for="ml-n">Refeição</label><input class="input" id="ml-n" placeholder="Ex.: Almoço" list="ml-l"><datalist id="ml-l">${['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Pré-treino', 'Pós-treino', 'Jantar', 'Ceia'].map(x => `<option value="${x}">`).join('')}</datalist></div>
        <div class="field"><label for="ml-i">O que você comeu</label><input class="input" id="ml-i" placeholder="Ex.: Arroz, feijão, frango, salada"></div>
        <div class="grid2"><div class="field"><label for="ml-k">Calorias (kcal)</label><input class="input" id="ml-k" type="number" inputmode="numeric" placeholder="650"></div><div class="field"><label for="ml-t">Horário</label><input class="input" id="ml-t" type="time" value="${new Date().toTimeString().slice(0, 5)}"></div></div>
        <div class="grid3"><div class="field"><label for="ml-p">Proteína g</label><input class="input" id="ml-p" type="number" inputmode="decimal"></div><div class="field"><label for="ml-c">Carbo g</label><input class="input" id="ml-c" type="number" inputmode="decimal"></div><div class="field"><label for="ml-f">Gordura g</label><input class="input" id="ml-f" type="number" inputmode="decimal"></div></div>
        <button class="btn btn-white btn-block" data-ml>Adicionar</button></div>`,
        (w, close) => $('[data-ml]', w).onclick = async () => { const n = $('#ml-n', w).value.trim(); const k = +$('#ml-k', w).value; if (!n) return toast('Dê um nome à refeição', 'x'); if (!(k >= 0)) return toast('Informe as calorias', 'x');
          const m = { n, items: $('#ml-i', w).value.trim(), kcal: Math.round(k || 0), t: $('#ml-t', w).value, p: +$('#ml-p', w).value || 0, c: +$('#ml-c', w).value || 0, f: +$('#ml-f', w).value || 0 };
          try { const cur = (await API.day(nuDate)) || {}; await API.setDay(nuDate, { meals: [...(cur.meals || []), m].sort((a, b) => (a.t || '').localeCompare(b.t || '')) }); close(); draw(); toast('Refeição adicionada'); } catch (x) { toast(errMsg(x), 'x'); } }, { label: 'Adicionar refeição' });
      $('#nu-add', el).onclick = addMeal;
    };
    draw();
  },
};
