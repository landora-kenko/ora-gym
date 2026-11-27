# OraGym

App multiesportivo e social (musculação, corrida, ciclismo, calistenia, futebol, natação e boxe) — funciona no celular e no PC.

- **Contas reais**: Firebase Authentication (e-mail/senha e Google)
- **Dados reais**: Cloud Firestore — perfis, atividades, fichas, posts, curtidas, comentários, seguidores, desafios, alimentação e notificações
- **GPS de verdade** em corrida e pedal (mapa Leaflet + OpenStreetMap/CARTO)
- **Regras de segurança** em `firestore.rules` e índices em `firestore.indexes.json`

## Estrutura

- `docs/` — site pronto (o que vai para o ar)
- `src/` — código-fonte (HTML/CSS/JS sem framework)
- `build.py` — junta `index.dev.html` + `src/` em `docs/index.html`

## Primeira configuração no console do Firebase

1. **Authentication → Método de login**: ative **E-mail/senha** e **Google**.
2. **Firestore Database → Criar banco de dados** (modo produção, região `southamerica-east1`).
3. **Authentication → Configurações → Domínios autorizados**: confirme `SEU-PROJETO.web.app` e adicione o seu domínio próprio, se tiver.

No Firebase Hosting a configuração do projeto é lida automaticamente (não precisa colar chaves). Para hospedar em outro lugar, preencha `src/config.js`.

## Atualizar e publicar

```bash
git pull
python3 build.py
firebase deploy --only hosting,firestore
```

## App instalado (iPhone e Android)

O mesmo código vira app nativo com [Capacitor](https://capacitorjs.com) (pastas `android/` e `ios/`).
No app instalado a corrida/pedal continua gravando com a tela bloqueada e mostra uma notificação ao vivo
com tempo, distância (em km e metros) e ritmo.

- **Android:** cada atualização na `main` gera o APK automaticamente (GitHub Actions).
  Baixe em **Releases › android-latest › OraGym.apk** e instale no celular.
- **iPhone:** o build roda no [Codemagic](https://codemagic.io) (não precisa de Mac) usando o `codemagic.yaml`
  e vai para o TestFlight. Requer conta Apple Developer.

Para testar com Android Studio/Xcode: `npm ci && npm run android` (ou `npm run ios` num Mac).

## Testar localmente sem Firebase

Abra `docs/index.html` direto no navegador (file://) — o app usa um banco local no próprio navegador para testes.

Fotografias: Unsplash (licença Unsplash).
