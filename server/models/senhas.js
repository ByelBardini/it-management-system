import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Senha extends Model {}

Senha.init(
  {
    senha_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    senha_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senha_usuario: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    senha_plataforma: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    senha_criptografada: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    senha_iv: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    senha_ultima_troca: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    senha_tempo_troca: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Senha",
    tableName: "senhas",
    timestamps: false,
  }
);

export default Senha;
