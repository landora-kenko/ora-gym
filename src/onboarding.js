/* ============================================================
   ORA GYM — Abertura → Cadastro → Esportes → Objetivos → Espaços
   ============================================================ */
function startOnboarding(initial = false) {
  const phone = $('.phone'); $$('.ob', phone).forEach(x => x.remove());
  const st = Store.get();
  const draft = { sports: st.onboarded ? [...st.sports] : [], goals: [...st.goals], name: st.name === 'Atleta' ? '' : st.name, email: st.email || '' };
  const el = document.createElement('div'); el.className = 'layer ob'; el.style.zIndex = 250;
  el.innerHTML = `<div class="ob-bg" style="position:absolute;inset:0"></div><div class="ob-body" style="position:absolute;inset:0"></div>
    <div class="ob-top" style="position:absolute;left:20px;right:20px;top:calc(var(--safe-top) + 4px);display:flex;align-items:center;justify-content:space-between;z-index:6">
      <button class="icon-btn glass ob-back" aria-label="Voltar" style="opacity:0;pointer-events:none">${icon('back', 20, 2)}</button>
      <div class="progress-dots" aria-hidden="true">${[0, 1, 2, 3, 4].map(i => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
      <span style="width:46px"></span></div>`;
  phone.appendChild(el);
  let step = 0;

  const bg = (i, first) => {
    const b = $('.ob-bg', el); const old = b.firstElementChild; const n = document.createElement('div'); n.style.cssText = 'position:absolute;inset:0';
    if (i === 0) n.innerHTML = scene('abertura', 'musculacao', { src: 'photos/abertura.jpg', eager: true, pos: 'center 40%', grade: false, fade: 'background:linear-gradient(180deg,rgba(4,8,14,.55),transparent 28%,transparent 42%,rgba(4,8,14,.92) 74%,#04080E)' });
    else if (i === 1) n.innerHTML = scene('cadastro', 'musculacao', { src: 'photos/cadastro.jpg', eager: true, pos: 'center 30%', fade: 'background:linear-gradient(180deg,rgba(11,11,11,.35),transparent 30%,rgba(11,11,11,.6) 60%,#0B0B0B 80%)' });
    else n.innerHTML = `<div style="position:absolute;inset:0;background:radial-gradient(90% 45% at 90% 0%,color-mix(in oklab,var(--accent) 26%,transparent),transparent 70%),radial-gradient(70% 40% at 0% 100%,rgba(30,79,216,.16),transparent 70%),#0B0B0B"></div><div class="scene-grain" style="position:absolute;inset:0"></div>`;
    b.appendChild(n);
    A(n, [{ opacity: 0, transform: 'scale(1.14)' }, { opacity: 1, transform: 'scale(1)' }], { duration: first ? 2400 : 1200, easing: 'out' });
    if (old) A(old, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 }).finished.then(() => old.remove());
  };

  const masonryH = [250, 190, 210, 260, 230, 200, 220];
  const views = [
    () => `<div style="position:absolute;left:24px;right:24px;top:calc(var(--safe-top) + 70px)" data-e="1" data-ek="fade">${brandLockup(30)}</div>
      <div style="position:absolute;left:24px;right:24px;bottom:38px">
        <div class="kicker" data-e="2" style="color:#fff;opacity:.85">Sete esportes · um só lugar</div>
        <h1 class="display ob-title" style="font-size:48px;margin:12px 0 16px">Seu treino começa agora</h1>
        <p class="muted" style="font-size:15.5px;line-height:1.5;margin:0 0 28px;max-width:310px;color:#C9D3E0" data-e="6">Treine, registre, compita e compartilhe com quem se move com você.</p>
        <div class="stack" data-e="7"><button class="btn btn-white btn-block ob-next" style="justify-content:flex-start;padding-left:28px">Criar conta<span class="knob">${icon('arrow', 20, 2)}</span></button>
        <button class="btn btn-ghost btn-block ob-login" style="background:rgba(0,0,0,.35)">Já tenho uma conta</button></div></div>`,
    () => `<div class="ob-sheet glass" data-e="0" data-ek="rise" style="position:absolute;left:10px;right:10px;bottom:10px;border-radius:36px;padding:14px 22px 22px;background-color:rgba(30,44,66,.62)">
        <div style="width:54px;height:5px;border-radius:5px;background:rgba(255,255,255,.7);margin:0 auto 18px"></div>
        <div style="text-align:center"><h1 class="h2" style="font-size:26px" data-e="1">Crie sua conta</h1><p class="muted small" style="margin:6px 0 18px" data-e="2">Comece sua jornada em menos de um minuto</p></div>
        <form class="ob-form stack" style="gap:10px" novalidate>
          <label class="ob-field" data-e="3"><span class="sr">Nome</span>${icon('user', 19)}<input id="ob-name" placeholder="Seu nome" autocomplete="name" value="${esc(draft.name)}"></label>
          <label class="ob-field" data-e="4"><span class="sr">E-mail</span>${icon('mail', 19)}<input id="ob-email" type="email" placeholder="E-mail" autocomplete="email" value="${esc(draft.email)}"></label>
          <label class="ob-field" data-e="5"><span class="sr">Senha</span>${icon('lock', 19)}<input id="ob-pass" type="password" placeholder="Crie uma senha" autocomplete="new-password"><button type="button" class="ob-eye" aria-label="Mostrar senha">${icon('eyeoff', 19)}</button></label>
          <label class="row" style="gap:10px;font-size:12px;color:#B9C4D3;line-height:1.45;cursor:pointer;margin:4px 2px" data-e="6"><input type="checkbox" id="ob-consent" style="width:18px;height:18px;accent-color:#fff;flex:none">Aceito os termos e a política de privacidade (LGPD)</label>
          <button class="btn btn-white btn-block ob-create" type="submit" disabled style="opacity:.5;justify-content:center;margin-top:4px" data-e="7">CRIAR CONTA<span class="knob">${icon('arrow', 20, 2)}</span></button>
        </form>
        <div class="row" style="gap:10px;margin:16px 0 12px;color:#8C99AC;font-size:12px" data-e="8"><span style="flex:1;height:1px;background:var(--stroke)"></span>ou continue com<span style="flex:1;height:1px;background:var(--stroke)"></span></div>
        <div class="grid2" data-e="9"><button class="btn btn-ghost btn-sm ob-social" style="height:48px">Apple</button><button class="btn btn-ghost btn-sm ob-social" style="height:48px">Google</button></div>
        <p class="small" style="text-align:center;margin:14px 0 0;color:#B9C4D3" data-e="10">Já tem conta? <button class="ob-login" style="color:#FF4A57;font-weight:700">Entrar</button></p></div>`,
    () => `<div class="scroll" style="padding:calc(var(--safe-top) + 70px) 16px 150px">
        <div class="kicker" data-e="0" style="padding:0 4px">Personalize seu Ora Gym</div>
        <h1 class="display ob-title" style="font-size:32px;margin:10px 4px 8px">Qual esporte você quer utilizar?</h1>
        <p class="muted" style="margin:0 4px 20px" data-e="2">Escolha um ou mais. Cada esporte ganha um espaço com visual próprio.</p>
        <div class="masonry">${[0, 1].map(col => `<div class="mcol">${SPORT_IDS.filter((_, i) => i % 2 === col).map(id => { const i = SPORT_IDS.indexOf(id); const s = SPORTS[id]; const on = draft.sports.includes(id);
          return `<button class="pin ${on ? 'on' : ''}" style="--sc:${s.c};height:${masonryH[i]}px" data-pick="${id}" aria-pressed="${on}" data-e="${3 + i}" data-ek="scale">
            <img src="${photo(id, 0, true)}" alt="" style="object-position:${PHOTO_POS[PH[id][0]] || 'center'}">
            <span class="pin-fade"></span><span class="pin-chk">${icon('check', 16, 2.8)}</span>
            <span class="pin-lbl"><span class="display" style="font-size:18px">${s.name}</span><span class="small" style="opacity:.8">${s.tagline}</span></span></button>`; }).join('')}</div>`).join('')}</div></div>
      <div class="ob-cta" style="position:absolute;left:16px;right:16px;bottom:26px" data-e="11"><button class="btn btn-white btn-block ob-next" ${draft.sports.length ? '' : 'disabled style="opacity:.5"'}><span class="ob-avs" style="display:flex"></span><span class="ob-cnt">${draft.sports.length ? `Continuar com ${draft.sports.length}` : 'Escolha ao menos um'}</span></button></div>`,
    () => `<div class="scroll" style="padding:calc(var(--safe-top) + 70px) 20px 140px">
        <div class="kicker" data-e="0">Quase lá</div><h1 class="display ob-title" style="font-size:32px;margin:10px 0 8px">O que te move?</h1>
        <p class="muted" style="margin:0 0 22px" data-e="2">Toque em quantos quiser. Isso ajusta metas e desafios.</p>
        <div class="bubbles">${GOALS.map(([k, n, d, ic], i) => `<button class="bubble ${draft.goals.includes(k) ? 'on' : ''}" data-goal="${k}" aria-pressed="${draft.goals.includes(k)}" data-e="${3 + i}" data-ek="scale">${icon(ic, 22)}<span class="h3">${n}</span><span class="small">${d}</span></button>`).join('')}</div></div>
      <div style="position:absolute;left:20px;right:20px;bottom:26px" data-e="10"><button class="btn btn-white btn-block ob-next">Continuar</button></div>`,
    () => `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:0 24px 34px;text-align:center">
        <div class="fan" aria-hidden="true">${draft.sports.map((id, i) => `<div class="fan-card" style="--sc:${SPORTS[id].c}" data-fan="${i}"><img src="${photo(id, 0, true)}" alt=""><span class="display">${SPORTS[id].name}</span></div>`).join('')}</div>
        <div class="kicker" data-e="2">Tudo pronto, ${esc((draft.name || 'atleta').split(' ')[0])}</div>
        <h1 class="display ob-title" style="font-size:34px;margin:10px 0 12px">Seus espaços estão prontos</h1>
        <p class="muted" style="margin:0 0 26px;max-width:310px" data-e="4">${draft.sports.length > 1 ? `${draft.sports.length} esportes, cada um com sua tela, suas metas e sua comunidade.` : 'Seu esporte ganhou tela, metas e comunidade próprias.'}</p>
        <button class="btn btn-white btn-block ob-finish" data-e="6" style="justify-content:flex-start;padding-left:28px">Entrar no Ora Gym<span class="knob">${icon('arrow', 20, 2)}</span></button></div>`,
  ];

  function render(i, dir = 1, first = false) {
    const body = $('.ob-body', el); const old = body.firstElementChild;
    const v = document.createElement('div'); v.style.cssText = 'position:absolute;inset:0'; v.innerHTML = views[i](); body.appendChild(v);
    if (i <= 2 || first) bg(i, first);
    if (old) A(old, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * 60}px)` }], { duration: 360, easing: 'in' }).finished.then(() => old.remove());
    const t = $('.ob-title', v); if (t) Motion.kinetic(t, first ? 500 : 160);
    Motion.enter(v, first ? 700 : 200, 55);
    $$('.progress-dots i', el).forEach((d, k) => d.classList.toggle('on', k === i));
    const back = $('.ob-back', el); const show = i > 0 && i < 4; back.style.pointerEvents = show ? 'auto' : 'none'; A(back, [{ opacity: show ? 1 : 0 }], { duration: 300 });
    wire(v, i);
  }
  function wire(v, i) {
    $$('.ob-next', v).forEach(b => b.onclick = () => { if (b.disabled) return; haptic(10); go(i + 1); });
    $$('.ob-login', v).forEach(b => b.onclick = () => { toast('Login é uma prévia — siga criando sua conta', 'lock'); if (i === 0) go(1); });
    if (i === 1) {
      const name = $('#ob-name', v), email = $('#ob-email', v), pass = $('#ob-pass', v), cons = $('#ob-consent', v), btn = $('.ob-create', v);
      const ok = () => name.value.trim().length >= 2 && /\S+@\S+\.\S+/.test(email.value) && pass.value.length >= 6 && cons.checked;
      const val = () => { const k = ok(); btn.disabled = !k; btn.style.opacity = k ? 1 : .5; };
      [name, email, pass].forEach(x => x.addEventListener('input', val)); cons.onchange = val;
      $('.ob-eye', v).onclick = e => { const on = pass.type === 'password'; pass.type = on ? 'text' : 'password'; e.currentTarget.setAttribute('aria-label', on ? 'Ocultar senha' : 'Mostrar senha'); };
      $$('.ob-social', v).forEach(b => b.onclick = () => toast(`Entrar com ${b.textContent} é uma prévia`, 'lock'));
      $('.ob-form', v).onsubmit = e => { e.preventDefault(); if (!ok()) { A($('.ob-sheet', v), [{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'none' }], { duration: 260 }); return toast('Preencha nome, e-mail, senha (6+) e aceite os termos', 'x'); }
        draft.name = name.value.trim(); draft.email = email.value.trim(); haptic([10, 30, 10]); go(2); };
      val();
    }
    if (i === 2) {
      const upd = () => { const n = draft.sports.length; const b = $('.ob-next', v); b.disabled = !n; b.style.opacity = n ? 1 : .5;
        $('.ob-cnt', v).textContent = n ? `Continuar com ${n} ${n > 1 ? 'esportes' : 'esporte'}` : 'Escolha ao menos um';
        $('.ob-avs', v).innerHTML = draft.sports.slice(0, 4).map((id, k) => `<img src="${photo(id, 0, true)}" alt="" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid #fff;margin-left:${k ? -10 : 0}px">`).join('') + (n ? '<span style="width:10px"></span>' : ''); };
      v.addEventListener('click', e => { const b = e.target.closest('[data-pick]'); if (!b) return; haptic(8);
        const id = b.dataset.pick; const k = draft.sports.indexOf(id); k >= 0 ? draft.sports.splice(k, 1) : draft.sports.push(id);
        const on = draft.sports.includes(id); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
        A(b, [{ transform: 'scale(.92)' }, { transform: on ? 'scale(.965)' : 'scale(1)' }], { spring: [320, 14] }); if (on) setAccent(id);
        const chk = $('.pin-chk', b); if (on) A(chk, [{ transform: 'scale(0) rotate(-90deg)' }, { transform: 'none' }], { spring: [300, 13] }); upd(); });
      upd();
    }
    if (i === 3) v.addEventListener('click', e => { const b = e.target.closest('[data-goal]'); if (!b) return; haptic(8);
      const k = b.dataset.goal; const j = draft.goals.indexOf(k); j >= 0 ? draft.goals.splice(j, 1) : draft.goals.push(k); const on = draft.goals.includes(k); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
      A(b, [{ transform: 'scale(.9)' }, { transform: 'none' }], { spring: [300, 12] }); });
    if (i === 4) {
      const cards = $$('.fan-card', v); const n = cards.length;
      cards.forEach((c, k) => { const mid = (n - 1) / 2; const rot = (k - mid) * (n > 4 ? 9 : 12); const tx = (k - mid) * (n > 4 ? 34 : 48); const ty = Math.abs(k - mid) * 10;
        c.style.transform = `translate(${tx}px,${ty}px) rotate(${rot}deg)`; c.style.zIndex = 10 - Math.abs(Math.round(k - mid)); if (k === Math.round(mid)) c.classList.add('front');
        A(c, [{ transform: 'translate(0,240px) rotate(0) scale(.6)', opacity: 0 }, { transform: c.style.transform, opacity: 1 }], { spring: [130, 15], delay: 200 + k * 110 }); });
      $('.ob-finish', v).onclick = finish;
    }
  }
  function go(i) { if (i < 0 || i > 4) return; const d = i > step ? 1 : -1; step = i; render(i, d); }
  $('.ob-back', el).onclick = () => go(step - 1);
  function finish() {
    haptic([10, 40, 10]);
    const sports = draft.sports.length ? draft.sports : ['musculacao'];
    Store.set({ onboarded: true, name: draft.name || 'Atleta', email: draft.email, handle: (draft.name || 'atleta').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '.'), goals: draft.goals, sports, sport: sports[0] });
    Nav.go('home');
    A(el, [{ opacity: 1, transform: 'scale(1)', filter: 'blur(0)' }, { opacity: 0, transform: 'scale(1.08)', filter: 'blur(12px)' }], { duration: 700, easing: 'inout' }).finished.then(() => el.remove());
  }
  render(0, 1, true);
}

function pickPhoto(slot, done) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = async () => { const f = inp.files && inp.files[0]; if (!f) return; await Photos.put(slot, f); done && done(); };
  inp.click();
}
