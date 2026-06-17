// Seed de DESENVOLVIMENTO do InfraHub.
//
// Gera CENTENAS de dados variados (itens de todos os tipos com características,
// peças, desktops montados, setores, workstations, plataformas e senhas) para
// testar o sistema cheio — usando UM ÚNICO usuário e UMA ÚNICA empresa (reusa o
// admin/empresa do seed base; nunca cria usuário/empresa extra).
//
// Idempotência: roda UMA vez. Se o banco já tem itens (>= LIMIAR_ITENS), pula —
// evita duplicar e colidir o índice único de item_num_serie. Para repovoar do
// zero use `npm run db:reset`.
//
// Auditoria: Item/Setor/Workstation/Plataforma/Senha têm afterCreate que grava em
// logs_sistema (log_usuario_id NOT NULL) → todo create passa { usuarioId }.
// Caracteristica e Peca não têm hook de create → bulkCreate direto.
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import dotenv from "dotenv";
import sequelize from "../config/database.js";
import { semear } from "./seed.js";
import {
  Usuario,
  Empresa,
  Setor,
  Workstation,
  Plataforma,
  Item,
  Caracteristica,
  Peca,
  Senha,
  Marca,
  Modelo,
  Subtipo,
} from "../models/index.js";

dotenv.config();

// ---------------------------------------------------------------------------
// Volume (ajuste à vontade) — total ~256 itens + peças + workstations + senhas
// ---------------------------------------------------------------------------
const LIMIAR_ITENS = 30;
const QTD_WORKSTATIONS = 40;
const QTD_PECAS_LIVRES = 28;
const QTD_SENHAS = 40;

const QTD = {
  desktop: 16,
  notebook: 22,
  monitor: 28,
  periferico: 60,
  celular: 14,
  impressora: 10,
  cadeira: 18,
  movel: 14,
  cabo: 22,
  switch: 8,
  ap: 9,
  "no-break": 7,
  "ar-condicionado": 6,
  gerador: 3,
  ferramenta: 12,
  outros: 7,
};

// ---------------------------------------------------------------------------
// Metadados por tipo: prefixo da etiqueta, faixa de preço e nome legível
// ---------------------------------------------------------------------------
const TIPO_META = {
  desktop: { etq: "DSK", precoMin: 2500, precoMax: 6000, nome: "Desktop" },
  notebook: { etq: "NTB", precoMin: 2800, precoMax: 7500, nome: "Notebook" },
  movel: { etq: "MOV", precoMin: 200, precoMax: 1500, nome: "Móvel" },
  cadeira: { etq: "CAD", precoMin: 300, precoMax: 1800, nome: "Cadeira" },
  monitor: { etq: "MON", precoMin: 550, precoMax: 2200, nome: "Monitor" },
  ferramenta: { etq: "FER", precoMin: 50, precoMax: 800, nome: "Ferramenta" },
  ap: { etq: "ACP", precoMin: 250, precoMax: 1500, nome: "Access Point" },
  "ar-condicionado": { etq: "ARC", precoMin: 1500, precoMax: 5000, nome: "Ar Condicionado" },
  switch: { etq: "SWT", precoMin: 400, precoMax: 6000, nome: "Switch" },
  periferico: { etq: "PER", precoMin: 40, precoMax: 600, nome: "Periférico" },
  "no-break": { etq: "NBR", precoMin: 400, precoMax: 3000, nome: "No-Break" },
  impressora: { etq: "IMP", precoMin: 600, precoMax: 3500, nome: "Impressora" },
  gerador: { etq: "GER", precoMin: 8000, precoMax: 40000, nome: "Gerador" },
  celular: { etq: "CEL", precoMin: 800, precoMax: 5000, nome: "Celular" },
  cabo: { etq: "CAB", precoMin: 10, precoMax: 150, nome: "Cabo" },
  outros: { etq: "OUT", precoMin: 50, precoMax: 2000, nome: "Outros" },
};

// Características obrigatórias por tipo (espelha os componentes de cadastro do
// front). Marca e modelo são SEPARADOS: "marca" sempre vem logo antes de "modelo".
const CAMPOS = {
  notebook: ["sistema-operacional", "marca", "modelo", "processador", "ram", "armazenamento", "tela", "fonte", "mac"],
  movel: ["tipo"],
  cadeira: [],
  monitor: ["marca", "modelo", "tela", "resolucao", "entradas", "fonte", "vesa"],
  ferramenta: ["tipo"],
  ap: ["marca", "modelo", "fonte", "poe", "mac", "ssid", "ip"],
  "ar-condicionado": ["marca", "modelo", "btu"],
  switch: ["marca", "modelo", "portas", "gerenciavel", "mac", "fibra", "ip"],
  periferico: ["tipo", "marca", "modelo"],
  "no-break": ["marca", "modelo", "potencia", "tensao-entrada", "tensao-saida", "tensao-bateria", "setores"],
  impressora: ["marca", "modelo", "tipo", "ip", "mac"],
  gerador: ["tipo", "marca", "modelo"],
  celular: ["marca", "modelo", "ram", "armazenamento", "mac", "numeros", "local"],
  cabo: ["tipo", "comprimento"],
  outros: ["tipo"],
};

// Marca → modelos, por tipo. Alimenta o cadastro central (tabelas marcas/modelos)
// que os itens passam a referenciar por id (item_marca_id / item_modelo_id).
const MARCAS = {
  periferico: {
    Logitech: ["K120", "MK270", "M170", "H390", "C920", "M90"],
    Microsoft: ["Wired 600", "Comfort 4000"],
    Multilaser: ["TC050", "MO254"],
    Dell: ["KB216", "MS116"],
    Razer: ["Cynosa V2", "DeathAdder Essential"],
    HyperX: ["Cloud Stinger"],
  },
  notebook: {
    Dell: ["Inspiron 15", "Latitude 5440", "Vostro 3420"],
    Lenovo: ["ThinkPad E14", "IdeaPad 3"],
    HP: ["ProBook 440", "Pavilion 15"],
    Acer: ["Aspire 5"],
    Asus: ["VivoBook 15"],
  },
  monitor: {
    LG: ["24MK430", "27GL650"],
    Samsung: ["LF24T350", "Odyssey G3"],
    Dell: ["P2422H", "E2420H"],
    AOC: ["24B2XH", "27G2"],
    Philips: ["241V8"],
  },
  celular: {
    Samsung: ["Galaxy A14", "Galaxy A54", "Galaxy M34"],
    Xiaomi: ["Redmi 12", "Redmi Note 13"],
    Motorola: ["Moto G54", "Moto E40"],
    Apple: ["iPhone 12", "iPhone 13"],
  },
  impressora: {
    EPSON: ["EcoTank L3250", "EcoTank L6270"],
    HP: ["LaserJet M134", "Ink Tank 416"],
    Brother: ["DCP-L2540", "HL-1202"],
    Canon: ["G3110"],
  },
  switch: {
    "HPE Aruba": ["1930-24G", "1960-48G"],
    "TP-Link": ["TL-SG1024", "TL-SG108"],
    Cisco: ["SG250-26"],
    Intelbras: ["SG 2404 MR"],
  },
  ap: {
    "TP-Link": ["EAP610", "EAP225"],
    Ubiquiti: ["U6-Lite", "UAP-AC-Pro"],
    Intelbras: ["AP 1250 AC"],
    Aruba: ["AP-505"],
  },
  "no-break": {
    APC: ["BX1400U-BR", "BX600U-BR"],
    SMS: ["Station II 1200", "Manager III 1500"],
    Ragtech: ["Easy Pro 1500"],
    Intelbras: ["XNB 720"],
  },
  "ar-condicionado": {
    Samsung: ["WindFree 12000"],
    LG: ["Dual Inverter 9000"],
    Springer: ["Midea 18000"],
    Elgin: ["Eco 12000"],
  },
  gerador: {
    Toyama: ["TG10000CXE"],
    Branco: ["B4T-8000"],
    Kohlbach: ["K-10"],
    Honda: ["EG6500"],
  },
};

// Valor da característica "tipo" por tipo de item (significa coisas diferentes)
const TIPO_CARAC = {
  periferico: ["Teclado com fio", "Teclado sem fio", "Mouse óptico", "Mouse sem fio", "Headset USB", "Webcam Full HD", "Mousepad"],
  impressora: ["Tinta colorida", "Laser monocromática", "Multifuncional tinta", "Térmica"],
  movel: ["Mesa", "Armário", "Gaveteiro", "Estante", "Rack"],
  ferramenta: ["Furadeira", "Parafusadeira", "Chave de fenda", "Alicate", "Multímetro"],
  cabo: ["HDMI", "Rede Cat6", "Força", "DisplayPort", "USB-C"],
  gerador: ["Diesel", "Gasolina"],
  outros: ["Acessório", "Equipamento diverso", "Suprimento"],
};

// Peças (desktop + estoque livre)
const PECAS_POOL = {
  processador: ["Intel Core i5-12400", "Intel Core i7-13700", "AMD Ryzen 5 5600", "AMD Ryzen 7 5700G"],
  "placa-mae": ["ASUS Prime H610M", "Gigabyte B550M", "MSI Pro B660M", "ASRock A520M"],
  ram: ["Kingston Fury 8GB DDR4", "Corsair Vengeance 16GB DDR4", "XPG 16GB DDR4", "Crucial 32GB DDR4"],
  armazenamento: ["SSD Kingston NV2 500GB", "SSD WD Green 480GB", "SSD NVMe 1TB", "HD Seagate 1TB"],
  fonte: ["Corsair CV550", "EVGA 600W", "Gigabyte P450B", "Cooler Master MWE 500W"],
  gabinete: ["Gabinete Mid Tower", "Gabinete Slim Corporativo", "Gabinete ATX Preto"],
  "placa-video": ["NVIDIA GTX 1650", "NVIDIA RTX 3060", "AMD RX 6600"],
  "placa-rede": ["TP-Link Gigabit PCIe", "Realtek 2.5G", "Intel I350"],
  outros: ["Cooler adicional", "Cabo SATA", "Pasta térmica", "Adaptador M.2"],
};
const PECA_PRECO = {
  processador: [800, 2500],
  "placa-mae": [450, 1200],
  ram: [150, 700],
  armazenamento: [200, 800],
  fonte: [250, 700],
  gabinete: [150, 600],
  "placa-video": [900, 3500],
  "placa-rede": [60, 400],
  outros: [20, 250],
};

const SETORES = ["TI", "Financeiro", "Recursos Humanos", "Comercial", "Diretoria", "Produção", "Logística", "Marketing", "Atendimento"];
const PLATAFORMAS = ["E-mail", "Sistema Interno", "Gmail", "Outlook", "Active Directory", "Banco do Brasil", "ERP TOTVS", "GitHub", "Portal Gov.br"];
const OBS_POOL = [
  "Sem observações relevantes.",
  "Equipamento em bom estado.",
  "Necessita revisão futura.",
  "Adquirido em lote.",
  "Pequenos riscos na carcaça.",
  "Em uso pelo setor responsável.",
];
const USUARIOS_SENHA = ["financeiro@empresa.com", "ti.suporte", "admin.sistema", "comercial01", "rh.acesso", "diretoria"];
const SENHAS_EXEMPLO = ["Acesso@2024", "Senha#Forte1", "TI@Suporte9", "Cofre!2023", "Master$123"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const escolha = (arr) => arr[Math.floor(Math.random() * arr.length)];
const inteiro = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chance = (p) => Math.random() < p;

function gerarMac() {
  const h = () => inteiro(0, 255).toString(16).padStart(2, "0").toUpperCase();
  return [h(), h(), h(), h(), h(), h()].join(":");
}

let seqSerie = 0;
let seqEtq = 0;
let seqPeca = 0;
const proxSerie = () => "SN" + String(++seqSerie).padStart(6, "0");
const proxEtq = (pref) => `${pref}-${String(++seqEtq).padStart(4, "0")}`;
const proxPecaSerie = () => "PCA" + String(++seqPeca).padStart(6, "0");

function dataPassada(maxDias) {
  const d = new Date();
  d.setDate(d.getDate() - inteiro(0, maxDias));
  return d;
}

function gerarMarcaModelo(tipo) {
  const m = MARCAS[tipo];
  if (!m) return null;
  const marca = escolha(Object.keys(m));
  return { marca, modelo: escolha(m[marca]) };
}

// Cadastro central de marcas/modelos (tabelas `marcas`/`modelos`/`subtipos`).
// Marca é escopada por (domínio, tipo, subtipo) — subtipo vazio quando o tipo não
// tem subtipo. Resolve o id criando uma única vez e reusando via cache.
const cacheMarca = new Map();
const cacheModelo = new Map();
const cacheSubtipo = new Map();

async function resolverSubtipo(tipo, subtipo) {
  if (!subtipo) return;
  const k = `${tipo}|${subtipo.toLowerCase()}`;
  if (cacheSubtipo.has(k)) return;
  await Subtipo.findOrCreate({
    where: { subtipo_tipo: tipo, subtipo_nome: subtipo },
    defaults: { subtipo_tipo: tipo, subtipo_nome: subtipo },
  });
  cacheSubtipo.set(k, true);
}

async function resolverMarcaModelo(dominio, tipo, subtipo, marca, modelo) {
  if (!marca) return { marcaId: null, modeloId: null };

  const sub = subtipo || "";
  if (sub) await resolverSubtipo(tipo, sub);

  const kMarca = `${dominio}|${tipo}|${sub.toLowerCase()}|${marca.toLowerCase()}`;
  let marcaId = cacheMarca.get(kMarca);
  if (!marcaId) {
    const [m] = await Marca.findOrCreate({
      where: {
        marca_nome: marca,
        marca_dominio: dominio,
        marca_tipo: tipo,
        marca_subtipo: sub,
      },
      defaults: {
        marca_nome: marca,
        marca_dominio: dominio,
        marca_tipo: tipo,
        marca_subtipo: sub,
      },
    });
    marcaId = m.marca_id;
    cacheMarca.set(kMarca, marcaId);
  }

  let modeloId = null;
  if (modelo) {
    const kModelo = `${marcaId}|${modelo.toLowerCase()}`;
    modeloId = cacheModelo.get(kModelo);
    if (!modeloId) {
      const [mo] = await Modelo.findOrCreate({
        where: { modelo_marca_id: marcaId, modelo_nome: modelo },
        defaults: { modelo_marca_id: marcaId, modelo_nome: modelo },
      });
      modeloId = mo.modelo_id;
      cacheModelo.set(kModelo, modeloId);
    }
  }

  return { marcaId, modeloId };
}

// Peça vem de um nome único de pool ("Intel Core i5-12400"): primeira palavra =
// marca, resto = modelo, alimentando o cadastro de domínio "peca".
function splitPeca(nome) {
  const partes = String(nome).trim().split(/\s+/);
  return { marca: partes[0], modelo: partes.slice(1).join(" ") || null };
}

function gerarValor(nome) {
  switch (nome) {
    case "sistema-operacional":
      return escolha(["Windows 11 Pro", "Windows 10 Pro", "Ubuntu 22.04 LTS"]);
    case "processador":
      return escolha(["Intel Core i5-12400", "Intel Core i7-13700", "AMD Ryzen 5 5600", "AMD Ryzen 7 5700G"]);
    case "ram":
      return escolha(["4 GB", "8 GB DDR4", "16 GB DDR4", "32 GB DDR4"]);
    case "armazenamento":
      return escolha(["128 GB", "SSD 256GB", "SSD 512GB", "SSD NVMe 1TB", "HDD 1TB"]);
    case "tela":
      return escolha(['14"', '15.6"', '21.5"', '24"', '27"']);
    case "fonte":
      return escolha(["Interna", "Externa 19V 3.42A", "Bivolt 110-220V"]);
    case "mac":
      return gerarMac();
    case "resolucao":
      return escolha(["1366x768", "1920x1080", "2560x1440"]);
    case "entradas":
      return escolha(["1x HDMI; 1x VGA", "2x HDMI; 1x DP", "1x HDMI; 1x DP; 1x USB-C"]);
    case "vesa":
      return escolha(["75x75", "100x100"]);
    case "btu":
      return escolha(["9000", "12000", "18000", "24000"]);
    case "portas":
      return escolha(["8", "16", "24", "48"]);
    case "gerenciavel":
      return escolha(["Sim", "Não"]);
    case "fibra":
      return escolha(["Sim", "Não"]);
    case "poe":
      return escolha(["Sim", "Não"]);
    case "ip":
      return `192.168.${inteiro(0, 4)}.${inteiro(2, 254)}`;
    case "ssid":
      return escolha(["Empresa-Corp", "Empresa-Guest", "Rede-Interna"]);
    case "potencia":
      return escolha(["600VA", "1200VA", "1400VA", "2200VA"]);
    case "tensao-entrada":
      return escolha(["115V", "127V", "220V", "Bivolt"]);
    case "tensao-saida":
      return escolha(["115V", "120V", "220V"]);
    case "tensao-bateria":
      return escolha(["12V", "24V"]);
    case "setores":
      return escolha(["TI", "TI, Financeiro", "Diretoria", "Servidores"]);
    case "numeros":
      return escolha(["Financeiro 1", "Comercial 1, Comercial 2", "Suporte"]);
    case "local":
      return escolha(["Deixado na empresa", "Com o colaborador"]);
    case "comprimento":
      return escolha(["1,5 m", "3 m", "5 m", "10 m", "20 m"]);
    default:
      return "N/A";
  }
}

function gerarCaracteristicas(tipo, tipoCar) {
  const campos = CAMPOS[tipo] || [];
  const arr = [];
  for (const nome of campos) {
    // marca e modelo agora são FK no item (cadastro central), não característica
    if (nome === "marca" || nome === "modelo") continue;
    const valor = nome === "tipo" ? tipoCar || "Geral" : gerarValor(nome);
    arr.push({ nome, valor });
  }
  if (chance(0.5)) arr.push({ nome: "observacoes", valor: escolha(OBS_POOL) });
  return arr;
}

function atribuirLocal(ctx) {
  const r = Math.random();
  if (r < 0.55 && ctx.workstations.length) {
    const w = escolha(ctx.workstations);
    return { setorId: w.setorId, workstationId: w.id };
  }
  if (r < 0.8 && ctx.setores.length) {
    return { setorId: escolha(ctx.setores), workstationId: null };
  }
  return { setorId: null, workstationId: null };
}

function cifrarSenha(claro, chave) {
  const iv = crypto.randomBytes(16);
  const cifra = crypto.createCipheriv("aes-256-cbc", chave, iv);
  let enc = cifra.update(claro, "utf-8", "hex");
  enc += cifra.final("hex");
  return { senha_criptografada: enc, senha_iv: iv.toString("hex") };
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------
async function criarSetores(ctx) {
  const ids = [];
  for (const nome of ["Geral", ...SETORES]) {
    const [s] = await Setor.findOrCreate({
      where: { setor_empresa_id: ctx.empresaId, setor_nome: nome },
      defaults: { setor_empresa_id: ctx.empresaId, setor_nome: nome },
      usuarioId: ctx.adminId,
    });
    ids.push(s.setor_id);
  }
  return ids;
}

async function criarWorkstations(qtd, ctx) {
  const lista = [];
  for (let i = 0; i < qtd; i++) {
    const setorId = escolha(ctx.setores);
    const ws = await Workstation.create(
      {
        workstation_empresa_id: ctx.empresaId,
        workstation_setor_id: setorId,
        workstation_nome: `PC-${String(i + 1).padStart(2, "0")}`,
        workstation_anydesk: chance(0.6) ? String(inteiro(100000000, 999999999)) : null,
        workstation_senha_anydesk: chance(0.6) ? "ad" + inteiro(1000, 9999) : null,
      },
      { usuarioId: ctx.adminId }
    );
    lista.push({ id: ws.workstation_id, setorId });
  }
  return lista;
}

async function criarPlataformas(ctx) {
  const lista = [];
  for (const nome of PLATAFORMAS) {
    const [p] = await Plataforma.findOrCreate({
      where: { plataforma_nome: nome },
      defaults: { plataforma_nome: nome },
      usuarioId: ctx.adminId,
    });
    lista.push({ id: p.plataforma_id, nome });
  }
  return lista;
}

async function criarItensDoTipo(tipo, qtd, ctx) {
  const meta = TIPO_META[tipo];
  for (let i = 0; i < qtd; i++) {
    const marcaModelo = gerarMarcaModelo(tipo);
    const tipoCar = TIPO_CARAC[tipo] ? escolha(TIPO_CARAC[tipo]) : null;
    const { setorId, workstationId } = atribuirLocal(ctx);

    const subtipo = tipoCar || "";
    if (subtipo) await resolverSubtipo(tipo, subtipo);
    const { marcaId, modeloId } = marcaModelo
      ? await resolverMarcaModelo(
          "item",
          tipo,
          subtipo,
          marcaModelo.marca,
          marcaModelo.modelo
        )
      : { marcaId: null, modeloId: null };

    const item = await Item.create(
      {
        item_empresa_id: ctx.empresaId,
        item_setor_id: setorId,
        item_workstation_id: workstationId,
        item_tipo: tipo,
        item_etiqueta: proxEtq(meta.etq),
        item_num_serie: proxSerie(),
        item_marca_id: marcaId,
        item_modelo_id: modeloId,
        item_preco: inteiro(meta.precoMin, meta.precoMax),
        item_em_uso: chance(0.7) ? 1 : 0,
        item_data_aquisicao: dataPassada(1500),
        item_ultima_manutencao: dataPassada(400),
        item_intervalo_manutencao: escolha([0, 3, 6, 12, 24]),
      },
      { usuarioId: ctx.adminId }
    );

    const chars = gerarCaracteristicas(tipo, tipoCar);
    if (chars.length) {
      await Caracteristica.bulkCreate(
        chars.map((c) => ({
          caracteristica_item_id: item.item_id,
          caracteristica_nome: c.nome,
          caracteristica_valor: c.valor,
        }))
      );
    }
  }
}

function umaPeca(tipo) {
  const faixa = PECA_PRECO[tipo] || [50, 500];
  return {
    peca_tipo: tipo,
    nome: escolha(PECAS_POOL[tipo]),
    peca_num_serie: proxPecaSerie(),
    peca_preco: inteiro(faixa[0], faixa[1]),
  };
}

function montarPecasDesktop() {
  const pecas = [
    umaPeca("processador"),
    umaPeca("placa-mae"),
    umaPeca("ram"),
    umaPeca("armazenamento"),
    umaPeca("fonte"),
    umaPeca("gabinete"),
  ];
  if (chance(0.5)) pecas.push(umaPeca("ram"));
  if (chance(0.4)) pecas.push(umaPeca("placa-video"));
  if (chance(0.3)) pecas.push(umaPeca("placa-rede"));
  return pecas;
}

async function criarDesktops(qtd, ctx) {
  const meta = TIPO_META.desktop;
  for (let i = 0; i < qtd; i++) {
    const pecas = montarPecasDesktop();
    const preco = pecas.reduce((acc, p) => acc + p.peca_preco, 0);
    const { setorId, workstationId } = atribuirLocal(ctx);

    const item = await Item.create(
      {
        item_empresa_id: ctx.empresaId,
        item_setor_id: setorId,
        item_workstation_id: workstationId,
        item_tipo: "desktop",
        item_etiqueta: proxEtq(meta.etq),
        item_num_serie: proxSerie(),
        item_preco: preco,
        item_em_uso: chance(0.8) ? 1 : 0,
        item_data_aquisicao: dataPassada(1500),
        item_ultima_manutencao: dataPassada(400),
        item_intervalo_manutencao: escolha([0, 6, 12]),
      },
      { usuarioId: ctx.adminId }
    );

    const linhasPeca = [];
    for (const p of pecas) {
      const { marca, modelo } = splitPeca(p.nome);
      const { marcaId, modeloId } = await resolverMarcaModelo(
        "peca",
        p.peca_tipo,
        "",
        marca,
        modelo
      );
      linhasPeca.push({
        peca_empresa_id: ctx.empresaId,
        peca_item_id: item.item_id,
        peca_ativa: 1,
        peca_em_uso: 1,
        peca_tipo: p.peca_tipo,
        peca_marca_id: marcaId,
        peca_modelo_id: modeloId,
        peca_num_serie: p.peca_num_serie,
        peca_preco: p.peca_preco,
        peca_data_aquisicao: dataPassada(1500),
      });
    }
    await Peca.bulkCreate(linhasPeca);
  }
}

async function criarPecasLivres(qtd, ctx) {
  const tipos = Object.keys(PECAS_POOL);
  const linhas = [];
  for (let i = 0; i < qtd; i++) {
    const t = escolha(tipos);
    const p = umaPeca(t);
    const { marca, modelo } = splitPeca(p.nome);
    const { marcaId, modeloId } = await resolverMarcaModelo(
      "peca",
      p.peca_tipo,
      "",
      marca,
      modelo
    );
    linhas.push({
      peca_empresa_id: ctx.empresaId,
      peca_item_id: null,
      peca_ativa: 1,
      peca_em_uso: 0,
      peca_tipo: p.peca_tipo,
      peca_marca_id: marcaId,
      peca_modelo_id: modeloId,
      peca_num_serie: p.peca_num_serie,
      peca_preco: p.peca_preco,
      peca_data_aquisicao: dataPassada(1500),
    });
  }
  await Peca.bulkCreate(linhas);
}

async function criarSenhas(qtd, ctx) {
  if (!ctx.podeCifrar) {
    console.warn(
      "⚠ SECRET_KEY_PASSWORD ausente ou diferente de 32 caracteres — seed de senhas ignorado."
    );
    return;
  }
  for (let i = 0; i < qtd; i++) {
    const plat = escolha(ctx.plataformas);
    const { senha_criptografada, senha_iv } = cifrarSenha(escolha(SENHAS_EXEMPLO), ctx.chave);
    await Senha.create(
      {
        senha_empresa_id: ctx.empresaId,
        senha_usuario_id: ctx.adminId,
        senha_plataforma_id: plat.id,
        senha_nome: `${plat.nome} — ${escolha(SETORES)}`,
        senha_usuario: escolha(USUARIOS_SENHA),
        senha_criptografada,
        senha_iv,
        senha_ultima_troca: dataPassada(400),
        senha_tempo_troca: escolha([0, 30, 60, 90]),
      },
      { usuarioId: ctx.adminId }
    );
  }
}

// ---------------------------------------------------------------------------
// Orquestração
// ---------------------------------------------------------------------------
export async function semearDev() {
  // 1 usuário + 1 empresa: reusa os do seed base; cria-os via semear() só se faltarem.
  let admin = await Usuario.findOne({ where: { usuario_tipo: "adm" }, order: [["usuario_id", "ASC"]] });
  let empresa = await Empresa.findOne({ order: [["empresa_id", "ASC"]] });
  if (!admin || !empresa) {
    await semear();
    admin = await Usuario.findOne({ where: { usuario_tipo: "adm" }, order: [["usuario_id", "ASC"]] });
    empresa = await Empresa.findOne({ order: [["empresa_id", "ASC"]] });
  }

  const totalItens = await Item.count();
  if (totalItens >= LIMIAR_ITENS) {
    console.log(
      `Banco já populado (${totalItens} itens) — dev seed ignorado. Use "npm run db:reset" para repovoar do zero.`
    );
    return false;
  }

  const chave = process.env.SECRET_KEY_PASSWORD;
  const ctx = {
    adminId: admin.usuario_id,
    empresaId: empresa.empresa_id,
    chave,
    podeCifrar: typeof chave === "string" && chave.length === 32,
  };

  ctx.setores = await criarSetores(ctx);
  ctx.workstations = await criarWorkstations(QTD_WORKSTATIONS, ctx);
  ctx.plataformas = await criarPlataformas(ctx);

  for (const [tipo, qtd] of Object.entries(QTD)) {
    if (tipo === "desktop") continue;
    await criarItensDoTipo(tipo, qtd, ctx);
  }
  await criarDesktops(QTD.desktop, ctx);
  await criarPecasLivres(QTD_PECAS_LIVRES, ctx);
  await criarSenhas(QTD_SENHAS, ctx);

  const totalGerado = Object.values(QTD).reduce((a, n) => a + n, 0);
  console.log(
    `Dev seed concluído: ~${totalGerado} itens (todos os tipos), peças, ${QTD_WORKSTATIONS} workstations, ${QTD_SENHAS} senhas e logs gerados na empresa "${empresa.empresa_nome}".`
  );
  return true;
}

// Execução direta (`node db/seed-dev.js`): semeia e fecha a conexão própria.
const ehMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (ehMain) {
  semearDev()
    .catch((erro) => {
      console.error("Falha no dev seed:", erro.message);
      process.exitCode = 1;
    })
    .finally(() => sequelize.close());
}
