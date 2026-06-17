/* eslint-disable react-hooks/exhaustive-deps */
import { X } from "lucide-react";
import { postModelo } from "../../services/api/modeloServices.js";
import { useState, useEffect } from "react";
import { tratarErro } from "../default/funcoes.js";
import { useNavigate } from "react-router-dom";

export default function AdicionarModelo({
  marcaId,
  marcaNome,
  setAdicionando,
  buscarDados,
  setNotificacao,
  setCarregando,
}) {
  const navigate = useNavigate();
  const [nomeModelo, setNomeModelo] = useState("");

  function enter(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      adicionaModelo();
    }
  }

  async function adicionaModelo() {
    if (nomeModelo == "") {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Insira todos os dados",
        mensagem: "O nome do modelo é obrigatório",
      });
    } else {
      setCarregando(true);
      try {
        await postModelo(marcaId, nomeModelo);

        setNotificacao({
          show: true,
          tipo: "sucesso",
          titulo: "Modelo inserido com sucesso",
          mensagem: "O modelo foi vinculado à marca selecionada.",
        });
        buscarDados();

        setTimeout(() => {
          setNotificacao(false);
          setAdicionando(false);
        }, 1000);
      } catch (err) {
        tratarErro(setNotificacao, err, navigate);
      } finally {
        setCarregando(false);
      }
    }
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setAdicionando(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-white/[0.03] ring-1 ring-white/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            Adicionar Modelo — {marcaNome}
          </h2>
          <button
            onClick={() => setAdicionando(false)}
            className="cursor-pointer p-2 rounded-lg hover:bg-white/10 text-white/70"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-white/70">Nome do Modelo</label>
              <span className="text-xs text-white/50">{nomeModelo.length}/100</span>
            </div>
            <input
              onChange={(e) => setNomeModelo(e.target.value)}
              type="text"
              maxLength={100}
              onKeyDown={enter}
              placeholder="Ex.: K120"
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-white text-sm placeholder-white/40
                         focus:outline-none focus:ring-2 focus:ring-sky-500/60 ring-1 ring-white/10"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={() => setAdicionando(false)}
            className="cursor-pointer px-4 py-2 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20"
          >
            Cancelar
          </button>
          <button
            onClick={adicionaModelo}
            className="cursor-pointer px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-500"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
