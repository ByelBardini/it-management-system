---
description: Guia de testes do frontend InfraHub (Vitest + Testing Library + jsdom). Cobre localização, render, mock de services, teste de páginas com estado/efeito, React Router, padrão AAA e anti-padrões.
---

# Testes — InfraHub Frontend

## Regra Fundamental

Runner: **Vitest** (ambiente `jsdom`, `pool: "forks"` — o pool padrão quebra neste ambiente, não remova). Matchers do `@testing-library/jest-dom` carregados em `src/test/setup.js`.

```
client/src/test/
  setup.js                 # import "@testing-library/jest-dom"
  <Componente>.test.jsx    # testes de componente
  <area>.test.js           # testes de função pura
```
Arquivos casam com `src/**/*.{test,spec}.{js,jsx}` (pode co-locar ao lado do componente também).

```bash
cd client && npm test          # roda toda a suíte
cd client && npm run test:watch
```
> Rode **de dentro de `client/`** — a config de teste está no `vite.config.js` do pacote.

---

## Funções puras (`components/default/funcoes.js`)

Testam direto, sem render:
```js
import { describe, it, expect } from "vitest";
import { dividirEmPartes, getDiffDias } from "../components/default/funcoes.js";

it("divide a lista em blocos do tamanho informado", () => {
  expect(dividirEmPartes([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
});
```

---

## Componentes (Testing Library)

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModalConfirmacao from "../components/default/ModalConfirmacao.jsx";

it("chama onSim ao clicar em Confirmar", async () => {
  const onSim = vi.fn();
  render(<ModalConfirmacao texto="x" onNao={() => {}} onSim={onSim} />);

  await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));

  expect(onSim).toHaveBeenCalledTimes(1);
});
```
- Consulte por **papel/texto** (`getByRole`, `getByText`), não por classe CSS.
- Prefira `userEvent` a `fireEvent` (simula interação real).
- `framer-motion` renderiza normal no jsdom — asserte o **conteúdo**, não a animação.

---

## Componentes que usam React Router (`useNavigate`, `NavLink`, `Link`)

Envolva em `MemoryRouter` (senão `useNavigate`/`Link` quebram):
```jsx
import { MemoryRouter } from "react-router-dom";

function renderComRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}
```
Para asserir navegação, mocke o hook:
```jsx
const navigate = vi.fn();
vi.mock("react-router-dom", async (orig) => ({
  ...(await orig()),
  useNavigate: () => navigate,
}));
```

---

## Páginas com `useEffect` + busca assíncrona

As páginas buscam dados via `services/api/<recurso>Services.js`. **Mocke o service** para não bater na rede e controlar o retorno:
```jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Inventario from "../pages/Inventario.jsx";

vi.mock("../services/api/itemServices", () => ({
  getItens: vi.fn(),
  getItensInativos: vi.fn(),
}));
import { getItens } from "../services/api/itemServices";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("empresa_id", "7");   // a página lê do localStorage
});

it("exibe os itens retornados pelo service", async () => {
  // inclua os campos que a tabela/linha realmente lê (setor/workstation podem
  // ser null — a TabelaItens trata com "N/A").
  getItens.mockResolvedValue([
    { item_id: 1, item_nome: "Notebook X", item_tipo: "notebook", item_etiqueta: "NB01", item_em_uso: 1, setor: null, workstation: null },
  ]);

  render(<MemoryRouter><Inventario /></MemoryRouter>);

  expect(await screen.findByText("Notebook X")).toBeInTheDocument();
});
```
- Dados que chegam por efeito assíncrono → use `findBy*` (espera) em vez de `getBy*`.
- `localStorage` existe no jsdom — popule `empresa_id`/`token` antes do render quando a página depende deles.
- Para o caminho de erro, `mockRejectedValue({ status: 500, message: "..." })` e asserte o `Notificacao` (`tratarErro`).

---

## Padrão AAA e Nomenclatura

- Três seções (arrange / act / assert) separadas por linha em branco.
- `describe` com o nome do componente/página; `it` em **português** descrevendo o comportamento (sujeito + verbo + condição). Nunca "deve"/"should".

## Tabela de Asserções

| Cenário | Asserção |
|---|---|
| Texto presente | `expect(screen.getByText("X")).toBeInTheDocument()` |
| Texto após carregar (async) | `expect(await screen.findByText("X")).toBeInTheDocument()` |
| Ausência | `expect(screen.queryByText("X")).not.toBeInTheDocument()` |
| Botão por nome | `screen.getByRole("button", { name: "Confirmar" })` |
| Clique | `await userEvent.click(el)` |
| Callback chamado | `expect(onSim).toHaveBeenCalledTimes(1)` |
| Service chamado com args | `expect(getItens).toHaveBeenCalledWith("7")` |
| Input | `await userEvent.type(input, "texto")` |

## Anti-padrões — Evitar

| Anti-padrão | Correto |
|---|---|
| Página testada batendo na API real | Mockar o `services/api/<recurso>Services.js` |
| `getBy*` para dado assíncrono | `findBy*` (espera o efeito) |
| Consulta por classe (`container.querySelector(".btn")`) | `getByRole`/`getByText` |
| Render de componente com `useNavigate` sem router | Envolver em `MemoryRouter` |
| `fireEvent` para tudo | `userEvent` (interação realista) |
| Asserção sobre detalhe de animação/estilo | Asserir conteúdo/comportamento |
| `it("deve funcionar")` sem `expect` | Nome descritivo + asserção real |
