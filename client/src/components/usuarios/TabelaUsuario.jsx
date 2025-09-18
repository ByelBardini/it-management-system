import { DiamondPlus, UserRound } from "lucide-react";

export default function TabelaUsuario({
  usuarios,
  setExibeUsuario,
  setUsuarioSelecionado,
}) {
  function exibe(usuario) {
    setUsuarioSelecionado(usuario);
    setExibeUsuario(true);
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-white/10 text-white/80 uppercase text-xs">
        <tr>
          <th className="px-6 py-3">Nome</th>
          <th className="px-6 py-3">Tipo</th>
          <th className="px-6 py-3">Status</th>
          <th className="px-6 py-3"></th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario) => {
          return (
            <tr className="hover:bg-white/5 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {usuario.usuario_caminho_foto != null ? (
                    <img
                      className="h-10 w-10 object-cover rounded-full ring-1 ring-white/10"
                      src={`${import.meta.env.VITE_API_BASE_URL}/imagem?path=${
                        usuario.usuario_caminho_foto
                      }`}
                      alt={`Foto de ${usuario.usuario_nome}`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-10 w-10 flex items-center justify-center rounded-full ring-1 ring-white/10 bg-blue-500/30 text-blue-300">
                      <UserRound className="h-6 w-6" />
                    </div>
                  )}
                  <span className="whitespace-nowrap text-white/90 font-bold">
                    {usuario.usuario_nome}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full ${
                    usuario.usuario_tipo == "adm"
                      ? "bg-purple-500/20 text-purple-400 text-xs"
                      : "bg-blue-500/20 text-blue-400 text-xs"
                  }`}
                >
                  {usuario.usuario_tipo == "adm" ? "Admin" : "Usuário"}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full ${
                    usuario.usuario_ativo == 1
                      ? "bg-green-500/20 text-green-400 text-xs"
                      : "bg-red-500/20 text-red-400 text-xs"
                  }`}
                >
                  {usuario.usuario_ativo == 1 ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  className="cursor-pointer p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                  title="Exibir usuário"
                  onClick={() => exibe(usuario)}
                >
                  <DiamondPlus className="h-4 w-4" />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
