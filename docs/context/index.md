# docs/context — Mapa de Contexto do InfraHub

Estes documentos são a **fonte de verdade leve** para os agentes (`/plan`, `/exec-plan`, especialistas). Cada arquivo resume uma área: caminhos reais, endpoints, modelos, regras de negócio e armadilhas — para planejar sem reler todo o código.

> Mantido pelo agente `docs-contexto`. Ao mudar contrato de API, coluna de model, regra de negócio ou padrão de componente, **atualize o doc da área**.

## Como usar (agentes de plano)
1. Leia este índice e identifique a(s) área(s) afetada(s).
2. Leia o(s) doc(s) de contexto da(s) área(s) **+ sempre** os dois núcleos (`backend-core` / `frontend-core`).
3. Só então abra os arquivos de código específicos que serão alterados.

## Núcleos transversais (leia sempre que tocar a camada)
- [backend-core.md](backend-core.md) — Express 5, `ApiError`, autenticação/autorização, hooks de auditoria, Sequelize, transações, cripto, testes.
- [frontend-core.md](frontend-core.md) — React/JSX, Tailwind v4 "dark glass", `services/api`, `Notificacao`/`ModalConfirmacao`/`Loading`/`Paginacao`, `funcoes.js`, `tratarErro`, localStorage, testes.

## Domínios
| Área | Doc | Backend | Frontend |
|---|---|---|---|
| Autenticação, usuários, perfil | [auth-usuarios.md](auth-usuarios.md) | `authController`, `usuarioController`, `perfilController`, `autenticaToken` | `Login`, `Usuarios`, `Perfil` |
| Inventário (itens, características, anexos, peças) | [inventario.md](inventario.md) | `itemController`, `pecasController`, `anexosUpload`, `downloadRoutes` | `Inventario`, `CadastroItem`, `Pecas` |
| Senhas e plataformas | [senhas.md](senhas.md) | `senhaController`, `plataformaController` | `Senhas`, `components/senhas`, `components/plataforma` |
| Manutenções e dashboard | [manutencoes.md](manutencoes.md) | `manutencaoController`, `dashboardController` | `Manutencoes`, `App` (dashboard) |
| Empresas, setores, workstations | [empresas-setores-workstations.md](empresas-setores-workstations.md) | `empresaController`, `setorController`, `workstationController` | `Empresas`, `Workstations`, `Configuracoes` |

## Hierarquia de dados
`Empresa → Setor → Workstation → Item` (com Características, Anexos e Peças pendurados no Item). A **empresa ativa** é escolhida em `Empresas` e guardada em `localStorage["empresa_id"]`, usada por todas as outras telas.
