// Builder PURO do registro de cadastro mobile. Espelha a normalização do multipart
// de CadastroItem.jsx, porém SEM o ramo `desktop` (o app mobile não monta desktops):
//   - preço: parseInt(preco.replace(/\D/g, ""), 10) / 100 -> String(...)
//   - em_uso/intervalo: String(...)
//   - característica { nome: "tipo", valor: subtipo } injetada (dedupada) quando o tipo
//     tem subtipo e há subtipo escolhido.
// Saída: { fields, files } — NÃO um FormData (FormData não é serializável p/ IndexedDB).
// O FormData é remontado por registroParaFormData no envio (online ou drain da fila).
import { temSubtipo } from "../components/inventario/tiposComSubtipo.js";

export function montarRegistro({ form, empresaId, caracteristicas = [], anexos = [] }) {
  if (!empresaId) {
    throw new Error(
      "empresa_id ausente: selecione a empresa ativa antes de cadastrar."
    );
  }

  const precoNumero = parseInt(String(form.preco).replace(/\D/g, ""), 10) / 100;
  if (!precoNumero || precoNumero <= 0) {
    throw new Error("Preço inválido: informe um valor maior que zero.");
  }

  // Subtipo entra como característica { nome: "tipo", valor: subtipo } (paridade com
  // CadastroItem), removendo qualquer "tipo" anterior para não duplicar.
  let caracteristicasFinais = caracteristicas || [];
  if (temSubtipo(form.tipo) && form.subtipo) {
    caracteristicasFinais = [
      ...caracteristicasFinais.filter((c) => c.nome !== "tipo"),
      { nome: "tipo", valor: form.subtipo },
    ];
  }

  const fields = {
    item_empresa_id: String(empresaId),
    item_marca_id: String(form.marcaId ?? ""),
    item_modelo_id: String(form.modeloId ?? ""),
    item_tipo: form.tipo,
    item_etiqueta: form.etiqueta,
    item_num_serie: form.numSerie,
    item_preco: String(precoNumero),
    item_data_aquisicao: form.aquisicao,
    item_em_uso: String(!!form.emUso),
    item_ultima_manutencao: form.manutencao,
    item_intervalo_manutencao: String(form.intervalo),
    caracteristicas: JSON.stringify(caracteristicasFinais),
  };

  // Anexos: arrays paralelos id[]/tipo[]/nome[] (espelho de CadastroItem) + os File
  // em `files`. Só cria as chaves quando há anexos (no fluxo mínimo elas não existem).
  const files = [];
  if (anexos.length) {
    fields["id[]"] = [];
    fields["tipo[]"] = [];
    fields["nome[]"] = [];
    anexos.forEach((a) => {
      fields["id[]"].push(a.id ?? "");
      fields["tipo[]"].push(a.tipo ?? "");
      fields["nome[]"].push(a.nome ?? a.file?.name ?? "arquivo");
      if (a.file) files.push(a.file);
    });
  }

  return { fields, files };
}

// Remonta o FormData multipart a partir de { fields, files }. Campos com valor array
// (id[]/tipo[]/nome[]) viram múltiplos appends; os arquivos vão como "arquivos".
// Usado tanto no envio online quanto no drain da fila (via filaOffline.reconstruirFormData).
export function registroParaFormData(registro) {
  const fd = new FormData();
  const fields = registro.fields || {};
  for (const [chave, valor] of Object.entries(fields)) {
    if (Array.isArray(valor)) {
      valor.forEach((v) => fd.append(chave, v));
    } else {
      fd.append(chave, valor);
    }
  }
  (registro.files || []).forEach((file) => fd.append("arquivos", file));
  return fd;
}
