import express from "express";
import {
  getWorkstation,
  postWorkstation,
  deleteWorkstation,
} from "../controllers/workstationController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = express.Router();

router.use(autenticar);
router.use(autorizarRole("adm"));
router.get("/:id", getWorkstation);
router.post("/", postWorkstation);
router.delete("/:id", deleteWorkstation);

export default router;
