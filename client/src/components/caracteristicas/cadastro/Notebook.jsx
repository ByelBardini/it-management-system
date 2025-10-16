/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

export default function Notebook({
  setCaracteristicas,
  setCaracteristicaValida,
  caracteristicas,
}) {
  const campos = [
    "sistema-operacional",
    "modelo",
    "processador",
    "ram",
    "armazenamento",
    "tela",
    "fonte",
    "mac",
  ];

  const [contadores, setContadores] = useState({
    "sistema-operacional": 0,
    modelo: 0,
    processador: 0,
    ram: 0,
    armazenamento: 0,
    tela: 0,
    fonte: 0,
    mac: 0,
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
            <label className="text-sm text-white/70">Sistema Operacional</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">
            {contadores["sistema-operacional"]}/50
          </span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: Windows 11 Pro"
          onChange={(e) =>
            handleChange("sistema-operacional", e.target.value, 50)
          }
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 
                     ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

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
          placeholder="Ex.: Dell Inspiron 15 - ABC123"
          onChange={(e) => handleChange("modelo", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 
                     ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="text-sm text-white/70">Processador</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">
            {contadores.processador}/50
          </span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: Intel i5-12400F"
          onChange={(e) => handleChange("processador", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 
                     ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="text-sm text-white/70">Memória RAM</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.ram}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: 16GB (2x8) DDR4 3200"
          onChange={(e) => handleChange("ram", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 
                     ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="text-sm text-white/70">Armazenamento</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">
            {contadores.armazenamento}/50
          </span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: SSD NVMe 500GB + HDD 1TB"
          onChange={(e) => handleChange("armazenamento", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 
                     ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
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
          placeholder={`Ex.: 16"`}
          onChange={(e) => handleChange("tela", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 
                     ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
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
          placeholder="Ex.: in: 110-220v / out: 19v 3.4A"
          onChange={(e) => handleChange("fonte", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 
                     ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="text-sm text-white/70">Endereço MAC</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.mac}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: XX-XX-XX-XX-XX-XX (Ethernet/Wi-fi)"
          onChange={(e) => handleChange("mac", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 
                     ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
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
          className="w-full resize-y rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 
                     ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        ></textarea>
      </div>
    </div>
  );
}
