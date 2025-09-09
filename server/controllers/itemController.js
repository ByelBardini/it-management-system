import { Anexo, Caracteristica, Item } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";
import sequelize from "../config/database.js";

export async function postItem(req, res) {
  try {
    const b = req.body;

    const item_empresa_id = b.item_empresa_id;
    const item_nome = b.item_nome;
    const item_tipo = b.item_tipo;
    const item_etiqueta = b.item_etiqueta;
    const item_num_serie = b.item_num_serie;
    const item_preco = Number(b.item_preco);
    const item_data_aquisicao = b.item_data_aquisicao;
    const item_em_uso = String(b.item_em_uso).toLowerCase() === "true";
    const item_ultima_manutencao = b.item_ultima_manutencao;
    const item_intervalo_manutencao = Number(b.item_intervalo_manutencao);

    let caracteristicas = [];
    if (b.caracteristicas) {
      try {
        caracteristicas = JSON.parse(b.caracteristicas);
      } catch {
        throw new ApiError.badRequest("Características inválidas");
      }
    }

    const faltando =
      !item_empresa_id ||
      !item_nome ||
      !item_tipo ||
      !item_etiqueta ||
      !item_num_serie ||
      Number.isNaN(item_preco) ||
      !item_data_aquisicao ||
      !item_ultima_manutencao ||
      Number.isNaN(item_intervalo_manutencao);

    if (faltando) {
      throw new ApiError.badRequest("Campos obrigatórios faltando");
    }

    const anexosArr = Array.isArray(req.anexos) ? req.anexos : [];

    await sequelize.transaction(async (t) => {
      const item = await Item.create(
        {
          item_empresa_id,
          item_nome,
          item_tipo,
          item_etiqueta,
          item_num_serie,
          item_preco,
          item_data_aquisicao,
          item_em_uso,
          item_ultima_manutencao,
          item_intervalo_manutencao,
        },
        { transaction: t }
      );

      for (const c of caracteristicas) {
        await Caracteristica.create(
          {
            caracteristica_item_id: item.item_id,
            caracteristica_nome: c.nome,
            caracteristica_valor: c.valor,
          },
          { transaction: t }
        );
      }

      for (const a of anexosArr) {
        await Anexo.create(
          {
            anexo_item_id: item.item_id,
            anexo_tipo: a.tipo,
            anexo_nome: a.nome,
            anexo_caminho: a.caminho,
          },
          { transaction: t }
        );
      }

      return res
        .status(201)
        .json({ message: "Item criado com sucesso", item_id: item.item_id });
    });
  } catch (err) {
    console.error("Sequelize message:", err.message);
    console.error(
      "MySQL sqlMessage:",
      err?.parent?.sqlMessage || err?.original?.sqlMessage
    );
    console.error("MySQL code:", err?.parent?.code || err?.original?.code);
    throw ApiError.internal("Erro ao criar item");
  }
}
