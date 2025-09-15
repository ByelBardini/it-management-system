import { Item, Senha } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";
import { Sequelize } from "sequelize";

export async function getDadosDashboard(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("O ID da empresa é obrigadtório");
  }

  const total = await Item.findOne({
    where: { item_empresa_id: id, item_ativo: 1 },
    attributes: [
      [Sequelize.fn("COUNT", Sequelize.col("item_id")), "total_ativos"],
    ],
    raw: true,
  });

  const equipamentos = await Item.findAll({
    where: { item_empresa_id: id, item_ativo: 1 },
    attributes: [
      "item_tipo",
      [Sequelize.fn("COUNT", Sequelize.col("item_id")), "quantidade"],
    ],
    group: ["item_tipo"],
  });

  const senhas = await Senha.findAll({
    where: { senha_empresa_id: id },
    attributes: ["senha_ultima_troca", "senha_tempo_troca"],
  });

  const manutencoes = await Item.findAll({
    where: { item_empresa_id: id, item_ativo: 1 },
    attributes: ["item_ultima_manutencao", "item_intervalo_manutencao"],
  });

  const workstations = await Item.findOne({
    attributes: [
      [
        Sequelize.literal(
          `SUM(CASE WHEN item_ativo = 1 AND item_em_uso = 1 AND item_workstation_id IS NULL THEN 1 ELSE 0 END)`
        ),
        "sem_workstation",
      ],

      [
        Sequelize.literal(
          `SUM(CASE WHEN item_ativo = 1 AND item_em_uso = 1 AND item_workstation_id IS NOT NULL THEN 1 ELSE 0 END)`
        ),
        "com_workstation",
      ],

      [
        Sequelize.literal(
          `SUM(CASE WHEN item_ativo = 1 AND item_em_uso = 0 THEN 1 ELSE 0 END)`
        ),
        "em_estoque",
      ],
    ],
    raw: true,
  });

  return res
    .status(200)
    .json({ total, equipamentos, senhas, manutencoes, workstations });
}
