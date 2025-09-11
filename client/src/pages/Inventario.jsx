import TabelaItens from "../components/inventario/TabelaItens";
import CardItem from "../components/inventario/CardItem";
import { Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { getItens } from "../services/api/itemServices";

export default function Inventario() {
  const [itens, setItens] = useState([]);
  const [cardItem, setCardItem] = useState(false);

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
  }, []);

  return (
    <div className="p-6">
      {cardItem && <CardItem setCardItem={setCardItem} />}
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
