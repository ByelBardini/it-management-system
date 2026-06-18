import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { Usuario, ColetorToken } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";
import { gerarToken, montarBat } from "./helpers/coletorToken.js";

// Caminho do template do script. Em dev o backend roda de server/ e o coletor está
// em ../ferramentas; em produção, defina COLETOR_SCRIPT_PATH (ou inclua o arquivo na
// imagem). Ver docs/deploy/coolify.md.
function caminhoScript() {
  return (
    process.env.COLETOR_SCRIPT_PATH ||
    path.join(
      process.cwd(),
      "..",
      "ferramentas",
      "coletor-desktop",
      "coletar-desktop.ps1"
    )
  );
}

function textoAjuda() {
  return [
    "Coletor InfraHub",
    "",
    "1. Extraia esta pasta (nao rode de dentro do ZIP).",
    '2. De um duplo-clique em "Coletar.bat".',
    "3. Informe o nome completo e o setor quando pedido.",
    "4. Pronto: este computador foi enviado ao inventario.",
    "",
    "Precisa de PowerShell (ja vem no Windows) e acesso de rede ao sistema.",
  ].join("\r\n");
}

// Gera um token de coleta revogável para a conta logada (rotacionando os anteriores)
// e devolve um ZIP com o script + um lancador .bat que ja embute a URL e o token.
export async function baixarColetor(req, res) {
  const usuario = await Usuario.findByPk(req.usuario.id);
  if (!usuario || !usuario.usuario_empresa_id) {
    throw ApiError.badRequest(
      "Conta de coleta sem empresa vinculada. Peça ao administrador para vincular uma empresa."
    );
  }

  const apiBase = (process.env.COLETOR_API_BASE || "").trim();
  if (!apiBase) {
    throw ApiError.internal("COLETOR_API_BASE não configurada no servidor");
  }

  // Rotação: revoga tokens ativos anteriores desta conta antes de emitir um novo,
  // limitando a exposição a um token por vez.
  await ColetorToken.update(
    { token_ativo: 0 },
    {
      where: { token_usuario_id: usuario.usuario_id, token_ativo: 1 },
      usuarioId: req.usuario.id,
    }
  );

  const { token, hash } = gerarToken();
  await ColetorToken.create(
    {
      token_usuario_id: usuario.usuario_id,
      token_empresa_id: usuario.usuario_empresa_id,
      token_hash: hash,
      token_ativo: 1,
    },
    { usuarioId: req.usuario.id }
  );

  const scriptConteudo = fs.readFileSync(caminhoScript(), "utf8");
  const bat = montarBat({ apiBase, token });

  const zip = new JSZip();
  zip.file("coletar-desktop.ps1", scriptConteudo);
  zip.file("Coletar.bat", bat);
  zip.file("LEIA-ME.txt", textoAjuda());
  const buffer = await zip.generateAsync({ type: "nodebuffer" });

  res.set("Content-Type", "application/zip");
  res.set("Content-Disposition", 'attachment; filename="coletor-infrahub.zip"');
  return res.status(200).send(buffer);
}
