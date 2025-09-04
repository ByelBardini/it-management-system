/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function Filtro({ workstations, setWorkstationsFiltradas }) {
  const [open, setOpen] = useState(false);
  const [setores, setSetores] = useState([]);
  const [selecionados, setSelecionados] = useState([]);

  function separaSetores() {
    const unicos = [
      ...new Map(
        workstations.map((workstation) => [
          workstation.setor.setor_id,
          workstation.setor,
        ])
      ).values(),
    ];
    setSetores(unicos);
  }

  function seleciona(setor) {
    setSelecionados((prev) => {
      if (prev.some((s) => s.setor_id === setor.setor_id)) {
        return prev.filter((s) => s.setor_id !== setor.setor_id);
      } else {
        return [...prev, setor];
      }
    });
  }

  useEffect(() => {
    separaSetores();
  }, [workstations]);

  useEffect(() => {
    if (selecionados.length == 0) {
      setWorkstationsFiltradas(workstations);
    } else {
      const filtrados = workstations.filter(
        (workstation) =>
          workstation?.setor?.setor_id != null &&
          selecionados.some(
            (selecionado) =>
              selecionado.setor_id.toString() ===
              workstation.setor.setor_id.toString()
          )
      );
      setWorkstationsFiltradas(filtrados);
    }
  }, [selecionados]);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
      >
        Filtro
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-zinc-800 shadow-lg ring-1 ring-black/20">
          <ul className="py-1 text-sm text-white/80">
            {setores.map((setor) => {
              const marcado = selecionados.some(
                (s) => s.setor_id === setor.setor_id
              );
              return (
                <li
                  key={setor.setor_id}
                  onClick={() => seleciona(setor)}
                  className="flex items-center justify-between px-4 py-2 hover:bg-white/10 cursor-pointer"
                >
                  <span>{setor.setor_nome}</span>
                  {marcado && <Check size={16} className="text-sky-500" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
