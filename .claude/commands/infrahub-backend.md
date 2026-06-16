---
description: Referência do backend InfraHub (Express 5 + Sequelize + JS/ESM). Cobre stack, arquitetura, fluxo TDD, estrutura de arquivos, convenções e templates de código.
---

# InfraHub Backend

## Stack e Arquitetura

- **Stack:** Node 18+, **Express 5**, **Sequelize 6 + mysql2**, JWT, bcrypt, `node:crypto`, multer, dotenv. JS puro (ESM, `"type": "module"`). Sem TypeScript.
- **Arquitetura:** `routes → middlewares → controllers → models`. A regra de negócio vive no **controller** (sem service/repository). Auditoria automática via **hooks** em `models/index.js`.
- **Testes:** Vitest (ambiente node, `pool: "forks"`).

## Fluxo TDD — 2 Prompts Separados

### Prompt 1 — Testes (Red)
1. Ler controller/model existente.
2. Criar `server/test/unit/<recurso>/<recurso>.controller.spec.js`.
3. `cd server && npm test` → **falha** (Red).
4. Reportar e aguardar.

### Prompt 2 — Implementar (Green → Refactor)
1. Código mínimo para passar.
2. `cd server && npm test` → **passa** (Green).
3. Refatorar mantendo verde.

> **Nunca** escreva testes e implementação no mesmo prompt.

## Estrutura
```
server/
  controllers/<recurso>Controller.js
  models/<recurso>.js
  models/index.js              # associações + hooks de Log (auditoria)
  routes/<recurso>Routes.js
  middlewares/                 # ApiError, autenticaToken, anexosUpload, perfilUpload
  config/database.js
  app.js  server.js
  test/unit/<recurso>/<recurso>.controller.spec.js
  test/unit/helpers/           # sequelize-mock.js, http-mock.js
migration/version-XX.sql       # SQL versionado
```

## O Que Fazer
- **`ApiError` em vez de try/catch de negócio.** Express 5 encaminha rejeições async ao handler central de `app.js`.
- Validar entrada no topo do controller.
- **`{ usuarioId: req.usuario.id }`** em todo `create`/`save`/`destroy` (auditoria).
- Colunas snake_case com prefixo (`item_nome`); classe do model PascalCase (`Item`); `timestamps: false`.
- Soft-delete via flag (`item_ativo = 0`, `peca_ativa = 0`) onde o domínio usa; `.destroy()` onde já é usado.
- Booleans como TINYINT 1/0.
- Transações: `sequelize.transaction(async (t) => { ... { transaction: t, usuarioId } })`.
- Crypto AES-256-CBC com `SECRET_KEY_PASSWORD`, IV aleatório por senha; nunca retornar a senha cripto na listagem.
- Rotas: `autenticar` + `autorizarRole("adm")`.

## O Que Não Fazer
- Não tratar erro de negócio na mão — lançar `ApiError`.
- Não retornar `senha_criptografada`/`senha_iv`.
- Não esquecer `{ usuarioId }`.
- Não introduzir TypeScript, decorators, service/DTO layer.
- Não rodar migração — gerar `migration/version-XX.sql`.

---

## Templates

### Controller — leitura com validação
```js
import { Item, Setor, Workstation } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";

export async function getItens(req, res) {
  const { id } = req.params;
  if (!id) throw ApiError.badRequest("ID da empresa é obrigatório");

  const itens = await Item.findAll({
    attributes: ["item_id", "item_etiqueta", "item_nome", "item_tipo"],
    where: { item_empresa_id: id, item_ativo: 1 },
    order: [["item_etiqueta", "ASC"]],
    include: [{ model: Setor, as: "setor", attributes: ["setor_id", "setor_nome"] }],
  });

  return res.status(200).json(itens);
}
```

### Controller — criação com auditoria
```js
export async function postSetor(req, res) {
  const { setor_empresa_id, setor_nome } = req.body;
  if (!setor_empresa_id || !setor_nome)
    throw ApiError.badRequest("Todos os dados são obrigatórios");

  await Setor.create({ setor_empresa_id, setor_nome }, { usuarioId: req.usuario.id });

  return res.status(201).json({ message: "Setor criado com sucesso" });
}
```

### Controller — transação atômica
```js
import sequelize from "../config/database.js";

await sequelize.transaction(async (t) => {
  const item = await Item.create(dados, { transaction: t, usuarioId: req.usuario.id });
  for (const p of pecas) {
    p.peca_item_id = item.item_id;
    await p.save({ transaction: t, usuarioId: req.usuario.id });
  }
});
```

### Model
```js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Setor extends Model {}
Setor.init(
  {
    setor_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    setor_empresa_id: { type: DataTypes.INTEGER, allowNull: false },
    setor_nome: { type: DataTypes.STRING(255), allowNull: false },
  },
  { sequelize, modelName: "Setor", tableName: "setores", timestamps: false }
);
export default Setor;
```

### Rota
```js
import { Router } from "express";
import { getSetores, postSetor, deleteSetor } from "../controllers/setorController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = Router();
router.use(autenticar);
router.use(autorizarRole("adm"));
router.get("/:id", getSetores);
router.post("/", postSetor);
router.delete("/:id", deleteSetor);
export default router;
```

### Tabela de erros (`ApiError`)
| Situação | Método | Mensagem (exemplo) |
|---|---|---|
| Dados inválidos | `ApiError.badRequest` | `"ID da empresa é obrigatório"` |
| Não autenticado | `ApiError.unauthorized` | `"Token inválido ou expirado"` |
| Sem permissão | `ApiError.forbidden` | `"Ação não permitida para o seu tipo de usuário"` |
| Não encontrado | `ApiError.notFound` | `"Item não encontrado"` |
| Duplicidade | `ApiError.conflict` | `"Etiqueta já cadastrada"` |

### Comandos úteis
```bash
cd server && npm test          # unit (test/unit/**)
cd server && npm run test:watch
cd server && npm start         # node --watch server.js (porta 3032)
```
