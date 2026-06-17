import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import empresaRoutes from "./routes/empresaRoutes.js";
import setorRoutes from "./routes/setorRoutes.js";
import workstationRoutes from "./routes/workstationRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";
import plataformaRoutes from "./routes/plataformaRoutes.js";
import senhaRoutes from "./routes/senhaRoutes.js";
import manutencoesRoutes from "./routes/manutencoesRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import perfilRoutes from "./routes/perfilRoutes.js";
import pecasRoutes from "./routes/pecasRoutes.js";
import marcaRoutes from "./routes/marcaRoutes.js";
import modeloRoutes from "./routes/modeloRoutes.js";
import subtipoRoutes from "./routes/subtipoRoutes.js";
import { ApiError } from "./middlewares/ApiError.js";
import { origemPermitida, origemConfiavel } from "./config/seguranca.js";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const allowlist = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Em dev sem CORS_ORIGIN configurado, libera tudo para não travar o fluxo local
// (Vite proxy em localhost). Em produção, a allowlist é obrigatória.
const liberarTudo = !isProd && allowlist.length === 0;

const app = express();

// Atrás do reverse proxy (nginx do front / Traefik do Coolify): confia no
// primeiro hop para ler IP real (rate-limit) e protocolo (X-Forwarded-Proto).
app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, cb) => {
      if (liberarTudo) return cb(null, true);
      return cb(null, origemPermitida(origin, allowlist));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// CSRF defense-in-depth: além do cookie SameSite=Strict, mutações precisam vir
// de uma Origin/Referer da allowlist.
app.use((req, _res, next) => {
  if (liberarTudo) return next();
  if (!origemConfiavel(req, allowlist)) {
    return next(ApiError.forbidden("Origem não permitida"));
  }
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/", authRoutes);
app.use("/", downloadRoutes);
app.use("/usuario", usuarioRoutes);
app.use("/empresa", empresaRoutes);
app.use("/setor", setorRoutes);
app.use("/workstation", workstationRoutes);
app.use("/item", itemRoutes);
app.use("/plataforma", plataformaRoutes);
app.use("/senha", senhaRoutes);
app.use("/manutencao", manutencoesRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/perfil", perfilRoutes);
app.use("/pecas", pecasRoutes);
app.use("/marca", marcaRoutes);
app.use("/modelo", modeloRoutes);
app.use("/subtipo", subtipoRoutes);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      status: err.status,
      code: err.code,
      message: err.message,
      details: err.details || null,
    });
  }

  console.error(err);

  res.status(500).json({
    status: 500,
    code: "ERR_INTERNAL",
    message: "Erro interno do servidor",
  });
});
export default app;
