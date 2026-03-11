# 📋 BAK EOS System

> *End of shift reporting without the paperwork.*

A browser-based internal tool for BAK Realtruck production supervisors to log end-of-shift data across all lines and value streams — then instantly generate four formatted CSV reports and a ready-to-send email draft for Outlook.

Built to replace manual report entry. No backend, no login, no setup. Open it, fill it in, download, send.

---

## ⚡ What It Does

Supervisors enter per-line production data once. The tool generates everything else automatically:

| Output | Description |
|---|---|
| 📊 **4 CSV Reports** | EOS Report, Line Status, Local Report, Pre/Post Shift — all downloaded in one click |
| ✉️ **Email Draft** | Formatted end-of-shift summary ready to copy into Outlook |

---

## 📏 Data Captured Per Line

| Field | Description |
|---|---|
| **Output** | Units produced |
| **HPU** | Hours per unit |
| **First Pass Yield %** | Quality metric — units passing on first attempt |
| **Headcount** | Staffing on the line |
| **Order at Packout** | Order status at packout |
| **Remaining on Order** | Units left on the current order |
| **Remaining on Run Sheet** | Units left on the run sheet |
| **Changeovers** | Number of changeovers during shift |

Tracked across all lines in both value streams, plus shift-level metadata: supervisor name, date, shift (Day / Afternoon / Night), and notes for the incoming shift.

---

## 🏭 Built For

- **Production supervisors** logging end-of-shift data
- **All three shifts** — Day, Afternoon, Night
- **Both value streams** across all production lines
- Anyone who has ever filled out the same report four different ways

---

## 🖥️ Interface

**Data Entry tab** — fill in line data with a live progress indicator showing how many lines have been entered. Lines with output data show a green status indicator.

**Email Preview tab** — formatted email body with subject line, ready to copy into Outlook. Attach the four downloaded CSVs and send.

---

## 🚀 Getting Started

No installation required. This is a standalone React app — run it locally or host it on any static file server.

### Run Locally

```bash
git clone <your-repo-url>
cd eos-generator
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Or Just Open It

If hosted internally, navigate to the URL your team provides. No login required.

---

## 📁 Tech

| Layer | Technology |
|---|---|
| Framework | React 17 |
| State | React hooks (useState) |
| Export | CSV via Blob download |
| Styling | Inline styles — no external CSS dependencies |

No backend. No database. No environment variables. Data lives in the browser during the session — nothing is stored or transmitted.

---

## 🗺️ Roadmap

- [ ] Native Excel (`.xlsx`) export via SheetJS
- [ ] Pre-populated line targets for variance reporting
- [ ] Persistent draft — save progress and resume later
- [ ] Configurable value streams and lines without code changes
- [ ] Integration with internal reporting systems
