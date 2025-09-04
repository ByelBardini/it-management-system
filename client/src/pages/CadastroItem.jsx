import CadastroCaracteristica from "../components/caracteristicas/CadastroCaracteristica.jsx";
import { Plus, Paperclip } from "lucide-react";
import { useState } from "react";

export default function CadastroItem() {
  const [emUso, setEmUso] = useState(true);

  return (
    <div className="relative min-h-screen bg-[#0A1633] text-white overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(59,130,246,0.22),transparent)]" />
        <div
          className="absolute inset-0 opacity-40
          [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]
          [background-size:36px_36px]"
        />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
      </div>
      <div className="w-full max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Cadastro de Item</h1>
          <div className="flex items-center gap-3">
            <button className="cursor-pointer rounded-lg bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/20">
              Voltar
            </button>
            <button className="cursor-pointer rounded-lg bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/20">
              Cancelar
            </button>
          </div>
        </div>

        <main className="mt-6 space-y-6">
          <section className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h2 className="mb-4 text-base font-medium text-white">
              Dados Gerais
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-white/70">Nome</label>
                <input
                  type="text"
                  placeholder="Ex.: Desktop Financeiro 01"
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">Tipo</label>
                <select className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60">
                  <option value="" className="bg-zinc-900">
                    Selecione...
                  </option>
                  <option className="bg-zinc-900">Desktop</option>
                  <option className="bg-zinc-900">Notebook</option>
                  <option className="bg-zinc-900">Monitor</option>
                  <option className="bg-zinc-900">Impressora</option>
                  <option className="bg-zinc-900">Periférico</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Setor
                </label>
                <select className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60">
                  <option value="" className="bg-zinc-900">
                    Selecione...
                  </option>
                  <option className="bg-zinc-900">Administrativo</option>
                  <option className="bg-zinc-900">Comercial</option>
                  <option className="bg-zinc-900">TI</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Workstation
                </label>
                <select className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60">
                  <option value="" className="bg-zinc-900">
                    Selecione...
                  </option>
                  <option className="bg-zinc-900">PC-01</option>
                  <option className="bg-zinc-900">PC-02</option>
                  <option className="bg-zinc-900">Notebook-03</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Etiqueta
                </label>
                <input
                  type="text"
                  placeholder="Ex.: INV-000123"
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Número de série
                </label>
                <input
                  type="text"
                  placeholder="Ex.: SN-9XYZA123"
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Preço
                </label>
                <input
                  type="number"
                  placeholder="Ex.: 3500,00"
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Data de aquisição
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Última manutenção
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Intervalo de manutenção
                </label>
                <select className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60">
                  <option value="" className="bg-zinc-900">
                    Selecione...
                  </option>
                  <option className="bg-zinc-900">30 dias</option>
                  <option className="bg-zinc-900">60 dias</option>
                  <option className="bg-zinc-900">90 dias</option>
                  <option className="bg-zinc-900">180 dias</option>
                  <option className="bg-zinc-900">365 dias</option>
                </select>
              </div>

              <div>
                <span className="mb-1 block text-sm text-white/70">Status</span>
                <button
                  type="button"
                  onClick={() => setEmUso((v) => !v)}
                  className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white transition ring-1
                            ${
                              emUso
                                ? "bg-emerald-600 hover:bg-emerald-500 ring-emerald-700"
                                : "bg-red-600 hover:bg-red-500 ring-red-700"
                            }`}
                  aria-pressed={emUso}
                >
                  {emUso ? "Em uso" : "Em estoque"}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h2 className="mb-4 text-base font-medium text-white">
              Características
            </h2>
            <CadastroCaracteristica />
          </section>

          <section className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h2 className="mb-4 text-base font-medium text-white">Anexos</h2>

            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-white/60">
                Adicione fotos, notas fiscais, manuais, etc.
              </div>
              <button className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-500">
                <Plus className="h-4 w-4" />
                Novo anexo
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10 md:grid-cols-[220px_1fr]">
              <div>
                <label className="mb-1 block text-sm text-white/70">Tipo</label>
                <select className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60">
                  <option value="" className="bg-zinc-900">
                    Selecione...
                  </option>
                  <option className="bg-zinc-900">Foto do equipamento</option>
                  <option className="bg-zinc-900">Nota Fiscal</option>
                  <option className="bg-zinc-900">
                    Comprovante de Garantia
                  </option>
                  <option className="bg-zinc-900">Manual</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Arquivo
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/20">
                    <span className="truncate">Escolher arquivo...</span>
                    <Paperclip className="h-4 w-4" />
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/60">
              Nenhum anexo adicionado além do item acima.
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
