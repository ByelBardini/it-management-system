CREATE SCHEMA `it_management_system` ;

CREATE TABLE `it_management_system`.`empresas` (
  `empresa_id` INT NOT NULL AUTO_INCREMENT,
  `empresa_nome` VARCHAR(200) NOT NULL,
  `empresa_cnpj` VARCHAR(75) NOT NULL,
  PRIMARY KEY (`empresa_id`),
  UNIQUE INDEX `empresa_nome_UNIQUE` (`empresa_nome` ASC) VISIBLE);

CREATE TABLE `it_management_system`.`usuarios` (
  `usuario_id` INT NOT NULL AUTO_INCREMENT,
  `usuario_nome` VARCHAR(255) NOT NULL,
  `usuario_login` VARCHAR(255) NOT NULL,
  `usuario_senha` VARCHAR(255) NOT NULL,
  `usuario_ativo` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`usuario_id`),
  UNIQUE INDEX `usuario_login_UNIQUE` (`usuario_login` ASC) VISIBLE);

CREATE TABLE `it_management_system`.`setores` (
  `setor_id` INT NOT NULL AUTO_INCREMENT,
  `setor_empresa_id` INT NOT NULL,
  `setor_nome` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`setor_id`),
  INDEX `setor_empresa_id_idx` (`setor_empresa_id` ASC) VISIBLE,
  CONSTRAINT `setor_empresa_id`
    FOREIGN KEY (`setor_empresa_id`)
    REFERENCES `it_management_system`.`empresas` (`empresa_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `it_management_system`.`itens` (
  `item_id` INT NOT NULL AUTO_INCREMENT,
  `item_empresa_id` INT NOT NULL,
  `item_setor_id` INT NOT NULL,
  `item_tipo` ENUM('desktop', 'notebook', 'movel', 'cadeira', 'monitor', 'ferramenta', 'ap', 'ar-condicionado', 'switch', 'periferico', 'no-break') NOT NULL,
  `item_etiqueta` INT NOT NULL,
  `item_num_serie` VARCHAR(255) NOT NULL,
  `item_nome` VARCHAR(255) NOT NULL,
  `item_em_uso` TINYINT NOT NULL DEFAULT 1,
  `item_ultima_manutencao` DATE NOT NULL,
  `item_intervalo_manutencao` INT NOT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE INDEX `item_etiqueta_UNIQUE` (`item_etiqueta` ASC) VISIBLE,
  INDEX `item_empresa_id_idx` (`item_empresa_id` ASC) VISIBLE,
  INDEX `item_setor_id_idx` (`item_setor_id` ASC) VISIBLE,
  UNIQUE INDEX `item_num_serie_UNIQUE` (`item_num_serie` ASC) VISIBLE,
  CONSTRAINT `item_empresa_id`
    FOREIGN KEY (`item_empresa_id`)
    REFERENCES `it_management_system`.`empresas` (`empresa_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `item_setor_id`
    FOREIGN KEY (`item_setor_id`)
    REFERENCES `it_management_system`.`setores` (`setor_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `it_management_system`.`caracteristicas` (
  `caracteristica_id` INT NOT NULL AUTO_INCREMENT,
  `caracteristica_item_id` INT NOT NULL,
  `caracteristica_nome` VARCHAR(255) NOT NULL,
  `caracteristica_valor` VARCHAR(25) NOT NULL,
  PRIMARY KEY (`caracteristica_id`),
  INDEX `caracteristica_item_id_idx` (`caracteristica_item_id` ASC) VISIBLE,
  CONSTRAINT `caracteristica_item_id`
    FOREIGN KEY (`caracteristica_item_id`)
    REFERENCES `it_management_system`.`itens` (`item_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `it_management_system`.`anexos` (
  `anexo_id` INT NOT NULL AUTO_INCREMENT,
  `anexo_item_id` INT NOT NULL,
  `anexo_caminho_id` VARCHAR(255) NOT NULL,
  `anexo_tipo` ENUM('garantia', 'manual', 'anexo') NOT NULL,
  PRIMARY KEY (`anexo_id`),
  INDEX `anexo_item_id_idx` (`anexo_item_id` ASC) VISIBLE,
  CONSTRAINT `anexo_item_id`
    FOREIGN KEY (`anexo_item_id`)
    REFERENCES `it_management_system`.`itens` (`item_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `it_management_system`.`senhas` (
  `senha_id` INT NOT NULL AUTO_INCREMENT,
  `senha_usuario_id` INT NOT NULL,
  `senha_usuario` VARCHAR(255) NOT NULL,
  `senha_plataforma` VARCHAR(255) NOT NULL,
  `senha_criptografada` VARCHAR(255) NOT NULL,
  `senha_iv` VARCHAR(255) NOT NULL,
  `senha_ultima_troca` DATE NOT NULL,
  `senha_tempo_troca` INT NULL,
  PRIMARY KEY (`senha_id`),
  INDEX `senha_usuario_id_idx` (`senha_usuario_id` ASC) VISIBLE,
  CONSTRAINT `senha_usuario_id`
    FOREIGN KEY (`senha_usuario_id`)
    REFERENCES `it_management_system`.`usuarios` (`usuario_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE `it_management_system`.`usuarios` 
ADD COLUMN `usuario_tipo` ENUM('adm', 'usuario') NOT NULL AFTER `usuario_senha`;
