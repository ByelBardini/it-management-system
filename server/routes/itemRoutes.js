import { Router } from "express";
import { anexosUpload } from "../middlewares/anexosUpload.js";
import {
  postItem,
  getItens,
  getItemFull,
  putItem,
  inativaItem,
  getItensInativos,
} from "../controllers/itemController.js";

const router = Router();

router.get("/:id", getItens);
router.get("/inativos/:id", getItensInativos);
router.get("/full/:id", getItemFull);
router.post("/", anexosUpload, postItem);
router.put("/:id", anexosUpload, putItem);
router.put("/inativa/:id", inativaItem);

export default router;
