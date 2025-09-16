import { Workstation, Setor } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";

export async function getWorkstation(req, res) {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest("Obrigatório Id Empresa");
  }

  const workstation = await Workstation.findAll({
    attributes: ["workstation_id", "workstation_nome"],
    where: { workstation_empresa_id: id },
    order: [["workstation_nome", "ASC"]],
    include: [
      {
        model: Setor,
        as: "setor",
        attributes: ["setor_id", "setor_nome"],
      },
    ],
  });
  return res.status(200).json(workstation);
}

export async function postWorkstation(req, res) {
  const { id_empresa, id_setor, workstation_nome } = req.body;

  if (!id_empresa || !id_setor || !workstation_nome) {
    throw ApiError.badRequest("Todos os dados são necessários");
  }

  await Workstation.create({
    workstation_empresa_id: id_empresa,
    workstation_setor_id: id_setor,
    workstation_nome: workstation_nome,
  });

  return res.status(201).json({ message: "Workstation criada com sucesso" });
}

export async function deleteWorkstation(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("O ID do workstation é obrigatório");
  }

  const workstation = await Workstation.findByPk(id);

  await workstation.destroy();

  return res.status(200).json({ message: "Workstation deletada com sucesso!" });
}
