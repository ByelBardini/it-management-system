import { Router } from "express";
import {
  trocaSenha,
  putPerfil,
  primeiraTrocaSenha,
} from "../controllers/perfilController.js";
import { autenticar, autorizarUser } from "../middlewares/autenticaToken.js";
import uploadFoto from "../middlewares/perfilUpload.js";

const router = Router();

router.use(autenticar);
router.put("/troca/:id", autorizarUser(), trocaSenha);
router.put("/primeira/:id", autorizarUser(), primeiraTrocaSenha);
router.put("/:id", autorizarUser(), uploadFoto.single("foto"), putPerfil);

export default router;
