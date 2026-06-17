import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { iconeDoTipo } from "./iconesTipos.js";
import TipoDetalhe from "./TipoDetalhe.jsx";

// Primeira tela da visão agrupada: grade de CARDS, um por tipo de item.
// Clicar num card entra na "página" daquele tipo (drill-down em TipoDetalhe),
// onde ficam as marcas → modelos → modal com os itens.
export default function InventarioAgrupado({ grupos, setCardItem }) {
  const [tipoSelecionado, setTipoSelecionado] = useState(null);

  if (!grupos || grupos.length === 0) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-semibold text-white">
          Nenhum item encontrado
        </h3>
        <p className="text-sm text-white/60 mt-1">
          Tente ajustar os filtros ou adicione novos itens ao inventário.
        </p>
      </div>
    );
  }

  const grupoSelecionado = tipoSelecionado
    ? grupos.find((g) => g.tipo === tipoSelecionado)
    : null;

  if (grupoSelecionado) {
    return (
      <TipoDetalhe
        grupo={grupoSelecionado}
        onVoltar={() => setTipoSelecionado(null)}
        setCardItem={setCardItem}
      />
    );
  }

  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {grupos.map((g) => {
        const Icone = iconeDoTipo(g.tipo);
        return (
          <button
            key={g.tipo}
            onClick={() => setTipoSelecionado(g.tipo)}
            className="group flex items-center gap-3 rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-4 cursor-pointer text-left hover:bg-white/10 hover:ring-white/20 transition"
          >
            <Icone size={22} className="shrink-0 text-sky-300" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-white font-semibold">
                {g.tipoLabel}
              </span>
              <span className="text-xs text-white/60">
                {g.total} {g.total === 1 ? "item" : "itens"}
              </span>
            </span>
            <ChevronRight
              size={18}
              className="shrink-0 text-white/30 group-hover:text-white/70 transition"
            />
          </button>
        );
      })}
    </div>
  );
}
