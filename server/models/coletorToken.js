import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Token de coleta revogável. Emitido no download do coletor (coletorController) e
// guardado SÓ como hash SHA-256 (token_hash) — o valor em claro só existe no ZIP
// baixado. Amarrado ao usuário coletor e à empresa dele; o middleware
// autenticarColetorToken valida por hash e injeta a empresa na requisição.
class ColetorToken extends Model {}

ColetorToken.init(
  {
    token_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    token_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_hash: {
      type: DataTypes.CHAR(64),
      allowNull: false,
    },
    token_ativo: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    token_expira_em: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    token_criado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    token_ultimo_uso: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ColetorToken",
    tableName: "coletor_tokens",
    timestamps: false,
  }
);

export default ColetorToken;
