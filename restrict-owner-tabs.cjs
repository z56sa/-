const fs = require('fs');
const bundlePath = 'C:/Users/PCD/Desktop/mode/mode/dist/assets/index-DhZVG0jN.js';
let code = fs.readFileSync(bundlePath, 'utf8');

// 1. In OwnerAdminPanel, get user & isSpecial from Gc()
// Owner check: const isOwner = Boolean(user && (user.id === "1178342841882267744" || roles?.includes("1552358330825965692") || isSpecial));
const oldFuncHead = 'function OwnerAdminPanel(){\n  const [tab, setTab] = h.useState("reports");';
const newFuncHead = `function OwnerAdminPanel(){
  const { user, roles, isSpecial } = Gc();
  const isOwner = Boolean(user && (String(user.id) === "1178342841882267744" || (Array.isArray(roles) && roles.includes("1552358330825965692")) || isSpecial));
  const [tab, setTab] = h.useState("reports");`;

if (code.includes(oldFuncHead)) {
  code = code.replace(oldFuncHead, newFuncHead);
  console.log("✅ Added isOwner check to OwnerAdminPanel");
} else {
  console.log("ℹ️ oldFuncHead not found or already modified");
}

// 2. Filter tabs: "rea" and "tools" appear ONLY if isOwner === true
const oldTabsDef = `  const tabs = [
    { id: "reports", label: "صندوق البلاغات", badge: reportsList.length },
    { id: "add", label: "إضافة تعريب" },
    { id: "games", label: "حذف تعريب" },
    { id: "poll", label: "إنشاء تصويت" },
    { id: "rea", label: "أداة REA" },
    { id: "tools", label: "أدوات النظام" }
  ];`;

const newTabsDef = `  const allTabs = [
    { id: "reports", label: "صندوق البلاغات", badge: reportsList.length },
    { id: "add", label: "إضافة تعريب" },
    { id: "games", label: "حذف تعريب" },
    { id: "poll", label: "إنشاء تصويت" },
    ...(isOwner ? [
      { id: "rea", label: "🔬 أداة REA (المالك)" },
      { id: "tools", label: "⚙️ أدوات النظام (المالك)" }
    ] : [])
  ];
  const tabs = allTabs;`;

if (code.includes(oldTabsDef)) {
  code = code.replace(oldTabsDef, newTabsDef);
  console.log("✅ Made REA and أدوات النظام tabs visible ONLY to owner");
} else {
  console.log("ℹ️ oldTabsDef not found or already modified");
}

// 3. Guard the render sections of REA and TOOLS as well:
// tab === "rea" && isOwner && o.jsxs(...)
// tab === "tools" && isOwner && o.jsxs(...)
code = code.replace('tab === "rea" && o.jsxs(', 'tab === "rea" && isOwner && o.jsxs(');
code = code.replace('tab === "tools" && o.jsxs(', 'tab === "tools" && isOwner && o.jsxs(');

fs.writeFileSync(bundlePath, code, 'utf8');
console.log("🎉 Owner restriction applied successfully!");
