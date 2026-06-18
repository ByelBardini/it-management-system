import { describe, it, expect, vi } from "vitest";
import { ApiError } from "../../../middlewares/ApiError.js";
// AINDA NÃO EXISTE: factory síncrono igual a autorizarRole, retorna (req,_res,next).
// O erro de import é o RED esperado no TDD.
import { autorizarQualquerRole } from "../../../middlewares/autenticaToken.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";

describe("autorizarQualquerRole", () => {
  it("(feliz) libera cadastrador presente na lista chamando next sem erro", () => {
    const mw = autorizarQualquerRole(["cadastrador"]);
    const req = mockReq({ usuario: { id: 1, tipo: "cadastrador", nome: "Cad" } });
    const next = vi.fn();

    mw(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("(borda) libera adm mesmo fora da lista de roles", () => {
    const mw = autorizarQualquerRole(["cadastrador"]);
    const req = mockReq({ usuario: { id: 2, tipo: "adm", nome: "Admin" } });
    const next = vi.fn();

    mw(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("(erro) barra usuário comum lançando ApiError 403", () => {
    const mw = autorizarQualquerRole(["cadastrador"]);
    const req = mockReq({ usuario: { id: 3, tipo: "usuario", nome: "Comum" } });
    const next = vi.fn();

    let erroCapturado;
    try {
      mw(req, mockRes(), next);
    } catch (err) {
      erroCapturado = err;
    }

    expect(erroCapturado).toBeInstanceOf(ApiError);
    expect(erroCapturado.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("(erro) lança ApiError 401 quando não há req.usuario", () => {
    const mw = autorizarQualquerRole(["cadastrador"]);
    const req = mockReq({ usuario: undefined });
    const next = vi.fn();

    let erroCapturado;
    try {
      mw(req, mockRes(), next);
    } catch (err) {
      erroCapturado = err;
    }

    expect(erroCapturado).toBeInstanceOf(ApiError);
    expect(erroCapturado.status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
});
