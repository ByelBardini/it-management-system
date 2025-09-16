import { useState, useEffect, useRef } from "react";
import { getDiffDias } from "../default/funcoes.js";
import Filtro from "./Filtro.jsx";

export default function Filtros({ senhas, setSenhasFiltradas, filtrando }) {
  const [plataformaSelecionadas, setPlataformaSelecionadas] = useState([]);
  const [prazoSelecionado, setPrazoSelecionado] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [openFilter, setOpenFilter] = useState(null);
  const containerRef = useRef(null);

  function ativaFiltro() {
    let filtrados = senhas;

    if (plataformaSelecionadas.length > 0) {
      filtrados = filtrados.filter((senha) =>
        plataformaSelecionadas.some(
          (s) => s.id === senha.plataforma?.plataforma_id
        )
      );
    }

    if (pesquisa != "") {
      filtrados = filtrados.filter((senha) =>
        senha.senha_nome.toLowerCase().includes(pesquisa)
      );
    }

    if (prazoSelecionado.length > 0) {
      filtrados = filtrados.filter((senha) => {
        const diffDias = getDiffDias(
          senha.senha_ultima_troca,
          senha.senha_tempo_troca
        );
        return prazoSelecionado.some((p) => {
          if (p.id === 0) {
            if (senha.senha_tempo_troca == 0) {
              return false;
            }
            return diffDias < 0;
          }
          if (p.id === 31) {
            return diffDias >= 0;
          }
          if (senha.senha_tempo_troca == 0) {
            return false;
          }
          return diffDias <= p.id && diffDias >= 0;
        });
      });
    }

    setSenhasFiltradas(filtrados);
  }

  function limpaFiltro() {
    setSenhasFiltradas(senhas);
    setPlataformaSelecionadas([]);
    setPrazoSelecionado([]);
    setPesquisa("");
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (event.target.closest("[data-filter-portal]")) return;

      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpenFilter(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setPlataformaSelecionadas([]);
    setPrazoSelecionado([]);
    setPesquisa("");
  }, [filtrando]);

  return (
    <div
      ref={containerRef}
      className="w-4/7 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-2">
        <Filtro
          senhas={senhas}
          categoria="Plataforma"
          isOpen={openFilter === "Plataforma"}
          setOpenFilter={setOpenFilter}
          selecionados={plataformaSelecionadas}
          setSelecionados={setPlataformaSelecionadas}
        />
        <Filtro
          senhas={senhas}
          categoria="Prazo"
          isOpen={openFilter === "Prazo"}
          setOpenFilter={setOpenFilter}
          selecionados={prazoSelecionado}
          setSelecionados={setPrazoSelecionado}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value.toLowerCase())}
          type="text"
          placeholder="Buscar..."
          className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        <button
          onClick={ativaFiltro}
          className="cursor-pointer px-3 py-1.5 rounded-lg bg-sky-600/60 hover:bg-sky-500/60 text-white text-sm font-medium shadow"
        >
          Aplicar filtro
        </button>
        <button
          onClick={limpaFiltro}
          className="cursor-pointer px-3 py-1.5 rounded-lg bg-rose-600/60 hover:bg-rose-500/60 text-white text-sm font-medium shadow"
        >
          Remover filtro
        </button>
      </div>
    </div>
  );
}
