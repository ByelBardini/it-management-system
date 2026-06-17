import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { iconeDoTipoPeca } from "./iconesTiposPecas.js";
import TipoDetalhePeca from "./TipoDetalhePeca.jsx";

// Visão agrupada de peças: grade de CARDS por tipo de peça. Clicar entra no
// drill-down (TipoDetalhePeca) com marcas → modelos → modal com as peças.
// Espelha InventarioAgrupado, mas a folha é TabelaPecas.
export default function PecasAgrupado({
  grupos,
  setConfirmacao,
  setNotificacao,
  inativar,
}) {
  const [tipoSelecionado, setTipoSelecionado] = useState(null);

  if (!grupos || grupos.length === 0) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-semibold text-white">
          Nenhuma peça encontrada
        </h3>
        <p className="text-sm text-white/60 mt-1">
          Tente ajustar os filtros ou cadastre novas peças.
        </p>
      </div>
    );
  }

  const grupoSelecionado = tipoSelecionado
    ? grupos.find((g) => g.tipo === tipoSelecionado)
    : null;

  if (grupoSelecionado) {
    return (
      <TipoDetalhePeca
        grupo={grupoSelecionado}
        onVoltar={() => setTipoSelecionado(null)}
        setConfirmacao={setConfirmacao}
        setNotificacao={setNotificacao}
        inativar={inativar}
      />
    );
  }

  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {grupos.map((g) => {
        const Icone = iconeDoTipoPeca(g.tipo);
        return (
          <button
            key={g.tipo}
            onClick={() => setTipoSelecionado(g.tipo)}
            className="group flex items-center gap-3 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 cursor-pointer text-left hover:bg-white/10 hover:ring-white/20 transition"
          >
            <span className="h-11 w-11 shrink-0 rounded-xl bg-sky-500/15 text-sky-300 flex items-center justify-center">
              <Icone size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-white font-semibold">
                {g.tipoLabel}
              </span>
              <span className="text-xs text-white/60">
                {g.total} {g.total === 1 ? "peça" : "peças"}
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
