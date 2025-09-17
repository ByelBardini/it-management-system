import { Router } from "express";
import { trocaSenha, putPerfil } from "../controllers/perfilController.js";
import { autenticar, autorizarUser } from "../middlewares/autenticaToken.js";
import uploadFoto from "../middlewares/perfilUpload.js";

const router = Router();

router.use(autenticar);
router.put("/troca/:id", autorizarUser(":id"), trocaSenha);
router.put("/:id",  autorizarUser(":id"), uploadFoto.single("foto"), putPerfil);

export default router;
