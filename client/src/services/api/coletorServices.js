import { api } from "../api.js";

// Baixa o pacote ZIP do coletor (script + lançador .bat com token embutido).
// Resposta binária → responseType "blob".
export async function baixarColetor() {
  try {
    const response = await api.get("/item/coletar-desktop/download", {
      responseType: "blob",
    });
    return response.data;
  } catch (err) {
    console.error("Erro em baixarColetor:", err);
    throw err;
  }
}
