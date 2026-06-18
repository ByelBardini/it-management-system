import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import { cadastrarUsuario } from "../../../controllers/usuarioController.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";

vi.mock("../../../models/index.js", async () => {
  const { createModelsMock } = await import("../helpers/sequelize-mock.js");
  return createModelsMock();
});

describe("cadastrarUsuario", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria conta coletor vinculada a uma empresa", async () => {
    db.Usuario.create.mockResolvedValue({ usuario_id: 9 });
    const req = mockReq({
      body: {
        usuario_nome: "Coleta Financeiro",
        usuario_login: "coleta.fin",
        usuario_tipo: "coletor",
        usuario_empresa_id: 3,
      },
    });
    const res = mockRes();

    await cadastrarUsuario(req, res);

    const [dados] = db.Usuario.create.mock.calls[0];
    expect(dados).toMatchObject({
      usuario_tipo: "coletor",
      usuario_empresa_id: 3,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("recusa 400 ao criar coletor sem empresa", async () => {
    const req = mockReq({
      body: {
        usuario_nome: "Coleta sem empresa",
        usuario_login: "coleta.x",
        usuario_tipo: "coletor",
      },
    });
    const res = mockRes();

    await expect(cadastrarUsuario(req, res)).rejects.toMatchObject({
      status: 400,
    });
    expect(db.Usuario.create).not.toHaveBeenCalled();
  });

  it("cria usuário comum sem empresa (empresa fica nula)", async () => {
    db.Usuario.create.mockResolvedValue({ usuario_id: 10 });
    const req = mockReq({
      body: {
        usuario_nome: "Fulano",
        usuario_login: "fulano",
        usuario_tipo: "usuario",
      },
    });
    const res = mockRes();

    await cadastrarUsuario(req, res);

    const [dados] = db.Usuario.create.mock.calls[0];
    expect(dados).toMatchObject({ usuario_empresa_id: null });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
