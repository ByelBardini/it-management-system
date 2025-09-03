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
