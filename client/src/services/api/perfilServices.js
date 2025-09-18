import { api } from "../api.js";

export async function trocarSenha(id, senhaAtual, nova_senha) {
  try {
    const response = await api.put(`/perfil/troca/${id}`, {
      senhaAtual,
      nova_senha,
    });

    return response.data;
  } catch (err) {
    console.error("Erro em trocarSenha:", err);
    throw err;
  }
}

export async function primeiroLogin(id, nova_senha) {
  try {
    const response = await api.put(`/perfil/primeira/${id}`, {
      nova_senha,
    });

    return response.data;
  } catch (err) {
    console.error("Erro primeiroLogin:", err);
    throw err;
  }
}

export async function putPerfil(id, nome_usuario, fotoFile) {
  try {
    const fd = new FormData();
    fd.append("nome_usuario", nome_usuario);

    if (fotoFile) {
      fd.append("foto", fotoFile);
    }

    const { data } = await api.put(`/perfil/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    localStorage.setItem("usuario_caminho_foto", data.usuario_caminho_foto);
    localStorage.setItem("usuario_nome", data.usuario_nome);

    window.location.reload();

    return data;
  } catch (err) {
    console.error("Erro em putPerfil:", err);
    throw err;
  }
}
