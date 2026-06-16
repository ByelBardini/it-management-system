import { describe, it, expect } from "vitest";
import { pendentes } from "../../../db/pendentes.js";

// Função pura: dado o conjunto de arquivos de migration em disco e o conjunto
// já registrado na tabela de controle, retorna os nomes ainda não aplicados,
// em ordem lexicográfica. Sem Sequelize — nada a mockar.
describe("pendentes", () => {
  it("retorna as migrations ainda não aplicadas, em ordem", () => {
    const arquivos = ["0001_init.sql", "0002_x.sql"];
    const aplicadas = ["0001_init.sql"];

    const resultado = pendentes(arquivos, aplicadas);

    expect(resultado).toEqual(["0002_x.sql"]);
  });

  it("retorna todas quando nada foi aplicado", () => {
    const arquivos = ["0002_x.sql", "0001_init.sql"];
    const aplicadas = [];

    const resultado = pendentes(arquivos, aplicadas);

    expect(resultado).toEqual(["0001_init.sql", "0002_x.sql"]);
  });

  it("retorna vazio quando tudo já foi aplicado", () => {
    const arquivos = ["0001_init.sql"];
    const aplicadas = ["0001_init.sql"];

    const resultado = pendentes(arquivos, aplicadas);

    expect(resultado).toEqual([]);
  });

  it("ignora aplicadas que não existem mais como arquivo", () => {
    const arquivos = ["0002_x.sql"];
    const aplicadas = ["0001_init.sql"];

    const resultado = pendentes(arquivos, aplicadas);

    expect(resultado).toEqual(["0002_x.sql"]);
  });
});
