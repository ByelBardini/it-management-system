import { formatToDate } from "brazilian-values";

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
          const ultima = new Date(senha.senha_ultima_troca);
          const prazo = senha.senha_tempo_troca || 0;
          const proxima = new Date(
            ultima.getTime() + prazo * 24 * 60 * 60 * 1000
          );
          const hoje = new Date();
          const diffDias = Math.ceil((proxima - hoje) / (1000 * 60 * 60 * 24));
          return (
            <tr
              onDoubleClick={() => abreCard(senha.senha_id)}
              key={senha.senha_id}
              className="text-sm text-white/80 hover:bg-red-500/10 transition"
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
                className={`px-6 py-3 ${
                  senha.senha_tempo_troca == 0
                    ? "text-green-400"
                    : diffDias < 0
                    ? "text-red-400 font-semibold"
                    : diffDias <= 5
                    ? "text-yellow-400 font-semibold"
                    : "text-green-400"
                }`}
              >
                {senha.senha_tempo_troca == 0
                  ? "Não Expira"
                  : diffDias == 0
                  ? `0 dias`
                  : diffDias == -1
                  ? `Atrasado 1 dia`
                  : diffDias < -1
                  ? `Atrasado ${diffDias * -1} dias`
                  : diffDias == 1
                  ? `1 dia`
                  : `${diffDias} dias`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
