import TabelaSenhas from "../components/senhas/TabelaSenhas.jsx";
import CardSenha from "../components/senhas/CardSenha.jsx";
import ModalRegistraSenha from "../components/senhas/ModalRegistraSenha.jsx";
import Loading from "../components/default/Loading";
import Notificacao from "../components/default/Notificacao";
import ModalConfirmacao from "../components/default/ModalConfirmacao";
import { useEffect, useState } from "react";
import { getSenhas } from "../services/api/senhaServices.js";

export default function Senhas() {
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

  async function buscaSenhas() {
    const id = localStorage.getItem("empresa_id");
    try {
      const senhas = await getSenhas(id);
      console.log(senhas);

      const hoje = new Date();
      const vencidas = senhas.filter((senha) => {
        if (senha.senha_tempo_troca == 0) {
          return false;
        }
        const ultimaTroca = new Date(senha.senha_ultima_troca);
        const prazo = senha.senha_tempo_troca || 0;
        const proximaTroca = new Date(
          ultimaTroca.getTime() + prazo * 24 * 60 * 60 * 1000
        );
        return proximaTroca < hoje;
      }).length;

      setAtrasadas(vencidas);

      setSenhas(senhas);
    } catch (err) {
      console.error("Erro ao buscar senhas:", err);
    }
  }

  useEffect(() => {
    buscaSenhas();
  }, []);

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
      {cardSenha && <CardSenha setCardSenha={setCardSenha} />}

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
          <p className="text-sm text-white/70 flex items-center gap-2">
            Senhas atrasadas:
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 text-xs font-semibold border border-rose-400/20">
              {atrasadas}
            </span>
          </p>
          <button
            onClick={() => setAdicionaSenha(true)}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition"
          >
            + Adicionar
          </button>
        </div>
        <TabelaSenhas senhas={senhas} setCardSenha={setCardSenha} />
      </div>
    </div>
  );
}
