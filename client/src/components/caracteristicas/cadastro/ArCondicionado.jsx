/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";

export default function ArCondicionado({
  setCaracteristicas,
  setCaracteristicaValida,
  caracteristicas,
}) {
  const campos = ["modelo", "btu"];
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
        <label className="mb-1 block text-sm text-white/70">
          Marca / Modelo
        </label>
        <input
          type="text"
          placeholder="Ex.: Samsung WindFree"
          onChange={(e) => setCaracteristicas("modelo", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">BTU</label>
        <input
          type="text"
          placeholder={`Ex.: 18.000`}
          onChange={(e) => setCaracteristicas("btu", e.target.value)}
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
