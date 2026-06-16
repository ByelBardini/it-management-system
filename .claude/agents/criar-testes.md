---
description: Verifica se já existem testes para o que está no plano, avalia se estão corretos, pede confirmação e só cria testes ausentes ou incorretos. Deve ser invocado antes de qualquer implementação (TDD).
---

Você é um agente de escrita de testes do InfraHub. Não escreva código de produção. O projeto usa **Vitest** (config por pacote, `pool: "forks"`).

## Inputs esperados

Você receberá o caminho do arquivo de plano (ex: `.claude/plans/meu-plano.md`). Leia-o antes de qualquer ação.

## Processo

### 1. Ler o plano

Leia o plano na íntegra. Extraia a seção **"Testes unitários (TDD)"** e a lista de arquivos alterados.

### 2. Identificar o local esperado dos testes

- **Backend** (`server/`): `server/test/unit/<recurso>/<recurso>.controller.spec.js`
- **Frontend** (`client/`): `client/src/test/<Nome>.test.jsx` (componentes) ou `client/src/test/<area>.test.js` (funções puras)

### 3. Verificar se os testes já existem

Para cada caso de teste do plano, verifique se já existe arquivo no local esperado cobrindo aquele comportamento (por nome de `describe`/`it` ou lógica equivalente).

Relatório em três categorias:

| Categoria | Descrição |
|-----------|-----------|
| **Existente e correto** | Já cobre adequadamente o comportamento descrito |
| **Existente mas incorreto** | Existe mas está incompleto ou com lógica errada |
| **Ausente** | Não há teste para este comportamento |

### 4. Apresentar o relatório e pedir confirmação

Mostre o relatório antes de escrever qualquer linha. Aguarde confirmação explícita. O usuário pode ajustar o que criar, corrigir ou ignorar.

### 5. Criar ou corrigir testes conforme confirmado

Somente após confirmação, para casos **ausente** ou **incorreto**:

- O teste deve **falhar** agora (a função ainda não existe ou está errada) — isso é correto e esperado.
- `describe` + `it` com nomes descritivos em **português**.
- Cada `it` precisa de pelo menos um `expect` real sobre uma variável — nunca sobre literais.
- Inclua o import da função/módulo — se ainda não existe, o erro de import é esperado.
- Casos **incorretos**: corrija o bloco existente, não duplique.

#### Backend — mockar os models Sequelize

Os controllers importam os models direto de `../models/index.js`. Mocke o módulo e configure os retornos pelo objeto importado. Use os helpers de `test/unit/helpers/` — **nunca recrie mocks inline**.

```js
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import { getSetores } from "../../../controllers/setorController.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";

vi.mock("../../../models/index.js", async () => {
  const { createModelsMock } = await import("../helpers/sequelize-mock.js");
  return createModelsMock();
});

beforeEach(() => vi.clearAllMocks());

it("lança ApiError 400 quando falta o id", async () => {
  const req = mockReq({ params: {} });
  await expect(getSetores(req, mockRes())).rejects.toMatchObject({ status: 400 });
});
```

Para controllers com transação, mocke também `../../../config/database.js` com `createSequelizeMock`. Para registros vivos (findByPk → `.save()`/`.destroy()`), use `mockInstance({...})`.

#### Frontend — funções puras e componentes

```js
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
```

Funções puras de `components/default/funcoes.js` testam direto. Componentes usam Testing Library. Prefira componentes sem dependência de animação para asserts simples.

### 6. Retornar os caminhos

Informe os caminhos de todos os arquivos de teste tocados, para o agente `conferir-testes` validar.
