import AdicionarSetor from "../components/setores/AdicionarSetor.jsx";
import { Plus, Building2, SearchX } from "lucide-react";
import { useState } from "react";
import { getSetores } from "../services/api/setorServices.js";
import { useEffect } from "react";

export default function Configuracoes() {
  const [adicionando, setAdicionando] = useState(false);
  const [modificado, setModificado] = useState(false);
  const [setores, setSetores] = useState([]);

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
  }, [modificado]);

  return (
    <div className="p-6">
      {adicionando && <AdicionarSetor setAdicionando={setAdicionando} />}
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
            setores.map((setor, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-3 hover:bg-white/5 transition"
              >
                <span className="text-white/80 text-sm">{setor}</span>
                <span className="text-xs text-white/50">Editar / Remover</span>
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
