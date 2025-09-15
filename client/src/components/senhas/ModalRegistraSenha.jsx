import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getPlataformas } from "../../services/api/plataformaServices.js";
import { postSenha } from "../../services/api/senhaServices.js";

export default function ModalRegistraSenha({ setAdicionaSenha }) {
  const [nome, setNome] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [usuario, setUsuario] = useState("");
  const [tempoTroca, setTempoTroca] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const [senhaIgual, setSenhaIgual] = useState(false);
  const [senhaValida, setSenhaValida] = useState(false);

  const [plataformas, setPlataformas] = useState([]);

  async function buscarPlataformas() {
    try {
      const plats = await getPlataformas();
      setPlataformas(plats);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function cadastraSenha() {
    if (!senhaIgual) {
      alert("As duas senhas devem ser iguais!");
      return;
    } else if (!senhaValida) {
      alert("Todos os dados devem ser preenchidos!");
      return;
    }
    try {
      const empresa_id = localStorage.getItem("empresa_id");
      const usuario_id = localStorage.getItem("usuario_id");

      await postSenha(
        empresa_id,
        usuario_id,
        plataforma,
        nome,
        usuario,
        senha,
        tempoTroca
      );

      alert("Deu bom!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  useEffect(() => {
    setSenhaIgual(senha == confirmaSenha);
    if (
      nome == "" ||
      senha == "" ||
      confirmaSenha == "" ||
      usuario == "" ||
      plataforma == "" ||
      !senhaIgual
    ) {
      setSenhaValida(false);
    } else {
      setSenhaValida(true);
    }
  }, [senha, confirmaSenha, nome, plataforma, usuario, senhaIgual]);

  useEffect(() => {
    buscarPlataformas();
  }, []);

  return (
    <div
      onClick={() => setAdicionaSenha(false)}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6"
      >
        <div className="flex justify-between items-center border-b border-white/20 pb-3">
          <h2 className="text-lg font-semibold text-white">
            Registrar Nova Senha
          </h2>
          <button
            onClick={() => setAdicionaSenha(false)}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Nome</label>
            <input
              onChange={(e) => setNome(e.target.value)}
              type="text"
              placeholder="Digite um nome para a senha"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">
                Plataforma
              </label>
              <select
                onChange={(e) => setPlataforma(e.target.value)}
                type="text"
                placeholder=""
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option hidden value={""}>
                  Selecione...
                </option>
                {plataformas.map((plataforma) => {
                  return (
                    <option value={plataforma.plataforma_id}>
                      {plataforma.plataforma_nome}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">
                Usuário
              </label>
              <input
                onChange={(e) => setUsuario(e.target.value)}
                type="text"
                placeholder="Digite o usuário"
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">
              Tempo para troca da senha
            </label>
            <select
              onChange={(e) => setTempoTroca(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option hidden value={""}>
                Selecione...
              </option>
              <option value={0}>Nunca</option>
              <option value={30}>30 dias</option>
              <option value={60}>60 dias</option>
              <option value={90}>90 dias</option>
              <option value={180}>180 dias</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Senha</label>
            <input
              onChange={(e) => setSenha(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="Digite a senha"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">
              Confirme a Senha
            </label>
            <input
              onChange={(e) => setConfirmaSenha(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="Repita a senha"
              className={`w-full rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 transition ${
                senhaIgual
                  ? "focus:ring-sky-500 bg-white/10 border border-white/10"
                  : "focus:ring-red-500 bg-red-500/10 border border-red-500/20"
              }`}
            />
            {!senhaIgual && (
              <p className="text-xs text-red-400 font-medium">
                As duas senhas devem ser iguais
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            onClick={cadastraSenha}
            disabled={!senhaValida}
            className={`px-4 py-2 rounded-lg text-white font-medium transition 
                        ${
                          senhaValida
                            ? "cursor-pointer bg-sky-600 hover:bg-sky-500"
                            : "cursor-not-allowed bg-white/10 text-white/40"
                        }`}
          >
            Registrar Senha
          </button>
        </div>
      </div>
    </div>
  );
}
