/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";

export default function Monitor({
  setCaracteristicas,
  setCaracteristicaValida,
  caracteristicas,
}) {
  const campos = ["modelo", "tela", "resolucao", "entradas", "fonte", "vesa"];
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
          placeholder="Ex.: LG"
          onChange={(e) => setCaracteristicas("modelo", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">
            Tamanho da Tela
          </label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          type="text"
          placeholder={`Ex.: 24"`}
          onChange={(e) => setCaracteristicas("tela", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">Resolução</label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          type="text"
          placeholder="Ex: 1920x1080"
          onChange={(e) => setCaracteristicas("resolucao", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">Entradas</label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          type="text"
          placeholder="Ex: 1x HDMI; 1x DP"
          onChange={(e) => setCaracteristicas("entradas", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">Fonte</label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          type="text"
          placeholder="Ex: Interna / Externa: in: 110v; out: 19v-5A"
          onChange={(e) => setCaracteristicas("fonte", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">
            Padrão VESA
          </label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          type="text"
          placeholder="Ex: 75x75"
          onChange={(e) => setCaracteristicas("vesa", e.target.value)}
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
