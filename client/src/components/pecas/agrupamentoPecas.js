import tiposPecas from "./tiposPecas.js";
import { agruparGenerico } from "../inventario/agrupamento.js";

const SEM_MARCA = "Sem marca";
const SEM_MODELO = "Sem modelo";

// Marca/modelo da peça vêm do cadastro central por FK (peca.marca/peca.modelo,
// objetos que podem ser null), com o mesmo fallback honesto dos itens.
export function marcaModeloDaPeca(peca) {
  const marca = peca?.marca?.marca_nome?.trim();
  const modelo = peca?.modelo?.modelo_nome?.trim();
  return { marca: marca || SEM_MARCA, modelo: modelo || SEM_MODELO };
}

// Mesma árvore do inventário (Tipo → Marca → Modelo → peças), reaproveitando o
// agrupador genérico — só mudam a fonte do tipo e os rótulos de tipo de peça.
export function agruparPecas(pecas) {
  return agruparGenerico(pecas, {
    tipoDe: (peca) => peca.peca_tipo,
    tipoLabelDe: (tipo) => tiposPecas[tipo] ?? tipo,
    marcaModeloDe: marcaModeloDaPeca,
  });
}
