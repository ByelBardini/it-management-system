import Anexo from "./anexos.js";
import Caracteristica from "./caracteristicas.js";
import Empresa from "./empresas.js";
import Item from "./itens.js";
import Senha from "./senhas.js";
import Setor from "./setores.js";
import Usuario from "./usuarios.js";

//Foreign keys de Empresas e Setores
Empresa.hasMany(Setor, {
  foreignKey: "setor_empresa_id",
  sourceKey: "empresa_id",
  as: "setores",
});
Setor.belongsTo(Empresa, {
  foreignKey: "setor_empresa_id",
  targetKey: "empresa_id",
  as: "empresa",
});

//Foreign keys de Itens e Setores
Setor.hasMany(Item, {
  foreignKey: "item_setor_id",
  sourceKey: "setor_id",
  as: "itens",
});
Item.belongsTo(Setor, {
  foreignKey: "item_setor_id",
  targetKey: "setor_id",
  as: "setor",
});

//Foreign keys de Itens e Empresas
Empresa.hasMany(Item, {
  foreignKey: "item_empresa_id",
  sourceKey: "empresa_id",
  as: "itens",
});
Item.belongsTo(Empresa, {
  foreignKey: "item_empresa_id",
  targetKey: "empresa_id",
  as: "empresa",
});

//Foreign keys de Anexos e Empresas
Item.hasMany(Anexo, {
  foreignKey: "anexo_item_id",
  sourceKey: "item_id",
  as: "anexos",
});
Anexo.belongsTo(Item, {
  foreignKey: "anexo_item_id",
  targetKey: "item_id",
  as: "item",
});

//Foreign keys de Características e Empresas
Item.hasMany(Caracteristica, {
  foreignKey: "caracteristica_item_id",
  sourceKey: "item_id",
  as: "caracteristicas",
});
Caracteristica.belongsTo(Item, {
  foreignKey: "caracteristica_item_id",
  targetKey: "item_id",
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

export { Anexo, Caracteristica, Empresa, Item, Senha, Setor, Usuario };
