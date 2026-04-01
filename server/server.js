import app from "./app.js";

const PORT = process.env.PORT || 3003;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server rodando na porta ${PORT}`);
});