import { X, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { putSenha } from "../../services/api/senhaServices.js";

export default function EditarDadosSenha({
  setEditaSenha,
  senha,
  setNotificacao,
  setLoading,
  buscaSenhas,
  buscaDadosSenha,
}) {
  const [nome, setNome] = useState("");
  const [tempoTroca, setTempoTroca] = useState("");

  useEffect(() => {
    setNome(senha.senha_nome);
    setTempoTroca(senha.senha_tempo_troca);
  }, [senha]);

  async function atualizarSenha() {
    if (nome == "" || tempoTroca == "") {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Dados inválidos",
        mensagem: "Você não pode salvar a senha sem um nome ou tempo de troca",
      });
      return;
    }
    setLoading(true);
    try {
      const id = localStorage.getItem("senha_id");

      await putSenha(id, nome, tempoTroca);

      setLoading(false);

      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Senha salva com sucesso",
        mensagem: "os novos dados da senha foram salvos com sucesso",
      });

      await buscaDadosSenha();
      await buscaSenhas();

      setTimeout(() => {
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
        setEditaSenha(false);
      }, 700);
    } catch (err) {
      setLoading(false);
      console.error(err);
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Erro ao salvar senha",
        mensagem: err.message,
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6"
      >
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="text-lg font-semibold text-white">
            Detalhes da Senha
          </h2>
          <button
            onClick={() => setEditaSenha(false)}
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
              onChange={(e) => setNome(e.target.value)}
              value={nome}
              placeholder="Insira o novo nome da senha..."
              className="w-full mt-1 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-white/60">Tempo de Troca</label>
            <select
              value={tempoTroca}
              onChange={(e) => setTempoTroca(e.target.value)}
              type="text"
              className="w-full mt-1 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm"
            >
              <option value={""} hidden>
                Selecione...
              </option>
              <option value={0}>Nunca</option>
              <option value={30}>30 dias</option>
              <option value={60}>60 dias</option>
              <option value={90}>90 dias</option>
              <option value={180}>180 dias</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/10 pt-4 place-content-end ">
          <button
            onClick={atualizarSenha}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm transition"
          >
            <Save size={16} />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
