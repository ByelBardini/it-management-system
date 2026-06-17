import { api } from "../api.js";

export async function getSubtipos(tipo) {
  try {
    const response = await api.get(`/subtipo?tipo=${encodeURIComponent(tipo)}`);
    return response.data;
  } catch (err) {
    console.error("Erro em getSubtipos:", err);
    throw err;
  }
}

export async function postSubtipo(subtipo_tipo, subtipo_nome) {
  try {
    const response = await api.post("/subtipo", { subtipo_tipo, subtipo_nome });
    return response.data;
  } catch (err) {
    console.error("Erro em postSubtipo:", err);
    throw err;
  }
}
