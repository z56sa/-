const fs = require('fs');
const bundlePath = 'C:/Users/PCD/Desktop/mode/mode/dist/assets/index-DhZVG0jN.js';
let code = fs.readFileSync(bundlePath, 'utf8');

const startMarker = 'o.jsxs("section",{className:"rounded-2xl border border-amber-400/30';
const start = code.indexOf(startMarker);
const draftMarker = 'إضافة مسودة تعريب سريعة إلى المكتبة';
const draftIdx = code.indexOf(draftMarker, start);
console.log('start:', start, 'draftIdx:', draftIdx);

if (draftIdx !== -1) {
  const afterDraft = code.slice(draftIdx, draftIdx + 70);
  console.log('afterDraft JSON:', JSON.stringify(afterDraft));
}
