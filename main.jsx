import { useState } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALUE_STREAMS = [
  { id: "vs1", name: "HFC (Hard Folding Covers)", lines: ["Line 1", "Line 2", "Line 3", "Line 4"] },
  { id: "vs2", name: "HRC (Hard Rolling Cover)", lines: ["Line 1", "Line 2"] },
];

const ALL_LINES = VALUE_STREAMS.flatMap((vs) =>
  vs.lines.map((line) => ({ vsId: vs.id, vsName: vs.name, line }))
);

const EMPTY_LINE = {
  output: "",
  hpu: "",
  firstPassYield: "",
  headcount: "",
  orderAtPackout: "",
  remainingOnOrder: "",
  remainingOnRunSheet: "",
  changeovers: "",
};

const SHIFTS = ["Day", "Afternoon", "Night"];

function emptyFormData() {
  const lines = {};
  ALL_LINES.forEach(({ line }) => { lines[line] = { ...EMPTY_LINE }; });
  return {
    supervisor: "",
    date: new Date().toISOString().split("T")[0],
    shift: "Day",
    notes: "",
    lines,
  };
}

// ── CSV / Report Generation ───────────────────────────────────────────────────

function generateCSV(data, title) {
  const headers = [
    "Line", "Output", "HPU", "First Pass Yield (%)",
    "Headcount", "Order at Packout", "Remaining on Order",
    "Remaining on Run Sheet", "Changeovers",
  ];
  const rows = ALL_LINES.map(({ line }) => {
    const l = data.lines[line];
    return [
      line, l.output, l.hpu, l.firstPassYield,
      l.headcount, l.orderAtPackout, l.remainingOnOrder,
      l.remainingOnRunSheet, l.changeovers,
    ].join(",");
  });
  const meta = [
    `${title}`,
    `Supervisor:,${data.supervisor}`,
    `Date:,${data.date}`,
    `Shift:,${data.shift}`,
    `Notes:,${data.notes}`,
    "",
  ];
  return [...meta, headers.join(","), ...rows].join("\n");
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function generateEmailBody(data) {
  const lineRows = ALL_LINES.map(({ vsName, line }) => {
    const l = data.lines[line];
    return `  ${line} (${vsName})
    Output: ${l.output || "—"}  |  HPU: ${l.hpu || "—"}  |  FPY: ${l.firstPassYield || "—"}%
    Headcount: ${l.headcount || "—"}  |  Changeovers: ${l.changeovers || "—"}
    Order @ Packout: ${l.orderAtPackout || "—"}  |  Remaining on Order: ${l.remainingOnOrder || "—"}  |  Remaining on Run Sheet: ${l.remainingOnRunSheet || "—"}`;
  }).join("\n\n");

  return `End of Shift Report — ${data.shift} Shift | ${data.date}
Supervisor: ${data.supervisor}
${"─".repeat(60)}

LINE STATUS SUMMARY

${lineRows}

${"─".repeat(60)}
NOTES:
${data.notes || "None"}

${"─".repeat(60)}
Reports attached: EOS Report | Line Status | Local Report | Pre/Post Shift
Generated automatically by BAK EOS System`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function LineCard({ line, vsName, data, onChange }) {
  const fields = [
    { key: "output", label: "Output", type: "number" },
    { key: "hpu", label: "HPU", type: "number" },
    { key: "firstPassYield", label: "FPY %", type: "number" },
    { key: "headcount", label: "Headcount", type: "number" },
    { key: "orderAtPackout", label: "Order @ Packout", type: "text" },
    { key: "remainingOnOrder", label: "Remaining on Order", type: "number" },
    { key: "remainingOnRunSheet", label: "Remaining on Run Sheet", type: "number" },
    { key: "changeovers", label: "Changeovers", type: "number" },
  ];

  return (
    <div style={{
      background: "#1a1f2e",
      border: "1px solid #2a3347",
      borderLeft: "3px solid #FFB800",
      borderRadius: "8px",
      padding: "20px",
      marginBottom: "16px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "16px",
      }}>
        <div>
          <div style={{ color: "#FFB800", fontWeight: "700", fontSize: "15px", letterSpacing: "0.05em" }}>
            {line.toUpperCase()}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>{vsName}</div>
        </div>
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: data.output ? "#22c55e" : "#374151",
        }} />
      </div>
      <div className="line-fields-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "12px",
      }}>
        {fields.map(({ key, label, type }) => (
          <div key={key}>
            <label style={{
              display: "block", fontSize: "12px", color: "#94a3b8",
              marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase",
              fontWeight: "500",
            }}>{label}</label>
            <input
              type={type}
              value={data[key]}
              onChange={(e) => onChange(line, key, e.target.value)}
              style={{
                width: "100%", background: "#0f1319", border: "1px solid #2a3347",
                borderRadius: "4px", padding: "8px 10px", color: "#e2e8f0",
                fontSize: "14px", outline: "none", boxSizing: "border-box",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function EOSReportApp() {
  const [formData, setFormData] = useState(emptyFormData());
  const [emailCopied, setEmailCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("entry");

  const handleMeta = (key, value) => setFormData((p) => ({ ...p, [key]: value }));

  const handleLine = (line, field, value) =>
    setFormData((p) => ({
      ...p,
      lines: { ...p.lines, [line]: { ...p.lines[line], [field]: value } },
    }));

  const handleDownloadAll = () => {
    const reports = [
      { title: "End of Shift Report", suffix: "EOS" },
      { title: "Line Status Report", suffix: "LineStatus" },
      { title: "Local Report", suffix: "Local" },
      { title: "Pre-Post Shift Report", suffix: "PrePost" },
    ];
    reports.forEach(({ title, suffix }) => {
      const csv = generateCSV(formData, title);
      downloadCSV(csv, `BAK_${suffix}_${formData.date}_${formData.shift}.csv`);
    });
  };

  const emailBody = generateEmailBody(formData);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailBody);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm("Reset all fields?")) setFormData(emptyFormData());
  };

  const filledLines = ALL_LINES.filter(({ line }) => formData.lines[line].output).length;
  const progress = Math.round((filledLines / ALL_LINES.length) * 100);

  const inputStyle = {
    background: "#1a1f2e", border: "1px solid #2a3347",
    borderRadius: "6px", padding: "10px 14px", color: "#e2e8f0",
    fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box",
    fontFamily: "'JetBrains Mono', monospace",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0d14", color: "#e2e8f0",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "#0f1319", borderBottom: "1px solid #1e2636",
        padding: "0 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: "64px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            background: "#FFB800", color: "#000", fontWeight: "900",
            fontSize: "13px", padding: "4px 10px", borderRadius: "4px",
            letterSpacing: "0.1em",
          }}>BAK</div>
          <span style={{ color: "#4a5568", fontSize: "13px" }}>|</span>
          <span style={{ color: "#94a3b8", fontSize: "14px", letterSpacing: "0.05em" }}>
            END OF SHIFT SYSTEM
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            fontSize: "12px", color: "#94a3b8",
            background: "#1a1f2e", padding: "4px 12px", borderRadius: "20px",
            border: "1px solid #2a3347",
          }}>
            {filledLines}/{ALL_LINES.length} lines entered
          </div>
          <div style={{
            width: "120px", height: "8px", background: "#1a1f2e",
            borderRadius: "4px", overflow: "hidden",
          }}>
            <div style={{
              width: `${progress}%`, height: "100%",
              background: progress === 100 ? "#22c55e" : "#FFB800",
              transition: "width 0.3s",
            }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: "#0f1319", borderBottom: "1px solid #1e2636",
        padding: "0 32px", display: "flex", gap: "0",
      }}>
        {["entry", "email"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "14px 20px", fontSize: "13px", letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: activeTab === tab ? "#FFB800" : "#4a5568",
              borderBottom: activeTab === tab ? "2px solid #FFB800" : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tab === "entry" ? "Data Entry" : "Email Preview"}
          </button>
        ))}
      </div>

      <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>

        {activeTab === "entry" && (
          <>
            {/* Meta fields */}
            <div style={{
              fontSize: "12px", color: "#64748b", letterSpacing: "0.12em",
              textTransform: "uppercase", marginBottom: "12px", fontWeight: "600",
            }}>
              Shift Information
            </div>
            <div className="meta-grid" style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px", marginBottom: "32px",
              background: "#0f1319", padding: "24px",
              borderRadius: "8px", border: "1px solid #1e2636",
            }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: "500" }}>
                  Supervisor
                </label>
                <input
                  type="text"
                  value={formData.supervisor}
                  onChange={(e) => handleMeta("supervisor", e.target.value)}
                  placeholder="Your name"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: "500" }}>
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleMeta("date", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: "500" }}>
                  Shift
                </label>
                <select
                  value={formData.shift}
                  onChange={(e) => handleMeta("shift", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Value Streams */}
            <div style={{
              fontSize: "12px", color: "#64748b", letterSpacing: "0.12em",
              textTransform: "uppercase", marginBottom: "20px", fontWeight: "600",
            }}>
              Production Data
            </div>
            {VALUE_STREAMS.map((vs) => (
              <div key={vs.id} style={{ marginBottom: "40px" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  marginBottom: "20px", paddingBottom: "12px",
                  borderBottom: "2px solid #1e2636",
                }}>
                  <div style={{
                    background: "#FFB800", color: "#000", fontWeight: "700",
                    fontSize: "11px", padding: "3px 10px", borderRadius: "3px",
                    letterSpacing: "0.08em",
                  }}>
                    {vs.id === "vs1" ? "VS1" : "VS2"}
                  </div>
                  <span style={{
                    color: "#e2e8f0", fontSize: "14px", letterSpacing: "0.05em",
                    textTransform: "uppercase", whiteSpace: "nowrap",
                    fontWeight: "600",
                  }}>{vs.name}</span>
                </div>
                {vs.lines.map((line) => (
                  <LineCard
                    key={line}
                    line={line}
                    vsName={vs.name}
                    data={formData.lines[line]}
                    onChange={handleLine}
                  />
                ))}
              </div>
            ))}

            {/* Notes */}
            <div style={{
              background: "#0f1319", padding: "24px",
              borderRadius: "8px", border: "1px solid #1e2636", marginBottom: "24px",
            }}>
              <label style={{
                display: "block", fontSize: "12px", color: "#94a3b8",
                marginBottom: "8px", letterSpacing: "0.05em", textTransform: "uppercase",
                fontWeight: "500",
              }}>Notes / Issues</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleMeta("notes", e.target.value)}
                rows={3}
                placeholder="Any issues, callouts, or notes for incoming shift..."
                style={{
                  ...inputStyle, resize: "vertical", fontFamily: "inherit",
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={handleDownloadAll}
                style={{
                  background: "#FFB800", color: "#000", border: "none",
                  padding: "14px 28px", borderRadius: "6px", cursor: "pointer",
                  fontWeight: "700", fontSize: "13px", letterSpacing: "0.08em",
                  textTransform: "uppercase", fontFamily: "inherit",
                  flex: 1, minWidth: "200px",
                }}
              >
                ↓ Download All 4 Reports
              </button>
              <button
                onClick={() => setActiveTab("email")}
                style={{
                  background: "transparent", color: "#FFB800",
                  border: "1px solid #FFB800", padding: "14px 28px",
                  borderRadius: "6px", cursor: "pointer", fontWeight: "700",
                  fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase",
                  fontFamily: "inherit", flex: 1, minWidth: "200px",
                }}
              >
                ✉ Preview Email
              </button>
              <button
                onClick={handleReset}
                style={{
                  background: "transparent", color: "#4a5568",
                  border: "1px solid #2a3347", padding: "14px 20px",
                  borderRadius: "6px", cursor: "pointer", fontSize: "13px",
                  fontFamily: "inherit",
                }}
              >
                Reset
              </button>
            </div>
          </>
        )}

        {activeTab === "email" && (
          <div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "20px",
            }}>
              <div>
                <div style={{ fontSize: "16px", color: "#e2e8f0", fontWeight: "600" }}>
                  EOS Email Draft
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                  Copy and paste into Outlook — attach the 4 downloaded reports
                </div>
              </div>
              <button
                onClick={handleCopyEmail}
                style={{
                  background: emailCopied ? "#22c55e" : "#FFB800",
                  color: "#000", border: "none", padding: "10px 24px",
                  borderRadius: "6px", cursor: "pointer", fontWeight: "700",
                  fontSize: "13px", letterSpacing: "0.08em", fontFamily: "inherit",
                  transition: "background 0.3s",
                }}
              >
                {emailCopied ? "✓ Copied!" : "Copy to Clipboard"}
              </button>
            </div>

            {/* Subject line */}
            <div style={{
              background: "#0f1319", border: "1px solid #2a3347",
              borderRadius: "6px", padding: "12px 16px", marginBottom: "12px",
              fontSize: "13px",
            }}>
              <span style={{ color: "#64748b", marginRight: "8px" }}>SUBJECT:</span>
              <span style={{ color: "#FFB800" }}>
                EOS Report — {formData.shift} Shift | {formData.date} | {formData.supervisor || "Supervisor"}
              </span>
            </div>

            {/* Email body preview */}
            <pre style={{
              background: "#0f1319", border: "1px solid #1e2636",
              borderRadius: "8px", padding: "24px", fontSize: "13px",
              color: "#94a3b8", lineHeight: "1.7", whiteSpace: "pre-wrap",
              wordBreak: "break-word", margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {emailBody}
            </pre>

            <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
              <button
                onClick={() => setActiveTab("entry")}
                style={{
                  background: "transparent", color: "#64748b",
                  border: "1px solid #2a3347", padding: "12px 20px",
                  borderRadius: "6px", cursor: "pointer", fontSize: "13px",
                  fontFamily: "inherit",
                }}
              >
                ← Back to Entry
              </button>
              <button
                onClick={handleDownloadAll}
                style={{
                  background: "#FFB800", color: "#000", border: "none",
                  padding: "12px 24px", borderRadius: "6px", cursor: "pointer",
                  fontWeight: "700", fontSize: "13px", fontFamily: "inherit",
                }}
              >
                ↓ Download All 4 Reports
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
