import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Modelo extends Model {}

Modelo.init(
  {
    modelo_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    modelo_marca_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    modelo_nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Modelo",
    tableName: "modelos",
    timestamps: false,
  }
);

export default Modelo;
