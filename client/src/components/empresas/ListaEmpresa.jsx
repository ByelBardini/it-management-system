export default function ListaEmpresa({ empresas, navigate }) {
  function navega(id, nome) {
    localStorage.setItem("empresa_id", id);
    localStorage.setItem("empresa_nome", nome);
    navigate("/app", { replace: true });
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pr-2 gap-4 space-y-4">
      {empresas.map((empresa) => {
        return (
          <button
            className="cursor-pointer group relative w-full h-20 rounded-2xl px-6 text-left
             font-semibold text-white
             bg-white/5 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
             transition overflow-hidden
             hover:bg-white/7 hover:ring-white/20 active:scale-[0.997] focus:outline-none focus:ring-2 focus:ring-sky-400/50"
            onClick={() => navega(empresa.empresa_id, empresa.empresa_nome)}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-2xl
               bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-transparent
               opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <span
              className="pointer-events-none absolute -left-20 top-0 h-full w-1/3
               bg-gradient-to-r from-white/15 to-transparent -skew-x-12
               translate-x-0 group-hover:translate-x-[140%] transition-transform duration-500"
            />
            <span className="relative z-10">{empresa.empresa_nome}</span>
          </button>
        );
      })}
    </div>
  );
}
