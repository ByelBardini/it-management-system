import crypto from "crypto";
import dotenv from "dotenv";
import { Senha, Plataforma, Usuario } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";
dotenv.config();

const CHAVE = process.env.SECRET_KEY_PASSWORD;
const ALGORITMO = "aes-256-cbc";

export async function getSenhas(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("ID da empresa é obrigatório");
  }

  const senhas = await Senha.findAll({
    where: { senha_empresa_id: id },
    attributes: [
      "senha_id",
      "senha_nome",
      "senha_usuario",
      "senha_ultima_troca",
      "senha_tempo_troca",
    ],
    include: [
      {
        model: Plataforma,
        as: "plataforma",
        attributes: ["plataforma_id", "plataforma_nome"],
      },
    ],
  });

  return res.status(200).json(senhas);
}

export async function getSenhaFull(req, res) {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest("Necessário id da senha a ser buscada");
  }

  const senha = await Senha.findOne({
    where: { senha_id: id },
    attributes: [
      "senha_id",
      "senha_nome",
      "senha_usuario",
      "senha_ultima_troca",
      "senha_tempo_troca",
      "senha_criptografada",
      "senha_iv",
    ],
    include: [
      {
        model: Plataforma,
        as: "plataforma",
        attributes: ["plataforma_id", "plataforma_nome"],
      },
      {
        model: Usuario,
        as: "usuario",
        attributes: ["usuario_id", "usuario_nome"],
      },
    ],
  });

  const iv = Buffer.from(senha.senha_iv, "hex");

  const descriptografa = crypto.createDecipheriv(ALGORITMO, CHAVE, iv);
  let senhaOriginal = descriptografa.update(
    senha.senha_criptografada,
    "hex",
    "utf-8"
  );
  senhaOriginal += descriptografa.final("utf-8");

  return res.status(200).json({
    plataforma: senha.plataforma,
    usuario: senha.usuario,
    senha_nome: senha.senha_nome,
    senha_usuario: senha.senha_usuario,
    senha_descriptografada: senhaOriginal,
    senha_ultima_troca: senha.senha_ultima_troca,
    senha_tempo_troca: senha.senha_tempo_troca,
  });
}

export async function postSenha(req, res) {
  const {
    senha_empresa_id,
    senha_usuario_id,
    senha_plataforma_id,
    senha_nome,
    senha_usuario,
    senha,
    senha_tempo_troca,
  } = req.body;

  if (
    !senha_empresa_id ||
    !senha_usuario_id ||
    !senha_plataforma_id ||
    !senha_nome ||
    !senha_usuario ||
    !senha ||
    !senha_tempo_troca
  ) {
    throw ApiError.badRequest("Todos os dados são obrigatórios");
  }

  const iv = crypto.randomBytes(16);

  const cifra = crypto.createCipheriv(ALGORITMO, CHAVE, iv);
  let senhaCriptografada = cifra.update(senha, "utf-8", "hex");
  senhaCriptografada += cifra.final("hex");

  await Senha.create({
    senha_empresa_id,
    senha_usuario_id,
    senha_plataforma_id,
    senha_nome,
    senha_usuario,
    senha_criptografada: senhaCriptografada,
    senha_iv: iv.toString("hex"),
    senha_ultima_troca: new Date(),
    senha_tempo_troca: senha_tempo_troca,
  });

  return res.status(201).json({ message: "Senha cadastrada com sucesso!" });
}

export async function atualizaSenha(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("Necessário informar ID da senhas");
  }
  const { nova_senha } = req.body;
  if (!nova_senha) {
    throw ApiError.badRequest("Necessário informar nova senha");
  }

  const iv = crypto.randomBytes(16);

  const cifra = crypto.createCipheriv(ALGORITMO, CHAVE, iv);
  let senhaCriptografada = cifra.update(nova_senha, "utf-8", "hex");
  senhaCriptografada += cifra.final("hex");

  const senha = await Senha.findByPk(id);

  senha.senha_criptografada = senhaCriptografada;
  senha.senha_iv = iv.toString("hex");
  senha.senha_ultima_troca = new Date();

  await senha.save();

  return res.status(200).json({ message: "Senha atualizada com sucesso" });
}

export async function deletaSenha(req, res) {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest("Necessári id da senha a ser excluída");
  }

  const senha = await Senha.findByPk(id);

  await senha.destroy();

  return res.status(200).json({ message: "Senha excluída com sucesso." });
}
