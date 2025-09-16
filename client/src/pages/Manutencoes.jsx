import TabelaManutencoes from "../components/manutencoes/TabelaManutencoes.jsx";
import ExibirManutencao from "../components/manutencoes/ExibirManutencao.jsx";
import Loading from "../components/default/Loading";
import Notificacao from "../components/default/Notificacao";
import ModalConfirmacao from "../components/default/ModalConfirmacao";
import CampoFiltros from "../components/manutencoes/CampoFiltros.jsx";
import { useEffect, useState } from "react";
import { getManutencoes } from "../services/api/manutencaoServices.js";
import { getDiffDias } from "../components/default/funcoes.js";
import { FunnelX, FunnelPlus } from "lucide-react";

export default function Manutencoes() {
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

  async function buscarItens() {
    const id = localStorage.getItem("empresa_id");
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

      setItens(itens);
      setItensFiltrados(itens);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    buscarItens();
  }, []);
  return (
    <div>
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
          <h2 className="text-lg font-semibold text-white">Senhas</h2>
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
          itens={itensFiltrados}
          setSelecionado={setSelecionado}
          setVisualizando={setVisualizando}
        />
      </div>
    </div>
  );
}
