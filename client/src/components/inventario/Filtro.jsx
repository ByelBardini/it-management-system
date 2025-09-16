/* eslint-disable react-hooks/exhaustive-deps */
import tiposItens from "../inventario/tiposItens";
import { useEffect, useState, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { createPortal } from "react-dom";

const tipos = {
  Tipo: "item_tipo",
  Setor: "setor",
  Workstation: "workstation",
  "Em uso": "item_em_uso",
};

export default function Filtro({
  itens,
  categoria,
  isOpen,
  setOpenFilter,
  selecionados,
  setSelecionados,
}) {
  const tipo = tipos[categoria];
  const buttonRef = useRef(null);

  const [opcoes, setOpcoes] = useState([]);

  function separaUnicos() {
    if (tipo === "item_em_uso") {
      setOpcoes([{ item_em_uso: 1 }, { item_em_uso: 0 }]);
    } else if (tipo === "item_tipo") {
      const unicos = [...new Set(itens.map((item) => item.item_tipo))];
      setOpcoes(unicos.map((tipo) => ({ item_tipo: tipo })));
    } else {
      const unicos = [
        ...new Map(
          itens
            .filter((item) => item[tipo])
            .map((item) => [
              item[tipo][`${tipo}_id`],
              {
                id: item[tipo][`${tipo}_id`],
                nome: item[tipo][`${tipo}_nome`],
              },
            ])
        ).values(),
      ];
      setOpcoes(unicos.map((valor) => ({ [tipo]: valor })));
    }
  }

  function seleciona(opcao) {
    setSelecionados((prev) => {
      if (categoria === "Tipo") {
        if (prev.some((s) => s.item_tipo === opcao.item_tipo)) {
          return prev.filter((s) => s.item_tipo !== opcao.item_tipo);
        } else {
          return [...prev, opcao];
        }
      } else if (categoria === "Em uso") {
        if (prev.some((s) => s.item_em_uso === opcao.item_em_uso)) {
          return prev.filter((s) => s.item_em_uso !== opcao.item_em_uso);
        } else {
          return [...prev, opcao];
        }
      } else {
        if (prev.some((s) => s.id === opcao.id)) {
          return prev.filter((s) => s.id !== opcao.id);
        } else {
          return [...prev, opcao];
        }
      }
    });
  }

  useEffect(() => {
    separaUnicos();
  }, [itens]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={() => setOpenFilter(isOpen ? null : categoria)}
        className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
      >
        {categoria}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen &&
        buttonRef.current &&
        createPortal(
          <div
            data-filter-portal=""
            style={{
              position: "absolute",
              top:
                buttonRef.current.getBoundingClientRect().bottom +
                window.scrollY,
              left:
                buttonRef.current.getBoundingClientRect().left + window.scrollX,
              minWidth: buttonRef.current.getBoundingClientRect().width,
              zIndex: 9999,
            }}
            className="rounded-lg bg-zinc-800 shadow-lg ring-1 ring-black/20 max-h-80 overflow-y-auto overflow-x-hidden"
          >
            <ul className="py-1 text-sm text-white/80 whitespace-nowrap">
              {categoria === "Em uso"
                ? opcoes.map((opcao, id) => {
                    const valor = opcao.item_em_uso;
                    const marcado = selecionados.some(
                      (s) => s.item_em_uso === valor
                    );

                    return (
                      <li
                        onClick={(e) => {
                          e.stopPropagation();
                          seleciona(opcao);
                        }}
                        key={id}
                        className="flex min-w-20 w-full items-center px-4 pr-2 mr-10 py-2 hover:bg-white/10 cursor-pointer"
                      >
                        <span className="w-full flex items-center gap-3 justify-between ">
                          {valor === 1 ? "Sim" : "Não"}
                          {marcado && (
                            <Check size={16} className="text-sky-500" />
                          )}
                        </span>
                      </li>
                    );
                  })
                : categoria === "Tipo"
                ? opcoes.map((opcao, id) => {
                    const valor = opcao.item_tipo;
                    const marcado = selecionados.some(
                      (s) => s.item_tipo === valor
                    );
                    return (
                      <li
                        onClick={(e) => {
                          e.stopPropagation();
                          seleciona(opcao);
                        }}
                        key={id}
                        className="flex min-w-40 w-full items-center px-4 pr-2 mr-10 py-2 hover:bg-white/10 cursor-pointer"
                      >
                        <span className="w-full flex items-center justify-between gap-3">
                          {tiposItens[valor]}
                          {marcado && (
                            <Check size={16} className="text-sky-500" />
                          )}
                        </span>
                      </li>
                    );
                  })
                : opcoes.map((opcao) => {
                    const marcado = selecionados.some(
                      (s) => s.id === opcao[tipo].id
                    );
                    return (
                      <li
                        onClick={(e) => {
                          e.stopPropagation();
                          seleciona(opcao[tipo]);
                        }}
                        key={opcao[tipo].id}
                        className="flex min-w-40 w-full items-center px-4 pr-2 mr-10 py-2 hover:bg-white/10 cursor-pointer"
                      >
                        <span className="w-full flex items-center gap-3 justify-between">
                          {opcao[tipo].nome}
                          {marcado && (
                            <Check size={16} className="text-sky-500" />
                          )}
                        </span>
                      </li>
                    );
                  })}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
}
