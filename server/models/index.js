import Anexo from "./anexos.js";
import Caracteristica from "./caracteristicas.js";
import Empresa from "./empresas.js";
import Item from "./itens.js";
import Senha from "./senhas.js";
import Setor from "./setores.js";
import Usuario from "./usuarios.js";
import Workstation from "./workstations.js";
import Plataforma from "./plataformas.js";
import Log from "./logs.js";
import Peca from "./pecas.js";

//Foreign keys de Peças e Empresas
Empresa.hasMany(Peca, {
  foreignKey: "peca_empresa_id",
  sourceKey: "empresa_id",
  onDelete: "CASCADE",
  as: "pecas",
});
Setor.belongsTo(Peca, {
  foreignKey: "peca_empresa_id",
  targetKey: "empresa_id",
  onDelete: "CASCADE",
  as: "empresa",
});

//Foreign keys de Peças e Itens
Item.hasMany(Peca, {
  foreignKey: "peca_item_id",
  sourceKey: "item_id",
  as: "pecas",
});
Item.belongsTo(Peca, {
  foreignKey: "peca_item_id",
  targetKey: "item_id",
  as: "item",
});

//Foreign keys de Empresas e Setores
Empresa.hasMany(Setor, {
  foreignKey: "setor_empresa_id",
  sourceKey: "empresa_id",
  onDelete: "CASCADE",
  as: "setores",
});
Setor.belongsTo(Empresa, {
  foreignKey: "setor_empresa_id",
  targetKey: "empresa_id",
  onDelete: "CASCADE",
  as: "empresa",
});

//Foreign keys de Itens e Setores
Setor.hasMany(Item, {
  foreignKey: "item_setor_id",
  sourceKey: "setor_id",
  onDelete: "SET NULL",
  as: "itens",
});
Item.belongsTo(Setor, {
  foreignKey: "item_setor_id",
  targetKey: "setor_id",
  onDelete: "SET NULL",
  as: "setor",
});

//Foreign keys de Itens e Empresas
Empresa.hasMany(Item, {
  foreignKey: "item_empresa_id",
  sourceKey: "empresa_id",
  onDelete: "CASCADE",
  as: "itens",
});
Item.belongsTo(Empresa, {
  foreignKey: "item_empresa_id",
  targetKey: "empresa_id",
  onDelete: "CASCADE",
  as: "empresa",
});

//Foreign keys de Itens e Workstations
Workstation.hasMany(Item, {
  foreignKey: "item_workstation_id",
  sourceKey: "workstation_id",
  onDelete: "SET NULL",
  as: "itens",
});
Item.belongsTo(Workstation, {
  foreignKey: "item_workstation_id",
  targetKey: "workstation_id",
  onDelete: "SET NULL",
  as: "workstation",
});

//Foreign keys de Workstations e Setores
Setor.hasMany(Workstation, {
  foreignKey: "workstation_setor_id",
  sourceKey: "setor_id",
  onDelete: "CASCADE",
  as: "workstations",
});
Workstation.belongsTo(Setor, {
  foreignKey: "workstation_setor_id",
  targetKey: "setor_id",
  onDelete: "CASCADE",
  as: "setor",
});

//Foreign keys de Workstation e Empresas
Empresa.hasMany(Workstation, {
  foreignKey: "workstation_empresa_id",
  targetKey: "empresa_id",
  onDelete: "CASCADE",
  as: "workstations",
});
Workstation.belongsTo(Empresa, {
  foreignKey: "workstation_empresa_id",
  targetKey: "empresa_id",
  onDelete: "CASCADE",
  as: "empresa",
});

//Foreign keys de Anexos e Empresas
Item.hasMany(Anexo, {
  foreignKey: "anexo_item_id",
  sourceKey: "item_id",
  onDelete: "CASCADE",
  as: "anexos",
});
Anexo.belongsTo(Item, {
  foreignKey: "anexo_item_id",
  targetKey: "item_id",
  onDelete: "CASCADE",
  as: "item",
});

//Foreign keys de Características e Empresas
Item.hasMany(Caracteristica, {
  foreignKey: "caracteristica_item_id",
  sourceKey: "item_id",
  onDelete: "CASCADE",
  as: "caracteristicas",
});
Caracteristica.belongsTo(Item, {
  foreignKey: "caracteristica_item_id",
  targetKey: "item_id",
  onDelete: "CASCADE",
  as: "item",
});

//Foreign keys de Senhas e Usuarios
Usuario.hasMany(Senha, {
  foreignKey: "senha_usuario_id",
  sourceKey: "usuario_id",
  as: "senhas",
});
Senha.belongsTo(Usuario, {
  foreignKey: "senha_usuario_id",
  targetKey: "usuario_id",
  as: "usuario",
});

//Foregign keys de Plataformas e Senhas
Plataforma.hasMany(Senha, {
  foreignKey: "senha_plataforma_id",
  sourceKey: "plataforma_id",
  as: "senhas",
});
Senha.belongsTo(Plataforma, {
  foreignKey: "senha_plataforma_id",
  targetKey: "plataforma_id",
  as: "plataforma",
});

//Foregign keys de Empresas e Senhas
Empresa.hasMany(Senha, {
  foreignKey: "senha_empresa_id",
  sourceKey: "empresa_id",
  onDelete: "CASCADE",
  as: "senhas",
});
Senha.belongsTo(Empresa, {
  foreignKey: "senha_empresa_id",
  targetKey: "empresa_id",
  onDelete: "CASCADE",
  as: "empresas",
});

//Logging de itens
Item.afterCreate(async (item, options) => {
  const usuarioId = options?.usuarioId || null;
  await Log.create({
    log_usuario_id: usuarioId,
    log_item_pai_id: item.item_empresa_id,
    log_operacao: "Item criado",
    log_valor_anterior: "-",
    log_novo_valor: JSON.stringify(item.toJSON()),
  });
});

Item.afterUpdate(async (item, options) => {
  const usuarioId = options?.usuarioId || null;
  const changedFields = item.changed();

  if (changedFields && changedFields.length > 0) {
    for (const field of changedFields) {
      const oldVal = item.previous(field);
      const newVal = item.get(field);
      await Log.create({
        log_usuario_id: usuarioId,
        log_item_pai_id: item.item_id,
        log_operacao: `Campo do item atualizado: ${field}`,
        log_valor_anterior: oldVal !== null ? String(oldVal) : "NULL",
        log_novo_valor: newVal !== null ? String(newVal) : "NULL",
      });
    }
  }
});

//Logging de Anexos
Anexo.afterCreate(async (anexo, options) => {
  const usuarioId = options?.usuarioId || null;
  await Log.create({
    log_usuario_id: usuarioId,
    log_item_pai_id: anexo.anexo_item_id,
    log_operacao: `Anexo criado`,
    log_valor_anterior: "-",
    log_novo_valor: JSON.stringify(anexo.toJSON()),
  });
});

Anexo.afterDestroy(async (anexo, options) => {
  const usuarioId = options?.usuarioId || null;
  await Log.create({
    log_usuario_id: usuarioId,
    log_item_pai_id: anexo.anexo_item_id,
    log_operacao: `Anexo excluído`,
    log_valor_anterior: JSON.stringify(anexo.toJSON()),
    log_novo_valor: "-",
  });
});

//Logging se Setores
Setor.afterCreate(async (setor, options) => {
  const usuarioId = options?.usuarioId || null;
  await Log.create({
    log_usuario_id: usuarioId,
    log_item_pai_id: setor.setor_empresa_id,
    log_operacao: `Setor criado`,
    log_valor_anterior: "-",
    log_novo_valor: JSON.stringify(setor.toJSON()),
  });
});

Setor.afterDestroy(async (setor, options) => {
  const usuarioId = options?.usuarioId || null;
  await Log.create({
    log_usuario_id: usuarioId,
    log_item_pai_id: setor.setor_empresa_id,
    log_operacao: `Setor excluído`,
    log_valor_anterior: JSON.stringify(setor.toJSON()),
    log_novo_valor: "-",
  });
});

//Logging de Plataformas
Plataforma.afterCreate(async (plataforma, options) => {
  const usuarioId = options?.usuarioId || null;
  await Log.create({
    log_usuario_id: usuarioId,
    log_item_pai_id: null,
    log_operacao: `Plataforma criada`,
    log_valor_anterior: "-",
    log_novo_valor: JSON.stringify(plataforma.toJSON()),
  });
});

Plataforma.afterDestroy(async (plataforma, options) => {
  const usuarioId = options?.usuarioId || null;
  await Log.create({
    log_usuario_id: usuarioId,
    log_item_pai_id: null,
    log_operacao: `Plataforma excluída`,
    log_valor_anterior: JSON.stringify(plataforma.toJSON()),
    log_novo_valor: "-",
  });
});

//Logging de Workstations
Workstation.afterCreate(async (workstation, options) => {
  const usuarioId = options?.usuarioId || null;
  await Log.create({
    log_usuario_id: usuarioId,
    log_item_pai_id: workstation.workstation_empresa_id,
    log_operacao: `Workstation criada`,
    log_valor_anterior: "-",
    log_novo_valor: JSON.stringify(workstation.toJSON()),
  });
});

Workstation.afterDestroy(async (workstation, options) => {
  const usuarioId = options?.usuarioId || null;
  await Log.create({
    log_usuario_id: usuarioId,
    log_item_pai_id: workstation.workstation_empresa_id,
    log_operacao: `Workstation excluída`,
    log_valor_anterior: JSON.stringify(workstation.toJSON()),
    log_novo_valor: "-",
  });
});

//Logging de Senhas
Senha.afterCreate(async (senha, options) => {
  const usuarioId = options?.usuarioId || null;
  await Log.create({
    log_usuario_id: usuarioId,
    log_item_pai_id: senha.senha_plataforma_id,
    log_operacao: `Senha criada`,
    log_valor_anterior: "-",
    log_novo_valor: JSON.stringify(senha.toJSON()),
  });
});

Senha.afterDestroy(async (senha, options) => {
  const usuarioId = options?.usuarioId || null;
  await Log.create({
    log_usuario_id: usuarioId,
    log_item_pai_id: senha.senha_plataforma_id,
    log_operacao: `Senha excluída`,
    log_valor_anterior: JSON.stringify(senha.toJSON()),
    log_novo_valor: "-",
  });
});

Senha.afterUpdate(async (senha, options) => {
  const usuarioId = options?.usuarioId || null;
  const changedFields = senha.changed();

  if (changedFields && changedFields.length > 0) {
    for (const field of changedFields) {
      const oldVal = senha.previous(field);
      const newVal = senha.get(field);
      await Log.create({
        log_usuario_id: usuarioId,
        log_item_pai_id: senha.senha_id,
        log_operacao: `Campo da senha atualizado: ${field}`,
        log_valor_anterior: oldVal !== null ? String(oldVal) : "NULL",
        log_novo_valor: newVal !== null ? String(newVal) : "NULL",
      });
    }
  }
});

//Logging de Características
Caracteristica.afterUpdate(async (caracteristica, options) => {
  const usuarioId = options?.usuarioId || null;
  const changedFields = caracteristica.changed();

  if (changedFields && changedFields.length > 0) {
    for (const field of changedFields) {
      const oldVal = caracteristica.previous(field);
      const newVal = caracteristica.get(field);
      await Log.create({
        log_usuario_id: usuarioId,
        log_item_pai_id: caracteristica.caracteristica_item_id,
        log_operacao: `Característica atualizada: ${caracteristica.caracteristica_nome}`,
        log_valor_anterior: oldVal !== null ? String(oldVal) : "NULL",
        log_novo_valor: newVal !== null ? String(newVal) : "NULL",
      });
    }
  }
});

export {
  Anexo,
  Caracteristica,
  Empresa,
  Item,
  Senha,
  Setor,
  Usuario,
  Workstation,
  Plataforma,
  Log,
};
