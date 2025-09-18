import { api } from "../api.js";

export async function getUsuarios() {
  try {
    const response = await api.get("/usuario/");
    return response.data;
  } catch (err) {
    console.error("Erro em getUsuarios:", err);
    throw err;
  }
}

export async function postUsuario(usuario_nome, usuario_tipo, usuario_login) {
  try {
    const response = await api.post("/usuario", {
      usuario_nome,
      usuario_tipo,
      usuario_login,
    });
    return response.data;
  } catch (err) {
    console.error("Erro em postUsuario:", err);
    throw err;
  }
}

export async function inativaUsuario(id) {
  try {
    const response = await api.put(`/usuario/inativa/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro em inativaUsuario:", err);
    throw err;
  }
}
