# Contexto — Banco: migrations rastreadas + seed

Leia junto com [backend-core.md](backend-core.md). Fluxo de schema do InfraHub a partir
de um runner próprio em Node (sem dbmate, sem binário, sem `DATABASE_URL`). Substitui o
SQL aplicado na mão de `migration/version-XX.sql` (removido).

## Arquivos
```
server/db/
  migrate.js          runner forward-only + tabela de controle
  seed.js             carga inicial idempotente (exporta semear())
  seed-dev.js         seed de DEV: centenas de dados variados (exporta semearDev())
  pendentes.js        função pura: migrations ainda não aplicadas (testada)
  migrations/0001_init.sql   baseline consolidado das 11 tabelas
  migrations/0002_marcas_modelos.sql   cadastro central marcas/modelos/subtipos + FKs em itens/pecas
  README.md           uso rápido dos comandos
server/test/unit/db/pendentes.spec.js   teste da função pura
```

## Comandos (rodar de dentro de `server/`)
| Comando | Ação |
|---|---|
| `npm run db:migrate` | Aplica pendentes em ordem. Forward-only, idempotente, **não-destrutivo**. Roda em dev **e** no deploy. |
| `npm run db:seed` | Admin + empresa (+ plataformas/setor). Idempotente (`findOrCreate`). |
| `npm run db:seed:deploy` | `db:seed` **guardado** (`--se-vazio`): só semeia se o banco não tiver usuários nem empresas. Roda no deploy (start do container). |
| `npm run dev:seed` | **DEV-ONLY**: semeia centenas de dados variados (itens de todos os tipos com características, peças, desktops montados, setores, workstations, plataformas e senhas) numa **única empresa/usuário** (reusa o admin/empresa do `db:seed`). Cria o cadastro central de subtipos/marcas/modelos (marcas escopadas por domínio+tipo+subtipo) e vincula itens/peças por id (`item_marca_id`/`item_modelo_id`, `peca_marca_id`/`peca_modelo_id`) via `findOrCreate` — sem `item_nome`/`peca_nome`. Roda **uma vez** (guarda por contagem de itens; pula se já populado). Senhas só se `SECRET_KEY_PASSWORD` tiver 32 chars. |
| `npm run dev:db` | `db:migrate` + `db:seed` + `dev:seed` (ambiente de dev cheio). |
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
`dockerfile`: `node db/migrate.js && node db/seed.js --se-vazio && node server.js` (migrate
forward-only, depois o **seed guardado**, então o app). O `--se-vazio` só semeia quando o
banco não tem **usuários nem empresas** — roda no **1º deploy** e é ignorado nos redeploys
(não recria defaults apagados nem ressuscita admin/senha padrão). O `semearSeVazio()` checa
`Usuario.count()` + `Empresa.count()` e delega a `semear()`. Para múltiplas réplicas, mover
o `migrate + seed` para um *release command* do Coolify evita corrida.

## Migração 0002 — cadastro central de marcas/modelos/subtipos
Primeira migration rastreada após o baseline. Forward-only e **destrutiva** (dropa
`item_nome`/`peca_nome`); rode num banco resetado em dev (`npm run db:reset`). Foi
**revisada no lugar** para incluir o escopo por tipo/subtipo.
- Cria **`marcas`** (`marca_id` PK, `marca_nome` VARCHAR(100), `marca_dominio`
  ENUM('item','peca'), `marca_tipo` VARCHAR(40), `marca_subtipo` VARCHAR(100) **DEFAULT
  `''`**; UNIQUE(`marca_nome`,`marca_dominio`,`marca_tipo`,`marca_subtipo`)), **`subtipos`**
  (`subtipo_id` PK, `subtipo_tipo` VARCHAR(40), `subtipo_nome` VARCHAR(100);
  UNIQUE(`subtipo_tipo`,`subtipo_nome`) — **sem FK**) e **`modelos`** (`modelo_id` PK,
  `modelo_marca_id` FK→`marcas` **ON DELETE CASCADE**, `modelo_nome` VARCHAR(100);
  UNIQUE(`modelo_marca_id`,`modelo_nome`)).
- `itens`: **+**`item_marca_id` **+**`item_modelo_id` (FK→`marcas`/`modelos`, **ON DELETE
  SET NULL**), **DROP** `item_nome`. `pecas`: **+**`peca_marca_id` **+**`peca_modelo_id`
  (idem), **DROP** `peca_nome`.
- Models novos `models/marcas.js` (campos `marca_tipo`/`marca_subtipo`), `models/modelos.js`,
  `models/subtipos.js` (registrado em `models/index.js` **sem associação**); associações
  (Marca 1-N Modelo; Item/Peca `belongsTo` Marca/Modelo as `marca`/`modelo`). `seed-dev`
  semeia subtipos e marcas escopadas. Endpoints e regras:
  [inventario.md](inventario.md) / [marcas-modelos.md](marcas-modelos.md).

## Migração 0003 — série única ignora desktop
`0003_serie_unica_ignora_desktop.sql`. Forward-only e **não-destrutiva**. Desarma a
colisão de `item_num_serie="N/A"` dos desktops sob o UNIQUE global: troca o índice
`item_num_serie_UNIQUE` por um UNIQUE sobre uma **coluna gerada STORED**
`item_serie_uniq` = `NULL` para `item_tipo='desktop'` e `item_num_serie` para os
demais. Assim vários desktops coexistem com `"N/A"` e a unicidade global dos não-desktop
é preservada. A coluna é gerenciada pelo banco e **não** está nos models (o Sequelize
só insere as colunas declaradas). Regra de negócio: [inventario.md](inventario.md).
- **Runbook de deploy:** adicionar uma coluna gerada `STORED` força `ALGORITHM=COPY`
  (reconstrói a tabela `itens` e trava escritas durante o passo de `migrate`). Desprezível
  no porte atual; relevante só se a tabela crescer muito. Não é re-executável (não tem
  `IF EXISTS`): se aplicar mas o processo morrer **antes** do `INSERT` em
  `schema_migrations`, o re-run falha no `DROP INDEX` e barra o boot — garanta que o 1º
  deploy com ela conclua sem interrupção (ou rode num *pre-deploy command* em multi-réplica).

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
