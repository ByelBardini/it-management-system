-- 0006_papel_coletor.sql — papel 'coletor' + vínculo de empresa na conta + tabela de
-- tokens de coleta revogáveis.
--
-- Motivo: autoatendimento da coleta de desktop nos PCs da empresa, sem distribuir
-- credencial adm. O funcionário loga com uma conta restrita (papel 'coletor', amarrada a
-- UMA empresa), baixa um ZIP com um TOKEN revogável embutido e roda o coletor — que envia
-- o hardware autenticando por esse token (Bearer) para POST /item/coletar-desktop/token.
-- O token é guardado só como HASH (SHA-256) e pode ser revogado sem trocar a senha.
--
-- Forward-only e ADITIVA: acrescenta valor ao ENUM (na MESMA ordem do model
-- server/models/usuarios.js -> ENUM('adm','usuario','cadastrador','coletor')), adiciona uma
-- coluna NULL em usuarios e cria uma tabela nova. Não altera linhas existentes. Convenções
-- idênticas a 0001-0005: identificadores em crase, tabela sem prefixo de schema (o runner
-- conecta com o DB já selecionado) e registro em schema_migrations após aplicar com sucesso.

ALTER TABLE `usuarios`
  MODIFY COLUMN `usuario_tipo` ENUM('adm', 'usuario', 'cadastrador', 'coletor') NOT NULL;

ALTER TABLE `usuarios`
  ADD COLUMN `usuario_empresa_id` INT NULL AFTER `usuario_tipo`,
  ADD CONSTRAINT `fk_usuarios_empresa`
    FOREIGN KEY (`usuario_empresa_id`) REFERENCES `empresas` (`empresa_id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS `coletor_tokens` (
  `token_id` INT NOT NULL AUTO_INCREMENT,
  `token_usuario_id` INT NOT NULL,
  `token_empresa_id` INT NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `token_ativo` TINYINT(1) NOT NULL DEFAULT 1,
  `token_expira_em` DATETIME NULL,
  `token_criado_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `token_ultimo_uso` DATETIME NULL,
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `uq_coletor_token_hash` (`token_hash`),
  KEY `idx_coletor_token_usuario` (`token_usuario_id`),
  CONSTRAINT `fk_coletor_token_usuario`
    FOREIGN KEY (`token_usuario_id`) REFERENCES `usuarios` (`usuario_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_coletor_token_empresa`
    FOREIGN KEY (`token_empresa_id`) REFERENCES `empresas` (`empresa_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);
