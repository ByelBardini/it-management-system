import { useRef, useState } from "react";
import { Plus, Paperclip, Trash2, FileText } from "lucide-react";

export default function AdicionaAnexo({ anexos = [], setAnexos }) {
  const [tipo, setTipo] = useState("");
  const [nome, setNome] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const inputFileRef = useRef(null);

  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  const podeAdicionar = Boolean(tipo && nome.trim() && arquivo);

  function adiciona() {
    if (!podeAdicionar) return;
    const novo = {
      id: crypto.randomUUID(),
      tipo,
      nome: nome.trim(),
      fileName: arquivo.name,
      size: arquivo.size,
      file: arquivo,
    };
    setAnexos((prev) => [...(prev || []), novo]);

    setTipo("");
    setNome("");
    setArquivo(null);
    if (inputFileRef.current) inputFileRef.current.value = "";
  }

  function removeItem(id) {
    setAnexos((prev) => (prev || []).filter((a) => a.id !== id));
  }

  return (
    <div>
      <div className="mb-4 text-sm text-white/60">
        Adicione fotos, manuais, documentos de garantia, etc
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10 md:grid-cols-[190px_1fr_1fr_auto]">
        <div>
          <label className="mb-1 block text-sm text-white/70">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          >
            <option hidden value="" className="bg-zinc-900">
              Selecione...
            </option>
            <option className="bg-zinc-900">Manual</option>
            <option className="bg-zinc-900">Garantia</option>
            <option className="bg-zinc-900">Outros</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-white/70">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: NF impressora, Manual do switch..."
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-white/70">Arquivo</label>
          <label className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/20">
            <span className="truncate">
              {arquivo ? arquivo.name : "Escolher arquivo..."}
            </span>
            <Paperclip className="h-4 w-4" />
            <input
              ref={inputFileRef}
              type="file"
              className="hidden"
              onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={adiciona}
            disabled={!podeAdicionar}
            className="cursor-pointer inline-flex h-[38px] w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 text-sm text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            title={
              !podeAdicionar ? "Preencha Tipo, Nome e Arquivo" : "Adicionar"
            }
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {anexos.length > 0 && (
        <div className="mt-4 space-y-2">
          {anexos.map((anexo) => (
            <div
              key={anexo.id}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-4 w-4 text-white/70" />
                <div className="min-w-0">
                  <div className="truncate text-sm text-white">
                    {anexo.nome}
                  </div>
                  <div className="text-xs text-white/50">
                    {anexo.tipo} • {anexo.fileName} • {formatBytes(anexo.size)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(anexo.id)}
                className="cursor-pointer inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-300 hover:bg-red-500/10 hover:text-red-200"
                title="Remover"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
