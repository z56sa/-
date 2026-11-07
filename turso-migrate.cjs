"use strict";
const https = require("node:https");
const { createClient } = require("@libsql/client");

const TURSO_URL   = "libsql://maarab-z56sa.aws-ap-northeast-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM4MDYzMzksImlkIjoiMDFhMTlkNDItY2UwMS03NGZhLTkyN2YtNTQ1M2RkMTgwZmE1Iiwia2lkIjoiSjllZ0sxR0d5WjNjZXpqTGpCbUZuS2hhMUlFa2JGZ25meDdtLUY3TWtXayIsInJpZCI6IjRmMGViZTY0LTk2YmUtNGJlYy1iOTMyLWRhMTU3YjZjZTUzNyJ9.Uowxy1jsnYPTtkCt2G75lUZDshmW5MJ9yVQp9xcuFf4ZzUKQL4WZaOV2Q0a_bXo4Z9K0Ld8yXnV_hz3aPQkQBQ";
const API_URL     = "https://polar-download-gateway.mdmrksad1ksa.workers.dev/api/content";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "M3rab-Migrate/1.0" } }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on("error", reject);
  });
}

async function main() {
  console.log("🔗 Connecting to Turso...");
  const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  // Create tables
  console.log("📋 Creating tables...");
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS content (
      id      INTEGER PRIMARY KEY,
      data    TEXT NOT NULL,
      updated TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS games (
      id          TEXT PRIMARY KEY,
      title       TEXT,
      title_ar    TEXT,
      genre       TEXT,
      year        INTEGER,
      steam_id    TEXT,
      cover_url   TEXT,
      has_patch   INTEGER DEFAULT 0,
      updated     TEXT DEFAULT (datetime('now'))
    );
  `);
  console.log("✅ Tables ready");

  // Fetch all content from API
  console.log("⬇️  Fetching content from M3rab API...");
  const content = await fetchJson(API_URL);
  if (!content) { console.error("❌ Failed to fetch content"); process.exit(1); }

  // Store full JSON blob
  await db.execute({
    sql: "INSERT OR REPLACE INTO content (id, data, updated) VALUES (1, ?, datetime('now'))",
    args: [JSON.stringify(content)]
  });
  console.log(`✅ Stored full content blob`);

  // Also store individual games if content has games array
  const games = content.games || content.translations || content.items || [];
  if (games.length > 0) {
    console.log(`📦 Migrating ${games.length} games...`);
    let count = 0;
    for (const g of games) {
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO games (id, title, title_ar, genre, year, steam_id, cover_url, has_patch)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            String(g.id || g._id || Math.random()),
            g.title || g.name || "",
            g.titleAr || g.title_ar || g.arabicTitle || "",
            g.genre || g.category || "",
            parseInt(g.year || g.releaseYear || 0) || null,
            String(g.steamId || g.steam_id || g.appId || ""),
            g.cover || g.coverUrl || g.image || "",
            g.hasPatch || g.has_patch ? 1 : 0
          ]
        });
        count++;
      } catch {}
    }
    console.log(`✅ Migrated ${count}/${games.length} games`);
  } else {
    console.log("ℹ️  Content stored as blob (no top-level games array)");
  }

  // Verify
  const check = await db.execute("SELECT COUNT(*) as cnt FROM content");
  console.log(`\n🎉 Migration complete! content rows: ${check.rows[0].cnt}`);
  
  const gcount = await db.execute("SELECT COUNT(*) as cnt FROM games");
  console.log(`   Games in DB: ${gcount.rows[0].cnt}`);
  
  db.close();
}

main().catch(err => { console.error("❌ Error:", err.message); process.exit(1); });
