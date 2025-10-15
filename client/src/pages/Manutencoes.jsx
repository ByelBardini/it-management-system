/* eslint-disable react-hooks/exhaustive-deps */
import TabelaManutencoes from "../components/manutencoes/TabelaManutencoes.jsx";
import ExibirManutencao from "../components/manutencoes/ExibirManutencao.jsx";
import Loading from "../components/default/Loading";
import Notificacao from "../components/default/Notificacao";
import ModalConfirmacao from "../components/default/ModalConfirmacao";
import CampoFiltros from "../components/manutencoes/CampoFiltros.jsx";
import Paginacao from "../components/default/Paginacao.jsx";
import { useEffect, useState } from "react";
import { getManutencoes } from "../services/api/manutencaoServices.js";
import {
  getDiffDias,
  dividirEmPartes,
  tratarErro,
  useItensPorPagina,
} from "../components/default/funcoes.js";
import { FunnelX, FunnelPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Manutencoes() {
  const navigate = useNavigate();
  const itensPorPagina = useItensPorPagina(45, 240);

  const [itens, setItens] = useState([]);
  const [atrasadas, setAtrasadas] = useState("");

  const [visualizando, setVisualizando] = useState(false);
  const [selecionado, setSelecionado] = useState({});

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

  const [filtrando, setFiltrando] = useState(false);
  const [itensFiltrados, setItensFiltrados] = useState([]);
  const [itensOrdenados, setItensOrdenados] = useState([]);

  const [sessao, setSessao] = useState(0);

  async function buscarItens() {
    const id = localStorage.getItem("empresa_id");
    setLoading(true);
    try {
      const itens = await getManutencoes(id);

      const vencidas = itens.filter((item) => {
        if (item.item_intervalo_manutencao == 0) {
          return false;
        }
        const diffDias = getDiffDias(
          item.item_ultima_manutencao,
          item.item_intervalo_manutencao
        );
        return diffDias < 1;
      }).length;

      setAtrasadas(vencidas);
      setLoading(false);

      setItens(itens);
      setItensFiltrados(itens);
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    }
  }

  useEffect(() => {
    buscarItens();
  }, []);

  useEffect(() => {
    const ordenados = dividirEmPartes(itensFiltrados, itensPorPagina);
    setItensOrdenados(ordenados);
    console.log(ordenados);
    setSessao(0);
  }, [itensFiltrados]);

  return (
    <div className="p-4">
      {visualizando && (
        <ExibirManutencao
          setVisualizando={setVisualizando}
          item={selecionado}
          setNotificacao={setNotificacao}
          setConfirmacao={setConfirmacao}
          buscarItens={buscarItens}
          setLoading={setLoading}
        />
      )}
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
      <div className="rounded-2xl bg-white/5 backdrop-blur-md ring-1 ring-white/10 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Manutenções</h2>
          {filtrando ? (
            <CampoFiltros
              itens={itens}
              setItensFiltrados={setItensFiltrados}
              filtrando={filtrando}
            />
          ) : (
            <p className="text-sm text-white/70 flex items-center gap-2">
              Manutenções atrasadas:
              <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 text-xs font-semibold border border-rose-400/20">
                {atrasadas}
              </span>
            </p>
          )}

          <button
            onClick={() => setFiltrando(!filtrando)}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition"
          >
            {filtrando ? <FunnelX size={18} /> : <FunnelPlus size={18} />}
          </button>
        </div>
        <TabelaManutencoes
          itens={itensOrdenados[sessao] || []}
          setSelecionado={setSelecionado}
          setVisualizando={setVisualizando}
        />
      </div>

      {itensOrdenados.length > 0 && (
        <Paginacao
          sessao={sessao}
          setSessao={setSessao}
          ordenadas={itensOrdenados}
        />
      )}
    </div>
  );
}
