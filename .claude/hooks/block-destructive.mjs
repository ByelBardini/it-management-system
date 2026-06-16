// block-destructive.mjs
// PreToolUse (Bash). Bloqueia comandos obviamente destrutivos antes de rodarem.
// Usa apenas Node (jq/python não estão disponíveis neste ambiente).

let raw = "";
try {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  raw = Buffer.concat(chunks).toString("utf8");
} catch {
  process.exit(0);
}

let cmd = "";
try {
  cmd = JSON.parse(raw)?.tool_input?.command || "";
} catch {
  process.exit(0);
}
if (!cmd) process.exit(0);

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

const checks = [
  [
    /rm\s+(-[a-zA-Z]*f[a-zA-Z]*\s+|(-[a-zA-Z]*\s+)*)(\/|~|\$HOME|\.\.)/,
    "Comando rm destrutivo apontando para raiz, home ou diretório pai bloqueado. Se for intencional, rode manualmente.",
  ],
  [
    /DROP\s+(TABLE|DATABASE)|TRUNCATE\s+TABLE|DELETE\s+FROM\s+\S+\s*;?\s*$/i,
    "Comando destrutivo de banco bloqueado. Se for intencional, rode manualmente.",
  ],
  [
    // --force (mas não --force-with-lease), push -f, ou reset --hard para HEAD~/origin
    /git\s+push\b[^|&;\n]*?(--force(?![-\w])|-f\b)|git\s+reset\s+--hard\s+(HEAD~|origin)/,
    "Force push ou hard reset bloqueado. Se for intencional, rode manualmente.",
  ],
  [
    // lê um arquivo .env (inclusive com prefixo de caminho), exceto templates
    // não-secretos (.env.example/.sample/.template/.dist)
    /\b(cat|less|head|tail|more|source|grep|sed|awk|bat|strings|xxd|od|nano|vim|code)\b[^|&;\n]*?(?<![\w.])\.env(?!\.(?:example|sample|template|dist))\b/i,
    "Acesso ao arquivo .env bloqueado. Credenciais não devem ser lidas pelo agente.",
  ],
];

for (const [re, reason] of checks) {
  if (re.test(cmd)) deny(reason);
}

process.exit(0);
