/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

export default function Cabo({
  setCaracteristicas,
  setCaracteristicaValida,
  caracteristicas,
}) {
  const campos = ["tipo", "comprimento"];

  const [contadores, setContadores] = useState({
    tipo: 0,
    comprimento: 0,
    observacoes: 0,
  });

  const handleChange = (campo, valor, limite) => {
    setCaracteristicas(campo, valor);
    setContadores((prev) => ({
      ...prev,
      [campo]: Math.min(valor.length, limite),
    }));
  };

  useEffect(() => {
    const checagem = caracteristicas.filter(
      (caracteristica) =>
        campos.includes(caracteristica?.nome) &&
        String(caracteristica?.valor ?? "").trim() !== ""
    );
    setCaracteristicaValida(checagem.length === campos.length);
  }, [caracteristicas]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="block text-sm text-white/70">Tipo</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.tipo}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: Cabo VGA"
          onChange={(e) => handleChange("tipo", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white 
                     placeholder-white/40 ring-1 ring-white/10 
                     focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="block text-sm text-white/70">Comprimento</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">
            {contadores.comprimento}/50
          </span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: 2 metros"
          onChange={(e) => handleChange("comprimento", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white 
                     placeholder-white/40 ring-1 ring-white/10 
                     focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm text-white/70">Observações</label>
          <span className="text-xs text-white/50">
            {contadores.observacoes}/500
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={500}
          placeholder="Observações gerais..."
          onChange={(e) => handleChange("observacoes", e.target.value, 500)}
          className="w-full resize-y rounded-lg bg-white/10 px-3 py-2 text-sm text-white 
                     placeholder-white/40 ring-1 ring-white/10 
                     focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        ></textarea>
      </div>
    </div>
  );
}
