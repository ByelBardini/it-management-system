import { api } from "../api.js";

export async function postPeca(
  id_empresa,
  tipo,
  preco,
  data_aquisicao,
  numSerie,
  marca_id,
  modelo_id
) {
  try {
    const response = await api.post("/pecas", {
      id_empresa,
      tipo,
      preco,
      data_aquisicao,
      numSerie,
      marca_id,
      modelo_id,
    });
    return response.data;
  } catch (err) {
    console.error("Erro em postPeca:", err);
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
