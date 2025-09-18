/* eslint-disable react-hooks/exhaustive-deps */
import TabelaSenhas from "../components/senhas/TabelaSenhas.jsx";
import CardSenha from "../components/senhas/CardSenha.jsx";
import ModalRegistraSenha from "../components/senhas/ModalRegistraSenha.jsx";
import Loading from "../components/default/Loading";
import Notificacao from "../components/default/Notificacao";
import ModalConfirmacao from "../components/default/ModalConfirmacao";
import CampoFiltros from "../components/senhas/CampoFiltros.jsx";
import {
  FunnelX,
  FunnelPlus,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getSenhas } from "../services/api/senhaServices.js";
import {
  getDiffDias,
  dividirEmPartes,
  tratarErro,
} from "../components/default/funcoes.js";
import { useNavigate } from "react-router-dom";

export default function Senhas() {
  const navigate = useNavigate();
  
  const [senhas, setSenhas] = useState([]);
  const [atrasadas, setAtrasadas] = useState();

  const [adicionaSenha, setAdicionaSenha] = useState(false);
  const [cardSenha, setCardSenha] = useState(false);

  const [notificacao, setNotificacao] = useState({
    show: false,
    tipo: "sucesso",
    titulo: "",
    mensagem: "",
  });
  const [confirmacao, setConfirmacao] = useState({
    show: false,
    texto: "",
    onSim: null,
  });
  const [loading, setLoading] = useState(false);

  const [filtrando, setFiltrando] = useState(false);
  const [senhasFiltradas, setSenhasFiltradas] = useState([]);
  const [senhasOrdenadas, setSenhasOrdenadas] = useState([]);

  const [sessao, setSessao] = useState(0);

  async function buscaSenhas() {
    const id = localStorage.getItem("empresa_id");
    setLoading(true);
    try {
      const senhas = await getSenhas(id);
      console.log(senhas);
      const vencidas = senhas.filter((senha) => {
        if (senha.senha_tempo_troca == 0) {
          return false;
        }
        const diffDias = getDiffDias(
          senha.senha_ultima_troca,
          senha.senha_tempo_troca
        );
        return diffDias < 1;
      }).length;

      setAtrasadas(vencidas);
      setLoading(false);

      setSenhas(senhas);
      setSenhasFiltradas(senhas);
    } catch (err) {
      setLoading(false);
      tratarErro(setNotificacao, err, navigate);
    }
  }

  useEffect(() => {
    buscaSenhas();
  }, []);

  useEffect(() => {
    const ordenadas = dividirEmPartes(senhasFiltradas, 10);
    setSenhasOrdenadas(ordenadas);
    setSessao(0);
  }, [senhasFiltradas]);

  return (
    <div className="p-6">
      {adicionaSenha && (
        <ModalRegistraSenha
          setAdicionaSenha={setAdicionaSenha}
          setNotificacao={setNotificacao}
          buscaSenhas={buscaSenhas}
          setLoading={setLoading}
        />
      )}
      {cardSenha && (
        <CardSenha
          setNotificacao={setNotificacao}
          setCardSenha={setCardSenha}
          setConfirmacao={setConfirmacao}
          buscaSenhas={buscaSenhas}
          setLoading={setLoading}
        />
      )}

      {confirmacao.show && (
        <ModalConfirmacao
          texto={confirmacao.texto}
          onNao={() => setConfirmacao({ show: false, texto: "", onSim: null })}
          onSim={confirmacao.onSim}
        />
      )}
      {notificacao.show && (
        <Notificacao
          tipo={notificacao.tipo}
          titulo={notificacao.titulo}
          mensagem={notificacao.mensagem}
          onClick={() =>
            setNotificacao({
              show: false,
              tipo: "sucesso",
              titulo: "",
              mensagem: "",
            })
          }
        />
      )}
      {loading && <Loading />}
      <div className="rounded-2xl bg-white/5 backdrop-blur-md ring-1 ring-white/10 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Senhas</h2>
          {filtrando ? (
            <CampoFiltros
              senhas={senhas}
              setSenhasFiltradas={setSenhasFiltradas}
              filtrando={filtrando}
            />
          ) : (
            <p className="text-sm text-white/70 flex items-center gap-2">
              Senhas atrasadas:
              <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 text-xs font-semibold border border-rose-400/20">
                {atrasadas}
              </span>
            </p>
          )}
          <div className="flex gap-4 ">
            <div className="flex gap-2">
              <button
                onClick={() => setFiltrando(!filtrando)}
                className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition"
              >
                {filtrando ? <FunnelX size={18} /> : <FunnelPlus size={18} />}
              </button>

              <button
                onClick={() => setAdicionaSenha(true)}
                className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition"
              >
                <Plus size={18} />
                <span className="text-sm font-medium">Adicionar</span>
              </button>
            </div>
          </div>
        </div>
        <TabelaSenhas
          senhas={senhasOrdenadas[sessao] || []}
          setCardSenha={setCardSenha}
        />
      </div>
      <div className="fixed bottom-0 left-0 w-full flex items-center justify-center pb-4">
        <div className="flex-1 flex justify-center items-center gap-4">
          <button
            disabled={sessao === 0}
            onClick={() => setSessao((prev) => prev - 1)}
            className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-40 disabled:cursor-default"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm text-white/70">
            Página {sessao + 1} de {senhasOrdenadas.length}
          </span>

          <button
            disabled={sessao === senhasOrdenadas.length - 1}
            onClick={() => setSessao((prev) => prev + 1)}
            className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-40 disabled:cursor-default"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
