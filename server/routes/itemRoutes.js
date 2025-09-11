import { Router } from "express";
import { anexosUpload } from "../middlewares/anexosUpload.js";
import {
  postItem,
  getItens,
  getItemFull,
} from "../controllers/itemController.js";

const router = Router();

router.post("/", anexosUpload, postItem);
router.get("/:id", getItens);
router.get("/full/:id", getItemFull);

export default router;
