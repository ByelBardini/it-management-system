import { api } from "../api.js";

export async function getItens(id) {
  try {
    const response = await api.get(`/item/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro ao adicionar item:", err);
    throw err;
  }
}

export async function getItensInativos(id) {
  try {
    const response = await api.get(`/item/inativos/${id}`);
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

export async function putItem(id, fd) {
  try {
    const response = await api.put(`/item/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    console.error("Erro ao adicionar item:", err);
    throw err;
  }
}

export async function inativaItem(id) {
  try {
    const response = await api.put(`/item/inativa/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro ao inativar item:", err);
    throw err;
  }
}
