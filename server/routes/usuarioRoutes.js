import express from "express";
import {
  cadastrarUsuario,
  getFuncionarios,
} from "../controllers/usuarioController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = express.Router();

router.use(autenticar);
router.use(autorizarRole("adm"));
router.post("/", cadastrarUsuario);
router.get("/", getFuncionarios);

export default router;
