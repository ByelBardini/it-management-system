# Contexto — Autenticação, Usuários e Perfil

Leia junto com [backend-core.md](backend-core.md) e [frontend-core.md](frontend-core.md).

## Arquivos
- Backend: `controllers/authController.js`, `usuarioController.js`, `perfilController.js`; `routes/authRoutes.js`, `usuarioRoutes.js`, `perfilRoutes.js`; `models/usuarios.js`; `middlewares/autenticaToken.js`, `perfilUpload.js`.
- Frontend: `pages/Login.jsx`, `Usuarios.jsx`, `Perfil.jsx`; `components/usuarios/*` (TabelaUsuario, ModalAdicionaUsuario, ExibeUsuario), `components/perfil/*` (EditarUsuario, TrocarSenha, PrimeiroAcesso); `services/auth/authService.js`, `services/api/usuariosServices.js`, `perfilServices.js`.

## Endpoints
| Método | Path | Papel | Ação |
|---|---|---|---|
| POST | `/login` | público (rate-limit) | valida login/senha (bcrypt) + `usuario_ativo`; gera JWT 8h; **grava cookie httpOnly `token`** e retorna `{ resposta }` (sem token no body) |
| POST | `/logout` | público | limpa o cookie de sessão (`res.clearCookie`) |
| GET | `/usuario/` | adm | lista usuários (sem o hash) |
| POST | `/usuario/` | adm | cria usuário (nome, login, tipo); senha padrão **"12345"**, `usuario_troca_senha=1` |
| PUT | `/usuario/inativa/:id` | adm | alterna `usuario_ativo` |
| PUT | `/usuario/reseta/:id` | adm | reseta senha p/ "12345", `usuario_troca_senha=1` |
| PUT | `/perfil/troca/:id` | próprio/adm | troca senha (exige senha atual + nova, bcrypt); `usuario_troca_senha=0` |
| PUT | `/perfil/primeira/:id` | próprio/adm | primeira troca (só nova senha); `usuario_troca_senha=0` |
| PUT | `/perfil/:id` | próprio/adm | atualiza nome + foto (multipart `foto`, imagem) em `/uploads/fotos/` |

## Modelo `usuarios` (`models/usuarios.js`)
`usuario_id` (PK), `usuario_nome`, `usuario_login`, `usuario_senha` (**hash bcrypt**), `usuario_tipo` ENUM(`"adm"`,`"usuario"`,`"cadastrador"`), `usuario_caminho_foto` (nullable), `usuario_ativo` TINYINT (default 1), `usuario_troca_senha` TINYINT (default 1).

## Papéis e autorização (`middlewares/autenticaToken.js`)
- `autenticar` — valida o JWT (cookie httpOnly; header Authorization como fallback) e popula `req.usuario = { id, tipo, nome }`.
- `autorizarRole(role)` — libera se `tipo === role` **ou** `tipo === "adm"`. Sem `req.usuario` → 401; caso contrário → 403.
- `autorizarQualquerRole(roles)` — libera se `tipo ∈ roles` **ou** `tipo === "adm"`. Mesmo formato (síncrono, lança `ApiError`). Usado para liberar verbos específicos ao `cadastrador` sem dar poderes de `adm`.
- `autorizarUser()` — dono do recurso (`req.params.id`) ou `adm`.

### Papel `cadastrador` (app de cadastro mobile — PWA/TWA)
Papel restrito criado para o **app de cadastro mobile** ([frontend-core.md](frontend-core.md)): cria itens e os cadastros da cascata, **sem** editar/excluir/importar. Evita embarcar credencial `adm` num APK distribuído fora de loja. A autorização nas rotas é **por verbo** (não mais `router.use(autorizarRole("adm"))` global).

| Rota | Verbo | `cadastrador` | `adm` | `usuario` |
|---|---|:---:|:---:|:---:|
| `/item` | POST `/` (criar) | ✅ | ✅ | ❌ |
| `/item` | GET, PUT, inativa, importar, coletar-desktop | ❌ | ✅ | ❌ |
| `/marca` | GET `/`, GET `/:id/modelos`, POST `/` | ✅ | ✅ | ❌ |
| `/modelo` | POST `/` | ✅ | ✅ | ❌ |
| `/subtipo` | GET `/`, POST `/` | ✅ | ✅ | ❌ |
| `/empresa` | GET `/` (listar) | ✅ | ✅ | ✅¹ |

¹ `GET /empresa` só tem `autenticar` (sem gate de papel): a seleção de empresa (`Empresas.jsx`) é **universal** — todo usuário precisa listar para escolher a empresa ativa. Gateá-la ao `cadastrador` quebraria o `usuario`; por isso foi mantida aberta (divergência consciente da linha 41 do plano). Expõe só `empresa_id`/`empresa_nome`.

**Invariantes do TWA:** o app carrega a **mesma origem** que serve `/api` (nginx faz proxy) — o cookie `SameSite=Strict` trafega normalmente e **nada de credencial vai no APK**. A origem pública exata do app **precisa** estar em `CORS_ORIGIN` do backend, senão `origemConfiavel` barra toda mutação com 403 (ver [deploy/coolify.md](../deploy/coolify.md)). Criar usuário(s) `cadastrador` é passo **manual/seed** (a UI de `Usuarios` ainda oferece só `adm`/`usuario` no dropdown).

## Fluxo de login
`Login.jsx` → `authService.logar()` → `POST /login`. Backend confere login → `usuario_ativo=1` → `bcrypt.compare`. JWT assinado com `{ usuario_id, usuario_tipo, usuario_nome }`, `SECRET_KEY_LOGIN`, `expiresIn: "8h"`, gravado em **cookie httpOnly** (`Secure`+`SameSite=Strict`, opções em `config/seguranca.js#opcoesCookie`). O token **não** volta no body. Front grava só dados de UI em localStorage (sem `token`). **Logout:** `authService.deslogar()` → `POST /logout` (limpa o cookie) + limpa o localStorage. Rate-limit no `/login` via `middlewares/rateLimit.js`.

## Regras / gotchas
- **Nunca retornar `usuario_senha`** (hash) em resposta.
- Inativo é bloqueado **antes** do `bcrypt.compare` no login.
- **Primeiro acesso:** `usuario_troca_senha=1` força troca; o front exibe `PrimeiroAcesso` quando `localStorage["usuario_troca_senha"]` indica pendência. Guard de redirecionamento por tipo de usuário ainda é item de TODO.
- `usuario_tipo` é `adm`/`usuario`/`cadastrador` (este último p/ o app mobile — ver acima). O README prevê ainda papel `supervisor` e granularidade por usuário (afeta senhas) — ver [senhas.md](senhas.md) e o agente `seguranca-infrahub`.
- Upload de foto: whitelist de imagem, limite de tamanho, nome com timestamp.
