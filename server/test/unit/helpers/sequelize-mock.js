import { vi } from "vitest";

// Mock centralizado dos models Sequelize.
// NUNCA recrie um mock de model inline no teste — use createModelsMock().
//
// Como os controllers importam os models direto de "../models/index.js"
// (não há injeção de dependência como no Nest), o teste mocka o módulo
// inteiro e configura os retornos pelo objeto importado:
//
//   import * as db from "../../../models/index.js";
//   vi.mock("../../../models/index.js", async () => {
//     const { createModelsMock } = await import("../helpers/sequelize-mock.js");
//     return createModelsMock();
//   });
//   ...
//   db.Setor.findAll.mockResolvedValue([{ setor_id: 1 }]);

// Mesmos nomes exportados por server/models/index.js
export const MODEL_NAMES = [
  "Anexo",
  "Caracteristica",
  "Empresa",
  "Item",
  "Senha",
  "Setor",
  "Usuario",
  "Workstation",
  "Plataforma",
  "Log",
  "Peca",
];

// Métodos estáticos de model usados pelos controllers
const STATIC_METHODS = [
  "findAll",
  "findByPk",
  "findOne",
  "findAndCountAll",
  "findOrCreate",
  "create",
  "bulkCreate",
  "update",
  "destroy",
  "count",
  "max",
  "min",
  "sum",
];

export function createModelMock() {
  const model = {};
  for (const method of STATIC_METHODS) model[method] = vi.fn();
  return model;
}

// Retorna { Anexo, Caracteristica, Item, ... } — pronto para vi.mock do index.
export function createModelsMock() {
  const mock = {};
  for (const name of MODEL_NAMES) mock[name] = createModelMock();
  return mock;
}

// Instância "viva" de um registro retornado por findByPk/findOne, com os
// métodos de instância que os controllers chamam (save, destroy, etc.).
export function mockInstance(data = {}) {
  return {
    ...data,
    save: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn().mockResolvedValue(undefined),
    toJSON: vi.fn(() => ({ ...data })),
    get: vi.fn((key) => (key ? data[key] : { ...data })),
    set: vi.fn(),
  };
}

// Mock do default export de config/database.js.
// O callback de transação recebe um objeto "tx" fictício.
//   vi.mock("../../../config/database.js", async () => {
//     const { createSequelizeMock } = await import("../helpers/sequelize-mock.js");
//     return createSequelizeMock();
//   });
export function createSequelizeMock() {
  const tx = {
    LOCK: {},
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
  };
  return {
    default: {
      // Suporta as três formas do Sequelize:
      //   transaction(cb), transaction(options, cb) e transaction() (unmanaged).
      transaction: vi.fn(async (...args) => {
        const cb = args.find((a) => typeof a === "function");
        if (cb) return cb(tx);
        return tx;
      }),
    },
  };
}
