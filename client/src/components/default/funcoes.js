export function formatarIntervalo(intervalo, diffDias) {
  if (intervalo === 0) return "Não é realizado";

  if (diffDias < 0) {
    const diasAtrasados = Math.abs(diffDias);
    return diasAtrasados === 1
      ? "Atrasado 1 dia"
      : `Atrasado ${diasAtrasados} dias`;
  }

  if (diffDias === 0) return "0 dias";

  if (diffDias === 1) return "1 dia";

  if (diffDias >= 30) {
    const meses = Math.trunc(diffDias / 30);
    return meses === 1 ? "1 mês" : `${meses} meses`;
  }

  return `${diffDias} dias`;
}

export function formatarIntervaloTabela(intervalo, diffDias) {
  if (diffDias > 5 || intervalo == 0) {
    return "text-green-400 font-semibold";
  } else if (diffDias < 0) {
    return "text-red-400 font-semibold";
  } else {
    return "text-yellow-400 font-semibold";
  }
}
