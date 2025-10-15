import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Paginacao({ sessao, setSessao, ordenadas = [] }) {
  return (
    <div className="fixed bottom-0 left-0 w-full flex items-center justify-center pb-4">
      <div className="flex-1 flex justify-center items-center gap-4">
        <button
          disabled={sessao === 0}
          onClick={() => setSessao((prev) => prev - 1)}
          className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-40 disabled:cursor-default"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm text-white/70">
          Página {sessao + 1} de {ordenadas.length}
        </span>

        <button
          disabled={sessao === ordenadas.length - 1}
          onClick={() => setSessao((prev) => prev + 1)}
          className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-40 disabled:cursor-default"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
