/* ============================================================
   ORA GYM — ponte com o app nativo (Capacitor: iOS e Android).
   No navegador tudo aqui fica desligado e o app usa as APIs da web.
   No app instalado: GPS em segundo plano (tela bloqueada), notificação
   ao vivo da corrida e botão voltar do Android.
   ============================================================ */
const Native = (() => {
  const C = window.Capacitor; const on = !!(C && C.isNativePlatform && C.isNativePlatform());
  const platform = on ? C.getPlatform() : 'web';
  const plug = n => { try { return on && C.registerPlugin ? C.registerPlugin(n) : null; } catch (e) { return null; } };
  const BG = plug('BackgroundGeolocation'), LN = plug('LocalNotifications'), App = plug('App');
  const NID = 28351; // mesmo id da notificação do serviço de localização: no Android a nossa substitui a dela
  let channel = false, permAsked = false;
  if (on) document.documentElement.classList.add('native', 'native-' + platform);

  async function notifPerm() { if (!LN || permAsked) return; permAsked = true; try { const p = await LN.checkPermissions(); if (p.display !== 'granted') await LN.requestPermissions(); } catch (e) {} }
  async function ensureChannel() { if (!LN || platform !== 'android' || channel) return; try { await LN.createChannel({ id: 'run-live', name: 'Corrida ao vivo', description: 'Tempo, distância e ritmo durante a atividade', importance: 2, visibility: 1, vibration: false, lights: false }); channel = true; } catch (e) {} }
  async function liveNotify(title, body) { if (!LN) return; await ensureChannel();
    try { await LN.schedule({ notifications: [{ id: NID, title, body, largeBody: body, ongoing: true, autoCancel: false, channelId: platform === 'android' ? 'run-live' : undefined, smallIcon: 'ic_stat_run', iconColor: '#D4FF3A', extra: { run: 1 } }] }); } catch (e) {} }
  async function liveClear() { if (!LN) return; try { await LN.cancel({ notifications: [{ id: NID }] }); } catch (e) {} try { await LN.removeAllDeliveredNotifications(); } catch (e) {} }

  /* GPS: mesma assinatura de navigator.geolocation.watchPosition, mas segue com a tela bloqueada */
  async function watch(onPos, onErr) {
    if (!BG) return null; await notifPerm();
    return BG.addWatcher({ backgroundTitle: 'OraGym · atividade em andamento', backgroundMessage: 'Toque para voltar ao app', requestPermissions: true, stale: false, distanceFilter: 0 },
      (loc, err) => { if (err) { onErr({ code: err.code === 'NOT_AUTHORIZED' ? 1 : 2, native: true, message: err.message }); return; }
        if (!loc) return; onPos({ coords: { latitude: loc.latitude, longitude: loc.longitude, accuracy: loc.accuracy, speed: loc.speed, altitude: loc.altitude, altitudeAccuracy: loc.altitudeAccuracy }, timestamp: loc.time || Date.now() }); });
  }
  async function unwatch(id) { if (BG && id != null) { try { await BG.removeWatcher({ id }); } catch (e) {} } }
  async function openSettings() { if (BG) { try { await BG.openSettings(); } catch (e) {} } }

  /* botão voltar do Android */
  if (App) { try { App.addListener('backButton', () => { const sw = $$('.sheet-wrap').pop(); if (sw) { const bd = $('.sheet-backdrop', sw); bd && bd.click(); return; }
    if (window.Nav && Nav.stack && Nav.stack.length) { const top = Nav.stack[Nav.stack.length - 1]; const sc = Screens[top.id]; if (sc && sc.noSwipe) { const c = $('#rl-close', top.el) || $('#ll-close', top.el) || $('#gl-close', top.el); if (c) { c.click(); return; } } Nav.back(); return; }
    if (window.Nav && Nav.tab && Nav.tab !== 'home') { Nav.go('home'); return; } App.minimizeApp && App.minimizeApp(); }); } catch (e) {} }

  return { on, platform, watch, unwatch, liveNotify, liveClear, openSettings, notifPerm };
})();
