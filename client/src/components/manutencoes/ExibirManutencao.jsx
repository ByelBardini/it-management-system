import AlterarIntervalo from "./AlterarIntervalo.jsx";
import { X, Edit, Check, Wrench } from "lucide-react";
import { formatToDate } from "brazilian-values";
import { realizarManutencao } from "../../services/api/manutencaoServices.js";
import { useState } from "react";
import { tratarErro } from "../default/funcoes.js";
import { useNavigate } from "react-router-dom";

const intervalos = {
  0: "Não é realizado",
  1: "A cada mês",
  3: "A cada 3 meses",
  6: "A cada 6 meses",
  12: "1 vez por ano",
};
export default function ExibirManutencao({
  setVisualizando,
  item,
  setNotificacao,
  buscarItens,
  setLoading,
  setConfirmacao,
}) {
  const navigate = useNavigate();

  const [editar, setEditar] = useState(false);

  async function realizar() {
    setConfirmacao({
      show: false,
      texto: "",
      onSim: null,
    });
    setLoading(true);
    try {
      await realizarManutencao(item.item_id);

      setLoading(false);
      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Manutenção atualizada com sucesso!",
        mensagem: "A data de manutenção foi atualizada com sucesso",
      });
      await buscarItens();

      setTimeout(() => {
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
        setVisualizando(false);
      }, 700);
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    }
  }
  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center">
      {editar && (
        <AlterarIntervalo
          interval={item.item_intervalo_manutencao}
          setEditar={setEditar}
          setVisualizando={setVisualizando}
          setNotificacao={setNotificacao}
          buscarItens={buscarItens}
          setLoading={setLoading}
          id={item.item_id}
        />
      )}
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="text-lg font-semibold text-white">
            Detalhes da Manutenção
          </h2>
          <button
            onClick={() => setVisualizando(false)}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/60">
              Data da Última Manutenção
            </label>
            <input
              disabled
              value={formatToDate(
                new Date(item.item_ultima_manutencao + "T03:00:00Z")
              )}
              className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="text-sm text-white/60">
              Intervalo entre manutenções
            </label>
            <input
              disabled
              value={intervalos[item.item_intervalo_manutencao]}
              className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/10 pt-4 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setEditar(true)}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-sm transition"
            >
              <Edit size={16} />
              Editar
            </button>
            <button
              onClick={() =>
                setConfirmacao({
                  show: true,
                  texto:
                    "Tem certeza que deseja marcar a manutenção como realizada? Essa ação é irreversível",
                  onSim: () => realizar(),
                })
              }
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm transition"
            >
              <Wrench size={16} />
              Realizada
            </button>
          </div>

          <button
            onClick={() => setVisualizando(false)}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm transition"
          >
            <Check size={16} />
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}
