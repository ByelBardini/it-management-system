/* eslint-disable react-hooks/exhaustive-deps */
import { X } from "lucide-react";
import { postPeca } from "../../services/api/pecasServices.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tratarErro } from "../default/funcoes.js";
import SelecaoMarcaModelo from "../inventario/SelecaoMarcaModelo.jsx";
import {
  CAMPOS_ESPECIFICACAO,
  ROTULOS,
  construirEspecificacoes,
} from "./especificacoes.js";

function formatarRealDinamico(valor) {
  valor = valor.replace(/\D/g, "");
  if (!valor) return "R$ 0,00";
  valor = (parseInt(valor, 10) / 100).toFixed(2);
  valor = valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${valor}`;
}

export default function ModalCadastraPecas({
  setAdiciona,
  setNotificacao,
  setLoading,
  buscarPecas,
  setConfirmacao,
}) {
  const navigate = useNavigate();

  const [tipo, setTipo] = useState("");
  const [marcaId, setMarcaId] = useState(null);
  const [modeloId, setModeloId] = useState(null);
  const [preco, setPreco] = useState("");
  const [numSerie, setNumSerie] = useState("");
  const [dataAquisicao, setDataAquisicao] = useState("");
  const [especs, setEspecs] = useState({});

  const [valido, setValido] = useState(false);

  const camposEspec = CAMPOS_ESPECIFICACAO[tipo] || [];

  useEffect(() => {
    if (tipo && preco && numSerie) setValido(true);
    else setValido(false);
  }, [tipo, preco, numSerie]);

  function aplicarMarcaModelo(patch) {
    if ("marcaId" in patch) setMarcaId(patch.marcaId);
    if ("modeloId" in patch) setModeloId(patch.modeloId);
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setAdiciona(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  async function handleSalvar() {
    if (!valido) {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Campos obrigatórios",
        mensagem: "Preencha todos os campos obrigatórios antes de continuar.",
      });
      return;
    }

    setLoading(true);
    try {
      const precoFormatado = parseInt(preco.replace(/\D/g, ""), 10) / 100;
      const especificacoes = construirEspecificacoes(tipo, especs);
      await postPeca(
        localStorage.getItem("empresa_id"),
        tipo,
        precoFormatado,
        dataAquisicao,
        numSerie,
        marcaId,
        modeloId,
        Object.keys(especificacoes).length ? especificacoes : null
      );
      setConfirmacao({
        show: true,
        texto: "Peça cadastrada com sucesso! Deseja cadastrar outra peça?",
        onNao: () => {
          setConfirmacao({ show: false, texto: "", onSim: null });
          setAdiciona(false);
        },
        onSim: () => {
          setConfirmacao({ show: false, texto: "", onSim: null });
          setTipo("");
          setMarcaId(null);
          setModeloId(null);
          setPreco("");
          setDataAquisicao("");
          setNumSerie("");
          setEspecs({});
        },
        tipo: "sucesso",
      });
      await buscarPecas();
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={() => setAdiciona(false)}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#0E1A38] rounded-xl ring-1 ring-white/10 p-6 space-y-6 animate-fade-in"
      >
        <div className="flex justify-between items-center border-b border-white/20 pb-3">
          <h2 className="text-lg font-semibold text-white">Cadastrar Peça</h2>
          <button
            onClick={() => setAdiciona(false)}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Tipo</label>
            <select
              onChange={(e) => {
                setTipo(e.target.value);
                setMarcaId(null);
                setModeloId(null);
                setEspecs({});
              }}
              value={tipo}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option hidden value={""}>
                Selecione o tipo...
              </option>
              <option value="processador">Processador</option>
              <option value="placa-video">Placa de Vídeo</option>
              <option value="placa-mae">Placa-Mãe</option>
              <option value="ram">Memória RAM</option>
              <option value="armazenamento">Armazenamento</option>
              <option value="fonte">Fonte</option>
              <option value="placa-rede">Placa de Rede</option>
              <option value="gabinete">Gabinete</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <SelecaoMarcaModelo
            dominio="peca"
            tipo={tipo}
            marcaId={marcaId}
            modeloId={modeloId}
            onChange={aplicarMarcaModelo}
            setNotificacao={setNotificacao}
          />

          {camposEspec.length > 0 && (
            <div>
              <label className="block text-sm text-white/70 mb-1">
                Especificações
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {camposEspec.map((campo) => (
                  <div key={campo.chave}>
                    <label className="block text-xs text-white/50 mb-1">
                      {ROTULOS[campo.chave] ?? campo.chave}
                    </label>
                    {campo.opcoes ? (
                      <select
                        value={especs[campo.chave] ?? ""}
                        onChange={(e) =>
                          setEspecs((prev) => ({
                            ...prev,
                            [campo.chave]: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="" className="bg-zinc-900">
                          —
                        </option>
                        {campo.opcoes.map((op) => (
                          <option key={op} value={op} className="bg-zinc-900">
                            {op}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={especs[campo.chave] ?? ""}
                        onChange={(e) =>
                          setEspecs((prev) => ({
                            ...prev,
                            [campo.chave]: e.target.value,
                          }))
                        }
                        placeholder={campo.placeholder ?? ""}
                        className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-white/70">Número de Série</label>
              <span className="text-xs text-white/50">
                {numSerie.length}/150
              </span>
            </div>
            <input
              onChange={(e) => setNumSerie(e.target.value)}
              type="text"
              maxLength={150}
              value={numSerie}
              placeholder="Digite o número de série da peça"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Preço</label>
            <input
              value={preco}
              onChange={(e) => setPreco(formatarRealDinamico(e.target.value))}
              type="text"
              placeholder="Ex: 499,90"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">
              Data de Aquisição
            </label>
            <input
              onChange={(e) => setDataAquisicao(e.target.value)}
              type="date"
              value={dataAquisicao}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            onClick={handleSalvar}
            disabled={!valido}
            className={`px-4 py-2 rounded-lg text-white font-medium transition 
                        ${
                          valido
                            ? "cursor-pointer bg-blue-600 hover:bg-blue-500"
                            : "cursor-not-allowed bg-white/10 text-white/40"
                        }`}
          >
            Salvar Peça
          </button>
        </div>
      </div>
    </div>
  );
}
