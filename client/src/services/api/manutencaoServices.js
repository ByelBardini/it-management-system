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

export async function realizarManutencao(id) {
  try {
    const response = await api.put(`/manutencao/realizar/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro ao atualizar item:", err);
    throw err;
  }
}

export async function putManutencao(id, novo_intervalo) {
  try {
    const response = await api.put(`/manutencao/${id}`, { novo_intervalo });
    return response.data;
  } catch (err) {
    console.error("Erro ao editar item:", err);
    throw err;
  }
}
