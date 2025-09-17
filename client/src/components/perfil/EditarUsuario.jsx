import { X, Camera, Save, ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { putPerfil } from "../../services/api/perfilServices.js";
import { tratarErro } from "../default/funcoes.js";

export default function EditarFuncionario({
  setEditarPerfil,
  setLoading,
  setNotificacao,
}) {
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(
    `${import.meta.env.VITE_API_BASE_URL}/imagem?path=${localStorage.getItem(
      "usuario_caminho_foto"
    )}`
  );
  const inputRef = useRef(null);

  const [nome, setNome] = useState(localStorage.getItem("usuario_nome"));

  function abrirSeletor() {
    inputRef.current?.click();
  }

  function onSelectImagem(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return;
    }
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    const url = URL.createObjectURL(file);
    setFotoFile(file);
    setFotoPreview(url);
  }

  async function editar() {
    const id = localStorage.getItem("usuario_id");
    if (nome == "") {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Nome inválido",
        mensagem: "O nome não pode estar em branco",
      });
      return;
    }
    setLoading(true);
    try {
      await putPerfil(id, nome, fotoFile);
      setLoading(false);

      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Usuário salvo com sucesso",
        mensagem: "O usuário foi atualizado com sucesso",
      });
      setTimeout(() => {
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
        setEditarPerfil(false);
      }, 700);
    } catch (err) {
      setLoading(false);
                  tratarErro(setNotificacao, err);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl ring-1 ring-white/10 p-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="text-lg font-semibold text-white">
            Editar Funcionário
          </h2>
          <button
            onClick={() => setEditarPerfil(false)}
            className="cursor-pointer text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 mt-5">
          <div className="flex flex-col items-center gap-3">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl ring-1 ring-sky-500 overflow-hidden">
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt="Pré-visualização"
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <ImageIcon size={24} />
              )}
            </div>

            <button
              onClick={abrirSeletor}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20 transition"
            >
              <Camera size={16} />
              Alterar Foto
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onSelectImagem}
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o novo nome"
              className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 pt-4 mt-6">
          <button
            onClick={() => setEditarPerfil(false)}
            className="cursor-pointer px-4 py-2 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20"
          >
            Cancelar
          </button>
          <button
            onClick={editar}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm transition"
          >
            <Save size={16} />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
