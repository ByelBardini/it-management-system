import { api } from "../api.js";

export async function trocarSenha(id, senhaAtual, nova_senha) {
  try {
    const response = await api.put(`/perfil/troca/${id}`, {
      senhaAtual,
      nova_senha,
    });

    return response.data;
  } catch (err) {
    console.error("Erro ao trocar senha:", err);
    throw err;
  }
}
