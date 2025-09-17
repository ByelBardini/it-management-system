import { Router } from "express";
import {
  getManutencoes,
  realizarManutencao,
  putManutencao,
} from "../controllers/manutencaoController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = Router();

router.use(autenticar);
router.use(autorizarRole("adm"));
router.get("/:id", getManutencoes);
router.put("/:id", putManutencao);
router.put("/realizar/:id", realizarManutencao);

export default router;
