import { Router } from "express";
import {
  postPeca,
  getPecasAtivas,
  getPecasInativas,
  inativarPeca,
} from "../controllers/pecasController.js";
import { autenticar } from "../middlewares/autenticaToken.js";

const router = Router();

router.use(autenticar);
router.post("/", postPeca);
router.get("/ativas/:id", getPecasAtivas);
router.get("/inativas/:id", getPecasInativas);
router.put("/inativar/:id", inativarPeca);

export default router;
