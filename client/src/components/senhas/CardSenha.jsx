/* eslint-disable react-hooks/exhaustive-deps */
import AtualizarSenha from "./AtualizarSenha.jsx";
import EditarDadosSenha from "./EditarDadosSenha.jsx";
import { X, Edit, KeyRound, Eye, Trash2 } from "lucide-react";
import { getSenhaFull, deleteSenha } from "../../services/api/senhaServices.js";
import { useEffect, useState } from "react";
import { formatToDate } from "brazilian-values";
import { tratarErro } from "../default/funcoes.js";

export default function CardSenha({
  setCardSenha,
  setNotificacao,
  setConfirmacao,
  buscaSenhas,
  setLoading,
}) {
  const [novaSenha, setNovaSenha] = useState(false);
  const [editaSenha, setEditaSenha] = useState(false);

  const [senha, setSenha] = useState({});

  const [exibeSenha, setExibeSenha] = useState(false);

  async function buscaDadosSenha() {
    const id = localStorage.getItem("senha_id");
    setLoading(true);
    try {
      const senha = await getSenhaFull(id);
      setLoading(false);

      setSenha(senha);
    } catch (err) {
      setLoading(false);
      tratarErro(setNotificacao, err);
    }
  }

  async function excluiSenha() {
    setConfirmacao({
      show: false,
      texto: "",
      onSim: null,
    });
    const id = localStorage.getItem("senha_id");
    setLoading(true);
    try {
      await deleteSenha(id);

      setLoading(false);
      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Senha excluída com sucesso",
        mensagem:
          "A senha foi excluída com sucesso, e não irá mais aparecer na listagem",
      });
      await buscaSenhas();
      setTimeout(() => {
        setNotificacao({
          show: false,
          tipo: "erro",
          titulo: "",
          mensagem: "",
        });
        setCardSenha(false);
      }, 700);
    } catch (err) {
      setLoading(false);
      tratarErro(setNotificacao, err);
    }
  }

  useEffect(() => {
    buscaDadosSenha();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center">
      {editaSenha && (
        <EditarDadosSenha
          setEditaSenha={setEditaSenha}
          senha={senha}
          setNotificacao={setNotificacao}
          setLoading={setLoading}
          buscaSenhas={buscaSenhas}
          buscaDadosSenha={buscaDadosSenha}
        />
      )}
      {novaSenha && (
        <AtualizarSenha
          setNovaSenha={setNovaSenha}
          setNotificacao={setNotificacao}
          setLoading={setLoading}
          buscaSenhas={buscaSenhas}
          buscaDadosSenha={buscaDadosSenha}
        />
      )}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6"
      >
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="text-lg font-semibold text-white">
            Detalhes da Senha
          </h2>
          <button
            onClick={() => setCardSenha(false)}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/60">Nome</label>
            <input
              type="text"
              value={senha.senha_nome || ""}
              disabled
              className="w-full mt-1 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/60">Plataforma</label>
              <input
                type="text"
                value={senha.plataforma?.plataforma_nome || ""}
                disabled
                className="w-full mt-1 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-white/60">Cadastrado por</label>
              <input
                type="text"
                value={senha.usuario?.usuario_nome || ""}
                disabled
                className="w-full mt-1 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/60">Última troca</label>
              <input
                type="text"
                value={
                  formatToDate(
                    new Date(senha.senha_ultima_troca + "T03:00:00Z")
                  ) || ""
                }
                disabled
                className="w-full mt-1 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-white/60">Tempo de troca</label>
              <input
                type="text"
                value={
                  senha.senha_tempo_troca == 0
                    ? "Senha não exipira"
                    : `${senha.senha_tempo_troca} dias`
                }
                disabled
                className="w-full mt-1 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60">Usuário</label>
            <input
              type="text"
              value={senha.senha_usuario || ""}
              disabled
              className="w-full mt-1 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-white/60">Senha</label>
            <div className="relative mt-1">
              <input
                type={exibeSenha ? "text" : "password"}
                value={senha.senha_descriptografada || ""}
                disabled
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white font-mono tracking-wider text-sm"
              />
              <button
                onClick={() => setExibeSenha(!exibeSenha)}
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/10 pt-4 place-content-between ">
          <button
            onClick={() =>
              setConfirmacao({
                show: true,
                texto:
                  "Tem certeza que deseja excluir essa senha? Essa ação é irreversível",
                onSim: () => excluiSenha(),
              })
            }
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm transition"
          >
            <Trash2 size={16} />
            Excluir Senha
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setEditaSenha(true)}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm transition"
            >
              <Edit size={16} />
              Editar
            </button>
            <button
              onClick={() => setNovaSenha(true)}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition"
            >
              <KeyRound size={16} />
              Atualizar Senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
