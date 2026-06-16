// stop-verify.mjs
// Stop. Verificação "nível funcionário": tenta rodar a bateria de testes
// (Vitest) em server/ e client/ e bloqueia o Stop se houver FALHA REAL de teste.
//
// Particularidade deste ambiente (Node 24 + Windows): o pool de workers do
// Vitest quebra quando o processo é lançado de forma aninhada/headless (como
// um hook faz) — mesmo com os testes corretos. Esse erro de infraestrutura
// ("reading 'config'", "0 test", "No test files") é tratado como INCONCLUSIVO
// e NÃO bloqueia, para não prender o agente num loop com falso-negativo.
// Os testes rodam normalmente num terminal real: `cd server && npm test`.
//
// stop_hook_active evita loop: quando o agente reenvia após corrigir, o
// sistema marca true e deixamos passar.

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

let raw = "";
try {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  raw = Buffer.concat(chunks).toString("utf8");
} catch {
  process.exit(0);
}

let data = {};
try {
  data = JSON.parse(raw);
} catch {
  /* segue com objeto vazio */
}
if (data?.stop_hook_active === true) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const blocking = [];

function hasRealTestScript(dir) {
  const pkgPath = path.join(dir, "package.json");
  if (!existsSync(pkgPath)) return false;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const test = pkg.scripts?.test || "";
    return Boolean(test) && !test.includes("no test specified");
  } catch {
    return false;
  }
}

// Assinaturas de falha de INFRA (não de teste) — execução headless do Vitest
// neste ambiente. Não devem bloquear.
function isInconclusive(out) {
  return (
    /Cannot read properties of undefined \(reading 'config'\)/.test(out) ||
    /No test files found/.test(out) ||
    /\(0 test\)/.test(out)
  );
}

for (const sub of ["server", "client"]) {
  const dir = path.join(projectDir, sub);
  if (!hasRealTestScript(dir)) continue;
  try {
    execSync("npm test", {
      cwd: dir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    const out = `${err.stdout || ""}${err.stderr || ""}`;
    if (isInconclusive(out)) continue; // infra headless quebrou — não bloqueia
    const tail = out.split("\n").slice(-30).join("\n");
    blocking.push(`TESTES FALHARAM (${sub}):\n${tail}`);
  }
}

if (blocking.length) {
  // exit 2: o Claude Code lê o stderr como o motivo do bloqueio do Stop.
  process.stderr.write(
    "Verificação falhou. Corrija antes de concluir:\n\n" + blocking.join("\n\n")
  );
  process.exit(2);
}

process.exit(0);
