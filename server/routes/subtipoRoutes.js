import express from "express";
import { getSubtipos, postSubtipo } from "../controllers/subtipoController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = express.Router();

router.use(autenticar);
router.use(autorizarRole("adm"));
router.get("/", getSubtipos);
router.post("/", postSubtipo);

export default router;
