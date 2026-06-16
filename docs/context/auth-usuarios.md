# Contexto — Autenticação, Usuários e Perfil

Leia junto com [backend-core.md](backend-core.md) e [frontend-core.md](frontend-core.md).

## Arquivos
- Backend: `controllers/authController.js`, `usuarioController.js`, `perfilController.js`; `routes/authRoutes.js`, `usuarioRoutes.js`, `perfilRoutes.js`; `models/usuarios.js`; `middlewares/autenticaToken.js`, `perfilUpload.js`.
- Frontend: `pages/Login.jsx`, `Usuarios.jsx`, `Perfil.jsx`; `components/usuarios/*` (TabelaUsuario, ModalAdicionaUsuario, ExibeUsuario), `components/perfil/*` (EditarUsuario, TrocarSenha, PrimeiroAcesso); `services/auth/authService.js`, `services/api/usuariosServices.js`, `perfilServices.js`.

## Endpoints
| Método | Path | Papel | Ação |
|---|---|---|---|
| POST | `/login` | público | valida login/senha (bcrypt) + `usuario_ativo`; gera JWT 8h; retorna `{ token, resposta }` |
| GET | `/usuario/` | adm | lista usuários (sem o hash) |
| POST | `/usuario/` | adm | cria usuário (nome, login, tipo); senha padrão **"12345"**, `usuario_troca_senha=1` |
| PUT | `/usuario/inativa/:id` | adm | alterna `usuario_ativo` |
| PUT | `/usuario/reseta/:id` | adm | reseta senha p/ "12345", `usuario_troca_senha=1` |
| PUT | `/perfil/troca/:id` | próprio/adm | troca senha (exige senha atual + nova, bcrypt); `usuario_troca_senha=0` |
| PUT | `/perfil/primeira/:id` | próprio/adm | primeira troca (só nova senha); `usuario_troca_senha=0` |
| PUT | `/perfil/:id` | próprio/adm | atualiza nome + foto (multipart `foto`, imagem) em `/uploads/fotos/` |

## Modelo `usuarios` (`models/usuarios.js`)
`usuario_id` (PK), `usuario_nome`, `usuario_login`, `usuario_senha` (**hash bcrypt**), `usuario_tipo` ENUM(`"adm"`,`"usuario"`), `usuario_caminho_foto` (nullable), `usuario_ativo` TINYINT (default 1), `usuario_troca_senha` TINYINT (default 1).

## Fluxo de login
`Login.jsx` → `authService.logar()` → `POST /login`. Backend confere login → `usuario_ativo=1` → `bcrypt.compare`. JWT assinado com `{ usuario_id, usuario_tipo, usuario_nome }`, `SECRET_KEY_LOGIN`, `expiresIn: "8h"`. Front grava `token` + dados em localStorage (ver [frontend-core](frontend-core.md)). Logout = limpar localStorage (sem endpoint).

## Regras / gotchas
- **Nunca retornar `usuario_senha`** (hash) em resposta.
- Inativo é bloqueado **antes** do `bcrypt.compare` no login.
- **Primeiro acesso:** `usuario_troca_senha=1` força troca; o front exibe `PrimeiroAcesso` quando `localStorage["usuario_troca_senha"]` indica pendência. Guard de redirecionamento por tipo de usuário ainda é item de TODO.
- `usuario_tipo` hoje é `adm`/`usuario`; o README prevê papel `supervisor` e granularidade por usuário (afeta senhas) — ver [senhas.md](senhas.md) e o agente `seguranca-infrahub`.
- Upload de foto: whitelist de imagem, limite de tamanho, nome com timestamp.
