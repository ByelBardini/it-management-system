import { api } from "../api.js";

export async function getModelos(marcaId) {
  try {
    const response = await api.get(`/marca/${marcaId}/modelos`);
    return response.data;
  } catch (err) {
    console.error("Erro em getModelos:", err);
    throw err;
  }
}

export async function postModelo(modelo_marca_id, modelo_nome) {
  try {
    const response = await api.post("/modelo", { modelo_marca_id, modelo_nome });
    return response.data;
  } catch (err) {
    console.error("Erro em postModelo:", err);
    throw err;
  }
}
