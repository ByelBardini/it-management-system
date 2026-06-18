import SelecaoMarcaModelo from "../inventario/SelecaoMarcaModelo.jsx";
import SelecaoSubtipo from "../inventario/SelecaoSubtipo.jsx";
import { temSubtipo } from "../inventario/tiposComSubtipo.js";

// Grupos do <select> de tipo, em dados (antes era JSX hardcoded). Permite filtrar
// tipos via prop `tiposOcultos` (ex.: o app mobile esconde "desktop", montado por peças).
const GRUPOS_TIPO = [
  {
    label: "Computadores",
    opcoes: [
      { value: "desktop", label: "Desktop" },
      { value: "notebook", label: "Notebook" },
      { value: "monitor", label: "Monitor" },
    ],
  },
  { label: "Dispositivos móveis", opcoes: [{ value: "celular", label: "Celular" }] },
  {
    label: "Rede",
    opcoes: [
      { value: "ap", label: "AP" },
      { value: "switch", label: "Switch" },
    ],
  },
  {
    label: "Periféricos & Impressão",
    opcoes: [
      { value: "periferico", label: "Periférico" },
      { value: "impressora", label: "Impressora" },
    ],
  },
  {
    label: "Energia",
    opcoes: [
      { value: "no-break", label: "No-Break" },
      { value: "gerador", label: "Gerador" },
    ],
  },
  {
    label: "Climatização",
    opcoes: [{ value: "ar-condicionado", label: "Ar Condicionado" }],
  },
  {
    label: "Mobiliário",
    opcoes: [
      { value: "cadeira", label: "Cadeira" },
      { value: "movel", label: "Móvel" },
    ],
  },
  { label: "Ferramentas", opcoes: [{ value: "ferramenta", label: "Ferramenta" }] },
  {
    label: "Outros",
    opcoes: [
      { value: "cabo", label: "Cabo" },
      { value: "outros", label: "Outros" },
    ],
  },
];

export default function DadosGerais({
  value,
  onChange,
  setNotificacao,
  tiposOcultos = [],
}) {
  function formatarRealDinamico(valor) {
    valor = valor.replace(/\D/g, "");
    if (!valor) return "R$ 0,00";
    valor = (parseInt(valor, 10) / 100).toFixed(2);
    valor = valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `R$ ${valor}`;
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {temSubtipo(value.tipo) && (
        <SelecaoSubtipo
          tipo={value.tipo}
          subtipo={value.subtipo ?? ""}
          onChange={(nome) =>
            onChange({ subtipo: nome, marcaId: null, modeloId: null })
          }
          setNotificacao={setNotificacao}
        />
      )}
      <SelecaoMarcaModelo
        dominio="item"
        tipo={value.tipo}
        subtipo={value.subtipo ?? ""}
        marcaId={value.marcaId ?? null}
        modeloId={value.modeloId ?? null}
        onChange={onChange}
        setNotificacao={setNotificacao}
      />

      <div>
        <div className="flex items-center gap-1">
          <label htmlFor="dg-tipo" className="mb-1 block text-sm text-white/70">
            Tipo
          </label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <select
          id="dg-tipo"
          value={value.tipo}
          onChange={(e) =>
            onChange({
              tipo: e.target.value,
              subtipo: "",
              marcaId: null,
              modeloId: null,
            })
          }
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        >
          <option value="" hidden className="bg-zinc-900">
            Selecione...
          </option>

          {GRUPOS_TIPO.map((grupo) => {
            const opcoes = grupo.opcoes.filter(
              (o) => !tiposOcultos.includes(o.value)
            );
            if (opcoes.length === 0) return null;
            return (
              <optgroup
                key={grupo.label}
                className="bg-zinc-700"
                label={grupo.label}
              >
                {opcoes.map((o) => (
                  <option key={o.value} value={o.value} className="bg-zinc-900">
                    {o.label}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="block text-sm text-white/70">Etiqueta</label>
            <span className="text-xs text-red-400">*</span>
          </div>
          <span className="text-xs text-white/50">
            {value.etiqueta.length}/10
          </span>
        </div>
        <input
          value={value.etiqueta}
          onChange={(e) => onChange({ etiqueta: e.target.value })}
          type="text"
          maxLength={10}
          placeholder="Ex.: INV-000123"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="block text-sm text-white/70">
              Número de Série
            </label>
            {value.tipo != "desktop" && (
              <span className="text-xs text-red-400">*</span>
            )}
          </div>
          {value.tipo != "desktop" && (
            <span className="text-xs text-white/50">
              {value.numSerie.length}/50
            </span>
          )}
        </div>
        <input
          value={value.numSerie}
          onChange={(e) => onChange({ numSerie: e.target.value })}
          type="text"
          maxLength={50}
          placeholder="Ex.: SN-9XYZA123"
          disabled={value.tipo === "desktop"}
          className={`w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60 ${
            value.tipo === "desktop" ? "opacity-70 cursor-not-allowed" : ""
          }`}
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
          disabled={value.tipo === "desktop"}
          className={`w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60 ${
            value.tipo === "desktop" ? "opacity-70 cursor-not-allowed" : ""
          }`}
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
          <label
            htmlFor="dg-intervalo"
            className="mb-1 block text-sm text-white/70"
          >
            Intervalo de Manutenção
          </label>{" "}
          <span className="rounded text-xs text-red-400">*</span>
        </div>
        <select
          id="dg-intervalo"
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
