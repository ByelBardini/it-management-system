// post-edit-verify.mjs
// PostToolUse (Write|Edit|MultiEdit). Roda eslint no arquivo editado e bloqueia
// se houver erro de lint. Só vale para arquivos de client/ — é a única pasta
// com config de eslint (server/ é JS sem eslint). Falha de ferramenta nunca
// bloqueia (degrada silenciosamente).

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

let raw = "";
try {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  raw = Buffer.concat(chunks).toString("utf8");
} catch {
  process.exit(0);
}

let data;
try {
  data = JSON.parse(raw);
} catch {
  process.exit(0);
}

const filePath = data?.tool_input?.file_path || data?.tool_input?.filePath || "";
if (!filePath) process.exit(0);
if (!/\.(js|jsx)$/.test(filePath)) process.exit(0);

const normalized = filePath.replace(/\\/g, "/");
if (!normalized.includes("/client/")) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const clientDir = path.join(projectDir, "client");
if (!existsSync(path.join(clientDir, "eslint.config.js"))) process.exit(0);

// Chama o binário do eslint direto com `node` — sem shell e sem .cmd, então
// o filePath vai como argv (nada de injeção) e o spawn é confiável no Windows.
const eslintBin = path.join(clientDir, "node_modules", "eslint", "bin", "eslint.js");
if (!existsSync(eslintBin)) process.exit(0);

try {
  execFileSync(process.execPath, [eslintBin, "--quiet", filePath], {
    cwd: clientDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (err) {
  const out = `${err.stdout || ""}${err.stderr || ""}`.trim();
  // eslint não rodou (ferramenta ausente, etc.) → não bloqueia
  if (!out) process.exit(0);
  // exit 2: o Claude Code lê o stderr como o motivo do bloqueio (PostToolUse).
  process.stderr.write(
    "Lint falhou. Corrija antes de continuar:\n" +
      out.split("\n").slice(0, 50).join("\n")
  );
  process.exit(2);
}

process.exit(0);
