import CadastroCaracteristica from "../components/caracteristicas/CadastroCaracteristica.jsx";
import DadosGerais from "../components/itens/DadosGerais.jsx";
import AdicionaAnexo from "../components/anexos/AdicionaAnexo.jsx";
import { useState, useCallback } from "react";
import { postItem } from "../services/api/itemServices.js";

export default function CadastroItem() {
  async function cadastraItem() {
    const id_empresa = localStorage.getItem("empresa_id");
    if (
      form.nome == "" ||
      form.tipo == "" ||
      form.etiqueta == "" ||
      form.numSerie == "" ||
      form.preco == "" ||
      form.aquisicao == "" ||
      form.manutencao == "" ||
      form.intervalo == ""
    ) {
      alert("Preencha todos os campos obrigatórios");
      return;
    } else if (!caracteristicaValida) {
      alert("Preencha todas as características");
      return;
    } else {
      try {
        const fd = new FormData();

        fd.append("item_empresa_id", id_empresa);
        fd.append("item_nome", form.nome);
        fd.append("item_tipo", form.tipo);
        fd.append("item_etiqueta", form.etiqueta);
        fd.append("item_num_serie", form.numSerie);
        fd.append("item_preco", String(form.preco));
        fd.append("item_data_aquisicao", form.aquisicao);
        fd.append("item_em_uso", String(!!form.emUso));
        fd.append("item_ultima_manutencao", form.manutencao);
        fd.append("item_intervalo_manutencao", String(form.intervalo));

        fd.append("caracteristicas", JSON.stringify(caracteristicas || []));

        (anexos || []).forEach((a) => {
          fd.append("tipo[]", a.tipo ?? "");
          fd.append("nome[]", a.nome ?? (a.file?.name || "arquivo"));
          if (a.file) fd.append("arquivos", a.file);
        });

        await postItem(fd);
      } catch (err) {
        console.error("Erro ao adicionar item:", err);
        alert("Falha ao salvar item");
      }
    }
  }

  /*function teste() {
    console.log(form);
    console.log(caracteristicas);
    console.log(caracteristicaValida);
    console.log(anexos);
  }*/

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
            <button
              onClick={cadastraItem}
              className="cursor-pointer rounded-lg bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/20"
            >
              Voltar
            </button>
          </div>
        </div>

        <main className="mt-6 space-y-6">
          <section className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h2 className="mb-4 text-base font-medium text-white">
              Dados Gerais
            </h2>

            <DadosGerais value={form} onChange={updateForm} />
          </section>

          <section className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h2 className="mb-4 text-base font-medium text-white">
              Características
            </h2>
            <CadastroCaracteristica
              tipo={form.tipo}
              setCaracteristicas={updateCaracteristica}
              resetCaracteristicas={() => setCaracteristicas([])}
              caracteristicas={caracteristicas}
              setCaracteristicaValida={setCaracteristicaValida}
            />
          </section>

          <section className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h2 className="mb-4 text-base font-medium text-white">Anexos</h2>

            <AdicionaAnexo anexos={anexos} setAnexos={setAnexos} />
          </section>
        </main>
      </div>
    </div>
  );
}
