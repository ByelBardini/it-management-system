/* eslint-disable react-hooks/exhaustive-deps */
import { X, Download, Upload, FileSpreadsheet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tratarErro } from "../default/funcoes.js";
import { importarItens } from "../../services/api/itemServices.js";
import { importarPecas } from "../../services/api/pecasServices.js";
import {
  parseCsv,
  gerarModeloCsv,
  validarLinhasItem,
  validarLinhasPeca,
  linhasParaPayloadItem,
  linhasParaPayloadPeca,
} from "./importacaoCsv.js";

export default function ModalImportar({
  dominio,
  onClose,
  onConcluido,
  setNotificacao,
  setLoading,
}) {
  const navigate = useNavigate();
  const ehPeca = dominio === "peca";
  const titulo = ehPeca ? "Importar Peças" : "Importar Itens";

  const [nomeArquivo, setNomeArquivo] = useState("");
  const [linhas, setLinhas] = useState([]);
  const [erros, setErros] = useState([]);
  // Token de seleção: descarta o resultado de um arquivo se outro foi escolhido no meio.
  const selecaoRef = useRef(0);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function baixarModelo() {
    const conteudo = gerarModeloCsv(dominio);
    const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ehPeca ? "modelo-pecas.csv" : "modelo-itens.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function onSelecionarArquivo(e) {
    const arquivo = e.target.files?.[0];
    // Limpa o value pra permitir re-selecionar o MESMO arquivo (após editá-lo).
    e.target.value = "";
    if (!arquivo) return;

    // Marca esta seleção; se outra começar antes do parse terminar, descartamos a antiga.
    const selecao = ++selecaoRef.current;

    // Zera o estado antes do trabalho assíncrono pra nunca exibir o nome de um
    // arquivo novo junto das linhas/erros do anterior.
    setNomeArquivo(arquivo.name);
    setLinhas([]);
    setErros([]);
    try {
      const texto = await arquivo.text();
      const registros = parseCsv(texto);
      const problemas = ehPeca
        ? validarLinhasPeca(registros)
        : validarLinhasItem(registros);
      if (selecao !== selecaoRef.current) return; // seleção obsoleta
      setLinhas(registros);
      setErros(problemas);
    } catch (err) {
      if (selecao !== selecaoRef.current) return;
      setNomeArquivo("");
      tratarErro(setNotificacao, err, navigate);
    }
  }

  async function importar() {
    if (linhas.length === 0 || erros.length > 0) return;
    setLoading(true);
    try {
      const id_empresa = localStorage.getItem("empresa_id");
      const payload = ehPeca
        ? linhasParaPayloadPeca(linhas)
        : linhasParaPayloadItem(linhas);
      const resposta = ehPeca
        ? await importarPecas(id_empresa, payload)
        : await importarItens(id_empresa, payload);

      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Importação concluída",
        mensagem: `${resposta?.criados ?? linhas.length} registro(s) importado(s) com sucesso.`,
      });
      onConcluido?.();
      onClose();
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    } finally {
      setLoading(false);
    }
  }

  const podeImportar = linhas.length > 0 && erros.length === 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#0E1A38] rounded-xl ring-1 ring-white/10 p-6 space-y-6 animate-fade-in"
      >
        <div className="flex justify-between items-center border-b border-white/20 pb-3">
          <h2 className="text-lg font-semibold text-white">{titulo}</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-white/70">
            Baixe o modelo, preencha uma linha por{" "}
            {ehPeca ? "peça" : "item"} e envie o arquivo CSV. Datas no formato{" "}
            <span className="text-white/90">AAAA-MM-DD</span> e preço com ponto
            decimal (ex.: 499.90).
          </p>

          <button
            onClick={baixarModelo}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition"
          >
            <Download size={18} />
            <span className="text-sm font-medium">Baixar modelo CSV</span>
          </button>

          <div>
            <label className="block text-sm text-white/70 mb-1">
              Arquivo CSV
            </label>
            <label className="cursor-pointer flex items-center gap-2 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white/80 hover:bg-white/15 transition">
              <FileSpreadsheet size={18} className="text-white/60" />
              <span className="text-sm truncate">
                {nomeArquivo || "Selecionar arquivo..."}
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={onSelecionarArquivo}
                className="hidden"
              />
            </label>
          </div>

          {nomeArquivo && (
            <div className="text-sm">
              {linhas.length === 0 && erros.length === 0 ? (
                <span className="text-amber-400">
                  Nenhuma linha encontrada no arquivo.
                </span>
              ) : erros.length === 0 ? (
                <span className="text-emerald-400">
                  {linhas.length} linha(s) pronta(s) para importar.
                </span>
              ) : (
                <div className="space-y-1">
                  <span className="text-rose-400">
                    {erros.length} linha(s) com problema — corrija o arquivo:
                  </span>
                  <div className="max-h-40 overflow-y-auto rounded-lg bg-rose-500/10 ring-1 ring-rose-500/20 p-2 space-y-0.5">
                    {erros.map((e) => (
                      <p key={e.linha} className="text-rose-300 text-xs">
                        Linha {e.linha}: {e.motivo}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            onClick={importar}
            disabled={!podeImportar}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition ${
              podeImportar
                ? "cursor-pointer bg-blue-600 hover:bg-blue-500"
                : "cursor-not-allowed bg-white/10 text-white/40"
            }`}
          >
            <Upload size={18} />
            Importar
          </button>
        </div>
      </div>
    </div>
  );
}
