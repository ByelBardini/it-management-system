# Tracking de execução — seed-automatico-no-deploy

Tempo gasto em cada etapa. Linguagem meio termo.

**Início:** 2026-06-16 16:58

| # | Etapa | O que está sendo feito | Início | Fim | Duração |
|---|-------|------------------------|--------|-----|---------|
| 1 | Backend + deploy: seed automático e idempotente no 1º deploy, coberto por testes | Levanta o fluxo atual (migrate já roda no start do container; o seed só roda manual). Escreve **antes** os testes: semear quando o banco está vazio, **pular** quando já há usuários, **pular** quando há empresa sem usuário, propagar erro de contagem e o caso de borda da ordem de criação (admin primeiro, repassando o identificador de auditoria). Depois implementa a função de seed guardado (só semeia se o banco não tem usuários nem empresas), um novo comando de seed para deploy, e ajusta o start do container para rodar migração → seed guardado → app. | 16:58 | 17:00 | ~2 min |
| 2 | Documentação: alinhar guias de deploy e banco | Atualiza os guias (deploy no Coolify, banco/migrations, stack local, README e o índice de contexto) que diziam "o seed não roda no deploy" para refletir que ele roda sozinho no 1º deploy (quando o banco está vazio) e some o passo manual. | 17:00 | 17:03 | ~3 min |
| 3 | Validar tudo manualmente | Rodar `cd server && npm test`, subir a stack local (`docker compose up --build`) num banco zerado para conferir que o seed roda sozinho e cria o admin, derrubar e subir de novo para confirmar que num banco já populado o seed é **ignorado**, e validar o login com as credenciais padrão. | — | 2026-06-16 | a cargo do usuário |

---

## Resumo

**Tempo total (etapas 1–2):** ~5 min (16:58 → 17:03). Etapa 3 (validação manual) fica a cargo
do usuário — o agente nunca roda testes nem sobe a stack.

**Concluídas:** etapa 1 (backend + deploy, testes em TDD) e etapa 2 (documentação). Commitadas
em `test(db)` + `feat(db)` + `docs`. Sem migração de schema (é carga de dados).

---

## Resumo do que foi implementado

**O quê.** O deploy passou a rodar o seed **automaticamente** no start do container, mas só no
**1º deploy** (banco vazio). Antes, o `Dockerfile` rodava só `migrate` e o admin/empresa tinham
de ser criados na mão (`npm run db:seed`) após subir — passo fácil de esquecer, deixando o
sistema sem usuário para logar.

**Por quê.** Automatizar o bootstrap sem o risco de, a cada redeploy, recriar defaults que o
operador apagou de propósito ou ressuscitar `admin/admin123`. O seed já era idempotente
(`findOrCreate`); faltava o gatilho automático + um guard de "banco vazio" que desse a
semântica exata de "só no 1º deploy".

**Como.**
- `server/db/seed.js`: nova função `semearSeVazio()` — conta `Usuario.count()` + `Empresa.count()`
  e só chama `semear()` quando **ambos são 0** (pula se houver qualquer usuário OU empresa),
  retornando `true`/`false`. Flag `--se-vazio` no bloco de execução direta (espelha o `--reset`
  do `migrate.js`); sem flag, `node db/seed.js` continua semeando sempre (dev/manual).
- `server/package.json`: script `db:seed:deploy` (`node db/seed.js --se-vazio`).
- `server/Dockerfile`: `CMD` → `node db/migrate.js && node db/seed.js --se-vazio && node server.js`.
- Docs alinhados (db/README, banco-migrations, coolify, índice de contexto, docker-compose, README).

**Testes que cobrem.** `server/test/unit/db/seed.spec.js` (5 casos): semeia com banco vazio ·
não semeia com usuários · não semeia com empresa sem usuário · propaga erro de contagem ·
`semear()` cria o admin primeiro e repassa `usuarioId` às entidades com hook de auditoria.
Exigiu adicionar `findOrCreate` ao mock compartilhado `test/unit/helpers/sequelize-mock.js`.
