import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";
import { extrairToken } from "../config/seguranca.js";

export function autenticar(req, _res, next) {
  // Cookie httpOnly primeiro; header Authorization como fallback.
  const token = extrairToken(req);
  if (!token) {
    throw ApiError.unauthorized("Token não fornecido");
  }

  try {
    // Lê o segredo em tempo de chamada (env já carregada no boot via validarAmbiente).
    const payload = jwt.verify(token, process.env.SECRET_KEY_LOGIN);

    req.usuario = {
      id: payload.usuario_id,
      tipo: payload.usuario_tipo,
      nome: payload.usuario_nome,
    };

    next();
  } catch {
    throw ApiError.unauthorized("Token inválido ou expirado");
  }
}

export function autorizarRole(role) {
  return (req, _res, next) => {
    if (!req.usuario) {
      throw ApiError.unauthorized("Usuário não autenticado");
    }

    if (req.usuario.tipo !== role && req.usuario.tipo !== "adm") {
      throw ApiError.forbidden("Ação não permitida para o seu tipo de usuário");
    }

    next();
  };
}

export function autorizarUser() {
  return (req, _res, next) => {
    if (!req.usuario) {
      throw ApiError.unauthorized("Usuário não autenticado");
    }
    if (req.usuario.id != req.params.id && req.usuario.tipo !== "adm") {
      throw ApiError.forbidden("Ação não permitida para este usuário");
    }
    next();
  };
}
