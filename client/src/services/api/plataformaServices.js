import { api } from "../api.js";

export async function getPlataformas() {
  try {
    const response = await api.get("/plataforma");

    return response.data;
  } catch (err) {
    console.error("Erro em getPlataformas:", err);
    throw err;
  }
}

export async function postPlataforma(plataforma_nome) {
  try {
    const response = await api.post("/plataforma", {
      plataforma_nome,
    });
    return response.data;
  } catch (err) {
    console.error("Erro em postPlataforma:", err);
    throw err;
  }
}

export async function deletePlataforma(id) {
  try {
    const response = await api.delete(`/plataforma/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro em deletePlataforma:", err);
    throw err;
  }
}
