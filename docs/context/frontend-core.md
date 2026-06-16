# Contexto — Frontend Core (`client/`)

Convenções transversais do frontend. **Leia sempre que tocar `client/`.**

## Stack e estrutura
- React 19, Vite 7, **JSX puro (sem TypeScript)**, Tailwind v4 (`@import "tailwindcss"`), React Router 7, lucide-react, framer-motion, axios, brazilian-values. **SPA web** servida por nginx em produção (sem Tauri); `Dockerfile` + `nginx.conf.template` (proxy `/api`, fallback SPA, headers). `vite base: "/"`.
- `client/src/`: `pages/*.jsx` (rotas), `components/<dominio>/*.jsx`, `components/default/` (compartilhados), `services/api.js` + `services/api/<recurso>Services.js`, `services/auth/`.
- Imports **relativos** (sem alias `@/`).
- `AppLayout.jsx` define o fundo (dark navy `bg-[#0A1633]` + glows blur) e a transição de página (framer-motion). `Header.jsx` no topo.

## Componentes compartilhados — REUSE, não recrie (`components/default/`)
| Necessidade | Componente / helper |
|---|---|
| Sucesso/erro | `<Notificacao>` + estado `{ show, tipo, titulo, mensagem }` |
| Confirmação sim/não | `<ModalConfirmacao>` + estado `{ show, texto, onSim }` |
| Carregando | `<Loading />` |
| Paginação | `<Paginacao>` + `dividirEmPartes(lista, porPagina)` + `useItensPorPagina()` |
| Transição de rota | `<PageTransition>` / padrão do `AppLayout` |
| Tratar erro de request | `tratarErro(setNotificacao, err, navigate)` |

`funcoes.js` também tem: `getDiffDias`, `formatarIntervalo`, `formatarIntervaloTabela` (manutenções/senhas).

## Identidade visual (dark glass)
- Card/painel: `rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-lg` (+ `backdrop-blur-md` sobreposto).
- Cabeçalho de seção: `flex items-center justify-between px-6 py-4 border-b border-white/10`.
- Texto secundário: `text-white/70` / `text-white/80`. Botão neutro: `bg-white/5 ring-1 ring-white/10 hover:bg-white/10`.
- Cores semânticas: **emerald** ok/ativo, **amber** atenção/prazo próximo, **rose/red** erro/atrasado/inativo, **blue/indigo/sky** informativo. Sempre `cursor-pointer` no clicável.

## Dados e estado
- `useState` + `useEffect`. **Sem** TanStack Query, Redux, React Hook Form ou Zod.
- Busca em `async function buscarX()` chamada por `useEffect`; `setLoading` ao redor; `finally`/catch com `tratarErro`.
- Dados **sempre** via `services/api/<recurso>Services.js` — nunca `axios`/`fetch` direto no componente.
- Re-fetch após CRUD: padrão de flag (`editado`/`modificado`) na dependência do `useEffect`.

## API client (`services/api.js`)
Instância axios: `baseURL = VITE_API_BASE_URL` (`/api`), `withCredentials: true` (envia o **cookie httpOnly** de sessão na mesma origem), e **normaliza erros** para `{ status, code, message }` (rejeita assim). **Não** injeta mais `Authorization` — a sessão vive no cookie, inacessível ao JS. Os services wrappeiam com try/catch que loga e relança. Login/logout em `services/auth/authService.js` (`logar`/`deslogar`).

## localStorage (chaves)
`usuario_id`, `usuario_login`, `usuario_tipo`, `usuario_nome`, `usuario_troca_senha`, `usuario_caminho_foto`, `empresa_id`, `empresa_nome`. **O `token` NÃO fica mais aqui** (cookie httpOnly). Não há route guard no front: a auth é garantida pelo 401/403 do servidor (tratado por `tratarErro`). A **empresa ativa** (`empresa_id`) é base de quase toda busca; sem ela, várias telas quebram.

## Ícones e animação
lucide-react (ações: `Plus`, `X`, `FunnelPlus`, `Wrench`…); framer-motion (`motion`, `AnimatePresence`) — siga `AppLayout`/`Notificacao`.

## Não fazer
- Recriar `Notificacao`/`ModalConfirmacao`/`Loading`/`Paginacao`. Introduzir shadcn/TanStack/RHF/Zod/TS. Cores fora da paleta escura. Chamar a API sem `services/api/`. Deixar `console.log` de depuração.

## Testes
**Vitest + Testing Library + jsdom** (`pool: "forks"`), de dentro de `client/` (`cd client && npm test`). Mocke os services, envolva componentes com `useNavigate` em `MemoryRouter`, use `findBy*` para dado assíncrono. Guia completo: comando `/infrahub-frontend-tests`.
