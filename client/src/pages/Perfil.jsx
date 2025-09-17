import { Pencil, KeyRound } from "lucide-react";

export default function Perfil() {
  const usuario = {
    nome: localStorage.getItem("usuario_nome") || "Usuário Desconhecido",
    login: localStorage.getItem("usuario_login") || "login@example.com",
    tipo:
      localStorage.getItem("usuario_tipo") === "adm" ? "Admin" : "Usuário",
    foto: null,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-lg backdrop-blur-2xl overflow-hidden">
        <div className="flex items-center gap-6 p-6">
          <div className="flex-shrink-0">
            {usuario.foto ? (
              <img
                src={usuario.foto}
                alt={usuario.nome}
                className="h-24 w-24 rounded-full object-cover ring-2 ring-sky-500"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl ring-2 ring-sky-500">
                {usuario.nome.charAt(0)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-sm text-white/60">Nome</p>
              <p className="text-lg font-semibold text-white">{usuario.nome}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Login</p>
              <p className="text-sm text-white/80">{usuario.login}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Tipo</p>
              <p
                className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ${
                  usuario.tipo === "Admin"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {usuario.tipo}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4 bg-white/5">
          <button
            onClick={() => console.log("Editar usuário")}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm transition"
          >
            <Pencil size={16} />
            Editar Usuário
          </button>
          <button
            onClick={() => console.log("Trocar senha")}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition"
          >
            <KeyRound size={16} />
            Trocar Senha
          </button>
        </div>
      </div>
    </div>
  );
}
