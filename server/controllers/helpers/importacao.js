import { Marca, Modelo } from "../../models/index.js";

// Tipos válidos de ITEM (espelha o ENUM de models/itens.js). "desktop" existe no
// ENUM mas NÃO é importável em massa (depende de peças vinculadas e preço calculado).
export const TIPOS_ITEM = [
  "desktop",
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

// Tipos de ITEM que têm subtipo (espelha client/.../tiposComSubtipo.js). O subtipo
// é gravado na característica "tipo" e escopa marca/modelo no cadastro central.
// Mantenha em sincronia com o front.
export const TIPOS_ITEM_COM_SUBTIPO = [
  "periferico",
  "impressora",
  "ferramenta",
  "cabo",
  "gerador",
  "movel",
  "outros",
];

// Tipos válidos de PEÇA (espelha o ENUM de models/pecas.js).
export const TIPOS_PECA = [
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

// Limites de coluna (espelham os VARCHAR do schema). Validar aqui evita que um
// overflow estoure como erro de banco DENTRO da transação (500 + rollback total).
export const LIMITES = {
  ITEM_NUM_SERIE: 255,
  PECA_NUM_SERIE: 150,
  ETIQUETA: 10,
  MARCA: 100,
  MODELO: 100,
  SUBTIPO: 100,
};

const RE_NUMERO = /^\d+(\.\d+)?$/; // não-negativo, ponto decimal (formato já normalizado)
const RE_INTEIRO = /^\d+$/;
const RE_DATA = /^\d{4}-\d{2}-\d{2}$/; // ISO

export function texto(valor) {
  return (valor ?? "").toString().trim();
}

// "sim"/"true"/"1" => true; "nao"/"false"/"0" => false; vazio => true (default do model).
export function parseEmUso(valor) {
  const v = texto(valor).toLowerCase();
  if (!v) return true;
  return ["sim", "true", "1", "s"].includes(v);
}

// Número não-negativo e finito (rejeita "", "abc", "Infinity", "1e3", "0x10", "-5").
export function numeroValido(v) {
  const s = texto(v);
  return RE_NUMERO.test(s) && Number.isFinite(Number(s));
}

export function inteiroValido(v) {
  return RE_INTEIRO.test(texto(v));
}

// Data no formato ISO AAAA-MM-DD e que existe de verdade (rejeita 2024-13-40 e dd/mm/aaaa).
export function dataValida(v) {
  const s = texto(v);
  if (!RE_DATA.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// Valida uma linha de item de importação. Retorna lista de motivos (vazia = ok).
export function validarLinhaItem(linha) {
  const motivos = [];
  const tipo = texto(linha.tipo);
  const etiqueta = texto(linha.etiqueta);
  const num_serie = texto(linha.num_serie);
  const marca = texto(linha.marca);
  const modelo = texto(linha.modelo);
  const subtipo = texto(linha.subtipo);

  if (!tipo) motivos.push("tipo é obrigatório");
  else if (!TIPOS_ITEM.includes(tipo)) motivos.push(`tipo inválido: ${tipo}`);
  else if (tipo === "desktop")
    motivos.push("desktop não pode ser importado em massa");

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

  if (!numeroValido(linha.preco))
    motivos.push("preço inválido (use ponto decimal, ex.: 499.90)");
  if (!dataValida(linha.data_aquisicao))
    motivos.push("data de aquisição inválida (use AAAA-MM-DD)");
  if (!dataValida(linha.ultima_manutencao))
    motivos.push("última manutenção inválida (use AAAA-MM-DD)");
  if (!inteiroValido(linha.intervalo_manutencao))
    motivos.push("intervalo de manutenção inválido (meses, número inteiro)");

  return motivos;
}

// Valida uma linha de peça de importação. Retorna lista de motivos (vazia = ok).
export function validarLinhaPeca(linha) {
  const motivos = [];
  const tipo = texto(linha.tipo);
  const num_serie = texto(linha.num_serie);
  const marca = texto(linha.marca);
  const modelo = texto(linha.modelo);

  if (!tipo) motivos.push("tipo é obrigatório");
  else if (!TIPOS_PECA.includes(tipo)) motivos.push(`tipo inválido: ${tipo}`);

  if (!num_serie) motivos.push("número de série é obrigatório");
  else if (num_serie.length > LIMITES.PECA_NUM_SERIE)
    motivos.push("número de série excede 150 caracteres");

  if (marca.length > LIMITES.MARCA) motivos.push("marca excede 100 caracteres");
  if (modelo.length > LIMITES.MODELO)
    motivos.push("modelo excede 100 caracteres");
  if (modelo && !marca) motivos.push("modelo informado sem marca");

  if (!numeroValido(linha.preco))
    motivos.push("preço inválido (use ponto decimal, ex.: 499.90)");
  if (!dataValida(linha.data_aquisicao))
    motivos.push("data de aquisição inválida (use AAAA-MM-DD)");

  return motivos;
}

// Valida o lote de itens (por linha + número de série duplicado DENTRO da planilha).
// Retorna [{ linha, motivo }] (linha = índice 1-based do array recebido).
export function errosLoteItens(itens) {
  const erros = [];
  const vistos = new Map(); // serial(lower) -> primeira linha
  itens.forEach((linha, i) => {
    const numero = i + 1;
    const motivos = validarLinhaItem(linha);
    const serial = texto(linha.num_serie).toLowerCase();
    if (serial) {
      if (vistos.has(serial)) {
        motivos.push(`número de série duplicado na planilha (linha ${vistos.get(serial)})`);
      } else {
        vistos.set(serial, numero);
      }
    }
    if (motivos.length) erros.push({ linha: numero, motivo: motivos.join("; ") });
  });
  return erros;
}

// Valida o lote de peças (apenas por linha; peças não têm unicidade de série).
export function errosLotePecas(pecas) {
  const erros = [];
  pecas.forEach((linha, i) => {
    const motivos = validarLinhaPeca(linha);
    if (motivos.length) erros.push({ linha: i + 1, motivo: motivos.join("; ") });
  });
  return erros;
}

// --- Coleta de desktop (POST /item/coletar-desktop) ---------------------------
// Diferente da importação CSV de peça (validarLinhaPeca), aqui num_serie, preço e
// data são OPCIONAIS: uma coleta de hardware raramente conhece o serial da RAM ou
// o preço, então o controller aplica defaults ("N/A" / 0). Só validamos o que veio.
export function validarPecaColetada(peca) {
  const motivos = [];
  // Guarda contra entrada malformada: uma peça que não é objeto (null, primitivo,
  // array) derrubaria o acesso a peca.tipo com TypeError fora da transação (500).
  if (!peca || typeof peca !== "object" || Array.isArray(peca))
    return ["peça inválida (esperado um objeto)"];
  const tipo = texto(peca.tipo);
  const num_serie = texto(peca.num_serie);
  const marca = texto(peca.marca);
  const modelo = texto(peca.modelo);

  if (!tipo) motivos.push("tipo da peça é obrigatório");
  else if (!TIPOS_PECA.includes(tipo)) motivos.push(`tipo inválido: ${tipo}`);

  if (num_serie.length > LIMITES.PECA_NUM_SERIE)
    motivos.push("número de série excede 150 caracteres");
  if (marca.length > LIMITES.MARCA) motivos.push("marca excede 100 caracteres");
  if (modelo.length > LIMITES.MODELO)
    motivos.push("modelo excede 100 caracteres");
  if (modelo && !marca) motivos.push("modelo informado sem marca");

  if (texto(peca.preco) && !numeroValido(peca.preco))
    motivos.push("preço inválido (use ponto decimal, ex.: 499.90)");
  if (texto(peca.data_aquisicao) && !dataValida(peca.data_aquisicao))
    motivos.push("data de aquisição inválida (use AAAA-MM-DD)");

  return motivos;
}

// Valida o payload da coleta de desktop. Retorna [{ indice, motivo }]: indice = null
// para erros do desktop em si; indice = posição (0-based) para erros de uma peça.
export function errosColetaDesktop(payload) {
  const erros = [];
  const push = (motivo, indice = null) => erros.push({ indice, motivo });

  if (!payload.item_empresa_id) push("empresa é obrigatória");

  const etiqueta = texto(payload.etiqueta);
  if (!etiqueta) push("etiqueta é obrigatória");
  else if (etiqueta.length > LIMITES.ETIQUETA)
    push("etiqueta deve ter no máximo 10 caracteres");

  const marca = texto(payload.marca);
  const modelo = texto(payload.modelo);
  if (marca.length > LIMITES.MARCA)
    push("marca do desktop excede 100 caracteres");
  if (modelo.length > LIMITES.MODELO)
    push("modelo do desktop excede 100 caracteres");
  if (modelo && !marca) push("modelo do desktop informado sem marca");

  // Datas e intervalo são opcionais (têm default no controller) — só validam se vierem.
  if (texto(payload.data_aquisicao) && !dataValida(payload.data_aquisicao))
    push("data de aquisição inválida (use AAAA-MM-DD)");
  if (texto(payload.ultima_manutencao) && !dataValida(payload.ultima_manutencao))
    push("última manutenção inválida (use AAAA-MM-DD)");
  if (
    texto(payload.intervalo_manutencao) &&
    !inteiroValido(payload.intervalo_manutencao)
  )
    push("intervalo de manutenção inválido (meses, número inteiro)");

  // setor/workstation são opcionais; valida só o TIPO aqui (id inteiro). A
  // EXISTÊNCIA (e o escopo por empresa) é verificada no controller, com acesso ao banco.
  if (texto(payload.setor_id) && !inteiroValido(payload.setor_id))
    push("setor inválido (id inteiro)");
  if (texto(payload.workstation_id) && !inteiroValido(payload.workstation_id))
    push("workstation inválido (id inteiro)");

  const pecas = payload.pecas;
  if (!Array.isArray(pecas) || pecas.length === 0) {
    push("informe ao menos uma peça do desktop");
  } else {
    pecas.forEach((peca, i) => {
      for (const motivo of validarPecaColetada(peca)) push(motivo, i);
    });
  }

  return erros;
}

// Cache por importação para não re-resolver a mesma marca/modelo a cada linha.
export function novoCacheResolucao() {
  return { marcas: new Map(), modelos: new Map() };
}

// Resolve marca/modelo do cadastro central pelo NOME, criando se não existir.
// A comparação por nome é case-insensitive pela collation padrão do MySQL.
// Sem nome de marca => { marca_id: null, modelo_id: null }. `cache` (opcional) evita
// queries repetidas para a mesma marca/modelo dentro do mesmo lote.
export async function resolverMarcaModelo(
  { dominio, tipo, subtipo, marcaNome, modeloNome },
  t,
  usuarioId,
  cache
) {
  const nomeMarca = texto(marcaNome);
  if (!nomeMarca) return { marca_id: null, modelo_id: null };
  const sub = subtipo || "";

  // JSON.stringify evita colisão de chave por '|' em campos de texto livre (subtipo/nome).
  const chaveMarca = JSON.stringify([
    dominio,
    tipo,
    sub,
    nomeMarca.toLowerCase(),
  ]);
  let marca_id;
  if (cache?.marcas?.has(chaveMarca)) {
    marca_id = cache.marcas.get(chaveMarca);
  } else {
    let marca = await Marca.findOne({
      where: {
        marca_dominio: dominio,
        marca_tipo: tipo,
        marca_subtipo: sub,
        marca_nome: nomeMarca,
      },
      transaction: t,
    });
    if (!marca) {
      marca = await Marca.create(
        {
          marca_nome: nomeMarca,
          marca_dominio: dominio,
          marca_tipo: tipo,
          marca_subtipo: sub,
        },
        { transaction: t, usuarioId }
      );
    }
    marca_id = marca.marca_id;
    cache?.marcas?.set(chaveMarca, marca_id);
  }

  const nomeModelo = texto(modeloNome);
  if (!nomeModelo) return { marca_id, modelo_id: null };

  const chaveModelo = JSON.stringify([marca_id, nomeModelo.toLowerCase()]);
  let modelo_id;
  if (cache?.modelos?.has(chaveModelo)) {
    modelo_id = cache.modelos.get(chaveModelo);
  } else {
    let modelo = await Modelo.findOne({
      where: { modelo_marca_id: marca_id, modelo_nome: nomeModelo },
      transaction: t,
    });
    if (!modelo) {
      modelo = await Modelo.create(
        { modelo_marca_id: marca_id, modelo_nome: nomeModelo },
        { transaction: t, usuarioId }
      );
    }
    modelo_id = modelo.modelo_id;
    cache?.modelos?.set(chaveModelo, modelo_id);
  }

  return { marca_id, modelo_id };
}
