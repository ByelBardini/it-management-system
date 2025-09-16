import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { getEmpresas } from "../services/api/empresaServices.js";
import { useEffect, useState } from "react";
import ListaEmpresa from "../components/empresas/ListaEmpresa.jsx";
import Loading from "../components/default/Loading.jsx";

export default function Empresas() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);

  const [loading, setLoading] = useState(false);

  async function buscaEmpresas() {
    setLoading(true);
    try {
      const empresas = await getEmpresas();
      setEmpresas(empresas);
      setLoading(false);
      console.log(empresas);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  function deslogar() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario_tipo");
    localStorage.removeItem("usuario_nome");
    localStorage.removeItem("usuario_troca_senha");

    delete api.defaults.headers.common.Authorization;

    navigate("/", { replace: true });
  }

  useEffect(() => {
    buscaEmpresas();
  }, []);

  return (
    <div className="relative flex justify-center items-center w-screen h-screen overflow-hidden bg-[#0A1633] text-white">
      {loading && <Loading />}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(59,130,246,0.22),transparent)]" />
      <div
        className="absolute inset-0 opacity-40
        [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]
        [background-size:36px_36px]"
      />
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />

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

      <div className="w-full md:w-1/2 h-[75vh] p-4">
        <div
          className="h-full rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-white shadow-2xl
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
