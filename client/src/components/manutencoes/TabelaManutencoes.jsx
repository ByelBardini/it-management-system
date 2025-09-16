import tipos from "../inventario/tiposItens.js";
import { formatToDate } from "brazilian-values";
import {
  formatarIntervalo,
  formatarIntervaloTabela,
  getDiffDias,
} from "../default/funcoes.js";
import { SearchX } from "lucide-react";

export default function TabelaManutencoes({
  itens,
  setVisualizando,
  setSelecionado,
}) {
  function abreVisualiza(item) {
    setSelecionado(item);
    setVisualizando(true);
  }
  return (
    <>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-sm text-white/70 border-b border-white/10">
            <th className="px-6 py-3">Etiqueta</th>
            <th className="px-6 py-3">Nome</th>
            <th className="px-6 py-3">Tipo</th>
            <th className="px-6 py-3">Setor</th>
            <th className="px-6 py-3">Última Manutençção</th>
            <th className="px-6 py-3">Próxima Manutenção</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => {
            const diffDias = getDiffDias(
              item.item_ultima_manutencao,
              item.item_intervalo_manutencao
            );
            return (
              <tr
                key={item.item_id}
                onDoubleClick={() => abreVisualiza(item)}
                className="text-sm text-white/80 hover:bg-white/5 transition"
              >
                <td className="px-6 py-3 font-medium text-white">
                  {item.item_etiqueta}
                </td>
                <td className="px-6 py-3">{item.item_nome}</td>
                <td className="px-6 py-3">
                  {tipos[item.item_tipo] ?? item.item_tipo}
                </td>
                <td className="px-6 py-3">{item.setor?.setor_nome || "N/A"}</td>
                <td className={`px-6 py-3`}>
                  {formatToDate(
                    new Date(item.item_ultima_manutencao + "T03:00:00Z")
                  )}
                </td>
                <td
                  className={`px-6 py-3 ${formatarIntervaloTabela(
                    item.item_intervalo_manutencao,
                    diffDias
                  )}`}
                >
                  {formatarIntervalo(item.item_intervalo_manutencao, diffDias)}
                </td>
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
