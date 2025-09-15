import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Item extends Model {}

Item.init(
  {
    item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    item_empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    item_setor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    item_workstation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    item_ativo: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    item_data_inativacao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    item_tipo: {
      type: DataTypes.ENUM(
        "desktop",
        "notebook",
        "movel",
        "cadeira",
        "monitor",
        "ferramenta",
        "ap",
        "ar-condicionado",
        "switch",
        "periferico",
        "no-break",
        "impressora",
        "gerador",
        "celular",
        "outros"
      ),
      allowNull: false,
    },
    item_etiqueta: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    item_num_serie: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    item_nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    item_preco: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    item_em_uso: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    item_data_aquisicao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    item_ultima_manutencao: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    item_intervalo_manutencao: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Item",
    tableName: "itens",
    timestamps: false,
  }
);

export default Item;
