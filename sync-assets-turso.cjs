"use strict";
const { createClient } = require("@libsql/client");
const https = require("node:https");
const path = require("node:path");

const TURSO_URL = "libsql://maarab-z56sa.aws-ap-northeast-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM4MDYzMzksImlkIjoiMDFhMTlkNDItY2UwMS03NGZhLTkyN2YtNTQ1M2RkMTgwZmE1Iiwia2lkIjoiSjllZ0sxR0d5WjNjZXpqTGpCbUZuS2hhMUlFa2JGZ25meDdtLUY3TWtXayIsInJpZCI6IjRmMGViZTY0LTk2YmUtNGJlYy1iOTMyLWRhMTU3YjZjZTUzNyJ9.Uowxy1jsnYPTtkCt2G75lUZDshmW5MJ9yVQp9xcuFf4ZzUKQL4WZaOV2Q0a_bXo4Z9K0Ld8yXnV_hz3aPQkQBQ";
const API_URL = "https://polar-download-gateway.mdmrksad1ksa.workers.dev/api/content";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "M3rab-Desktop/1.0.85" } }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

async function run() {
  console.log("Fetching live content...");
  const data = await fetchJson(API_URL);
  const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
  let count = 0;
  for (const g of data.games) {
    if (!g.translations) continue;
    for (const t of g.translations) {
      try {
        await db.execute({
          sql: "INSERT OR REPLACE INTO translation_files (id, game_id, translation_id, file_name, file_size, asset_key, download_url, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))",
          args: [
            String(t.id || (g.id + "-" + (t.version || "v1"))),
            String(g.id),
            String(t.id || "default"),
            t.assetKey ? path.basename(t.assetKey) : (t.name || "patch.zip"),
            t.size ? parseInt(String(t.size).replace(/[^0-9]/g, "")) || 0 : 0,
            t.assetKey || null,
            t.downloadUrl || null,
            JSON.stringify({ author: t.author, version: t.version, archiveFormat: t.archiveFormat, changelog: t.changelog })
          ]
        });
        count++;
      } catch (e) {
        console.error("Row error:", e.message);
      }
    }
  }
  console.log("Successfully synced", count, "real translation assets to Turso!");
  const check = await db.execute("SELECT COUNT(*) as c FROM translation_files");
  console.log("Total translation_files in Turso:", check.rows[0].c);
  db.close();
}

run().catch(console.error);
