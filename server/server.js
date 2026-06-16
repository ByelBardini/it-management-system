import dotenv from "dotenv";
import app from "./app.js";
import { validarAmbiente } from "./config/seguranca.js";

dotenv.config();

// Fail-fast: sem os segredos obrigatórios o app nem sobe (evita rodar com
// chave fraca/ausente). Lança Error e derruba o processo no boot.
validarAmbiente(process.env);

const PORT = process.env.PORT || 3003;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server rodando na porta ${PORT}`);
});
