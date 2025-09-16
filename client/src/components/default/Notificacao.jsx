/* eslint-disable no-unused-vars */
import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Notificacao({
  tipo = "sucesso",
  titulo,
  mensagem,
  onClick,
}) {
  const eSucesso = tipo === "sucesso";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-2xl">
      <motion.div
        className="w-[92%] max-w-md"
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
      >
        <div
          role="dialog"
          aria-modal="true"
          className={`rounded-2xl shadow-lg ring-1 ring-white/10 p-6
            bg-white/5 text-white`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`rounded-full p-2 ${
                eSucesso
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {eSucesso ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <XCircle className="h-6 w-6" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {titulo || (eSucesso ? "Sucesso" : "Erro")}
              </h3>
              {mensagem && (
                <p className="mt-1 text-sm text-white/80">{mensagem}</p>
              )}
            </div>
          </div>

          {!eSucesso && (
            <div className="mt-5 flex justify-end">
              <button
                onClick={onClick}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition"
              >
                OK
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
