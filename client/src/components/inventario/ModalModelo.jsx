/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import TabelaItens from "./TabelaItens.jsx";

// Modal com todos os itens de um modelo. A folha reusa TabelaItens (com a coluna
// de série). Abrir o detalhe de um item fecha este modal antes, para o card do
// item aparecer sozinho (sem empilhar modais).
export default function ModalModelo({
  tipoLabel,
  marca,
  modelo,
  onFechar,
  setCardItem,
}) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onFechar();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // TabelaItens grava o item_id no localStorage e chama setCardItem(true);
  // fechamos este modal antes para o CardItem abrir sozinho (sem empilhar).
  function abrirItem(mostrar) {
    onFechar();
    setCardItem(mostrar);
  }

  // Portal para o body: o card do Inventário tem backdrop-blur + overflow-hidden,
  // o que vira containing block de elementos fixed e recortaria o modal. Render no
  // body escapa desse recorte (mesmo motivo de CardItem/ModalConfirmacao no topo).
  return createPortal(
    <div
      onClick={onFechar}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-white/5 backdrop-blur-3xl ring-1 ring-white/10 shadow-lg overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">
              {modelo.modelo}
            </h2>
            <p className="text-xs text-white/60 truncate">
              {tipoLabel} · {marca} · {modelo.total}{" "}
              {modelo.total === 1 ? "item" : "itens"}
            </p>
          </div>
          <button
            onClick={onFechar}
            className="cursor-pointer p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-auto">
          <TabelaItens
            itens={modelo.itens}
            setCardItem={abrirItem}
            inativos={false}
            mostrarSerie
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
