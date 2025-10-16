import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { primeiroLogin } from "../../services/api/perfilServices.js";
import { tratarErro } from "../default/funcoes.js";
import { useNavigate } from "react-router-dom";

export default function PrimeiroAcesso({
  setPrimeiroLogin,
  setNotificacao,
  setLoading,
}) {
  const navigate = useNavigate();

  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const [senhaIgual, setSenhaIgual] = useState(false);
  const [senhaValida, setSenhaValida] = useState(false);

  const [visualizaSenha, setVisualizaSenha] = useState(false);
  const [visualizaConfirmaSenha, setVisualizaConfirmaSenha] = useState(false);

  useEffect(() => {
    setSenhaIgual(senha === confirmaSenha);
    if (senha && confirmaSenha && senha === confirmaSenha) {
      setSenhaValida(true);
    } else {
      setSenhaValida(false);
    }
  }, [senha, confirmaSenha]);

  async function trocarSenha() {
    const id = localStorage.getItem("usuario_id");
    setLoading(true);
    try {
      await primeiroLogin(id, senha);
      localStorage.setItem("usuario_troca_senha", 0);
      setLoading(false);
      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Senha atualizada com sucesso",
        mensagem: "A sua senha foi oficialmente atualizada",
      });

      setTimeout(() => {
        setPrimeiroLogin(false);
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
      }, 700);
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
      setLoading(false);
    }
  }

  return (
    <div
      onClick={() => setPrimeiroLogin(false)}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6"
      >
        <div className="flex justify-between items-center border-b border-white/20 pb-3">
          <h2 className="text-lg font-semibold text-white">Primeiro Acesso</h2>
        </div>

        <div className="space-y-4">
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
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-white/70">Confirmar Senha</label>
                <span className="text-xs text-white/50">{senha.length}/50</span>
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
              {!senhaIgual && (
                <p className="text-xs text-red-400 font-medium mt-1">
                  As senhas não coincidem
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              onClick={trocarSenha}
              disabled={!senhaValida}
              className={`px-4 py-2 rounded-lg text-white font-medium transition 
              ${
                senhaValida
                  ? "cursor-pointer bg-sky-600 hover:bg-sky-500"
                  : "cursor-not-allowed bg-white/10 text-white/40"
              }`}
            >
              Salvar Senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
