/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

export default function Ap({
  setCaracteristicas,
  setCaracteristicaValida,
  caracteristicas,
}) {
  const campos = ["modelo", "fonte", "poe", "mac", "ssid", "ip"];

  const [contadores, setContadores] = useState({
    modelo: 0,
    fonte: 0,
    poe: 0,
    mac: 0,
    ssid: 0,
    ip: 0,
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
            <label className="block text-sm text-white/70">Marca / Modelo</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">
            {contadores.modelo}/50
          </span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: TP-Link Omada AX1800 (EAP610)"
          onChange={(e) => handleChange("modelo", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="block text-sm text-white/70">Fonte</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.fonte}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: in: 100–240V AC | out: 12V 1.5A"
          onChange={(e) => handleChange("fonte", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="block text-sm text-white/70">PoE</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.poe}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: 802.3af/at (48V) via porta LAN 1"
          onChange={(e) => handleChange("poe", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="block text-sm text-white/70">Endereço MAC</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.mac}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: AA:BB:CC:DD:EE:FF"
          onChange={(e) => handleChange("mac", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="block text-sm text-white/70">SSID</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.ssid}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: Empresa-AP01-5G"
          onChange={(e) => handleChange("ssid", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="block text-sm text-white/70">Endereço IP</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">{contadores.ip}/50</span>
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="Ex.: 192.168.1.24"
          onChange={(e) => handleChange("ip", e.target.value, 50)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
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
          className="w-full resize-y rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        ></textarea>
      </div>
    </div>
  );
}
