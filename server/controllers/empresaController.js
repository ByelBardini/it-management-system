import { json } from "sequelize";
import { Empresa } from "../models/index.js";

export async function getEmpresas(req, res) {
  const empresas = await Empresa.findAll({
    attributes: ["empresa_id", "empresa_nome"],
    order: [["empresa_nome", "ASC"]],
  });

  return res.status(200).json(empresas);
}
