import { Empresa, Workstation, Setor } from "../models/index.js";

export async function getEmpresas(req, res) {
  const empresas = await Empresa.findAll({
    attributes: ["empresa_id", "empresa_nome"],
    order: [["empresa_nome", "ASC"]],
  });

  return res.status(200).json(empresas);
}

export async function getSetoresWorkstations(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("ID da empresa é obrigatório");
  }
  const setores = await Setor.findAll({
    attributes: ["setor_id", "setor_nome"],
    where: { setor_empresa_id: id },
    order: [["setor_nome", "ASC"]],
  });
  const workstations = await Workstation.findAll({
    attributes: ["workstation_id", "workstation_nome", "workstation_setor_id"],
    where: { workstation_empresa_id: id },
    order: [["workstation_nome", "ASC"]],
  });

  return res.status(200).json({ setores, workstations });
}
