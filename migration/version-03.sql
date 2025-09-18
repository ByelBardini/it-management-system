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
