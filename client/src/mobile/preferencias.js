// Preferências do cadastro mobile: datas já vêm com a data de HOJE e o app lembra o
// último tipo/marca/modelo escolhidos (localStorage) para acelerar cadastros em série.

const CHAVE_TIPO = "cad_ultimo_tipo";
const CHAVE_MARCA = "cad_ultimo_marca";
const CHAVE_MODELO = "cad_ultimo_modelo";

// Data local no formato YYYY-MM-DD (o que o <input type="date"> espera). Usa os
// componentes locais — toISOString deslocaria o dia conforme o fuso.
function hojeISO() {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// Estado inicial do formulário: datas = hoje, tipo/marca/modelo recuperados da última
// escolha (ou vazios), demais campos limpos. Mesmo shape do form de CadastroItem.
export function defaultsCadastro() {
  const hoje = hojeISO();
  return {
    marcaId: localStorage.getItem(CHAVE_MARCA) || null,
    modeloId: localStorage.getItem(CHAVE_MODELO) || null,
    subtipo: "",
    tipo: localStorage.getItem(CHAVE_TIPO) || "",
    etiqueta: "",
    numSerie: "",
    preco: "",
    aquisicao: hoje,
    manutencao: hoje,
    intervalo: "",
    emUso: true,
  };
}

// Persiste a última escolha de tipo/marca/modelo. Ignora valores nulos/indefinidos
// (não apaga uma preferência anterior por falta de dado).
export function salvarUltimaEscolha({ tipo, marcaId, modeloId } = {}) {
  if (tipo != null && tipo !== "") localStorage.setItem(CHAVE_TIPO, String(tipo));
  if (marcaId != null && marcaId !== "")
    localStorage.setItem(CHAVE_MARCA, String(marcaId));
  if (modeloId != null && modeloId !== "")
    localStorage.setItem(CHAVE_MODELO, String(modeloId));
}
