import { Router } from "express";
import { anexosUpload } from "../middlewares/anexosUpload.js";
import {
  postItem,
  getItens,
  getItemFull,
  putItem,
} from "../controllers/itemController.js";

const router = Router();

router.get("/:id", getItens);
router.get("/full/:id", getItemFull);
router.post("/", anexosUpload, postItem);
router.put("/:id", putItem);

export default router;
