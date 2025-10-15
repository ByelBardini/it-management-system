import { Router } from "express";
import { postPeca, getPecas } from "../controllers/pecasController.js";
import { autenticar } from "../middlewares/autenticaToken.js";

const router = Router();

router.use(autenticar);
router.post("/", postPeca);
router.get("/:id", getPecas);

export default router;
