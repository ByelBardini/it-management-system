-- 0003_serie_unica_ignora_desktop.sql — desarma a colisão de número de série dos
-- desktops sob o índice UNIQUE GLOBAL de itens.item_num_serie.
--
-- Problema: o baseline (0001) tem `UNIQUE INDEX item_num_serie_UNIQUE
-- (item_num_serie ASC)` — unicidade GLOBAL. Desktop é item composto por peças, sem
-- número de série próprio, então tanto `postItem` quanto o novo
-- `POST /item/coletar-desktop` gravam item_num_serie = "N/A". Como "N/A" é um
-- literal NÃO-NULO, o índice aceita apenas UM desktop: o segundo (de qualquer
-- empresa) estoura UniqueConstraintError dentro da transação (o MySQL admite vários
-- NULL num índice único, mas não vários "N/A"). O coletor roda em frota, então a 2ª
-- coleta falharia.
--
-- Correção (não-destrutiva): troca o índice por uma UNIQUE sobre uma coluna GERADA
-- que vale NULL para desktops e item_num_serie para os demais tipos. Resultado:
--   * desktop       -> item_serie_uniq = NULL  -> vários permitidos (vários "N/A" ok);
--   * não-desktop   -> item_serie_uniq = serie -> unicidade GLOBAL preservada.
-- A coluna é STORED (gerenciada pelo banco). A aplicação continua lendo/gravando só
-- item_num_serie e NÃO declara item_serie_uniq nos models — o Sequelize só insere
-- as colunas declaradas, então o INSERT nunca tenta atribuir a coluna gerada.
--
-- Convenções idênticas a 0001/0002: identificadores em crase, tabela sem prefixo de
-- schema, forward-only (o runner aplica uma vez e registra em schema_migrations).
-- Requer MySQL 5.7.6+/8.x (colunas geradas) — o projeto roda em MySQL 8.x.

ALTER TABLE `itens`
  DROP INDEX `item_num_serie_UNIQUE`,
  ADD COLUMN `item_serie_uniq` VARCHAR(255)
    GENERATED ALWAYS AS (
      IF(`item_tipo` = 'desktop', NULL, `item_num_serie`)
    ) STORED,
  ADD UNIQUE INDEX `item_serie_uniq_UNIQUE` (`item_serie_uniq` ASC);
