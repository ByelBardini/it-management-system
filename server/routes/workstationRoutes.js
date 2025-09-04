import express from "express";
import {
  getWorkstation,
  postWorkstation,
} from "../controllers/workstationController.js";

const router = express.Router();

router.get("/:id", getWorkstation);
router.post("/", postWorkstation);

export default router;
