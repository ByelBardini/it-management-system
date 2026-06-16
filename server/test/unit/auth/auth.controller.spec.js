import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import bcrypt from "bcrypt";
import { login, logout } from "../../../controllers/authController.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";

vi.mock("../../../models/index.js", async () => {
  const { createModelsMock } = await import("../helpers/sequelize-mock.js");
  return createModelsMock();
});

vi.mock("bcrypt", () => ({
  default: { compare: vi.fn() },
}));

vi.mock("jsonwebtoken", () => ({
  default: { sign: vi.fn(() => "fake.jwt.token") },
}));

const usuarioAtivo = {
  usuario_id: 1,
  usuario_login: "admin",
  usuario_senha: "hash",
  usuario_ativo: 1,
  usuario_tipo: "adm",
  usuario_nome: "Administrador",
  usuario_troca_senha: 0,
  usuario_caminho_foto: null,
};

describe("authController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("loga com credenciais válidas e seta o cookie httpOnly", async () => {
      db.Usuario.findOne.mockResolvedValue(usuarioAtivo);
      bcrypt.compare.mockResolvedValue(true);
      const req = mockReq({
        body: { usuario_login: "admin", usuario_senha: "123" },
      });
      const res = mockRes();

      await login(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        expect.any(String),
        expect.objectContaining({ httpOnly: true, sameSite: "strict" })
      );
      expect(res.status).toHaveBeenCalledWith(200);

      const corpo = res.json.mock.calls[0][0];
      expect(corpo).not.toHaveProperty("token");
      expect(corpo.resposta.usuario_id).toBe(1);
    });

    it("rejeita senha incorreta com 401", async () => {
      db.Usuario.findOne.mockResolvedValue(usuarioAtivo);
      bcrypt.compare.mockResolvedValue(false);
      const req = mockReq({
        body: { usuario_login: "admin", usuario_senha: "errada" },
      });
      const res = mockRes();

      await expect(login(req, res)).rejects.toMatchObject({ status: 401 });
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it("exige login e senha (400)", async () => {
      const req = mockReq({ body: {} });
      const res = mockRes();

      await expect(login(req, res)).rejects.toMatchObject({ status: 400 });
    });
  });

  describe("logout", () => {
    it("encerra a sessão limpando o cookie", async () => {
      const req = mockReq();
      const res = mockRes();

      await logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("token", expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
