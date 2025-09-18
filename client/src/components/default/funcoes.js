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

export function getDiffDias(atualizado, intervalo) {
  const ultima = new Date(atualizado);
  const prazo = intervalo * 30 || 0;
  const proxima = new Date(ultima.getTime() + prazo * 24 * 60 * 60 * 1000);
  const hoje = new Date();
  const diffDias = Math.ceil((proxima - hoje) / (1000 * 60 * 60 * 24));
  return diffDias;
}

export function dividirEmPartes(array, tamanho) {
  const resultado = [];
  for (let i = 0; i < array.length; i += tamanho) {
    resultado.push(array.slice(i, i + tamanho));
  }
  return resultado;
}

export function tratarErro(setNotificacao, err, navigate) {
  console.error(err);
  if (err.status == 401 || err.status == 403) {
    setNotificacao({
      show: true,
      tipo: "erro",
      titulo: `Erro de validação`,
      mensagem:
        "Sessão inválida ou expirada, redirecionando para a tela de login",
    });
    setTimeout(() => {
      setNotificacao({
        show: false,
        tipo: "sucesso",
        titulo: "",
        mensagem: "",
      });
      navigate("/", { replace: true });
    }, 700);
  }
  setNotificacao({
    show: true,
    tipo: "erro",
    titulo: `Erro ${err.status}`,
    mensagem: err.message,
  });
}
