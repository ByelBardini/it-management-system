import { Router } from "express";
import { trocaSenha } from "../controllers/perfilController.js";

const router = Router();

router.put("/troca/:id", trocaSenha);

export default router;
