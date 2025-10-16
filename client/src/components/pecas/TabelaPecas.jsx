import tipos from "./tiposPecas.js";
import { SearchX, Trash2 } from "lucide-react";
import { formatToDate, formatToBRL } from "brazilian-values";
import { useState } from "react";

export default function TabelaPecas({
  pecas = [],
  inativos,
  setNotificacao,
  setConfirmacao,
  inativar,
}) {
  const [selecionado, setSelecionado] = useState(null);

  const handleSelecionar = (id) => {
    setSelecionado((prev) => (prev === id ? null : id));
  };

  async function inativaItem(id, status) {
    setConfirmacao(false);
    if (status == 1) {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Peça em uso",
        mensagem: "Não é possível inativar uma peça que está em uso.",
      });
    } else {
      await inativar(id);
      setSelecionado(null);
    }
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
            {!inativos && (
              <th className="px-6 py-3 font-medium">Data de Aquisição</th>
            )}
            {!inativos && <th className="px-6 py-3 font-medium">Em uso</th>}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {pecas.map((peca) => (
            <tr
              key={peca.peca_id}
              onClick={() => handleSelecionar(peca.peca_id)}
              className={`transition-all duration-200 ${
                selecionado === peca.peca_id
                  ? "bg-white/10 shadow-inner"
                  : "hover:bg-white/5"
              }`}
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
                <td className="px-6 py-3 text-white/80">
                  {formatToDate(
                    new Date(peca.peca_data_aquisicao + "T03:00:00Z")
                  )}
                </td>
              )}

              {!inativos && (
                <td className="px-6 py-3 text-center">
                  <div className="flex items-center justify-start gap-2 relative">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                        peca.peca_em_uso
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {peca.peca_em_uso ? "Sim" : "Não"}
                    </span>

                    {selecionado === peca.peca_id && (
                      <div
                        className={`absolute right-3 flex items-center transition-all duration-200
                                    ${
                                      selecionado === peca.peca_id
                                        ? "opacity-100 scale-100"
                                        : "opacity-0 scale-75 pointer-events-none"
                                    }`}
                      >
                        <button
                          className="cursor-pointer rounded-md hover:bg-red-500/10 transition"
                          title="Inativar peça"
                          onClick={() =>
                            setConfirmacao({
                              show: true,
                              onNao: () => setConfirmacao(false),
                              texto:
                                "tem certeza que deseja inativar esta peça?",
                              onSim: () =>
                                inativaItem(peca.peca_id, peca.peca_em_uso),
                              tipo: "atencao",
                            })
                          }
                        >
                          <Trash2
                            size={20}
                            className="text-red-500 hover:text-red-400 transition-transform duration-200 hover:scale-110"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {pecas.length === 0 && (
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
