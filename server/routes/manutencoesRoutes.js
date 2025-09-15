import { Router } from "express";
import {
  getManutencoes,
  realizarManutencao,
  putManutencao,
} from "../controllers/manutencaoController.js";

const router = Router();

router.get("/:id", getManutencoes);
router.put("/:id", putManutencao);
router.put("/realizar/:id", realizarManutencao);

export default router;
