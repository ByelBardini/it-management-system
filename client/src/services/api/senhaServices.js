import { api } from "../api.js";

export async function getSenhas(id) {
  try {
    const response = await api.get(`/senha/${id}`);

    return response.data;
  } catch (err) {
    console.error("Erro ao buscar senhas:", err);
    throw err;
  }
}

export async function getSenhaFull(id) {
  try {
    const response = await api.get(`/senha/full/${id}`);

    return response.data;
  } catch (err) {
    console.error("Erro ao buscar senha:", err);
    throw err;
  }
}

export async function postSenha(
  senha_empresa_id,
  senha_usuario_id,
  senha_plataforma_id,
  senha_nome,
  senha_usuario,
  senha,
  senha_tempo_troca
) {
  try {
    const response = await api.post("/senha", {
      senha_empresa_id,
      senha_usuario_id,
      senha_plataforma_id,
      senha_nome,
      senha_usuario,
      senha,
      senha_tempo_troca,
    });

    return response.data;
  } catch (err) {
    console.error("Erro ao cadastrar senha:", err);
    throw err;
  }
}
