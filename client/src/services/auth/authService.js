import { api } from "../api.js";

// Chaves de sessão no localStorage. O token NÃO entra aqui: a sessão agora vive
// num cookie httpOnly (inacessível ao JS). Aqui só ficam dados de UI.
const CHAVES_SESSAO = [
  "token", // legado: limpa resquícios de versões antigas
  "usuario_id",
  "usuario_login",
  "usuario_tipo",
  "usuario_nome",
  "usuario_troca_senha",
  "usuario_caminho_foto",
];

export async function logar(usuario_login, usuario_senha) {
  try {
    const { data } = await api.post("/login", { usuario_login, usuario_senha });
    const { resposta } = data;

    localStorage.setItem("usuario_id", resposta.usuario_id);
    localStorage.setItem("usuario_login", resposta.usuario_login);
    localStorage.setItem("usuario_tipo", resposta.usuario_tipo);
    localStorage.setItem("usuario_nome", resposta.usuario_nome);
    localStorage.setItem("usuario_troca_senha", resposta.usuario_troca_senha);
    if (resposta.usuario_caminho_foto != undefined) {
      localStorage.setItem("usuario_caminho_foto", resposta.usuario_caminho_foto);
    }

    return resposta;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function deslogar() {
  // Encerra a sessão no servidor (limpa o cookie). Mesmo se a rede falhar,
  // limpamos os dados locais para não deixar o usuário num estado ambíguo.
  try {
    await api.post("/logout");
  } catch (err) {
    console.error("Erro ao deslogar no servidor:", err);
  } finally {
    CHAVES_SESSAO.forEach((chave) => localStorage.removeItem(chave));
  }
}
