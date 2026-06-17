import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Subtipo extends Model {}

Subtipo.init(
  {
    subtipo_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    subtipo_tipo: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    subtipo_nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Subtipo",
    tableName: "subtipos",
    timestamps: false,
  }
);

export default Subtipo;
