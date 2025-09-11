import express from "express";
import {
  getEmpresas,
  getSetoresWorkstations,
} from "../controllers/empresaController.js";

const router = express.Router();

router.get("/", getEmpresas);
router.get("/setores-workstations/:id", getSetoresWorkstations);

export default router;
