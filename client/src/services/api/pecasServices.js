import { api } from "../api.js";

export async function postPeca(
  id_empresa,
  tipo,
  nome,
  preco,
  data_aquisicao,
  numSerie
) {
  try {
    const response = await api.post("/pecas", {
      id_empresa,
      tipo,
      nome,
      preco,
      data_aquisicao,
      numSerie,
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
    console.error("Erro em getPecasAtivas:", err);
    throw err;
  }
}

export async function getPecasInativas(id) {
  try {
    const response = await api.get(`/pecas/inativas/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro em getPecasInativas:", err);
    throw err;
  }
}

export async function inativarPeca(id) {
  try {
    const response = await api.put(`/pecas/inativar/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro em inativarPeca:", err);
    throw err;
  }
}
