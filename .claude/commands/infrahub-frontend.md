---
description: Referência do frontend InfraHub (React 19 + Vite + JSX + Tailwind v4, tema escuro "glass"). Cobre stack, estrutura, identidade visual, padrões de estado/feedback, services e do/don't.
---

# InfraHub Frontend

## Stack e Estrutura

- **Stack:** React 19, Vite 7, **JSX puro (sem TypeScript)**, Tailwind v4 (`@import "tailwindcss"`), React Router 7, lucide-react, framer-motion, axios, brazilian-values. Empacotável em Tauri 2.
- **Estrutura** (`client/src/`):
  - `pages/*.jsx` — páginas roteadas
  - `components/<dominio>/*.jsx` — componentes por domínio
  - `components/default/` — compartilhados: `Loading`, `Notificacao`, `ModalConfirmacao`, `Paginacao`, `PageTransition`, `Header`, `funcoes.js`
  - `services/api.js` — instância axios (Bearer do localStorage; normaliza erros para `{ status, code, message }`)
  - `services/api/<recurso>Services.js` — funções da API
- Imports **relativos** (sem alias `@/`).

## Regra #1 — Nunca recriar o que já existe

Antes de implementar, cheque `components/default/`:
| Necessidade | Use |
|---|---|
| Sucesso/erro | `<Notificacao>` + estado `{ show, tipo, titulo, mensagem }` |
| Confirmação | `<ModalConfirmacao>` + estado `{ show, texto, onSim }` |
| Carregando | `<Loading />` |
| Paginação | `<Paginacao>` + `dividirEmPartes` / `useItensPorPagina` |
| Erro de request | `tratarErro(setNotificacao, err, navigate)` |

**Componente novo só quando a funcionalidade realmente não existe.**

## Identidade Visual (tema escuro "glass")

| Elemento | Classes |
|---|---|
| Fundo da app | `bg-[#0A1633] text-white` (no `AppLayout`, com glows blur) |
| Card/painel | `rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-lg` (+ `backdrop-blur-md` sobreposto) |
| Cabeçalho de seção | `flex items-center justify-between px-6 py-4 border-b border-white/10` |
| Texto secundário | `text-white/70`, `text-white/80` |
| Botão neutro | `px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition cursor-pointer` |
| Badge contagem | `px-2 py-0.5 rounded-full bg-<cor>-600/20 text-<cor>-400 text-sm font-medium` |

**Cores semânticas:** emerald = ok/ativo, amber = atenção/prazo próximo, rose/red = erro/atrasado/inativo, blue/indigo/sky = informativo. Sempre `cursor-pointer` no clicável.

## Estado e Dados
- `useState` + `useEffect`. Sem TanStack Query, Redux, RHF ou Zod.
- Busca em `async function buscarX()` chamada por `useEffect`; `setLoading` ao redor.
- Dados via `services/api/<recurso>Services.js` — nunca `axios`/`fetch` direto no componente.
- Contexto do localStorage: `token`, `empresa_id`, `usuario_id`, `usuario_tipo`, `usuario_nome`, etc.

## Feedback (padrão fixo)
```jsx
const [notificacao, setNotificacao] = useState({ show: false, tipo: "sucesso", titulo: "", mensagem: "" });
const [confirmacao, setConfirmacao] = useState({ show: false, texto: "", onSim: null });

{loading && <Loading />}
{notificacao.show && (
  <Notificacao
    tipo={notificacao.tipo} titulo={notificacao.titulo} mensagem={notificacao.mensagem}
    onClick={() => setNotificacao({ show: false, tipo: "sucesso", titulo: "", mensagem: "" })}
  />
)}
{confirmacao.show && (
  <ModalConfirmacao
    texto={confirmacao.texto}
    onNao={() => setConfirmacao({ show: false, texto: "", onSim: null })}
    onSim={confirmacao.onSim}
  />
)}
```

## Service (padrão)
```js
import { api } from "../api.js";

export async function getItens(id) {
  try {
    const response = await api.get(`/item/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro em getItens:", err);
    throw err;
  }
}
```

## Página (padrão de listagem)
```jsx
async function buscarItens() {
  setLoading(true);
  try {
    const itens = await getItens(localStorage.getItem("empresa_id"));
    setItens(itens);
  } catch (err) {
    tratarErro(setNotificacao, err, navigate);
  } finally {
    setLoading(false);
  }
}
useEffect(() => { buscarItens(); }, [/* deps */]);
```

## Ícones e Animação
- **lucide-react** para ações (`Plus`, `X`, `FunnelPlus`, `Wrench`...).
- **framer-motion** (`motion`, `AnimatePresence`) — siga `AppLayout`/`Notificacao`.

## Fazer
- Reutilizar `components/default/` e os services.
- Tailwind v4 apenas; manter o tema escuro glass.
- Classes condicionais com template string (sem `cn()`).
- `cond ? <X/> : null` quando `cond` puder ser número.

## Não Fazer
- Recriar `Notificacao`/`ModalConfirmacao`/`Loading`/`Paginacao`.
- Introduzir shadcn/ui, TanStack Query, RHF/Zod, TypeScript.
- Cores fora da paleta escura; fundo branco/slate de ERP.
- Chamar a API sem passar por `services/api/`.
- Deixar `console.log` de depuração no entregue.
