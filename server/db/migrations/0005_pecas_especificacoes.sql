-- 0005_pecas_especificacoes.sql — adiciona a coluna peca_especificacoes em pecas.
--
-- Motivo: a coleta automatizada de desktop (POST /item/coletar-desktop, alimentada por
-- ferramentas/coletor-desktop/coletar-desktop.ps1) passou a capturar especificações
-- técnicas por tipo de peça — capacidade/velocidade/DDR da RAM, capacidade/mídia/conexão
-- do armazenamento, núcleos/threads/clock da CPU, memória da placa de vídeo, velocidade
-- da placa de rede. Como pecas não tem tabela de características (diferente de itens) e as
-- specs variam por tipo, guardamos um objeto JSON de rótulo->valor numa única coluna, em
-- vez de dezenas de colunas tipadas.
--
-- Forward-only e ADITIVA: apenas acrescenta uma coluna NULL (peças antigas ficam NULL e o
-- frontend trata null como "sem especificações"). Sem backfill. Espelha o model
-- (server/models/pecas.js -> peca_especificacoes: DataTypes.JSON, allowNull: true).
-- Convenções idênticas a 0001-0004: identificadores em crase, tabela sem prefixo de
-- schema (o runner conecta com o DB já selecionado) e registro em schema_migrations após
-- aplicar com sucesso.

ALTER TABLE `pecas`
  ADD COLUMN `peca_especificacoes` JSON NULL AFTER `peca_data_aquisicao`;
