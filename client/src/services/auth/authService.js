import { api } from "../api.js";

export async function logar(usuario_login, usuario_senha) {
  try {
    const { data } = await api.post("/login", { usuario_login, usuario_senha });
    const { token, resposta } = data;

    localStorage.setItem("token", token);
    localStorage.setItem("usuario_id", resposta.usuario_id);
    localStorage.setItem("usuario_login", resposta.usuario_login);
    localStorage.setItem("usuario_tipo", resposta.usuario_tipo);
    localStorage.setItem("usuario_nome", resposta.usuario_nome);
    localStorage.setItem("usuario_troca_senha", resposta.usuario_troca_senha);
    localStorage.setItem("usuario_caminho_foto", data.usuario_caminho_foto);

    return resposta;
  } catch (err) {
    if (err.response) {
      const data = err.response.data;
      const msg =
        (typeof data === "string" ? data : data?.error || data?.message) || "";
      if (msg) throw new Error(msg);

      if (err.response.status === 400)
        throw new Error("Preencha login e senha.");
      if (err.response.status === 401)
        throw new Error("Usuário ou senha incorretos.");
      if (err.response.status === 403)
        throw new Error("Usuário inativo ou sem permissão.");
      if (err.response.status === 404)
        throw new Error("Usuário não encontrado.");
      if (err.response.status === 500)
        throw new Error("Erro interno. Tente novamente.");
    }
    throw new Error("Falha de rede. Tente novamente.");
  }
}
