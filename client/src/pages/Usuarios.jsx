/* eslint-disable react-hooks/exhaustive-deps */
import Loading from "../components/default/Loading";
import Notificacao from "../components/default/Notificacao";
import ModalConfirmacao from "../components/default/ModalConfirmacao";
import TabelaUsuario from "../components/usuarios/TabelaUsuario.jsx";
import ModalAdicionaUsuario from "../components/usuarios/ModalAdicionaUsuario.jsx";
import ExibeUsuario from "../components/usuarios/ExibeUsuario.jsx";
import { useNavigate, NavLink } from "react-router-dom";
import { Undo2, UserPlus } from "lucide-react";
import { getUsuarios } from "../services/api/usuariosServices.js";
import { useEffect, useState } from "react";
import { tratarErro } from "../components/default/funcoes.js";

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState({});

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

  const [adicionaUsuario, setAdicionaUsuario] = useState(false);
  const [exibeFuncionario, setExibeUsuario] = useState(false);

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
      {adicionaUsuario && (
        <ModalAdicionaUsuario
          setNotificacao={setNotificacao}
          setAdicionaUsuario={setAdicionaUsuario}
          setLoading={setLoading}
          buscaUsuarios={buscaUsuarios}
        />
      )}
      {exibeFuncionario && (
        <ExibeUsuario
          usuario={usuarioSelecionado}
          setExibeUsuario={setExibeUsuario}
          setNotificacao={setNotificacao}
          setConfirmacao={setConfirmacao}
          setLoading={setLoading}
          buscaUsuarios={buscaUsuarios}
        />
      )}
      <div className="w-full max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-white">
            Listagem de usuários
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAdicionaUsuario(true)}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg 
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

        <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 overflow-hidden">
          <TabelaUsuario
            usuarios={usuarios}
            setExibeUsuario={setExibeUsuario}
            setUsuarioSelecionado={setUsuarioSelecionado}
          />
        </div>
      </div>
    </div>
  );
}
