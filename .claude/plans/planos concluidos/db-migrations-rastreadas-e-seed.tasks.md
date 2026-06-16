# Tracking de execução — db-migrations-rastreadas-e-seed

Tempo gasto em cada etapa. Linguagem meio termo: dá pra acompanhar de fora, mas mantém os termos do trabalho.

**Início:** — (não cronometrado) · **Conclusão:** 2026-06-16 13:52

| # | Etapa | O que está sendo feito | Início | Fim | Duração |
|---|-------|------------------------|--------|-----|---------|
| 1 | Núcleo do runner de migração (coberto por testes) | Cria a peça que decide o que ainda falta aplicar (testada antes do código), e o runner que registra numa tabela de controle quais migrations já rodaram e aplica só as pendentes, em ordem, sem desfazer nada (forward-only). | — | 2026-06-16 | — |
| 2 | Schema consolidado do zero | Gera um único arquivo de schema com todas as tabelas a partir dos models, já corrigindo as divergências do SQL antigo (chave estrangeira de peças e o tipo do campo de característica) e mantendo os índices únicos. | — | 2026-06-16 | — |
| 3 | Seed dos dados básicos | Implementa a carga inicial idempotente: um administrador (com senha criptografada) e uma empresa selecionável, respeitando a ordem que a trilha de auditoria exige (admin primeiro, e repassando o autor nos cadastros que geram log). | — | 2026-06-16 | — |
| 4 | Comandos e deploy | Adiciona os comandos de banco (migrar, semear, `dev:db` que faz os dois, e um reset só de desenvolvimento), liga a migração ao deploy antes de subir o app e aposenta as migrations antigas. | — | 2026-06-16 | — |
| 5 | Atualizar a documentação de contexto | Registra o novo fluxo de banco (estrutura, comandos, passo de deploy e as pegadinhas) na documentação de referência do projeto, pra próximos trabalhos não reinventarem. | — | 2026-06-16 | — |
| 6 | Aplicar e validar tudo manualmente | Rodar `cd server && npm run dev:db` contra um MySQL local (banco vazio), conferir que as tabelas sobem e o admin/empresa entram, logar no app, e rodar a bateria de testes do backend. | — | 2026-06-16 | a cargo do usuário |

---

## Resumo

Todas as 5 etapas de implementação concluídas em 2026-06-16. A etapa 6 (aplicar/validar contra um MySQL real) fica a cargo do usuário — o fluxo nunca roda migração nem testes. Tempos não foram cronometrados (coluna Início não registrada), então não há duração por etapa.

## Resumo do que foi implementado

**O quê.** Trocou-se o schema aplicado na mão (`migration/version-01.sql`/`version-02.sql`, removidos) por um fluxo de migrations rastreadas + seed, com runner próprio em Node sobre `mysql2` (sem dbmate, sem binário, sem `DATABASE_URL`).

Arquivos principais entregues:
- `server/db/pendentes.js` — função pura que calcula migrations pendentes (coberta por `server/test/unit/db/pendentes.spec.js`, 4 casos).
- `server/db/migrate.js` — runner forward-only, idempotente e não-destrutivo; tabela de controle `schema_migrations`; flag `--reset` dev-only (dropa + recria + seed).
- `server/db/migrations/0001_init.sql` — baseline consolidado das 11 tabelas a partir dos models.
- `server/db/seed.js` — carga inicial idempotente (admin + empresa [+ plataformas/setor]).
- `server/db/README.md` e `docs/context/banco-migrations.md` — documentação do fluxo.
- Scripts npm (`db:migrate`/`db:seed`/`dev:db`/`db:reset`), `dockerfile` (migrate antes do app), `server/.env.example` (vars `SEED_*`).
- `server/models/caracteristicas.js` — `caracteristica_valor` → `TEXT`.

**Por quê.** O banco não tinha controle do que já fora aplicado, o schema era aplicado manualmente e não havia seed (o login exige `bcrypt`, então seed em JS). O objetivo: schema reprodutível, deploy que migra sozinho (forward-only) e carga inicial idempotente.

**Como.** Runner lê `db/migrations/*.sql`, usa `pendentes()` para achar o que falta e grava cada nome em `schema_migrations` após o sucesso. Baseline com `CREATE TABLE IF NOT EXISTS` (re-executável) e nomes não-qualificados (o runner conecta com `DB_DATABASE` selecionado). Seed cria o admin primeiro e repassa `{ usuarioId }` nas entidades com hook de auditoria (`log_usuario_id` é NOT NULL). Decisões: `pecas.peca_empresa_id` → CASCADE e `caracteristica_valor` → TEXT.

**Testes que cobrem.** `server/test/unit/db/pendentes.spec.js` cobre o cálculo de pendentes (feliz, bordas vazio/ordenação, edge de aplicada órfã). Seed e execução real do SQL são validados manualmente (etapa 6).

**Extra (fora do plano).** Na mesma sessão entrou também o `package.json` da raiz (`npm run dev` sobe server+client via `concurrently`; `npm install` cascateia para server/client) e um proxy de `/api` no `client/vite.config.js` para o dev local — commitados em escopos separados (`chore(root)`, `feat(client)`).
