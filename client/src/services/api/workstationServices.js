import { api } from "../api.js";

export async function getWorkstation(id) {
  try {
    const response = await api.get(`/workstation/${id}`);

    return response.data;
  } catch (err) {
    console.error("Erro em getWorkstation:", err);
    throw err;
  }
}

export async function postWorkstation(
  id_empresa,
  id_setor,
  workstation_nome,
  workstation_anydesk,
  workstation_senha_anydesk
) {
  try {
    const response = await api.post("/workstation", {
      id_empresa,
      id_setor,
      workstation_nome,
      workstation_anydesk,
      workstation_senha_anydesk,
    });

    return response.data;
  } catch (err) {
    console.error("Erro em postWorkstation:", err);
    throw err;
  }
}

export async function deleteWorkstation(id) {
  try {
    const response = await api.delete(`/workstation/${id}`);

    return response.data;
  } catch (err) {
    console.error("Erro em deleteWorkstation:", err);
    throw err;
  }
}
