import AtualizarSenha from "../components/perfil/TrocarSenha.jsx";
import Loading from "../components/default/Loading";
import Notificacao from "../components/default/Notificacao";
import EditarFuncionario from "../components/perfil/EditarUsuario.jsx";
import { useState } from "react";
import { Pencil, KeyRound, UserRound } from "lucide-react";

export default function Perfil() {
  const usuario = {
    nome: localStorage.getItem("usuario_nome"),
    login: localStorage.getItem("usuario_login"),
    tipo: localStorage.getItem("usuario_tipo"),
    fotoCaminho: localStorage.getItem("usuario_caminho_foto"),
  };

  const [trocaSenha, setTrocaSenha] = useState(false);
  const [editarPerfil, setEditarPerfil] = useState(false);

  const [notificacao, setNotificacao] = useState({
    show: false,
    tipo: "sucesso",
    titulo: "",
    mensagem: "",
  });
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {trocaSenha && (
        <AtualizarSenha
          setTrocaSenha={setTrocaSenha}
          setLoading={setLoading}
          setNotificacao={setNotificacao}
        />
      )}
      {editarPerfil && (
        <EditarFuncionario
          setEditarPerfil={setEditarPerfil}
          setLoading={setLoading}
          setNotificacao={setNotificacao}
        />
      )}
      {notificacao.show && (
        <Notificacao
          tipo={notificacao.tipo}
          titulo={notificacao.titulo}
          mensagem={notificacao.mensagem}
          onClick={() =>
            setNotificacao({
              show: false,
              tipo: "sucesso",
              titulo: "",
              mensagem: "",
            })
          }
        />
      )}
      {loading && <Loading />}
      <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-lg backdrop-blur-2xl overflow-hidden">
        <div className="flex items-center gap-6 p-6">
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl ring-2 ring-sky-500">
              {usuario.fotoCaminho ? (
                <img
                  className="h-full w-full object-cover rounded-full"
                  src={`${import.meta.env.VITE_API_BASE_URL}/imagem?path=${
                    usuario.fotoCaminho
                  }`}
                  alt="Foto do funcionário"
                  loading="lazy"
                />
              ) : (
                <UserRound
                  size={82}
                  className="text-white h-22 w-22 object-cover rounded-2xl"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-sm text-white/60">Nome</p>
              <p className="text-lg font-semibold text-white">{usuario.nome}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Login</p>
              <p className="text-sm text-white/80">{usuario.login}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Tipo</p>
              <p
                className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ${
                  usuario.tipo === "Admin"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {usuario.tipo}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4 bg-white/5">
          <button
            onClick={() => setEditarPerfil(true)}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm transition"
          >
            <Pencil size={16} />
            Editar Usuário
          </button>
          <button
            onClick={() => setTrocaSenha(true)}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition"
          >
            <KeyRound size={16} />
            Trocar Senha
          </button>
        </div>
      </div>
    </div>
  );
}
