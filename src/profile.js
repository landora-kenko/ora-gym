/* ============================================================
   ORA GYM — Perfil, configurações, privacidade e prévias
   ============================================================ */
const BADGES = [['Primeiro PR', 'medal', 1], ['Sequência de 7', 'flame', 1], ['100 km', 'route', 1], ['Madrugador', 'clock', 1], ['Social', 'users', 1], ['Multiatleta', 'grid', 1], ['Maratonista', 'run', 0], ['Rei do ringue', 'glove', 0], ['Muscle-up', 'rings', 0]];

Screens.profile = {
  render() {
    const s = Store.get(); const main = s.sports[0] || 'musculacao'; const sp = SPORTS[main];
    const mine = s.posts;
    return `<div class="scroll"><div style="position:relative;height:520px">
      <div class="hero-stack" style="position:absolute;inset:0" data-e="0" data-ek="zoom">${scene('profile', main, { word: (s.name || 'A').split(' ')[0].toUpperCase(), pos: 'center 15%' })}</div>
      <div class="between" style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 4px)"><div data-e="1" data-ek="fade">${brandLockup(22)}</div>
        <button class="icon-btn glass" aria-label="Configurações" data-push="settings" data-e="1" data-ek="fade">${icon('settings', 20)}</button></div>
      <div style="position:absolute;left:20px;right:20px;bottom:22px">
        <div class="row" style="gap:14px;margin-bottom:14px" data-e="2">${Photos.url('avatar') ? `<img src="${Photos.url('avatar')}" alt="" class="av lg" style="object-fit:cover">` : meAv('lg')}<div><div class="row" style="gap:6px"><span class="tag">${s.privacy.privateProfile ? icon('lock', 12, 2) + 'Privado' : 'Público'}</span><span class="tag neon">${esc(s.level)}</span></div><div class="muted small" style="margin-top:8px">@${esc(s.handle)}</div></div></div>
        <h1 class="display pf-name" style="font-size:43px;margin:0 0 18px">${esc(s.name)}</h1>
        <div style="display:grid;grid-template-columns:repeat(4,1fr)" data-e="4">${[['#', 3, 'Ranking amigos'], ['', 186, 'Atividades'], ['', 12, 'Dias seguidos'], ['', 6, 'Conquistas']].map(x => `<div><div class="num" style="font-size:32px;line-height:1">${x[0]}<span data-count="${x[1]}">0</span></div><div class="muted" style="font-size:11px;margin-top:6px">${x[2]}</div></div>`).join('')}</div></div></div>
      <div class="pad">
        <div class="row" style="gap:10px;margin-top:6px" data-e="5"><button class="btn btn-white" style="flex:1" id="pf-edit">Editar perfil</button><button class="icon-btn" style="width:56px;height:56px;background:rgba(255,255,255,.06);border:1px solid var(--stroke)" aria-label="Compartilhar perfil" id="pf-share">${icon('share', 20)}</button></div>
        <div class="row" style="gap:18px;margin-top:18px;justify-content:space-around" data-e="6">${[['1.284', 'Seguidores'], ['412', 'Seguindo'], ['3', 'Grupos']].map(x => `<div style="text-align:center"><div class="h2">${x[0]}</div><div class="muted small">${x[1]}</div></div>`).join('')}</div>
        <div class="section-head" data-e="7"><h2 class="h2">Modalidades</h2><button class="link" id="pf-sports">Editar</button></div>
        <div class="hscroll" data-e="8">${s.sports.map(id => { const x = SPORTS[id]; return `<button class="card press" style="width:150px;text-align:left;--accent:${x.c}" data-push="sport" data-params='{"id":"${id}"}' data-expand><span style="color:var(--accent)">${icon(x.icon, 24)}</span><div class="h3" style="margin-top:14px">${x.name}</div><div class="num" style="font-size:22px;margin-top:4px">${statVal(x.stats[0])}<span style="font-size:12px;font-style:normal;color:var(--mute)"> ${x.stats[0].u}</span></div><div class="muted" style="font-size:11px">${x.stats[0].k}</div></button>`; }).join('')}</div>
        <div class="section-head" data-e="9"><h2 class="h2">Conquistas</h2><span class="muted small">${BADGES.filter(b => b[2]).length}/${BADGES.length}</span></div>
        <div class="grid3" data-e="10">${BADGES.map((b, i) => `<button class="card press" style="padding:16px 8px;text-align:center;${b[2] ? '' : 'opacity:.45'}" data-badge="${i}" aria-label="${b[0]}${b[2] ? '' : ' (bloqueada)'}">
          <span style="display:grid;place-items:center;width:54px;height:54px;margin:0 auto;border-radius:50%;${b[2] ? 'background:radial-gradient(circle at 35% 30%,#2d4a14,#0e1a06);color:var(--neon);box-shadow:0 0 0 1px rgba(163,255,18,.4),0 0 24px -6px var(--neon)' : 'background:rgba(255,255,255,.05);color:var(--mute)'}">${icon(b[2] ? b[1] : 'lock', 24)}</span><span class="small" style="display:block;margin-top:10px">${b[0]}</span></button>`).join('')}</div>
        <div class="section-head" data-e="11"><h2 class="h2">Recordes pessoais</h2></div>
        <div class="stack" data-e="12">${s.sports.slice(0, 3).map(id => { const r = SPORTS[id].records[0]; return `<div class="list-item" style="--accent:${SPORTS[id].c}"><span class="ico">${icon(SPORTS[id].icon, 20)}</span><div style="flex:1"><div class="h3">${r.k}</div><div class="muted small">${SPORTS[id].name} · ${r.d}</div></div><span class="num" style="font-size:20px">${r.v}</span></div>`; }).join('')}</div>
        <div class="section-head" data-e="13"><h2 class="h2">Publicações</h2><span class="muted small">${mine.length}</span></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;border-radius:20px;overflow:hidden" data-e="14">${(mine.length ? mine : []).slice(0, 9).map(p => `<button style="position:relative;aspect-ratio:1;--accent:${SPORTS[p.sport].c}" data-gotab="social" aria-label="${esc(p.title)}">${scene('post-' + p.sport, p.sport, { word: '' })}<span style="position:absolute;left:8px;bottom:8px;font-size:11px;font-weight:700;text-align:left">${esc(p.stats[0][1])}</span></button>`).join('')}
          ${mine.length ? '' : `<div class="card" style="grid-column:span 3;text-align:center;padding:24px"><div class="h3">Sem publicações ainda</div><div class="muted small" style="margin-top:6px">Conclua uma atividade e publique o resultado.</div></div>`}</div>
        <div class="section-head"><h2 class="h2">Atalhos</h2></div>
        <div class="grid2">${[['shop', 'bag', 'Loja esportiva'], ['music', 'music', 'Música'], ['nutrition', 'leaf', 'Alimentação'], ['settings', 'shield', 'Privacidade']].map(([sc, ic, l]) => `<button class="list-item press" style="text-align:left" data-push="${sc}" data-params='{"id":"${main}"}'><span class="ico">${icon(ic, 20)}</span><span class="h3">${l}</span></button>`).join('')}</div>
        <div class="bottom-space"></div></div></div>`;
  },
  mount(el) {
    Motion.kinetic($('.pf-name', el), 300); bindScrollFx(el, { hero: $('.hero-stack', el) });
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-badge]'); if (b) { const x = BADGES[+b.dataset.badge]; if (x[2]) celebrate({ title: x[0], sub: 'Conquista desbloqueada', points: 100, icon: x[1] }); else Sheet.open(`<div style="text-align:center;padding:10px 0"><span style="display:grid;place-items:center;width:70px;height:70px;margin:0 auto;border-radius:50%;background:rgba(255,255,255,.06)" data-e="0">${icon('lock', 28)}</span><h3 class="h2" style="margin-top:16px" data-e="1">${x[0]}</h3><p class="muted small" data-e="2">Continue treinando para desbloquear. Progresso atual: 40%.</p><div class="bar" style="margin:16px 30px 0" data-e="3"><i data-bar=".4" style="transform:scaleX(0);background:var(--neon)"></i></div></div>`, null, { label: x[0] }); }
      if (e.target.closest('#pf-edit')) editProfileSheet();
      if (e.target.closest('#pf-share')) shareSheet(`${Store.get().name} no Ora Gym`, `@${Store.get().handle} · ${Store.get().sports.map(i => SPORTS[i].name).join(', ')}`);
      if (e.target.closest('#pf-sports')) editSportsSheet();
    });
  },
  onReturn() { Nav.refresh(); },
};
function editProfileSheet() {
  const s = Store.get();
  Sheet.open(`<h3 class="h2" data-e="0">Editar perfil</h3><div style="margin-top:16px" data-e="1"><div class="row" style="margin-bottom:16px">${Photos.url('avatar') ? `<img src="${Photos.url('avatar')}" alt="" class="av lg" style="object-fit:cover">` : meAv('lg')}<button class="btn btn-ghost btn-sm" data-av>${icon('camera', 16)}Trocar foto</button></div>
    <div class="field"><label for="ep-n">Nome</label><input class="input" id="ep-n" value="${esc(s.name)}"></div>
    <div class="field"><label for="ep-h">Usuário</label><input class="input" id="ep-h" value="@${esc(s.handle)}"></div>
    <div class="field"><label>Nível</label>${seg([['Iniciante', 'Iniciante'], ['Intermediário', 'Intermediário'], ['Avançado', 'Avançado']], s.level, 'eplvl')}</div>
    <button class="btn btn-white btn-block" data-ep>Salvar</button></div>`,
    (w, close) => { let lvl = s.level; mountSeg($('.seg', w), b => lvl = b.dataset.eplvl);
      w.addEventListener('click', e => { if (e.target.closest('[data-av]')) pickPhoto('avatar', () => { close(); Nav.refresh(); toast('Foto atualizada'); });
        if (e.target.closest('[data-ep]')) { Store.set({ name: $('#ep-n', w).value.trim() || s.name, handle: $('#ep-h', w).value.replace('@', '').trim() || s.handle, level: lvl }); close(); Nav.refresh(); toast('Perfil atualizado'); } }); }, { label: 'Editar perfil' });
}
function editSportsSheet() {
  const sel = [...Store.get().sports];
  Sheet.open(`<h3 class="h2" data-e="0">Suas modalidades</h3><div class="grid2" style="margin-top:16px" data-e="1">${SPORT_IDS.map(id => `<button class="opt ${sel.includes(id) ? 'on' : ''}" style="--accent:${SPORTS[id].c};padding:14px" data-es="${id}"><span style="color:${SPORTS[id].c}">${icon(SPORTS[id].icon, 20)}</span><span class="h3" style="font-size:14px">${SPORTS[id].name}</span><span class="check">${icon('check', 15, 2.6)}</span></button>`).join('')}</div>
    <button class="btn btn-white btn-block" style="margin-top:16px" data-es-ok>Salvar</button>`,
    (w, close) => w.addEventListener('click', e => { const b = e.target.closest('[data-es]'); if (b) { const i = sel.indexOf(b.dataset.es); i >= 0 ? sel.splice(i, 1) : sel.push(b.dataset.es); b.classList.toggle('on'); haptic(5); }
      if (e.target.closest('[data-es-ok]')) { if (!sel.length) return toast('Escolha ao menos uma', 'x'); Store.set({ sports: sel, sport: sel.includes(Store.get().sport) ? Store.get().sport : sel[0] }); close(); Nav.refresh(); } }), { label: 'Modalidades' });
}

/* ---------------- Settings: privacy, LGPD, photos ---------------- */
Screens.settings = {
  render() {
    const p = Store.get().privacy;
    const sw = (k, t, d) => `<div class="toggle-row"><span><span class="h3" style="display:block">${t}</span><span class="muted small">${d}</span></span><button class="switch" role="switch" aria-checked="${!!p[k]}" data-pv="${k}" aria-label="${t}"></button></div>`;
    return `<div class="topbar solid"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Configurações</div><span style="width:46px"></span></div>
    <div class="scroll"><div class="pad" style="padding-top:calc(var(--safe-top) + 70px)">
      <div class="kicker" data-e="0">Privacidade</div><div class="stack" style="gap:8px;margin-top:12px" data-e="1">
        ${sw('privateProfile', 'Perfil privado', 'Só seguidores aprovados veem suas atividades')}
        ${sw('hideRouteEnds', 'Zona de privacidade', 'Oculta início e fim dos trajetos publicados')}
        ${sw('locationOnlyDuringActivity', 'Localização só durante atividades', 'GPS desligado fora de corridas e pedais')}
        ${sw('showWeight', 'Mostrar cargas e peso corporal', 'Exibe esses números em publicações')}
        ${sw('shareInFeed', 'Sugerir publicação ao concluir', 'Você sempre revisa antes de publicar')}</div>
      <div class="kicker" style="margin-top:28px" data-e="2">Seus dados (LGPD)</div><div class="stack" style="gap:8px;margin-top:12px" data-e="3">
        <button class="list-item press" style="text-align:left" id="st-export"><span class="ico">${icon('copy', 20)}</span><div style="flex:1"><div class="h3">Exportar meus dados</div><div class="muted small">Copia um resumo em JSON do que está salvo neste aparelho</div></div></button>
        <button class="list-item press" style="text-align:left" id="st-delete"><span class="ico" style="color:#FF4D5E;background:rgba(255,77,94,.12)">${icon('trash', 20)}</span><div style="flex:1"><div class="h3">Excluir meus dados</div><div class="muted small">Apaga perfil, publicações, fotos e histórico locais</div></div></button></div>
      <div class="kicker" style="margin-top:28px" data-e="4">Fotografia</div><div class="stack" style="gap:8px;margin-top:12px" data-e="5">
        <button class="list-item press" style="text-align:left" id="st-photos"><span class="ico">${icon('image', 20)}</span><div style="flex:1"><div class="h3">Fotos das modalidades</div><div class="muted small">Substitua as composições pelas suas fotografias</div></div>${icon('next', 18)}</button></div>
      <div class="kicker" style="margin-top:28px" data-e="6">Integrações</div><div class="stack" style="gap:8px;margin-top:12px" data-e="7">
        ${[['music', 'Spotify'], ['music', 'Apple Music'], ['heartbeat', 'Apple Saúde / Health Connect'], ['route', 'Relógios GPS']].map(([ic, n]) => `<div class="list-item"><span class="ico">${icon(ic, 20)}</span><div style="flex:1"><div class="h3">${n}</div><div class="muted small">Não conectado nesta prévia</div></div><span class="tag">Em breve</span></div>`).join('')}</div>
      <div class="kicker" style="margin-top:28px" data-e="8">Acessibilidade</div><div class="stack" style="gap:8px;margin-top:12px" data-e="9">
        <div class="toggle-row"><span><span class="h3" style="display:block">Reduzir movimento</span><span class="muted small">Troca animações por transições simples</span></span><button class="switch" role="switch" aria-checked="${Motion.reduced}" id="st-rm" aria-label="Reduzir movimento"></button></div>
        <button class="list-item press" style="text-align:left" id="st-onb"><span class="ico">${icon('refresh', 20)}</span><div style="flex:1"><div class="h3">Rever onboarding</div></div></button></div>
      <div style="height:40px"></div></div></div>`;
  },
  mount(el) {
    el.addEventListener('click', async e => {
      const s = e.target.closest('[data-pv]'); if (s) { const k = s.dataset.pv; const v = !Store.get().privacy[k]; Store.get().privacy[k] = v; Store.save(); s.setAttribute('aria-checked', v); haptic(6); }
      if (e.target.closest('#st-export')) { const d = { ...Store.get() }; try { await navigator.clipboard.writeText(JSON.stringify(d, null, 2)); toast('Dados copiados em JSON'); } catch (x) { toast('Cópia indisponível aqui', 'x'); } }
      if (e.target.closest('#st-delete')) { if (await confirmDialog('Excluir todos os dados?', 'Perfil, publicações, desafios criados e fotos salvas neste aparelho serão apagados. Isso não pode ser desfeito.', 'Excluir tudo', true)) { Store.reset(); for (const k of Object.keys(Photos.all())) await Photos.del(k); Nav.go('home'); startOnboarding(); } }
      if (e.target.closest('#st-photos')) openPhotoSlots();
      const rm = e.target.closest('#st-rm'); if (rm) { const v = rm.getAttribute('aria-checked') !== 'true'; rm.setAttribute('aria-checked', v); Motion.setReduced(v); const d = $('#rm-toggle'); d && d.setAttribute('aria-checked', v); }
      if (e.target.closest('#st-onb')) { startOnboarding(); }
    });
  },
};
function openPhotoSlots() {
  const slots = [['onboarding', 'Abertura do app', 'boxe'], ['avatar', 'Foto de perfil', 'musculacao'], ...SPORT_IDS.map(id => [id, SPORTS[id].name, id])];
  const row = ([k, l, sp]) => `<div class="list-item" data-slotrow="${k}"><div style="position:relative;width:56px;height:56px;border-radius:16px;overflow:hidden;flex:none;--accent:${SPORTS[sp].c}">${Photos.url(k) ? `<img src="${Photos.url(k)}" alt="" style="width:100%;height:100%;object-fit:cover">` : scene('x-none', sp, { word: '' })}</div>
    <div style="flex:1"><div class="h3">${l}</div><div class="muted small">${Photos.url(k) ? 'Foto personalizada' : 'Composição padrão'}</div></div>
    ${Photos.url(k) ? `<button class="icon-btn" style="background:rgba(255,255,255,.06)" data-slotdel="${k}" aria-label="Remover foto de ${l}">${icon('trash', 18)}</button>` : ''}<button class="icon-btn" style="background:var(--accent);color:#0B0B0B" data-slotadd="${k}" aria-label="Escolher foto para ${l}">${icon('camera', 18)}</button></div>`;
  Sheet.open(`<h3 class="h2" data-e="0">Fotografias</h3><p class="muted small" style="line-height:1.5;margin:8px 0 16px" data-e="1">As fotos padrão vêm do Unsplash (licença livre). Para trocar pela sua, use imagens com direitos de uso — elas ficam salvas só neste navegador.</p>
    <div class="stack slots" style="gap:8px" data-e="2">${slots.map(row).join('')}</div>`,
    w => w.addEventListener('click', async e => {
      const a = e.target.closest('[data-slotadd]'), d = e.target.closest('[data-slotdel]');
      const redraw = k => { const r = $(`[data-slotrow="${k}"]`, w); r.outerHTML = row(slots.find(s => s[0] === k)); rerenderAll(); };
      if (a) pickPhoto(a.dataset.slotadd, () => { redraw(a.dataset.slotadd); toast('Foto aplicada'); });
      if (d) { await Photos.del(d.dataset.slotdel); redraw(d.dataset.slotdel); }
    }), { label: 'Fotografias' });
}
function rerenderAll() { Nav.refresh(); Nav.stack.forEach(e => { const sc = Screens[e.id]; if (['liftLive', 'runLive', 'genericLive'].includes(e.id)) return; e.el.innerHTML = sc.render(e.params); sc.mount && sc.mount(e.el, e.params, e); }); }

/* ---------------- Shopping preview ---------------- */
function productCard(p, sid, i, auto) {
  const fav = !!Store.get().favs[sid + i];
  return `<div class="product" style="position:relative;--sc:${SPORTS[sid].c};${auto ? 'width:auto' : ''}"><button class="pimg press" style="width:100%" data-prod="${sid},${i}" aria-label="${esc(p[0])}">${productArt(p[2])}</button>
    <button class="fav ${fav ? 'on' : ''}" data-fav="${sid + i}" aria-label="Favoritar" aria-pressed="${fav}" style="top:10px;right:10px;position:absolute">${icon(fav ? 'heartFill' : 'heart', 17)}</button>
    <div style="margin-top:10px"><div class="h3" style="font-size:14px">${esc(p[0])}</div><div class="muted small" style="margin-top:3px">${esc(p[1])} · loja parceira</div></div></div>`;
}
function wireProducts(root) {
  if (root._prodWired) return; root._prodWired = true;
  root.addEventListener('click', e => {
    const f = e.target.closest('[data-fav]'); if (f) { const s = Store.get(); const k = f.dataset.fav; const on = !s.favs[k]; on ? s.favs[k] = 1 : delete s.favs[k]; Store.save(); f.classList.toggle('on', on); f.setAttribute('aria-pressed', on); f.innerHTML = icon(on ? 'heartFill' : 'heart', 17); A($('svg', f), [{ transform: 'scale(.4)' }, { transform: 'none' }], { spring: [300, 12] }); haptic(6); return; }
    const p = e.target.closest('[data-prod]'); if (p) { const [sid, i] = p.dataset.prod.split(','); const pr = PRODUCTS[sid][+i];
      Sheet.open(`<div class="pimg" style="--sc:${SPORTS[sid].c};height:240px;border-radius:28px;display:grid;place-items:center;background:radial-gradient(80% 70% at 50% 35%,color-mix(in oklab,var(--sc) 30%,#1a2b45),#0c1729)" data-e="0" data-ek="scale">${productArt(pr[2]).replace('class="art"', 'class="art" style="width:60%;height:60%;color:#E8EEF7"')}</div>
        <div class="between" style="margin-top:18px" data-e="1"><div><div class="kicker" style="color:${SPORTS[sid].c}">${SPORTS[sid].name} · ${pr[1]}</div><h3 class="h2" style="margin-top:6px;font-size:22px">${esc(pr[0])}</h3></div></div>
        <p class="muted small" style="line-height:1.6" data-e="2">Seleção curada para ${SPORTS[sid].name.toLowerCase()}. Preço, estoque e entrega são definidos pela loja parceira no momento da compra.</p>
        <div class="row" style="gap:8px;margin:10px 0 18px" data-e="3">${['P', 'M', 'G', 'GG'].map((z, k) => `<button class="chip ${k === 1 ? 'on' : ''}" data-size>${z}</button>`).join('')}</div>
        <button class="btn btn-white btn-block" data-e="4" data-buy>Ver na loja parceira ${icon('up', 18, 2)}</button>
        <p class="muted" style="font-size:11px;text-align:center;margin-top:10px" data-e="5">Links de afiliado ainda não configurados nesta prévia.</p>`,
        w => w.addEventListener('click', e2 => { const z = e2.target.closest('[data-size]'); if (z) $$('[data-size]', w).forEach(x => x.classList.toggle('on', x === z)); if (e2.target.closest('[data-buy]')) toast('Loja parceira ainda não vinculada', 'link'); }), { label: pr[0] }); }
  });
}
Screens.shop = {
  render({ id }) {
    setAccent(id); const sp = SPORTS[id];
    return `<div class="topbar"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Loja</div><button class="icon-btn glass" aria-label="Favoritos" id="shop-favs">${icon('heart', 19)}</button></div>
    <div class="scroll"><div style="position:relative;height:300px"><div style="position:absolute;inset:0" class="shop-hero">${scene(id, id, { word: 'LOJA' })}</div>
      <div style="position:absolute;left:20px;right:20px;bottom:18px"><div class="kicker" data-e="0">Seleção esportiva</div><h1 class="display shop-title" style="font-size:36px;margin:8px 0 0">Equipe-se para ${sp.name.toLowerCase()}</h1></div></div>
      <div class="pad"><div data-e="1">${sportChips(id, 'shs')}</div>
      <div class="row" style="gap:8px;margin-top:14px" data-e="2">${['Tudo', 'Calçado', 'Roupa', 'Acessório', 'Equipamento', 'Proteção'].map((c, i) => `<button class="chip ${i === 0 ? 'on' : ''}" style="height:32px;font-size:12px" data-cat="${c}">${c}</button>`).join('')}</div>
      <div id="shop-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px 12px;margin-top:18px" data-e="3">${PRODUCTS[id].map((p, i) => productCard(p, id, i, true)).join('')}</div>
      <div class="card row" style="margin-top:20px;gap:12px" data-e="4"><span style="color:var(--accent)">${icon('link', 20)}</span><div class="small muted" style="line-height:1.5">Compras acontecem nas lojas parceiras via programas de afiliados. O Ora Gym não processa pagamentos.</div></div>
      <div style="height:40px"></div></div></div>`;
  },
  mount(el, { id }) {
    let cur = id; Motion.kinetic($('.shop-title', el), 200); bindScrollFx(el, { bar: $('.topbar', el), threshold: 200 }); wireProducts(el);
    const grid = () => $('#shop-grid', el);
    const draw = (cat = 'Tudo') => { const g = grid(); const items = PRODUCTS[cur].map((p, i) => [p, i]).filter(([p]) => cat === 'Tudo' || p[1] === cat || (cat === 'Equipamento' && p[1] === 'Treino'));
      g.innerHTML = items.length ? items.map(([p, i]) => productCard(p, cur, i, true)).join('') : `<div class="muted small" style="grid-column:span 2;text-align:center;padding:30px">Nenhum item nesta categoria para ${SPORTS[cur].name}.</div>`;
      $$('.product', g).forEach((x, k) => A(x, [{ opacity: 0, transform: 'translateY(16px) scale(.96)' }, { opacity: 1, transform: 'none' }], { spring: [180, 20], delay: k * 50 })); };
    el.addEventListener('click', e => {
      const s = e.target.closest('[data-shs]'); if (s) { cur = s.dataset.shs; setAccent(cur); $$('[data-shs]', el).forEach(x => x.classList.toggle('on', x === s)); $$('[data-cat]', el).forEach((x, k) => x.classList.toggle('on', k === 0));
        const h = $('.shop-hero', el); h.innerHTML = scene(cur, cur, { word: 'LOJA' }); A(h, [{ opacity: 0, transform: 'scale(1.08)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'out' }); Motion.drawLines(h);
        const t = $('.shop-title', el); t.textContent = `Equipe-se para ${SPORTS[cur].name.toLowerCase()}`; Motion.kinetic(t, 0); draw(); }
      const c = e.target.closest('[data-cat]'); if (c) { $$('[data-cat]', el).forEach(x => x.classList.toggle('on', x === c)); draw(c.dataset.cat); }
      if (e.target.closest('#shop-favs')) { const f = Object.keys(Store.get().favs); Sheet.open(`<h3 class="h2" data-e="0">Favoritos</h3><div class="stack" style="margin-top:14px" data-e="1">${f.length ? f.map(k => { const sid = k.replace(/\d+$/, ''), i = +k.match(/\d+$/)[0]; const p = PRODUCTS[sid][i]; return `<div class="list-item" style="--accent:${SPORTS[sid].c}"><span class="ico">${icon(SPORTS[sid].icon, 20)}</span><div style="flex:1"><div class="h3">${p[0]}</div><div class="muted small">${SPORTS[sid].name}</div></div></div>`; }).join('') : '<p class="muted">Toque no coração de um produto para salvá-lo aqui.</p>'}</div>`, null, { label: 'Favoritos' }); }
    });
  },
};

/* ---------------- Music preview (honest about integrations) ---------------- */
Screens.music = {
  render({ id }) {
    setAccent(id); const sp = SPORTS[id]; const pl = PLAYLISTS[id];
    return `<div class="topbar solid"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Música</div><span style="width:46px"></span></div>
    <div class="scroll"><div class="pad" style="padding-top:calc(var(--safe-top) + 70px)">
      <div data-e="0">${sportChips(id, 'mus')}</div>
      <div id="mus-body">${musicBody(id)}</div><div style="height:40px"></div></div></div>`;
  },
  mount(el) {
    el.addEventListener('click', e => {
      const s = e.target.closest('[data-mus]'); if (s) { setAccent(s.dataset.mus); $$('[data-mus]', el).forEach(x => x.classList.toggle('on', x === s)); const b = $('#mus-body', el); b.innerHTML = musicBody(s.dataset.mus); Motion.enter(b, 0, 50); }
      const c = e.target.closest('[data-connect]'); if (c) connectSheet(c.dataset.connect);
      const p = e.target.closest('[data-pl]'); if (p) connectSheet(null, p.dataset.pl);
    });
  },
};
function musicBody(id) {
  const sp = SPORTS[id]; const pl = PLAYLISTS[id];
  return `<div style="margin-top:18px" data-e="1"><button class="press" style="width:100%;text-align:left;position:relative;border-radius:30px;overflow:hidden" data-pl="${pl[0][0]}">${coverArt(pl[0][0], id, pl[0][2], 0, 'aspect-ratio:1.25;')}</button></div>
    <div class="between" style="margin-top:14px" data-e="2"><div><div class="kicker" style="color:var(--accent)">Destaque para ${sp.name.toLowerCase()}</div><div class="h2" style="margin-top:6px">${pl[0][0]}</div><div class="muted small">${pl[0][1]} · ${pl[0][2]} BPM</div></div><button class="icon-btn" style="width:58px;height:58px;background:var(--accent);color:#0B0B0B" data-pl="${pl[0][0]}" aria-label="Abrir playlist">${icon('play', 22)}</button></div>
    <div class="section-head" data-e="3"><h2 class="h2">Mais playlists</h2></div>
    <div class="stack" data-e="4">${pl.map((p, i) => `<button class="list-item press" style="text-align:left" data-pl="${p[0]}"><div style="width:56px;flex:none">${coverArt('', id, p[2], i)}</div><div style="flex:1"><div class="h3">${p[0]}</div><div class="muted small">${p[1]} · ${p[2]} BPM</div></div>${icon('next', 18)}</button>`).join('')}</div>
    <div class="section-head" data-e="5"><h2 class="h2">Conectar serviço</h2></div>
    <div class="grid2" data-e="6">${['Spotify', 'Apple Music'].map(n => `<button class="card press" style="text-align:left" data-connect="${n}"><span style="color:var(--accent)">${icon('music', 22)}</span><div class="h3" style="margin-top:12px">${n}</div><div class="muted small" style="margin-top:3px">Não conectado</div></button>`).join('')}</div>
    <div class="card row" style="margin-top:14px;gap:12px" data-e="7"><span style="color:var(--accent)">${icon('shield', 20)}</span><div class="small muted" style="line-height:1.5">A reprodução acontece pelo app oficial de cada serviço, com login e licenças deles. Nesta prévia nenhuma conta está conectada e nenhuma faixa é tocada.</div></div>`;
}
function connectSheet(service, playlist) {
  Sheet.open(`<div style="text-align:center;padding:6px 0"><span style="display:grid;place-items:center;width:64px;height:64px;margin:0 auto;border-radius:20px;background:color-mix(in oklab,var(--accent) 18%,transparent);color:var(--accent)" data-e="0">${icon('music', 28)}</span>
    <h3 class="h2" style="margin-top:16px" data-e="1">${service ? `Conectar ${service}` : esc(playlist)}</h3>
    <p class="muted small" style="line-height:1.6;margin:10px 0 20px" data-e="2">${service ? `A conexão com ${service} usa a autenticação oficial do serviço e ainda não está disponível nesta prévia.` : 'Para ouvir esta playlist, conecte Spotify ou Apple Music. A integração ainda não está ativa nesta prévia.'}</p>
    <button class="btn btn-white btn-block" data-close data-e="3">Entendi</button></div>`, null, { label: 'Música' });
}

/* ---------------- Nutrition preview ---------------- */
Screens.nutrition = {
  render() {
    const s = Store.get(); const meals = s.meals || MEALS; const kcal = meals.reduce((a, m) => a + m.kcal, 0); const goal = 2600;
    return `<div class="topbar solid"><button class="icon-btn glass" data-back aria-label="Voltar">${icon('back', 20, 2)}</button><div class="title">Alimentação</div><button class="icon-btn glass" aria-label="Adicionar refeição" id="nu-add">${icon('plus', 20, 2)}</button></div>
    <div class="scroll"><div class="pad" style="padding-top:calc(var(--safe-top) + 70px)">
      <div class="between" data-e="0"><h1 class="display" style="font-size:28px">Hoje</h1>${demoBadge()}</div>
      <div class="card glass row" style="gap:18px;margin-top:14px" data-e="1">${ring(kcal / goal, { size: 112, sw: 9, color: '#A3FF12', inner: `<div><div class="num" style="font-size:24px"><span data-count="${kcal}">0</span></div><div class="muted" style="font-size:10.5px">de ${fmt(goal)} kcal</div></div>` })}
        <div style="flex:1"><div class="kicker">Meta do dia</div><div class="h2" style="margin-top:6px">${fmt(goal - kcal)} kcal restantes</div><div class="muted small" style="margin-top:4px">Ajustada para dia de treino de força</div></div></div>
      <div class="hscroll" style="margin-top:14px" data-e="2">${[['Proteínas', 142, 180, 'g', '#4C8DFF'], ['Carboidratos', 210, 320, 'g', '#FF7426'], ['Gorduras', 58, 80, 'g', '#FFC23D'], ['Fibras', 21, 30, 'g', '#A3FF12']].map(m => `<div class="card" style="width:140px;padding:16px"><span style="color:${m[4]}">${icon('flame', 18)}</span><div class="muted small" style="margin-top:10px">${m[0]}</div><div class="num" style="font-size:28px;margin-top:2px">${m[1]}<span style="font-size:12px;font-style:normal;color:var(--mute)">${m[3]}</span></div><div class="muted" style="font-size:11px">/ ${m[2]}${m[3]}</div><div class="bar" style="margin-top:10px;height:5px"><i data-bar="${m[1] / m[2]}" style="transform:scaleX(0);background:${m[4]};box-shadow:none"></i></div></div>`).join('')}</div>
      <div class="section-head" data-e="3"><h2 class="h2">Hidratação</h2><span class="muted small" id="nu-w">${s.water} de 10 copos</span></div>
      <div class="row" style="gap:6px" data-e="4">${Array.from({ length: 10 }, (_, i) => `<button class="press" style="flex:1;height:52px;border-radius:14px;display:grid;place-items:center;border:1px solid var(--stroke);${i < s.water ? 'background:rgba(56,189,248,.22);color:#38BDF8' : 'color:var(--mute2)'}" data-cup="${i}" aria-label="${i + 1} copos">${icon('drop', 18)}</button>`).join('')}</div>
      <div class="section-head" data-e="5"><h2 class="h2">Diário alimentar</h2></div>
      <div class="stack" id="nu-list" data-e="6">${meals.map(m => `<div class="list-item"><span class="ico" style="color:var(--neon);background:rgba(163,255,18,.1)">${icon('leaf', 20)}</span><div style="flex:1;min-width:0"><div class="between"><span class="h3">${esc(m.n)}</span><span class="num" style="font-size:16px">${m.kcal} kcal</span></div><div class="muted small" style="margin-top:3px">${esc(m.t)} · ${esc(m.items)}</div></div></div>`).join('')}</div>
      <div class="card row" style="margin-top:14px;gap:12px" data-e="7"><span style="color:var(--accent)">${icon('shield', 20)}</span><div class="small muted" style="line-height:1.5">Valores estimados e ilustrativos. Para um plano alimentar, procure um nutricionista.</div></div>
      <div style="height:40px"></div></div></div>`;
  },
  mount(el) {
    el.addEventListener('click', e => {
      const c = e.target.closest('[data-cup]'); if (c) { const n = +c.dataset.cup + 1; const s = Store.get(); s.water = s.water === n ? n - 1 : n; Store.save(); haptic(6);
        $$('[data-cup]', el).forEach((b, i) => { const on = i < s.water; b.style.background = on ? 'rgba(56,189,248,.22)' : ''; b.style.color = on ? '#38BDF8' : 'var(--mute2)'; }); A(c, [{ transform: 'scale(.8)' }, { transform: 'none' }], { spring: [300, 12] }); $('#nu-w', el).textContent = `${s.water} de 10 copos`; }
      if (e.target.closest('#nu-add')) Sheet.open(`<h3 class="h2" data-e="0">Adicionar refeição</h3><div style="margin-top:16px" data-e="1"><div class="field"><label for="ml-n">Refeição</label><input class="input" id="ml-n" placeholder="Ex.: Jantar"></div><div class="field"><label for="ml-i">O que você comeu</label><input class="input" id="ml-i" placeholder="Ex.: Salmão, batata-doce, brócolis"></div><div class="field"><label for="ml-k">Calorias estimadas</label><input class="input" id="ml-k" type="number" inputmode="numeric" placeholder="650"></div><button class="btn btn-white btn-block" data-ml>Adicionar</button></div>`,
        (w, close) => $('[data-ml]', w).onclick = () => { const s = Store.get(); s.meals = s.meals || MEALS.slice(); s.meals.push({ n: $('#ml-n', w).value.trim() || 'Refeição', t: new Date().toTimeString().slice(0, 5), kcal: +$('#ml-k', w).value || 400, items: $('#ml-i', w).value.trim() || '—' }); Store.save(); close(); const top = Nav.stack[Nav.stack.length - 1]; top.el.innerHTML = Screens.nutrition.render(); Screens.nutrition.mount(top.el); Motion.enter(top.el, 0, 20); toast('Refeição adicionada'); }, { label: 'Adicionar refeição' });
    });
  },
};
