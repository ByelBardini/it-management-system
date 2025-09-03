import AdicionarSetor from "../components/setores/AdicionarSetor.jsx";
import Notificacao from "../components/default/Notificacao.jsx";
import Loading from "../components/default/Loading.jsx";
import ModalConfirmacao from "../components/default/ModalConfirmacao.jsx";
import { Plus, Building2, SearchX, Trash2 } from "lucide-react";
import { useState } from "react";
import { getSetores, deleteSetor } from "../services/api/setorServices.js";
import { useEffect } from "react";

export default function Configuracoes() {
  const [adicionando, setAdicionando] = useState(false);
  const [modificado, setModificado] = useState(false);
  const [setores, setSetores] = useState([]);

  const [confirmacao, setConfirmacao] = useState(false);
  const [onSim, setOnSim] = useState(null);

  const [notificacao, setNotificacao] = useState(false);
  const [tipo, setTipo] = useState("sucesso");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  const [carregando, setCarregando] = useState(false);

  function clicaDeleta(id) {
    setConfirmacao(true);
    setOnSim(() => () => {
      setConfirmacao(false);
      deletarSetor(id);
    });
  }

  async function deletarSetor(id) {
    setCarregando(true);
    try {
      await deleteSetor(id);

      setTipo("sucesso");
      setTitulo("Setor deletado com sucesso");
      setDescricao(
        "O setor foi excluído com sucesso, não irá mais aparecer nas seleções de setor"
      );
      setNotificacao(true);
      setModificado(true);

      setTimeout(() => {
        setNotificacao(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setTipo("erro");
      setTitulo("Erro ao deletar setor");
      setDescricao(err.message);
      setNotificacao(true);
    } finally {
      setCarregando(false);
    }
  }

  async function buscarSetores() {
    try {
      const setores = await getSetores(localStorage.getItem("empresa_id"));
      setSetores(setores);
      console.log(setores);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    buscarSetores();
    setModificado(false);
  }, [modificado]);

  return (
    <div className="p-6">
      {confirmacao && (
        <ModalConfirmacao
          texto={
            "Você tem certeza que deseja excluir esse setor? Essa ação é IRREVERSÍVEL"
          }
          onNao={() => setConfirmacao(false)}
          onSim={onSim}
        />
      )}
      {adicionando && (
        <AdicionarSetor
          setAdicionando={setAdicionando}
          setModificado={setModificado}
          setTipo={setTipo}
          setTitulo={setTitulo}
          setDescricao={setDescricao}
          setNotificacao={setNotificacao}
          setCarregando={setCarregando}
        />
      )}
      {notificacao && (
        <Notificacao
          onClick={() => setNotificacao(false)}
          tipo={tipo}
          titulo={titulo}
          mensagem={descricao}
        />
      )}
      {carregando && <Loading />}
      <div className="rounded-2xl bg-white/5 backdrop-blur-md ring-1 ring-white/10 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 size={20} /> Setores da Empresa
          </h2>
          <button
            onClick={() => setAdicionando(true)}
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
                  onClick={() => clicaDeleta(setor.setor_id)}
                  className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition"
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
    </div>
  );
}
