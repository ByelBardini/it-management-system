import Filtro from "./Filtro.jsx";
import { useEffect, useRef, useState } from "react";

export default function CampoFiltros({
  pecas,
  inativos,
  setPecasFiltradas,
  filtrando,
}) {
  const [tiposSelecionados, setTiposSelecionados] = useState([]);
  const [emUsoSelecionado, setEmUsoSelecionado] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [openFilter, setOpenFilter] = useState(null);
  const containerRef = useRef(null);

  function ativaFiltro() {
    let filtrados = pecas;

    if (tiposSelecionados.length > 0) {
      filtrados = filtrados.filter((peca) =>
        tiposSelecionados.some((t) => t.peca_tipo === peca.peca_tipo)
      );
    }

    if (pesquisa != "") {
      filtrados = filtrados.filter((peca) =>
        peca.peca_nome.toLowerCase().includes(pesquisa)
      );
    }

    if (emUsoSelecionado.length > 0) {
      filtrados = filtrados.filter((peca) =>
        emUsoSelecionado.some((u) => u.peca_em_uso === peca.peca_em_uso)
      );
    }

    setPecasFiltradas(filtrados);
  }

  function limpaFiltro() {
    setPecasFiltradas(pecas);
    setTiposSelecionados([]);
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
    setTiposSelecionados([]);
  }, [inativos, filtrando]);

  return (
    <div
      ref={containerRef}
      className="w-5/7 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-2">
        {!inativos ? (
          <>
            <Filtro
              pecas={pecas}
              categoria="Tipo"
              isOpen={openFilter === "Tipo"}
              setOpenFilter={setOpenFilter}
              selecionados={tiposSelecionados}
              setSelecionados={setTiposSelecionados}
            />
            <Filtro
              pecas={pecas}
              categoria="Em uso"
              isOpen={openFilter === "Em uso"}
              setOpenFilter={setOpenFilter}
              selecionados={emUsoSelecionado}
              setSelecionados={setEmUsoSelecionado}
            />
          </>
        ) : (
          <Filtro
            pecas={pecas}
            categoria="Tipo"
            isOpen={openFilter === "Tipo"}
            setOpenFilter={setOpenFilter}
            selecionados={tiposSelecionados}
            setSelecionados={setTiposSelecionados}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={pesquisa}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              ativaFiltro();
            }
          }}
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
