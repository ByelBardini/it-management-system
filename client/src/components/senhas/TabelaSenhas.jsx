import { formatToDate } from "brazilian-values";
import {
  formatarIntervalo,
  formatarIntervaloTabela,
  getDiffDias,
} from "../default/funcoes.js";
import { SearchX } from "lucide-react";

export default function TabelaSenhas({ senhas, setCardSenha }) {
  function abreCard(id) {
    localStorage.setItem("senha_id", id);
    setCardSenha(true);
  }

  return (
    <>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-sm text-white/70 border-b border-white/10">
            <th className="px-6 py-3">Nome</th>
            <th className="px-6 py-3">Plataforma</th>
            <th className="px-6 py-3">Usuário</th>
            <th className="px-6 py-3">Última troca</th>
            <th className="px-6 py-3">Próxima Troca</th>
          </tr>
        </thead>
        <tbody>
          {senhas.map((senha) => {
            const diffDias = getDiffDias(
              senha.senha_ultima_troca,
              senha.senha_tempo_troca
            );
            return (
              <tr
                onDoubleClick={() => abreCard(senha.senha_id)}
                key={senha.senha_id}
                className="text-sm text-white/80 hover:bg-white/5 transition"
              >
                <td className="px-6 py-3 font-medium text-white">
                  {senha.senha_nome}
                </td>
                <td className="px-6 py-3">
                  {senha.plataforma.plataforma_nome}
                </td>
                <td className="px-6 py-3">{senha.senha_usuario}</td>
                <td className="px-6 py-3">
                  {formatToDate(
                    new Date(senha.senha_ultima_troca + "T03:00:00Z")
                  )}
                </td>
                <td
                  className={`px-6 py-3 ${formatarIntervaloTabela(
                    senha.senha_tempo_troca,
                    diffDias
                  )}`}
                >
                  {formatarIntervalo(senha.senha_tempo_troca, diffDias)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {senhas.length == 0 && (
        <div className="w-full py-12 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white/60 mb-4">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Nenhuma senha encontrada
          </h3>
          <p className="text-sm text-white/60 mt-1">
            Tente ajustar os filtros ou adicione novas senhas.
          </p>
        </div>
      )}
    </>
  );
}
