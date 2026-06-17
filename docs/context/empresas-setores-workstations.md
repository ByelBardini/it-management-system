# Contexto — Empresas, Setores e Workstations

Leia junto com [backend-core.md](backend-core.md) e [frontend-core.md](frontend-core.md). É a espinha dorsal da hierarquia `Empresa → Setor → Workstation → Item`.

## Arquivos
- Backend: `controllers/empresaController.js`, `setorController.js`, `workstationController.js`; `routes/empresaRoutes.js`, `setorRoutes.js`, `workstationRoutes.js`; `models/empresas.js`, `setores.js`, `workstations.js`.
- Frontend: `pages/Empresas.jsx`, `Workstations.jsx`, `Configuracoes.jsx`; `components/empresas/ListaEmpresa.jsx`, `components/setores/AdicionarSetor.jsx`, `components/workstations/*` (AdicionaWorkstation, ModalWorkstation, Filtro); `services/api/empresaServices.js`, `setorServices.js`, `workstationServices.js`.

## Endpoints
| Método | Path | Papel | Ação |
|---|---|---|---|
| GET | `/empresa` | autenticado | lista empresas (id, nome) |
| GET | `/empresa/setores-workstations/:id` | adm | setores + workstations da empresa |
| GET | `/setor/:id` | adm | setores da empresa |
| POST | `/setor` | adm | cria (`setor_empresa_id`, `setor_nome`) |
| DELETE | `/setor/:id` | adm | exclui (`.destroy` com `usuarioId`) |
| GET | `/workstation/:id` | adm | workstations da empresa (+ setor) |
| POST | `/workstation` | adm | cria (empresa, setor, nome, anydesk opcional) |
| DELETE | `/workstation/:id` | adm | exclui |

## Modelos
- **`empresas`**: `empresa_id`, `empresa_nome`, `empresa_cnpj`.
- **`setores`**: `setor_id`, `setor_empresa_id` (FK), `setor_nome`.
- **`workstations`**: `workstation_id`, `workstation_empresa_id` (FK), `workstation_setor_id` (FK), `workstation_nome`, `workstation_anydesk` (null), `workstation_senha_anydesk` (null).

## Relacionamentos (`models/index.js`)
- Empresa →(hasMany)→ Setor: `onDelete: CASCADE`.
- Setor →(hasMany)→ Workstation: `onDelete: CASCADE`. Empresa →(hasMany)→ Workstation: `CASCADE`.
- Setor/Workstation →(hasMany)→ Item: `onDelete: SET NULL` (itens ficam órfãos de setor/workstation, não somem).
- Excluir setor → cascateia workstations → itens daquelas workstations ficam com `item_workstation_id = NULL`.

## Empresa ativa
`Empresas.jsx` é a tela inicial pós-login: clicar grava `localStorage["empresa_id"]` (e `empresa_nome`) e navega para o app. **Todas** as outras telas leem `empresa_id` do localStorage para buscar dados — sem ele, quebram (não há fallback explícito).

## Frontend
- `Empresas.jsx`: seleção de empresa, "Sair" (limpa localStorage) e atalho "Usuários" (adm).
- `Workstations.jsx`: lista da empresa ativa; abre `ModalWorkstation` (itens da workstation + credencial AnyDesk com toggle mostrar/esconder + excluir).
- `Configuracoes.jsx`: CRUD de **setores** (empresa ativa) + CRUD de **plataformas** (global, ver [senhas.md](senhas.md)) + gerência de **marcas/modelos** (`CartaoMarcas`, cadastro central global com toggle Itens/Peças — ver [marcas-modelos.md](marcas-modelos.md)); modais de criação e `ModalConfirmacao` antes de excluir.

## Gotchas
- **AnyDesk em texto plano:** `workstation_senha_anydesk` é armazenada sem cifrar — diferente das senhas de plataforma. Sinalizar ao agente `seguranca-infrahub` em mudanças nessa área.
- Cascata de exclusão pode deixar itens sem setor/workstation (esperado, via `SET NULL`).
- `empresa_id` ausente no localStorage é a causa nº 1 de tela vazia/erro nessas páginas.
