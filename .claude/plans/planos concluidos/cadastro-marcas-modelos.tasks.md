# Tracking de execução — cadastro-marcas-modelos

Tempo gasto em cada etapa. Linguagem meio termo.

**Início:** —

| # | Etapa | O que está sendo feito | Início | Fim | Duração |
|---|-------|------------------------|--------|-----|---------|
| 1 | Banco + backend: cadastro central de marcas/modelos, itens e peças por id, sem "nome" (coberto por testes) | Cria a migração que adiciona as tabelas de marca e modelo, liga itens e peças a elas por id e remove as colunas de nome; sobem os models, as associações e os endpoints de marca/modelo (no padrão das plataformas); os controllers de item e peça param de exigir nome e passam a gravar/retornar marca e modelo. Testes antes do código (listar/criar marca e modelo, item/peça sem nome). | — | — | — |
| 2 | Configurações: gerência de marcas e modelos | Em Configurações entra um cartão de marcas (alternando entre itens e peças); com duplo-clique numa marca ela expande e permite ver/adicionar os modelos daquela marca. | — | — | — |
| 3 | Cadastro e edição: escolher ou adicionar na hora, e tirar o "nome" das telas | Um campo de seleção de marca/modelo reaproveitável: lista o que existe, deixa digitar e adicionar na hora (marca nova cria marca; modelo novo vincula à marca), com atalho para gerenciar em Configurações. Usado no cadastro e num modal de edição de item e de peça. O "nome" sai de todas as telas; a identificação passa a ser marca + modelo, com o número de série diferenciando. | — | — | — |
| 4 | Agrupamento exato + peças agrupadas | O agrupamento do inventário passa a ler marca/modelo direto do cadastro (sem adivinhação). As peças ganham a mesma navegação agrupada do inventário (cards de tipo → marcas/modelos → modal com a lista). | — | — | — |
| 5 | Validar tudo manualmente | Rodar `cd server && npm test` e `cd client && npm test`; **aplicar a migração** `0002_marcas_modelos.sql` (de preferência num banco resetado: `npm run db:reset`); conferir o caminho feliz (cadastrar marca/modelo, criar item/peça por seleção, agrupamento) e as bordas (adicionar inline, item sem marca → "Sem marca"). | — | 2026-06-17 | — |

---

## Resumo

5/5 etapas concluídas (tempo não cronometrado — "Início" não foi registrado).

## Resumo do que foi implementado

**Entregue:** cadastro central de marcas/modelos (com subtipos) por FK, substituindo marca/modelo como texto e removendo `item_nome`/`peca_nome`.

- **Banco** (`server/db/migrations/0002_marcas_modelos.sql`): tabelas `marcas` (escopada por domínio+tipo+subtipo), `modelos` e `subtipos`; FKs `item_marca_id`/`item_modelo_id` e `peca_marca_id`/`peca_modelo_id`; drop de `item_nome`/`peca_nome`.
- **Backend**: models Marca/Modelo/Subtipo + associações; controllers/rotas `/marca`, `/modelo`, `/subtipo` (adm); itemController/pecasController/manutencaoController por FK; seed-dev escopado. Coberto por `server/test/unit/{marca,modelo,subtipo,item,pecas}`.
- **Frontend**: services marca/modelo/subtipo; combobox `SelecaoMarcaModelo` + `SelecaoSubtipo` (cascata Tipo→Subtipo→Marca→Modelo); `CartaoMarcas` em /config; `nome` removido das telas; agrupamento por FK (inventário + peças). Coberto por `client/src/test/*` e `client/src/services/api/*.test.js`.
- **Como**: marca/modelo viram entidades por id (sem heurística); o subtipo (7 tipos de item que têm "tipo") vive na característica `tipo`. Revisão adversarial corrigiu o gating de subtipo por domínio (peça "outros") e a guarda de subtipo obrigatório na edição.

**Validação manual** (rodar `npm test` no server e no client + aplicar `0002`/`db:reset`) fica a cargo do usuário.
