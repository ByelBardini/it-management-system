# Contexto — Marcas e Modelos (cadastro central)

Leia junto com [backend-core.md](backend-core.md) e [frontend-core.md](frontend-core.md). Cadastro global de **marcas** e **modelos** que itens e peças referenciam por id. Substitui o antigo `item_nome`/`peca_nome` (texto livre): a identidade passa a ser **marca + modelo**, com o número de série diferenciando unidades iguais. Marca/modelo são **escopados por (domínio, tipo, subtipo)**, sobre uma lista gerenciável de **subtipos**. Schema veio na migração `0002_marcas_modelos.sql` (ver [banco-migrations.md](banco-migrations.md)); uso em itens/peças em [inventario.md](inventario.md).

## Arquivos
- Backend: `controllers/marcaController.js`, `modeloController.js`, `subtipoController.js`; `routes/marcaRoutes.js`, `modeloRoutes.js`, `subtipoRoutes.js` (montadas em `app.js` como `/marca`, `/modelo`, `/subtipo`); `models/marcas.js`, `modelos.js`, `subtipos.js` (associações em `models/index.js` — `Subtipo` é registrado **sem associação**).
- Frontend: `components/marca/CartaoMarcas.jsx` (+ `AdicionarMarca.jsx`, `AdicionarModelo.jsx`) em `pages/Configuracoes.jsx`; `components/inventario/SelecaoMarcaModelo.jsx` e `SelecaoSubtipo.jsx` (comboboxes usados no cadastro/edição de item e no cadastro de peça); `components/inventario/tiposComSubtipo.js` (lista dos 7 tipos que têm subtipo); `services/api/marcaServices.js`, `modeloServices.js`, `subtipoServices.js`.

## Endpoints (todos exigem auth + role `adm`)
| Método | Path | Ação |
|---|---|---|
| GET | `/marca?dominio=&tipo=&subtipo=` | lista marcas do escopo (ordenadas por nome). `dominio` e `tipo` são **obrigatórios** (400 sem eles); `subtipo` ausente vira `""` |
| POST | `/marca` | cria marca (`{marca_nome, marca_dominio, marca_tipo, marca_subtipo}`; `marca_subtipo` cai em `""`) → `{message, marca_id}` |
| GET | `/marca/:id/modelos` | lista modelos da marca (ordenados por nome) |
| POST | `/modelo` | cria modelo (`{modelo_marca_id, modelo_nome}`) → `{message, modelo_id}` |
| GET | `/subtipo?tipo=` | lista subtipos do tipo (ordenados por nome). `tipo` é **obrigatório** (400 sem ele) |
| POST | `/subtipo` | cria subtipo (`{subtipo_tipo, subtipo_nome}`) → `{message, subtipo_id}` |

## Modelos
- **`marcas`**: `marca_id` PK, `marca_nome` VARCHAR(100), `marca_dominio` **ENUM**(`item`,`peca`), `marca_tipo` VARCHAR(40), `marca_subtipo` VARCHAR(100) **DEFAULT `''`**. UNIQUE(`marca_nome`,`marca_dominio`,`marca_tipo`,`marca_subtipo`) — o mesmo nome pode coexistir em escopos diferentes.
- **`subtipos`**: `subtipo_id` PK, `subtipo_tipo` VARCHAR(40), `subtipo_nome` VARCHAR(100). UNIQUE(`subtipo_tipo`,`subtipo_nome`). **Sem FK/associação** (lista solta consultada por tipo).
- **`modelos`**: `modelo_id` PK, `modelo_marca_id` FK→`marcas` (**ON DELETE CASCADE**), `modelo_nome` VARCHAR(100). UNIQUE(`modelo_marca_id`,`modelo_nome`).
- **Associações** (`models/index.js`): Marca →(hasMany)→ Modelo (`CASCADE`, as `modelos`); Modelo `belongsTo` Marca (as `marca`). Item/Peca `belongsTo` Marca/Modelo as `marca`/`modelo` (FK `*_marca_id`/`*_modelo_id`, **ON DELETE SET NULL**).

## Regras de negócio
- **Escopo (domínio, tipo, subtipo):** cada combinação tem sua própria lista de marcas (e modelos abaixo delas). O `dominio` vem da tela (item ou peça); o `tipo` é o tipo do item/peça.
- **Subtipo só nos 7 tipos de ITEM:** `periferico`, `impressora`, `ferramenta`, `cabo`, `gerador`, `movel`, `outros` (em `tiposComSubtipo.js`). Os demais tipos de item e **todas** as peças usam `subtipo = ''` — escopam só por tipo.
- **Sem timestamps**; sem hook de auditoria próprio (controllers passam `usuarioId` no `create` por convenção, mas não há `afterCreate` em Marca/Modelo/Subtipo).
- Apagar uma marca cascateia seus modelos; itens/peças que apontavam viram `NULL` (ficam "Sem marca"/"Sem modelo", não somem).

## Frontend
- **Cascata do cadastro:** Tipo → **Subtipo** (só nos 7 tipos, capturado em `itens/DadosGerais.jsx`) → **Marca** → **Modelo**. A marca **trava** até o subtipo ser escolhido (`marcaBloqueada` em `SelecaoMarcaModelo`, placeholder "Escolha o subtipo primeiro"); o modelo trava até a marca.
- **`SelecaoSubtipo.jsx`**: combobox "selecionar ou adicionar" do subtipo (props `tipo`, `subtipo` (string = nome), `onChange(nome)`). Lista via `getSubtipos(tipo)`; **Adicionar "…"** cria via `postSubtipo` e já seleciona. O subtipo é persistido como a **característica de nome `tipo`** do item (não há coluna de subtipo no item; `EditarItem.jsx` lê/grava essa característica).
- **`SelecaoMarcaModelo.jsx`**: combobox controlado "selecionar ou adicionar" (props `dominio`, `tipo`, `subtipo`, `marcaId`, `modeloId`, `onChange`). Recarrega marcas a cada mudança de domínio/tipo/subtipo; digitar um nome inédito oferece **Adicionar "…"** que cria via `postMarca(nome, dominio, tipo, subtipo)`/`postModelo` e já seleciona. Atalho **Gerenciar** → `/config`. Reusado no cadastro (`itens/DadosGerais.jsx`), edição (`inventario/EditarItem.jsx`) e cadastro de peça (`pecas/ModalCadastraPecas.jsx`, **sem** subtipo).
- **`CartaoMarcas.jsx`** (em `Configuracoes.jsx`): gerência do cadastro, navegando **domínio → tipo → (subtipo, nos 7 tipos) → marcas → modelos** (não recebe `dominio` por prop). Lista marcas do escopo e adiciona via `AdicionarMarca`/`AdicionarModelo`.
- Serviços: `marcaServices.js` (`getMarcas(dominio, tipo, subtipo)`, `postMarca(nome, dominio, tipo, subtipo)`), `modeloServices.js` (`getModelos(marcaId)`, `postModelo(marcaId, nome)`), `subtipoServices.js` (`getSubtipos(tipo)`, `postSubtipo(tipo, nome)`).

## Gotchas
- `getMarcas` **exige** `dominio` **e** `tipo` na query — sem qualquer um retorna 400. `getSubtipos` exige `tipo`.
- O cadastro é **global** (não por empresa): marcas/modelos/subtipos são compartilhados entre todas as empresas.
- O subtipo do item **não** é coluna: vive na característica `tipo` (o campo "Tipo" foi **removido** dos 7 formulários `caracteristicas/cadastro/*`). Peças não têm subtipo.
