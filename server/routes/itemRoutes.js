import { Router } from "express";
import { anexosUpload } from "../middlewares/anexosUpload.js";
import { postItem, getItens } from "../controllers/itemController.js";

const router = Router();

router.post("/", anexosUpload, postItem);
router.get("/:id", getItens);

export default router;
