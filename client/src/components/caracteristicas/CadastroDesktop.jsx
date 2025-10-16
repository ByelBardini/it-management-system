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

  return (
    <div className="w-full p-2 space-y-2">
      {linhas.map((linha) => {
        const ids = pecasSelecionadas?.[linha.tipo] || [];
        return (
          <div
            key={linha.tipo}
            className="rounded-lg border border-white/10 bg-white/5"
          >
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white/80">
                  {tipoLabels[linha.tipo]}
                </span>
                {!["placa-rede", "outros"].includes(linha.tipo) && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                    Obrigatório
                  </span>
                )}
                {linha.multi && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300">
                    Múltiplos
                  </span>
                )}
              </div>
              <button
                onClick={() =>
                  setSelecionaPeca({
                    open: true,
                    tipo: linha.tipo,
                    multi: linha.multi,
                  })
                }
                className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-lg bg-sky-600/50 hover:bg-sky-500/60 transition"
              >
                {ids.length ? "Alterar" : "Selecionar"}
              </button>
            </div>
            <div className="px-2 pb-2">
              {ids.length ? (
                <div className="flex flex-wrap gap-2">
                  {ids
                    .map((id) => pecas.find((p) => p.peca_id === id))
                    .filter(Boolean)
                    .map((p) => (
                      <span
                        key={p.peca_id}
                        className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-white/10 ring-1 ring-white/10 text-white/90"
                      >
                        {p.peca_nome}
                      </span>
                    ))}
                </div>
              ) : (
                <div className="text-xs text-white/50">
                  Nenhuma peça selecionada
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div className="flex justify-end pt-2 border-t border-white/10">
        <div className="text-sm text-white/80">
          Total:{" "}
          {(() => {
            const ids = Object.values(pecasSelecionadas || []).flat();
            const total = ids
              .map((id) => pecas.find((p) => p.peca_id === id))
              .filter(Boolean)
              .reduce((acc, p) => acc + Number(p.peca_preco || 0), 0);
            return total.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });
          })()}
        </div>
      </div>
    </div>
  );
}
