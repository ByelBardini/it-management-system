/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

export default function Cadeira({
  setCaracteristicas,
  setCaracteristicaValida,
}) {
  useEffect(() => {
    setCaracteristicaValida(true);
  }, []);

  const [contador, setContador] = useState(0);

  const handleChange = (valor, limite) => {
    setCaracteristicas("observacoes", valor);
    setContador(Math.min(valor.length, limite));
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm text-white/70">Observações</label>
          <span className="text-xs text-white/50">{contador}/500</span>
        </div>

        <textarea
          rows={3}
          maxLength={500}
          placeholder="Observações gerais..."
          onChange={(e) => handleChange(e.target.value, 500)}
          className="w-full resize-y rounded-lg bg-white/10 px-3 py-2 text-sm text-white 
                     placeholder-white/40 ring-1 ring-white/10 
                     focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        ></textarea>
      </div>
    </div>
  );
}
