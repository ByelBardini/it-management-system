import express from "express";
import {
  getPlataformas,
  postPlataforma,
  deletePlataforma,
} from "../controllers/plataformaController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = express.Router();

router.use(autenticar);
router.use(autorizarRole("adm"));
router.get("/", getPlataformas);
router.post("/", postPlataforma);
router.delete("/:id", deletePlataforma);

export default router;
