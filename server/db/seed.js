// Seed idempotente da carga inicial do InfraHub.
//
// Usa os MODELS (Sequelize) + bcrypt e findOrCreate — rodar de novo não
// duplica nada. Precisa de bcrypt porque o login faz bcrypt.compare, então o
// seed é em JS (não SQL puro).
//
// Ordem OBRIGATÓRIA (resolve o gotcha do hook de auditoria):
//   1. Admin   (usuarios — SEM hook) → guarda adminId.
//   2. Empresa (empresas — SEM hook) → empresa_cnpj é NOT NULL, sem default.
//   3. Plataformas e Setor (TÊM afterCreate que grava em logs_sistema) → passar
//      { usuarioId: adminId }, senão log_usuario_id (NOT NULL) fica null e quebra.
import bcrypt from "bcrypt";
import { pathToFileURL } from "node:url";
import dotenv from "dotenv";
import sequelize from "../config/database.js";
import { Usuario, Empresa, Plataforma, Setor } from "../models/index.js";

dotenv.config();

const ADMIN_LOGIN = process.env.SEED_ADMIN_LOGIN || "admin";
const ADMIN_SENHA = process.env.SEED_ADMIN_SENHA || "admin123";
const ADMIN_NOME = process.env.SEED_ADMIN_NOME || "Administrador";
const EMPRESA_NOME = process.env.SEED_EMPRESA_NOME || "Empresa Padrão";
const EMPRESA_CNPJ = process.env.SEED_EMPRESA_CNPJ || "00.000.000/0001-00";

// Plataformas e setor iniciais (opcionais) — exercitam o gotcha do usuarioId.
const PLATAFORMAS_PADRAO = ["E-mail", "Sistema Interno"];
const SETOR_PADRAO = "Geral";

export async function semear() {
  // 1. Admin — sem hook de auditoria; entra direto (usuario_troca_senha = 0).
  const [admin] = await Usuario.findOrCreate({
    where: { usuario_login: ADMIN_LOGIN },
    defaults: {
      usuario_nome: ADMIN_NOME,
      usuario_login: ADMIN_LOGIN,
      usuario_senha: bcrypt.hashSync(ADMIN_SENHA, 10),
      usuario_tipo: "adm",
      usuario_ativo: 1,
      usuario_troca_senha: 0,
    },
  });
  const adminId = admin.usuario_id;
  console.log(`Admin "${ADMIN_LOGIN}" pronto (id ${adminId}).`);

  // 2. Empresa — sem hook; empresa_cnpj é obrigatório.
  const [empresa] = await Empresa.findOrCreate({
    where: { empresa_nome: EMPRESA_NOME },
    defaults: { empresa_nome: EMPRESA_NOME, empresa_cnpj: EMPRESA_CNPJ },
  });
  console.log(`Empresa "${EMPRESA_NOME}" pronta (id ${empresa.empresa_id}).`);

  // 3. Plataformas e setor — TÊM afterCreate → repassar { usuarioId: adminId }.
  for (const nome of PLATAFORMAS_PADRAO) {
    await Plataforma.findOrCreate({
      where: { plataforma_nome: nome },
      defaults: { plataforma_nome: nome },
      usuarioId: adminId,
    });
  }

  await Setor.findOrCreate({
    where: { setor_empresa_id: empresa.empresa_id, setor_nome: SETOR_PADRAO },
    defaults: { setor_empresa_id: empresa.empresa_id, setor_nome: SETOR_PADRAO },
    usuarioId: adminId,
  });

  console.log("Seed concluído.");
}

// Semeia SÓ quando o banco ainda não tem dados (primeiro deploy): pula se houver
// QUALQUER usuário ou QUALQUER empresa. semear() já é idempotente (findOrCreate),
// mas o guard dá a semântica de "1º deploy" — evita recriar defaults que o
// operador apagou de propósito e ressuscitar o admin/senha padrão a cada redeploy.
export async function semearSeVazio() {
  const usuarios = await Usuario.count();
  const empresas = await Empresa.count();
  if (usuarios > 0 || empresas > 0) {
    console.log(
      `Banco já possui dados (${usuarios} usuário(s), ${empresas} empresa(s)) — seed ignorado.`
    );
    return false;
  }
  await semear();
  return true;
}

// Execução direta (`node db/seed.js`): semeia e fecha a conexão própria.
//   sem flag        → semear() sempre (uso manual / dev).
//   flag --se-vazio → semearSeVazio() guardado (deploy: só no 1º, banco vazio).
// Quando importado (ex.: por migrate.js --reset), só exporta as funções — quem
// importa cuida de fechar o Sequelize.
const ehMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
const SE_VAZIO = process.argv.slice(2).includes("--se-vazio");

if (ehMain) {
  const acao = SE_VAZIO ? semearSeVazio : semear;
  acao()
    .catch((erro) => {
      console.error("Falha no seed:", erro.message);
      process.exitCode = 1;
    })
    .finally(() => sequelize.close());
}
