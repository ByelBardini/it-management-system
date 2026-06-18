# Contexto — Frontend Core (`client/`)

Convenções transversais do frontend. **Leia sempre que tocar `client/`.**

## Stack e estrutura
- React 19, Vite 7, **JSX puro (sem TypeScript)**, Tailwind v4 (`@import "tailwindcss"`), React Router 7, lucide-react, framer-motion, axios, brazilian-values. **SPA web** servida por nginx em produção (sem Tauri); `Dockerfile` + `nginx.conf.template` (proxy `/api`, fallback SPA, headers). `vite base: "/"`.
- `client/src/`: `pages/*.jsx` (rotas), `components/<dominio>/*.jsx`, `components/default/` (compartilhados), `services/api.js` + `services/api/<recurso>Services.js`, `services/auth/`.
- Imports **relativos** (sem alias `@/`).
- `AppLayout.jsx` define o fundo (dark navy `bg-[#0A1633]` **sólido**, sem glow/grade/blobs) e a transição de página (framer-motion). `Header.jsx` no topo (sólido + `border-b border-white/10`). Páginas standalone (`Login`, `Empresas`, `Usuarios`, `CadastroItem`) usam o mesmo navy sólido na raiz, também sem decoração de fundo.

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

## Identidade visual (dark minimal)
> Tema enxuto: **sem** `backdrop-blur`, **sem** `shadow-*`, **sem** glow/grade/blobs no fundo, **sem** anéis/preenchimentos aninhados nem "caixinha" colorida em volta de ícone. Uma superfície plana por nível; cor só onde carrega significado (status e ação).
- Card/painel: `rounded-xl bg-white/[0.03] ring-1 ring-white/10` (um único `ring` por superfície; sem `shadow`/`backdrop-blur`).
- Modal: overlay `bg-black/60` ou `bg-black/70` (sem blur); painel **opaco** `bg-[#0E1A38] ring-1 ring-white/10` (opaco compensa a ausência de blur).
- Painel aninhado (card dentro de card): sem fill/ring próprios — usar espaçamento e `divide-y divide-white/10` em listas.
- Ícone "de chip": só o ícone, com `text-{cor}-400` (status) ou `text-white/40` (neutro) — **sem** caixa `bg-{cor}-500/15 ring-1 ring-{cor}-400/20`. Contagem: número simples (`text-white font-semibold`), sem pílula em caixa.
- Cabeçalho de seção: `flex items-center justify-between px-6 py-4 border-b border-white/10`.
- Texto secundário: `text-white/70` / `text-white/80`. Botão neutro: `bg-white/5 ring-1 ring-white/10 hover:bg-white/10`. Inputs/selects mantêm `bg-white/5`/`bg-white/10` (funcionais).
- Cores semânticas: **emerald** ok/ativo, **amber** atenção/prazo próximo, **rose/red** erro/atrasado/inativo, **blue/indigo/sky** informativo. Botões de ação seguem sólidos (`bg-sky-600`, `bg-indigo-600`, `bg-emerald-600`, `bg-red-600`). Sempre `cursor-pointer` no clicável.

## Dados e estado
- `useState` + `useEffect`. **Sem** TanStack Query, Redux, React Hook Form ou Zod.
- Busca em `async function buscarX()` chamada por `useEffect`; `setLoading` ao redor; `finally`/catch com `tratarErro`.
- Dados **sempre** via `services/api/<recurso>Services.js` — nunca `axios`/`fetch` direto no componente.
- Re-fetch após CRUD: padrão de flag (`editado`/`modificado`) na dependência do `useEffect`.

## API client (`services/api.js`)
Instância axios: `baseURL = VITE_API_BASE_URL` (`/api`), `withCredentials: true` (envia o **cookie httpOnly** de sessão na mesma origem), e **normaliza erros** para `{ status, code, message }` (rejeita assim). **Não** injeta mais `Authorization` — a sessão vive no cookie, inacessível ao JS. Os services wrappeiam com try/catch que loga e relança. Login/logout em `services/auth/authService.js` (`logar`/`deslogar`).

## localStorage (chaves)
`usuario_id`, `usuario_login`, `usuario_tipo`, `usuario_nome`, `usuario_troca_senha`, `usuario_caminho_foto`, `empresa_id`, `empresa_nome`; e (app mobile) `cad_ultimo_tipo`, `cad_ultimo_marca`, `cad_ultimo_modelo` (última escolha, em `mobile/preferencias.js`). **O `token` NÃO fica mais aqui** (cookie httpOnly). Não há route guard no front: a auth é garantida pelo 401/403 do servidor (tratado por `tratarErro`). A **empresa ativa** (`empresa_id`) é base de quase toda busca; sem ela, várias telas quebram.

## App de cadastro mobile (PWA/TWA)
Rota standalone **`/cadastro-mobile`** (`pages/CadastroMobile.jsx`, em `main.jsx` sob `PageTransition`), instalável e empacotável como APK via TWA. Só **cria** itens (papel `cadastrador`, ver [auth-usuarios.md](auth-usuarios.md)); `desktop` fica de fora.
- **PWA:** `vite-plugin-pwa` (`VitePWA` em `vite.config.js`) — `generateSW`, `registerType:"autoUpdate"`, manifest (`start_url:/cadastro-mobile`, `theme_color:#0A1633`), `navigateFallback:/index.html`, `runtimeCaching` NetworkFirst **só GET** `/api`. `index.html` tem as metas PWA; ícone em `public/icon.svg` (PNGs do manifest gerados por `npx @vite-pwa/assets-generator` — ver [deploy/coolify.md](../deploy/coolify.md)). O `nginx.conf.template` serve `/sw.js`/`/manifest.webmanifest`/`/.well-known/assetlinks.json` com `location` próprios **antes** do fallback SPA (no-cache no shell, immutable em `/assets/`).
- **Reuso:** a página reaproveita `DadosGerais` (nova prop **`tiposOcultos=[]`** — mobile passa `["desktop"]` p/ filtrar o `<option>`), a cascata (`SelecaoSubtipo`/`SelecaoMarcaModelo`), `CadastroCaracteristica`, e `Notificacao`/`Loading`. **Não recria** nada disso.
- **`src/mobile/`** (lógica isolada e testada): `preferencias.js` (defaults = hoje + última escolha), `payloadCadastro.js` (`montarRegistro` — builder puro do mesmo multipart de `CadastroItem`, sem `pecas`; + `registroParaFormData`), `db.js` (wrapper IndexedDB, objectStore `outbox`), `filaOffline.js` (fila pura, `store`/`enviar` injetáveis: `enfileirar`/`drenar`/`reconstruirFormData`/`contarPendentes`; classifica erro de rede×401×403×4xx), `sync.js` (efeitos: drena no boot/`online`/pós-cadastro). `components/mobile/`: `CapturaFoto` (câmera + compressão canvas), `LeitorCodigo` (`BarcodeDetector` nativo, lazy, com cleanup do stream), `ContadorPendentes` (badge).
- **Offline:** submit online → `postItem`; offline ou erro de rede/5xx → `enfileirar` (IndexedDB). Drain: **rede** mantém+retry; **401** pausa e pede re-login; **403** pausa e sinaliza bloqueio (origem/permissão — re-login não resolve); **4xx** descarta. Background Sync (SW) fica como melhoria futura.

## Ícones e animação
lucide-react (ações: `Plus`, `X`, `FunnelPlus`, `Wrench`…); framer-motion (`motion`, `AnimatePresence`) — siga `AppLayout`/`Notificacao`.

## Não fazer
- Recriar `Notificacao`/`ModalConfirmacao`/`Loading`/`Paginacao`. Introduzir shadcn/TanStack/RHF/Zod/TS. Cores fora da paleta escura. Chamar a API sem `services/api/`. Deixar `console.log` de depuração.

## Testes
**Vitest + Testing Library + jsdom** (`pool: "forks"`), de dentro de `client/` (`cd client && npm test`). Mocke os services, envolva componentes com `useNavigate` em `MemoryRouter`, use `findBy*` para dado assíncrono. Guia completo: comando `/infrahub-frontend-tests`.
