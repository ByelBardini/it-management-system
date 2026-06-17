import express from "express";
import { getMarcas, postMarca } from "../controllers/marcaController.js";
import { getModelos } from "../controllers/modeloController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = express.Router();

router.use(autenticar);
router.use(autorizarRole("adm"));
router.get("/", getMarcas);
router.post("/", postMarca);
router.get("/:id/modelos", getModelos);

export default router;
