/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import Loading from "../components/default/Loading";
import Notificacao from "../components/default/Notificacao";
import ModalConfirmacao from "../components/default/ModalConfirmacao";
import TabelaPecas from "../components/pecas/TabelaPecas";
import ModalCadastraPecas from "../components/pecas/ModalCadastraPecas";
import {
  getPecasAtivas,
  getPecasInativas,
} from "../services/api/pecasServices.js";
import { tratarErro } from "../components/default/funcoes.js";
import { useNavigate } from "react-router-dom";
import { Plus, FunnelPlus, FunnelX } from "lucide-react";
import { useEffect, useState } from "react";

export default function Pecas() {
  const navigate = useNavigate();

  const [pecas, setPecas] = useState([]);
  const [cardPecas, setCardPecas] = useState(false);
  const [adiciona, setAdiciona] = useState(false);

  const [loading, setLoading] = useState(false);
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

  const [inativos, setInativos] = useState(false);
  const [filtrando, setFiltrando] = useState(false);

  async function buscarPecas() {
    setLoading(true);
    const id_empresa = localStorage.getItem("empresa_id");
    try {
      if (inativos) {
        const pecas = await getPecasInativas(id_empresa);
        setPecas(pecas);
      } else {
        const pecas = await getPecasAtivas(id_empresa);
        setPecas(pecas);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      tratarErro(setNotificacao, err, navigate);
    }
  }

  useEffect(() => {
    buscarPecas();
  }, [inativos]);

  return (
    <div className="p-4">
      {loading && <Loading />}
      {confirmacao.show && (
        <ModalConfirmacao
          texto={confirmacao.texto}
          onNao={() => setConfirmacao({ show: false, texto: "", onSim: null })}
          onSim={confirmacao.onSim}
        />
      )}
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
      {adiciona && (
        <ModalCadastraPecas
          setAdiciona={setAdiciona}
          setNotificacao={setNotificacao}
          setLoading={setLoading}
        />
      )}
      <div className="rounded-2xl bg-white/5 backdrop-blur-md ring-1 ring-white/10 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Peças</h2>

          <div className="flex gap-2">
            <button
              onClick={() => setFiltrando(!filtrando)}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition"
            >
              {filtrando ? <FunnelX size={18} /> : <FunnelPlus size={18} />}
            </button>

            <button
              onClick={() => setAdiciona(true)}
              to={"/cadastro"}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 transition"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Adicionar</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <TabelaPecas
            pecas={pecas}
            setCardPecas={setCardPecas}
            inativos={inativos}
          />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="w-full flex justify-end">
          <button
            className={`w1/3 cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              !inativos
                ? "bg-red-600/50 ring-1 ring-red-600/10 text-white/80 hover:bg-red-600/70 transition"
                : "bg-emerald-600/50 ring-1 ring-emerald-600/10 text-white/80 hover:bg-emerald-600/70 transition"
            }`}
            onClick={() => setInativos(!inativos)}
          >
            <span className="text-sm font-medium">
              {!inativos ? "Listar Itens Inativos" : "Listar Itens Ativos"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
