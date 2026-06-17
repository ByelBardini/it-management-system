/* eslint-disable react-hooks/exhaustive-deps */
import AdicionarSetor from "../components/setores/AdicionarSetor.jsx";
import Notificacao from "../components/default/Notificacao.jsx";
import Loading from "../components/default/Loading.jsx";
import ModalConfirmacao from "../components/default/ModalConfirmacao.jsx";
import CartaoMarcas from "../components/marca/CartaoMarcas.jsx";
import { Plus, Building2, SearchX, Trash2 } from "lucide-react";
import { useState } from "react";
import { getSetores, deleteSetor } from "../services/api/setorServices.js";
import { useEffect } from "react";
import { tratarErro } from "../components/default/funcoes.js";
import { useNavigate } from "react-router-dom";

export default function Configuracoes() {
  const navigate = useNavigate();

  const [adicionandoSetor, setAdicionandoSetor] = useState(false);

  const [setores, setSetores] = useState([]);

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

  const [carregando, setCarregando] = useState(false);

  async function deletarSetor(id) {
    setCarregando(true);
    setConfirmacao({
      show: false,
      texto: "",
      onSim: null,
    });
    try {
      await deleteSetor(id);

      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Setor deletado com sucesso",
        mensagem:
          "O setor foi excluído com sucesso, não irá mais aparecer nas seleções de setor",
      });
      buscarDados();

      setTimeout(() => {
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
        setNotificacao(false);
      }, 1000);
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    } finally {
      setCarregando(false);
    }
  }

  async function buscarDados() {
    setCarregando(true);
    try {
      const setores = await getSetores(localStorage.getItem("empresa_id"));
      setSetores(setores || []);
      setCarregando(false);
    } catch (err) {
      setCarregando(false);
      tratarErro(setNotificacao, err, navigate);
    }
  }

  useEffect(() => {
    buscarDados();
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {confirmacao.show && (
        <ModalConfirmacao
          texto={confirmacao.texto}
          onNao={() =>
            setConfirmacao({
              show: false,
              texto: "",
              onSim: null,
            })
          }
          onSim={confirmacao.onSim}
        />
      )}
      {adicionandoSetor && (
        <AdicionarSetor
          setAdicionando={setAdicionandoSetor}
          buscarDados={buscarDados}
          setNotificacao={setNotificacao}
          setCarregando={setCarregando}
        />
      )}
      {notificacao.show && (
        <Notificacao
          onClick={() =>
            setNotificacao({
              show: false,
              tipo: "sucesso",
              titulo: "",
              mensagem: "",
            })
          }
          tipo={notificacao.tipo}
          titulo={notificacao.titulo}
          mensagem={notificacao.mensagem}
        />
      )}
      {carregando && <Loading />}
      <div className="h-auto rounded-xl bg-white/[0.03] ring-1 ring-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 size={20} /> Setores da Empresa
          </h2>
          <button
            onClick={() => setAdicionandoSetor(true)}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-500 transition"
          >
            <Plus size={18} />
            Adicionar Setor
          </button>
        </div>

        <div className="divide-y divide-white/10">
          {setores.length > 0 ? (
            setores.map((setor) => (
              <div
                key={setor.setor_id}
                className="flex items-center justify-between px-6 py-3 hover:bg-white/5 transition"
              >
                <span className="text-white/80 text-sm">
                  {setor.setor_nome}
                </span>
                <button
                  onClick={() =>
                    setConfirmacao({
                      show: true,
                      texto:
                        "Você tem certeza que deseja excluir esse setor? Essa ação é IRREVERSÍVEL",
                      onSim: () => {
                        deletarSetor(setor.setor_id);
                      },
                    })
                  }
                  className="cursor-pointer p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Remover setor"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="p-6 flex items-center justify-center gap-2 px-6 py-3 hover:bg-white/5 transition">
              <SearchX size={18} />
              Nenhum setor encontrado
            </div>
          )}
        </div>
      </div>

      <CartaoMarcas
        setNotificacao={setNotificacao}
        setCarregando={setCarregando}
      />
    </div>
  );
}
