import express from "express";
import { getDadosDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/:id", getDadosDashboard);

export default router;
