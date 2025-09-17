import { api } from "../api.js";

export async function getSetores(id) {
  try {
    const response = await api.get(`/setor/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro em getSetores:", err);
    throw err;
  }
}

export async function postSetor(setor_nome, setor_empresa_id) {
  try {
    const response = await api.post("/setor", {
      setor_empresa_id,
      setor_nome,
    });
    return response.data;
  } catch (err) {
    console.error("Erro em postSetor:", err);
    throw err;
  }
}

export async function deleteSetor(id) {
  try {
    const response = await api.delete(`/setor/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro em deleteSetor:", err);
    throw err;
  }
}
