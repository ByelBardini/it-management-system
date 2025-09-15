import express from "express";
import {
  getSenhas,
  getSenhaFull,
  postSenha,
  deletaSenha,
  atualizaSenha,
  putSenha,
} from "../controllers/senhaController.js";

const router = express.Router();

router.get("/:id", getSenhas);
router.get("/full/:id", getSenhaFull);
router.post("/", postSenha);
router.put("/atualiza/:id", atualizaSenha);
router.put("/:id", putSenha);
router.delete("/:id", deletaSenha);

export default router;
