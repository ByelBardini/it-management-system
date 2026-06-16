# Tracking de execução — migracao-web-coolify-seguranca

Tempo gasto em cada etapa. Linguagem meio termo.

**Início:** 2026-06-16 15:08

| # | Etapa | O que está sendo feito | Início | Fim | Duração |
|---|-------|------------------------|--------|-----|---------|
| 1 | Backend: sessão por cookie httpOnly e hardening (coberto por testes) | Levanta o fluxo de auth atual (token no header, sem logout). Escreve antes os testes das funções puras de segurança e do controller. Move a sessão para cookie httpOnly, cria o logout, fecha o CORS por allowlist, adiciona limite de tentativas no login, headers de segurança, validação de segredos no boot e confiança no proxy. | 2026-06-16 15:08 | 2026-06-16 15:10 | ~2 min |
| 2 | Frontend: login por cookie e virar página web | Escreve antes os testes do fluxo de login/logout. Tira o token do navegador (a sessão passa a viajar no cookie), ajusta o cliente de API e o download de anexos, corrige o caminho dos assets para rota profunda no navegador e remove todo o empacotamento desktop. | 2026-06-16 15:10 | 2026-06-16 15:14 | ~4 min |
| 3 | Empacotamento: imagens do back e do front | Cria a imagem do backend (aplica a migração e sobe a API) e a do frontend (gera o site e serve com um servidor que repassa as chamadas de API para o back na mesma origem, com fallback de rotas e cabeçalhos de segurança). Sobe uma stack local equivalente para validar. | 2026-06-16 15:14 | 2026-06-16 15:20 | ~6 min |
| 4 | Deploy e documentação | Documenta o deploy no Coolify (back, front e MySQL como apps do mesmo projeto, variáveis por app, rede interna, armazenamento persistente dos anexos) e atualiza o README e os documentos de contexto com a sessão por cookie e o novo fluxo web. | 2026-06-16 15:20 | 2026-06-16 15:25 | ~5 min |
| 5 | Validar tudo manualmente | Rodou `cd server && npm test` (27 ok) e `cd client && npm test` (11 ok); buildou as imagens (`docker compose build`, exit 0); subiu a stack e validou o login no navegador. | 2026-06-16 15:28 | 2026-06-16 16:44 | ~16 min |

---

## Resumo

- **Tempo total:** ~1h36 (2026-06-16 15:08 → 16:44), incluindo a validação manual em container.
- **Concluídas:** todos os 5 blocos.
- **Testes:** backend **27 passando** (4 arquivos), frontend **11 passando** (3 arquivos).
- **Validação de container:** ambas as imagens buildaram (exit 0); stack `docker compose up` no ar; login funcionando no navegador após corrigir o `VITE_API_BASE_URL` no build do front.

## Resumo do que foi implementado

**Objetivo:** transformar o InfraHub de app desktop (Tauri) em **página web** implantável no Coolify (front, back e MySQL como 3 apps), aplicando as correções de segurança para rodar bem no navegador.

**Backend (`server/`)**
- Sessão migrada para **cookie httpOnly** (`Secure`+`SameSite=Strict`): `login` grava o cookie e o token sai do body; novo `POST /logout` limpa o cookie; `autenticaToken` lê cookie-first (header como fallback) e perdeu o segredo fallback hardcoded.
- Hardening em `app.js`: `trust proxy`, **helmet**, **cookie-parser**, **CORS por allowlist** (`CORS_ORIGIN`), middleware **CSRF** (Origin/Referer), limite de body, **rate-limit** no `/login`. `server.js` valida segredos no boot (`validarAmbiente`).
- Novos helpers puros em `config/seguranca.js`; `Dockerfile` (glibc, migrate+start) e `.dockerignore`.

**Frontend (`client/`)**
- `api.js` sem Bearer (cookie via `withCredentials`); `authService` sem token + `deslogar`; `Empresas`/`CardItem` ajustados; `vite base: "/"`. **Tauri removido por completo** (scripts, dep e `src-tauri/`) + artefato `build/`.
- `Dockerfile` (build Vite → **nginx** servindo estático + **proxy `/api`** same-origin via `BACKEND_URL`) + `nginx.conf.template` (fallback SPA, CSP/headers). `VITE_API_BASE_URL=/api` fixado no build.

**Infra/Docs**
- `docker-compose.yml` full-stack local (mysql+back+front); `docs/deploy/coolify.md` (3 apps, rede interna, volume `/app/uploads`, migrate); README e `docs/context/*` atualizados.

**Testes que cobrem a mudança:** `server/test/unit/config/seguranca.spec.js` (helpers), `server/test/unit/auth/auth.controller.spec.js` (login seta cookie / 401 / 400 / logout), `client/src/services/auth/authService.test.js` (login sem token / logout resiliente).

**Migração de banco:** nenhuma (sem mudança de schema).

**Correção pós-validação:** o build do front não recebia `VITE_API_BASE_URL` (o `.env` é excluído do contexto e não existe no Coolify) → axios chamava `/login` e o nginx devolvia 405. Resolvido fixando `ARG/ENV VITE_API_BASE_URL=/api` no `client/Dockerfile`.
