const { createClient } = require("@libsql/client");

const TURSO_URL = "libsql://maarab-z56sa.aws-ap-northeast-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM4MDYzMzksImlkIjoiMDFhMTlkNDItY2UwMS03NGZhLTkyN2YtNTQ1M2RkMTgwZmE1Iiwia2lkIjoiSjllZ0sxR0d5WjNjZXpqTGpCbUZuS2hhMUlFa2JGZ25meDdtLUY3TWtXayIsInJpZCI6IjRmMGViZTY0LTk2YmUtNGJlYy1iOTMyLWRhMTU3YjZjZTUzNyJ9.Uowxy1jsnYPTtkCt2G75lUZDshmW5MJ9yVQp9xcuFf4ZzUKQL4WZaOV2Q0a_bXo4Z9K0Ld8yXnV_hz3aPQkQBQ";

const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN
});

async function main() {
  console.log("Setting up Turso cloud tables...");

  // 1. Table for user translation requests
  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_name TEXT NOT NULL,
      steam_app_id TEXT DEFAULT '',
      is_owned INTEGER DEFAULT 0,
      user_id TEXT DEFAULT '',
      user_name TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log("✅ admin_requests table ready");

  // 2. Table for tracking real cloud installations per user/device
  await db.execute(`
    CREATE TABLE IF NOT EXISTS game_installations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT NOT NULL,
      installed_patch_id TEXT DEFAULT '',
      install_path TEXT DEFAULT '',
      installed_files TEXT DEFAULT '[]',
      installed_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log("✅ game_installations table ready");

  // 3. Table for app updates config & whats_new announcements
  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log("✅ app_config table ready");

  // Seed default what's new and app update info if empty
  await db.execute({
    sql: `INSERT OR IGNORE INTO app_config (key, value) VALUES (?, ?)`,
    args: ['latest_version', '1.0.85']
  });

  await db.execute({
    sql: `INSERT OR IGNORE INTO app_config (key, value) VALUES (?, ?)`,
    args: ['whats_new_title', 'تحديث معراب السحابي الجديد']
  });

  await db.execute({
    sql: `INSERT OR IGNORE INTO app_config (key, value) VALUES (?, ?)`,
    args: ['whats_new_body', 'تم ربط كامل نظام التطبيق بسحابة معراب وقاعدة بيانات Turso السحابية، مع تحسين استقرار تحميل وتثبيت التعريبات.']
  });

  const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("Current tables in Turso:", tables.rows.map(r => r.name));
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
