/* eslint-disable react-hooks/exhaustive-deps */
import { Save, X, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { trocarSenha } from "../../services/api/perfilServices.js";
import { tratarErro } from "../default/funcoes.js";
import { useNavigate } from "react-router-dom";

export default function AtualizarSenha({
  setTrocaSenha,
  setLoading,
  setNotificacao,
}) {
  const navigate = useNavigate();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const [visualizaSenha, setVisualizaSenha] = useState(false);
  const [visualizaConfirmaSenha, setVisualizaConfirmaSenha] = useState(false);
  const [visualizaSenhaAtual, setVisualizaSenhaAtual] = useState(false);

  const [senhaValida, setSenhaValida] = useState(false);

  useEffect(() => {
    setSenhaValida(senha === confirmaSenha && senha !== "");
  }, [senha, confirmaSenha]);

  async function atualizar() {
    const id = localStorage.getItem("usuario_id");
    if (!senhaValida) {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Senhas inválidas",
        mensagem: "O campo de senha e confirmação devem ser iguais",
      });
      return;
    } else if (senhaAtual == "") {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Insira a senha atual",
        mensagem: "A senha atual é obrigatória para que você possa alterá-la",
      });
      return;
    }
    setLoading(true);
    try {
      await trocarSenha(id, senhaAtual, senha);
      setLoading(false);

      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Senha alterada com sucesso",
        mensagem: "Sua senha foi alterada com sucesso",
      });
      setTimeout(() => {
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
        setTrocaSenha(false);
      }, 700);
    } catch (err) {
      setLoading(false);
      tratarErro(setNotificacao, err, navigate);
    }
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setTrocaSenha(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl ring-1 ring-white/10 p-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h2 className="text-xl font-semibold text-white">Alterar Senha</h2>
          <button
            onClick={() => setTrocaSenha(false)}
            className="cursor-pointer text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 mt-5">
          <div>
            <label className="text-sm text-white/70">Senha Atual</label>
            <div className="relative mt-1">
              <input
                type={visualizaSenhaAtual ? "text" : "password"}
                placeholder="Insira sua senha atual"
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={() => setVisualizaSenhaAtual(!visualizaSenhaAtual)}
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-white/70">Nova Senha</label>
              <span className="text-xs text-white/50">{senha.length}/50</span>
            </div>
            <div className="relative mt-1">
              <input
                type={visualizaSenha ? "text" : "password"}
                placeholder="Insira a nova senha"
                maxLength={50}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={() => setVisualizaSenha(!visualizaSenha)}
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-white/70">Confirmar Senha</label>
              <span className="text-xs text-white/50">
                {confirmaSenha.length}/50
              </span>
            </div>
            <div className="relative mt-1">
              <input
                type={visualizaConfirmaSenha ? "text" : "password"}
                placeholder="Confirme a nova senha"
                maxLength={50}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 transition ${
                  senhaValida || senha == ""
                    ? "focus:ring-sky-500 bg-white/10 border border-white/10"
                    : "focus:ring-red-500 bg-red-500/10 border border-red-500/20"
                }`}
              />
              <button
                onClick={() =>
                  setVisualizaConfirmaSenha(!visualizaConfirmaSenha)
                }
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                <Eye size={18} />
              </button>
            </div>
            {!senhaValida && confirmaSenha !== "" && (
              <p className="mt-1 text-xs text-red-400 font-medium">
                As senhas não coincidem
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-white/10 pt-6 mt-4">
          <button
            disabled={!senhaValida}
            onClick={atualizar}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              senhaValida
                ? "cursor-pointer bg-sky-600 hover:bg-sky-500 text-white"
                : "cursor-not-allowed bg-white/10 text-white/40"
            }`}
          >
            <Save size={16} />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
