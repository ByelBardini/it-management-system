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

ALTER TABLE `it_management_system`.`usuarios` 
ADD COLUMN `usuario_troca_senha` TINYINT NOT NULL DEFAULT 1 AFTER `usuario_ativo`;

ALTER TABLE `it_management_system`.`itens` 
ADD COLUMN `item_preco` DOUBLE NOT NULL AFTER `item_nome`,
ADD COLUMN `item_data_aquisicao` DATE NULL AFTER `item_em_uso`,
DROP INDEX `item_etiqueta_UNIQUE` ;
;

CREATE TABLE `it_management_system`.`workstations` (
  `workstation_id` INT NOT NULL,
  `workstation_setor_id` INT NOT NULL,
  `workstation_nome` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`workstation_id`),
  INDEX `workstation_setor_id_idx` (`workstation_setor_id` ASC) VISIBLE,
  CONSTRAINT `workstation_setor_id`
    FOREIGN KEY (`workstation_setor_id`)
    REFERENCES `it_management_system`.`setores` (`setor_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE `it_management_system`.`itens` 
ADD COLUMN `item_workstation_id` INT NULL AFTER `item_setor_id`,
ADD INDEX `item_workstation_id_idx` (`item_workstation_id` ASC) VISIBLE;
;
ALTER TABLE `it_management_system`.`itens` 
ADD CONSTRAINT `item_workstation_id`
  FOREIGN KEY (`item_workstation_id`)
  REFERENCES `it_management_system`.`workstations` (`workstation_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `it_management_system`.`workstations` 
ADD COLUMN `workstation_empresa_id` INT NOT NULL AFTER `workstation_setor_id`,
ADD INDEX `workstation_empresa_id_idx` (`workstation_empresa_id` ASC) VISIBLE;
;
ALTER TABLE `it_management_system`.`workstations` 
ADD CONSTRAINT `workstation_empresa_id`
  FOREIGN KEY (`workstation_empresa_id`)
  REFERENCES `it_management_system`.`empresas` (`empresa_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `it_management_system`.`workstations` 
CHANGE COLUMN `workstation_id` `workstation_id` INT NOT NULL AUTO_INCREMENT ;

ALTER TABLE `it_management_system`.`itens` 
CHANGE COLUMN `item_tipo` `item_tipo` ENUM('desktop', 'notebook', 'movel', 'cadeira', 'monitor', 'ferramenta', 'ap', 'ar-condicionado', 'switch', 'periferico', 'no-break', 'impressora', 'gerador', 'celular') NOT NULL ;

ALTER TABLE `it_management_system`.`itens` 
DROP FOREIGN KEY `item_setor_id`;
ALTER TABLE `it_management_system`.`itens` 
CHANGE COLUMN `item_setor_id` `item_setor_id` INT NULL ;
ALTER TABLE `it_management_system`.`itens` 
ADD CONSTRAINT `item_setor_id`
  FOREIGN KEY (`item_setor_id`)
  REFERENCES `it_management_system`.`setores` (`setor_id`);

ALTER TABLE `it_management_system`.`anexos` 
ADD COLUMN `anexo_nome` VARCHAR(255) NOT NULL AFTER `anexo_caminho_id`;

ALTER TABLE `it_management_system`.`anexos` 
CHANGE COLUMN `anexo_caminho_id` `anexo_caminho` VARCHAR(255) NOT NULL ;

ALTER TABLE `it_management_system`.`itens` 
CHANGE COLUMN `item_etiqueta` `item_etiqueta` VARCHAR(10) NOT NULL ;

ALTER TABLE `it_management_system`.`caracteristicas` 
CHANGE COLUMN `caracteristica_valor` `caracteristica_valor` VARCHAR(255) NOT NULL ;

ALTER TABLE `it_management_system`.`itens` 
ADD COLUMN `item_ativo` TINYINT NOT NULL DEFAULT 1 AFTER `item_workstation_id`;

ALTER TABLE `it_management_system`.`itens` 
ADD COLUMN `item_data_inativacao` DATE NULL AFTER `item_ativo`;

CREATE TABLE `it_management_system`.`plataformas` (
  `plataforma_id` INT NOT NULL AUTO_INCREMENT,
  `plataforma_nome` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`plataforma_id`));

ALTER TABLE `it_management_system`.`senhas` 
CHANGE COLUMN `senha_plataforma` `senha_plataforma_id` INT NOT NULL AFTER `senha_usuario_id`,
ADD INDEX `senha_plataforma_id_idx` (`senha_plataforma_id` ASC) VISIBLE;
;
ALTER TABLE `it_management_system`.`senhas` 
ADD CONSTRAINT `senha_plataforma_id`
  FOREIGN KEY (`senha_plataforma_id`)
  REFERENCES `it_management_system`.`plataformas` (`plataforma_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `it_management_system`.`senhas` 
ADD COLUMN `senha_nome` VARCHAR(255) NOT NULL AFTER `senha_plataforma_id`;

ALTER TABLE `it_management_system`.`senhas` 
ADD COLUMN `senha_empresa_id` INT NOT NULL AFTER `senha_id`,
ADD INDEX `senha_empresa_id_idx` (`senha_empresa_id` ASC) VISIBLE;
;
ALTER TABLE `it_management_system`.`senhas` 
ADD CONSTRAINT `senha_empresa_id`
  FOREIGN KEY (`senha_empresa_id`)
  REFERENCES `it_management_system`.`empresas` (`empresa_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `it_management_system`.`itens` 
CHANGE COLUMN `item_tipo` `item_tipo` ENUM('desktop', 'notebook', 'movel', 'cadeira', 'monitor', 'ferramenta', 'ap', 'ar-condicionado', 'switch', 'periferico', 'no-break', 'impressora', 'gerador', 'celular', 'outros') NOT NULL ;

ALTER TABLE `it_management_system`.`usuarios` 
ADD COLUMN `usuario_caminho_foto` VARCHAR(255) NULL AFTER `usuario_tipo`;

ALTER TABLE `it_management_system`.`itens` 
DROP FOREIGN KEY `item_workstation_id`;
ALTER TABLE `it_management_system`.`itens` 
ADD CONSTRAINT `item_workstation_id`
  FOREIGN KEY (`item_workstation_id`)
  REFERENCES `it_management_system`.`workstations` (`workstation_id`)
  ON DELETE SET NULL;

ALTER TABLE `it_management_system`.`itens` 
DROP FOREIGN KEY `item_setor_id`;
ALTER TABLE `it_management_system`.`itens` 
ADD CONSTRAINT `item_setor_id`
  FOREIGN KEY (`item_setor_id`)
  REFERENCES `it_management_system`.`setores` (`setor_id`)
  ON DELETE SET NULL;

ALTER TABLE `it_management_system`.`caracteristicas` 
DROP FOREIGN KEY `caracteristica_item_id`;
ALTER TABLE `it_management_system`.`caracteristicas` 
ADD CONSTRAINT `caracteristica_item_id`
  FOREIGN KEY (`caracteristica_item_id`)
  REFERENCES `it_management_system`.`itens` (`item_id`)
  ON DELETE CASCADE;

ALTER TABLE `it_management_system`.`anexos` 
DROP FOREIGN KEY `anexo_item_id`;
ALTER TABLE `it_management_system`.`anexos` 
ADD CONSTRAINT `anexo_item_id`
  FOREIGN KEY (`anexo_item_id`)
  REFERENCES `it_management_system`.`itens` (`item_id`)
  ON DELETE CASCADE;

ALTER TABLE `it_management_system`.`workstations` 
DROP FOREIGN KEY `workstation_setor_id`;
ALTER TABLE `it_management_system`.`workstations` 
ADD CONSTRAINT `workstation_setor_id`
  FOREIGN KEY (`workstation_setor_id`)
  REFERENCES `it_management_system`.`setores` (`setor_id`)
  ON DELETE CASCADE;

ALTER TABLE `it_management_system`.`itens` 
DROP FOREIGN KEY `item_empresa_id`;
ALTER TABLE `it_management_system`.`itens` 
ADD CONSTRAINT `item_empresa_id`
  FOREIGN KEY (`item_empresa_id`)
  REFERENCES `it_management_system`.`empresas` (`empresa_id`)
  ON DELETE CASCADE;

ALTER TABLE `it_management_system`.`senhas` 
DROP FOREIGN KEY `senha_empresa_id`;
ALTER TABLE `it_management_system`.`senhas` 
ADD CONSTRAINT `senha_empresa_id`
  FOREIGN KEY (`senha_empresa_id`)
  REFERENCES `it_management_system`.`empresas` (`empresa_id`)
  ON DELETE CASCADE;

ALTER TABLE `it_management_system`.`setores` 
DROP FOREIGN KEY `setor_empresa_id`;
ALTER TABLE `it_management_system`.`setores` 
ADD CONSTRAINT `setor_empresa_id`
  FOREIGN KEY (`setor_empresa_id`)
  REFERENCES `it_management_system`.`empresas` (`empresa_id`)
  ON DELETE CASCADE;

ALTER TABLE `it_management_system`.`workstations` 
DROP FOREIGN KEY `workstation_empresa_id`;
ALTER TABLE `it_management_system`.`workstations` 
ADD CONSTRAINT `workstation_empresa_id`
  FOREIGN KEY (`workstation_empresa_id`)
  REFERENCES `it_management_system`.`empresas` (`empresa_id`)
  ON DELETE CASCADE;

CREATE TABLE `it_management_system`.`logs_sistema` (
  `log_id` INT NOT NULL AUTO_INCREMENT,
  `log_usuario_id` INT NOT NULL,
  `log_operacao` VARCHAR(255) NOT NULL,
  `log_valor_anterior` TEXT NOT NULL,
  `log_novo_valor` TEXT NOT NULL,
  PRIMARY KEY (`log_id`));

ALTER TABLE `it_management_system`.`logs_sistema` 
ADD COLUMN `log_item_pai_id` INT NULL AFTER `log_id`;

ALTER TABLE `it_management_system`.`itens` 
CHANGE COLUMN `item_tipo` `item_tipo` ENUM('desktop', 'notebook', 'movel', 'cadeira', 'monitor', 'ferramenta', 'ap', 'ar-condicionado', 'switch', 'periferico', 'no-break', 'impressora', 'gerador', 'celular', 'cabo', 'outros') NOT NULL ;
