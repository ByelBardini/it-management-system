import express from "express";
import { getSubtipos, postSubtipo } from "../controllers/subtipoController.js";
import {
  autenticar,
  autorizarQualquerRole,
} from "../middlewares/autenticaToken.js";

const router = express.Router();

// Leitura da lista de subtipos (cascata) e criação de subtipo: liberadas ao
// cadastrador (app mobile). adm sempre passa.
router.use(autenticar);
router.get("/", autorizarQualquerRole(["cadastrador"]), getSubtipos);
router.post("/", autorizarQualquerRole(["cadastrador"]), postSubtipo);

export default router;
