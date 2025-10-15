/* eslint-disable react-hooks/exhaustive-deps */
import tipos from "./tiposCarac.js";
import { useState } from "react";
import { Download, X, Inbox } from "lucide-react";
import { getItemFull } from "../../services/api/itemServices.js";
import { useEffect } from "react";
import { formatToBRL, formatToDate } from "brazilian-values";

export default function CardItem({
  setCardItem,
  setEditarItem = () => {},
  setItemSelecionado = () => {},
  inativos = true,
}) {
  const [showAnexos, setShowAnexos] = useState(false);
  const [item, setItem] = useState([]);

  async function buscaDados() {
    const id = localStorage.getItem("item_id");
    const dados = await getItemFull(id);
    setItem(dados);
    setItemSelecionado(dados);
    console.log(dados);
  }

  async function baixar(caminho) {
    const url = `POST ${
      import.meta.env.VITE_API_BASE_URL
    }/login/download?path=${encodeURIComponent(caminho)}`;
    const token = localStorage.getItem("token");
    const resp = await fetch(url, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!resp.ok) {
      return;
    }

    const blob = await resp.blob();
    const nome = caminho.split("/").pop() || "arquivo";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setCardItem(false);
    }
    window.addEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    buscaDados();
  }, []);

  return (
    <div
      onClick={() => setCardItem(false)}
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] bg-white/5 rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6 relative backdrop-blur-3xl overflow-y-auto"
      >
        <div className="flex justify-between items-center top-0 bg-white/5 backdrop-blur-3xl pb-3 z-10 rounded-2xl p-2">
          <h2 className="text-lg font-semibold text-white">Detalhes do Item</h2>
          <div className="flex gap-3">
            {!inativos ? (
              <button
                onClick={() => setEditarItem(true)}
                className="cursor-pointer px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm text-white"
              >
                Editar
              </button>
            ) : (
              ""
            )}
            <button
              className="cursor-pointer px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm text-white"
              onClick={() => setShowAnexos(!showAnexos)}
            >
              {showAnexos ? "Fechar Anexos" : "Anexos"}
            </button>
            <button
              onClick={() => setCardItem(false)}
              className="cursor-pointer text-white/60 hover:text-white text-lg mr-2"
            >
              <X />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-white/60">Nome</label>
            <div className="rounded-lg bg-white/10 p-2 text-white">
              {item.item_nome}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60">Tipo</label>
            <div className="rounded-lg bg-white/10 p-2 text-white">
              {item.item_tipo}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60">Setor</label>
            <div className="rounded-lg bg-white/10 p-2 text-white">
              {item.setor == null ? "N/A" : item.setor.setor_nome}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60">Workstation</label>
            <div className="rounded-lg bg-white/10 p-2 text-white">
              {item.workstation == null
                ? "N/A"
                : item.workstation.workstation_nome}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60">Etiqueta</label>
            <div className="rounded-lg bg-white/10 p-2 text-white">
              {item.item_etiqueta}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60">Nº Série</label>
            <div className="rounded-lg bg-white/10 p-2 text-white">
              {item.item_num_serie}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60">Preço</label>
            <div className="rounded-lg bg-white/10 p-2 text-white">
              {formatToBRL(item.item_preco)}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60">
              Data Aquisição
            </label>
            <div className="rounded-lg bg-white/10 p-2 text-white">
              {formatToDate(new Date(item.item_data_aquisicao + "T03:00:00Z"))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium text-white mb-3">
            Características
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {item.caracteristicas != null &&
              item.caracteristicas
                .filter(
                  (caracteristica) =>
                    caracteristica.caracteristica_nome != "observacoes"
                )
                .map((caracteristica) => (
                  <div key={caracteristica.caractetistica_id}>
                    <label className="block text-sm text-white/60">
                      {tipos[caracteristica.caracteristica_nome]}
                    </label>
                    <div className="rounded-lg bg-white/10 p-2 text-white">
                      {caracteristica.caracteristica_valor}
                    </div>
                  </div>
                ))}
          </div>
          <div>
            <label className="block text-sm text-white/60">Observações</label>
            <div className="rounded-lg bg-white/10 p-3 text-white h-24">
              {item.caracteristicas != null &&
              item.caracteristicas.find(
                (caracteristica) =>
                  caracteristica.caracteristica_nome == "observacoes"
              )
                ? item.caracteristicas.find(
                    (caracteristica) =>
                      caracteristica.caracteristica_nome == "observacoes"
                  ).caracteristica_valor
                : "N/A"}
            </div>
          </div>
        </div>

        {showAnexos && (
          <div className="mt-6 border-t border-white/20 pt-4">
            <h3 className="text-md font-medium text-white mb-3">Anexos</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {item.anexos != null &&
                item.anexos.map((anexo) => (
                  <div
                    key={anexo.anexo_id}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-2"
                  >
                    <div>
                      <p className="text-sm text-white">{anexo.anexo_nome}</p>
                      <p className="text-xs text-white/60">
                        {anexo.anexo_tipo}
                      </p>
                    </div>
                    <button
                      onClick={() => baixar(anexo.anexo_caminho)}
                      className="cursor-pointer p-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              {item.anexos.length == 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-10 rounded-lg bg-white/5 border border-dashed border-white/20">
                  <Inbox className="w-10 h-10 text-white" />
                  <p className="text-sm text-white/60">
                    Nenhum anexo disponível
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
