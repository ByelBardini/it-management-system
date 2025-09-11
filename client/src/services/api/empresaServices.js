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

export async function getSetoresWorkstations(id) {
  try {
    const response = await api.get(`/empresa/setores-workstations/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro ao  buscar dados:", err);
    throw err;
  }
}
