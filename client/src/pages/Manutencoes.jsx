import { useEffect, useState } from "react";
import TabelaManutencoes from "../components/manutencoes/TabelaManutencoes.jsx";
import { getManutencoes } from "../services/api/manutencaoServices.js";

export default function Manutencoes() {
  const [itens, setItens] = useState([]);
  const [atrasadas, setAtrasadas] = useState("");

  async function buscarItens() {
    const id = localStorage.getItem("empresa_id");
    try {
      const itens = await getManutencoes(id);

      const hoje = new Date();
      const vencidas = itens.filter((item) => {
        if (item.item_intervalo_manutencao == 0) {
          return false;
        }
        const ultimaTroca = new Date(item.item_ultima_manutencao);
        const prazo = item.item_intervalo_manutencao * 30 || 0;
        const proximaManutencao = new Date(
          ultimaTroca.getTime() + prazo * 24 * 60 * 60 * 1000
        );
        return proximaManutencao < hoje;
      }).length;

      setAtrasadas(vencidas);

      setItens(itens);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    buscarItens();
  }, []);
  return (
    <div>
      <div className="rounded-2xl bg-white/5 backdrop-blur-md ring-1 ring-white/10 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Senhas</h2>
          <p className="text-sm text-white/70 flex items-center gap-2">
            Manutenções atrasadas:
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 text-xs font-semibold border border-rose-400/20">
              {atrasadas}
            </span>
          </p>
        </div>
        <TabelaManutencoes itens={itens} />
      </div>
    </div>
  );
}
