/* eslint-disable react-hooks/exhaustive-deps */
import { X } from "lucide-react";
import { postPeca } from "../../services/api/pecasServices.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tratarErro } from "../default/funcoes.js";

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
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [numSerie, setNumSerie] = useState("");
  const [dataAquisicao, setDataAquisicao] = useState("");

  const [valido, setValido] = useState(false);

  useEffect(() => {
    if (tipo && nome && preco) setValido(true);
    else setValido(false);
  }, [tipo, nome, preco]);

  useEffect(() => {
    function onKeyDown(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") setAdiciona(false);
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
      await postPeca(
        localStorage.getItem("empresa_id"),
        tipo,
        nome,
        precoFormatado,
        dataAquisicao,
        numSerie
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
          setNome("");
          setPreco("");
          setDataAquisicao("");
          setNumSerie("");
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
        className="w-full max-w-xl bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6 animate-fade-in"
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
              onChange={(e) => setTipo(e.target.value)}
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-white/70">Nome</label>
              <span className="text-xs text-white/50">{nome.length}/150</span>
            </div>
            <input
              onChange={(e) => setNome(e.target.value)}
              type="text"
              maxLength={150}
              value={nome}
              placeholder="Digite o nome da peça"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
