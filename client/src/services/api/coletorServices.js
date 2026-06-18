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
    // Como pedimos responseType "blob", um erro vem com o corpo JSON dentro de
    // um Blob — o tratarErro padrão não enxerga a mensagem. Convertemos de volta
    // para que o usuário veja o motivo real (ex.: empresa não vinculada).
    const data = err?.response?.data;
    if (data instanceof Blob && data.type?.includes("json")) {
      try {
        err.response.data = JSON.parse(await data.text());
      } catch {
        // corpo não-JSON: mantém o erro original
      }
    }
    console.error("Erro em baixarColetor:", err);
    throw err;
  }
}
