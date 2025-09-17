export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(msg = "Requisição inválida", details) {
    return new ApiError(400, "ERR_BAD_REQUEST", msg, details);
  }
  static unauthorized(msg = "Necessário estar logado") {
    return new ApiError(401, "ERR_UNAUTHORIZED", msg);
  }
  static forbidden(msg = "Acesso negado ao recurso") {
    return new ApiError(403, "ERR_FORBIDDEN", msg);
  }
  static notFound(msg = "Recurso não encontrado") {
    return new ApiError(404, "ERR_NOT_FOUND", msg);
  }
  static conflict(msg = "Conflito de dados") {
    return new ApiError(409, "ERR_CONFLICT", msg);
  }
  static internal(msg = "Erro interno do servidor") {
    return new ApiError(500, "ERR_INTERNAL", msg);
  }
}
