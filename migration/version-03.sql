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
