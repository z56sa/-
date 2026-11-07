const { app, safeStorage } = require("electron");
const fs = require("fs");

app.whenReady().then(() => {
  const p = "C:\\Users\\PCD\\AppData\\Roaming\\Polar Translation\\polar-session.json";
  if (fs.existsSync(p)) {
    const d = JSON.parse(fs.readFileSync(p, "utf8"));
    if (d.enc) {
      try {
        const dec = safeStorage.decryptString(Buffer.from(d.enc, "base64"));
        console.log("SUCCESS_DECRYPT_LEN:" + dec.length);
        fs.writeFileSync("user_token.json", dec, "utf8");
      } catch (e) {
        console.log("DECRYPT_ERROR:" + e.message);
      }
    }
  }
  app.quit();
});
