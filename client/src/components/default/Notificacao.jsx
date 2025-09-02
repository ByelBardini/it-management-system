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
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <motion.div
        className="relative mx-auto mt-24 sm:mt-32 w-[92%] max-w-md"
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
      >
        <div
          role="dialog"
          aria-modal="true"
          className={`rounded-2xl shadow-2xl ring-1 ring-white/10 p-5 sm:p-6
            bg-[#0f1d3a]/95 text-white border
            ${eSucesso ? "border-green-500/30" : "border-red-500/30"}`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`rounded-full p-2
                ${
                  eSucesso
                    ? "bg-green-600/15 text-green-400"
                    : "bg-red-600/15 text-red-400"
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
                <p className="mt-1 text-sm text-zinc-300">{mensagem}</p>
              )}
            </div>
          </div>

          {!eSucesso && (
            <div className="mt-5 flex justify-end">
              <button
                onClick={onClick}
                className="cursor-pointer inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium
                           bg-red-600/90 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
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
