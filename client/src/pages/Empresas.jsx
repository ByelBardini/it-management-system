/* eslint-disable react-hooks/exhaustive-deps */
import ListaEmpresa from "../components/empresas/ListaEmpresa.jsx";
import Notificacao from "../components/default/Notificacao.jsx";
import Loading from "../components/default/Loading.jsx";
import PrimeiroAcesso from "../components/perfil/PrimeiroAcesso.jsx";
import { LogOut, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deslogar as encerrarSessao } from "../services/auth/authService.js";
import { getEmpresas } from "../services/api/empresaServices.js";
import { useEffect, useState } from "react";
import { tratarErro } from "../components/default/funcoes.js";

export default function Empresas() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);

  const [loading, setLoading] = useState(false);
  const [notificacao, setNotificacao] = useState({
    show: false,
    tipo: "sucesso",
    titulo: "",
    mensagem: "",
  });
  const [primeiroLogin, setPrimeiroLogin] = useState(false);

  async function buscaEmpresas() {
    setLoading(true);
    try {
      const empresas = await getEmpresas();
      setEmpresas(empresas);
      setLoading(false);
      console.log(empresas);
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
      setLoading(false);
    }
  }

  async function deslogar() {
    await encerrarSessao();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    buscaEmpresas();
    setPrimeiroLogin(localStorage.getItem("usuario_troca_senha") == 1);
  }, []);

  return (
    <div className="relative flex justify-center items-center w-screen h-screen overflow-hidden bg-[#0A1633] text-white">
      {primeiroLogin && (
        <PrimeiroAcesso
          setPrimeiroLogin={setPrimeiroLogin}
          setNotificacao={setNotificacao}
          setLoading={setLoading}
        />
      )}
      {loading && <Loading />}
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
      <button
        onClick={deslogar}
        aria-label="Sair"
        title="Sair"
        className="cursor-pointer absolute top-5 right-5 inline-flex items-center justify-center
                   h-11 w-11 rounded-full text-white
                   bg-white/5 ring-1 ring-white/10
                   hover:bg-white/10 hover:ring-white/20
                   transition focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <LogOut className="h-5 w-5" />
      </button>

      {localStorage.getItem("usuario_tipo") == "adm" && (
        <button
          onClick={() => navigate("/usuarios", { replace: true })}
          aria-label="Usuários"
          title="Gerenciar usuários"
          className="cursor-pointer absolute top-5 left-5 inline-flex items-center justify-center
               h-11 w-11 rounded-full bg-white/5 ring-1 ring-white/10
               text-white/80 hover:bg-white/10 hover:text-white transition"
        >
          <Users className="h-5 w-5" />
        </button>
      )}
      <div className="w-full md:w-1/2 h-[75vh] p-4">
        <div
          className="h-full rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-6 text-white
                  flex flex-col overflow-hidden"
        >
          <h1 className="text-xl text-center font-semibold mb-4 shrink-0">
            Selecione a empresa
          </h1>

          <ListaEmpresa empresas={empresas} navigate={navigate} />
        </div>
      </div>
    </div>
  );
}
