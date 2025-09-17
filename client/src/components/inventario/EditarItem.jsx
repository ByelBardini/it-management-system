/* eslint-disable react-hooks/exhaustive-deps */
import tipos from "./tiposCarac.js";
import EditarAnexos from "../anexos/EditarAnexos.jsx";
import { X, Paperclip } from "lucide-react";
import { getSetoresWorkstations } from "../../services/api/empresaServices.js";
import { useEffect, useState } from "react";
import { putItem, inativaItem } from "../../services/api/itemServices.js";
import { tratarErro } from "../default/funcoes.js";

export default function EditarItem({
  setEditarItem,
  setCardItem,
  setEditado,
  item,
  setLoading,
  setNotificacao,
  setConfirmacao,
}) {
  const [setores, setSetores] = useState([]);
  const [workstations, setWorkstations] = useState([]);

  const [nome, setNome] = useState(item.item_nome);
  const [setor, setSetor] = useState(item.setor ? item.setor.setor_id : "");
  const [emUso, setEmUso] = useState(item.item_em_uso == 1 ? true : false);
  const [workstation, setWorkstation] = useState(
    item.workstation ? item.workstation.workstation_id : ""
  );
  const [caracteristicas, setCaracteristicas] = useState(
    item.caracteristicas || []
  );
  const [anexos, setAnexos] = useState(item.anexos || []);

  const [abrirAnexos, setAbrirAnexos] = useState(false);

  function mudarCaracteristica(tipo, valor) {
    setCaracteristicas((prev) => {
      const existe = prev.find((c) => c.caracteristica_nome === tipo);
      if (existe) {
        return prev.map((c) =>
          c.caracteristica_nome === tipo
            ? { ...c, caracteristica_valor: valor }
            : c
        );
      } else {
        return [
          ...prev,
          {
            caracteristica_id: null,
            caracteristica_nome: tipo,
            caracteristica_valor: valor,
          },
        ];
      }
    });
  }

  async function salvarItem() {
    const id = item.item_id;
    if (!nome || setor.setor_id != workstation.workstation_setor_id) {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Informações Incorretas",
        mensagem:
          "Você não pode deixar o nome em branco, ou selecionar um workstation que não pertence ao setor.",
      });
      return;
    }
    for (const c of caracteristicas) {
      if (!c.caracteristica_valor) {
        setNotificacao({
          show: true,
          tipo: "erro",
          titulo: "Características Inválidas",
          mensagem: "Nenhum campo de característica pode estar vazio.",
        });
        return;
      }
    }
    setLoading(true);
    try {
      const setorId = emUso ? setor : "";
      const workstationId = emUso ? workstation : "";
      const emUsonum = emUso ? 1 : 0;
      const fd = new FormData();
      fd.append("item_nome", nome);
      fd.append("item_setor_id", setorId || null);
      fd.append("item_workstation_id", workstationId || null);
      fd.append("item_em_uso", emUsonum);

      fd.append("caracteristicas", JSON.stringify(caracteristicas || []));

      (anexos || []).forEach((a) => {
        if (a.anexo_id) {
          fd.append("id[]", a.anexo_id);
        } else if (a.file) {
          fd.append("tipo[]", a.anexo_tipo ?? "");
          fd.append("nome[]", a.anexo_nome ?? (a.file?.name || "arquivo"));
          fd.append("arquivos", a.file);
        }
      });
      await putItem(id, fd);

      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Sucesso!",
        mensagem: "O item foi editado com sucesso.",
      });
      setTimeout(() => {
        setEditarItem(false);
        setCardItem(false);
        setEditado(true);
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
      }, 800);
    } catch (err) {
      tratarErro(setNotificacao, err);
    } finally {
      setLoading(false);
    }
  }

  async function inativarItem() {
    setLoading(true);
    setConfirmacao({ show: false, texto: "", onSim: null });
    const obs = caracteristicas.find(
      (caracteristica) => caracteristica.caracteristica_nome == "observacoes"
    );
    if (!obs || !obs.caracteristica_valor) {
      setLoading(false);
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Erro ao inativar Item",
        mensagem:
          "Para inativar um item, é necessário adicionar uma observação do motivo de sua inativação",
      });
      return;
    }
    try {
      await inativaItem(item.item_id);
      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Item inativado",
        mensagem: "O item foi inativado com sucesso.",
      });
      setTimeout(() => {
        setEditarItem(false);
        setCardItem(false);
        setEditado(true);
        setNotificacao(
          {
            show: false,
            tipo: "sucesso",
            titulo: "",
            mensagem: "",
          },
          700
        );
      });
    } catch (err) {
      tratarErro(setNotificacao, err);
    } finally {
      setLoading(false);
    }
  }

  async function puxarSetoresWorkstations() {
    const id = localStorage.getItem("empresa_id");
    try {
      const dados = await getSetoresWorkstations(id);
      setSetores(dados.setores);
      setWorkstations(dados.workstations);
    } catch (err) {
      tratarErro(setNotificacao, err);
    }
  }

  useEffect(() => {
    puxarSetoresWorkstations();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[60]">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] bg-white/5 rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6 relative backdrop-blur-3xl overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setAbrirAnexos(true)}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm text-white"
          >
            <Paperclip className="w-4 h-4" />
            Anexos
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[11px] leading-none">
              {anexos.length}
            </span>
          </button>

          <button
            onClick={() => setEditarItem(false)}
            className="cursor-pointer text-white/60 hover:text-white text-lg"
          >
            <X />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-white/60">Nome</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              type="text"
              placeholder="Digite o nome"
              className="w-full rounded-lg bg-white/10 p-2 text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60">Setor</label>
            <select
              onChange={(e) => setSetor(e.target.value)}
              value={setor}
              className="w-full rounded-lg bg-white/10 p-2 text-white focus:outline-none"
            >
              <option value={""}>Nenhum</option>
              {setores.map((setor) => (
                <option key={setor.setor_id} value={setor.setor_id}>
                  {setor.setor_nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60">Workstation</label>
            <select
              onChange={(e) => setWorkstation(e.target.value)}
              value={workstation}
              className="w-full rounded-lg bg-white/10 p-2 text-white focus:outline-none"
            >
              <option value={""}>Nenhum</option>
              {setor == ""
                ? workstations.map((workstation) => (
                    <option
                      key={workstation.workstation_id}
                      value={workstation.workstation_id}
                    >
                      {workstation.workstation_nome}
                    </option>
                  ))
                : workstations
                    .filter(
                      (workstation) => workstation.workstation_setor_id == setor
                    )
                    .map((workstation) => (
                      <option
                        key={workstation.workstation_id}
                        value={workstation.workstation_id}
                      >
                        {workstation.workstation_nome}
                      </option>
                    ))}
            </select>
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium text-white mb-3">
            Características
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {caracteristicas
              .filter(
                (caracteristica) =>
                  caracteristica.caracteristica_nome != "observacoes"
              )
              .map((caracteristica) => (
                <div key={caracteristica.caracteristica_id}>
                  <label className="block text-sm text-white/60">
                    {tipos[caracteristica.caracteristica_nome]}
                  </label>
                  <input
                    value={caracteristica.caracteristica_valor}
                    onChange={(e) =>
                      mudarCaracteristica(
                        caracteristica.caracteristica_nome,
                        e.target.value
                      )
                    }
                    type="text"
                    placeholder="Digite aqui..."
                    className="w-full rounded-lg bg-white/10 p-2 text-white focus:outline-none"
                  />
                </div>
              ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/60">Observações</label>
          <textarea
            value={
              caracteristicas.find(
                (caracteristica) =>
                  caracteristica.caracteristica_nome == "observacoes"
              )
                ? caracteristicas.find(
                    (caracteristica) =>
                      caracteristica.caracteristica_nome == "observacoes"
                  ).caracteristica_valor
                : ""
            }
            onChange={(e) => mudarCaracteristica("observacoes", e.target.value)}
            rows="3"
            placeholder="Digite observações..."
            className="w-full rounded-lg bg-white/10 p-3 text-white focus:outline-none resize-none"
          />
        </div>

        <div className="flex justify-between items-center gap-3 pt-4 border-t border-white/20">
          <div className="flex gap-3">
            <button
              className={
                emUso
                  ? "cursor-pointer px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "cursor-pointer px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white"
              }
              onClick={() => setEmUso(!emUso)}
            >
              {emUso ? "Em uso" : "Em Estoque"}
            </button>
            <button
              className="cursor-pointer px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
              onClick={() =>
                setConfirmacao({
                  show: true,
                  texto:
                    "Tem certeza que deseja inativar este item? Esta ação não pode ser desfeita.",
                  onSim: () => {
                    inativarItem();
                  },
                })
              }
            >
              Inativar item
            </button>
          </div>

          <div className="flex gap-3">
            <button
              className="cursor-pointer px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
              onClick={() => setEditarItem(false)}
            >
              Cancelar
            </button>
            <button
              className="cursor-pointer px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white"
              onClick={salvarItem}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
      {abrirAnexos && (
        <EditarAnexos
          setAbrirAnexos={setAbrirAnexos}
          anexos={anexos}
          setAnexos={setAnexos}
        />
      )}
    </div>
  );
}
