import express from "express";
import { getSetores, postSetor } from "../controllers/setorController.js";

const router = express.Router();

router.get("/:id", getSetores);
router.post("/", postSetor);

export default router;
