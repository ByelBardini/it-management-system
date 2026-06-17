import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Marca extends Model {}

Marca.init(
  {
    marca_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    marca_nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    marca_dominio: {
      type: DataTypes.ENUM("item", "peca"),
      allowNull: false,
    },
    marca_tipo: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    marca_subtipo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
    },
  },
  {
    sequelize,
    modelName: "Marca",
    tableName: "marcas",
    timestamps: false,
  }
);

export default Marca;
