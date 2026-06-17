export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-[#0A1633]/90" />

      <div
        role="status"
        aria-live="polite"
        className="relative mx-auto w-[90%] max-w-sm rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-8 text-center space-y-4"
      >
        <div className="mx-auto grid place-items-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-white">Carregando…</h2>
        <p className="text-sm text-white/70">
          Aguarde, logo tudo estará pronto!
        </p>

        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.2s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 [animation-delay:-0.1s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-200" />
        </div>
      </div>
    </div>
  );
}
