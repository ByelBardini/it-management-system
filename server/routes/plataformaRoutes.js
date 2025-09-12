import express from "express";
import {
  getPlataformas,
  postPlataforma,
} from "../controllers/plataformaController.js";

const router = express.Router();

router.get("/", getPlataformas);
router.post("/", postPlataforma);

export default router;
