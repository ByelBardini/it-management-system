# Contexto — Senhas e Plataformas

Leia junto com [backend-core.md](backend-core.md) e [frontend-core.md](frontend-core.md). **Domínio sensível** — ver agente `seguranca-infrahub`.

## Arquivos
- Backend: `controllers/senhaController.js`, `plataformaController.js`; `routes/senhaRoutes.js`, `plataformaRoutes.js`; `models/senhas.js`, `plataformas.js`.
- Frontend: `pages/Senhas.jsx`; `components/senhas/*` (TabelaSenhas, CardSenha, ModalRegistraSenha, AtualizarSenha, EditarDadosSenha, CampoFiltros, Filtro), `components/plataforma/AdicionarPlataforma.jsx`; `services/api/senhaServices.js`, `plataformaServices.js`.

## Endpoints
| Método | Path | Papel | Ação |
|---|---|---|---|
| GET | `/senha/:id` | autenticado | senhas da empresa (metadados; **sem** cifrado/IV) |
| GET | `/senha/full/:id` | autenticado | retorna a senha **descriptografada** + plataforma + usuário |
| POST | `/senha` | autenticado | cria (cifra a senha, gera IV) |
| PUT | `/senha/atualiza/:id` | autenticado | **troca a senha** (`atualizaSenha`: recifra com novo IV, atualiza `senha_ultima_troca`) |
| PUT | `/senha/:id` | autenticado | atualiza **metadados** (`putSenha`: `senha_nome`, `senha_tempo_troca`) |
| DELETE | `/senha/:id` | **adm** | exclui |
| GET | `/plataforma` | adm | lista plataformas |
| POST | `/plataforma` | adm | cria (`plataforma_nome`) |
| DELETE | `/plataforma/:id` | adm | exclui (bloqueia se houver senhas vinculadas — FK) |

> Atenção ao par confuso: **`/senha/atualiza/:id` troca a senha** e **`/senha/:id` edita só os metadados** (mapeamento em `routes/senhaRoutes.js`).

## Modelos
- **`senhas`**: `senha_id`, `senha_empresa_id`, `senha_usuario_id`, `senha_plataforma_id`, `senha_nome`, `senha_usuario`, `senha_criptografada`, `senha_iv`, `senha_ultima_troca` (DATE), `senha_tempo_troca` (INT, meses).
- **`plataformas`**: `plataforma_id`, `plataforma_nome`.

## Criptografia (crítico)
- **AES-256-CBC**, chave `process.env.SECRET_KEY_PASSWORD` (32 chars).
- **IV aleatório por registro** (`crypto.randomBytes(16)`), guardado em `senha_iv` (hex). O cifrado fica em `senha_criptografada` (hex).
- Cifrar (criar/trocar): gera IV → `crypto.createCipheriv` → grava cifrado + IV. Descifrar (**só** em `/senha/full/:id`): lê IV + cifrado → `crypto.createDecipheriv` → retorna **apenas** `senha_descriptografada`.
- **Nunca** retornar `senha_criptografada`/`senha_iv` ao front fora do `full/:id`; nunca logar a senha em claro; nunca cachear.

## Troca periódica
`senha_tempo_troca` (meses) + `senha_ultima_troca` definem o vencimento. O front usa `getDiffDias`/`formatarIntervalo` ([frontend-core](frontend-core.md)) para marcar "precisa atualizar" (amarelo/vermelho). `senha_tempo_troca = 0` → sem troca periódica.

## Gotchas
- Autorização atual é por empresa + `adm`; o README prevê que usuário comum veja **só as próprias senhas** — tratar como modelo em evolução (ver `seguranca-infrahub`).
- Excluir plataforma com senhas vinculadas falha por FK — trate como `conflict`.
