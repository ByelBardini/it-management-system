# Banco — migrations rastreadas + seed

Fluxo de schema do InfraHub. Substitui o SQL aplicado na mão (`migration/version-XX.sql`,
agora removido). Runner próprio em Node sobre `mysql2` — sem dbmate, sem binário externo,
sem `DATABASE_URL` (usa as `DB_*` do `.env`).

## Estrutura

```
server/db/
  migrate.js          runner forward-only + tabela de controle schema_migrations
  seed.js             carga inicial idempotente (admin + empresa [+ plataformas/setor])
  pendentes.js        função pura: quais migrations ainda faltam (coberta por teste)
  migrations/
    0001_init.sql     baseline consolidado (11 tabelas), gerado a partir dos models
```

## Comandos (rode de dentro de `server/`)

| Comando | O que faz | Onde |
|---|---|---|
| `npm run db:migrate` | Aplica as migrations pendentes, em ordem. Forward-only, idempotente, **não-destrutivo**. | dev **e** deploy |
| `npm run db:seed` | Insere admin + empresa (+ plataformas/setor). Idempotente (`findOrCreate`). | dev / 1ª vez |
| `npm run dev:db` | `db:migrate` + `db:seed` em sequência. | dev |
| `npm run db:reset` | **DEV-ONLY, DESTRUTIVO**: dropa todas as tabelas, re-aplica do zero e roda o seed. Nunca no deploy. | dev |

## Como funciona

- O runner conecta com o **`DB_DATABASE` já selecionado**; o baseline usa nomes de
  tabela **não-qualificados** (sem `schema.`) para funcionar em qualquer ambiente.
- **Pré-requisito:** o database (`DB_DATABASE`) já existe — o runner cria as **tabelas**,
  não o schema.
- A tabela de controle `schema_migrations (nome PK, aplicada_em)` registra cada arquivo
  **após** ele aplicar com sucesso. Re-rodar só executa o que falta.
- **Caveat MySQL:** DDL faz auto-commit (sem rollback de `CREATE TABLE`). Por isso o
  baseline usa `CREATE TABLE IF NOT EXISTS` — re-rodar após uma falha no meio é seguro.

## Deploy

O `dockerfile` roda `node db/migrate.js && node server.js` — migração forward-only
antes do app. **O seed não roda no deploy** (produção é semeada uma vez, manualmente).
Para múltiplas réplicas, mova o `migrate` para um *release command* do Coolify em vez do
start, evitando corrida entre réplicas.

## Adicionar uma migration nova

1. Crie `migrations/000N_descricao.sql` (numeração de 4 dígitos, ordem lexicográfica).
2. Use `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE` — sem prefixo de schema.
3. Mantenha paridade com os models (agente `migracoes-sql`).
4. `npm run db:migrate` aplica só o que falta.

## Gotcha do seed (ordem de criação)

`usuarios` e `empresas` **não têm** hook de auditoria. `plataformas` e `setores` **têm**
`afterCreate` que grava em `logs_sistema` lendo `options.usuarioId`. Por isso o seed cria
o **admin primeiro** e repassa `{ usuarioId: adminId }` no `findOrCreate` das entidades
com hook — senão `log_usuario_id` (NOT NULL) fica `null` e quebra.

## Credenciais do seed (env, opcionais)

`SEED_ADMIN_LOGIN` (`admin`), `SEED_ADMIN_SENHA` (`admin123`), `SEED_ADMIN_NOME`,
`SEED_EMPRESA_NOME`, `SEED_EMPRESA_CNPJ`. O admin entra direto (`usuario_troca_senha=0`).
**Troque a senha em produção.**
