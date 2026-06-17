import {
  HardDrive,
  Laptop,
  Sofa,
  Armchair,
  Monitor,
  Wrench,
  Wifi,
  AirVent,
  Network,
  Keyboard,
  BatteryCharging,
  Printer,
  Fuel,
  Smartphone,
  Cable,
  Boxes,
  Package,
} from "lucide-react";

// Ícone (lucide) por tipo de item — usado nos cards e no cabeçalho do tipo.
const icones = {
  desktop: HardDrive,
  notebook: Laptop,
  movel: Sofa,
  cadeira: Armchair,
  monitor: Monitor,
  ferramenta: Wrench,
  ap: Wifi,
  "ar-condicionado": AirVent,
  switch: Network,
  periferico: Keyboard,
  "no-break": BatteryCharging,
  impressora: Printer,
  gerador: Fuel,
  celular: Smartphone,
  cabo: Cable,
  outros: Boxes,
};

export function iconeDoTipo(tipo) {
  return icones[tipo] || Package;
}

export default icones;
