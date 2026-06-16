// truncation-check.mjs
// PostToolUse (Grep|Bash). Avisa quando a saída da ferramenta foi truncada.
// Apenas injeta contexto (via hookSpecificOutput.additionalContext), não bloqueia.

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

let resp = data?.tool_response;
if (resp && typeof resp === "object") resp = JSON.stringify(resp);
resp = typeof resp === "string" ? resp : "";

if (resp.includes("Output too large")) {
  // PostToolUse: additionalContext precisa ficar sob hookSpecificOutput.
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext:
          "AVISO: a saída da ferramenta foi truncada para um preview. A saída completa foi salva em disco — leia o arquivo indicado antes de agir, ou refaça com escopo mais estreito (um diretório, padrão mais específico).",
      },
    })
  );
  process.exit(0);
}

process.exit(0);
