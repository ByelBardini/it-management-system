import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../api.js", () => ({
  api: { post: vi.fn() },
}));

import { api } from "../api.js";
import { logar, deslogar } from "./authService.js";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("logar", () => {
    it("salva os dados do usuário sem o token no localStorage", async () => {
      api.post.mockResolvedValue({
        data: {
          resposta: {
            usuario_id: 1,
            usuario_login: "admin",
            usuario_tipo: "adm",
            usuario_nome: "Admin",
            usuario_troca_senha: 0,
            usuario_caminho_foto: null,
          },
        },
      });

      await logar("admin", "123");

      expect(localStorage.getItem("usuario_id")).toBe("1");
      expect(localStorage.getItem("usuario_nome")).toBe("Admin");
      expect(localStorage.getItem("usuario_tipo")).toBe("adm");
      expect(localStorage.getItem("token")).toBeNull();
    });

    it("propaga erro de credenciais", async () => {
      api.post.mockRejectedValue({ status: 401, message: "Senha incorreta" });

      await expect(logar("admin", "errada")).rejects.toMatchObject({
        status: 401,
      });
    });
  });

  describe("deslogar", () => {
    it("chama o logout e limpa os dados do usuário", async () => {
      localStorage.setItem("usuario_id", "1");
      localStorage.setItem("usuario_nome", "Admin");
      api.post.mockResolvedValue({ data: { mensagem: "ok" } });

      await deslogar();

      expect(api.post).toHaveBeenCalledWith("/logout");
      expect(localStorage.getItem("usuario_id")).toBeNull();
      expect(localStorage.getItem("usuario_nome")).toBeNull();
    });

    it("limpa o storage mesmo se o logout falhar na rede", async () => {
      localStorage.setItem("usuario_id", "1");
      api.post.mockRejectedValue({ status: 503 });

      await deslogar();

      expect(localStorage.getItem("usuario_id")).toBeNull();
    });
  });
});
