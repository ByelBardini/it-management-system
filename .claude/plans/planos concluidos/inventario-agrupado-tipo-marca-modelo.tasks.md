# Tracking de execução — inventario-agrupado-tipo-marca-modelo

Tempo gasto em cada etapa. Linguagem meio termo.

**Início:** —

| # | Etapa | O que está sendo feito | Início | Fim | Duração |
|---|-------|------------------------|--------|-----|---------|
| 1 | Backend: a listagem de itens ativos passa a entregar marca/modelo e número de série (coberta por testes) | Levanta-se o que o endpoint de itens ativos retorna hoje (sem modelo nem série); escrevem-se primeiro os testes do controller (caso feliz com o novo payload, empresa sem itens, e id ausente); então a consulta passa a incluir o número de série e a característica de modelo, sem derrubar os tipos que não têm essa característica (cadeira, móvel, desktop). | — | — | — |
| 2 | Frontend (lógica): regras de agrupamento Tipo → Marca → Modelo → série, testadas antes do código | Escrevem-se primeiro os testes das funções puras: separar marca e modelo do campo único "Marca/Modelo" (primeira palavra é a marca; vazio vira "Sem marca/Sem modelo"), e montar a árvore com os contadores por nível, juntando variações escritas em caixa diferente. Depois implementam-se as funções até a cobertura passar. | — | — | — |
| 3 | Frontend (interface): visão agrupada colapsável com contadores e a série na folha | Cria-se a árvore colapsável (recolhida por padrão, contador em cada nível, expandir/recolher tudo) no tema escuro; adiciona-se a alternância Lista/Agrupar na tela de Inventário; a folha mostra cada item com seu número de série, sem nunca esconder itens sem marca/modelo. | — | — | — |
| 4 | Validar tudo manualmente | Rodar `cd server && npm test` e `cd client && npm test`, conferir o caminho feliz (teclados unidos por marca e modelo, série na folha) e as bordas que importam (item sem modelo cai em "Sem marca/Sem modelo"; alternar Lista/Agrupar; filtros antes do agrupamento; listagem de inativos intacta). Não há migração de banco. | — | 2026-06-17 | — |

---

## Resumo

4/4 etapas concluídas (tempo não cronometrado).

## Resumo do que foi implementado

**Entregue e depois supersedido pelo plano `cadastro-marcas-modelos`.** A visão agrupada do inventário (Tipo → Marca → Modelo → série, com toggle Lista/Agrupar e backend `getItens` enriquecido) foi implementada primeiro lendo marca/modelo de característica de texto. Em seguida, o plano de cadastro central trocou a fonte para FK (sem heurística) e removeu `item_nome`. O resultado final (agrupamento por FK, componentes `InventarioAgrupado`/`TipoDetalhe`/`ModalModelo`) está commitado junto com o cadastro central. Plano sem migração própria.
