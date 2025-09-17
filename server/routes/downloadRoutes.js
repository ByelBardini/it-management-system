import fs from "fs";
import path from "path";
import express from "express";
import { autenticar } from "../middlewares/autenticaToken.js";

const router = express.Router();
const uploadRoot = path.join(process.cwd(), "uploads");

router.get("/download", autenticar, (req, res) => {
  const rel = String(req.query.path || "");
  const full = path.join(
    process.cwd(),
    rel.startsWith("/") ? rel.slice(1) : rel
  );

  if (!full.startsWith(uploadRoot) || !fs.existsSync(full)) {
    return res.status(404).end();
  }

  res.download(full, path.basename(full));
});
router.get("/imagem", (req, res) => {
  const rel = String(req.query.path || "").replace(/^\/?uploads[\\/]/, "");
  const full = path.resolve(uploadRoot, rel);

  if (!full.startsWith(uploadRoot) || !fs.existsSync(full)) {
    return res.status(404).send("Imagem não encontrada");
  }

  res.sendFile(full);
});

export default router;
