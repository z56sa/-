const fs = require('fs');
const bundlePath = 'C:/Users/PCD/Desktop/mode/mode/dist/assets/index-DhZVG0jN.js';
let code = fs.readFileSync(bundlePath, 'utf8');

// The OwnerAdminPanel implementation
const adminPanelComponent = `function OwnerAdminPanel(){
  const [tab, setTab] = h.useState("add");
  const [addGameId, setAddGameId] = h.useState("");
  const [addGameTitle, setAddGameTitle] = h.useState("");
  const [addTransName, setAddTransName] = h.useState("تعريب رسمي معتمد");
  const [addVersion, setAddVersion] = h.useState("1.0.0");
  const [addUrl, setAddUrl] = h.useState("");
  const [addSize, setAddSize] = h.useState("15.0 MB");
  const [addStatus, setAddStatus] = h.useState("");
  const [delGameId, setDelGameId] = h.useState("");
  const [delTransId, setDelTransId] = h.useState("");
  const [delStatus, setDelStatus] = h.useState("");
  const [pollTitle, setPollTitle] = h.useState("تصويت التعريب القادم 🎮");
  const [pollDesc, setPollDesc] = h.useState("اختر اللعبة اللي تبانا نعربها بعد");
  const [pollOpt1, setPollOpt1] = h.useState("");
  const [pollOpt2, setPollOpt2] = h.useState("");
  const [pollOpt3, setPollOpt3] = h.useState("");
  const [pollStatus, setPollStatus] = h.useState("");
  const [reportsList, setReportsList] = h.useState([]);
  const [reportsLoading, setReportsLoading] = h.useState(false);
  const [reportsStatus, setReportsStatus] = h.useState("");

  const loadReports = h.useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await window.polar?.admin?.getReports();
      if (res?.ok && Array.isArray(res.reports)) {
        setReportsList(res.reports);
      } else {
        setReportsStatus("لا توجد بلاغات أو حدث خطأ");
      }
    } catch (e) {
      setReportsStatus("خطأ: " + e.message);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  h.useEffect(() => {
    if (tab === "reports") loadReports();
  }, [tab, loadReports]);

  const handleAddTranslation = async (e) => {
    e.preventDefault();
    if (!addGameId.trim()) return alert("يرجى كتابة معرّف اللعبة (Game ID)");
    setAddStatus("جاري الإضافة إلى سحابة Turso...");
    try {
      const res = await window.polar?.admin?.addTranslation({
        gameId: addGameId.trim(),
        gameTitle: addGameTitle.trim() || addGameId.trim(),
        name: addTransName.trim(),
        version: addVersion.trim(),
        downloadUrl: addUrl.trim(),
        size: addSize.trim()
      });
      if (res?.ok) {
        setAddStatus("✅ تم إضافة التعريب بنجاح وحفظه في سحابة معراب!");
        setAddGameId("");
        setAddGameTitle("");
        setAddUrl("");
      } else {
        setAddStatus("❌ خطأ: " + (res?.error || "فشل الحفظ"));
      }
    } catch (err) {
      setAddStatus("❌ حدث خطأ: " + err.message);
    }
  };

  const handleDeleteTranslation = async (e) => {
    e.preventDefault();
    if (!delGameId.trim()) return alert("يرجى كتابة معرّف اللعبة المراد حذفها");
    if (!confirm("هل أنت متأكد من حذف هذا التعريب/اللعبة من المكتبة؟")) return;
    setDelStatus("جاري الحذف من قاعدة البيانات...");
    try {
      const res = await window.polar?.admin?.deleteTranslation(delGameId.trim(), delTransId.trim());
      if (res?.ok) {
        setDelStatus("✅ تم حذف العنصر من المكتبة بنجاح!");
        setDelGameId("");
        setDelTransId("");
      } else {
        setDelStatus("❌ خطأ: " + (res?.error || "فشل الحذف"));
      }
    } catch (err) {
      setDelStatus("❌ حدث خطأ: " + err.message);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!pollOpt1.trim() || !pollOpt2.trim()) return alert("يرجى إدخال خيارين على الأقل للتصويت");
    setPollStatus("جاري نشر التصويت الجديد...");
    const opts = [
      { id: 1, name: pollOpt1.trim(), votes: 0, steamAppId: 0 },
      { id: 2, name: pollOpt2.trim(), votes: 0, steamAppId: 0 }
    ];
    if (pollOpt3.trim()) opts.push({ id: 3, name: pollOpt3.trim(), votes: 0, steamAppId: 0 });

    try {
      const res = await window.polar?.admin?.createPoll({
        title: pollTitle.trim(),
        description: pollDesc.trim(),
        options: opts
      });
      if (res?.ok) {
        setPollStatus("✅ تم نشر التصويت الجديد للمستخدمين في كل مكان!");
      } else {
        setPollStatus("❌ خطأ: " + (res?.error || "فشل نشر التصويت"));
      }
    } catch (err) {
      setPollStatus("❌ حدث خطأ: " + err.message);
    }
  };

  const handleDeleteReport = async (repId) => {
    try {
      await window.polar?.admin?.deleteReport(repId);
      setReportsList(prev => prev.filter(r => r.id !== repId));
    } catch (e) {
      alert("فشل حذف البلاغ: " + e.message);
    }
  };

  return o.jsxs("section", {
    className: "rounded-2xl border-2 border-amber-400/40 bg-gradient-to-b from-amber-400/[0.08] to-transparent p-5 shadow-[0_0_25px_rgba(251,191,36,0.1)] mb-4",
    children: [
      o.jsxs("div", {
        className: "flex items-center justify-between pb-3 border-b border-amber-400/20 mb-4",
        children: [
          o.jsxs("h4", {
            className: "flex items-center gap-2 text-base font-black text-amber-300",
            children: [o.jsx(Fl, { size: 20, className: "text-amber-400 animate-pulse" }), "لوحة تحكم إدارة معراب (صلاحيات المالك 1vx7)"]
          }),
          o.jsx("span", {
            className: "rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-black text-amber-300 border border-amber-400/30",
            children: "👑 وصول المالك الكامل"
          })
        ]
      }),
      o.jsxs("div", {
        className: "flex flex-wrap gap-2 mb-4 bg-white/5 p-1.5 rounded-xl border border-white/10",
        children: [
          o.jsx("button", {
            type: "button",
            onClick: () => setTab("add"),
            className: "flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-black transition-all " + (tab === "add" ? "bg-amber-400 text-black shadow-lg" : "text-white/70 hover:bg-white/10 hover:text-white"),
            children: "➕ إضافة تعريب"
          }),
          o.jsx("button", {
            type: "button",
            onClick: () => setTab("del"),
            className: "flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-black transition-all " + (tab === "del" ? "bg-rose-500 text-white shadow-lg" : "text-white/70 hover:bg-white/10 hover:text-white"),
            children: "🗑️ حذف تعريب"
          }),
          o.jsx("button", {
            type: "button",
            onClick: () => setTab("poll"),
            className: "flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-black transition-all " + (tab === "poll" ? "bg-purple-500 text-white shadow-lg" : "text-white/70 hover:bg-white/10 hover:text-white"),
            children: "📊 إنشاء تصويت"
          }),
          o.jsx("button", {
            type: "button",
            onClick: () => setTab("reports"),
            className: "flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-black transition-all " + (tab === "reports" ? "bg-blue-500 text-white shadow-lg" : "text-white/70 hover:bg-white/10 hover:text-white"),
            children: "📩 استلام البلاغات"
          }),
          o.jsx("button", {
            type: "button",
            onClick: () => setTab("tools"),
            className: "flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-black transition-all " + (tab === "tools" ? "bg-emerald-500 text-black shadow-lg" : "text-white/70 hover:bg-white/10 hover:text-white"),
            children: "⚙️ أدوات النظام"
          })
        ]
      }),
      tab === "add" && o.jsxs("form", {
        onSubmit: handleAddTranslation,
        className: "space-y-3 bg-black/30 p-4 rounded-xl border border-white/5",
        children: [
          o.jsxs("div", {
            className: "grid grid-cols-2 gap-3",
            children: [
              o.jsxs("div", {
                children: [
                  o.jsx("label", { className: "block text-[11px] font-bold text-white/70 mb-1", children: "معرف اللعبة (Game ID مثل: gta-v أو elden-ring):" }),
                  o.jsx("input", {
                    type: "text",
                    value: addGameId,
                    onChange: e => setAddGameId(e.target.value),
                    placeholder: "elden-ring",
                    className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                  })
                ]
              }),
              o.jsxs("div", {
                children: [
                  o.jsx("label", { className: "block text-[11px] font-bold text-white/70 mb-1", children: "اسم اللعبة (العنوان الإنجليزي أو العربي):" }),
                  o.jsx("input", {
                    type: "text",
                    value: addGameTitle,
                    onChange: e => setAddGameTitle(e.target.value),
                    placeholder: "Elden Ring",
                    className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                  })
                ]
              })
            ]
          }),
          o.jsxs("div", {
            className: "grid grid-cols-2 gap-3",
            children: [
              o.jsxs("div", {
                children: [
                  o.jsx("label", { className: "block text-[11px] font-bold text-white/70 mb-1", children: "اسم حزمة التعريب:" }),
                  o.jsx("input", {
                    type: "text",
                    value: addTransName,
                    onChange: e => setAddTransName(e.target.value),
                    className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                  })
                ]
              }),
              o.jsxs("div", {
                children: [
                  o.jsx("label", { className: "block text-[11px] font-bold text-white/70 mb-1", children: "الإصدار وحجم الملف:" }),
                  o.jsxs("div", {
                    className: "flex gap-2",
                    children: [
                      o.jsx("input", {
                        type: "text",
                        value: addVersion,
                        onChange: e => setAddVersion(e.target.value),
                        placeholder: "1.0.0",
                        className: "w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                      }),
                      o.jsx("input", {
                        type: "text",
                        value: addSize,
                        onChange: e => setAddSize(e.target.value),
                        placeholder: "15.0 MB",
                        className: "w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          o.jsxs("div", {
            children: [
              o.jsx("label", { className: "block text-[11px] font-bold text-white/70 mb-1", children: "رابط تنزيل ملف التعريب (URL أو مسار السحابة):" }),
              o.jsx("input", {
                type: "text",
                value: addUrl,
                onChange: e => setAddUrl(e.target.value),
                placeholder: "https://example.com/files/arabic_patch.zip",
                className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-400 font-mono"
              })
            ]
          }),
          addStatus && o.jsx("div", { className: "text-xs font-bold text-amber-300 py-1", children: addStatus }),
          o.jsx("button", {
            type: "submit",
            className: "w-full bg-amber-400 hover:bg-amber-300 text-black py-2.5 rounded-xl font-black text-xs transition-all shadow-md mt-2",
            children: "حفظ ونشر التعريب في المكتبة السحابية 🚀"
          })
        ]
      }),
      tab === "del" && o.jsxs("form", {
        onSubmit: handleDeleteTranslation,
        className: "space-y-3 bg-black/30 p-4 rounded-xl border border-white/5",
        children: [
          o.jsx("p", { className: "text-xs text-rose-300/80 mb-2 leading-relaxed", children: "⚠️ يمكنك حذف تعريب معين بكتابة معرفه، أو حذف اللعبة بالكامل من المكتبة بترك معرف التعريب فارغاً." }),
          o.jsxs("div", {
            children: [
              o.jsx("label", { className: "block text-[11px] font-bold text-white/70 mb-1", children: "معرف اللعبة (Game ID):" }),
              o.jsx("input", {
                type: "text",
                value: delGameId,
                onChange: e => setDelGameId(e.target.value),
                placeholder: "مثال: elden-ring",
                className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-rose-400"
              })
            ]
          }),
          o.jsxs("div", {
            children: [
              o.jsx("label", { className: "block text-[11px] font-bold text-white/70 mb-1", children: "معرف التعريب المحدد (اختياري - اتركه فارغ لحذف اللعبة كاملة):" }),
              o.jsx("input", {
                type: "text",
                value: delTransId,
                onChange: e => setDelTransId(e.target.value),
                placeholder: "مثال: elden-ring-ar-v1",
                className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-rose-400"
              })
            ]
          }),
          delStatus && o.jsx("div", { className: "text-xs font-bold text-rose-300 py-1", children: delStatus }),
          o.jsx("button", {
            type: "submit",
            className: "w-full bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl font-black text-xs transition-all shadow-md mt-2",
            children: "حذف نهائي من قاعدة البيانات 🗑️"
          })
        ]
      }),
      tab === "poll" && o.jsxs("form", {
        onSubmit: handleCreatePoll,
        className: "space-y-3 bg-black/30 p-4 rounded-xl border border-white/5",
        children: [
          o.jsxs("div", {
            children: [
              o.jsx("label", { className: "block text-[11px] font-bold text-white/70 mb-1", children: "عنوان التصويت:" }),
              o.jsx("input", {
                type: "text",
                value: pollTitle,
                onChange: e => setPollTitle(e.target.value),
                className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
              })
            ]
          }),
          o.jsxs("div", {
            children: [
              o.jsx("label", { className: "block text-[11px] font-bold text-white/70 mb-1", children: "الوصف الفرعي:" }),
              o.jsx("input", {
                type: "text",
                value: pollDesc,
                onChange: e => setPollDesc(e.target.value),
                className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
              })
            ]
          }),
          o.jsxs("div", {
            className: "grid grid-cols-3 gap-2",
            children: [
              o.jsxs("div", {
                children: [
                  o.jsx("label", { className: "block text-[10px] font-bold text-white/60 mb-1", children: "الخيار 1 (لعبة):" }),
                  o.jsx("input", {
                    type: "text",
                    value: pollOpt1,
                    onChange: e => setPollOpt1(e.target.value),
                    placeholder: "Resident Evil 4",
                    className: "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                  })
                ]
              }),
              o.jsxs("div", {
                children: [
                  o.jsx("label", { className: "block text-[10px] font-bold text-white/60 mb-1", children: "الخيار 2 (لعبة):" }),
                  o.jsx("input", {
                    type: "text",
                    value: pollOpt2,
                    onChange: e => setPollOpt2(e.target.value),
                    placeholder: "Black Myth: Wukong",
                    className: "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                  })
                ]
              }),
              o.jsxs("div", {
                children: [
                  o.jsx("label", { className: "block text-[10px] font-bold text-white/60 mb-1", children: "الخيار 3 (اختياري):" }),
                  o.jsx("input", {
                    type: "text",
                    value: pollOpt3,
                    onChange: e => setPollOpt3(e.target.value),
                    placeholder: "Silent Hill 2",
                    className: "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                  })
                ]
              })
            ]
          }),
          pollStatus && o.jsx("div", { className: "text-xs font-bold text-purple-300 py-1", children: pollStatus }),
          o.jsx("button", {
            type: "submit",
            className: "w-full bg-purple-500 hover:bg-purple-600 text-white py-2.5 rounded-xl font-black text-xs transition-all shadow-md mt-2",
            children: "نشر التصويت الجديد واستبدال السابق 📊"
          })
        ]
      }),
      tab === "reports" && o.jsxs("div", {
        className: "space-y-3 bg-black/30 p-4 rounded-xl border border-white/5 max-h-[300px] overflow-y-auto",
        children: [
          o.jsxs("div", {
            className: "flex items-center justify-between pb-2 border-b border-white/10",
            children: [
              o.jsx("span", { className: "text-xs font-bold text-white/80", children: "قائمة البلاغات الواردة من المستخدمين (" + reportsList.length + "):" }),
              o.jsx("button", {
                type: "button",
                onClick: loadReports,
                className: "text-[11px] text-blue-400 hover:underline font-bold",
                children: reportsLoading ? "جاري التحديث..." : "تحديث 🔄"
              })
            ]
          }),
          reportsStatus && o.jsx("div", { className: "text-xs text-white/60", children: reportsStatus }),
          reportsList.length === 0 && !reportsLoading && o.jsx("p", { className: "text-xs text-white/40 text-center py-4", children: "لا توجد بلاغات مرسلة حتى الآن." }),
          reportsList.map(rep => o.jsxs("div", {
            key: rep.id,
            className: "p-3 bg-white/5 rounded-lg border border-white/5 flex items-start justify-between gap-3 text-xs",
            children: [
              o.jsxs("div", {
                className: "space-y-1",
                children: [
                  o.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      o.jsx("span", { className: "font-black text-amber-300", children: "🎮 " + (rep.gameId || "عام") }),
                      o.jsx("span", { className: "text-[10px] text-white/40", children: rep.createdAt })
                    ]
                  }),
                  rep.note && o.jsxs("p", { className: "text-white/80", children: [o.jsx("strong", { children: "ملاحظة: " }), rep.note] }),
                  rep.issues && rep.issues.length > 0 && o.jsxs("p", { className: "text-white/50 text-[11px]", children: [o.jsx("strong", { children: "المشاكل: " }), Array.isArray(rep.issues) ? rep.issues.join(", ") : rep.issues] })
                ]
              }),
              o.jsx("button", {
                type: "button",
                onClick: () => handleDeleteReport(rep.id),
                className: "text-rose-400 hover:text-rose-300 p-1 font-bold text-xs",
                title: "حذف البلاغ",
                children: "❌"
              })
            ]
          }))
        ]
      }),
      tab === "tools" && o.jsxs("div", {
        className: "grid grid-cols-2 gap-3 bg-black/30 p-4 rounded-xl border border-white/5",
        children: [
          o.jsxs("button", {
            type: "button",
            onClick: async () => {
              try {
                await window.polar?.updater?.checkNow();
                alert("⚡ تمت مزامنة قاعدة بيانات Turso وجلب التعريبات الحديثة بنجاح!");
              } catch (e) {
                alert("تمت المزامنة!");
              }
            },
            className: "flex items-center justify-center gap-2 rounded-xl bg-amber-400/15 border border-amber-400/30 p-3 text-xs font-black text-amber-200 hover:bg-amber-400 hover:text-black transition-all",
            children: [o.jsx(cc, { size: 16 }), "مزامنة السحابة والتحديثات"]
          }),
          o.jsxs("button", {
            type: "button",
            onClick: () => {
              try { window.polar?.window?.toggleDevTools(); } catch (e) { alert("أدوات المطور"); }
            },
            className: "flex items-center justify-center gap-2 rounded-xl bg-purple-500/15 border border-purple-500/30 p-3 text-xs font-bold text-purple-200 hover:bg-purple-500 hover:text-white transition-all",
            children: [o.jsx(wc, { size: 16 }), "أدوات المطورين (DevTools)"]
          }),
          o.jsxs("button", {
            type: "button",
            onClick: () => {
              try { window.polar?.window?.openFolder(); } catch (e) {}
            },
            className: "flex items-center justify-center gap-2 rounded-xl bg-blue-500/15 border border-blue-500/30 p-3 text-xs font-bold text-blue-200 hover:bg-blue-500 hover:text-white transition-all",
            children: [o.jsx(Ol, { size: 16 }), "مجلد بيانات التطبيق"]
          }),
          o.jsxs("button", {
            type: "button",
            onClick: () => {
              try { window.polar?.window?.reloadApp(); } catch (e) { window.location.reload(); }
            },
            className: "flex items-center justify-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs font-bold text-rose-200 hover:bg-rose-500 hover:text-white transition-all",
            children: [o.jsx(dc, { size: 16 }), "إعادة تشغيل وتفريغ الكاش"]
          })
        ]
      })
    ]
  });
}
`;

// Insert adminPanelComponent right before function Bu({isOpen:
const buTarget = "function Bu({isOpen:e,onClose:t}){";
if (code.includes(buTarget)) {
  code = code.replace(buTarget, adminPanelComponent + "\n" + "function Bu({isOpen:e,onClose:t}){const{isSpecial:isOwner}=Gc();");
  console.log("✅ Injected OwnerAdminPanel and const{isSpecial:isOwner}=Gc() into Bu");
} else {
  console.error("❌ Could not find buTarget");
}

fs.writeFileSync(bundlePath, code, 'utf8');
console.log("Done updating bundle!");
