import tipos from "../components/inventario/tiposItens.js";
import Notificacao from "../components/default/Notificacao.jsx";
import {
  Monitor,
  Lock,
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

export default function App() {
  const [equipamentosTotal, setEquipamentosTotal] = useState(0);
  const [equipamentosPorTipo, setEquipamentosPorTipo] = useState([]);

  const [senhasTotal, setSenhasTotal] = useState(0);
  const [senhasVencidas, setSenhasVencidas] = useState(0);
  const [senhasAtualizadas, setSenhasAtualizadas] = useState(0);

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

      setSenhasTotal(dados.senhas.length);
      setSenhasVencidas(
        dados.senhas.filter((senha) => {
          if (senha.senha_tempo_troca == 0) {
            return false;
          }
          const diffDias = getDiffDias(
            senha.senha_ultima_troca,
            senha.senha_tempo_troca
          );
          return diffDias < 1;
        }).length
      );
      setSenhasAtualizadas(
        dados.senhas.filter((senha) => {
          if (senha.senha_tempo_troca == 0) {
            return true;
          }
          const diffDias = getDiffDias(
            senha.senha_ultima_troca,
            senha.senha_tempo_troca
          );
          return diffDias > 0;
        }).length
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
      tratarErro(setNotificacao, err);
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 shadow-xl flex flex-col">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white/80">
              Equipamentos cadastrados
            </h2>
            <div className="h-9 w-9 grid place-items-center rounded-lg bg-blue-500/15 text-blue-400 ring-1 ring-blue-400/20">
              <Monitor className="h-5 w-5" />
            </div>
          </header>

          <div className="text-4xl font-bold tracking-tight text-white">
            {equipamentosTotal}
          </div>

          <div className="mt-4 flex-1 min-h-0">
            <ul className="max-h-72 overflow-y-auto pr-1 divide-y divide-white/5 rounded-xl ring-1 ring-white/10 bg-white/5">
              {equipamentosPorTipo.map((item) => (
                <li
                  key={item.item_tipo}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm text-white/80">
                    {item.item_tipo}
                  </span>
                  <span className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 rounded-lg bg-white/10 ring-1 ring-white/15 text-sm font-semibold text-white">
                    {item.quantidade}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 shadow-xl flex flex-col">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white/80">
              Status das Manutenções
            </h2>
          </header>
          <div className="grid gap-4">
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
              <div className="h-8 w-8 grid place-items-center rounded-lg bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/20 mb-2">
                <Wrench className="h-4 w-4" />
              </div>
              <h3 className="text-sm text-white/70">Em dia</h3>
              <div className="text-2xl font-bold text-white">{manutDia}</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
              <div className="h-8 w-8 grid place-items-center rounded-lg bg-amber-500/15 text-amber-400 ring-1 ring-amber-400/20 mb-2">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="text-sm text-white/70">Faltando 30 dias</h3>
              <div className="text-2xl font-bold text-white">{manut30}</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
              <div className="h-8 w-8 grid place-items-center rounded-lg bg-rose-500/15 text-rose-400 ring-1 ring-rose-400/20 mb-2">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-sm text-white/70">Atrasada</h3>
              <div className="text-2xl font-bold text-white">
                {manutAtrasada}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 shadow-xl flex flex-col">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white/80">
              Senhas cadastradas
            </h2>
            <div className="h-9 w-9 grid place-items-center rounded-lg bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-400/20">
              <Lock />
            </div>
          </header>

          <div className="text-4xl font-bold tracking-tight text-white text-center">
            {senhasTotal}
          </div>

          <div className="flex-1 min-h-0 grid place-items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 h-36 flex flex-col items-center justify-center text-center">
                <div className="inline-flex items-center gap-2 rounded-md bg-amber-500/15 px-3 py-1 ring-1 ring-amber-400/30 text-amber-300 text-sm font-medium">
                  Precisam ser atualizadas
                </div>
                <div className="mt-3 text-3xl font-bold text-white">
                  {senhasVencidas}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 h-36 flex flex-col items-center justify-center text-center">
                <div className="inline-flex items-center gap-2 rounded-md bg-emerald-500/15 px-3 py-1 ring-1 ring-emerald-400/30 text-emerald-300 text-sm font-medium">
                  Atualizadas
                </div>
                <div className="mt-3 text-3xl font-bold text-white">
                  {senhasAtualizadas}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mb-4 rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 shadow-xl">
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white/80">
            Situação dos Itens
          </h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-10 w-10 grid place-items-center rounded-lg bg-sky-500/15 text-sky-400 ring-1 ring-sky-400/20">
              <Computer className="h-5 w-5" />
            </div>
            <h3 className="text-sm text-white/70">Atribuídos à Workstation</h3>
            <div className="text-2xl font-bold text-white">
              {temWorkstation}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-10 w-10 grid place-items-center rounded-lg bg-amber-500/15 text-amber-400 ring-1 ring-amber-400/20">
              <Server className="h-5 w-5" />
            </div>
            <h3 className="text-sm text-white/70">Em uso sem Workstation</h3>
            <div className="text-2xl font-bold text-white">
              {semWorkstation}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-10 w-10 grid place-items-center rounded-lg bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/20">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-sm text-white/70">Em estoque</h3>
            <div className="text-2xl font-bold text-white">{emEstoque}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
