import { Plus, Paperclip } from "lucide-react";

export default function AdicionaAnexo() {
  return (
    <div>
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
            <option className="bg-zinc-900">Garantia</option>
            <option className="bg-zinc-900">Manual</option>
            <option className="bg-zinc-900">Outro</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">Arquivo</label>
          <div className="flex items-center gap-3">
            <label className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/20">
              <span className="truncate">Escolher arquivo...</span>
              <Paperclip className="h-4 w-4" />
              <input type="file" className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
