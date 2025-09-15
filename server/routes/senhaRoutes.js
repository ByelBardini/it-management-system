import express from "express";
import {
  getSenhas,
  getSenhaFull,
  postSenha,
  deletaSenha,
  atualizaSenha,
} from "../controllers/senhaController.js";

const router = express.Router();

router.get("/:id", getSenhas);
router.get("/full/:id", getSenhaFull);
router.post("/", postSenha);
router.put("/atualiza/:id", atualizaSenha);
router.delete("/:id", deletaSenha);

export default router;
