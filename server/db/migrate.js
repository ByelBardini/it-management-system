// Runner de migração próprio (sem dbmate, sem binário externo).
//
// Forward-only, idempotente e NÃO-destrutivo: lê os .sql de db/migrations/,
// descobre os pendentes via pendentes() e aplica cada um em ordem, registrando
// o nome em `schema_migrations` APÓS o sucesso. Roda no Windows (dev) e no
// Linux/Docker (deploy) usando apenas deps de produção (mysql2, dotenv).
//
// Pré-requisito: o database (DB_DATABASE) já existe — o runner cria as TABELAS,
// não o schema. Abre uma conexão mysql2 PRÓPRIA (com multipleStatements) lendo
// DB_* do .env; não toca o config/database.js da app.
//
// Caveat MySQL: DDL faz auto-commit (não há rollback de CREATE TABLE). Por isso
// o baseline usa CREATE TABLE IF NOT EXISTS — se algo falhar no meio, re-rodar
// é seguro: as tabelas já criadas são puladas e o INSERT de controle só ocorre
// após o .sql inteiro aplicar sem erro.
//
// Flag --reset (DEV-ONLY, DESTRUTIVO, NUNCA no deploy): apaga TODAS as tabelas,
// re-aplica do zero e roda o seed. Útil para recomeçar o banco local.
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { pendentes } from "./pendentes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "migrations");
const RESET = process.argv.slice(2).includes("--reset");

async function abrirConexao() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true,
  });
}

async function garantirTabelaControle(conexao) {
  await conexao.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       nome VARCHAR(255) NOT NULL,
       aplicada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (nome)
     )`
  );
}

// DEV-ONLY: derruba todas as tabelas do database atual (inclui schema_migrations).
async function droparTudo(conexao) {
  await conexao.query("SET FOREIGN_KEY_CHECKS = 0");
  const [tabelas] = await conexao.query(
    "SELECT table_name AS nome FROM information_schema.tables WHERE table_schema = DATABASE()"
  );
  for (const { nome } of tabelas) {
    await conexao.query(`DROP TABLE IF EXISTS \`${nome}\``);
  }
  await conexao.query("SET FOREIGN_KEY_CHECKS = 1");
  console.warn(`--reset: ${tabelas.length} tabela(s) removida(s).`);
}

async function listarArquivos() {
  try {
    const entradas = await readdir(MIGRATIONS_DIR);
    return entradas.filter((nome) => nome.endsWith(".sql"));
  } catch (erro) {
    // Pasta ainda não existe (banco recém-clonado, sem baseline) → nada a aplicar.
    if (erro.code === "ENOENT") return [];
    throw erro;
  }
}

async function listarAplicadas(conexao) {
  const [linhas] = await conexao.query("SELECT nome FROM schema_migrations");
  return linhas.map((linha) => linha.nome);
}

async function migrar() {
  const conexao = await abrirConexao();
  try {
    if (RESET) {
      console.warn(
        "⚠️  --reset: apagando TODAS as tabelas (DEV-ONLY, destrutivo)."
      );
      await droparTudo(conexao);
    }

    await garantirTabelaControle(conexao);

    const arquivos = await listarArquivos();
    const aplicadas = await listarAplicadas(conexao);
    const aRodar = pendentes(arquivos, aplicadas);

    if (aRodar.length === 0) {
      console.log("Nenhuma migration pendente.");
    } else {
      for (const nome of aRodar) {
        const caminho = path.join(MIGRATIONS_DIR, nome);
        const sql = await readFile(caminho, "utf8");
        console.log(`Aplicando ${nome}...`);
        await conexao.query(sql);
        await conexao.query("INSERT INTO schema_migrations (nome) VALUES (?)", [
          nome,
        ]);
      }
      console.log(`${aRodar.length} migration(s) aplicada(s) com sucesso.`);
    }
  } finally {
    await conexao.end();
  }

  // Seed só no --reset (dev). O deploy roda apenas o migrate forward-only.
  // Import dinâmico mantém o caminho normal (deploy) sem abrir o Sequelize.
  if (RESET) {
    const { semear } = await import("./seed.js");
    const sequelize = (await import("../config/database.js")).default;
    try {
      await semear();
    } finally {
      await sequelize.close();
    }
  }
}

migrar().catch((erro) => {
  console.error("Falha ao aplicar migrations:", erro.message);
  process.exitCode = 1;
});
