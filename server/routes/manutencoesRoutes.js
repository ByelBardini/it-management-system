import { Router } from "express";
import {
  getManutencoes,
  realizarManutencao,
} from "../controllers/manutencaoController.js";

const router = Router();

router.get("/:id", getManutencoes);
router.put("/realizar/:id", realizarManutencao);

export default router;
