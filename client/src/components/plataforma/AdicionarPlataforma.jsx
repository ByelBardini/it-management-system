/* eslint-disable react-hooks/exhaustive-deps */
import { X } from "lucide-react";
import { postPlataforma } from "../../services/api/plataformaServices.js";
import { useState } from "react";
import { tratarErro } from "../default/funcoes.js";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AdicionarPlataforma({
  setAdicionando,
  buscarDados,
  setNotificacao,
  setCarregando,
}) {
  const navigate = useNavigate();

  const [nomePlataforma, setNomePlataforma] = useState("");

  function enter(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      adicionaPlataforma();
    }
  }

  async function adicionaPlataforma() {
    if (nomePlataforma == "") {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Insira todos os dados",
        mensagem: "O nome da plataforma é obrigatório",
      });
    } else {
      setCarregando(true);
      try {
        await postPlataforma(nomePlataforma);

        setNotificacao({
          show: true,
          tipo: "sucesso",
          titulo: "Plataforma inserida com sucesso",
          mensagem:
            "A plataforma foi inserida com sucesso, você será redirecionado novamente à aba de configuração",
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
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") setAdicionando(false);
    }
    window.addEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            Adicionar Plataforma
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
              <label className="text-sm text-white/70">
                Nome da Plataforma
              </label>
              <span className="text-xs text-white/50">
                {nomePlataforma.length}/150
              </span>
            </div>
            <input
              onChange={(e) => {
                setNomePlataforma(e.target.value);
              }}
              type="text"
              maxLength={150}
              onKeyDown={enter}
              placeholder="Digite o nome..."
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
            onClick={adicionaPlataforma}
            className="cursor-pointer px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-500"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
