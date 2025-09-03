import express from "express";
import { getSetores } from "../controllers/setorController.js";

const router = express.Router();

router.get("/:id", getSetores);

export default router;
