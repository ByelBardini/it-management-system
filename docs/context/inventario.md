# Contexto — Inventário (itens, características, anexos, peças)

Leia junto com [backend-core.md](backend-core.md) e [frontend-core.md](frontend-core.md).

## Arquivos
- Backend: `controllers/itemController.js`, `pecasController.js`; `routes/itemRoutes.js`, `pecasRoutes.js`, `downloadRoutes.js`; `models/itens.js`, `caracteristicas.js`, `anexos.js`, `pecas.js`; `middlewares/anexosUpload.js`.
- Frontend: `pages/Inventario.jsx`, `CadastroItem.jsx`, `Pecas.jsx`; `components/inventario/*`, `components/caracteristicas/*` (+ `cadastro/<Tipo>.jsx` por categoria), `components/pecas/*`, `components/anexos/*`, `components/itens/DadosGerais.jsx`; `services/api/itemServices.js`, `pecasServices.js`.

## Endpoints (todos `adm`)
| Método | Path | Ação |
|---|---|---|
| GET | `/item/:id` | itens ativos da empresa (etiqueta, nome, tipo, em_uso, setor, workstation) |
| GET | `/item/inativos/:id` | itens com `item_ativo=0` + características |
| GET | `/item/full/:id` | item completo (características, peças, anexos) |
| GET | `/item/workstation/:id` | itens vinculados a um workstation |
| POST | `/item/` | cria (multipart) em transação |
| PUT | `/item/:id` | edita nome/setor/workstation/em_uso; rebalanceia peças (desktop); reconcilia anexos |
| PUT | `/item/inativa/:id` | soft delete |
| PUT | `/item/workstation/remover/:id` | desvincula do workstation |
| POST/GET/PUT | `/pecas/*` | CRUD de peças (criar, listar ativas/inativas, inativar) |
| GET | (`downloadRoutes`) | servir/baixar anexo, com path saneado dentro de `/uploads` |

## Modelos
- **`itens`**: `item_id`, `item_empresa_id`, `item_setor_id` (null), `item_workstation_id` (null), `item_ativo` TINYINT(1), `item_data_inativacao` (null), `item_tipo` **ENUM** (desktop, notebook, movel, cadeira, monitor, ferramenta, ap, ar-condicionado, switch, periferico, no-break, impressora, gerador, celular, cabo, outros), `item_etiqueta` (VARCHAR 10), `item_num_serie`, `item_nome`, `item_preco` DOUBLE, `item_em_uso` TINYINT(1), `item_data_aquisicao`, `item_ultima_manutencao`, `item_intervalo_manutencao` (meses).
- **`caracteristicas`**: `caracteristica_id`, `caracteristica_item_id`, `caracteristica_nome`, `caracteristica_valor` (TEXT). Pares nome/valor específicos por categoria.
- **`anexos`**: `anexo_id`, `anexo_item_id`, `anexo_tipo`, `anexo_nome`, `anexo_caminho` (relativo a `/uploads/anexos/`).
- **`pecas`**: `peca_id`, `peca_empresa_id`, `peca_item_id` (null), `peca_ativa` TINYINT(1), `peca_data_inativacao` (null), `peca_tipo` **ENUM** (processador, placa-video, placa-mae, ram, armazenamento, fonte, placa-rede, gabinete, outros), `peca_nome`, `peca_preco` DOUBLE, `peca_em_uso` TINYINT, `peca_data_aquisicao`.

## Regras de negócio
- **Criação multipart (`postItem`)** em **transação**: cria o item; se **não-desktop** grava características; se **desktop** vincula peças e calcula `item_preco` = Σ `peca_preco`; grava anexos. Campos compostos (`caracteristicas`, `pecas`) chegam como **string JSON** → `JSON.parse` em try/catch.
- **Desktop vs não-desktop:** desktop tem `item_num_serie = "N/A"`, **exige peças** (erro se vazio), sem características; não-desktop tem características por categoria (componentes em `caracteristicas/cadastro/<Tipo>.jsx`).
- **Peças selecionáveis:** apenas `peca_ativa=1` e `peca_item_id IS NULL`. Vincular seta `peca_em_uso=1`; peça em uso não pode ser inativada. Editar desktop reconcilia (desvincula/vincula) e **recalcula o preço**.
- **Edição não-desktop:** atualiza características; `observacoes` é upsert (atualiza se existe, senão cria).
- **Anexos removidos** são **movidos** para `/uploads/anexos/excluidos/` (preserva o arquivo) e o registro é `destroy` (com `usuarioId`).
- **Inativação:** `item_ativo=0`, `item_em_uso=0`, limpa setor/workstation, marca `item_data_inativacao`.
- Vínculo a setor/workstation é opcional; a edição aceita a string `"null"` para limpar.

## Frontend
- `Inventario.jsx`: listagem ativos/inativos, filtros em memória (`CampoFiltros`), paginação (`dividirEmPartes` + `Paginacao`), abre `CardItem`/`EditarItem`.
- `CadastroItem.jsx`: monta `FormData` (DadosGerais + características/peças + anexos) e envia multipart; `caracteristicas`/`pecas` via `JSON.stringify`.
- `Pecas.jsx`: CRUD de peças com filtros e paginação.

## Gotchas
- O `anexosUpload` valida o balanço entre tipos/nomes/arquivos; desbalanço → 400.
- Filtros são aplicados **no front** (em memória), não no backend.
- `item_intervalo_manutencao` em meses alimenta o domínio de [manutencoes.md](manutencoes.md).
