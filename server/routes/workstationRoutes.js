import express from "express";
import {
  getWorkstation,
  postWorkstation,
  deleteWorkstation,
} from "../controllers/workstationController.js";

const router = express.Router();

router.get("/:id", getWorkstation);
router.post("/", postWorkstation);
router.delete("/:id", deleteWorkstation);

export default router;
