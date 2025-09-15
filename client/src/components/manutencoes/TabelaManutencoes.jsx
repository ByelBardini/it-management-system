import tipos from "../inventario/tiposItens.js";
import { formatToDate } from "brazilian-values";
import {
  formatarIntervalo,
  formatarIntervaloTabela,
} from "../default/funcoes.js";

export default function TabelaManutencoes({ itens }) {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="text-sm text-white/70 border-b border-white/10">
          <th className="px-6 py-3">Etiqueta</th>
          <th className="px-6 py-3">Nome</th>
          <th className="px-6 py-3">Tipo</th>
          <th className="px-6 py-3">Setor</th>
          <th className="px-6 py-3">Última Manutençção</th>
          <th className="px-6 py-3">Próxima Manutenção</th>
        </tr>
      </thead>
      <tbody>
        {itens.map((item) => {
          const ultima = new Date(item.item_ultima_manutencao);
          const prazo = item.item_intervalo_manutencao * 30 || 0;
          const proxima = new Date(
            ultima.getTime() + prazo * 24 * 60 * 60 * 1000
          );
          const hoje = new Date();
          const diffDias = Math.ceil((proxima - hoje) / (1000 * 60 * 60 * 24));
          return (
            <tr
              key={item.item_id}
              className="text-sm text-white/80 hover:bg-white/5 transition"
            >
              <td className="px-6 py-3 font-medium text-white">
                {item.item_etiqueta}
              </td>
              <td className="px-6 py-3">{item.item_nome}</td>
              <td className="px-6 py-3">
                {tipos[item.item_tipo] ?? item.item_tipo}
              </td>
              <td className="px-6 py-3">{item.setor?.setor_nome || "N/A"}</td>
              <td className={`px-6 py-3`}>
                {formatToDate(
                  new Date(item.item_ultima_manutencao + "T03:00:00Z")
                )}
              </td>
              <td
                className={`px-6 py-3 ${formatarIntervaloTabela(
                  item.item_intervalo_manutencao,
                  diffDias
                )}`}
              >
                {formatarIntervalo(item.item_intervalo_manutencao, diffDias)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
