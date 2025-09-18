CREATE TABLE `it_management_system`.`logs_sistema` (
  `log_id` INT NOT NULL AUTO_INCREMENT,
  `log_usuario_id` INT NOT NULL,
  `log_operacao` VARCHAR(255) NOT NULL,
  `log_valor_anterior` TEXT NOT NULL,
  `log_novo_valor` TEXT NOT NULL,
  PRIMARY KEY (`log_id`));

ALTER TABLE `it_management_system`.`logs_sistema` 
ADD COLUMN `log_item_pai_id` INT NULL AFTER `log_id`;
