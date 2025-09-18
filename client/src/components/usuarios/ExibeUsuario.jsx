import { X, UserX, KeyRound, UserRound } from "lucide-react";

export default function ExibeUsuario({ setExibeUsuario, usuario }) {
  return (
    <div
      onClick={() => setExibeUsuario(false)}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6"
      >
        <div className="flex justify-between items-center border-b border-white/20 pb-3">
          <h2 className="text-lg font-semibold text-white">
            Detalhes do Usuário
          </h2>
          <button
            onClick={() => setExibeUsuario(false)}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X />
          </button>
        </div>

        <div className="flex justify-center mt-2">
          {usuario?.usuario_caminho_foto ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/imagem?path=${
                usuario.usuario_caminho_foto
              }`}
              alt="Foto do usuário"
              className="h-24 w-24 rounded-full object-cover ring-2 ring-white/20"
              loading="lazy"
            />
          ) : (
            <div className="h-24 w-24 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-500 ring-2 ring-white/20">
              <UserRound className="h-12 w-12 text-white/80" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={usuario?.usuario_nome || ""}
              disabled
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white/70 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Usuário</label>
            <input
              type="text"
              value={usuario?.usuario_login || ""}
              disabled
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white/70 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Tipo</label>
            <input
              type="text"
              value={
                usuario?.usuario_tipo == "adm" ? "Administrador" : "Usuário"
              }
              disabled
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white/70 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10 gap-2">
          <button
            onClick={() => console.log("Inativar usuário", usuario)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white font-medium bg-rose-600 hover:bg-rose-500 transition cursor-pointer"
          >
            <UserX className="h-4 w-4" />
            Inativar
          </button>
          <button
            onClick={() => console.log("Resetar senha", usuario)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white font-medium bg-sky-600 hover:bg-sky-500 transition cursor-pointer"
          >
            <KeyRound className="h-4 w-4" />
            Resetar Senha
          </button>
        </div>
      </div>
    </div>
  );
}
