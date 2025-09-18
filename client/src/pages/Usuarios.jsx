/* eslint-disable react-hooks/exhaustive-deps */
import Loading from "../components/default/Loading";
import Notificacao from "../components/default/Notificacao";
import ModalConfirmacao from "../components/default/ModalConfirmacao";
import { useNavigate, NavLink } from "react-router-dom";
import { Undo2, UserPlus, Pencil } from "lucide-react";
import { getUsuarios } from "../services/api/usuariosServices.js";
import { useEffect, useState } from "react";
import { tratarErro } from "../components/default/funcoes.js";

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);

  const [notificacao, setNotificacao] = useState({
    show: false,
    tipo: "sucesso",
    titulo: "",
    mensagem: "",
  });
  const [confirmacao, setConfirmacao] = useState({
    show: false,
    texto: "",
    onSim: null,
  });
  const [loading, setLoading] = useState(false);

  async function buscaUsuarios() {
    setLoading(true);
    try {
      const usuarios = await getUsuarios();
      setLoading(false);

      setUsuarios(usuarios);
    } catch (err) {
      setLoading(false);
      tratarErro(setNotificacao, err, navigate);
    }
  }

  useEffect(() => {
    buscaUsuarios();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0A1633] text-white overflow-x-hidden">
      {confirmacao.show && (
        <ModalConfirmacao
          texto={confirmacao.texto}
          onNao={() => setConfirmacao({ show: false, texto: "", onSim: null })}
          onSim={confirmacao.onSim}
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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(59,130,246,0.22),transparent)]" />
        <div
          className="absolute inset-0 opacity-40
          [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]
          [background-size:36px_36px]"
        />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-white">
            Listagem de usuários
          </h1>
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg 
                         bg-blue-600/80 hover:bg-blue-500 transition text-sm font-medium"
            >
              <UserPlus className="h-4 w-4" />
              Novo usuário
            </button>
            <NavLink
              to={"/empresas"}
              className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-lg
                         bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
              aria-label="Voltar"
              title="Voltar"
            >
              <Undo2 className="h-5 w-5" />
            </NavLink>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/10 text-white/80 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Login</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                return (
                  <tr className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">{usuario.usuario_nome}</td>
                    <td className="px-6 py-4">{usuario.usuario_login}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          usuario.usuario_tipo == "adm"
                            ? "bg-purple-500/20 text-purple-400 text-xs"
                            : "bg-blue-500/20 text-blue-400 text-xs"
                        }`}
                      >
                        {usuario.usuario_tipo == "adm" ? "Admin" : "Usuário"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          usuario.usuario_ativo == 1
                            ? "bg-green-500/20 text-green-400 text-xs"
                            : "bg-red-500/20 text-red-400 text-xs"
                        }`}
                      >
                        {usuario.usuario_ativo == 1 ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                        title="Editar usuário"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
