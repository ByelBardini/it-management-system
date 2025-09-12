import express from "express";
import {
  getPlataformas,
  postPlataforma,
  deletePlataforma,
} from "../controllers/plataformaController.js";

const router = express.Router();

router.get("/", getPlataformas);
router.post("/", postPlataforma);
router.delete("/:id", deletePlataforma);

export default router;
