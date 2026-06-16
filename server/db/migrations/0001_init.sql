-- 0001_init.sql — baseline consolidado do schema do InfraHub (11 tabelas).
--
-- Gerado a partir dos models Sequelize (server/models/*.js) como fonte da
-- verdade, já corrigindo as divergências do SQL antigo:
--   * pecas.peca_empresa_id agora é ON DELETE CASCADE (era NO ACTION);
--   * caracteristica_valor agora é TEXT (alinhado ao model).
--
-- Convenções:
--   * Nomes de tabela SEM prefixo de schema: o runner (db/migrate.js) conecta
--     com DB_DATABASE já selecionado, então identificadores não-qualificados
--     resolvem para o banco correto em qualquer ambiente (dev e Coolify).
--   * CREATE TABLE IF NOT EXISTS: re-executável com segurança (DDL no MySQL faz
--     auto-commit; sem rollback no meio de uma migration).
--   * Ordem parent-first para satisfazer as foreign keys na criação.

-- 1. empresas (raiz da hierarquia)
CREATE TABLE IF NOT EXISTS `empresas` (
  `empresa_id` INT NOT NULL AUTO_INCREMENT,
  `empresa_nome` VARCHAR(200) NOT NULL,
  `empresa_cnpj` VARCHAR(75) NOT NULL,
  PRIMARY KEY (`empresa_id`),
  UNIQUE INDEX `empresa_nome_UNIQUE` (`empresa_nome` ASC)
);

-- 2. usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `usuario_id` INT NOT NULL AUTO_INCREMENT,
  `usuario_nome` VARCHAR(255) NOT NULL,
  `usuario_login` VARCHAR(255) NOT NULL,
  `usuario_senha` VARCHAR(255) NOT NULL,
  `usuario_tipo` ENUM('adm', 'usuario') NOT NULL,
  `usuario_caminho_foto` VARCHAR(255) NULL,
  `usuario_ativo` TINYINT NOT NULL DEFAULT 1,
  `usuario_troca_senha` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`usuario_id`),
  UNIQUE INDEX `usuario_login_UNIQUE` (`usuario_login` ASC)
);

-- 3. plataformas
CREATE TABLE IF NOT EXISTS `plataformas` (
  `plataforma_id` INT NOT NULL AUTO_INCREMENT,
  `plataforma_nome` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`plataforma_id`)
);

-- 4. logs_sistema (auditoria via hooks; sem FK, fiel ao estado atual)
CREATE TABLE IF NOT EXISTS `logs_sistema` (
  `log_id` INT NOT NULL AUTO_INCREMENT,
  `log_item_pai_id` INT NULL,
  `log_usuario_id` INT NOT NULL,
  `log_operacao` VARCHAR(255) NOT NULL,
  `log_valor_anterior` TEXT NOT NULL,
  `log_novo_valor` TEXT NOT NULL,
  PRIMARY KEY (`log_id`)
);

-- 5. setores
CREATE TABLE IF NOT EXISTS `setores` (
  `setor_id` INT NOT NULL AUTO_INCREMENT,
  `setor_empresa_id` INT NOT NULL,
  `setor_nome` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`setor_id`),
  INDEX `setor_empresa_id_idx` (`setor_empresa_id` ASC),
  CONSTRAINT `setor_empresa_id`
    FOREIGN KEY (`setor_empresa_id`)
    REFERENCES `empresas` (`empresa_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

-- 6. workstations
CREATE TABLE IF NOT EXISTS `workstations` (
  `workstation_id` INT NOT NULL AUTO_INCREMENT,
  `workstation_empresa_id` INT NOT NULL,
  `workstation_setor_id` INT NOT NULL,
  `workstation_nome` VARCHAR(255) NOT NULL,
  `workstation_anydesk` VARCHAR(50) NULL,
  `workstation_senha_anydesk` VARCHAR(45) NULL,
  PRIMARY KEY (`workstation_id`),
  INDEX `workstation_empresa_id_idx` (`workstation_empresa_id` ASC),
  INDEX `workstation_setor_id_idx` (`workstation_setor_id` ASC),
  CONSTRAINT `workstation_empresa_id`
    FOREIGN KEY (`workstation_empresa_id`)
    REFERENCES `empresas` (`empresa_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `workstation_setor_id`
    FOREIGN KEY (`workstation_setor_id`)
    REFERENCES `setores` (`setor_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

-- 7. itens
CREATE TABLE IF NOT EXISTS `itens` (
  `item_id` INT NOT NULL AUTO_INCREMENT,
  `item_empresa_id` INT NOT NULL,
  `item_setor_id` INT NULL,
  `item_workstation_id` INT NULL,
  `item_ativo` TINYINT NOT NULL DEFAULT 1,
  `item_data_inativacao` DATE NULL,
  `item_tipo` ENUM('desktop', 'notebook', 'movel', 'cadeira', 'monitor', 'ferramenta', 'ap', 'ar-condicionado', 'switch', 'periferico', 'no-break', 'impressora', 'gerador', 'celular', 'cabo', 'outros') NOT NULL,
  `item_etiqueta` VARCHAR(10) NOT NULL,
  `item_num_serie` VARCHAR(255) NOT NULL,
  `item_nome` VARCHAR(255) NOT NULL,
  `item_preco` DOUBLE NOT NULL,
  `item_em_uso` TINYINT NOT NULL DEFAULT 1,
  `item_data_aquisicao` DATE NULL,
  `item_ultima_manutencao` DATE NOT NULL,
  `item_intervalo_manutencao` INT NOT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE INDEX `item_num_serie_UNIQUE` (`item_num_serie` ASC),
  INDEX `item_empresa_id_idx` (`item_empresa_id` ASC),
  INDEX `item_setor_id_idx` (`item_setor_id` ASC),
  INDEX `item_workstation_id_idx` (`item_workstation_id` ASC),
  CONSTRAINT `item_empresa_id`
    FOREIGN KEY (`item_empresa_id`)
    REFERENCES `empresas` (`empresa_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `item_setor_id`
    FOREIGN KEY (`item_setor_id`)
    REFERENCES `setores` (`setor_id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
  CONSTRAINT `item_workstation_id`
    FOREIGN KEY (`item_workstation_id`)
    REFERENCES `workstations` (`workstation_id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION
);

-- 8. caracteristicas
CREATE TABLE IF NOT EXISTS `caracteristicas` (
  `caracteristica_id` INT NOT NULL AUTO_INCREMENT,
  `caracteristica_item_id` INT NOT NULL,
  `caracteristica_nome` VARCHAR(255) NOT NULL,
  `caracteristica_valor` TEXT NOT NULL,
  PRIMARY KEY (`caracteristica_id`),
  INDEX `caracteristica_item_id_idx` (`caracteristica_item_id` ASC),
  CONSTRAINT `caracteristica_item_id`
    FOREIGN KEY (`caracteristica_item_id`)
    REFERENCES `itens` (`item_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

-- 9. anexos
CREATE TABLE IF NOT EXISTS `anexos` (
  `anexo_id` INT NOT NULL AUTO_INCREMENT,
  `anexo_item_id` INT NOT NULL,
  `anexo_caminho` VARCHAR(255) NOT NULL,
  `anexo_nome` VARCHAR(255) NOT NULL,
  `anexo_tipo` ENUM('garantia', 'manual', 'anexo') NOT NULL,
  PRIMARY KEY (`anexo_id`),
  INDEX `anexo_item_id_idx` (`anexo_item_id` ASC),
  CONSTRAINT `anexo_item_id`
    FOREIGN KEY (`anexo_item_id`)
    REFERENCES `itens` (`item_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

-- 10. pecas
CREATE TABLE IF NOT EXISTS `pecas` (
  `peca_id` INT NOT NULL AUTO_INCREMENT,
  `peca_empresa_id` INT NOT NULL,
  `peca_item_id` INT NULL,
  `peca_ativa` TINYINT NOT NULL DEFAULT 1,
  `peca_data_inativacao` DATE NULL,
  `peca_tipo` ENUM('processador', 'placa-video', 'placa-mae', 'ram', 'armazenamento', 'fonte', 'placa-rede', 'gabinete', 'outros') NOT NULL,
  `peca_nome` VARCHAR(255) NOT NULL,
  `peca_num_serie` VARCHAR(150) NOT NULL,
  `peca_preco` DOUBLE NOT NULL,
  `peca_em_uso` TINYINT NOT NULL DEFAULT 0,
  `peca_data_aquisicao` DATE NULL,
  PRIMARY KEY (`peca_id`),
  INDEX `peca_empresa_id_idx` (`peca_empresa_id` ASC),
  INDEX `peca_item_id_idx` (`peca_item_id` ASC),
  CONSTRAINT `peca_empresa_id`
    FOREIGN KEY (`peca_empresa_id`)
    REFERENCES `empresas` (`empresa_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `peca_item_id`
    FOREIGN KEY (`peca_item_id`)
    REFERENCES `itens` (`item_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- 11. senhas
CREATE TABLE IF NOT EXISTS `senhas` (
  `senha_id` INT NOT NULL AUTO_INCREMENT,
  `senha_empresa_id` INT NOT NULL,
  `senha_usuario_id` INT NOT NULL,
  `senha_plataforma_id` INT NOT NULL,
  `senha_nome` VARCHAR(255) NOT NULL,
  `senha_usuario` VARCHAR(255) NOT NULL,
  `senha_criptografada` VARCHAR(255) NOT NULL,
  `senha_iv` VARCHAR(255) NOT NULL,
  `senha_ultima_troca` DATE NOT NULL,
  `senha_tempo_troca` INT NULL,
  PRIMARY KEY (`senha_id`),
  INDEX `senha_empresa_id_idx` (`senha_empresa_id` ASC),
  INDEX `senha_usuario_id_idx` (`senha_usuario_id` ASC),
  INDEX `senha_plataforma_id_idx` (`senha_plataforma_id` ASC),
  CONSTRAINT `senha_empresa_id`
    FOREIGN KEY (`senha_empresa_id`)
    REFERENCES `empresas` (`empresa_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `senha_usuario_id`
    FOREIGN KEY (`senha_usuario_id`)
    REFERENCES `usuarios` (`usuario_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `senha_plataforma_id`
    FOREIGN KEY (`senha_plataforma_id`)
    REFERENCES `plataformas` (`plataforma_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);
