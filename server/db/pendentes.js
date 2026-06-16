// Cálculo puro de migrations pendentes — sem I/O, sem banco (testável).
// Dado os arquivos .sql em disco e os nomes já registrados na tabela de
// controle, devolve os que ainda não foram aplicados, em ordem lexicográfica
// (a mesma ordem em que devem ser executados: 0001_, 0002_, ...).
//
// Aplicadas que não correspondem a nenhum arquivo são simplesmente ignoradas
// (migration removida do disco não reaparece como pendente nem quebra o cálculo).
export function pendentes(arquivos, aplicadas) {
  const jaAplicadas = new Set(aplicadas);
  return arquivos
    .filter((nome) => !jaAplicadas.has(nome))
    .sort((a, b) => a.localeCompare(b));
}
