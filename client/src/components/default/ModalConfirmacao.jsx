import { X, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ModalConfirmacao({ onNao, onSim, texto, tipo = "atencao" }) {
  const isSucesso = tipo === "sucesso";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {isSucesso ? "Sucesso" : "Confirmação"}
          </h2>
          <button
            onClick={onNao}
            className="p-2 rounded-lg hover:bg-white/10 text-white/70"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-3">
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
                className="px-4 py-2 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20"
              >
                Não, voltar
              </button>
              <button
                onClick={onSim}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-500"
              >
                Sim, adicionar mais
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onNao}
                className="px-4 py-2 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20"
              >
                Cancelar
              </button>
              <button
                onClick={onSim}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-500"
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
