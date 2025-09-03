import { api } from "../api.js";

export async function getWorkstation(id) {
  try {
    const response = await api.get(`/workstation/${id}`);

    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
