import express from "express";
import {
  getSenhas,
  getSenhaFull,
  postSenha,
} from "../controllers/senhaController.js";

const router = express.Router();

router.get("/:id", getSenhas);
router.get("/full/:id", getSenhaFull);
router.post("/", postSenha);

export default router;
