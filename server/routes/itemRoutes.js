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
  importarItens,
  coletarDesktop,
} from "../controllers/itemController.js";
import {
  autenticar,
  autorizarRole,
  autorizarQualquerRole,
  autenticarColetorToken,
} from "../middlewares/autenticaToken.js";
import { baixarColetor } from "../controllers/coletorController.js";

const router = Router();

// Coleta por TOKEN de API (autoatendimento dos PCs da empresa): autentica pelo token
// embutido no ZIP — ANTES do gate de cookie global, pois é cliente não-browser sem
// sessão. Reusa o controller coletarDesktop; o empresa_id vem do token (não do corpo).
router.post("/coletar-desktop/token", autenticarColetorToken, coletarDesktop);

// Autorização por verbo (não global): só a CRIAÇÃO de item é liberada ao cadastrador
// (app mobile). Leituras, edição, inativação, importação e coleta de desktop seguem adm.
router.use(autenticar);
// Download do coletor (ZIP com token embutido): conta coletor logada (ou adm).
router.get(
  "/coletar-desktop/download",
  autorizarQualquerRole(["coletor"]),
  baixarColetor
);
router.get("/:id", autorizarRole("adm"), getItens);
router.get("/inativos/:id", autorizarRole("adm"), getItensInativos);
router.get("/workstation/:id", autorizarRole("adm"), getItensWorkstation);
router.get("/full/:id", autorizarRole("adm"), getItemFull);
router.post("/importar", autorizarRole("adm"), importarItens);
router.post("/coletar-desktop", autorizarRole("adm"), coletarDesktop);
router.post("/", autorizarQualquerRole(["cadastrador"]), anexosUpload, postItem);
router.put("/:id", autorizarRole("adm"), anexosUpload, putItem);
router.put("/inativa/:id", autorizarRole("adm"), inativaItem);
router.put("/workstation/remover/:id", autorizarRole("adm"), removerWorkstation);

export default router;
