// Helpers puros de segurança. Sem efeito colateral nem dependência de Express —
// testáveis isoladamente em test/unit/config/seguranca.spec.js.

const OITO_HORAS_MS = 8 * 60 * 60 * 1000;
const METODOS_LEITURA = new Set(["GET", "HEAD", "OPTIONS"]);

// Valida que os segredos obrigatórios existem e têm o formato esperado.
// Lança Error puro (não ApiError): roda no boot, antes do Express subir.
export function validarAmbiente(env = {}) {
  const faltando = [];

  if (!env.SECRET_KEY_LOGIN) faltando.push("SECRET_KEY_LOGIN");

  const chaveCripto = env.SECRET_KEY_PASSWORD;
  if (!chaveCripto) {
    faltando.push("SECRET_KEY_PASSWORD");
  } else if (chaveCripto.length !== 32) {
    throw new Error(
      `SECRET_KEY_PASSWORD deve ter exatamente 32 caracteres (AES-256-CBC); tem ${chaveCripto.length}.`
    );
  }

  if (faltando.length) {
    throw new Error(
      `Variáveis de ambiente obrigatórias ausentes: ${faltando.join(", ")}.`
    );
  }

  return true;
}

// Callback de origem do CORS. Sem origin (same-origin, curl, health) é liberado;
// com origin, precisa estar na allowlist.
export function origemPermitida(origin, lista = []) {
  if (!origin) return true;
  return lista.includes(origin);
}

// Opções do cookie de sessão. secure só em produção (HTTPS); SameSite=Strict
// barra o cookie em qualquer requisição cross-site (mitiga CSRF).
export function opcoesCookie(isProd) {
  return {
    httpOnly: true,
    secure: !!isProd,
    sameSite: "strict",
    path: "/",
    maxAge: OITO_HORAS_MS,
  };
}

// Lê o token da sessão: cookie httpOnly primeiro, header Authorization como
// fallback (compatibilidade com clientes antigos / testes). null se ausente.
export function extrairToken(req) {
  const doCookie = req?.cookies?.token;
  if (doCookie) return doCookie;

  const header = req?.headers?.authorization;
  if (header) {
    const [scheme, token] = header.split(" ");
    if (scheme === "Bearer" && token) return token;
  }
  return null;
}

// Defense-in-depth de CSRF para mutações: leitura passa direto; mutação exige
// Origin/Referer da allowlist. Sem nenhum dos dois (provável cliente não-browser)
// libera — o cookie SameSite=Strict já é a barreira primária contra CSRF.
export function origemConfiavel(req, lista = []) {
  const metodo = (req?.method || "GET").toUpperCase();
  if (METODOS_LEITURA.has(metodo)) return true;

  const origin = req?.headers?.origin;
  if (origin) return lista.includes(origin);

  const referer = req?.headers?.referer;
  if (referer) return lista.some((o) => referer.startsWith(o));

  return true;
}
