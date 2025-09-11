/* eslint-disable react-hooks/exhaustive-deps */
import TabelaItens from "../components/inventario/TabelaItens";
import CardItem from "../components/inventario/CardItem";
import EditarItem from "../components/inventario/EditarItem";
import Loading from "../components/default/Loading";
import Notificacao from "../components/default/Notificacao";
import ModalConfirmacao from "../components/default/ModalConfirmacao";
import { Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { getItens, getItensInativos } from "../services/api/itemServices";

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

  async function buscarItens() {
    const id_empresa = localStorage.getItem("empresa_id");
    try {
      if (!inativos) {
        const itens = await getItens(id_empresa);
        setItens(itens);
      } else {
        const itens = await getItensInativos(id_empresa);
        setItens(itens);
        console.log(itens);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    buscarItens();
    setEditado(false);
  }, [editado, inativos]);

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

          {inativos ? (
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

          <NavLink
            to={"/cadastro"}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Adicionar</span>
          </NavLink>
        </div>
        <div className="overflow-x-auto">
          <TabelaItens
            itens={itens}
            setCardItem={setCardItem}
            inativos={inativos}
          />
        </div>
      </div>
      <div className="w-full justify-end flex">
        <button
          className={`cursor-pointer mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
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
  );
}
