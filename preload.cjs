// Preload: the ONLY bridge between the isolated renderer and the main process.
// Runs in a sandboxed context (contextIsolation: true, nodeIntegration: false,
// sandbox: true), so it can reach nothing but `electron`'s contextBridge/ipcRenderer.
// Everything exposed here is a fixed, named action; the page cannot reach Node,
// the file system, child processes or arbitrary IPC channels.
"use strict";

const { contextBridge, ipcRenderer } = require("electron");

function subscribe(channel, handler) {
  const listener = (_event, payload) => handler(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

const api = {
  auth: {
    check: () => ipcRenderer.invoke("auth:check"),
    startLogin: () => ipcRenderer.invoke("auth:start-login"),
    logout: () => ipcRenderer.invoke("auth:logout"),
    stats: () => ipcRenderer.invoke("auth:stats"),
    onChanged: (handler) => subscribe("auth:changed", handler),
  },
  window: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    toggleMaximize: () => ipcRenderer.invoke("window:toggle-maximize"),
    close: () => ipcRenderer.invoke("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
    onMaximized: (handler) => subscribe("window:maximized", handler),
  },
  updater: {
    getState: () => ipcRenderer.invoke("desktop-updater:get-state"),
    checkNow: () => ipcRenderer.invoke("desktop-updater:check-now"),
    restartAndInstall: () => ipcRenderer.invoke("desktop-updater:restart-and-install"),
    onEvent: (handler) => subscribe("desktop-updater:event", handler),
  },
  appearance: {
    // the name of the theme on screen, for the consent window's colours (main maps it to a fixed palette)
    setTheme: (theme) => ipcRenderer.invoke("appearance:set-theme", String(theme)),
  },
  content: {
    fetchJson: (url) => ipcRenderer.invoke("content:fetch-json", String(url)),
    steamDetails: (appId) => ipcRenderer.invoke("content:steam-details", String(appId)),
    artDrafts: () => ipcRenderer.invoke("content:art-drafts"),
    steamArt: (appIds) => ipcRenderer.invoke("content:steam-art", Array.isArray(appIds) ? appIds.map(String) : []),
    requestTranslation: (game, join) => ipcRenderer.invoke("content:request-translation", String(game), join === true),
    requestOwnedGame: (game, appId, join) =>
      ipcRenderer.invoke("content:request-owned-game", String(game), appId == null ? "" : String(appId), join === true),
    getPoll: () => ipcRenderer.invoke("content:poll"),
    heartbeat: () => ipcRenderer.invoke("content:heartbeat"),
    updatesSeen: (at) => ipcRenderer.invoke("content:updates-seen", at == null ? "" : String(at)),
    translationRemoved: (gameId, translationId) =>
      ipcRenderer.invoke("content:translation-removed", String(gameId), String(translationId)),
    votePoll: (pollId, option) => ipcRenderer.invoke("content:poll-vote", String(pollId), Number(option)),
    reportProblem: (report) =>
      ipcRenderer.invoke("content:report", {
        gameId: String(report?.gameId ?? ""),
        gameUpdated: String(report?.gameUpdated ?? "unsure"),
        issues: Array.isArray(report?.issues) ? report.issues.map(String) : [],
        where: Array.isArray(report?.where) ? report.where.map(String) : [],
        note: String(report?.note ?? ""),
      }),
    getWhatsNewSeen: () => ipcRenderer.invoke("content:get-whats-new-seen"),
    setWhatsNewSeen: (version) => ipcRenderer.invoke("content:set-whats-new-seen", String(version)),
  },
  admin: {
    addTranslation: (data) => ipcRenderer.invoke("admin:add-translation", data),
    deleteTranslation: (gameId, translationId) => ipcRenderer.invoke("admin:delete-translation", String(gameId), translationId ? String(translationId) : ""),
    createPoll: (poll) => ipcRenderer.invoke("admin:create-poll", poll),
    getReports: () => ipcRenderer.invoke("admin:get-reports"),
    getRequests: () => ipcRenderer.invoke("admin:get-requests"),
    runRea: (data) => ipcRenderer.invoke("admin:run-rea", data),
    deleteRequest: (id) => ipcRenderer.invoke("admin:delete-request", id),
    deleteReport: (id) => ipcRenderer.invoke("admin:delete-report", id),
  },
  installer: {
    listInstalledGames: () => ipcRenderer.invoke("installer:list-installed-games"),
    myGamesDir: () => ipcRenderer.invoke("installer:my-games-dir"),
    detectGamePath: (game) => ipcRenderer.invoke("installer:detect-game-path", game),
    launchGame: (game, installPath, installedFiles) =>
      ipcRenderer.invoke("installer:launch-game", game, installPath, installedFiles),
    verifyInstallation: (installPath, installedFiles) =>
      ipcRenderer.invoke("installer:verify-installation", installPath, installedFiles),
    install: (jobId, game, translation, targetPath) =>
      ipcRenderer.invoke("installer:install", jobId, game, translation, targetPath),
    uninstall: (jobId, targetPath, installedFiles) =>
      ipcRenderer.invoke("installer:uninstall", jobId, targetPath, installedFiles),
    onProgress: (handler) => subscribe("installer:progress", handler),
    setLocale: (locale) => ipcRenderer.invoke("installer:set-locale", String(locale)),
    onConfirmRequest: (handler) => subscribe("installer:confirm-request", handler),
    answerConfirm: (requestId, allow) =>
      ipcRenderer.invoke("installer:confirm-answer", String(requestId), Boolean(allow)),
  },
};

contextBridge.exposeInMainWorld("maarab", api);



