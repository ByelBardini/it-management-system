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
CHANGE COLUMN `item_tipo` `item_tipo` ENUM('desktop', 'notebook', 'movel', 'cadeira', 'monitor', 'ferramenta', 'ap', 'ar-condicionado', 'switch', 'periferico', 'no-break', 'impressora', 'gerador') NOT NULL ;

ALTER TABLE `it_management_system`.`itens` 
DROP FOREIGN KEY `item_setor_id`;
ALTER TABLE `it_management_system`.`itens` 
CHANGE COLUMN `item_setor_id` `item_setor_id` INT NULL ;
ALTER TABLE `it_management_system`.`itens` 
ADD CONSTRAINT `item_setor_id`
  FOREIGN KEY (`item_setor_id`)
  REFERENCES `it_management_system`.`setores` (`setor_id`);
