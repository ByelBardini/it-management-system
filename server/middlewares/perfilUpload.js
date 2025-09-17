import fs from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = path.join(process.cwd(), "uploads");
const fotosDir = path.join(uploadRoot, "fotos");

fs.mkdirSync(fotosDir, { recursive: true });

function makeFilename(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const baseFromBody = String(req.body?.nome || "perfil")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase();
  cb(null, `${Date.now()}-${baseFromBody}${ext}`);
}

function fileFilter(_req, file, cb) {
  const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  cb(
    ok ? null : new Error("Tipo de arquivo inválido (use JPG, PNG ou WEBP)"),
    ok
  );
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, fotosDir),
  filename: makeFilename,
});

const uploadFoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

export default uploadFoto;
