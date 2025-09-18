import { api } from "../api.js";

export async function logar(usuario_login, usuario_senha) {
  try {
    const { data } = await api.post("/login", { usuario_login, usuario_senha });
    const { token, resposta } = data;

    console.log(data);

    localStorage.setItem("token", token);
    localStorage.setItem("usuario_id", resposta.usuario_id);
    localStorage.setItem("usuario_login", resposta.usuario_login);
    localStorage.setItem("usuario_tipo", resposta.usuario_tipo);
    localStorage.setItem("usuario_nome", resposta.usuario_nome);
    localStorage.setItem("usuario_troca_senha", resposta.usuario_troca_senha);
    if (resposta.usuario_caminho_foto != undefined) {
      localStorage.setItem(
        "usuario_caminho_foto",
        resposta.usuario_caminho_foto
      );
    }
    console.log(resposta.usuario_caminho_foto);

    return resposta;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
