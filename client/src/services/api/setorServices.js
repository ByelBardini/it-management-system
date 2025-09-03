import { api } from "../api.js";

export async function getSetores() {
  try {
    const response = await api.get("/setor");
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar setores:", err);
    throw err;
  }
}
