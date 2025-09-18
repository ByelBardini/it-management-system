import { api } from "../api.js";

export async function getUsuarios() {
  try {
    const response = await api.get("/usuario/");
    return response.data;
  } catch (err) {
    console.error("Erro em getUsuarios:", err);
    throw err;
  }
}
