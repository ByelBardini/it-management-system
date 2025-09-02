import express from "express";
import { getEmpresas } from "../controllers/empresaController.js";

const router = express.Router();

router.get("/", getEmpresas);

export default router;
