/* eslint-disable react-hooks/exhaustive-deps */
import { X, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { putManutencao } from "../../services/api/manutencaoServices.js";
import { tratarErro } from "../default/funcoes.js";
import { useNavigate } from "react-router-dom";

export default function AlterarIntervalo({
  interval,
  setEditar,
  setNotificacao,
  buscarItens,
  setLoading,
  id,
  setVisualizando,
}) {
  const navigate = useNavigate();

  const [intervalo, setIntervalo] = useState("");

  useEffect(() => {
    setIntervalo(interval);
  }, [interval]);

  async function editarItem() {
    if (intervalo == "") {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Intervalo inválido",
        mensagem: "Um intervalo é necessário para atualizar o item",
      });
      return;
    }
    setLoading(true);
    try {
      await putManutencao(id, intervalo);
      setLoading(false);

      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Intervalo atualizado",
        mensagem: "Intervalo de manutenção atualizado com sucesso",
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
        setEditar(false);
      }, 700);
    } catch (err) {
      setLoading(false);
      tratarErro(setNotificacao, err, navigate);
    }
  }

  useEffect(() => {
    function onKeyDown(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") setEditar(false);
    }
    window.addEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="text-lg font-semibold text-white">
            Alterar Intervalo de Manutenção
          </h2>
          <button
            onClick={() => setEditar(false)}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/70">
            Selecione o novo intervalo:
          </label>
          <select
            onChange={(e) => setIntervalo(e.target.value)}
            value={intervalo}
            className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option hidden value="" className="bg-zinc-900">
              Selecione...
            </option>
            <option value={0} className="bg-zinc-900">
              Nunca
            </option>
            <option value={1} className="bg-zinc-900">
              1 mês
            </option>
            <option value={3} className="bg-zinc-900">
              3 meses
            </option>
            <option value={6} className="bg-zinc-900">
              6 meses
            </option>
            <option value={12} className="bg-zinc-900">
              1 ano
            </option>
          </select>
        </div>

        <div className="flex justify-end border-t border-white/10 pt-4">
          <button
            onClick={editarItem}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm transition"
          >
            <Save size={16} />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
