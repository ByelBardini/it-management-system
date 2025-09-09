import { Router } from "express";
import { anexosUpload } from "../middlewares/anexosUpload.js";
import { postItem } from "../controllers/itemController.js";

const router = Router();

router.post("/", anexosUpload, postItem);

export default router;
