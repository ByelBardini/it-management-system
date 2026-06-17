/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import TabelaPecas from "./TabelaPecas.jsx";

// Modal com todas as peças de um modelo. A folha reusa TabelaPecas (com as ações
// de inativar). Render em portal no body para escapar do recorte do card.
export default function ModalModeloPeca({
  tipoLabel,
  marca,
  modelo,
  onFechar,
  setConfirmacao,
  setNotificacao,
  inativar,
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
              {modelo.total === 1 ? "peça" : "peças"}
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
          <TabelaPecas
            pecas={modelo.itens}
            setConfirmacao={setConfirmacao}
            setNotificacao={setNotificacao}
            inativos={false}
            inativar={inativar}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
