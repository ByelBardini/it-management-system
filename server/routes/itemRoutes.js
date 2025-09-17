import { Router } from "express";
import { anexosUpload } from "../middlewares/anexosUpload.js";
import {
  postItem,
  getItens,
  getItemFull,
  putItem,
  inativaItem,
  getItensInativos,
  getItensWorkstation,
  removerWorkstation,
} from "../controllers/itemController.js";
import { autenticar, autorizarRole } from "../middlewares/autenticaToken.js";

const router = Router();

router.use(autenticar);
router.use(autorizarRole("adm"));
router.get("/:id", getItens);
router.get("/inativos/:id", getItensInativos);
router.get("/workstation/:id", getItensWorkstation);
router.get("/full/:id", getItemFull);
router.post("/", anexosUpload, postItem);
router.put("/:id", anexosUpload, putItem);
router.put("/inativa/:id", inativaItem);
router.put("/workstation/remover/:id", removerWorkstation);

export default router;
