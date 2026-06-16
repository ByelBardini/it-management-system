import { vi } from "vitest";

// req falso para chamar controllers diretamente como funções.
// Por padrão já vem um usuário "adm" autenticado (req.usuario), como o
// middleware autenticaToken faria.
export function mockReq(overrides = {}) {
  return {
    params: {},
    query: {},
    body: {},
    headers: {},
    usuario: { id: 1, tipo: "adm", nome: "Teste" },
    anexos: [],
    ...overrides,
  };
}

// res falso encadeável: res.status(200).json(...) funciona e fica registrado.
export function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.send = vi.fn(() => res);
  res.end = vi.fn(() => res);
  res.set = vi.fn(() => res);
  res.download = vi.fn(() => res);
  res.cookie = vi.fn(() => res);
  res.clearCookie = vi.fn(() => res);
  return res;
}
