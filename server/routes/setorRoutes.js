import express from "express";
import {
  getSetores,
  postSetor,
  deleteSetor,
} from "../controllers/setorController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = express.Router();

router.use(autenticar);
router.use(autorizarRole("adm"));
router.get("/:id", getSetores);
router.post("/", postSetor);
router.delete("/:id", deleteSetor);

export default router;
