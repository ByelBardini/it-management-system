import express from "express";
import { postModelo } from "../controllers/modeloController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = express.Router();

router.use(autenticar);
router.use(autorizarRole("adm"));
router.post("/", postModelo);

export default router;
