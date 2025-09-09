/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";

export default function Celular({
  setCaracteristicas,
  setCaracteristicaValida,
  caracteristicas,
}) {
  const campos = ["modelo", "ram", "armazenamento", "mac", "numeros", "local"];
  useEffect(() => {
    const checagem = caracteristicas.filter(
      (caracteristica) =>
        campos.includes(caracteristica?.nome) &&
        String(caracteristica?.valor ?? "").trim() !== ""
    );
    if (checagem.length == campos.length) {
      setCaracteristicaValida(true);
    } else {
      setCaracteristicaValida(false);
    }
  }, [caracteristicas]);
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">
            Marca / Modelo
          </label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          type="text"
          placeholder="Ex.: Xiaomi 13C"
          onChange={(e) => setCaracteristicas("modelo", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">
            Memória RAM
          </label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          type="text"
          placeholder="Ex.: 4 GB"
          onChange={(e) => setCaracteristicas("ram", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">
            Armazenamento
          </label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          type="text"
          placeholder="Ex.: 128 GB"
          onChange={(e) => setCaracteristicas("armazenamento", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">
            Endereço MAC
          </label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          type="text"
          placeholder="Ex.: AA:BB:CC:DD:EE:FF"
          onChange={(e) => setCaracteristicas("mac", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">
            Números Conectados
          </label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          type="text"
          placeholder="Ex.: Financeiro 1, Financeiro 2"
          onChange={(e) => setCaracteristicas("numeros", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">Local</label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          type="text"
          placeholder="Ex.: Deixado na empresa"
          onChange={(e) => setCaracteristicas("local", e.target.value)}
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
