/* eslint-disable react-hooks/exhaustive-deps */
import Loading from "../components/default/Loading";
import Notificacao from "../components/default/Notificacao";
import ModalConfirmacao from "../components/default/ModalConfirmacao";
import TabelaPecas from "../components/pecas/TabelaPecas";
import ModalCadastraPecas from "../components/pecas/ModalCadastraPecas";
import CampoFiltros from "../components/pecas/CampoFiltros.jsx";
import Paginacao from "../components/default/Paginacao.jsx";
import {
  getPecasAtivas,
  getPecasInativas,
  inativarPeca,
} from "../services/api/pecasServices.js";
import {
  dividirEmPartes,
  tratarErro,
  useItensPorPagina,
} from "../components/default/funcoes.js";
import { useNavigate } from "react-router-dom";
import { Plus, FunnelPlus, FunnelX } from "lucide-react";
import { useEffect, useState } from "react";

export default function Pecas() {
  const navigate = useNavigate();
  const itensPorPagina = useItensPorPagina(50, 240);

  const [pecas, setPecas] = useState([]);
  const [pecasFiltradas, setPecasFiltradas] = useState([]);

  const [sessao, setSessao] = useState(0);
  const [pecasOrdenadas, setPecasOrdenadas] = useState([]);

  const [adiciona, setAdiciona] = useState(false);

  const [loading, setLoading] = useState(false);
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

  const [inativos, setInativos] = useState(false);
  const [filtrando, setFiltrando] = useState(false);

  async function buscarPecas() {
    setLoading(true);
    const id_empresa = localStorage.getItem("empresa_id");
    try {
      if (inativos) {
        const pecas = await getPecasInativas(id_empresa);
        setPecasFiltradas(pecas);
        setPecas(pecas);
      } else {
        const pecas = await getPecasAtivas(id_empresa);
        setPecasFiltradas(pecas);
        setPecas(pecas);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      tratarErro(setNotificacao, err, navigate);
    }
  }

  async function inativar(id) {
    setLoading(true);
    try {
      await inativarPeca(id);
      await buscarPecas();
      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Peça inativada",
        mensagem: "Peça inativada com sucesso.",
      });
      setLoading(false);
      setTimeout(() => {
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
      }, 800);
    } catch (err) {
      setLoading(false);
      tratarErro(setNotificacao, err, navigate);
    }
  }

  useEffect(() => {
    buscarPecas();
  }, [inativos]);

  useEffect(() => {
    const ordenados = dividirEmPartes(pecasFiltradas, itensPorPagina);
    setPecasOrdenadas(ordenados);
    console.log(ordenados);
    setSessao(0);
  }, [pecasFiltradas]);

  return (
    <div className="p-4">
      {loading && <Loading />}
      {confirmacao.show && (
        <ModalConfirmacao
          texto={confirmacao.texto}
          onNao={
            confirmacao.onNao ||
            setConfirmacao({ show: false, texto: "", onSim: null })
          }
          onSim={confirmacao.onSim}
          tipo={confirmacao.tipo || "atencao"}
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
      {adiciona && (
        <ModalCadastraPecas
          buscarPecas={buscarPecas}
          setAdiciona={setAdiciona}
          setNotificacao={setNotificacao}
          setLoading={setLoading}
          setConfirmacao={setConfirmacao}
        />
      )}
      <div className="rounded-2xl bg-white/5 backdrop-blur-md ring-1 ring-white/10 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Peças</h2>

          {filtrando ? (
            <CampoFiltros
              pecas={pecas}
              inativos={inativos}
              setPecasFiltradas={setPecasFiltradas}
              filtrando={filtrando}
            />
          ) : inativos ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">
                Total Peças Inativas:
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-600/20 text-rose-400 text-sm font-medium">
                {pecas.length}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">Total Peças Ativas:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 text-sm font-medium">
                {pecas.length}
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setFiltrando(!filtrando)}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition"
            >
              {filtrando ? <FunnelX size={18} /> : <FunnelPlus size={18} />}
            </button>

            <button
              onClick={() => setAdiciona(true)}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Adicionar</span>
            </button>
          </div>
        </div>
        <TabelaPecas
          pecas={pecasOrdenadas[sessao]}
          setConfirmacao={setConfirmacao}
          setNotificacao={setNotificacao}
          inativos={inativos}
          inativar={inativar}
        />
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="w-full flex justify-end">
          <button
            className={`w1/3 cursor-pointer z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              !inativos
                ? "bg-red-600/50 ring-1 ring-red-600/10 text-white/80 hover:bg-red-600/70 transition"
                : "bg-emerald-600/50 ring-1 ring-emerald-600/10 text-white/80 hover:bg-emerald-600/70 transition"
            }`}
            onClick={() => setInativos(!inativos)}
          >
            <span className="text-sm font-medium">
              {!inativos ? "Listar Peças Inativas" : "Listar Peças Ativas"}
            </span>
          </button>
        </div>
      </div>
      {pecasOrdenadas.length > 1 && (
        <Paginacao
          sessao={sessao}
          setSessao={setSessao}
          ordenadas={pecasOrdenadas}
        />
      )}
    </div>
  );
}
