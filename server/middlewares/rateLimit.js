import rateLimit from "express-rate-limit";

// Limita tentativas de login por IP para conter brute-force. Atrás do proxy do
// Coolify, depende de `app.set("trust proxy", 1)` para ler o IP real.
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  limit: 10, // até 10 tentativas por janela, por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    code: "ERR_TOO_MANY_REQUESTS",
    message: "Muitas tentativas de login. Tente novamente em alguns minutos.",
  },
});
