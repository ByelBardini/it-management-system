export default function Monitor() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm text-white/70">Marca</label>
        <input
          type="text"
          placeholder="Ex.: LG"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">Tamanho</label>
        <input
          type="text"
          placeholder={`Ex.: 24"`}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">Resolução</label>
        <input
          type="text"
          placeholder="Ex: 1920x1080"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">Entradas</label>
        <input
          type="text"
          placeholder="Ex: 1x HDMI; 1x DP"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">Fonte</label>
        <input
          type="text"
          placeholder="Ex: Interna / Externa: in: 110v; out: 19v-5A"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">Padrão VESA</label>
        <input
          type="text"
          placeholder="Ex: 75x75"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm text-white/70">Observações</label>
        <textarea
          rows={3}
          placeholder="Observações gerais..."
          className="w-full resize-y rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        ></textarea>
      </div>
    </div>
  );
}
