import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Log extends Model {}

Log.init(
  {
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    log_item_pai_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    log_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    log_operacao: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    log_valor_anterior: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    log_novo_valor: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Log",
    tableName: "logs_sistema",
    timestamps: false,
  }
);

export default Log;
