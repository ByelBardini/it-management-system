import { X, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ModalConfirmacao({ onNao, onSim, texto, tipo = "atencao" }) {
  const isSucesso = tipo === "sucesso";

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-2xl ring-1 ring-white/10 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {isSucesso ? "Sucesso" : "Confirmação"}
          </h2>
          <button
            onClick={onNao}
            className="cursor-pointer p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          {isSucesso ? (
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-yellow-400" />
          )}
          <p className="text-white/80 text-sm">{texto}</p>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
          {isSucesso ? (
            <>
              <button
                onClick={onNao}
                className="cursor-pointer px-4 py-2 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20 transition"
              >
                Não, voltar
              </button>
              <button
                onClick={onSim}
                className="cursor-pointer px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition"
              >
                Sim, adicionar mais
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onNao}
                className="cursor-pointer px-4 py-2 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20 transition"
              >
                Cancelar
              </button>
              <button
                onClick={onSim}
                className="cursor-pointer px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition"
              >
                Confirmar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
