import express from "express";
import { getMarcas, postMarca } from "../controllers/marcaController.js";
import { getModelos } from "../controllers/modeloController.js";
import {
  autenticar,
  autorizarQualquerRole,
} from "../middlewares/autenticaToken.js";

const router = express.Router();

// Cascata Tipo->Marca->Modelo + criação de marca: liberadas ao cadastrador (app mobile).
// adm sempre passa (autorizarQualquerRole). Não há outros verbos aqui.
router.use(autenticar);
router.get("/", autorizarQualquerRole(["cadastrador"]), getMarcas);
router.post("/", autorizarQualquerRole(["cadastrador"]), postMarca);
router.get("/:id/modelos", autorizarQualquerRole(["cadastrador"]), getModelos);

export default router;
