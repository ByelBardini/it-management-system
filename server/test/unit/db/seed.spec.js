import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import { semearSeVazio, semear } from "../../../db/seed.js";

// O seed usa os models (findOrCreate/count) + bcrypt.hashSync. Mockamos o módulo
// de models inteiro e o bcrypt; nada toca o banco. O config/database.js é mockado
// só porque seed.js o importa no topo (a app não é usada nestes testes).
vi.mock("../../../models/index.js", async () => {
  const { createModelsMock } = await import("../helpers/sequelize-mock.js");
  return createModelsMock();
});

vi.mock("../../../config/database.js", async () => {
  const { createSequelizeMock } = await import("../helpers/sequelize-mock.js");
  return createSequelizeMock();
});

vi.mock("bcrypt", () => ({
  default: { hashSync: vi.fn(() => "hash") },
}));

// Faz os findOrCreate devolverem [instância] no formato que o seed espera.
function prepararSeedFeliz() {
  db.Usuario.findOrCreate.mockResolvedValue([{ usuario_id: 7 }]);
  db.Empresa.findOrCreate.mockResolvedValue([{ empresa_id: 2 }]);
  db.Plataforma.findOrCreate.mockResolvedValue([{ plataforma_id: 1 }]);
  db.Setor.findOrCreate.mockResolvedValue([{ setor_id: 1 }]);
}

describe("seed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("semearSeVazio", () => {
    it("semeia quando o banco está vazio (sem usuários nem empresas)", async () => {
      db.Usuario.count.mockResolvedValue(0);
      db.Empresa.count.mockResolvedValue(0);
      prepararSeedFeliz();

      const resultado = await semearSeVazio();

      expect(resultado).toBe(true);
      expect(db.Usuario.findOrCreate).toHaveBeenCalledTimes(1);
      expect(db.Empresa.findOrCreate).toHaveBeenCalledTimes(1);
    });

    it("não semeia quando já existem usuários", async () => {
      db.Usuario.count.mockResolvedValue(2);
      db.Empresa.count.mockResolvedValue(0);

      const resultado = await semearSeVazio();

      expect(resultado).toBe(false);
      expect(db.Usuario.findOrCreate).not.toHaveBeenCalled();
      expect(db.Empresa.findOrCreate).not.toHaveBeenCalled();
    });

    it("não semeia quando há empresa mas nenhum usuário", async () => {
      db.Usuario.count.mockResolvedValue(0);
      db.Empresa.count.mockResolvedValue(1);

      const resultado = await semearSeVazio();

      expect(resultado).toBe(false);
      expect(db.Usuario.findOrCreate).not.toHaveBeenCalled();
    });

    it("propaga o erro quando a contagem falha e não semeia", async () => {
      db.Usuario.count.mockRejectedValue(new Error("db down"));

      await expect(semearSeVazio()).rejects.toThrow("db down");
      expect(db.Usuario.findOrCreate).not.toHaveBeenCalled();
    });
  });

  describe("semear", () => {
    it("cria o admin primeiro e repassa o usuarioId às entidades com hook de auditoria", async () => {
      prepararSeedFeliz();

      await semear();

      expect(db.Plataforma.findOrCreate).toHaveBeenCalledWith(
        expect.objectContaining({ usuarioId: 7 })
      );
      expect(db.Setor.findOrCreate).toHaveBeenCalledWith(
        expect.objectContaining({ usuarioId: 7 })
      );
    });
  });
});
