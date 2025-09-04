import { Plus } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Inventario() {
  return (
    <div className="p-6">
      <div className="rounded-2xl bg-white/5 backdrop-blur-md ring-1 ring-white/10 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Inventário</h2>
          <NavLink
            to={"/cadastro"}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Adicionar</span>
          </NavLink>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr className="text-left text-sm text-white/70">
                <th className="px-6 py-3 font-medium">Etiqueta</th>
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">Setor</th>
                <th className="px-6 py-3 font-medium">Workstation</th>
                <th className="px-6 py-3 font-medium">Em uso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition">
                <td className="px-6 py-3 text-white/80">#001</td>
                <td className="px-6 py-3 text-white">Notebook Dell</td>
                <td className="px-6 py-3 text-white/70">TI</td>
                <td className="px-6 py-3 text-white/70">N/A</td>
                <td className="px-6 py-3">
                  <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium">
                    Sim
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition">
                <td className="px-6 py-3 text-white/80">#002</td>
                <td className="px-6 py-3 text-white">Desktop HP</td>
                <td className="px-6 py-3 text-white/70">Financeiro</td>
                <td className="px-6 py-3 text-white/70">N/A</td>
                <td className="px-6 py-3">
                  <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium">
                    Não
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition">
                <td className="px-6 py-3 text-white/80">#003</td>
                <td className="px-6 py-3 text-white">Cadeira Ergonômica</td>
                <td className="px-6 py-3 text-white/70">RH</td>
                <td className="px-6 py-3 text-white/70">N/A</td>
                <td className="px-6 py-3">
                  <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium">
                    Sim
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition">
                <td className="px-6 py-3 text-white/80">#004</td>
                <td className="px-6 py-3 text-white">Monitor LG 24"</td>
                <td className="px-6 py-3 text-white/70">Suporte</td>
                <td className="px-6 py-3 text-white/70">Baia 01</td>
                <td className="px-6 py-3">
                  <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium">
                    Não
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
