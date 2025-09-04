export default function NoBreak() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm text-white/70">Marca/modelo</label>
        <input
          type="text"
          placeholder="Ex.: APC Back-UPS 1400VA (BX1400U-BR)"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">Potência</label>
        <input
          type="text"
          placeholder="Ex.: 1400 VA / 700 W"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">Tensão de Entrada</label>
        <input
          type="text"
          placeholder="Ex.: Bivolt 115/220 V (automático)"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">Tensão de Saída</label>
        <input
          type="text"
          placeholder="Ex.: 115 V"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">Tensão da Bateria</label>
        <input
          type="text"
          placeholder="Ex.: 24 V (2x 12 V)"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">Setores Alimentados</label>
        <input
          type="text"
          placeholder="Ex.: Sala de Servidores, Monitoramento, Recepção"
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
