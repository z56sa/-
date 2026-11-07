"use strict";
const { createClient } = require("@libsql/client");

const TURSO_URL = "libsql://maarab-z56sa.aws-ap-northeast-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM4MDYzMzksImlkIjoiMDFhMTlkNDItY2UwMS03NGZhLTkyN2YtNTQ1M2RkMTgwZmE1Iiwia2lkIjoiSjllZ0sxR0d5WjNjZXpqTGpCbUZuS2hhMUlFa2JGZ25meDdtLUY3TWtXayIsInJpZCI6IjRmMGViZTY0LTk2YmUtNGJlYy1iOTMyLWRhMTU3YjZjZTUzNyJ9.Uowxy1jsnYPTtkCt2G75lUZDshmW5MJ9yVQp9xcuFf4ZzUKQL4WZaOV2Q0a_bXo4Z9K0Ld8yXnV_hz3aPQkQBQ";

async function main() {
  const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS translation_files (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL,
      translation_id TEXT NOT NULL,
      file_name TEXT,
      file_size INTEGER,
      asset_key TEXT,
      download_url TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS game_installations (
      game_id TEXT PRIMARY KEY,
      installed_patch_id TEXT,
      install_path TEXT,
      installed_files TEXT,
      installed_at TEXT DEFAULT (datetime('now'))
    );
  `);
  console.log("Turso tables verified and created successfully.");
  db.close();
}

main().catch(err => {
  console.error("Setup error:", err);
  process.exit(1);
});
