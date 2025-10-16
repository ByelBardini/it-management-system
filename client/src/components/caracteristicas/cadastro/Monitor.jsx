/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

export default function Monitor({
  setCaracteristicas,
  setCaracteristicaValida,
  caracteristicas,
}) {
  const campos = ["modelo", "tela", "resolucao", "entradas", "fonte", "vesa"];

  const [contadores, setContadores] = useState({
    modelo: 0,
    tela: 0,
    resolucao: 0,
    entradas: 0,
    fonte: 0,
    vesa: 0,
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
            <label className="text-sm text-white/70">Marca / Modelo</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.modelo}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: LG"
          onChange={(e) => handleChange("modelo", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white 
                     placeholder-white/40 ring-1 ring-white/10 
                     focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="text-sm text-white/70">Tamanho da Tela</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.tela}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder={`Ex.: 24"`}
          onChange={(e) => handleChange("tela", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white 
                     placeholder-white/40 ring-1 ring-white/10 
                     focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="text-sm text-white/70">Resolução</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.resolucao}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex: 1920x1080"
          onChange={(e) => handleChange("resolucao", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white 
                     placeholder-white/40 ring-1 ring-white/10 
                     focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="text-sm text-white/70">Entradas</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.entradas}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex: 1x HDMI; 1x DP"
          onChange={(e) => handleChange("entradas", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white 
                     placeholder-white/40 ring-1 ring-white/10 
                     focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="text-sm text-white/70">Fonte</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.fonte}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex: Interna / Externa: in: 110v; out: 19v-5A"
          onChange={(e) => handleChange("fonte", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white 
                     placeholder-white/40 ring-1 ring-white/10 
                     focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="text-sm text-white/70">Padrão VESA</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.vesa}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex: 75x75"
          onChange={(e) => handleChange("vesa", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white 
                     placeholder-white/40 ring-1 ring-white/10 
                     focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm text-white/70">Observações</label>
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
