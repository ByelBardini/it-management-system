import { api } from "../api.js";

export async function postPeca(id_empresa, tipo, nome, preco, data_aquisicao) {
  try {
    const response = await api.post("/pecas", {
      id_empresa,
      tipo,
      nome,
      preco,
      data_aquisicao,
    });
    return response.data;
  } catch (err) {
    console.error("Erro em trocarSenha:", err);
    throw err;
  }
}

export async function getPecasAtivas(id) {
  try {
    const response = await api.get(`/pecas/ativas/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro em getPecas:", err);
    throw err;
  }
}
