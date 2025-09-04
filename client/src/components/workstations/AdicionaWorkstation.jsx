import { X, Save, SearchX } from "lucide-react";
import { useState, useEffect } from "react";
import { getSetores } from "../../services/api/setorServices.js";
import { postWorkstation } from "../../services/api/workstationServices.js";

export default function AdicionaWorkstation({
  setModificado,
  setAdicionando,
  setTipo,
  setTitulo,
  setDescricao,
  setNotificacao,
  setCarregando,
}) {
  const [setores, setSetores] = useState([]);
  const [setoresFiltrados, setSetoresFiltrados] = useState([]);
  const [filtro, setFiltro] = useState("");

  const [nome, setNome] = useState("");
  const [setor, setSetor] = useState("");

  async function buscarSetores() {
    try {
      const setores = await getSetores(localStorage.getItem("empresa_id"));
      setSetores(setores);
      console.log(setores);
    } catch (err) {
      console.error(err);
    }
  }

  async function adiciona() {
    const id_empresa = localStorage.getItem("empresa_id");
    if (nome == "" || setor == "") {
      setTipo("err");
      setTitulo("Dados incompletos");
      setDescricao(
        "Tanto o nome do workstation quanto o setor são necessários, preencha-os e tente novamente"
      );
      setNotificacao("true");
    } else {
      setCarregando(true);
      try {
        await postWorkstation(id_empresa, setor, nome);

        setTipo("sucesso");
        setTitulo("Workstation criada com sucesso");
        setDescricao(
          "A workstation foi criada com sucesso, agora você poderá registrar equipamentos nele no menu de inventário"
        );
        setNotificacao(true);
        setModificado(true);

        setTimeout(() => {
          setNotificacao(false);
          setAdicionando(false);
        }, 1000);
      } catch (err) {
        console.error(err);
        setTipo("erro");
        setTitulo("Erro ao adicionar workstation");
        setDescricao(err.message);
        setNotificacao(true);
      } finally {
        setCarregando(false);
      }
    }
  }

  useEffect(() => {
    buscarSetores();
  }, []);

  useEffect(() => {
    if (filtro == "") {
      setSetoresFiltrados(setores);
    } else {
      const filtrados = setores.filter((setor) =>
        setor.setor_nome.toLowerCase().includes(filtro.toLowerCase())
      );
      setSetoresFiltrados(filtrados);
    }
  }, [filtro, setores]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-xl rounded-2xl bg-zinc-900 text-zinc-100 shadow-2xl ring-1 ring-white/10">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold">Nova Workstation</h2>
          <button
            onClick={() => setAdicionando(false)}
            className="cursor-pointer rounded-xl p-2 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 px-5 py-5">
          <label className="grid gap-1">
            <span className="text-sm text-zinc-300">Nome da Workstation</span>
            <input
              onChange={(e) => setNome(e.target.value)}
              type="text"
              placeholder="Ex.: PC-Administrativo-01"
              className="w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Setor</span>
              <input
                onChange={(e) => setFiltro(e.target.value)}
                type="text"
                placeholder="Buscar setor..."
                className="ml-auto w-48 rounded-lg border border-white/10 bg-zinc-800 px-3 py-1.5 text-sm placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="max-h-48 overflow-auto rounded-xl border border-white/10 bg-zinc-950/30 p-1">
              <ul className="divide-y divide-white/5">
                {setoresFiltrados.length > 0 ? (
                  setoresFiltrados.map((setor) => (
                    <li key={setor.setor_id}>
                      <label className="flex cursor-pointer items-center gap-3 p-2 hover:bg-white/5">
                        <input
                          onChange={(e) => setSetor(e.target.value)}
                          type="radio"
                          name="setor"
                          className="h-4 w-4 accent-indigo-500"
                          value={setor.setor_id}
                        />
                        <span className="text-sm">{setor.setor_nome}</span>
                      </label>
                    </li>
                  ))
                ) : (
                  <li>
                    <label className="flex items-center gap-3 p-2 hover:bg-white/5">
                      <SearchX size={18} />
                      <span className="text-sm">Nenhum Setor Encontrado</span>
                    </label>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setAdicionando(false)}
              className="cursor-pointer rounded-xl px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              Cancelar
            </button>
            <button
              onClick={adiciona}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              <Save className="h-4 w-4" />
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
