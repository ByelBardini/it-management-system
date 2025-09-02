import { api } from "../api.js";

export async function getEmpresas() {
  try {
    const response = await api.get("/empresas");
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar cidade:", err);
    throw err;
  }
}
