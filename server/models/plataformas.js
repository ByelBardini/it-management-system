import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Plataforma extends Model {}

Plataforma.init(
  {
    plataforma_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    plataforma_nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "PLataforma",
    tableName: "plataformas",
    timestamps: false,
  }
);

export default Plataforma;
