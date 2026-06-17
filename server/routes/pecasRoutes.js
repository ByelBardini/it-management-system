import { Router } from "express";
import {
  postPeca,
  getPecasAtivas,
  getPecasInativas,
  inativarPeca,
  importarPecas,
} from "../controllers/pecasController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = Router();

router.use(autenticar);
// Importação em massa é privilegiada — gateia por adm (igual a /item/importar),
// mesmo que o cadastro unitário de peça (postPeca) seja apenas autenticado.
router.post("/importar", autorizarRole("adm"), importarPecas);
router.post("/", postPeca);
router.get("/ativas/:id", getPecasAtivas);
router.get("/inativas/:id", getPecasInativas);
router.put("/inativar/:id", inativarPeca);

export default router;
