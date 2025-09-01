import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Caracteristica extends Model {}

Caracteristica.init(
  {
    caracteristica_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    caracteristica_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    caracteristica_nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    caracteristica_valor: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Caracteristica",
    tableName: "caracteristicas",
    timestamps: false,
  }
);

export default Caracteristica;
