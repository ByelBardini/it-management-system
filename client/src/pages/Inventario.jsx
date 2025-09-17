/* eslint-disable react-hooks/exhaustive-deps */
import TabelaItens from "../components/inventario/TabelaItens";
import CardItem from "../components/inventario/CardItem";
import EditarItem from "../components/inventario/EditarItem";
import Loading from "../components/default/Loading";
import Notificacao from "../components/default/Notificacao";
import ModalConfirmacao from "../components/default/ModalConfirmacao";
import CampoFiltros from "../components/inventario/CampoFiltros.jsx";
import {
  Plus,
  FunnelPlus,
  FunnelX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { getItens, getItensInativos } from "../services/api/itemServices";
import { dividirEmPartes } from "../components/default/funcoes.js";

export default function Inventario() {
  const [itens, setItens] = useState([]);
  const [cardItem, setCardItem] = useState(false);
  const [editarItem, setEditarItem] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const [editado, setEditado] = useState(false);

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
  const [itensFiltrados, setItensFiltrados] = useState([]);
  const [itensOrdenados, setItensOrdenados] = useState([]);

  const [sessao, setSessao] = useState(0);

  async function buscarItens() {
    setLoading(true);
    const id_empresa = localStorage.getItem("empresa_id");
    try {
      if (!inativos) {
        const itens = await getItens(id_empresa);
        setItens(itens);
        setItensFiltrados(itens);
        setLoading(false);
        console.log(itens);
      } else {
        const itens = await getItensInativos(id_empresa);
        setItens(itens);
        setItensFiltrados(itens);
        setLoading(false);
        console.log(itens);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  }

  useEffect(() => {
    buscarItens();
    setEditado(false);
  }, [editado, inativos]);

  useEffect(() => {
    const ordenados = dividirEmPartes(itensFiltrados, 9);
    setItensOrdenados(ordenados);
    console.log(ordenados);
    setSessao(0);
  }, [itensFiltrados]);

  return (
    <div className="p-6">
      {loading && <Loading />}
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
      {cardItem && (
        <CardItem
          setCardItem={setCardItem}
          setEditarItem={setEditarItem}
          setItemSelecionado={setItemSelecionado}
          inativos={inativos}
        />
      )}
      {editarItem && (
        <EditarItem
          setEditarItem={setEditarItem}
          setCardItem={setCardItem}
          setEditado={setEditado}
          item={itemSelecionado}
          setLoading={setLoading}
          setNotificacao={setNotificacao}
          setConfirmacao={setConfirmacao}
        />
      )}
      <div className="rounded-2xl bg-white/5 backdrop-blur-md ring-1 ring-white/10 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Inventário</h2>

          {filtrando ? (
            <CampoFiltros
              itens={itens}
              inativos={inativos}
              setItensFiltrados={setItensFiltrados}
              filtrando={filtrando}
            />
          ) : inativos ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">
                Total Itens Inativos:
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-600/20 text-rose-400 text-sm font-medium">
                {itens.length}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">Total Itens Ativos:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 text-sm font-medium">
                {itens.length}
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

            <NavLink
              to={"/cadastro"}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Adicionar</span>
            </NavLink>
          </div>
        </div>
        <div className="overflow-x-auto">
          <TabelaItens
            itens={itensOrdenados[sessao] || []}
            setCardItem={setCardItem}
            inativos={inativos}
          />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="w-full flex justify-end">
          <button
            className={`w1/3 cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              !inativos
                ? "bg-red-600/50 ring-1 ring-red-600/10 text-white/80 hover:bg-red-600/70 transition"
                : "bg-emerald-600/50 ring-1 ring-emerald-600/10 text-white/80 hover:bg-emerald-600/70 transition"
            }`}
            onClick={() => setInativos(!inativos)}
          >
            <span className="text-sm font-medium">
              {!inativos ? "Listar Itens Inativos" : "Listar Itens Ativos"}
            </span>
          </button>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full flex items-center justify-center pb-4">
        <button
          disabled={sessao === 0}
          onClick={() => setSessao((prev) => prev - 1)}
          className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-40 disabled:cursor-default"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="mr-4 ml-4 ext-sm text-white/70">
          Página {sessao + 1} de {itensOrdenados.length}
        </span>

        <button
          disabled={sessao === itensOrdenados.length - 1}
          onClick={() => setSessao((prev) => prev + 1)}
          className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-40 disabled:cursor-default"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
