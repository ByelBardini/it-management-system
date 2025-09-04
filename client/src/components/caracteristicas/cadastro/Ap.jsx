export default function Ap({ setCaracteristicas }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm text-white/70">
          Marca / Modelo
        </label>
        <input
          type="text"
          placeholder="Ex.: TP-Link Omada AX1800 (EAP610)"
          onChange={(e) => setCaracteristicas("modelo", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">Fonte</label>
        <input
          type="text"
          placeholder="Ex.: in: 100–240V AC | out: 12V 1.5A"
          onChange={(e) => setCaracteristicas("fonte", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">POE</label>
        <input
          type="text"
          placeholder="Ex.: 802.3af/at (48V) via porta LAN 1"
          onChange={(e) => setCaracteristicas("poe", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">MAC</label>
        <input
          type="text"
          placeholder="Ex.: AA:BB:CC:DD:EE:FF"
          onChange={(e) => setCaracteristicas("mac", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">SSID</label>
        <input
          type="text"
          placeholder="Ex.: Empresa-AP01-5G"
          onChange={(e) => setCaracteristicas("ssid", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">IP</label>
        <input
          type="text"
          placeholder="Ex.: 192.168.1.24"
          onChange={(e) => setCaracteristicas("ip", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm text-white/70">Observações</label>
        <textarea
          rows={3}
          placeholder="Observações gerais..."
          onChange={(e) => setCaracteristicas("observacoes", e.target.value)}
          className="w-full resize-y rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        ></textarea>
      </div>
    </div>
  );
}
