---
description: Guia completo de testes unitários do backend InfraHub (Vitest, Express + Sequelize). Cobre localização, mock dos models, padrão AAA, helpers, asserções, casos obrigatórios e anti-padrões.
---

# Testes — InfraHub Backend

## Regra Fundamental

Testes ficam **SEMPRE** em `server/test/unit/<recurso>/<recurso>.controller.spec.js`. O runner é **Vitest** com `pool: "forks"` (o pool padrão quebra neste ambiente — não remova).

```
server/test/
  unit/
    helpers/
      sequelize-mock.js   # createModelsMock, mockInstance, createSequelizeMock
      http-mock.js        # mockReq, mockRes
    <recurso>/
      <recurso>.controller.spec.js
```

```bash
cd server && npm test          # roda test/unit/**/*.spec.js
cd server && npm run test:watch
```

> Rode **de dentro de `server/`** — a config (`vitest.config.js`) é por pacote.

---

## Mock dos Models — Regra Obrigatória

Os controllers importam os models direto de `../models/index.js` (não há injeção de dependência). Para isolar do banco, **mocke o módulo inteiro** e configure os retornos pelo objeto importado. **Nunca recrie mocks inline.**

```js
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";          // objeto mockado
import { getSetores } from "../../../controllers/setorController.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";

vi.mock("../../../models/index.js", async () => {
  const { createModelsMock } = await import("../helpers/sequelize-mock.js");
  return createModelsMock();
});

beforeEach(() => vi.clearAllMocks());
```

- O caminho do `vi.mock` é relativo ao **arquivo de teste** (`server/test/unit/<recurso>/` → `../../../models/index.js`).
- Configure por método: `db.Setor.findAll.mockResolvedValue([...])`.

### Controllers com transação
Mocke também o `config/database.js`. Para **asserir** sobre a transação, importe o
`sequelize` mockado (default export) — `createSequelizeMock` cobre as formas
`transaction(cb)` e `transaction(options, cb)`:
```js
import sequelize from "../../../config/database.js"; // já mockado abaixo

vi.mock("../../../config/database.js", async () => {
  const { createSequelizeMock } = await import("../helpers/sequelize-mock.js");
  return createSequelizeMock();
});

// ...
expect(sequelize.transaction).toHaveBeenCalled();
```

### Registros vivos (findByPk/findOne → .save()/.destroy())
```js
import { mockInstance } from "../helpers/sequelize-mock.js";
const item = mockInstance({ item_id: 5, item_ativo: 1 });
db.Item.findByPk.mockResolvedValue(item);
// ... após a ação:
expect(item.save).toHaveBeenCalledWith({ usuarioId: 99 });
// Se o save acontece DENTRO de uma transação, o objeto inclui `transaction`:
//   item.save({ transaction: t, usuarioId })
// use objectContaining para não falhar pelo argumento extra:
expect(item.save).toHaveBeenCalledWith(
  expect.objectContaining({ usuarioId: 99 })
);
```

---

## Padrão AAA (Arrange → Act → Assert)

Cada `it` tem três seções separadas por linha em branco (sem comentários `// Arrange`):

```js
it("retorna os setores da empresa informada", async () => {
  const setores = [{ setor_id: 1, setor_nome: "TI" }];
  db.Setor.findAll.mockResolvedValue(setores);
  const req = mockReq({ params: { id: "7" } });
  const res = mockRes();

  await getSetores(req, res);

  expect(db.Setor.findAll).toHaveBeenCalledWith({ where: { setor_empresa_id: "7" } });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(setores);
});
```

Regras: um único `Act` por `it`; sem lógica entre `Act` e `Assert`.

---

## Helpers de req/res

```js
const req = mockReq({ params: { id: "7" }, body: {...}, usuario: { id: 99, tipo: "adm" } });
const res = mockRes();   // res.status/json/send encadeáveis e registrados
```
`mockReq` já vem com `usuario` adm autenticado por padrão.

---

## Tabela de Asserções

| Cenário | Asserção |
|---|---|
| Resposta JSON exata | `expect(res.json).toHaveBeenCalledWith(obj)` |
| Status HTTP | `expect(res.status).toHaveBeenCalledWith(201)` |
| Model chamado com args exatos | `expect(db.Item.findAll).toHaveBeenCalledWith({ where: { item_ativo: 1 } })` |
| Args parciais | `expect(db.Item.create).toHaveBeenCalledWith(expect.objectContaining({ item_nome: "X" }), expect.anything())` |
| Auditoria (usuarioId) | `expect(db.Setor.create).toHaveBeenCalledWith(dados, { usuarioId: 99 })` |
| Exceção por status | `await expect(fn()).rejects.toMatchObject({ status: 400 })` |
| Exceção por mensagem | `await expect(fn()).rejects.toThrow("Item não encontrado")` |
| Instância salva (sem transação) | `expect(item.save).toHaveBeenCalledWith({ usuarioId: 99 })` |
| Instância salva (dentro de transação) | `expect(item.save).toHaveBeenCalledWith(expect.objectContaining({ usuarioId: 99 }))` |
| Mock não chamado | `expect(db.Item.create).not.toHaveBeenCalled()` |
| Transação usada | `expect(sequelize.transaction).toHaveBeenCalled()` (importe `sequelize` de `config/database.js`, mockado) |

---

## Casos Obrigatórios por Função

Para cada controller público:
1. **Caminho feliz** — retorno/`res.json` correto com dados válidos
2. **Validação** — `ApiError` (status 400) quando falta parâmetro/campo
3. **Não encontrado** — `ApiError` 404 quando `findByPk`/`findOne` retorna `null`
4. **Auditoria** — `{ usuarioId }` repassado em create/save/destroy
5. **Borda** — transação, conflito, coerção de tipos, listas vazias

---

## Convenções de Nomenclatura

```
describe("setorController")             ← nome do controller
  describe("getSetores")                ← nome da função
    it("retorna os setores da empresa informada")          ← feliz
    it("lança ApiError 400 quando falta o id")             ← erro
    it("cria o setor repassando o usuarioId")              ← auditoria
```
- `it` em **português**, com sujeito + verbo + condição. Nunca "deve"/"should".

---

## Anti-padrões — Evitar

| Anti-padrão | Correto |
|---|---|
| Mock inline `{ findAll: vi.fn() }` | `createModelsMock()` via `vi.mock` |
| Teste tocando o banco real | Sempre mockar `models/index.js` |
| `rejects.toThrow()` sem checar status/mensagem | `rejects.toMatchObject({ status: 400 })` |
| `expect(res.json).toHaveBeenCalled()` sem o argumento | Verificar o payload exato |
| Esquecer de verificar `{ usuarioId }` | Garantir a auditoria nas mutações |
| `describe("deve funcionar")` | Nome do controller/função |
| `it` em inglês | Descrição em português |
| Sem `vi.clearAllMocks()` no `beforeEach` | Sempre limpar para isolar |
| Asserção sobre literal (`expect(true).toBe(true)`) | Asserção sobre o resultado real |
