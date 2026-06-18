import { CloudUpload } from "lucide-react";

// Badge do total de cadastros pendentes na fila offline. Presentational: recebe o
// total por prop (a página consulta contarPendentes e mantém o estado). Some quando 0.
export default function ContadorPendentes({ total = 0 }) {
  if (!total) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-500/30"
      title="Cadastros aguardando envio (serão enviados quando a rede voltar)"
    >
      <CloudUpload size={14} />
      {total} pendente{total === 1 ? "" : "s"}
    </span>
  );
}
