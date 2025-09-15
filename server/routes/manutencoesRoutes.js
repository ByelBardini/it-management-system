import { Router } from "express";
import { getManutencoes } from "../controllers/manutencaoController.js";

const router = Router();

router.get("/:id", getManutencoes);

export default router;
