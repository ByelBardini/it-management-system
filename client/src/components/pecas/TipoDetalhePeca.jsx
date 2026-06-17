import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Boxes } from "lucide-react";
import { iconeDoTipoPeca } from "./iconesTiposPecas.js";
import ModalModeloPeca from "./ModalModeloPeca.jsx";

// "Página" de um tipo de peça: marcas em linhas; clicar na marca expande os
// modelos; clicar no modelo abre o modal com todas as peças daquele modelo.
export default function TipoDetalhePeca({
  grupo,
  onVoltar,
  setConfirmacao,
  setNotificacao,
  inativar,
}) {
  const [marcasAbertas, setMarcasAbertas] = useState(() => new Set());
  const [selecionado, setSelecionado] = useState(null);

  const Icone = iconeDoTipoPeca(grupo.tipo);

  function alternarMarca(chave) {
    setMarcasAbertas((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(chave)) proximo.delete(chave);
      else proximo.add(chave);
      return proximo;
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <button
          onClick={onVoltar}
          className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 text-sm hover:bg-white/10 transition"
        >
          <ChevronLeft size={16} />
          Voltar
        </button>
        <span className="h-9 w-9 rounded-xl bg-sky-500/15 text-sky-300 flex items-center justify-center">
          <Icone size={18} />
        </span>
        <h3 className="text-white font-semibold">{grupo.tipoLabel}</h3>
        <span className="px-2 py-0.5 rounded-full bg-sky-600/20 text-sky-300 text-xs font-medium">
          {grupo.total}
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {grupo.marcas.map((marca) => {
          const chave = marca.marca;
          const aberta = marcasAbertas.has(chave);
          return (
            <div key={chave}>
              <button
                onClick={() => alternarMarca(chave)}
                className="cursor-pointer w-full flex items-center gap-2 px-6 py-3 hover:bg-white/5 transition text-left"
              >
                {aberta ? (
                  <ChevronDown size={16} className="text-white/50" />
                ) : (
                  <ChevronRight size={16} className="text-white/50" />
                )}
                <span className="text-white/90 font-medium">{marca.marca}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-xs">
                  {marca.total}
                </span>
              </button>

              {aberta && (
                <div className="pb-2">
                  {marca.modelos.map((modelo, moi) => (
                    <button
                      key={`${chave}-${moi}`}
                      onClick={() =>
                        setSelecionado({ marca: marca.marca, modelo })
                      }
                      className="group cursor-pointer w-full flex items-center gap-2 pl-14 pr-6 py-2 hover:bg-white/5 transition text-left"
                    >
                      <Boxes size={14} className="text-white/40" />
                      <span className="text-white/80">{modelo.modelo}</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs">
                        {modelo.total}
                      </span>
                      <span className="ml-auto text-xs text-white/40 group-hover:text-sky-300 transition">
                        ver peças
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selecionado && (
        <ModalModeloPeca
          tipoLabel={grupo.tipoLabel}
          marca={selecionado.marca}
          modelo={selecionado.modelo}
          onFechar={() => setSelecionado(null)}
          setConfirmacao={setConfirmacao}
          setNotificacao={setNotificacao}
          inativar={inativar}
        />
      )}
    </div>
  );
}
