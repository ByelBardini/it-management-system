import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Usuario extends Model {}

Usuario.init(
  {
    usuario_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    usuario_nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    usuario_login: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    usuario_senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    usuario_tipo: {
      type: DataTypes.ENUM("adm", "usuario"),
      allowNull: false,
    },
    usuario_ativo: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    usuario_troca_senha: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: "Usuario",
    tableName: "usuarios",
    timestamps: false,
  }
);

export default Usuario;
