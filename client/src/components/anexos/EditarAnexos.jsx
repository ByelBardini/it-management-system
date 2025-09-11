import { X, FileText, Trash2, Paperclip, Plus, Save } from "lucide-react";
import { useState } from "react";

export default function EditarAnexos({ setAbrirAnexos, anexos, setAnexos }) {
  const [novoTipo, setNovoTipo] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoArquivo, setNovoArquivo] = useState(null);
  const [anexosModificados, setAnexosModificados] = useState(anexos);

  const anexosExistentes = anexosModificados.filter(
    (a) => a.anexo_id && !a.file
  );
  const anexosNovos = anexosModificados.filter((a) => a.file);

  function removerAnexo(id) {
    setAnexosModificados((prev) => prev.filter((a) => a.anexo_id !== id));
  }

  function removerNovo(tempId) {
    setAnexosModificados((prev) => prev.filter((a) => a.tempId !== tempId));
  }

  function adicionarAnexo() {
    if (!novoTipo || !novoNome || !novoArquivo) return;
    const novo = {
      tempId: Date.now(),
      anexo_tipo: novoTipo,
      anexo_nome: novoNome,
      file: novoArquivo,
    };
    setAnexosModificados((prev) => [...prev, novo]);
    setNovoTipo("");
    setNovoNome("");
    setNovoArquivo(null);
  }

  function confirmaAlteracao() {
    setAnexos(anexosModificados);
    setAbrirAnexos(false);
  }

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center"
      onClick={() => setAbrirAnexos(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-white/5 backdrop-blur-2xl rounded-2xl ring-1 ring-white/10 p-5 space-y-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Gerenciar Anexos</h3>
          <button
            className="cursor-pointer text-white/60 hover:text-white"
            onClick={() => setAbrirAnexos(false)}
          >
            <X />
          </button>
        </div>

        <div>
          <h4 className="text-sm font-medium text-white/70 mb-2">
            Já existentes
          </h4>
          {anexosExistentes.length > 0 ? (
            <div className="space-y-2">
              {anexosExistentes.map((anexo) => (
                <div
                  key={anexo.anexo_id}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-4 w-4 text-white/70" />
                    <div className="min-w-0">
                      <div className="truncate text-sm text-white">
                        {anexo.anexo_nome}
                      </div>
                      <div className="text-xs text-white/50">
                        {anexo.anexo_tipo}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerAnexo(anexo.anexo_id)}
                    className="cursor-pointer inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-300 hover:bg-red-500/10 hover:text-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/50">Nenhum anexo existente.</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-white/70 mb-2">
            Adicionar novos
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <select
              value={novoTipo}
              onChange={(e) => setNovoTipo(e.target.value)}
              className="rounded-lg bg-white/10 p-2 text-white focus:outline-none text-sm"
            >
              <option hidden value="">
                Selecione...
              </option>
              <option value="garantia">Garantia</option>
              <option value="manual">Manual</option>
              <option value="anexo">Anexo</option>
            </select>

            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex.: NF impressora, Manual do switch..."
              className="w-full rounded-lg bg-white/10 p-2 text-white focus:outline-none text-sm"
            />

            <label className="flex items-center justify-between rounded-lg bg-white/10 p-2 cursor-pointer text-sm">
              <input
                type="file"
                className="hidden"
                onChange={(e) => setNovoArquivo(e.target.files[0])}
              />
              {novoArquivo ? novoArquivo.name : "Escolher arquivo..."}
              <Paperclip className="h-4 w-4 ml-2 text-white/60" />
            </label>
          </div>

          <button
            onClick={adicionarAnexo}
            className="cursor-pointer mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm text-white"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>

        {anexosNovos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-2">
              Novos anexos
            </h4>
            <div className="space-y-2">
              {anexosNovos.map((anexo) => (
                <div
                  key={anexo.tempId}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-4 w-4 text-white/70" />
                    <div className="min-w-0">
                      <div className="truncate text-sm text-white">
                        {anexo.anexo_nome}
                      </div>
                      <div className="text-xs text-white/50">
                        {anexo.anexo_tipo}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerNovo(anexo.tempId)}
                    className="cursor-pointer inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-300 hover:bg-red-500/10 hover:text-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="w-full flex justify-center">
          <button
            onClick={confirmaAlteracao}
            className="cursor-pointer mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-md text-white"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
