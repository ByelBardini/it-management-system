import express from "express";
import { cadastrarUsuario } from "../controllers/usuarioController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = express.Router();

router.use(autenticar);
router.use(autorizarRole("adm"));
router.post("/", cadastrarUsuario);

export default router;
