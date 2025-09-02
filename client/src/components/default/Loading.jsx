export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-[#0b1730]/50" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_40%,rgba(29,78,216,0.25),transparent)]" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      <div
        className="relative mx-auto w-[90%] max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl ring-1 ring-white/10"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto mb-6 grid place-items-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-white">Carregando…</h2>
        <p className="mt-1 text-sm text-white/70">
          Aguarde, logo tudo estará pronto!
        </p>

        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.2s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 [animation-delay:-0.1s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-200" />
        </div>
      </div>
    </div>
  );
}