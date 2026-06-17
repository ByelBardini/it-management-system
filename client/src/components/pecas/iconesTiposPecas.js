import {
  Cpu,
  MemoryStick,
  HardDrive,
  Microchip,
  CircuitBoard,
  Plug,
  Network,
  Box,
  Boxes,
  Package,
} from "lucide-react";

// Ícone (lucide) por tipo de peça — usado nos cards da visão agrupada de peças.
const icones = {
  processador: Cpu,
  "placa-video": Microchip,
  "placa-mae": CircuitBoard,
  ram: MemoryStick,
  armazenamento: HardDrive,
  fonte: Plug,
  "placa-rede": Network,
  gabinete: Box,
  outros: Boxes,
};

export function iconeDoTipoPeca(tipo) {
  return icones[tipo] || Package;
}

export default icones;
