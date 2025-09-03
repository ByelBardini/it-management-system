import { api } from "../api.js";

export async function getEmpresas() {
  try {
    const response = await api.get("/empresa");
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar empresas:", err);
    throw err;
  }
}
