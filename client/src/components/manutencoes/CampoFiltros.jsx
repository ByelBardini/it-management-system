import { useState, useEffect, useRef } from "react";
import { getDiffDias } from "../default/funcoes.js";
import Filtro from "./Filtro.jsx";
import FiltroPrazo from "./FiltroPrazo.jsx";

export default function Filtros({ itens, setItensFiltrados, filtrando }) {
  const [tiposSelecionados, setTiposSelecionados] = useState([]);
  const [setoresSelecionados, setSetoresSelecionados] = useState([]);
  const [prazoSelecionado, setPrazoSelecionado] = useState([]);
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

    if (pesquisa != "") {
      filtrados = filtrados.filter(
        (item) =>
          item.item_nome.toLowerCase().includes(pesquisa) ||
          item.item_etiqueta.toLowerCase().includes(pesquisa)
      );
    }

    if (prazoSelecionado.length > 0) {
      filtrados = filtrados.filter((item) => {
        const diffDias = getDiffDias(
          item.item_ultima_manutencao,
          item.item_intervalo_manutencao
        );
        return prazoSelecionado.some((p) => {
          if (p.id === 0) {
            if (item.item_intervalo_manutencao == 0) {
              return false;
            }
            return diffDias < 0;
          }
          if (p.id === 31) {
            return diffDias >= 0;
          }
          if (item.item_intervalo_manutencao == 0) {
            return false;
          }
          return diffDias <= p.id && diffDias >= 0;
        });
      });
    }

    setItensFiltrados(filtrados);
  }

  function limpaFiltro() {
    setItensFiltrados(itens);
    setSetoresSelecionados([]);
    setTiposSelecionados([]);
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
    setTiposSelecionados([]);
    setSetoresSelecionados([]);
  }, [filtrando]);

  return (
    <div
      ref={containerRef}
      className="w-4/7 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-2">
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
        <FiltroPrazo
          itens={itens}
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              ativaFiltro();
            }
          }}
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
