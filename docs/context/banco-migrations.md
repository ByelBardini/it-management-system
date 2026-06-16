# Contexto — Banco: migrations rastreadas + seed

Leia junto com [backend-core.md](backend-core.md). Fluxo de schema do InfraHub a partir
de um runner próprio em Node (sem dbmate, sem binário, sem `DATABASE_URL`). Substitui o
SQL aplicado na mão de `migration/version-XX.sql` (removido).

## Arquivos
```
server/db/
  migrate.js          runner forward-only + tabela de controle
  seed.js             carga inicial idempotente (exporta semear())
  pendentes.js        função pura: migrations ainda não aplicadas (testada)
  migrations/0001_init.sql   baseline consolidado das 11 tabelas
  README.md           uso rápido dos comandos
server/test/unit/db/pendentes.spec.js   teste da função pura
```

## Comandos (rodar de dentro de `server/`)
| Comando | Ação |
|---|---|
| `npm run db:migrate` | Aplica pendentes em ordem. Forward-only, idempotente, **não-destrutivo**. Roda em dev **e** no deploy. |
| `npm run db:seed` | Admin + empresa (+ plataformas/setor). Idempotente (`findOrCreate`). |
| `npm run dev:db` | `db:migrate` + `db:seed`. |
| `npm run db:reset` | **DEV-ONLY, DESTRUTIVO**: dropa tudo, re-aplica e semeia. Nunca no deploy. |

## Como funciona
- Conexão **mysql2 própria** (`multipleStatements`), lê `DB_*` do `.env`; **não** usa o
  `config/database.js` da app. O `seed.js` (Sequelize) usa.
- Tabela de controle `schema_migrations (nome VARCHAR(255) PK, aplicada_em DATETIME)` —
  o nome é gravado **após** o `.sql` aplicar com sucesso.
- Baseline usa **nomes de tabela não-qualificados** (sem `schema.`): o runner conecta com
  `DB_DATABASE` selecionado, então funciona em qualquer ambiente (dev/Coolify).
- **Pré-requisito:** o database já existe — o runner cria **tabelas**, não o schema.
- **Caveat MySQL:** DDL faz auto-commit (sem rollback de `CREATE TABLE`); por isso o
  baseline é `CREATE TABLE IF NOT EXISTS`, re-executável com segurança.

## Deploy
`dockerfile`: `node db/migrate.js && node server.js` (migrate forward-only antes do app).
**Seed não roda no deploy.** Para múltiplas réplicas, mover o migrate para um *release
command* do Coolify evita corrida.

## Decisões de schema (baseline vs. SQL antigo)
- `pecas.peca_empresa_id` → empresas **CASCADE** (corrige o `NO ACTION` antigo; alinha ao
  `models/index.js`).
- `caracteristica_valor` → **TEXT** (model `caracteristicas.js` também alterado para
  `DataTypes.TEXT`).
- Índices únicos: `empresas.empresa_nome`, `usuarios.usuario_login`, `itens.item_num_serie`.
  `item_etiqueta` **não** é único.
- `logs_sistema`: **sem FK** (fiel ao estado atual).

## Gotchas
- **Ordem do seed:** `usuarios`/`empresas` não têm hook; `plataformas`/`setores` têm
  `afterCreate` que grava em `logs_sistema`. O seed cria o **admin primeiro** e repassa
  `{ usuarioId: adminId }` no `findOrCreate` das entidades com hook — senão
  `log_usuario_id` (NOT NULL) fica `null` e quebra. (Mesma regra de auditoria do
  [backend-core.md](backend-core.md).)
- **Admin do seed:** entra direto (`usuario_troca_senha=0`), login/senha via
  `SEED_ADMIN_LOGIN`/`SEED_ADMIN_SENHA` (defaults `admin`/`admin123`). Trocar em produção.
- Nova migration: `migrations/000N_descricao.sql` (4 dígitos, ordem lexicográfica),
  paridade com os models via agente `migracoes-sql`.
- Inconsistência latente (fora de escopo): `logs_sistema.log_usuario_id` é NOT NULL mas o
  hook faz `|| null`; o seed contorna passando `usuarioId`.
