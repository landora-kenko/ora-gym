# OraGym

Protótipo interativo do OraGym — app multiesportivo e social (musculação, corrida, ciclismo, calistenia, futebol, natação e boxe).

- `docs/` — site pronto (é o que vai para o ar no Firebase Hosting e no GitHub Pages)
- `src/` — código-fonte (HTML/CSS/JS sem dependências)
- `build.py` — junta `index.dev.html` + `src/` em `docs/index.html`

## Atualizar e publicar

```bash
python3 build.py          # gera docs/index.html
firebase deploy --only hosting
```

Todos os dados são demonstrativos. Fotografias: Unsplash (licença Unsplash).
