/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { createPortal } from "react-dom";

export default function Filtro({
  senhas,
  categoria,
  isOpen,
  setOpenFilter,
  selecionados,
  setSelecionados,
}) {
  const buttonRef = useRef(null);

  const [opcoes, setOpcoes] = useState([]);

  function separaUnicos() {
    if (categoria === "Plataforma") {
      const unicos = [
        ...new Map(
          senhas
            .filter((senhas) => senhas.plataforma)
            .map((senha) => [
              senha.plataforma.plataforma_id,
              {
                id: senha.plataforma.plataforma_id,
                nome: senha.plataforma.plataforma_nome,
              },
            ])
        ).values(),
      ];
      setOpcoes(unicos.map((valor) => ({ plataforma: valor })));
    } else {
      setOpcoes([
        { id: 0, valor: "Atrasados" },
        { id: 15, valor: "Faltando 15 dias" },
        { id: 30, valor: "Faltando um mês" },
        { id: 31, valor: "Em dia" },
      ]);
    }
  }

  function seleciona(opcao) {
    setSelecionados((prev) => {
      if (prev.some((s) => s.id === opcao.id)) {
        return prev.filter((s) => s.id !== opcao.id);
      } else {
        return [...prev, opcao];
      }
    });
  }

  useEffect(() => {
    separaUnicos();
  }, [senhas]);

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
              {categoria === "Plataforma"
                ? opcoes.map((opcao) => {
                    const marcado = selecionados.some(
                      (s) => s.id === opcao.plataforma.id
                    );
                    return (
                      <li
                        onClick={(e) => {
                          e.stopPropagation();
                          seleciona(opcao.plataforma);
                        }}
                        key={opcao.plataforma.id}
                        className="flex min-w-40 w-full items-center px-4 pr-2 mr-10 py-2 hover:bg-white/10 cursor-pointer"
                      >
                        <span className="w-full flex items-center gap-3 justify-between">
                          {opcao.plataforma.nome}
                          {marcado && (
                            <Check size={16} className="text-sky-500" />
                          )}
                        </span>
                      </li>
                    );
                  })
                : opcoes.map((opcao) => {
                    const marcado = selecionados.some((s) => s.id === opcao.id);
                    return (
                      <li
                        onClick={(e) => {
                          e.stopPropagation();
                          seleciona(opcao);
                        }}
                        key={opcao.id}
                        className="flex min-w-40 w-full items-center px-4 pr-2 mr-10 py-2 hover:bg-white/10 cursor-pointer"
                      >
                        <span className="w-full flex items-center justify-between gap-3">
                          {opcao.valor}
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
