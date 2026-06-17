/* eslint-disable react-hooks/exhaustive-deps */
import tipos from "../components/inventario/tiposItens.js";
import Notificacao from "../components/default/Notificacao.jsx";
import {
  Monitor,
  Wrench,
  Clock,
  AlertTriangle,
  Computer,
  Package,
  Server,
} from "lucide-react";
import { getDashboard } from "../services/api/dashboardServices.js";
import { useEffect, useState } from "react";
import { getDiffDias, tratarErro } from "../components/default/funcoes.js";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  const [equipamentosTotal, setEquipamentosTotal] = useState(0);
  const [equipamentosPorTipo, setEquipamentosPorTipo] = useState([]);

  const [manutDia, setManutDia] = useState(0);
  const [manut30, setManut30] = useState(0);
  const [manutAtrasada, setManutAtrasada] = useState(0);

  const [temWorkstation, setTemWorkstation] = useState(0);
  const [semWorkstation, setSemWorkstation] = useState(0);
  const [emEstoque, setEmEstoque] = useState(0);

  const [notificacao, setNotificacao] = useState({
    show: false,
    tipo: "sucesso",
    titulo: "",
    mensagem: "",
  });

  async function buscarDados() {
    const id = localStorage.getItem("empresa_id");
    try {
      const dados = await getDashboard(id);

      setEquipamentosTotal(dados.total?.total_ativos || 0);
      setEquipamentosPorTipo(
        dados.equipamentos.map((equipamento) => ({
          item_tipo: tipos[equipamento.item_tipo],
          quantidade: equipamento.quantidade,
        }))
      );

      setManutDia(
        dados.manutencoes.filter((manutencao) => {
          if (manutencao.item_intervalo_manutencao == 0) {
            return true;
          }
          const diffDias = getDiffDias(
            manutencao.item_ultima_manutencao,
            manutencao.item_intervalo_manutencao
          );
          return diffDias > 30;
        }).length
      );
      setManut30(
        dados.manutencoes.filter((manutencao) => {
          if (manutencao.item_intervalo_manutencao == 0) {
            return false;
          }
          const diffDias = getDiffDias(
            manutencao.item_ultima_manutencao,
            manutencao.item_intervalo_manutencao
          );
          return diffDias <= 30 && diffDias > 0;
        }).length
      );
      setManutAtrasada(
        dados.manutencoes.filter((manutencao) => {
          if (manutencao.item_intervalo_manutencao == 0) {
            return false;
          }
          const diffDias = getDiffDias(
            manutencao.item_ultima_manutencao,
            manutencao.item_intervalo_manutencao
          );
          return diffDias <= 0;
        }).length
      );

      setTemWorkstation(dados.workstations.com_workstation);
      setSemWorkstation(dados.workstations.sem_workstation);
      setEmEstoque(dados.workstations.em_estoque);

      console.log(dados);
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    }
  }

  useEffect(() => {
    buscarDados();
  }, []);

  return (
    <div className="mt-4 space-y-6">
      {notificacao.show && (
        <Notificacao
          tipo={notificacao.tipo}
          titulo={notificacao.titulo}
          mensagem={notificacao.mensagem}
          onClick={() =>
            setNotificacao({
              show: false,
              tipo: "sucesso",
              titulo: "",
              mensagem: "",
            })
          }
        />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-5 flex flex-col">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white/80">
              Equipamentos cadastrados
            </h2>
            <Monitor className="h-5 w-5 text-blue-400" />
          </header>

          <div className="text-4xl font-bold tracking-tight text-white">
            {equipamentosTotal}
          </div>

          <div className="mt-4 flex-1 min-h-0">
            <ul className="max-h-72 overflow-y-auto pr-1 divide-y divide-white/10">
              {equipamentosPorTipo.map((item) => (
                <li
                  key={item.item_tipo}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm text-white/80">
                    {item.item_tipo}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {item.quantidade}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-5 flex flex-col">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white/80">
              Status das Manutenções
            </h2>
          </header>
          <div className="grid gap-4">
            <div className="flex flex-col items-center justify-center p-4">
              <Wrench className="h-5 w-5 text-emerald-400 mb-2" />
              <h3 className="text-sm text-white/70">Em dia</h3>
              <div className="text-2xl font-bold text-white">{manutDia}</div>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <Clock className="h-5 w-5 text-amber-400 mb-2" />
              <h3 className="text-sm text-white/70">Faltando 30 dias</h3>
              <div className="text-2xl font-bold text-white">{manut30}</div>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <AlertTriangle className="h-5 w-5 text-rose-400 mb-2" />
              <h3 className="text-sm text-white/70">Atrasada</h3>
              <div className="text-2xl font-bold text-white">
                {manutAtrasada}
              </div>
            </div>
          </div>
        </section>

      </div>

      <section className="mb-4 rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-6">
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white/80">
            Situação dos Itens
          </h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <Computer className="h-5 w-5 text-sky-400" />
            <h3 className="text-sm text-white/70">Atribuídos à Workstation</h3>
            <div className="text-2xl font-bold text-white">
              {temWorkstation}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <Server className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm text-white/70">Em uso sem Workstation</h3>
            <div className="text-2xl font-bold text-white">
              {semWorkstation}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <Package className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm text-white/70">Em estoque</h3>
            <div className="text-2xl font-bold text-white">{emEstoque}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
