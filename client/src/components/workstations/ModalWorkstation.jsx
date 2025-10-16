/* eslint-disable react-hooks/exhaustive-deps */
import tipos from "../inventario/tiposItens.js";
import { X, Trash2, ExternalLink, LaptopMinimal } from "lucide-react";
import {
  getItensWorkstation,
  removerWorkstation,
} from "../../services/api/itemServices.js";
import { deleteWorkstation } from "../../services/api/workstationServices.js";
import { useState } from "react";
import { useEffect } from "react";
import { tratarErro } from "../default/funcoes.js";
import { useNavigate } from "react-router-dom";

export default function ModalWorkstation({
  setCardWorkstation,
  setNotificacao,
  setConfirmacao,
  setCarregando,
  setCardItem,
  buscarWorkstations,
}) {
  const navigate = useNavigate();
  const anydesk = localStorage.getItem("workstation_anydesk");
  const senha = localStorage.getItem("workstation_senha_anydesk");

  const [itens, setItens] = useState([]);

  const [exibirAnydesk, setExibirAnydesk] = useState(false);

  function abreItem(id) {
    localStorage.setItem("item_id", id);
    setCardItem(true);
  }

  async function buscaItens() {
    const id = localStorage.getItem("workstation_id");
    try {
      const itens = await getItensWorkstation(id);

      setItens(itens);
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    }
  }

  async function removerItem(id) {
    setConfirmacao({
      show: false,
      texto: "",
      onSim: null,
    });
    setCarregando(true);
    try {
      await removerWorkstation(id);

      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Operação realizada com sucesso!",
        mensagem: "Item desvinculado com sucesso!",
      });
      await buscaItens();

      setTimeout(() => {
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
      }, 1000);
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    } finally {
      setCarregando(false);
    }
  }

  async function excluirWorkstation() {
    setConfirmacao({
      show: false,
      texto: "",
      onSim: null,
    });
    const id = localStorage.getItem("workstation_id");
    setCarregando(true);
    try {
      await deleteWorkstation(id);

      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Operação realizada com sucesso!",
        mensagem: "Workstation excluída com sucesso!",
      });
      await buscarWorkstations();

      setTimeout(() => {
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
        setCardWorkstation(false);
      }, 1000);
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscaItens();
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") setCardWorkstation(false);
    }
    window.addEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      onClick={() => setCardWorkstation(false)}
      className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6"
      >
        <div className="flex justify-between items-center border-b border-white/20 pb-3">
          <h2 className="text-lg font-semibold text-white">
            Itens da Workstation
          </h2>
          <button
            onClick={() => setCardWorkstation(false)}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X />
          </button>
        </div>

        <div className="space-y-3">
          {itens.map((item) => (
            <div
              key={item.item_id}
              className="grid grid-cols-4 items-center gap-6 rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/10"
            >
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/50">
                  Etiqueta
                </p>
                <p className="text-sm font-medium text-white">
                  {item.item_etiqueta}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/50">
                  Tipo
                </p>
                <p className="text-sm font-medium text-white">
                  {tipos[item.item_tipo] ?? item.item_tipo}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/50">
                  Nome
                </p>
                <p className="text-sm font-medium text-white">
                  {item.item_nome}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => abreItem(item.item_id)}
                  className="cursor-pointer inline-flex items-center justify-center rounded-md px-2 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    setConfirmacao({
                      show: true,
                      texto:
                        "Você tem certeza que deseja desvincular este item do workstation?",
                      onSim: () => removerItem(item.item_id),
                    })
                  }
                  className="cursor-pointer inline-flex items-center justify-center rounded-md px-2 py-2 text-sm bg-red-600 hover:bg-red-500 text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {itens.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-white/5 ring-1 ring-white/10 text-center">
              <p className="text-lg font-medium text-white/80">
                Nenhum item vinculado!
              </p>
              <p className="text-sm text-white/50 mt-1">
                Esta workstation ainda não possui itens associados.
              </p>
            </div>
          )}
        </div>
        <div className="w-full flex items-center justify-between gap-4 py-2">
          {anydesk != "" && senha != "" && (
            <button
              onClick={() => setExibirAnydesk(!exibirAnydesk)}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-400 hover:bg-red-500 text-white text-sm font-medium shadow-sm transition"
            >
              <LaptopMinimal size={16} />
              <span>Anydesk</span>
            </button>
          )}

          {exibirAnydesk && (
            <div className="flex flex-col items-center text-center px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 backdrop-blur-sm shadow-inner transition animate-fade-in">
              <span className="text-sm font-semibold tracking-wide">
                {anydesk}
              </span>
              <span className="text-xs text-white/60 mt-0.5">
                Senha: {senha}
              </span>
            </div>
          )}

          <div
            className={`justify-end flex ${
              anydesk == "" && senha == "" && "w-full"
            }`}
          >
            <button
              onClick={() =>
                setConfirmacao({
                  show: true,
                  texto:
                    "Você tem certeza que deseja excluir esse workstation? Essa ação é irreversível, todos os itens vinculados perderão o vínculo.",
                  onSim: () => excluirWorkstation(),
                })
              }
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium shadow-sm transition"
            >
              <Trash2 size={16} />
              <span>Excluir Workstation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
