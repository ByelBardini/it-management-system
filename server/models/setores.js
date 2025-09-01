import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Setor extends Model {}

Setor.init(
  {
    setor_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    setor_empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    setor_nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Setor",
    tableName: "setores",
    timestamps: false,
  }
);

export default Setor;
