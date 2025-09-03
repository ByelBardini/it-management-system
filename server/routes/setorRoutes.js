import express from "express";
import {
  getSetores,
  postSetor,
  deleteSetor,
} from "../controllers/setorController.js";

const router = express.Router();

router.get("/:id", getSetores);
router.post("/", postSetor);
router.delete("/:id", deleteSetor);

export default router;
