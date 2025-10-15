import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Peca extends Model {}

Peca.init(
  {
    peca_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    peca_empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    peca_item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    peca_ativa: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    peca_data_inativacao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    peca_tipo: {
      type: DataTypes.ENUM(
        "processador",
        "placa-video",
        "placa-mae",
        "ram",
        "armazenamento",
        "fonte",
        "placa-rede",
        "gabinete",
        "outros"
      ),
      allowNull: false,
    },
    peca_nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    peca_preco: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    peca_em_uso: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    peca_data_aquisicao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Peca",
    tableName: "pecas",
    timestamps: false,
  }
);

export default Peca;
