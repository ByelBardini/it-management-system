import { useState, useEffect, useRef } from "react";
import Filtro from "./Filtro.jsx";

export default function Filtros({
  itens,
  inativos,
  setItensFiltrados,
  filtrando,
}) {
  const [tiposSelecionados, setTiposSelecionados] = useState([]);
  const [setoresSelecionados, setSetoresSelecionados] = useState([]);
  const [workstationsSelecionadas, setWorkstationsSelecionadas] = useState([]);
  const [emUsoSelecionado, setEmUsoSelecionado] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [openFilter, setOpenFilter] = useState(null);
  const containerRef = useRef(null);

  function ativaFiltro() {
    let filtrados = itens;

    if (tiposSelecionados.length > 0) {
      filtrados = filtrados.filter((item) =>
        tiposSelecionados.some((t) => t.item_tipo === item.item_tipo)
      );
    }

    if (setoresSelecionados.length > 0) {
      filtrados = filtrados.filter((item) =>
        setoresSelecionados.some((s) => s.id === item.setor?.setor_id)
      );
    }

    if (workstationsSelecionadas.length > 0) {
      filtrados = filtrados.filter((item) =>
        workstationsSelecionadas.some(
          (w) => w.id === item.workstation?.workstation_id
        )
      );
    }

    if (pesquisa != "") {
      filtrados = filtrados.filter(
        (item) =>
          item.item_nome.toLowerCase().includes(pesquisa) ||
          item.item_etiqueta.toLowerCase().includes(pesquisa)
      );
    }

    if (emUsoSelecionado.length > 0) {
      filtrados = filtrados.filter((item) =>
        emUsoSelecionado.some((u) => u.item_em_uso === item.item_em_uso)
      );
    }

    setItensFiltrados(filtrados);
  }

  function limpaFiltro() {
    setItensFiltrados(itens);
    setSetoresSelecionados([]);
    setWorkstationsSelecionadas([]);
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
    setSetoresSelecionados([]);
    setWorkstationsSelecionadas([]);
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
              itens={itens}
              categoria="Tipo"
              isOpen={openFilter === "Tipo"}
              setOpenFilter={setOpenFilter}
              selecionados={tiposSelecionados}
              setSelecionados={setTiposSelecionados}
            />
            <Filtro
              itens={itens}
              categoria="Setor"
              isOpen={openFilter === "Setor"}
              setOpenFilter={setOpenFilter}
              selecionados={setoresSelecionados}
              setSelecionados={setSetoresSelecionados}
            />
            <Filtro
              itens={itens}
              categoria="Workstation"
              isOpen={openFilter === "Workstation"}
              setOpenFilter={setOpenFilter}
              selecionados={workstationsSelecionadas}
              setSelecionados={setWorkstationsSelecionadas}
            />
            <Filtro
              itens={itens}
              categoria="Em uso"
              isOpen={openFilter === "Em uso"}
              setOpenFilter={setOpenFilter}
              selecionados={emUsoSelecionado}
              setSelecionados={setEmUsoSelecionado}
            />
          </>
        ) : (
          <Filtro
            itens={itens}
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
