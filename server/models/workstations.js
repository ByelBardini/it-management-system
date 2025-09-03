import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Workstation extends Model {}

Workstation.init(
  {
    workstation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    workstation_setor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workstation_nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Workstation",
    tableName: "workstations",
    timestamps: false,
  }
);

export default Workstation;
