import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";
import { extrairToken } from "../config/seguranca.js";
import { ColetorToken, Usuario } from "../models/index.js";
import { hashToken } from "../controllers/helpers/coletorToken.js";

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

export function autorizarQualquerRole(roles) {
  // Libera se o tipo do usuário está na lista informada OU é "adm" (que sempre passa).
  // Mesmo formato síncrono de autorizarRole: lança ApiError em vez de devolver 4xx.
  return (req, _res, next) => {
    if (!req.usuario) {
      throw ApiError.unauthorized("Usuário não autenticado");
    }

    if (req.usuario.tipo !== "adm" && !roles.includes(req.usuario.tipo)) {
      throw ApiError.forbidden("Ação não permitida para o seu tipo de usuário");
    }

    next();
  };
}

// Autentica a coleta de desktop por TOKEN de API (cliente não-browser, sem cookie).
// Valida o token contra o banco (revogável), confirma a conta ativa e injeta o
// usuário + o empresa_id do token na requisição — assim a coleta fica escopada à
// empresa da conta (o script não escolhe a empresa). Usado ANTES do gate de cookie.
export async function autenticarColetorToken(req, _res, next) {
  const token = extrairToken(req);
  if (!token) {
    throw ApiError.unauthorized("Token não fornecido");
  }

  const registro = await ColetorToken.findOne({
    where: { token_hash: hashToken(token), token_ativo: 1 },
  });
  if (!registro) {
    throw ApiError.unauthorized("Token inválido ou revogado");
  }
  if (registro.token_expira_em && new Date(registro.token_expira_em) < new Date()) {
    throw ApiError.unauthorized("Token expirado");
  }

  const usuario = await Usuario.findByPk(registro.token_usuario_id);
  if (!usuario || usuario.usuario_ativo == 0) {
    throw ApiError.unauthorized("Conta de coleta inativa");
  }

  req.usuario = {
    id: usuario.usuario_id,
    tipo: usuario.usuario_tipo,
    nome: usuario.usuario_nome,
  };
  // Escopa a coleta à empresa do token (ignora o que vier no corpo).
  req.body = req.body || {};
  req.body.item_empresa_id = registro.token_empresa_id;

  next();
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
