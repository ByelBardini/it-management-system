import cors from "cors";
import express from "express";
import dotenv from "dotenv";
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
import { ApiError } from "./middlewares/ApiError.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
