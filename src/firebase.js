/* ORA GYM — carrega o SDK do Firebase (módulos ES do CDN oficial) e expõe para o app */
const V = '10.12.2';
window.FB_READY = (async () => {
  if (location.protocol === 'file:') return null;
  let cfg = window.ORA_CONFIG && window.ORA_CONFIG.firebase;
  // No Firebase Hosting a configuração do projeto é servida automaticamente em /__/firebase/init.json
  if (!cfg || !cfg.apiKey) { try { const r = await fetch('/__/firebase/init.json', { cache: 'no-store' }); if (r.ok) cfg = await r.json(); } catch (e) {} }
  if (!cfg || !cfg.apiKey) { window.FB_ERR = 'noconfig'; return null; }
  try {
    const [app, au, fs] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
    ]);
    const a = app.initializeApp(cfg);
    const auth = au.initializeAuth(a, { persistence: [au.indexedDBLocalPersistence, au.browserLocalPersistence], popupRedirectResolver: au.browserPopupRedirectResolver });
    au.useDeviceLanguage(auth);
    let db; try { db = fs.initializeFirestore(a, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) }); } catch (e) { db = fs.getFirestore(a); }
    try { await au.getRedirectResult(auth); } catch (e) { console.warn('redirect', e.code); }
    return { app: a, auth, au, db, fs };
  } catch (e) { console.error('Falha ao carregar o Firebase', e); return null; }
})();
