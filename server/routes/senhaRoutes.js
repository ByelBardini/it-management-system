import express from "express";
import { getSenhas } from "../controllers/senhaController.js";

const router = express.Router();

router.get("/:id", getSenhas);

export default router;
