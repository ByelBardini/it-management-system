// Funções puras de apoio à importação em massa por CSV (itens e peças).
// O parsing acontece no front (sem biblioteca): o backend recebe JSON já validado.
// As regras de validação aqui ESPELHAM server/controllers/helpers/importacao.js —
// mantenha as duas em sincronia.

export const COLUNAS_ITEM = [
  "tipo",
  "etiqueta",
  "num_serie",
  "marca",
  "modelo",
  "subtipo",
  "preco",
  "data_aquisicao",
  "ultima_manutencao",
  "intervalo_manutencao",
  "em_uso",
];

export const COLUNAS_PECA = [
  "tipo",
  "marca",
  "modelo",
  "num_serie",
  "preco",
  "data_aquisicao",
];

// Tipos de item importáveis (não inclui "desktop", que depende de peças vinculadas).
const TIPOS_ITEM_IMPORTAVEIS = [
  "notebook",
  "movel",
  "cadeira",
  "monitor",
  "ferramenta",
  "ap",
  "ar-condicionado",
  "switch",
  "periferico",
  "no-break",
  "impressora",
  "gerador",
  "celular",
  "cabo",
  "outros",
];

const TIPOS_PECA = [
  "processador",
  "placa-video",
  "placa-mae",
  "ram",
  "armazenamento",
  "fonte",
  "placa-rede",
  "gabinete",
  "outros",
];

const LIMITES = {
  ITEM_NUM_SERIE: 255,
  PECA_NUM_SERIE: 150,
  ETIQUETA: 10,
  MARCA: 100,
  MODELO: 100,
  SUBTIPO: 100,
};

const RE_NUMERO = /^\d+(\.\d+)?$/;
const RE_INTEIRO = /^\d+$/;
const RE_DATA = /^\d{4}-\d{2}-\d{2}$/;

// Quebra uma linha de CSV respeitando aspas (campos podem conter o separador).
function dividirLinha(linha, sep) {
  const out = [];
  let atual = "";
  let dentroAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i];
    if (ch === '"') {
      if (dentroAspas && linha[i + 1] === '"') {
        atual += '"';
        i++;
      } else {
        dentroAspas = !dentroAspas;
      }
    } else if (ch === sep && !dentroAspas) {
      out.push(atual);
      atual = "";
    } else {
      atual += ch;
    }
  }
  out.push(atual);
  return out;
}

// Detecta o separador olhando o cabeçalho FORA de aspas (evita falso ';' dentro de
// um campo entre aspas). Conta vírgulas vs ponto-e-vírgula no nível de topo.
function detectarSeparador(cabecalho) {
  let dentroAspas = false;
  let virgulas = 0;
  let pontoVirgulas = 0;
  for (const ch of cabecalho) {
    if (ch === '"') dentroAspas = !dentroAspas;
    else if (!dentroAspas && ch === ",") virgulas++;
    else if (!dentroAspas && ch === ";") pontoVirgulas++;
  }
  return pontoVirgulas > virgulas ? ";" : ",";
}

// Lê o texto de um CSV e devolve um array de objetos chaveado pelo cabeçalho.
// Detecta "," ou ";" como separador, respeita aspas, ignora linhas em branco
// e remove espaços nas pontas dos valores.
export function parseCsv(texto) {
  const linhas = String(texto ?? "")
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");
  if (linhas.length === 0) return [];

  const sep = detectarSeparador(linhas[0]);
  const cabecalho = dividirLinha(linhas[0], sep).map((c) => c.trim());

  const registros = [];
  for (let i = 1; i < linhas.length; i++) {
    const valores = dividirLinha(linhas[i], sep);
    const obj = {};
    cabecalho.forEach((coluna, idx) => {
      obj[coluna] = (valores[idx] ?? "").trim();
    });
    registros.push(obj);
  }
  return registros;
}

// Gera o conteúdo do modelo (template) de CSV para download, com 1 linha de exemplo.
export function gerarModeloCsv(dominio) {
  if (dominio === "peca") {
    const exemplo = [
      "ram",
      "Kingston",
      "Fury Beast",
      "SN-EXEMPLO-1",
      "499.90",
      "2024-01-15",
    ];
    return `${COLUNAS_PECA.join(",")}\n${exemplo.join(",")}\n`;
  }
  const exemplo = [
    "monitor",
    "MON-001",
    "SN-EXEMPLO-1",
    "Dell",
    "P2419H",
    "",
    "899.90",
    "2024-01-15",
    "2024-01-15",
    "6",
    "sim",
  ];
  return `${COLUNAS_ITEM.join(",")}\n${exemplo.join(",")}\n`;
}

// Normaliza um número para ponto decimal, tolerando formatos BR e US.
// Regra: quando há os dois separadores, o ÚLTIMO é o decimal e o outro é milhar.
// "1.234,56" -> "1234.56"; "1,234.56" -> "1234.56"; "499,90" -> "499.90";
// "499.90" -> "499.90"; "1234" -> "1234". Só ponto = decimal (formato documentado).
export function normalizarNumero(v) {
  let s = String(v ?? "").trim();
  if (!s) return "";
  const ultimaVirgula = s.lastIndexOf(",");
  const ultimoPonto = s.lastIndexOf(".");
  if (ultimaVirgula > -1 && ultimoPonto > -1) {
    if (ultimaVirgula > ultimoPonto) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (ultimaVirgula > -1) {
    s = s.replace(",", ".");
  }
  return s;
}

function numeroInvalido(v) {
  const s = normalizarNumero(v);
  return !RE_NUMERO.test(s) || !Number.isFinite(Number(s));
}

function inteiroInvalido(v) {
  return !RE_INTEIRO.test(String(v ?? "").trim());
}

function dataInvalida(v) {
  const s = String(v ?? "").trim();
  if (!RE_DATA.test(s)) return true;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s;
}

function motivosLinhaItem(linha) {
  const motivos = [];
  const tipo = String(linha.tipo ?? "").trim();
  const etiqueta = String(linha.etiqueta ?? "").trim();
  const num_serie = String(linha.num_serie ?? "").trim();
  const marca = String(linha.marca ?? "").trim();
  const modelo = String(linha.modelo ?? "").trim();
  const subtipo = String(linha.subtipo ?? "").trim();

  if (!tipo) motivos.push("tipo é obrigatório");
  else if (tipo === "desktop")
    motivos.push("desktop não pode ser importado em massa");
  else if (!TIPOS_ITEM_IMPORTAVEIS.includes(tipo))
    motivos.push(`tipo inválido: ${tipo}`);

  if (!etiqueta) motivos.push("etiqueta é obrigatória");
  else if (etiqueta.length > LIMITES.ETIQUETA)
    motivos.push("etiqueta deve ter no máximo 10 caracteres");

  if (!num_serie) motivos.push("número de série é obrigatório");
  else if (num_serie.length > LIMITES.ITEM_NUM_SERIE)
    motivos.push("número de série excede 255 caracteres");

  if (marca.length > LIMITES.MARCA) motivos.push("marca excede 100 caracteres");
  if (modelo.length > LIMITES.MODELO)
    motivos.push("modelo excede 100 caracteres");
  if (subtipo.length > LIMITES.SUBTIPO)
    motivos.push("subtipo excede 100 caracteres");
  if (modelo && !marca) motivos.push("modelo informado sem marca");

  if (numeroInvalido(linha.preco))
    motivos.push("preço inválido (use ponto decimal, ex.: 499.90)");
  if (dataInvalida(linha.data_aquisicao))
    motivos.push("data de aquisição inválida (use AAAA-MM-DD)");
  if (dataInvalida(linha.ultima_manutencao))
    motivos.push("última manutenção inválida (use AAAA-MM-DD)");
  if (inteiroInvalido(linha.intervalo_manutencao))
    motivos.push("intervalo de manutenção inválido (meses, número inteiro)");

  return motivos;
}

function motivosLinhaPeca(linha) {
  const motivos = [];
  const tipo = String(linha.tipo ?? "").trim();
  const num_serie = String(linha.num_serie ?? "").trim();
  const marca = String(linha.marca ?? "").trim();
  const modelo = String(linha.modelo ?? "").trim();

  if (!tipo) motivos.push("tipo é obrigatório");
  else if (!TIPOS_PECA.includes(tipo)) motivos.push(`tipo inválido: ${tipo}`);

  if (!num_serie) motivos.push("número de série é obrigatório");
  else if (num_serie.length > LIMITES.PECA_NUM_SERIE)
    motivos.push("número de série excede 150 caracteres");

  if (marca.length > LIMITES.MARCA) motivos.push("marca excede 100 caracteres");
  if (modelo.length > LIMITES.MODELO)
    motivos.push("modelo excede 100 caracteres");
  if (modelo && !marca) motivos.push("modelo informado sem marca");

  if (numeroInvalido(linha.preco))
    motivos.push("preço inválido (use ponto decimal, ex.: 499.90)");
  if (dataInvalida(linha.data_aquisicao))
    motivos.push("data de aquisição inválida (use AAAA-MM-DD)");

  return motivos;
}

// Valida todas as linhas; retorna [{ linha, motivo }] (linha = nº no arquivo,
// contando o cabeçalho como linha 1, ou seja, o 1º dado é a linha 2).
// Itens também acusam número de série duplicado DENTRO da planilha.
export function validarLinhasItem(linhas) {
  const erros = [];
  const vistos = new Map();
  linhas.forEach((linha, i) => {
    const numero = i + 2;
    const motivos = motivosLinhaItem(linha);
    const serial = String(linha.num_serie ?? "").trim().toLowerCase();
    if (serial) {
      if (vistos.has(serial))
        motivos.push(`número de série duplicado (linha ${vistos.get(serial)})`);
      else vistos.set(serial, numero);
    }
    if (motivos.length)
      erros.push({ linha: numero, motivo: motivos.join("; ") });
  });
  return erros;
}

export function validarLinhasPeca(linhas) {
  const erros = [];
  linhas.forEach((linha, i) => {
    const motivos = motivosLinhaPeca(linha);
    if (motivos.length)
      erros.push({ linha: i + 2, motivo: motivos.join("; ") });
  });
  return erros;
}

// Normaliza as linhas para o payload da API (preço com ponto decimal, campos trimados).
export function linhasParaPayloadItem(linhas) {
  return linhas.map((l) => ({
    tipo: String(l.tipo ?? "").trim(),
    etiqueta: String(l.etiqueta ?? "").trim(),
    num_serie: String(l.num_serie ?? "").trim(),
    marca: String(l.marca ?? "").trim(),
    modelo: String(l.modelo ?? "").trim(),
    subtipo: String(l.subtipo ?? "").trim(),
    preco: normalizarNumero(l.preco),
    data_aquisicao: String(l.data_aquisicao ?? "").trim(),
    ultima_manutencao: String(l.ultima_manutencao ?? "").trim(),
    intervalo_manutencao: String(l.intervalo_manutencao ?? "").trim(),
    em_uso: String(l.em_uso ?? "").trim(),
  }));
}

export function linhasParaPayloadPeca(linhas) {
  return linhas.map((l) => ({
    tipo: String(l.tipo ?? "").trim(),
    marca: String(l.marca ?? "").trim(),
    modelo: String(l.modelo ?? "").trim(),
    num_serie: String(l.num_serie ?? "").trim(),
    preco: normalizarNumero(l.preco),
    data_aquisicao: String(l.data_aquisicao ?? "").trim(),
  }));
}
