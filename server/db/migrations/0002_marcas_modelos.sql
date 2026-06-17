-- 0002_marcas_modelos.sql — cadastro central de marcas/modelos + FKs em itens/pecas.
--
-- Forward-only e DESTRUTIVO: remove `item_nome` e `peca_nome`. A identidade de
-- item/peça passa a ser marca + modelo (cadastro por id), com o número de série
-- diferenciando unidades iguais. Rode num banco resetado em dev (`npm run db:reset`).
--
-- Convenções idênticas ao 0001: identificadores em crase, nomes de tabela sem
-- prefixo de schema (o runner conecta com o banco já selecionado) e
-- ON UPDATE NO ACTION nas foreign keys.

-- 1. marcas (cadastro global, escopado por domínio + tipo + subtipo)
CREATE TABLE IF NOT EXISTS `marcas` (
  `marca_id` INT NOT NULL AUTO_INCREMENT,
  `marca_nome` VARCHAR(100) NOT NULL,
  `marca_dominio` ENUM('item', 'peca') NOT NULL,
  `marca_tipo` VARCHAR(40) NOT NULL,
  `marca_subtipo` VARCHAR(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`marca_id`),
  UNIQUE INDEX `marca_escopo_UNIQUE` (`marca_nome` ASC, `marca_dominio` ASC, `marca_tipo` ASC, `marca_subtipo` ASC)
);

-- 1b. subtipos (lista gerenciável por tipo; ex.: periferico -> Teclado, Mouse)
CREATE TABLE IF NOT EXISTS `subtipos` (
  `subtipo_id` INT NOT NULL AUTO_INCREMENT,
  `subtipo_tipo` VARCHAR(40) NOT NULL,
  `subtipo_nome` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`subtipo_id`),
  UNIQUE INDEX `subtipo_tipo_nome_UNIQUE` (`subtipo_tipo` ASC, `subtipo_nome` ASC)
);

-- 2. modelos (pendurados numa marca)
CREATE TABLE IF NOT EXISTS `modelos` (
  `modelo_id` INT NOT NULL AUTO_INCREMENT,
  `modelo_marca_id` INT NOT NULL,
  `modelo_nome` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`modelo_id`),
  UNIQUE INDEX `modelo_marca_nome_UNIQUE` (`modelo_marca_id` ASC, `modelo_nome` ASC),
  INDEX `modelo_marca_id_idx` (`modelo_marca_id` ASC),
  CONSTRAINT `modelo_marca_id`
    FOREIGN KEY (`modelo_marca_id`)
    REFERENCES `marcas` (`marca_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

-- 3. itens: passam a apontar para marca/modelo por id; o "nome" deixa de existir
ALTER TABLE `itens`
  ADD COLUMN `item_marca_id` INT NULL AFTER `item_num_serie`,
  ADD COLUMN `item_modelo_id` INT NULL AFTER `item_marca_id`,
  ADD INDEX `item_marca_id_idx` (`item_marca_id` ASC),
  ADD INDEX `item_modelo_id_idx` (`item_modelo_id` ASC),
  ADD CONSTRAINT `item_marca_id`
    FOREIGN KEY (`item_marca_id`)
    REFERENCES `marcas` (`marca_id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
  ADD CONSTRAINT `item_modelo_id`
    FOREIGN KEY (`item_modelo_id`)
    REFERENCES `modelos` (`modelo_id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
  DROP COLUMN `item_nome`;

-- 4. pecas: idem itens
ALTER TABLE `pecas`
  ADD COLUMN `peca_marca_id` INT NULL AFTER `peca_tipo`,
  ADD COLUMN `peca_modelo_id` INT NULL AFTER `peca_marca_id`,
  ADD INDEX `peca_marca_id_idx` (`peca_marca_id` ASC),
  ADD INDEX `peca_modelo_id_idx` (`peca_modelo_id` ASC),
  ADD CONSTRAINT `peca_marca_id`
    FOREIGN KEY (`peca_marca_id`)
    REFERENCES `marcas` (`marca_id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
  ADD CONSTRAINT `peca_modelo_id`
    FOREIGN KEY (`peca_modelo_id`)
    REFERENCES `modelos` (`modelo_id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
  DROP COLUMN `peca_nome`;
