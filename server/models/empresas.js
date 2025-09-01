import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Empresa extends Model {}

Empresa.init(
  {
    empresa_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    empresa_nome: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    empresa_cnpj: {
      type: DataTypes.STRING(75),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Empresa",
    tableName: "empresas",
    timestamps: false,
  }
);

export default Empresa;
