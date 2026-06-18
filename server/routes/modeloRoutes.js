import express from "express";
import { postModelo } from "../controllers/modeloController.js";
import {
  autenticar,
  autorizarQualquerRole,
} from "../middlewares/autenticaToken.js";

const router = express.Router();

// Criação de modelo no fluxo de cadastro: liberada ao cadastrador (adm sempre passa).
router.use(autenticar);
router.post("/", autorizarQualquerRole(["cadastrador"]), postModelo);

export default router;
