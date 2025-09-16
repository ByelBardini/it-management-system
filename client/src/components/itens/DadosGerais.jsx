export default function DadosGerais({ value, onChange }) {
  function formatarRealDinamico(valor) {
    valor = valor.replace(/\D/g, "");
    if (!valor) return "R$ 0,00";
    valor = (parseInt(valor, 10) / 100).toFixed(2);
    valor = valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `R$ ${valor}`;
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <div className="4 flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">Nome</label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          onChange={(e) => onChange({ nome: e.target.value })}
          type="text"
          value={value.nome}
          placeholder="Ex.: Desktop Financeiro 01"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">Tipo</label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <select
          value={value.tipo}
          onChange={(e) => onChange({ tipo: e.target.value })}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        >
          <option value="" hidden className="bg-zinc-900">
            Selecione...
          </option>

          <optgroup className="bg-zinc-700" label="Computadores">
            <option value="desktop" className="bg-zinc-900">
              Desktop
            </option>
            <option value="notebook" className="bg-zinc-900">
              Notebook
            </option>
            <option value="monitor" className="bg-zinc-900">
              Monitor
            </option>
          </optgroup>

          <optgroup className="bg-zinc-700" label="Dispositivos móveis">
            <option value="celular" className="bg-zinc-900">
              Celular
            </option>
          </optgroup>

          <optgroup className="bg-zinc-700" label="Rede">
            <option value="ap" className="bg-zinc-900">
              AP
            </option>
            <option value="switch" className="bg-zinc-900">
              Switch
            </option>
          </optgroup>

          <optgroup className="bg-zinc-700" label="Periféricos & Impressão">
            <option value="periferico" className="bg-zinc-900">
              Periférico
            </option>
            <option value="impressora" className="bg-zinc-900">
              Impressora
            </option>
          </optgroup>

          <optgroup className="bg-zinc-700" label="Energia">
            <option value="no-break" className="bg-zinc-900">
              No-Break
            </option>
            <option value="gerador" className="bg-zinc-900">
              Gerador
            </option>
          </optgroup>

          <optgroup className="bg-zinc-700" label="Climatização">
            <option value="ar-condicionado" className="bg-zinc-900">
              Ar Condicionado
            </option>
          </optgroup>

          <optgroup className="bg-zinc-700" label="Mobiliário">
            <option value="cadeira" className="bg-zinc-900">
              Cadeira
            </option>
            <option value="movel" className="bg-zinc-900">
              Móvel
            </option>
          </optgroup>

          <optgroup className="bg-zinc-700" label="Ferramentas">
            <option value="ferramenta" className="bg-zinc-900">
              Ferramenta
            </option>
          </optgroup>

          <optgroup className="bg-zinc-700" label="Outros">
            <option value="outros" className="bg-zinc-900">
              Outros
            </option>
          </optgroup>
        </select>
      </div>

      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">Etiqueta</label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          value={value.etiqueta}
          onChange={(e) => onChange({ etiqueta: e.target.value })}
          type="text"
          placeholder="Ex.: INV-000123"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">
            Número de Série
          </label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          value={value.numSerie}
          onChange={(e) => onChange({ numSerie: e.target.value })}
          type="text"
          placeholder="Ex.: SN-9XYZA123"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">Preço</label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          value={value.preco}
          onChange={(e) =>
            onChange({ preco: formatarRealDinamico(e.target.value) })
          }
          type="text"
          placeholder="Ex.: 3500,00"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/70">
          Data de aquisição
        </label>
        <input
          value={value.aquisicao}
          onChange={(e) => onChange({ aquisicao: e.target.value })}
          type="date"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">
            Última Manutenção
          </label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <input
          value={value.manutencao}
          onChange={(e) => onChange({ manutencao: e.target.value })}
          type="date"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center gap-1">
          <label className="mb-1 block text-sm text-white/70">
            Intervalo de Manutenção
          </label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <select
          value={value.intervalo}
          onChange={(e) => onChange({ intervalo: e.target.value })}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        >
          <option hidden value="" className="bg-zinc-900">
            Selecione...
          </option>
          <option value={0} className="bg-zinc-900">
            Nunca
          </option>
          <option value={1} className="bg-zinc-900">
            1 mês
          </option>
          <option value={3} className="bg-zinc-900">
            3 meses
          </option>
          <option value={6} className="bg-zinc-900">
            6 meses
          </option>
          <option value={12} className="bg-zinc-900">
            1 ano
          </option>
        </select>
      </div>

      <div>
        <span className="mb-1 block text-sm text-white/70">Status</span>
        <button
          type="button"
          onClick={() => onChange({ emUso: !value.emUso })}
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white transition ring-1
                            ${
                              value.emUso
                                ? "bg-emerald-600 hover:bg-emerald-500 ring-emerald-700"
                                : "bg-red-600 hover:bg-red-500 ring-red-700"
                            }`}
          aria-pressed={value.emUso}
        >
          {value.emUso ? "Em uso" : "Em estoque"}
        </button>
      </div>
    </div>
  );
}
