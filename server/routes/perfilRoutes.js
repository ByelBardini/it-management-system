import { Router } from "express";
import { trocaSenha, putPerfil } from "../controllers/perfilController.js";
import uploadFoto from "../middlewares/perfilUpload.js";

const router = Router();

router.put("/troca/:id", trocaSenha);
router.put("/:id", uploadFoto.single("foto"), putPerfil);

export default router;
