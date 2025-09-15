import express from "express";
import {
  getSenhas,
  getSenhaFull,
  postSenha,
  deletaSenha,
} from "../controllers/senhaController.js";

const router = express.Router();

router.get("/:id", getSenhas);
router.get("/full/:id", getSenhaFull);
router.post("/", postSenha);
router.delete("/:id", deletaSenha);

export default router;
