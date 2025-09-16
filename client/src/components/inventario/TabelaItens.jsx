import tipos from "./tiposItens.js";
import { SearchX } from "lucide-react";
import { formatToDate } from "brazilian-values";

export default function TabelaItens({ itens, setCardItem, inativos }) {
  function abreCard(id) {
    localStorage.setItem("item_id", id);
    setCardItem(true);
  }

  return (
    <>
      <table className="min-w-full divide-y divide-white/10">
        <thead>
          <tr className="text-left text-sm text-white/70">
            <th className="px-6 py-3 font-medium">Etiqueta</th>
            <th className="px-6 py-3 font-medium">Tipo</th>
            <th className="px-6 py-3 font-medium">Nome</th>
            <th className="px-6 py-3 font-medium">
              {inativos ? "Data de Inativação" : "Setor"}
            </th>
            <th className="px-6 py-3 font-medium">
              {inativos ? "Observação" : "Workstation"}
            </th>
            {inativos ? "" : <th className="px-6 py-3 font-medium">Em uso</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {itens.map((item) => {
            return (
              <tr
                key={item.item_id}
                className="hover:bg-white/5 transition"
                onDoubleClick={() => abreCard(item.item_id)}
              >
                <td className="px-6 py-3 text-white/80">
                  {item.item_etiqueta}
                </td>
                <td className="px-6 py-3 text-white">
                  {tipos[item.item_tipo] ?? item.item_tipo}
                </td>
                <td className="px-6 py-3 text-white">{item.item_nome}</td>
                <td className="px-6 py-3 text-white/70">
                  {inativos
                    ? formatToDate(
                        new Date(item.item_data_inativacao + "T03:00:00Z")
                      )
                    : item.setor == null
                    ? "N/A"
                    : item.setor.setor_nome}
                </td>
                <td className="px-6 py-3 text-white/70">
                  {inativos && item.caracteristicas != null
                    ? item.caracteristicas.find(
                        (caracteristica) =>
                          caracteristica.caracteristica_nome === "observacoes"
                      )?.caracteristica_valor || "N/A"
                    : item.workstation == null
                    ? "N/A"
                    : item.workstation.workstation_nome}
                </td>
                {inativos ? (
                  ""
                ) : (
                  <td className="px-6 py-3">
                    {item.item_em_uso ? (
                      <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium">
                        Sim
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium">
                        Não
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {itens.length == 0 && (
        <div className="w-full py-12 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white/60 mb-4">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Nenhum item encontrado
          </h3>
          <p className="text-sm text-white/60 mt-1">
            Tente ajustar os filtros ou adicione novos itens ao inventário.
          </p>
        </div>
      )}
    </>
  );
}
