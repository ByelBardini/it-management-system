import { Monitor, Lock, Wrench, Clock, AlertTriangle } from "lucide-react";

export default function App() {
  const equipamentosTotal = "X";
  const equipamentosPorTipo = [
    "Desktop",
    "Notebook",
    "Movel",
    "Cadeira",
    "Monitor",
    "Ferramenta",
    "Ap",
    "Ar-Condicionado",
    "Switch",
    "Periferico",
    "No-Break",
  ].map((label) => ({ label, value: "X" }));

  const senhasTotal = "X";
  const senhasPrecAt = "X";
  const senhasAtualizadas = "X";

  const manutDia = "X";
  const manut30 = "X";
  const manutAtrasada = "X";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1  lg:grid-cols-3 gap-6">
        <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 shadow-xl flex flex-col">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white/80">
              Equipamentos cadastrados
            </h2>
            <div className="h-9 w-9 grid place-items-center rounded-lg bg-blue-500/15 text-blue-400 ring-1 ring-blue-400/20">
              <Monitor className="h-5 w-5" />
            </div>
          </header>

          <div className="text-4xl font-bold tracking-tight text-white">
            {equipamentosTotal}
          </div>

          <div className="mt-4 flex-1 min-h-0">
            <ul className="max-h-72 overflow-y-auto pr-1 divide-y divide-white/5 rounded-xl ring-1 ring-white/10 bg-white/5">
              {equipamentosPorTipo.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm text-white/80">{item.label}</span>
                  <span
                    className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2
                                   rounded-lg bg-white/10 ring-1 ring-white/15 text-sm font-semibold text-white"
                  >
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 shadow-xl flex flex-col">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white/80">
              Senhas cadastradas
            </h2>
            <div className="h-9 w-9 grid place-items-center rounded-lg bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-400/20">
              <Lock />
            </div>
          </header>

          <div className="text-4xl font-bold tracking-tight text-white text-center">
            {senhasTotal}
          </div>

          <div className="flex-1 min-h-0 grid place-items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
              <div
                className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 h-36
                      flex flex-col items-center justify-center text-center"
              >
                <div
                  className="inline-flex items-center gap-2 rounded-md
                        bg-amber-500/15 px-3 py-1 ring-1 ring-amber-400/30
                        text-amber-300 text-sm font-medium"
                >
                  Precisam ser atualizadas
                </div>
                <div className="mt-3 text-3xl font-bold text-white">
                  {senhasPrecAt}
                </div>
              </div>

              <div
                className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 h-36
                      flex flex-col items-center justify-center text-center"
              >
                <div
                  className="inline-flex items-center gap-2 rounded-md
                        bg-emerald-500/15 px-3 py-1 ring-1 ring-emerald-400/30
                        text-emerald-300 text-sm font-medium"
                >
                  Atualizadas
                </div>
                <div className="mt-3 text-3xl font-bold text-white">
                  {senhasAtualizadas}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-rows-3 gap-4">
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/80">
                Manutenção em dia
              </h3>
              <div className="h-8 w-8 grid place-items-center rounded-lg bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/20">
                <Wrench className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-bold text-white">{manutDia}</div>
          </div>

          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/80">
                Faltando 30 dias
              </h3>
              <div className="h-8 w-8 grid place-items-center rounded-lg bg-amber-500/15 text-amber-400 ring-1 ring-amber-400/20">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-bold text-white">{manut30}</div>
          </div>

          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/80">
                Manutenção atrasada
              </h3>
              <div className="h-8 w-8 grid place-items-center rounded-lg bg-rose-500/15 text-rose-400 ring-1 ring-rose-400/20">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-bold text-white">
              {manutAtrasada}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
