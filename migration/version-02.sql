CREATE TABLE `it_management_system`.`pecas` (
  `peca_id` INT NOT NULL AUTO_INCREMENT,
  `peca_empresa_id` INT NOT NULL,
  `peca_item_id` INT NULL,
  `peca_ativa` TINYINT NOT NULL DEFAULT 1,
  `peca_data_inativacao` DATE NULL,
  `peca_tipo` ENUM("processador", "placa-video", "placa-mae", "ram", "armazenamento", "fonte", "placa-rede", "gabinete", "outros") NOT NULL,
  `peca_nome` VARCHAR(255) NOT NULL,
  `item_preco` DOUBLE NOT NULL,
  `item_em_uso` TINYINT NOT NULL DEFAULT 0,
  `item_data_aquisicao` DATE NULL,
  PRIMARY KEY (`peca_id`));

ALTER TABLE `it_management_system`.`pecas` 
ADD INDEX `peca_empresa_id_idx` (`peca_empresa_id` ASC) VISIBLE,
ADD INDEX `peca_item_id_idx` (`peca_item_id` ASC) VISIBLE;
;
ALTER TABLE `it_management_system`.`pecas` 
ADD CONSTRAINT `peca_empresa_id`
  FOREIGN KEY (`peca_empresa_id`)
  REFERENCES `it_management_system`.`empresas` (`empresa_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `peca_item_id`
  FOREIGN KEY (`peca_item_id`)
  REFERENCES `it_management_system`.`itens` (`item_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `it_management_system`.`workstations` 
ADD COLUMN `workstation_anydesk` VARCHAR(50) NULL AFTER `workstation_nome`,
ADD COLUMN `workstation_senha_anydesk` VARCHAR(45) NULL AFTER `workstation_anydesk`;

ALTER TABLE `it_management_system`.`pecas` 
CHANGE COLUMN `item_preco` `peca_preco` DOUBLE NOT NULL ,
CHANGE COLUMN `item_em_uso` `peca_em_uso` TINYINT NOT NULL DEFAULT '0' ,
CHANGE COLUMN `item_data_aquisicao` `peca_data_aquisicao` DATE NULL DEFAULT NULL ;

ALTER TABLE `it_management_system`.`caracteristicas` 
CHANGE COLUMN `caracteristica_valor` `caracteristica_valor` TEXT NOT NULL ;
