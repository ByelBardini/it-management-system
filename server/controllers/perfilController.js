import bcrypt from "bcrypt";
import { Usuario } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";

export async function trocaSenha(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("O id do usuário é obrigatório");
  }

  const { senhaAtual, nova_senha } = req.body;
  if (!senhaAtual || !nova_senha) {
    throw ApiError.badRequest("Necessário todas as informações");
  }

  const usuario = await Usuario.findByPk(id);

  if (usuario.usuario_ativo == 0) {
    throw ApiError.unauthorized("Usuário inativo");
  }

  const match = await bcrypt.compare(senhaAtual, usuario.usuario_senha);

  if (!match) {
    throw ApiError.unauthorized("Senha incorreta");
  }

  const senhaHash = bcrypt.hashSync(nova_senha, 10);

  usuario.usuario_senha = senhaHash;
  usuario.usuario_troca_senha = 0;
  await usuario.save();

  return res.status(200).json({ message: "Senha atualizada com sucesso" });
}

export async function primeiraTrocaSenha(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("O id do usuário é obrigatório");
  }

  const { nova_senha } = req.body;
  if (!nova_senha) {
    throw ApiError.badRequest("Necessário todas as informações");
  }

  const usuario = await Usuario.findByPk(id);

  if (usuario.usuario_ativo == 0) {
    throw ApiError.unauthorized("Usuário inativo");
  }

  const senhaHash = bcrypt.hashSync(nova_senha, 10);

  usuario.usuario_senha = senhaHash;
  usuario.usuario_troca_senha = 0;
  await usuario.save();

  return res.status(200).json({ message: "Senha atualizada com sucesso" });
}

export async function putPerfil(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("O ID do usuário é obrigatório");
  }

  const { nome_usuario } = req.body;
  if (!nome_usuario) {
    throw ApiError.badRequest("O nome do usuário é obrigatório");
  }
  const fotoPath = req.file ? `/uploads/fotos/${req.file.filename}` : null;

  const usuario = await Usuario.findByPk(id);

  usuario.usuario_nome = nome_usuario;
  if (fotoPath != null) {
    usuario.usuario_caminho_foto = fotoPath;
  }

  await usuario.save();

  return res.status(200).json({
    usuario_nome: nome_usuario,
    usuario_caminho_foto: fotoPath || usuario.usuario_caminho_foto,
  });
}
