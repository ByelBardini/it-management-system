/* eslint-disable react-hooks/exhaustive-deps */
import AdicionaWorkstation from "../components/workstations/AdicionaWorkstation.jsx";
import ModalWorkstation from "../components/workstations/ModalWorkstation.jsx";
import ModalConfirmacao from "../components/default/ModalConfirmacao.jsx";
import CardItem from "../components/inventario/CardItem.jsx";
import Notificacao from "../components/default/Notificacao.jsx";
import Loading from "../components/default/Loading.jsx";
import Filtro from "../components/workstations/Filtro.jsx";
import Paginacao from "../components/default/Paginacao.jsx";
import { Plus, SearchX } from "lucide-react";
import { getWorkstation } from "../services/api/workstationServices.js";
import { useEffect } from "react";
import { useState } from "react";
import {
  dividirEmPartes,
  tratarErro,
  useItensPorPagina,
} from "../components/default/funcoes.js";
import { useNavigate } from "react-router-dom";

export default function Workstations() {
  const navigate = useNavigate();
  const itensPorPagina = useItensPorPagina(72, 240) * 3;

  const [workstations, setWorkstations] = useState([]);
  const [workstationsFiltradas, setWorkstationsFiltradas] = useState([]);
  const [adicionando, setAdicionando] = useState(false);

  const [modificado, setModificado] = useState(false);

  const [notificacao, setNotificacao] = useState({
    show: false,
    tipo: "sucesso",
    titulo: "",
    mensagem: "",
  });
  const [confirmacao, setConfirmacao] = useState({
    show: false,
    texto: "",
    onSim: null,
  });

  const [carregando, setCarregando] = useState(false);
  const [cardWorkstation, setCardWorkstation] = useState(false);

  const [cardItem, setCardItem] = useState(false);

  const [workstationsOrdenadas, setWorkstationsOrdenadas] = useState([]);
  const [sessao, setSessao] = useState(0);

  async function buscarWorkstations() {
    const id = localStorage.getItem("empresa_id");
    setCarregando(true);
    try {
      const workstations = await getWorkstation(id);
      setCarregando(false);
      setWorkstations(workstations);
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    }
  }

  function abreCard(id, anydesk, senha_anydesk) {
    localStorage.setItem("workstation_id", id);
    localStorage.setItem("workstation_anydesk", anydesk);
    localStorage.setItem("workstation_senha_anydesk", senha_anydesk);
    setCardWorkstation(true);
  }

  useEffect(() => {
    buscarWorkstations();
    setModificado(false);
  }, [modificado]);

  useEffect(() => {
    const ordenadas = dividirEmPartes(workstationsFiltradas, itensPorPagina);
    setWorkstationsOrdenadas(ordenadas);
    setSessao(0);
  }, [workstationsFiltradas]);

  return (
    <div className="p-4">
      {cardItem && <CardItem setCardItem={setCardItem} />}
      {cardWorkstation && (
        <ModalWorkstation
          setCardWorkstation={setCardWorkstation}
          setConfirmacao={setConfirmacao}
          setNotificacao={setNotificacao}
          setCarregando={setCarregando}
          modificado={modificado}
          setModificado={setModificado}
          setCardItem={setCardItem}
          buscarWorkstations={buscarWorkstations}
        />
      )}
      {confirmacao.show && (
        <ModalConfirmacao
          onNao={() =>
            setConfirmacao({
              show: false,
              texto: "",
              onSim: null,
            })
          }
          onSim={confirmacao.onSim}
          texto={confirmacao.texto}
        />
      )}
      {adicionando && (
        <AdicionaWorkstation
          setNotificacao={setNotificacao}
          setAdicionando={setAdicionando}
          setModificado={setModificado}
          setCarregando={setCarregando}
        />
      )}
      {notificacao.show && (
        <Notificacao
          onClick={() =>
            setNotificacao({
              show: false,
              tipo: "sucesso",
              titulo: "",
              mensagem: "",
            })
          }
          tipo={notificacao.tipo}
          titulo={notificacao.titulo}
          mensagem={notificacao.mensagem}
        />
      )}
      {carregando && <Loading />}
      <div className="rounded-2xl bg-white/5 backdrop-blur-md ring-1 ring-white/10 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Workstations</h2>

          <Filtro
            workstations={workstations}
            setWorkstationsFiltradas={setWorkstationsFiltradas}
          />

          <button
            onClick={() => setAdicionando(true)}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Adicionar</span>
          </button>
        </div>
        <div className="overflow-x-auto grid grid-cols-3 gap-3 p-1">
          {(workstationsOrdenadas[sessao] || []).map((workstation) => (
            <div
              key={workstation.workstation_id}
              onDoubleClick={() =>
                abreCard(
                  workstation.workstation_id,
                  workstation.workstation_anydesk,
                  workstation.workstation_senha_anydesk
                )
              }
              className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 shadow-md p-4 hover:bg-white/10 transition"
            >
              <h3 className="text-sm font-semibold text-white">
                {workstation.workstation_nome}
              </h3>
              <p className="text-xs text-white/60 mt-1">
                {workstation.setor.setor_nome}
              </p>
            </div>
          ))}
        </div>
        {workstationsFiltradas.length == 0 && (
          <div className="w-full py-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white/60 mb-4">
              <SearchX className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Nenhuma workstation encontrada
            </h3>
            <p className="text-sm text-white/60 mt-1">
              Adicione uma workstation para ela ser exibida aqui.
            </p>
          </div>
        )}
      </div>

      {workstationsOrdenadas.length > 0 && (
        <Paginacao
          sessao={sessao}
          setSessao={setSessao}
          ordenadas={workstationsOrdenadas}
        />
      )}
    </div>
  );
}
