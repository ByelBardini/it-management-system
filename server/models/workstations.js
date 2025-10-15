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
    workstation_empresa_id: {
      type: DataTypes.INTEGER,
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
    workstation_anydesk: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    workstation_senha_anydesk: {
      type: DataTypes.STRING(45),
      allowNull: true,
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
