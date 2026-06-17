# Contexto — Manutenções e Dashboard

Leia junto com [backend-core.md](backend-core.md) e [frontend-core.md](frontend-core.md). Manutenção opera sobre os campos de manutenção do model `itens` (ver [inventario.md](inventario.md)).

## Arquivos
- Backend: `controllers/manutencaoController.js`, `dashboardController.js`; `routes/manutencoesRoutes.js`, `dashboardRoutes.js`.
- Frontend: `pages/Manutencoes.jsx`, `pages/App.jsx` (dashboard); `components/manutencoes/*` (TabelaManutencoes, ExibirManutencao, AlterarIntervalo, CampoFiltros, Filtro, FiltroPrazo); `services/api/manutencaoServices.js`, `dashboardServices.js`; helpers em `components/default/funcoes.js`.

## Endpoints (todos `adm`)
| Método | Path | Ação |
|---|---|---|
| GET | `/manutencao/:id` | itens em uso da empresa com intervalo > 0 (etiqueta, tipo, última manutenção, intervalo, `setor`, `marca`/`modelo` via FK — não traz mais `item_nome`) |
| PUT | `/manutencao/:id` | altera `item_intervalo_manutencao` (meses) |
| PUT | `/manutencao/realizar/:id` | seta `item_ultima_manutencao = now()` (registra a manutenção feita) |
| GET | `/dashboard/:id` | agrega indicadores da empresa |

## Cálculo de prazo
- Prazo ≈ `item_ultima_manutencao + (item_intervalo_manutencao × 30 dias)`. **Aproximação de 30 dias/mês**, não calendário real.
- `funcoes.js`:
  - `getDiffDias(ultima, intervalo)` → dias até o próximo prazo (negativo = atrasado).
  - `formatarIntervalo(intervalo, diffDias)` → texto ("Não é realizado" se intervalo 0; "Atrasado N dias"; "N dias"; "N meses").
  - `formatarIntervaloTabela(intervalo, diffDias)` → classe de cor (verde > 5 dias ou intervalo 0; amarelo 0–5; vermelho atrasado).
- `item_intervalo_manutencao = 0` → não tem manutenção periódica.

## Dashboard (`/dashboard/:id` → `pages/App.jsx`)
O endpoint agrega e o front deriva os indicadores:
- **Equipamentos:** total de ativos + contagem por `item_tipo`.
- **Senhas:** total, e quantas "precisam atualizar" vs "atualizadas" (derivado por `getDiffDias` sobre `senha_ultima_troca`/`senha_tempo_troca`; `tempo_troca=0` conta como atualizada).
- **Manutenções:** "em dia", "faltando 30 dias", "atrasada" (derivado por `getDiffDias` sobre os campos de manutenção).
- **Workstations:** com workstation / sem workstation (em uso) / em estoque.

O dashboard **não** descriptografa senhas — recebe só `senha_ultima_troca`/`senha_tempo_troca`.

## Gotchas
- Os cortes de status (em dia / 30 dias / atrasada) vivem no **front** (em `App.jsx`/componentes), não no backend — mantenha a lógica de `getDiffDias` consistente entre dashboard, manutenções e senhas.
- Só itens **em uso** e com intervalo > 0 entram na lista de manutenções.
