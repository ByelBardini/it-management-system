import { api } from "../api.js";

export async function getSenhas(id) {
  try {
    const response = await api.get(`/senha/${id}`);

    return response.data;
  } catch (err) {
    console.error("Erro ao buscar senhas:", err);
    throw err;
  }
}
