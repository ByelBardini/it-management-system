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
      type: DataTypes.ENUM("adm", "usuario", "cadastrador", "coletor"),
      allowNull: false,
    },
    // Empresa à qual a conta está amarrada. Usada pelo papel "coletor": o token de
    // coleta herda esta empresa, então o script nem precisa informá-la. Null para os
    // demais papéis (que escolhem a empresa ativa na UI).
    usuario_empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usuario_caminho_foto: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
