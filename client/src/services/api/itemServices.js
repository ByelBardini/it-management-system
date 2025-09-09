import { api } from "../api.js";

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
