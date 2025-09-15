import { formatToDate } from "brazilian-values";
import {
  formatarIntervalo,
  formatarIntervaloTabela,
  getDiffDias,
} from "../default/funcoes.js";

export default function TabelaSenhas({ senhas, setCardSenha }) {
  function abreCard(id) {
    localStorage.setItem("senha_id", id);
    setCardSenha(true);
  }

  return (
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
              <td className="px-6 py-3">{senha.plataforma.plataforma_nome}</td>
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
  );
}
