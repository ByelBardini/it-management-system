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
      {/* container no mesmo estilo do outro modal */}
      <div className="w-full max-w-md rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-xl">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Nova Workstation</h2>
          <button
            onClick={() => setAdicionando(false)}
            className="cursor-pointer p-2 rounded-lg hover:bg-white/10 text-white/70"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* conteúdo */}
        <div className="p-6 space-y-4">
          {/* nome */}
          <label className="block">
            <span className="block text-sm text-white/70 mb-1">
              Nome da Workstation
            </span>
            <input
              onChange={(e) => setNome(e.target.value)}
              type="text"
              placeholder="Ex.: PC-Administrativo-01"
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-white text-sm placeholder-white/40 
                         focus:outline-none focus:ring-2 focus:ring-sky-500/60 ring-1 ring-white/10"
            />
          </label>

          {/* setor + busca */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Setor</span>
              <input
                onChange={(e) => setFiltro(e.target.value)}
                type="text"
                placeholder="Buscar setor..."
                className="ml-auto w-48 rounded-lg bg-white/10 px-3 py-2 text-white text-sm placeholder-white/40 
                           focus:outline-none focus:ring-2 focus:ring-sky-500/60 ring-1 ring-white/10"
              />
            </div>

            <div className="max-h-48 overflow-auto rounded-xl ring-1 ring-white/10 bg-white/5">
              <ul className="divide-y divide-white/10">
                {setoresFiltrados.length > 0 ? (
                  setoresFiltrados.map((setor) => (
                    <li key={setor.setor_id}>
                      <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-white/10">
                        <input
                          onChange={(e) => setSetor(e.target.value)}
                          type="radio"
                          name="setor"
                          className="h-4 w-4 accent-sky-500"
                          value={setor.setor_id}
                        />
                        <span className="text-sm text-white">
                          {setor.setor_nome}
                        </span>
                      </label>
                    </li>
                  ))
                ) : (
                  <li>
                    <label className="flex items-center gap-3 px-3 py-2">
                      <SearchX size={18} className="text-white/70" />
                      <span className="text-sm text-white/80">
                        Nenhum Setor Encontrado
                      </span>
                    </label>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={() => setAdicionando(false)}
            className="cursor-pointer px-4 py-2 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20"
          >
            Cancelar
          </button>
          <button
            onClick={adiciona}
            className="cursor-pointer px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-500"
          >
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span>Salvar</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
