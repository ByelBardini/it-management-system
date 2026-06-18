-- 0004_role_cadastrador.sql — adiciona o papel 'cadastrador' ao ENUM usuario_tipo.
--
-- Motivo: o app de cadastro mobile (PWA empacotado como APK/TWA) precisa de um papel
-- restrito que CRIE itens/marcas/modelos/subtipos e LEIA a cascata, sem os poderes de
-- adm (editar, excluir, importar, coletar desktop). Assim não embarcamos credencial
-- adm num APK distribuído fora de loja. A autorização nas rotas passou a ser por verbo
-- (POST /item|/marca|/modelo|/subtipo e os GETs da cascata liberados ao cadastrador);
-- este valor de ENUM é o alvo dessa liberação.
--
-- Forward-only e ADITIVA: apenas acrescenta um valor ao ENUM, na MESMA ordem do model
-- (server/models/usuarios.js -> ENUM('adm','usuario','cadastrador')). Não altera linhas
-- existentes. Convenções idênticas a 0001/0002/0003: identificadores em crase, tabela
-- sem prefixo de schema (o runner conecta com o DB já selecionado) e registro em
-- schema_migrations após aplicar com sucesso.

ALTER TABLE `usuarios`
  MODIFY COLUMN `usuario_tipo` ENUM('adm', 'usuario', 'cadastrador') NOT NULL;
