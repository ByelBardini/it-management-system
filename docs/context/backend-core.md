# Contexto — Backend Core (`server/`)

Convenções transversais do backend. **Leia sempre que tocar `server/`.**

## Stack e fluxo
- Node 18+ (roda em Node 24), **Express 5**, **Sequelize 6 + mysql2**, JWT, bcrypt, `node:crypto`, multer, dotenv. **JS puro (ESM)**, `"type": "module"`. Sem TypeScript.
- Fluxo: `routes/ → middlewares → controllers/ → models/`. **A regra de negócio vive no controller** (sem service/repository). Porta padrão **3032** (`server.js`).
- Entrada: `app.js` (CORS liberado, `express.json`, monta as rotas, **handler central de erro**).

## Erros — `ApiError` (`middlewares/ApiError.js`)
Controllers **lançam** `ApiError`; não montam resposta de erro na mão. O **Express 5 encaminha rejeições async** ao handler de `app.js`, que converte `ApiError` em `{ status, code, message, details }`. Erro não-`ApiError` vira 500 genérico.

Fábricas: `ApiError.badRequest` (400), `.unauthorized` (401), `.forbidden` (403), `.notFound` (404), `.conflict` (409), `.internal` (500). Mensagens em **português**.

```js
export async function getX(req, res) {
  const { id } = req.params;
  if (!id) throw ApiError.badRequest("ID é obrigatório");
  const x = await X.findByPk(id);
  if (!x) throw ApiError.notFound("Não encontrado");
  return res.status(200).json(x);
}
```
Use try/catch **só** para efeito colateral (ex.: mover arquivo de anexo), não para erro de negócio.

## Autenticação e autorização (`middlewares/autenticaToken.js`)
- `autenticar` — lê `Authorization: Bearer <token>`, valida com `SECRET_KEY_LOGIN`, popula `req.usuario = { id, tipo, nome }`. Token por **header** (não cookie), expira em **8h**.
- `autorizarRole(role)` — libera o `role` pedido **e sempre `adm`** (adm passa em tudo).
- `autorizarUser()` — libera o **próprio usuário** (`req.usuario.id == req.params.id`) **ou `adm`**.
- Rotas tipicamente: `router.use(autenticar); router.use(autorizarRole("adm"));` antes dos verbos.

## Auditoria (hooks em `models/index.js`)
Logs automáticos em `Log` (tabela `logs_sistema`) via hooks `afterCreate`/`afterUpdate`/`afterDestroy`, que leem `options.usuarioId`. **Toda mutação precisa repassar `{ usuarioId: req.usuario.id }`** em `create`/`save`/`destroy` — senão a trilha fica cega.
```js
await Setor.create({ ... }, { usuarioId: req.usuario.id });
await registro.save({ usuarioId: req.usuario.id });
```

## Sequelize
- Models em `models/<recurso>.js`: `Model.init`, `tableName` explícito, `timestamps: false`, colunas **snake_case com prefixo da entidade** (`item_nome`). Classe **PascalCase singular** (`Item`).
- Associações e hooks centralizados em `models/index.js` (com `as` usado nos includes; `onDelete: CASCADE`/`SET NULL`).
- Boolean = **TINYINT 1/0**. Soft-delete por flag (`item_ativo`, `peca_ativa`) onde o domínio usa; `.destroy()` onde já é usado (setor, senha).
- Includes: declare `as`, `attributes` explícitos, `separate: true` para coleções ordenadas.
- Transações: `await sequelize.transaction(async (t) => { ... { transaction: t, usuarioId } })` (de `config/database.js`).

## Criptografia
- Senhas de plataforma: **AES-256-CBC** com `SECRET_KEY_PASSWORD` (32 chars), **IV aleatório por registro** (`crypto.randomBytes(16)`). Detalhes em [senhas.md](senhas.md).
- Senha de usuário: **bcrypt**. Nunca retorne hash nem cifrado. Detalhes em [auth-usuarios.md](auth-usuarios.md).

## Uploads (multer)
`middlewares/anexosUpload.js` e `perfilUpload.js` populam `req.anexos`/arquivos antes do controller. Em `multipart/form-data`, campos compostos chegam como string JSON — faça `JSON.parse` em try/catch e lance `ApiError.badRequest` se inválido. Arquivos servidos por `downloadRoutes`.

## Estrutura e testes
```
server/
  controllers/  models/  routes/  middlewares/  config/database.js  app.js  server.js
  test/unit/<recurso>/<recurso>.controller.spec.js
  test/unit/helpers/  (sequelize-mock.js, http-mock.js)
migration/version-XX.sql   # SQL cru versionado
```
Testes: **Vitest** (`pool: "forks"`), de dentro de `server/` (`cd server && npm test`). Mocke models via `createModelsMock()` + `vi.mock("../../../models/index.js", ...)`. Guia completo: comando `/infrahub-backend-tests`. Migrações: agente `migracoes-sql`.
