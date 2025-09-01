import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Anexo extends Model {}

Anexo.init(
  {
    anexo_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    anexo_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    anexo_caminho_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    anexo_tipo: {
      type: DataTypes.ENUM("garantia", "manual", "anexo"),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Anexo",
    tableName: "anexos",
    timestamps: false,
  }
);

export default Anexo;
