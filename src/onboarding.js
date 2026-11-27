/* ============================================================
   ORA GYM — Entrada: abertura → criar conta / entrar → escolha de
   esportes → objetivos → @usuário → espaços prontos
   ============================================================ */
function obLayer() {
  $$('.ob', $('#app')).forEach(x => x.remove());
  const el = document.createElement('div'); el.className = 'layer ob'; el.style.zIndex = 250;
  el.innerHTML = `<div class="ob-bg" style="position:absolute;inset:0"></div><div class="ob-body" style="position:absolute;inset:0"></div>
    <div class="ob-top" style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 4px);display:flex;align-items:center;justify-content:space-between;z-index:6">
      <button class="icon-btn glass ob-back" aria-label="Voltar" style="opacity:0;pointer-events:none">${icon('back', 20, 2)}</button><div class="progress-dots" aria-hidden="true"></div><span style="width:46px"></span></div>`;
  $('#app').appendChild(el); return el;
}
function obBg(el, kind, first) {
  const b = $('.ob-bg', el); const old = b.firstElementChild; const n = document.createElement('div'); n.style.cssText = 'position:absolute;inset:0';
  if (kind === 'open') n.innerHTML = scene('abertura', 'musculacao', { src: 'photos/abertura.jpg', eager: true, pos: 'center 40%', grade: false, fade: 'background:linear-gradient(180deg,rgba(4,8,14,.55),transparent 28%,transparent 42%,rgba(4,8,14,.92) 74%,#04080E)' });
  else if (kind === 'auth') n.innerHTML = scene('cadastro', 'musculacao', { src: 'photos/cadastro.jpg', eager: true, pos: 'center 30%', fade: 'background:linear-gradient(180deg,rgba(11,11,11,.35),transparent 30%,rgba(11,11,11,.6) 60%,#0B0B0B 80%)' });
  else n.innerHTML = `<div style="position:absolute;inset:0;background:radial-gradient(90% 45% at 90% 0%,rgba(158,11,20,.35),transparent 70%),radial-gradient(70% 40% at 0% 100%,rgba(158,11,20,.14),transparent 70%),#0B0B0B"></div><div class="scene-grain" style="position:absolute;inset:0"></div>`;
  if (old && old.dataset.kind === kind) return; n.dataset.kind = kind; b.appendChild(n);
  A(n, [{ opacity: 0, transform: 'scale(1.12)' }, { opacity: 1, transform: 'scale(1)' }], { duration: first ? 2200 : 1100, easing: 'out' });
  if (old) A(old, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }).finished.then(() => old.remove());
}
function obShow(el, html, { dir = 1, first = false, dots = null, back = null } = {}) {
  const body = $('.ob-body', el); const old = body.firstElementChild;
  const v = document.createElement('div'); v.style.cssText = 'position:absolute;inset:0'; v.innerHTML = html; body.appendChild(v);
  if (old) A(old, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * 60}px)` }], { duration: 340, easing: 'in' }).finished.then(() => old.remove());
  const t = $('.ob-title', v); if (t) Motion.kinetic(t, first ? 500 : 140); Motion.enter(v, first ? 700 : 180, 50);
  $('.progress-dots', el).innerHTML = dots ? Array.from({ length: dots[1] }, (_, i) => `<i class="${i === dots[0] ? 'on' : ''}"></i>`).join('') : '';
  const bb = $('.ob-back', el); bb.style.pointerEvents = back ? 'auto' : 'none'; A(bb, [{ opacity: back ? 1 : 0 }], { duration: 250 }); bb.onclick = back || null;
  return v;
}

/* ---------------- Autenticação ---------------- */
function startAuth(first = true) {
  const el = obLayer(); obBg(el, 'open', first);
  const v = obShow(el, `<div style="position:absolute;left:24px;right:24px;top:calc(var(--safe-top) + 70px)" data-e="1" data-ek="fade">${brandLockup(30)}</div>
    <div class="ob-open" style="position:absolute;left:24px;right:24px;bottom:38px">
      <div class="kicker" data-e="2" style="color:#fff;opacity:.85">Sete esportes · um só lugar</div>
      <h1 class="display ob-title" style="font-size:48px;margin:12px 0 16px">Seu treino começa agora</h1>
      <p class="muted" style="font-size:15.5px;line-height:1.5;margin:0 0 28px;max-width:340px;color:#C9D3E0" data-e="6">Registre treinos, corridas e partidas, entre em desafios e acompanhe quem treina com você.</p>
      <div class="stack" data-e="7"><button class="btn btn-white btn-block" data-go="signup" style="justify-content:flex-start;padding-left:28px">Criar conta<span class="knob">${icon('arrow', 20, 2)}</span></button>
      <button class="btn btn-ghost btn-block" data-go="login" style="background:rgba(0,0,0,.35)">Já tenho uma conta</button></div></div>`, { first });
  $$('[data-go]', v).forEach(b => b.onclick = () => authForm(el, b.dataset.go));
}
function authForm(el, mode) {
  obBg(el, 'auth');
  const signup = mode === 'signup';
  const v = obShow(el, `<div class="ob-sheet glass" data-e="0" style="position:absolute;left:10px;right:10px;bottom:10px;border-radius:36px;padding:14px 22px 22px;background-color:rgba(26,26,26,.72)">
      <div style="width:54px;height:5px;border-radius:5px;background:rgba(255,255,255,.7);margin:0 auto 18px"></div>
      <div style="text-align:center"><h1 class="h2" style="font-size:26px" data-e="1">${signup ? 'Crie sua conta' : 'Bem-vindo de volta'}</h1><p class="muted small" style="margin:6px 0 18px" data-e="2">${signup ? 'Comece sua jornada em menos de um minuto' : 'Entre para continuar seus treinos'}</p></div>
      <form class="ob-form stack" style="gap:10px" novalidate>
        ${signup ? `<label class="ob-field" data-e="3"><span class="sr">Nome</span>${icon('user', 19)}<input id="ob-name" placeholder="Seu nome" autocomplete="name" required></label>` : ''}
        <label class="ob-field" data-e="4"><span class="sr">E-mail</span>${icon('mail', 19)}<input id="ob-email" type="email" placeholder="E-mail" autocomplete="email" required></label>
        <label class="ob-field" data-e="5"><span class="sr">Senha</span>${icon('lock', 19)}<input id="ob-pass" type="password" placeholder="${signup ? 'Crie uma senha (mín. 6)' : 'Senha'}" autocomplete="${signup ? 'new-password' : 'current-password'}" required minlength="6"><button type="button" class="ob-eye" aria-label="Mostrar senha">${icon('eyeoff', 19)}</button></label>
        ${signup ? `<label class="row" style="gap:10px;font-size:12px;color:#B9C4D3;line-height:1.45;cursor:pointer;margin:4px 2px" data-e="6"><input type="checkbox" id="ob-consent" style="width:18px;height:18px;accent-color:#E3192B;flex:none"><span style="flex:1;min-width:0">Li e aceito os <button type="button" class="ob-terms" style="text-decoration:underline;display:inline;font:inherit;color:#fff;padding:0">termos de uso e a política de privacidade</button> (LGPD)</span></label>`
          : `<button type="button" class="small ob-forgot" style="align-self:flex-end;color:#B9C4D3;padding:2px 4px" data-e="6">Esqueci minha senha</button>`}
        <p class="ob-err small" role="alert" style="color:#FF6B76;margin:0;min-height:0"></p>
        <button class="btn btn-white btn-block ob-submit" type="submit" style="justify-content:center;margin-top:2px" data-e="7"><span class="ob-lbl">${signup ? 'CRIAR CONTA' : 'ENTRAR'}</span><span class="knob">${icon('arrow', 20, 2)}</span></button>
      </form>
      <div class="row" style="gap:10px;margin:16px 0 12px;color:#8C99AC;font-size:12px" data-e="8"><span style="flex:1;height:1px;background:var(--stroke)"></span>ou continue com<span style="flex:1;height:1px;background:var(--stroke)"></span></div>
      <button class="btn btn-ghost btn-block ob-google" style="height:50px" data-e="9"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>Google</button>
      <p class="small" style="text-align:center;margin:14px 0 0;color:#B9C4D3" data-e="10">${signup ? 'Já tem conta?' : 'Ainda não tem conta?'} <button class="ob-switch" style="color:#FF4A57;font-weight:700">${signup ? 'Entrar' : 'Criar conta'}</button></p></div>`, { back: () => startAuth(false), dir: 1 });
  const err = $('.ob-err', v); const btn = $('.ob-submit', v); const busy = on => { btn.disabled = on; btn.style.opacity = on ? .6 : 1; $('.ob-lbl', v).textContent = on ? 'Aguarde…' : (signup ? 'CRIAR CONTA' : 'ENTRAR'); };
  const fail = e => { busy(false); err.textContent = errMsg(e); A($('.ob-sheet', v), [{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'none' }], { duration: 260 }); haptic([20, 40, 20]); };
  $('.ob-eye', v).onclick = e => { const p = $('#ob-pass', v); const on = p.type === 'password'; p.type = on ? 'text' : 'password'; e.currentTarget.setAttribute('aria-label', on ? 'Ocultar senha' : 'Mostrar senha'); };
  $('.ob-switch', v).onclick = () => authForm(el, signup ? 'login' : 'signup');
  const terms = $('.ob-terms', v); if (terms) terms.onclick = () => termsSheet();
  const forgot = $('.ob-forgot', v); if (forgot) forgot.onclick = async () => { const em = $('#ob-email', v).value.trim(); if (!/\S+@\S+\.\S+/.test(em)) { err.textContent = 'Digite seu e-mail acima para receber o link.'; return; }
    try { await API.auth.reset(em); toast('Enviamos um link de redefinição para ' + em, 'mail'); } catch (e) { fail(e); } };
  $('.ob-google', v).onclick = async () => { if (signup && !$('#ob-consent', v).checked) { err.textContent = 'Aceite os termos para continuar.'; return; } err.textContent = ''; try { await API.auth.google(); } catch (e) { fail(e); } };
  $('.ob-form', v).onsubmit = async e => { e.preventDefault(); err.textContent = '';
    const email = $('#ob-email', v).value.trim(), pass = $('#ob-pass', v).value;
    if (signup) { const name = $('#ob-name', v).value.trim(); if (name.length < 2) return fail({ message: 'Digite seu nome.' }); if (!$('#ob-consent', v).checked) return fail({ message: 'Aceite os termos para continuar.' });
      busy(true); try { sessionStorage.setItem('oragym.signupName', name); await API.auth.signUp(name, email, pass); } catch (x) { fail(x); } }
    else { busy(true); try { await API.auth.signIn(email, pass); } catch (x) { fail(x); } } };
}
function termsSheet() {
  Sheet.open(`<h3 class="h2" data-e="0">Termos e privacidade</h3><div class="muted small" style="line-height:1.65;margin-top:12px" data-e="1">
    <p><b style="color:#fff">O que guardamos:</b> nome, e-mail, @usuário, foto de perfil, esportes, metas, atividades que você registra (incluindo trajeto de GPS quando você grava uma corrida ou pedal), fichas, posts, curtidas, comentários, seguidores e desafios.</p>
    <p><b style="color:#fff">Para que usamos:</b> exibir seu histórico, estatísticas, feed e rankings. Não vendemos seus dados.</p>
    <p><b style="color:#fff">Quem vê:</b> posts públicos e seu perfil são visíveis para usuários logados. Atividades ficam ocultas se você ativar o perfil privado. A localização só é usada durante a gravação de uma atividade.</p>
    <p><b style="color:#fff">Seus direitos (LGPD):</b> em Perfil › Configurações você pode exportar todos os seus dados ou excluir sua conta e tudo o que ela contém.</p></div>
    <button class="btn btn-white btn-block" data-close style="margin-top:8px">Entendi</button>`, null, { label: 'Termos' });
}

/* ---------------- Configuração do perfil (primeiro acesso) ---------------- */
function startSetup() {
  const el = obLayer(); obBg(el, 'plain');
  const me = API.me; const draft = { name: sessionStorage.getItem('oragym.signupName') || me.name || '', sports: [], goals: ['desempenho'], handle: '' };
  const masonryH = [250, 190, 210, 260, 230, 200, 220];
  const sportsStep = (dir = 1) => { obBg(el, 'plain'); const v = obShow(el, `<div class="scroll" style="padding:calc(var(--safe-top) + 70px) 16px 150px">
      <div class="kicker" data-e="0" style="padding:0 4px">Personalize seu OraGym</div>
      <h1 class="display ob-title" style="font-size:32px;margin:10px 4px 8px">Qual esporte você quer utilizar?</h1>
      <p class="muted" style="margin:0 4px 20px" data-e="2">Escolha um ou mais. Cada esporte ganha um espaço com visual próprio.</p>
      <div class="masonry">${[0, 1].map(col => `<div class="mcol">${SPORT_IDS.filter((_, i) => i % 2 === col).map(id => { const i = SPORT_IDS.indexOf(id); const s = SPORTS[id]; const on = draft.sports.includes(id);
        return `<button class="pin ${on ? 'on' : ''}" style="--sc:${s.c};height:${masonryH[i]}px" data-pick="${id}" aria-pressed="${on}" data-e="${3 + i}" data-ek="scale"><img src="${photo(id, 0, true)}" alt="" style="object-position:${PHOTO_POS[PH[id][0]] || 'center'}"><span class="pin-fade"></span><span class="pin-chk">${icon('check', 16, 2.8)}</span><span class="pin-lbl"><span class="display" style="font-size:20px">${s.name}</span><span class="small" style="opacity:.8">${s.tagline}</span></span></button>`; }).join('')}</div>`).join('')}</div></div>
      <div style="position:absolute;left:16px;right:16px;bottom:26px" data-e="11"><button class="btn btn-white btn-block ob-next"><span class="ob-avs" style="display:flex"></span><span class="ob-cnt"></span></button></div>`, { dir, dots: [0, 4] });
    const upd = () => { const n = draft.sports.length; const b = $('.ob-next', v); b.disabled = !n; b.style.opacity = n ? 1 : .5; $('.ob-cnt', v).textContent = n ? `Continuar com ${n} ${n > 1 ? 'esportes' : 'esporte'}` : 'Escolha ao menos um';
      $('.ob-avs', v).innerHTML = draft.sports.slice(0, 4).map((id, k) => `<img src="${photo(id, 0, true)}" alt="" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid #fff;margin-left:${k ? -10 : 0}px">`).join('') + (n ? '<span style="width:10px"></span>' : ''); };
    v.addEventListener('click', e => { const b = e.target.closest('[data-pick]'); if (!b) return; haptic(8); const id = b.dataset.pick; const k = draft.sports.indexOf(id); k >= 0 ? draft.sports.splice(k, 1) : draft.sports.push(id);
      const on = draft.sports.includes(id); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); A(b, [{ transform: 'scale(.92)' }, { transform: on ? 'scale(.965)' : 'scale(1)' }], { spring: [320, 14] }); upd(); });
    $('.ob-next', v).onclick = () => { if (draft.sports.length) goalsStep(); }; upd(); };
  const goalsStep = (dir = 1) => { const v = obShow(el, `<div class="scroll" style="padding:calc(var(--safe-top) + 70px) 20px 140px">
      <div class="kicker" data-e="0">Quase lá</div><h1 class="display ob-title" style="font-size:32px;margin:10px 0 8px">O que te move?</h1>
      <p class="muted" style="margin:0 0 22px" data-e="2">Toque em quantos quiser.</p>
      <div class="bubbles">${GOALS.map(([k, n, d, ic], i) => `<button class="bubble ${draft.goals.includes(k) ? 'on' : ''}" data-goal="${k}" aria-pressed="${draft.goals.includes(k)}" data-e="${3 + i}" data-ek="scale">${icon(ic, 22)}<span class="h3">${n}</span><span class="small">${d}</span></button>`).join('')}</div></div>
      <div style="position:absolute;left:20px;right:20px;bottom:26px" data-e="10"><button class="btn btn-white btn-block ob-next">Continuar</button></div>`, { dir, dots: [1, 4], back: () => sportsStep(-1) });
    v.addEventListener('click', e => { const b = e.target.closest('[data-goal]'); if (!b) return; haptic(8); const k = b.dataset.goal; const j = draft.goals.indexOf(k); j >= 0 ? draft.goals.splice(j, 1) : draft.goals.push(k); b.classList.toggle('on'); b.setAttribute('aria-pressed', draft.goals.includes(k)); });
    $('.ob-next', v).onclick = () => profileStep(); };
  const profileStep = (dir = 1) => { if (!draft.handle) draft.handle = API.normHandle(draft.name.replace(/\s+/g, '.'));
    const v = obShow(el, `<div class="scroll" style="padding:calc(var(--safe-top) + 70px) 20px 140px">
      <div class="kicker" data-e="0">Seu perfil</div><h1 class="display ob-title" style="font-size:32px;margin:10px 0 22px">Como te encontram?</h1>
      <div class="row" style="margin-bottom:20px" data-e="2"><span class="av lg ob-av" style="--a1:#E3192B;--a2:#5c0a10">${esc(initials(draft.name))}</span><button class="btn btn-ghost btn-sm ob-photo">${icon('camera', 16)}Adicionar foto</button></div>
      <div class="field" data-e="3"><label for="sp-name">Nome</label><input class="input" id="sp-name" value="${esc(draft.name)}" autocomplete="name"></div>
      <div class="field" data-e="4"><label for="sp-handle">Usuário</label><div class="row" style="gap:0"><span class="input" style="width:auto;border-radius:16px 0 0 16px;border-right:0;display:flex;align-items:center;color:var(--mute)">@</span><input class="input" id="sp-handle" style="flex:1;border-radius:0 16px 16px 0" value="${esc(draft.handle)}" autocomplete="username"></div></div>
      <p class="ob-err small" role="alert" style="color:#FF6B76;margin:0"></p></div>
      <div style="position:absolute;left:20px;right:20px;bottom:26px" data-e="8"><button class="btn btn-white btn-block ob-next">Continuar</button></div>`, { dir, dots: [2, 4], back: () => goalsStep(-1) });
    $('.ob-photo', v).onclick = async () => { const d = await chooseImage(400, .8); if (!d) return; draft.avatarData = d; const a = $('.ob-av', v); a.style.backgroundImage = `url("${d}")`; a.style.backgroundSize = 'cover'; a.textContent = ''; };
    $('#sp-handle', v).oninput = e => { e.target.value = API.normHandle(e.target.value); };
    $('.ob-next', v).onclick = async () => { draft.name = $('#sp-name', v).value.trim(); draft.handle = $('#sp-handle', v).value; const er = $('.ob-err', v);
      if (draft.name.length < 2) { er.textContent = 'Digite seu nome.'; return; } if (draft.handle.length < 3) { er.textContent = 'O @ precisa de pelo menos 3 caracteres.'; return; }
      const b = $('.ob-next', v); b.disabled = true; b.textContent = 'Criando seu perfil…';
      try { await API.createProfile({ name: draft.name, handle: draft.handle, sports: draft.sports, goals: draft.goals });
        if (draft.avatarData) { const id = await API.putImage(draft.avatarData); await API.updateProfile({ avatar: id }); }
        sessionStorage.removeItem('oragym.signupName'); readyStep();
      } catch (x) { b.disabled = false; b.textContent = 'Continuar'; er.textContent = errMsg(x); } }; };
  const readyStep = () => { const v = obShow(el, `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:0 24px 34px;text-align:center">
      <div class="fan" aria-hidden="true">${draft.sports.map((id, i) => `<div class="fan-card" style="--sc:${SPORTS[id].c}"><img src="${photo(id, 0, true)}" alt=""><span class="display">${SPORTS[id].name}</span></div>`).join('')}</div>
      <div class="kicker" data-e="2">Tudo pronto, ${esc(draft.name.split(' ')[0])}</div><h1 class="display ob-title" style="font-size:34px;margin:10px 0 12px">Seus espaços estão prontos</h1>
      <p class="muted" style="margin:0 0 26px;max-width:340px" data-e="4">Registre sua primeira atividade e ela já aparece nas suas estatísticas.</p>
      <button class="btn btn-white btn-block ob-finish" data-e="6" style="justify-content:flex-start;padding-left:28px;max-width:420px">Entrar no OraGym<span class="knob">${icon('arrow', 20, 2)}</span></button></div>`, { dots: [3, 4] });
    const cards = $$('.fan-card', v); const n = cards.length;
    cards.forEach((c, k) => { const mid = (n - 1) / 2; const rot = (k - mid) * (n > 4 ? 9 : 12); const tx = (k - mid) * (n > 4 ? 34 : 48); const ty = Math.abs(k - mid) * 10;
      c.style.transform = `translate(${tx}px,${ty}px) rotate(${rot}deg)`; c.style.zIndex = 10 - Math.abs(Math.round(k - mid)); if (k === Math.round(mid)) c.classList.add('front');
      A(c, [{ transform: 'translate(0,240px) rotate(0) scale(.6)', opacity: 0 }, { transform: c.style.transform, opacity: 1 }], { spring: [130, 15], delay: 200 + k * 110 }); });
    $('.ob-finish', v).onclick = () => { haptic([10, 40, 10]); enterApp(); A(el, [{ opacity: 1 }, { opacity: 0, transform: 'scale(1.06)' }], { duration: 600, easing: 'inout' }).finished.then(() => el.remove()); }; };
  sportsStep();
}
