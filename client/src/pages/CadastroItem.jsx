import CadastroCaracteristica from "../components/caracteristicas/CadastroCaracteristica.jsx";
import CadastroDesktop from "../components/caracteristicas/CadastroDesktop.jsx";
import DadosGerais from "../components/itens/DadosGerais.jsx";
import AdicionaAnexo from "../components/anexos/AdicionaAnexo.jsx";
import Loading from "../components/default/Loading.jsx";
import ModalConfirmacao from "../components/default/ModalConfirmacao.jsx";
import Notificacao from "../components/default/Notificacao.jsx";
import ModalSelecionaPeca from "../components/caracteristicas/ModalSelecionaPeca.jsx";
import { useState, useCallback, useEffect } from "react";
import { getPecasAtivas } from "../services/api/pecasServices.js";
import { postItem } from "../services/api/itemServices.js";
import { NavLink, useNavigate } from "react-router-dom";
import { tratarErro } from "../components/default/funcoes.js";

export default function CadastroItem() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [notificacao, setNotificacao] = useState({
    show: false,
    tipo: "sucesso",
    titulo: "",
    mensagem: "",
  });

  const [selecionaPeca, setSelecionaPeca] = useState({
    open: false,
    tipo: null,
    multi: false,
  });
  const [pecasSelecionadas, setPecasSelecionadas] = useState({});
  const [pecas, setPecas] = useState([]);

  function limpaTela() {
    setForm({
      nome: "",
      tipo: "",
      etiqueta: "",
      numSerie: "",
      preco: "",
      aquisicao: "",
      manutencao: "",
      intervalo: "",
      emUso: true,
    });
    setCaracteristicas([]);
    setAnexos([]);
    setModalConfirmacao(false);
  }

  async function cadastraItem() {
    const id_empresa = localStorage.getItem("empresa_id");
    if (
      form.nome == "" ||
      form.tipo == "" ||
      form.etiqueta == "" ||
      form.numSerie == "" ||
      form.preco == "R$ 0,00" ||
      form.manutencao == "" ||
      form.intervalo == ""
    ) {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Dados imcompletos",
        mensagem: "Preencha todos os campos obrigatórios",
      });
      return;
    } else if (!caracteristicaValida) {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Características inválidas",
        mensagem: "Preencha todas as características corretamente",
      });
      return;
    } else {
      try {
        setLoading(true);
        const fd = new FormData();
        const precoFormatado =
          parseInt(form.preco.replace(/\D/g, ""), 10) / 100;

        fd.append("item_empresa_id", id_empresa);
        fd.append("item_nome", form.nome);
        fd.append("item_tipo", form.tipo);
        fd.append("item_etiqueta", form.etiqueta);
        fd.append("item_num_serie", form.numSerie);
        fd.append("item_preco", String(precoFormatado));
        fd.append("item_data_aquisicao", form.aquisicao);
        fd.append("item_em_uso", String(!!form.emUso));
        fd.append("item_ultima_manutencao", form.manutencao);
        fd.append("item_intervalo_manutencao", String(form.intervalo));

        if (form.tipo === "desktop") {
          const ids = Object.values(pecasSelecionadas || [])
            .flat()
            .filter((v) => typeof v === "number" || typeof v === "string")
            .map((v) => Number(v));
          fd.append("pecas", JSON.stringify(ids));
          fd.append("caracteristicas", JSON.stringify([]));
        } else {
          fd.append("caracteristicas", JSON.stringify(caracteristicas || []));
        }

        (anexos || []).forEach((a) => {
          fd.append("id[]", a.id ?? "");
          fd.append("tipo[]", a.tipo ?? "");
          fd.append("nome[]", a.nome ?? (a.file?.name || "arquivo"));
          if (a.file) fd.append("arquivos", a.file);
        });

        await postItem(fd);
        setModalConfirmacao(true);
      } catch (err) {
        tratarErro(setNotificacao, err, navigate);
      } finally {
        setLoading(false);
      }
    }
  }

  const [form, setForm] = useState({
    nome: "",
    tipo: "",
    etiqueta: "",
    numSerie: "",
    preco: "",
    aquisicao: "",
    manutencao: "",
    intervalo: "",
    emUso: true,
  });
  const [caracteristicas, setCaracteristicas] = useState([
    {
      nome: "",
      valor: "",
    },
  ]);
  const [caracteristicaValida, setCaracteristicaValida] = useState(false);
  const [anexos, setAnexos] = useState([]);

  const updateForm = useCallback(
    (patch) => setForm((prev) => ({ ...prev, ...patch })),
    []
  );

  function formatarRealDinamico(valor) {
    valor = String(valor).replace(/\D/g, "");
    if (!valor) return "R$ 0,00";
    valor = (parseInt(valor, 10) / 100).toFixed(2);
    valor = valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `R$ ${valor}`;
  }

  useEffect(() => {
    if (form.tipo !== "desktop") return;
    const ids = Object.values(pecasSelecionadas || []).flat();
    const soma = ids
      .map((id) => pecas.find((p) => p.peca_id === id))
      .filter(Boolean)
      .reduce((acc, p) => acc + Number(p.peca_preco || 0), 0);
    const centavos = Math.round(soma * 100);
    setForm((prev) => ({
      ...prev,
      preco: formatarRealDinamico(String(centavos)),
    }));
  }, [pecasSelecionadas, pecas, form.tipo]);

  useEffect(() => {
    async function fetchPecas() {
      try {
        const idEmpresa = localStorage.getItem("empresa_id");
        const lista = await getPecasAtivas(idEmpresa);
        setPecas(lista);
      } catch {
        setNotificacao({
          show: true,
          tipo: "erro",
          titulo: "Erro ao buscar peças",
          mensagem: "Não foi possível carregar a lista de peças.",
        });
      }
    }
    if (form.tipo === "desktop") {
      fetchPecas();
    }
  }, [form.tipo]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (selecionaPeca.open) {
          setSelecionaPeca({ open: false, tipo: null, multi: false });
        }
      }
      return () => {
        window.removeEventListener("keydown", onKeyDown);
      };
    }
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [selecionaPeca.open]);

  const updateCaracteristica = (nome, valor) => {
    setCaracteristicas((prev) => {
      const i = prev.findIndex((c) => c.nome === nome);
      if (i === -1) return [...prev, { nome, valor }];
      const next = [...prev];
      next[i] = { ...next[i], valor };
      return next;
    });
  };
  return (
    <div className="relative min-h-screen bg-[#0A1633] text-white overflow-x-hidden">
      {loading && <Loading />}
      {modalConfirmacao && (
        <ModalConfirmacao
          onSim={() => limpaTela()}
          onNao={() => navigate("/inventario", { replace: true })}
          tipo={"sucesso"}
          texto={
            "Item inserido com sucesso! Você gostaria se inserir mais algum?"
          }
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
      {selecionaPeca.open && (
        <ModalSelecionaPeca
          pecas={pecas.filter(
            (p) =>
              p.peca_tipo === selecionaPeca.tipo &&
              !p.peca_em_uso &&
              (p.peca_item_id == null || p.peca_item_id === 0)
          )}
          selectedIds={pecasSelecionadas[selecionaPeca.tipo] || []}
          multi={selecionaPeca.multi}
          tipo={selecionaPeca.tipo}
          onClose={() =>
            setSelecionaPeca({ open: false, tipo: null, multi: false })
          }
          onConfirm={(ids) => {
            setPecasSelecionadas((prev) => ({
              ...prev,
              [selecionaPeca.tipo]: ids,
            }));
            setSelecionaPeca({ open: false, tipo: null, multi: false });
          }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(59,130,246,0.22),transparent)]" />
        <div
          className="absolute inset-0 opacity-40
          [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]
          [background-size:36px_36px]"
        />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
      </div>
      <div className="w-full max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Cadastro de Item</h1>
          <div className="flex items-center gap-3">
            <NavLink
              to="/inventario"
              className="cursor-pointer rounded-lg bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/20"
            >
              Voltar
            </NavLink>
          </div>
        </div>

        <main className="mt-6 space-y-6">
          <section className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-base font-medium text-white">Dados Gerais</h2>
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                * Obrigatório
              </span>
            </div>

            <DadosGerais value={form} onChange={updateForm} />
          </section>

          <section className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-base font-medium text-white">
                {`${form.tipo == "desktop" ? "Peças" : "Características"}`}
              </h2>
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                * Obrigatório
              </span>
            </div>
            {form.tipo != "desktop" ? (
              <CadastroCaracteristica
                tipo={form.tipo}
                setCaracteristicas={updateCaracteristica}
                resetCaracteristicas={() => setCaracteristicas([])}
                caracteristicas={caracteristicas}
                setCaracteristicaValida={setCaracteristicaValida}
              />
            ) : (
              <CadastroDesktop
                setPecas={setPecas}
                setCaracteristicas={setCaracteristicas}
                resetCaracteristicas={() => setCaracteristicas([])}
                caracteristicas={caracteristicas}
                setCaracteristicaValida={setCaracteristicaValida}
                setSelecionaPeca={setSelecionaPeca}
                pecasSelecionadas={pecasSelecionadas}
                pecas={pecas}
              />
            )}
          </section>

          <section className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h2 className="mb-4 text-base font-medium text-white">Anexos</h2>

            <AdicionaAnexo anexos={anexos} setAnexos={setAnexos} />
          </section>
        </main>
        <div className="w-full justify-center flex">
          <button
            onClick={cadastraItem}
            className="cursor-pointer mt-4 text-md rounded-lg bg-emerald-500/60 px-4 py-2 text-white/90 hover:bg-emerald-500/80"
          >
            Cadastrar Item
          </button>
        </div>
      </div>
    </div>
  );
}
