import express from "express";
import {
  getSenhas,
  getSenhaFull,
  postSenha,
  deletaSenha,
  atualizaSenha,
  putSenha,
} from "../controllers/senhaController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = express.Router();

router.use(autenticar);
router.get("/:id", getSenhas);
router.get("/full/:id", getSenhaFull);
router.post("/", postSenha);
router.put("/atualiza/:id", atualizaSenha);
router.put("/:id", putSenha);
router.delete("/:id", autorizarRole("adm"), deletaSenha);

export default router;
