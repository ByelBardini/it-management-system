/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { getSubtipos, postSubtipo } from "../../services/api/subtipoServices.js";
import { tratarErro } from "../default/funcoes.js";

// Combobox "selecionar ou adicionar" do SUBTIPO de um tipo (ex.: periférico →
// Teclado, Mouse). O valor é o NOME do subtipo (string). Controlado por `subtipo`;
// muda via onChange(nome). É o 1º nível da cascata, que escopa marca/modelo.
export default function SelecaoSubtipo({
  tipo,
  subtipo = "",
  onChange,
  setNotificacao,
}) {
  const navigate = useNavigate();

  const [subtipos, setSubtipos] = useState([]);
  const [busca, setBusca] = useState(subtipo);
  const [aberto, setAberto] = useState(false);
  const subtipoRef = useRef(subtipo);

  function falhar(err) {
    if (setNotificacao) tratarErro(setNotificacao, err, navigate);
  }

  async function carregar() {
    if (!tipo) return;
    try {
      const lista = await getSubtipos(tipo);
      setSubtipos(lista || []);
    } catch (err) {
      falhar(err);
    }
  }
  useEffect(() => {
    carregar();
  }, [tipo]);

  // Reflete mudança EXTERNA de subtipo (reset/pré-preenchimento) sem apagar o que
  // o usuário está digitando (a digitação marca o ref antes do re-render).
  useEffect(() => {
    if (subtipo !== subtipoRef.current) {
      subtipoRef.current = subtipo;
      setBusca(subtipo || "");
    }
  }, [subtipo]);

  const filtrados = subtipos.filter((s) =>
    s.subtipo_nome.toLowerCase().includes(busca.trim().toLowerCase())
  );
  const exato = subtipos.some(
    (s) => s.subtipo_nome.toLowerCase() === busca.trim().toLowerCase()
  );

  function selecionar(nome) {
    setBusca(nome);
    setAberto(false);
    onChange(nome);
  }

  async function adicionar() {
    const nome = busca.trim();
    if (!nome) return;
    try {
      await postSubtipo(tipo, nome);
      await carregar();
      setAberto(false);
      onChange(nome);
    } catch (err) {
      falhar(err);
    }
  }

  const inputCls =
    "w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60";

  return (
    <div className="relative">
      <label className="block text-sm text-white/70 mb-1">Subtipo</label>
      <input
        type="text"
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          setAberto(true);
          if (subtipo) {
            subtipoRef.current = "";
            onChange("");
          }
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 120)}
        placeholder="Selecione ou digite um subtipo"
        className={inputCls}
      />
      {aberto && (
        <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-lg bg-neutral-900 ring-1 ring-white/10">
          {filtrados.map((s) => (
            <li key={s.subtipo_id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selecionar(s.subtipo_nome)}
                className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 cursor-pointer"
              >
                {s.subtipo_nome}
              </button>
            </li>
          ))}
          {busca.trim() && !exato && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={adicionar}
                className="w-full text-left px-3 py-2 text-sm text-sky-400 hover:bg-white/10 cursor-pointer inline-flex items-center gap-1"
              >
                <Plus size={14} /> Adicionar "{busca.trim()}"
              </button>
            </li>
          )}
          {filtrados.length === 0 && !busca.trim() && (
            <li className="px-3 py-2 text-sm text-white/40">
              Nenhum subtipo cadastrado
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
