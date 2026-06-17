// Tipos de ITEM que têm subtipo (separação fina, ex.: periférico → Teclado/Mouse).
// São os que já tinham o campo "tipo" como característica. Os demais tipos de item
// e todas as peças escopam marca/modelo apenas pelo tipo (subtipo vazio).
export const TIPOS_COM_SUBTIPO = [
  "periferico",
  "impressora",
  "ferramenta",
  "cabo",
  "gerador",
  "movel",
  "outros",
];

export function temSubtipo(tipo) {
  return TIPOS_COM_SUBTIPO.includes(tipo);
}
