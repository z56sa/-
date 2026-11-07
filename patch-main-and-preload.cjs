/**
 * patch-main-and-preload.cjs
 * Adds owner admin IPCs to main.cjs and preload.cjs
 */
"use strict";

const fs = require("fs");
const path = require("path");

const mainPath = path.join(__dirname, "main.cjs");
const preloadPath = path.join(__dirname, "preload.cjs");

let mainCode = fs.readFileSync(mainPath, "utf8");
let preloadCode = fs.readFileSync(preloadPath, "utf8");

// 1. In main.cjs, update content:report handler to save to admin_reports table in Turso
const oldReportHandler = 'ipcMain.handle("content:report", async () => ({ ok: true }));';
const newReportHandler = `ipcMain.handle("content:report", async (_e, report) => {
  try {
    const db = getTurso();
    if (db) {
      await db.execute({
        sql: "INSERT INTO admin_reports (game_id, game_updated, issues, where_found, note) VALUES (?, ?, ?, ?, ?)",
        args: [
          String(report?.gameId || ""),
          String(report?.gameUpdated || "unsure"),
          JSON.stringify(report?.issues || []),
          JSON.stringify(report?.where || []),
          String(report?.note || "")
        ]
      });
      console.log("[Turso] Saved report for game:", report?.gameId);
    }
  } catch (err) {
    console.error("[Turso] Error saving report:", err.message);
  }
  return { ok: true };
});`;

if (mainCode.includes(oldReportHandler)) {
  mainCode = mainCode.replace(oldReportHandler, newReportHandler);
  console.log("✅ Replaced content:report handler");
} else {
  console.log("ℹ️ content:report handler already updated or different");
}

// 2. Add admin CRUD IPC handlers in main.cjs after admin:open-folder
const adminIpcBlock = `
// ─── Owner Admin IPCs (CRUD for Translations, Polls, Reports) ─────────────────
ipcMain.handle("admin:add-translation", async (_e, data) => {
  try {
    const db = getTurso();
    if (!db) return { ok: false, error: "Database not connected" };
    
    // Fetch current content
    const res = await db.execute("SELECT data FROM content WHERE id = 1");
    if (res.rows.length === 0) return { ok: false, error: "Content table empty" };
    
    const content = JSON.parse(res.rows[0].data);
    const gameId = String(data.gameId || "").trim();
    if (!gameId) return { ok: false, error: "Game ID is required" };
    
    let game = content.games.find(g => g.id.toLowerCase() === gameId.toLowerCase());
    const newTrans = {
      id: String(data.translationId || (gameId + "-ar-" + Date.now())).trim(),
      name: String(data.name || "تعريب عربي رسمي"),
      version: String(data.version || "1.0.0"),
      type: "community",
      description: String(data.description || "ملف التعريب الرسمي المعتمد من معراب"),
      releaseDate: new Date().toISOString().slice(0, 10),
      changelog: ["إضافة بواسطة إدارة معراب"],
      size: String(data.size || "10.0 MB"),
      author: String(data.author || "إدارة معراب"),
      assetKey: String(data.downloadUrl || data.assetKey || ""),
      archiveFormat: "zip"
    };

    if (game) {
      if (!Array.isArray(game.translations)) game.translations = [];
      game.translations.unshift(newTrans);
    } else {
      // Create new game entry
      game = {
        id: gameId,
        title: String(data.gameTitle || data.gameId),
        category: "Action",
        rating: 5,
        description: String(data.gameTitle || data.gameId) + " - معرب بالكامل",
        bannerImage: String(data.bannerImage || "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/0/header.jpg"),
        thumbnailImage: String(data.thumbnailImage || ""),
        executable: "",
        translations: [newTrans],
        descriptionAr: String(data.gameTitle || data.gameId) + " - معرب بالكامل",
        releaseYear: new Date().getFullYear(),
        posterImage: String(data.thumbnailImage || "")
      };
      content.games.unshift(game);
    }

    content.lastUpdated = new Date().toISOString();
    await db.execute({
      sql: "UPDATE content SET data = ?, updated = datetime('now') WHERE id = 1",
      args: [JSON.stringify(content)]
    });

    console.log("[Admin] Translation added for game:", gameId);
    return { ok: true, gameId, translationId: newTrans.id };
  } catch (err) {
    console.error("[Admin] add-translation error:", err);
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("admin:delete-translation", async (_e, gameId, translationId) => {
  try {
    const db = getTurso();
    if (!db) return { ok: false, error: "Database not connected" };
    
    const res = await db.execute("SELECT data FROM content WHERE id = 1");
    if (res.rows.length === 0) return { ok: false, error: "Content table empty" };
    
    const content = JSON.parse(res.rows[0].data);
    const targetGameId = String(gameId || "").trim().toLowerCase();
    const targetTransId = String(translationId || "").trim().toLowerCase();
    
    const game = content.games.find(g => g.id.toLowerCase() === targetGameId);
    if (!game) {
      // Maybe delete game entirely if user entered gameId to delete
      const initialCount = content.games.length;
      content.games = content.games.filter(g => g.id.toLowerCase() !== targetGameId);
      if (content.games.length < initialCount) {
        content.lastUpdated = new Date().toISOString();
        await db.execute({
          sql: "UPDATE content SET data = ?, updated = datetime('now') WHERE id = 1",
          args: [JSON.stringify(content)]
        });
        return { ok: true, message: "تم حذف اللعبة بالكامل من المكتبة" };
      }
      return { ok: false, error: "اللعبة غير موجودة" };
    }

    if (targetTransId) {
      game.translations = (game.translations || []).filter(t => t.id.toLowerCase() !== targetTransId);
    } else {
      // Remove first translation or remove entire game
      content.games = content.games.filter(g => g.id.toLowerCase() !== targetGameId);
    }

    content.lastUpdated = new Date().toISOString();
    await db.execute({
      sql: "UPDATE content SET data = ?, updated = datetime('now') WHERE id = 1",
      args: [JSON.stringify(content)]
    });

    console.log("[Admin] Translation/game deleted:", gameId, translationId);
    return { ok: true };
  } catch (err) {
    console.error("[Admin] delete-translation error:", err);
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("admin:create-poll", async (_e, pollData) => {
  try {
    const db = getTurso();
    if (!db) return { ok: false, error: "Database not connected" };
    
    // Deactivate previous active polls
    await db.execute("UPDATE admin_polls SET active = 0 WHERE active = 1");
    
    const pollId = "poll-" + Date.now();
    const title = String(pollData?.title || "تصويت التعريب القادم 🎮");
    const description = String(pollData?.description || "اختر اللعبة اللي نعربها بعد");
    const options = Array.isArray(pollData?.options) ? pollData.options : [
      { id: 1, name: "اللعبة 1", votes: 0, steamAppId: 0 },
      { id: 2, name: "اللعبة 2", votes: 0, steamAppId: 0 },
      { id: 3, name: "اللعبة 3", votes: 0, steamAppId: 0 }
    ];

    await db.execute({
      sql: "INSERT INTO admin_polls (id, title, description, options, active, created_at) VALUES (?, ?, ?, ?, 1, datetime('now'))",
      args: [pollId, title, description, JSON.stringify(options)]
    });

    console.log("[Admin] Created new poll:", pollId, title);
    return { ok: true, pollId };
  } catch (err) {
    console.error("[Admin] create-poll error:", err);
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("admin:get-reports", async () => {
  try {
    const db = getTurso();
    if (!db) return { ok: false, reports: [], error: "No DB" };
    
    const res = await db.execute("SELECT * FROM admin_reports ORDER BY created_at DESC LIMIT 50");
    const reports = res.rows.map(row => ({
      id: row.id,
      gameId: row.game_id,
      gameUpdated: row.game_updated,
      issues: (() => { try { return JSON.parse(row.issues); } catch(e) { return [row.issues]; } })(),
      where: (() => { try { return JSON.parse(row.where_found); } catch(e) { return [row.where_found]; } })(),
      note: row.note,
      createdAt: row.created_at
    }));

    return { ok: true, reports };
  } catch (err) {
    console.error("[Admin] get-reports error:", err);
    return { ok: false, reports: [], error: err.message };
  }
});

ipcMain.handle("admin:delete-report", async (_e, id) => {
  try {
    const db = getTurso();
    if (!db) return { ok: false, error: "No DB" };
    
    await db.execute({
      sql: "DELETE FROM admin_reports WHERE id = ?",
      args: [id]
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});
`;

if (!mainCode.includes('ipcMain.handle("admin:add-translation"')) {
  const openFolderIdx = mainCode.indexOf('ipcMain.handle("admin:open-folder"');
  if (openFolderIdx !== -1) {
    // Find closing brace of open-folder
    const endOfBlock = mainCode.indexOf("});", openFolderIdx) + 3;
    mainCode = mainCode.slice(0, endOfBlock) + "\n" + adminIpcBlock + mainCode.slice(endOfBlock);
    console.log("✅ Added admin CRUD handlers to main.cjs");
  } else {
    console.log("⚠️ Could not find admin:open-folder in main.cjs");
  }
} else {
  console.log("ℹ️ admin:add-translation already in main.cjs");
}

fs.writeFileSync(mainPath, mainCode, "utf8");

// 3. Update preload.cjs to expose admin methods under window.polar.admin and window.polar.window
const adminPreloadBlock = `  admin: {
    addTranslation: (data) => ipcRenderer.invoke("admin:add-translation", data),
    deleteTranslation: (gameId, translationId) => ipcRenderer.invoke("admin:delete-translation", String(gameId), translationId ? String(translationId) : ""),
    createPoll: (poll) => ipcRenderer.invoke("admin:create-poll", poll),
    getReports: () => ipcRenderer.invoke("admin:get-reports"),
    deleteReport: (id) => ipcRenderer.invoke("admin:delete-report", id),
  },`;

if (!preloadCode.includes("addTranslation:")) {
  // Insert before content: { or installer: {
  preloadCode = preloadCode.replace("  installer: {", adminPreloadBlock + "\n  installer: {");
  fs.writeFileSync(preloadPath, preloadCode, "utf8");
  console.log("✅ Added admin methods to preload.cjs");
} else {
  console.log("ℹ️ admin methods already in preload.cjs");
}

console.log("🎉 main.cjs & preload.cjs updated successfully!");
