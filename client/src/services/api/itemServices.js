import { api } from "../api.js";

export async function getItens(id) {
  try {
    const response = await api.get(`/item/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro em getItens:", err);
    throw err;
  }
}

export async function getItensInativos(id) {
  try {
    const response = await api.get(`/item/inativos/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro em getItensInativos:", err);
    throw err;
  }
}

export async function getItensWorkstation(id) {
  try {
    const response = await api.get(`/item/workstation/${id}`);
    return response.data;
  } catch (err) {
    console.log("Erro em getItensWorkstation:", err);
    throw err;
  }
}

export async function getItemFull(id) {
  try {
    const response = await api.get(`/item/full/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro em getItemFull:", err);
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
    console.error("Erro em postItem:", err);
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
    console.error("Erro em putItem:", err);
    throw err;
  }
}

export async function removerWorkstation(id) {
  try {
    const response = await api.put(`/item/workstation/remover/${id}`);

    return response.data;
  } catch (err) {
    console.error("Erro em removerWorkstation", err);
    throw err;
  }
}

export async function inativaItem(id) {
  try {
    const response = await api.put(`/item/inativa/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro em inativaItem:", err);
    throw err;
  }
}
