/* eslint-disable react-hooks/exhaustive-deps */
import { X, Check } from "lucide-react";
import { useEffect, useState } from "react";

const tipoLabels = {
  processador: "Processador",
  "placa-video": "Placa de Vídeo",
  "placa-mae": "Placa Mãe",
  ram: "Memória RAM",
  armazenamento: "Armazenamento",
  fonte: "Fonte",
  "placa-rede": "Placa de Rede",
  gabinete: "Gabinete",
  outros: "Outros",
};

export default function ModalSelecionaPeca({
  pecas = [],
  selectedIds = [],
  multi = false,
  tipo,
  onClose,
  onConfirm,
}) {
  const [selecionados, setSelecionados] = useState(selectedIds);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    function onKeyDown(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function toggle(id) {
    if (multi) {
      setSelecionados((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelecionados([id]);
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-zinc-900 rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6 text-white"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-lg font-semibold text-white/90">
            Selecionar Peça — {tipoLabels[tipo] || tipo}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-white/60 hover:text-white transition"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar peça pelo nome..."
            className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-xs text-white/60 whitespace-nowrap">
            {selecionados.length} selecionada(s)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {pecas
            .filter((p) =>
              p.peca_nome.toLowerCase().includes(busca.toLowerCase())
            )
            .map((p) => {
              const marcado = selecionados.includes(p.peca_id);
              return (
                <div
                  key={p.peca_id}
                  onClick={() => toggle(p.peca_id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition cursor-pointer ${
                    marcado
                      ? "bg-sky-500/20 border-sky-500/40"
                      : "bg-white/5 hover:bg-white/10 border-white/10"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${
                      marcado
                        ? "border-sky-400 bg-sky-500/40"
                        : "border-white/30 hover:border-sky-400"
                    }`}
                  >
                    {marcado && <Check size={14} className="text-white" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white/90">
                      {p.peca_nome}
                    </span>
                    <span className="text-xs text-white/60">
                      {tipoLabels[p.peca_tipo]}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="flex justify-end border-t border-white/10 pt-4">
          <button
            onClick={() => onConfirm?.(selecionados)}
            className="cursor-pointer px-4 py-2 rounded-lg text-white font-medium bg-sky-600 hover:bg-sky-500 transition"
          >
            Confirmar Seleção
          </button>
        </div>
      </div>
    </div>
  );
}
