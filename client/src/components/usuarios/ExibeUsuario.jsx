/* eslint-disable react-hooks/exhaustive-deps */
import { X, UserX, UserCheck, KeyRound, UserRound } from "lucide-react";
import {
  inativaUsuario,
  resetarSenha,
} from "../../services/api/usuariosServices.js";
import { tratarErro } from "../default/funcoes.js";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ExibeUsuario({
  setExibeUsuario,
  usuario,
  setNotificacao,
  setConfirmacao,
  setLoading,
  buscaUsuarios,
}) {
  const navigate = useNavigate();

  async function inativar() {
    setConfirmacao({
      show: false,
      texto: "",
      onSim: null,
    });
    if (usuario.usuario_id == localStorage.getItem("usuario_id")) {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Impossível Inativar",
        mensagem: "Você não pode inativar seu próprio usuário",
      });
      return;
    }
    setLoading(true);
    try {
      await inativaUsuario(usuario.usuario_id);
      setLoading(false);

      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: `Usuário ${
          usuario.usuario_ativo == 1 ? "inativado" : "ativado"
        } com sucesso`,
        mensagem: "A operação foi realizada com sucesso, e já foi atualizada",
      });
      await buscaUsuarios();
      setTimeout(() => {
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
        setExibeUsuario(false);
      }, 700);
    } catch (err) {
      setLoading(false);
      tratarErro(setNotificacao, err, navigate);
    }
  }

  async function resetar() {
    setConfirmacao({
      show: false,
      texto: "",
      onSim: null,
    });
    setLoading(true);
    try {
      await resetarSenha(usuario.usuario_id);
      setLoading(false);

      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Senha resetada com sucesso",
        mensagem: `A senha foi resetada com sucesso, retornado ao padrão "12345"`,
      });
      await buscaUsuarios();
      setTimeout(() => {
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
        setExibeUsuario(false);
      }, 700);
    } catch (err) {
      setLoading(false);
      tratarErro(setNotificacao, err, navigate);
    }
  }

  useEffect(() => {
    function onKeyDown(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") setExibeUsuario(false);
    }
    window.addEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      onClick={() => setExibeUsuario(false)}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6"
      >
        <div className="flex justify-between items-center border-b border-white/20 pb-3">
          <h2 className="text-lg font-semibold text-white">
            Detalhes do Usuário
          </h2>
          <button
            onClick={() => setExibeUsuario(false)}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X />
          </button>
        </div>

        <div className="flex justify-center mt-2">
          {usuario?.usuario_caminho_foto ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/imagem?path=${
                usuario.usuario_caminho_foto
              }`}
              alt="Foto do usuário"
              className="h-24 w-24 rounded-full object-cover ring-2 ring-white/20"
              loading="lazy"
            />
          ) : (
            <div className="h-24 w-24 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-500 ring-2 ring-white/20">
              <UserRound className="h-12 w-12 text-white/80" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={usuario?.usuario_nome || ""}
              disabled
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white/70 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Usuário</label>
            <input
              type="text"
              value={usuario?.usuario_login || ""}
              disabled
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white/70 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Tipo</label>
            <input
              type="text"
              value={
                usuario?.usuario_tipo == "adm" ? "Administrador" : "Usuário"
              }
              disabled
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white/70 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10 gap-2">
          <button
            onClick={() =>
              setConfirmacao({
                show: true,
                texto: `Você tem certeza que deseja ${
                  usuario.usuario_ativo == 1 ? "inativar" : "ativar"
                } o usuário?`,
                onSim: inativar,
              })
            }
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white font-medium ${
              usuario.usuario_ativo == 1
                ? "bg-rose-600 hover:bg-rose-500"
                : "bg-green-600 hover:bg-green-500"
            }  transition cursor-pointer`}
          >
            {usuario.usuario_ativo == 1 ? (
              <UserX className="h-4 w-4" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}

            {usuario.usuario_ativo == 1 ? "inativar" : "ativar"}
          </button>
          <button
            onClick={() =>
              setConfirmacao({
                show: true,
                texto:
                  "Você tem certeza que deseja resetar a senha deste usuário?",
                onSim: resetar,
              })
            }
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white font-medium bg-sky-600 hover:bg-sky-500 transition"
          >
            <KeyRound className="h-4 w-4" />
            Resetar Senha
          </button>
        </div>
      </div>
    </div>
  );
}
