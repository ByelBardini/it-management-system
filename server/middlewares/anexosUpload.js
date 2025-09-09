import multer from "multer";
import path from "path";
import fs from "fs";

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, "uploads", "anexos");

function ensureDir(req, res, next) {
  fs.mkdirSync(BASE_DIR, { recursive: true });
  next();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, BASE_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .toLowerCase();
    const uniq = Date.now() + "-" + Math.round(Math.random() * 1e6);
    cb(null, `${base}-${uniq}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { files: 50, fileSize: 20 * 1024 * 1024, fields: 1000 },
});

function ensureArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

export const anexosUpload = [
  ensureDir,
  upload.any(),
  (req, res, next) => {
    const files = (req.files || []).filter((f) => f.fieldname === "arquivos");

    let tipos = ensureArray(req.body["tipo[]"] ?? req.body["tipo"]);
    let nomes = ensureArray(req.body["nome[]"] ?? req.body["nome"]);

    if ((tipos.length || nomes.length) &&
        (files.length !== tipos.length || files.length !== nomes.length)) {
      return res.status(400).json({
        error: "Quantidade de tipos/nomes não bate com arquivos.",
        detalhes: { tipos: tipos.length, nomes: nomes.length, arquivos: files.length },
      });
    }

    req.anexos = files.map((f, i) => ({
      tipo: tipos[i] ?? null,
      nome: nomes[i] ?? f.originalname,
      caminho: `/${path.relative(ROOT, f.path).replace(/\\+/g, "/")}`,
      original: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
    }));

    next();
  },
];