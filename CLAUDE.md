# BAK EOS System — CLAUDE.md
 
## What This Is
A single-file React application for BAK Realtruck production supervisors
to log end-of-shift data and generate reports. No backend. No database.
All state lives in the browser during the session.
 
## AGENT INSTRUCTIONS — READ FIRST
- Do NOT audit the full file structure on every issue
- Do NOT refactor working code while fixing something else
- Do NOT add libraries or dependencies without flagging it first
- Read ONLY the files directly relevant to the issue
- Make the minimal change that fixes the issue
- Reference this file for all architecture and context questions
 
---
 
## File Map
```
src/
  App.jsx         → entire application (single component file)
public/
  index.html      → static entry point
package.json      → dependencies (React 17, no extras)
```
 
This is intentionally a single-component architecture.
Do not split into multiple files unless the issue explicitly requires it.
 
---
 
## Architecture
 
**State:** React hooks only (useState). No Redux, no Context API.
 
**Styling:** Inline styles only. No CSS files, no Tailwind, no styled-components.
All style objects are defined inline or as local constants within the component.
 
**Data flow:**
```
formData (useState)
    ↓
LineCard components (controlled inputs)
    ↓
generateCSV() / generateEmailBody() (pure functions)
    ↓
downloadCSV() (side effect — triggers browser download)
```
 
**CSV generation:** Pure functions. Keep them pure. No side effects inside generators.
 
---
 
## Domain Context
 
**Value Streams:** Two value streams (VS1, VS2) containing production lines.
**Lines:** 6 total — Line 1-4 in VS1, Line 5-6 in VS2.
**Shifts:** Day, Afternoon, Night.
 
**Fields captured per line:**
- Output (units produced)
- HPU (hours per unit)
- First Pass Yield % (quality metric)
- Headcount
- Order at Packout
- Remaining on Order
- Remaining on Run Sheet
- Changeovers
 
**Reports generated (4 total):**
- End of Shift Report
- Line Status Report
- Local Report
- Pre/Post Shift Report
 
All four are currently identical CSVs with different titles.
Differentiating them is a future enhancement, not current scope.
 
---
 
## Conventions
 
- Inline styles use plain JS objects — no CSS-in-JS libraries
- Color palette: background #0a0d14, surface #1a1f2e, accent #f97316
- Font: DM Mono / Courier New (monospace)
- All inputs are controlled components via handleLine() and handleMeta()
- Progress indicator tracks lines with non-empty output field
 
---
 
## Current State
MVP complete. Actively fixing issues via agents.
Not yet pushed to GitHub — local development only.
 
## Known Patterns to Preserve
- Orange (#f97316) accent on focus states
- Green dot indicator when a line has output entered
- Progress bar in header turns green at 100%
- Email preview tab mirrors the downloaded CSV data
