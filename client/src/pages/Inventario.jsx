import TabelaItens from "../components/inventario/TabelaItens";
import CardItem from "../components/inventario/CardItem";
import EditarItem from "../components/inventario/EditarItem";
import Loading from "../components/default/Loading";
import Notificacao from "../components/default/Notificacao";
import ModalConfirmacao from "../components/default/ModalConfirmacao";
import { Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { getItens } from "../services/api/itemServices";

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

  async function buscarItens() {
    const id_empresa = localStorage.getItem("empresa_id");
    try {
      const itens = await getItens(id_empresa);
      setItens(itens);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    buscarItens();
    setEditado(false);
  }, [editado]);

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
          <NavLink
            to={"/cadastro"}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Adicionar</span>
          </NavLink>
        </div>
        <div className="overflow-x-auto">
          <TabelaItens itens={itens} setCardItem={setCardItem} />
        </div>
      </div>
    </div>
  );
}
