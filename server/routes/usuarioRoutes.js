import express from "express";
import { cadastrarUsuario } from "../controllers/usuarioController";

const router = express.Router();

router.post("/", cadastrarUsuario);

export default router;
