import { api } from "../api.js";

export async function getManutencoes(id) {
  try {
    const response = await api.get(`/manutencao/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar itens:", err);
    throw err;
  }
}
