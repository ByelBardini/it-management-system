export default function Switch() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm text-white/70">Marca/Modelo</label>
        <input
          type="text"
          placeholder="Ex.: HPE Aruba IOn 1930"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">Portas</label>
        <input
          type="text"
          placeholder={`Ex.: 48`}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">Gerenciável</label>
        <input
          type="text"
          placeholder="Ex: Sim"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">MAC</label>
        <input
          type="text"
          placeholder="Ex: XX-XX-XX-XX-XX-XX-XX"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">Fibra</label>
        <input
          type="text"
          placeholder="Ex: Sim"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">IP</label>
        <input
          type="text"
          placeholder="Ex: 123.123.1.24"
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
