import express from "express";
import {
  getEmpresas,
  getSetoresWorkstations,
} from "../controllers/empresaController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = express.Router();

router.use(autenticar);
router.get("/", getEmpresas);
router.get("/setores-workstations/:id", autorizarRole("adm"), getSetoresWorkstations);

export default router;
