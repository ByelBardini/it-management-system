import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";

vi.mock("../../../models/index.js", async () => {
  const { createModelsMock } = await import("../helpers/sequelize-mock.js");
  return createModelsMock();
});

// Evita depender do arquivo real do script; o conteúdo é irrelevante para o teste.
vi.mock("fs", () => ({
  default: { readFileSync: vi.fn(() => "TEMPLATE PS1 CONTENT") },
}));

const { baixarColetor } = await import(
  "../../../controllers/coletorController.js"
);
const { autenticarColetorToken } = await import(
  "../../../middlewares/autenticaToken.js"
);

describe("autenticarColetorToken", () => {
  beforeEach(() => vi.clearAllMocks());

  it("aceita token válido e injeta usuário + empresa", async () => {
    db.ColetorToken.findOne.mockResolvedValue({
      token_usuario_id: 5,
      token_empresa_id: 2,
      token_ativo: 1,
      token_expira_em: null,
    });
    db.Usuario.findByPk.mockResolvedValue({
      usuario_id: 5,
      usuario_tipo: "coletor",
      usuario_nome: "Coleta",
      usuario_ativo: 1,
    });
    const req = mockReq({
      headers: { authorization: "Bearer abc" },
      body: { item_empresa_id: 999 },
    });
    const next = vi.fn();

    await autenticarColetorToken(req, {}, next);

    expect(next).toHaveBeenCalled();
    expect(req.usuario).toMatchObject({ id: 5, tipo: "coletor" });
    expect(req.body.item_empresa_id).toBe(2);
  });

  it("recusa 401 quando não há token", async () => {
    const req = mockReq({ headers: {}, body: {} });

    await expect(
      autenticarColetorToken(req, {}, vi.fn())
    ).rejects.toMatchObject({ status: 401 });
  });

  it("recusa 401 quando o token não existe ou está revogado", async () => {
    db.ColetorToken.findOne.mockResolvedValue(null);
    const req = mockReq({ headers: { authorization: "Bearer abc" }, body: {} });

    await expect(
      autenticarColetorToken(req, {}, vi.fn())
    ).rejects.toMatchObject({ status: 401 });
  });

  it("recusa 401 quando o token está expirado", async () => {
    db.ColetorToken.findOne.mockResolvedValue({
      token_usuario_id: 5,
      token_empresa_id: 2,
      token_ativo: 1,
      token_expira_em: "2000-01-01T00:00:00Z",
    });
    const req = mockReq({ headers: { authorization: "Bearer abc" }, body: {} });

    await expect(
      autenticarColetorToken(req, {}, vi.fn())
    ).rejects.toMatchObject({ status: 401 });
  });

  it("recusa 401 quando a conta de coleta está inativa", async () => {
    db.ColetorToken.findOne.mockResolvedValue({
      token_usuario_id: 5,
      token_empresa_id: 2,
      token_ativo: 1,
      token_expira_em: null,
    });
    db.Usuario.findByPk.mockResolvedValue({ usuario_id: 5, usuario_ativo: 0 });
    const req = mockReq({ headers: { authorization: "Bearer abc" }, body: {} });

    await expect(
      autenticarColetorToken(req, {}, vi.fn())
    ).rejects.toMatchObject({ status: 401 });
  });
});

describe("baixarColetor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.COLETOR_API_BASE = "https://infrahub.exemplo/api";
  });

  it("gera token, revoga anteriores e responde o ZIP", async () => {
    db.Usuario.findByPk.mockResolvedValue({
      usuario_id: 5,
      usuario_empresa_id: 2,
    });
    db.ColetorToken.update.mockResolvedValue([1]);
    db.ColetorToken.create.mockResolvedValue({ token_id: 1 });

    const req = mockReq({ usuario: { id: 5, tipo: "coletor", nome: "Coleta" } });
    const res = mockRes();

    await baixarColetor(req, res);

    // revoga os tokens ativos do usuário antes de criar o novo
    expect(db.ColetorToken.update).toHaveBeenCalled();
    const [valores, opcoes] = db.ColetorToken.update.mock.calls[0];
    expect(valores).toMatchObject({ token_ativo: 0 });
    expect(opcoes.where).toMatchObject({ token_usuario_id: 5, token_ativo: 1 });

    const [dados, opcoesCreate] = db.ColetorToken.create.mock.calls[0];
    expect(dados).toMatchObject({ token_usuario_id: 5, token_empresa_id: 2 });
    expect(typeof dados.token_hash).toBe("string");
    expect(opcoesCreate).toMatchObject({ usuarioId: 5 });

    expect(res.set).toHaveBeenCalledWith(
      "Content-Disposition",
      expect.stringContaining(".zip")
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it("recusa 400 quando a conta de coleta não tem empresa vinculada", async () => {
    db.Usuario.findByPk.mockResolvedValue({
      usuario_id: 5,
      usuario_empresa_id: null,
    });

    const req = mockReq({ usuario: { id: 5, tipo: "coletor" } });
    const res = mockRes();

    await expect(baixarColetor(req, res)).rejects.toMatchObject({ status: 400 });
    expect(db.ColetorToken.create).not.toHaveBeenCalled();
  });
});
