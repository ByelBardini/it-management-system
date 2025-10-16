/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from "react";

const tipoLabels = {
  processador: "Processador",
  "placa-video": "Placa de Vídeo",
  "placa-mae": "Placa Mãe",
  ram: "Memória RAM",
  armazenamento: "Armazenamento",
  fonte: "Fonte",
  "placa-rede": "Placa de Rede",
  gabinete: "Gabinete",
  outros: "Outros",
};

const tiposObrigatorios = [
  "processador",
  "placa-video",
  "placa-mae",
  "ram",
  "armazenamento",
  "fonte",
  "gabinete",
];

export default function CadastroDesktop({
  setCaracteristicas,
  resetCaracteristicas,
  setCaracteristicaValida,
  setSelecionaPeca,
  pecasSelecionadas,
  pecas,
}) {
  useEffect(() => {
    resetCaracteristicas();
  }, []);

  useEffect(() => {
    const novas = [];
    Object.entries(pecasSelecionadas || {}).forEach(([tipo, ids]) => {
      const lista = Array.isArray(ids) ? ids : [];
      const nomes = lista
        .map((id) => pecas.find((p) => p.peca_id === id))
        .filter(Boolean)
        .map((p) => p.peca_nome);
      if (nomes.length > 0) {
        novas.push({ nome: tipoLabels[tipo] || tipo, valor: nomes.join(", ") });
      }
    });
    setCaracteristicas(novas);

    const valido = tiposObrigatorios.every((t) => {
      const arr = pecasSelecionadas?.[t];
      return Array.isArray(arr) && arr.length > 0;
    });
    setCaracteristicaValida(!!valido);
  }, [pecasSelecionadas, pecas]);

  const linhas = useMemo(
    () => [
      { tipo: "processador", multi: false },
      { tipo: "placa-video", multi: false },
      { tipo: "placa-mae", multi: false },
      { tipo: "ram", multi: true },
      { tipo: "armazenamento", multi: true },
      { tipo: "fonte", multi: false },
      { tipo: "placa-rede", multi: false },
      { tipo: "gabinete", multi: false },
      { tipo: "outros", multi: true },
    ],
    []
  );

  function resumo(tipo) {
    const ids = pecasSelecionadas?.[tipo] || [];
    if (!ids.length) return "Não selecionado";
    const nomes = ids
      .map((id) => pecas.find((p) => p.peca_id === id))
      .filter(Boolean)
      .map((p) => p.peca_nome);
    return nomes.join(", ");
  }

  return (
    <div className="w-full p-2">
      {linhas.map((linha) => (
        <div
          key={linha.tipo}
          className="flex items-center justify-between border-b border-white/10 p-2"
        >
          <span className="text-sm font-bold text-white/70 w-1/3">
            {tipoLabels[linha.tipo]}
          </span>
          <span className="text-sm text-white/90 w-1/3 text-center truncate">
            {resumo(linha.tipo)}
          </span>
          <button
            onClick={() =>
              setSelecionaPeca({
                open: true,
                tipo: linha.tipo,
                multi: linha.multi,
              })
            }
            className="cursor-pointer text-sm font-medium px-3 py-1.5 rounded-lg bg-sky-600/40 hover:bg-sky-500/60 transition"
          >
            Selecione...
          </button>
        </div>
      ))}
    </div>
  );
}
