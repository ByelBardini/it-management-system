import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DadosGerais from "../components/itens/DadosGerais.jsx";
import CadastroCaracteristica from "../components/caracteristicas/CadastroCaracteristica.jsx";
import CapturaFoto from "../components/mobile/CapturaFoto.jsx";
import LeitorCodigo from "../components/mobile/LeitorCodigo.jsx";
import ContadorPendentes from "../components/mobile/ContadorPendentes.jsx";
import Loading from "../components/default/Loading.jsx";
import Notificacao from "../components/default/Notificacao.jsx";

import { postItem } from "../services/api/itemServices.js";
import { tratarErro } from "../components/default/funcoes.js";
import { temSubtipo } from "../components/inventario/tiposComSubtipo.js";
import { montarRegistro, registroParaFormData } from "../mobile/payloadCadastro.js";
import { defaultsCadastro, salvarUltimaEscolha } from "../mobile/preferencias.js";
import { enfileirar, contarPendentes } from "../mobile/filaOffline.js";
import { iniciarSync, sincronizar } from "../mobile/sync.js";

// App de cadastro mobile (PWA standalone). Reaproveita a cascata Tipo->Subtipo->
// Marca->Modelo (DadosGerais) e as características por tipo, escondendo "desktop"
// (montado por peças). Envia online (postItem) ou guarda na fila offline; erro de
// rede cai na fila, 401/403 sinaliza re-login sem perder a fila, 4xx é notificado.
export default function CadastroMobile() {
  const navigate = useNavigate();

  const [form, setForm] = useState(() => defaultsCadastro());
  const [caracteristicas, setCaracteristicas] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [caracteristicaValida, setCaracteristicaValida] = useState(false);
  const [anexos, setAnexos] = useState([]);
  const [pendentes, setPendentes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notificacao, setNotificacao] = useState({
    show: false,
    tipo: "sucesso",
    titulo: "",
    mensagem: "",
  });

  const updateForm = useCallback(
    (patch) => setForm((prev) => ({ ...prev, ...patch })),
    []
  );

  const updateCaracteristica = useCallback((nome, valor) => {
    setCaracteristicas((prev) => {
      const i = prev.findIndex((c) => c.nome === nome);
      if (i === -1) return [...prev, { nome, valor }];
      const next = [...prev];
      next[i] = { ...next[i], valor };
      return next;
    });
  }, []);

  function fecharNotificacao() {
    setNotificacao({ show: false, tipo: "sucesso", titulo: "", mensagem: "" });
  }

  function avisarSessaoExpirada() {
    setNotificacao({
      show: true,
      tipo: "erro",
      titulo: "Sessão expirada",
      mensagem:
        "Faça login novamente para enviar os cadastros pendentes (eles foram preservados).",
    });
  }

  // 403 não é sessão: re-login não resolve (origem fora do CORS_ORIGIN ou papel sem
  // permissão). Mensagem distinta, sem sugerir re-login.
  function avisarBloqueio() {
    setNotificacao({
      show: true,
      tipo: "erro",
      titulo: "Envio bloqueado",
      mensagem:
        "O servidor recusou o cadastro (origem ou permissão). Os pendentes foram preservados; contate o administrador do sistema.",
    });
  }

  // Sem empresa ativa não há para onde cadastrar: volta ao login/seleção de empresa.
  // Liga a sincronização da fila (boot + volta de rede) e atualiza o contador.
  useEffect(() => {
    if (!localStorage.getItem("empresa_id")) {
      navigate("/", { replace: true });
      return;
    }
    const parar = iniciarSync({
      aoAtualizar: setPendentes,
      aoExpirarSessao: avisarSessaoExpirada,
      aoBloquear: avisarBloqueio,
    });
    return parar;
  }, [navigate]);

  async function atualizarPendentes() {
    try {
      setPendentes(await contarPendentes());
    } catch {
      /* contagem é best-effort */
    }
  }

  function limpar() {
    setForm(defaultsCadastro());
    setCaracteristicas([]);
    setAnexos([]);
  }

  // Validação dos obrigatórios (paridade com o ramo não-desktop de CadastroItem,
  // sem travar nas características — fluxo rápido). empresa e preço>0 são reforçados
  // dentro de montarRegistro.
  function camposIncompletos() {
    if (!form.tipo || !form.etiqueta || !form.numSerie) return true;
    if (temSubtipo(form.tipo) && !form.subtipo) return true;
    if (!form.preco || form.preco === "R$ 0,00") return true;
    if (!form.manutencao || form.intervalo === "" || form.intervalo == null)
      return true;
    return false;
  }

  function persistirEscolha() {
    salvarUltimaEscolha({
      tipo: form.tipo,
      marcaId: form.marcaId,
      modeloId: form.modeloId,
    });
  }

  async function guardarNaFila(payload, mensagem) {
    try {
      await enfileirar(payload);
      persistirEscolha();
      await atualizarPendentes();
      setNotificacao({ show: true, tipo: "sucesso", titulo: "Salvo offline", mensagem });
      limpar();
    } catch (err) {
      const cheio = err?.name === "QuotaExceededError" || err?.quotaExcedida;
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Não foi possível salvar",
        mensagem: cheio
          ? "Armazenamento do dispositivo cheio. Libere espaço e tente de novo."
          : "Falha ao guardar o cadastro para envio posterior.",
      });
    }
  }

  async function cadastrar() {
    if (camposIncompletos()) {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Dados incompletos",
        mensagem: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    const empresaId = localStorage.getItem("empresa_id");
    let registro;
    try {
      registro = montarRegistro({ form, empresaId, caracteristicas, anexos });
    } catch (err) {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Dados inválidos",
        mensagem: err.message,
      });
      return;
    }

    const payload = {
      endpoint: "/item",
      method: "POST",
      fields: registro.fields,
      files: registro.files,
    };

    // Offline conhecido: nem tenta a rede, vai direto para a fila.
    if (!navigator.onLine) {
      await guardarNaFila(
        payload,
        "Sem conexão: cadastro salvo e será enviado quando a rede voltar."
      );
      return;
    }

    try {
      setLoading(true);
      await postItem(registroParaFormData(registro));
      persistirEscolha();
      await atualizarPendentes();
      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Sucesso",
        mensagem: "Item cadastrado com sucesso.",
      });
      limpar();
    } catch (err) {
      const status = err?.status ?? err?.response?.status;
      if (!status || status >= 500) {
        // Rede indisponível / servidor fora: guarda para reenvio automático.
        await guardarNaFila(
          payload,
          "Sem resposta do servidor: cadastro salvo para reenvio automático."
        );
      } else if (status === 403) {
        // Origem/permissão: re-login não resolve. Preserva o item na fila (sobe quando
        // a origem/papel for liberada no servidor) e avisa com mensagem distinta — sem
        // o redirect ao login que tratarErro faria no 403.
        try {
          await enfileirar(payload);
          persistirEscolha();
          await atualizarPendentes();
          limpar();
        } catch {
          /* falha ao enfileirar (ex.: quota): ainda assim avisa abaixo */
        }
        avisarBloqueio();
      } else {
        // 401 (sessão, redireciona) e 4xx de validação: tratados por tratarErro.
        tratarErro(setNotificacao, err, navigate);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0A1633] text-white overflow-x-hidden">
      {loading && <Loading />}
      {notificacao.show && (
        <Notificacao
          tipo={notificacao.tipo}
          titulo={notificacao.titulo}
          mensagem={notificacao.mensagem}
          onClick={fecharNotificacao}
        />
      )}

      <div className="mx-auto w-full max-w-xl px-4 py-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">Cadastro rápido</h1>
          <div className="flex items-center gap-2">
            <ContadorPendentes total={pendentes} />
            <button
              type="button"
              onClick={() => sincronizar({ aoAtualizar: setPendentes, aoExpirarSessao: avisarSessaoExpirada })}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20"
            >
              Sincronizar
            </button>
          </div>
        </div>

        <main className="mt-5 space-y-5">
          <section className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-medium">Dados gerais</h2>
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                * Obrigatório
              </span>
            </div>
            <DadosGerais
              value={form}
              onChange={updateForm}
              setNotificacao={setNotificacao}
              tiposOcultos={["desktop"]}
            />
          </section>

          {form.tipo && form.tipo !== "desktop" && (
            <section className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10">
              <h2 className="mb-3 text-sm font-medium">Características</h2>
              <CadastroCaracteristica
                tipo={form.tipo}
                setCaracteristicas={updateCaracteristica}
                resetCaracteristicas={() => setCaracteristicas([])}
                caracteristicas={caracteristicas}
                setCaracteristicaValida={setCaracteristicaValida}
              />
            </section>
          )}

          <section className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10">
            <h2 className="mb-3 text-sm font-medium">Foto e código</h2>
            <div className="flex flex-wrap items-center gap-3">
              <CapturaFoto
                onCapturar={(anexo) => setAnexos((prev) => [...prev, anexo])}
              />
              <LeitorCodigo
                onResultado={(valor) => updateForm({ numSerie: valor })}
              />
            </div>
            {anexos.length > 0 && (
              <p className="mt-2 text-xs text-white/60">
                {anexos.length} foto{anexos.length === 1 ? "" : "s"} anexada
                {anexos.length === 1 ? "" : "s"}
              </p>
            )}
          </section>
        </main>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={cadastrar}
            className="cursor-pointer rounded-lg bg-emerald-500/70 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
}
