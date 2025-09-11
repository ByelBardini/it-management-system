import { api } from "../api.js";

export async function postItem(fd) {
  try {
    const response = await api.post("/item", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (err) {
    console.error("Erro ao adicionar item:", err);
    throw err;
  }
}

export async function getItens(id) {
  try {
    const response = await api.get(`/item/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro ao adicionar item:", err);
    throw err;
  }
}

export async function getItemFull(id) {
  try {
    const response = await api.get(`/item/full/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro ao adicionar item:", err);
    throw err;
  }
}

export async function putItem(
  id,
  item_nome,
  item_setor_id,
  item_workstation_id,
  item_em_uso,
  caracteristicas
) {
  try {
    const response = await api.put(`/item/${id}`, {
      item_nome,
      item_setor_id,
      item_workstation_id,
      item_em_uso,
      caracteristicas,
    });
    return response.data;
  } catch (err) {
    console.error("Erro ao adicionar item:", err);
    throw err;
  }
}
