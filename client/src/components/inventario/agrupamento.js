import tipos from "./tiposItens.js";

const SEM_MARCA = "Sem marca";
const SEM_MODELO = "Sem modelo";

// Chave de agrupamento: sem acento, sem caixa, sem espaço duplo.
// Junta variações como "Logitech" / "logitech" / "LOGITECH" no mesmo grupo.
function chave(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Ordena rótulos alfabeticamente (pt), mas mantém o bucket "Sem ..." no fim.
function ordenarRotulos(a, b, semValor) {
  if (a === semValor && b !== semValor) return 1;
  if (b === semValor && a !== semValor) return -1;
  return a.localeCompare(b, "pt", { sensitivity: "base" });
}

// Agrupador genérico: transforma uma lista plana em árvore Tipo → Marca → Modelo
// → folha (registros). Parametrizado por adaptadores para servir tanto itens
// (FK item.marca/item.modelo) quanto peças (FK peca.marca/peca.modelo). Agrupa
// por chave normalizada (junta variações de caixa) mas exibe o rótulo original.
// A folha guarda cada registro individual, então série vazia/repetida nunca
// esconde um registro.
export function agruparGenerico(
  registros,
  { tipoDe, tipoLabelDe, marcaModeloDe }
) {
  if (!Array.isArray(registros) || registros.length === 0) return [];

  const porTipo = new Map();

  for (const reg of registros) {
    const tipo = tipoDe(reg);
    const { marca, modelo } = marcaModeloDe(reg);

    if (!porTipo.has(tipo)) {
      porTipo.set(tipo, {
        tipo,
        tipoLabel: tipoLabelDe(tipo),
        total: 0,
        marcas: new Map(),
      });
    }
    const noTipo = porTipo.get(tipo);
    noTipo.total += 1;

    const kMarca = chave(marca);
    if (!noTipo.marcas.has(kMarca)) {
      noTipo.marcas.set(kMarca, { marca, total: 0, modelos: new Map() });
    }
    const noMarca = noTipo.marcas.get(kMarca);
    noMarca.total += 1;

    const kModelo = chave(modelo);
    if (!noMarca.modelos.has(kModelo)) {
      noMarca.modelos.set(kModelo, { modelo, total: 0, itens: [] });
    }
    const noModelo = noMarca.modelos.get(kModelo);
    noModelo.total += 1;
    noModelo.itens.push(reg);
  }

  return [...porTipo.values()]
    .map((noTipo) => ({
      tipo: noTipo.tipo,
      tipoLabel: noTipo.tipoLabel,
      total: noTipo.total,
      marcas: [...noTipo.marcas.values()]
        .map((noMarca) => ({
          marca: noMarca.marca,
          total: noMarca.total,
          modelos: [...noMarca.modelos.values()].sort((a, b) =>
            ordenarRotulos(a.modelo, b.modelo, SEM_MODELO)
          ),
        }))
        .sort((a, b) => ordenarRotulos(a.marca, b.marca, SEM_MARCA)),
    }))
    .sort((a, b) =>
      a.tipoLabel.localeCompare(b.tipoLabel, "pt", { sensitivity: "base" })
    );
}

// Marca/modelo do item vêm do cadastro central por FK (item.marca/item.modelo,
// objetos que podem ser null). Sem heurística: lê direto, com fallback honesto.
export function marcaModeloDoItem(item) {
  const marca = item?.marca?.marca_nome?.trim();
  const modelo = item?.modelo?.modelo_nome?.trim();
  return { marca: marca || SEM_MARCA, modelo: modelo || SEM_MODELO };
}

// Transforma a lista plana de itens na árvore Tipo → Marca → Modelo → itens.
export function agruparInventario(itens) {
  return agruparGenerico(itens, {
    tipoDe: (item) => item.item_tipo,
    tipoLabelDe: (tipo) => tipos[tipo] ?? tipo,
    marcaModeloDe: marcaModeloDoItem,
  });
}
