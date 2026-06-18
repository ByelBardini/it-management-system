// Rótulos amigáveis para as chaves de especificação técnica das peças (coletadas
// pelo coletor-desktop e guardadas em peca_especificacoes, um objeto JSON). A ordem
// das chaves aqui define a ordem de exibição; chaves não mapeadas aparecem depois,
// usando a própria chave como rótulo.
export const ROTULOS = {
  capacidade: "Capacidade",
  velocidade: "Velocidade",
  tipo: "Tipo",
  midia: "Mídia",
  conexao: "Conexão",
  nucleos: "Núcleos",
  threads: "Threads",
  clock: "Clock",
  memoria: "Memória",
  descricao: "Descrição",
};

// Campos de especificação capturáveis no cadastro MANUAL de peça, por tipo. Espelham
// o que o coletor-desktop extrai do hardware, para que peça cadastrada à mão e peça
// coletada tenham a mesma forma. `opcoes` vira <select>; senão, é campo de texto livre.
// O rótulo exibido vem de ROTULOS[chave]. Tipos sem entrada aqui não têm specs.
export const CAMPOS_ESPECIFICACAO = {
  ram: [
    { chave: "capacidade", placeholder: "Ex.: 8 GB" },
    { chave: "velocidade", placeholder: "Ex.: 3200 MHz" },
    { chave: "tipo", opcoes: ["DDR3", "DDR4", "DDR5"] },
  ],
  armazenamento: [
    { chave: "capacidade", placeholder: "Ex.: 480 GB" },
    { chave: "midia", opcoes: ["HDD", "SSD", "NVMe"] },
    { chave: "conexao", opcoes: ["SATA", "NVMe", "USB", "SAS"] },
  ],
  processador: [
    { chave: "nucleos", placeholder: "Ex.: 6" },
    { chave: "threads", placeholder: "Ex.: 12" },
    { chave: "clock", placeholder: "Ex.: 3.2 GHz" },
  ],
  "placa-video": [{ chave: "memoria", placeholder: "Ex.: 8 GB" }],
  "placa-rede": [{ chave: "velocidade", placeholder: "Ex.: 1 Gbps" }],
};

// Monta o objeto de especificações a partir dos valores digitados, mantendo só os
// campos válidos do tipo e descartando vazios. Retorna {} quando não há nada — o
// chamador decide enviar null nesse caso.
export function construirEspecificacoes(tipo, valores = {}) {
  const campos = CAMPOS_ESPECIFICACAO[tipo] || [];
  const obj = {};
  for (const campo of campos) {
    const valor = (valores[campo.chave] ?? "").toString().trim();
    if (valor) obj[campo.chave] = valor;
  }
  return obj;
}

// Transforma o objeto de especificações numa lista ordenada [{ rotulo, valor }],
// pronta para render. Tolera null/undefined/objeto vazio/entrada não-objeto (→ []),
// descarta valores vazios e cai no fallback (a própria chave) para chaves não mapeadas.
export function formatarEspecificacoesPeca(especificacoes) {
  if (
    !especificacoes ||
    typeof especificacoes !== "object" ||
    Array.isArray(especificacoes)
  ) {
    return [];
  }

  const lista = [];
  const usadas = new Set();

  // Primeiro as chaves conhecidas, na ordem dos rótulos.
  for (const chave of Object.keys(ROTULOS)) {
    if (!(chave in especificacoes)) continue;
    usadas.add(chave);
    const valor = (especificacoes[chave] ?? "").toString().trim();
    if (valor) lista.push({ rotulo: ROTULOS[chave], valor });
  }

  // Depois as chaves não mapeadas, na ordem de inserção do objeto.
  for (const chave of Object.keys(especificacoes)) {
    if (usadas.has(chave)) continue;
    const valor = (especificacoes[chave] ?? "").toString().trim();
    if (valor) lista.push({ rotulo: chave, valor });
  }

  return lista;
}
