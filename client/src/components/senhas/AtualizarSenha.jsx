/* eslint-disable react-hooks/exhaustive-deps */
import { Save, X, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { atualizaSenha } from "../../services/api/senhaServices.js";
import { tratarErro } from "../default/funcoes.js";
import { useNavigate } from "react-router-dom";

export default function AtualizarSenha({
  setNovaSenha,
  setNotificacao,
  setLoading,
  buscaSenhas,
  buscaDadosSenha,
}) {
  const navigate = useNavigate();

  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const [visualizaSenha, setVisualizaSenha] = useState(false);
  const [visualizaConfirmaSenha, setVisualizaConfirmaSenha] = useState(false);

  const [senhaValida, setSenhaValida] = useState(false);

  useEffect(() => {
    setSenhaValida(senha == confirmaSenha);
  }, [senha, confirmaSenha]);

  async function atualizar() {
    if (!senhaValida || senha == "") {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Senha inválida",
        mensagem: "As duas senhas devem ser iguais e não podem estar em branco",
      });
      return;
    }
    setLoading(true);
    try {
      const id = localStorage.getItem("senha_id");

      await atualizaSenha(id, senha);
      setLoading(false);

      await buscaSenhas();
      await buscaDadosSenha();

      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Senha atualizada",
        mensagem: "A senha foi atualizada com sucesso",
      });
      setTimeout(() => {
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
        setNovaSenha(false);
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
        setNovaSenha(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="text-lg font-semibold text-white">Alterar Senha</h2>
          <button
            onClick={() => setNovaSenha(false)}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-white/70">Senha</label>
              <span className="text-xs text-white/50">{senha.length}/50</span>
            </div>
            <div className="relative mt-1">
              <input
                type={visualizaSenha ? "text" : "password"}
                placeholder="Insira a nova senha"
                maxLength={50}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white font-mono tracking-wider text-sm"
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
                className={`w-full rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 transition ${
                  senhaValida
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

            {!senhaValida && (
              <p className="mt-1 text-xs text-red-400">
                As senhas não coincidem
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/10 pt-4 place-content-end">
          <button
            onClick={atualizar}
            disabled={!senhaValida || senha == ""}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg 
                        ${
                          senhaValida && senha != ""
                            ? "cursor-pointer bg-sky-600 hover:bg-sky-500"
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
