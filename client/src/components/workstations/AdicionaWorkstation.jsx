/* eslint-disable react-hooks/exhaustive-deps */
import { X, Save, SearchX } from "lucide-react";
import { useState, useEffect } from "react";
import { getSetores } from "../../services/api/setorServices.js";
import { tratarErro } from "../default/funcoes.js";
import { postWorkstation } from "../../services/api/workstationServices.js";
import { useNavigate } from "react-router-dom";

export default function AdicionaWorkstation({
  setModificado,
  setAdicionando,
  setNotificacao,
  setCarregando,
}) {
  const navigate = useNavigate();

  const [setores, setSetores] = useState([]);
  const [setoresFiltrados, setSetoresFiltrados] = useState([]);
  const [filtro, setFiltro] = useState("");

  const [nome, setNome] = useState("");
  const [setor, setSetor] = useState("");

  async function buscarSetores() {
    try {
      const setores = await getSetores(localStorage.getItem("empresa_id"));
      setSetores(setores);
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    }
  }

  async function adiciona() {
    const id_empresa = localStorage.getItem("empresa_id");
    if (nome === "" || setor === "") {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Dados incompletos",
        mensagem:
          "Tanto o nome do workstation quanto o setor são necessários, preencha-os e tente novamente",
      });
    } else {
      setCarregando(true);
      try {
        await postWorkstation(id_empresa, setor, nome);
        setNotificacao({
          show: true,
          tipo: "sucesso",
          titulo: "Workstation criada com sucesso",
          mensagem:
            "A workstation foi criada com sucesso! Agora você poderá registrar equipamentos nela no inventário.",
        });
        setModificado(true);
        setTimeout(() => {
          setNotificacao({
            show: false,
            tipo: "sucesso",
            titulo: "",
            mensagem: "",
          });
          setAdicionando(false);
        }, 1000);
      } catch (err) {
        tratarErro(setNotificacao, err, navigate);
      } finally {
        setCarregando(false);
      }
    }
  }

  useEffect(() => {
    buscarSetores();
  }, []);

  useEffect(() => {
    if (filtro === "") {
      setSetoresFiltrados(setores);
    } else {
      const filtrados = setores.filter((setor) =>
        setor.setor_nome.toLowerCase().includes(filtro.toLowerCase())
      );
      setSetoresFiltrados(filtrados);
    }
  }, [filtro, setores]);

  return (
    <div
      onClick={() => setAdicionando(false)}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6"
      >
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="text-lg font-semibold text-white">Nova Workstation</h2>
          <button
            onClick={() => setAdicionando(false)}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">
              Nome da Workstation
            </label>
            <input
              onChange={(e) => setNome(e.target.value)}
              type="text"
              placeholder="Ex.: PC-Administrativo-01"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm placeholder-white/40 
                         focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Setor</label>

            {/* Campo de busca */}
            <input
              onChange={(e) => setFiltro(e.target.value)}
              type="text"
              placeholder="Buscar setor..."
              className="w-full mb-2 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm placeholder-white/40 
                         focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            <div className="max-h-40 overflow-auto rounded-xl ring-1 ring-white/10 bg-white/5">
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
                  <li className="flex items-center gap-3 px-3 py-2 text-white/80">
                    <SearchX size={18} className="text-white/60" />
                    <span className="text-sm">Nenhum setor encontrado</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
          <button
            onClick={() => setAdicionando(false)}
            className="px-4 py-2 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20 transition"
          >
            Cancelar
          </button>
          <button
            onClick={adiciona}
            className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
