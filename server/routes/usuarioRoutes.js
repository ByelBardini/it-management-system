import express from "express";
import {
  cadastrarUsuario,
  getFuncionarios,
  inativaUsuario,
  resetarSenha,
} from "../controllers/usuarioController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = express.Router();

router.use(autenticar);
router.use(autorizarRole("adm"));
router.post("/", cadastrarUsuario);
router.get("/", getFuncionarios);
router.put("/inativa/:id", inativaUsuario);
router.put("/reseta/:id", resetarSenha);

export default router;
