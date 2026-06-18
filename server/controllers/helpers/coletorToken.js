import crypto from "crypto";

// Helpers puros do token de coleta (sem Express, sem banco) — testáveis isolados.
// O token é OPACO e aleatório; no banco guardamos só o hash SHA-256. O valor em
// claro só existe no ZIP baixado (embutido no .bat que chama o script).

export function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export function gerarToken() {
  const token = crypto.randomBytes(32).toString("hex"); // 64 chars hex
  return { token, hash: hashToken(token) };
}

// Monta o conteúdo do lançador .bat (duplo-clique): chama o coletor via PowerShell
// com a URL e o token embutidos. ApiBase/token vêm do download (por usuário/empresa).
export function montarBat({ apiBase, token, scriptNome = "coletar-desktop.ps1" }) {
  return [
    "@echo off",
    "REM Coletor InfraHub - de um duplo-clique para enviar este PC ao inventario.",
    `powershell -ExecutionPolicy Bypass -File "%~dp0${scriptNome}" -ApiBase "${apiBase}" -Token "${token}"`,
    "pause",
  ].join("\r\n");
}
