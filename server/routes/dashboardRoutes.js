import express from "express";
import { getDadosDashboard } from "../controllers/dashboardController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = express.Router();

router.use(autenticar);
router.get("/:id", autorizarRole("adm"), getDadosDashboard);

export default router;
