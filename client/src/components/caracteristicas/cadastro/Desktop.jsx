/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";

export default function Computador({
  setCaracteristicas,
  setCaracteristicaValida,
  caracteristicas,
}) {
  const campos = [
    "sistema-operacional",
    "processador",
    "placa-mae",
    "placa-video",
    "ram",
    "armazenamento",
    "fonte",
    "mac",
  ];
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
          Sistema Operacional
        </label>
        <input
          type="text"
          placeholder="Ex.: Windows 11 Pro"
          onChange={(e) =>
            setCaracteristicas("sistema-operacional", e.target.value)
          }
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">Processador</label>
        <input
          type="text"
          placeholder="Ex.: Intel i5-12400F"
          onChange={(e) => setCaracteristicas("processador", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">Placa-mãe</label>
        <input
          type="text"
          placeholder="Ex.: B660M-DS3H"
          onChange={(e) => setCaracteristicas("placa-mae", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">
          Placa de vídeo
        </label>
        <input
          type="text"
          placeholder="Ex.: RTX 3060 12GB"
          onChange={(e) => setCaracteristicas("placa-video", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">Memória RAM</label>
        <input
          type="text"
          placeholder="Ex.: 16GB (2x8) DDR4 3200"
          onChange={(e) => setCaracteristicas("ram", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">
          Armazenamento
        </label>
        <input
          type="text"
          placeholder="Ex.: SSD NVMe 500GB + HDD 1TB"
          onChange={(e) => setCaracteristicas("armazenamento", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">Fonte</label>
        <input
          type="text"
          placeholder="Ex.: 550W 80 Plus Bronze"
          onChange={(e) => setCaracteristicas("fonte", e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-white/70">MAC</label>
        <input
          type="text"
          placeholder="Ex.: XX-XX-XX-XX-XX-XX (Ethernet)"
          onChange={(e) => setCaracteristicas("mac", e.target.value)}
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
