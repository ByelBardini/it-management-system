import { api } from "../api.js";

export async function getDashboard(id) {
  try {
    const response = await api.get(`/dashboard/${id}`);

    return response.data;
  } catch (err) {
    console.error("Erro em getDashboard:", err);
    throw err;
  }
}
