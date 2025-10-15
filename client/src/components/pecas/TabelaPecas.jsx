import tipos from "./tiposPecas.js";
import { SearchX } from "lucide-react";
import { formatToDate, formatToBRL } from "brazilian-values";

export default function TabelaPecas({ pecas, setCardPecas = {}, inativos }) {
  function abreCard(id) {
    localStorage.setItem("item_id", id);
    setCardPecas(true);
  }

  return (
    <>
      <table className="min-w-full divide-y divide-white/10">
        <thead>
          <tr className="text-left text-sm text-white/70">
            <th className="px-6 py-3 font-medium">Tipo</th>
            <th className="px-6 py-3 font-medium">Nome</th>
            <th className="px-6 py-3 font-medium">Preço</th>
            <th className="px-6 py-3 font-medium">
              {inativos ? "Data de Inativação" : "Item Vinculado"}
            </th>
            {!inativos && <th className="px-6 py-3 font-medium">Em uso</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {pecas.map((peca) => {
            return (
              <tr
                key={peca.peca_id}
                className="hover:bg-white/5 transition"
                onDoubleClick={() => abreCard(peca.peca_id)}
              >
                <td className="px-6 py-3 text-white">
                  {tipos[peca.peca_tipo] ?? peca.peca_tipo}
                </td>
                <td className="px-6 py-3 text-white/80">{peca.peca_nome}</td>
                <td className="px-6 py-3 text-white">
                  {formatToBRL(peca.peca_preco)}
                </td>
                <td className="px-6 py-3 text-white/70">
                  {inativos
                    ? formatToDate(
                        new Date(peca.peca_data_inativacao + "T03:00:00Z")
                      )
                    : peca.item == null
                    ? "N/A"
                    : peca.item.item_nome}
                </td>
                {!inativos && (
                  <td className="px-6 py-3">
                    {peca.item_em_uso ? (
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
      {pecas.length == 0 && (
        <div className="w-full py-12 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white/60 mb-4">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Nenhuma peça encontrada
          </h3>
          <p className="text-sm text-white/60 mt-1">
            Tente ajustar os filtros ou adicione novas peças ao sistema.
          </p>
        </div>
      )}
    </>
  );
}
