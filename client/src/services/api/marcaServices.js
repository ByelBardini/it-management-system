import { api } from "../api.js";

export async function getMarcas(dominio, tipo, subtipo = "") {
  try {
    const response = await api.get(
      `/marca?dominio=${encodeURIComponent(dominio)}&tipo=${encodeURIComponent(
        tipo
      )}&subtipo=${encodeURIComponent(subtipo)}`
    );
    return response.data;
  } catch (err) {
    console.error("Erro em getMarcas:", err);
    throw err;
  }
}

export async function postMarca(
  marca_nome,
  marca_dominio,
  marca_tipo,
  marca_subtipo = ""
) {
  try {
    const response = await api.post("/marca", {
      marca_nome,
      marca_dominio,
      marca_tipo,
      marca_subtipo,
    });
    return response.data;
  } catch (err) {
    console.error("Erro em postMarca:", err);
    throw err;
  }
}
