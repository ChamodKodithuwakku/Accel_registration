# ACEL Registration System

A frontend-only registration management app. React (Vite) on Vercel, Google Apps Script as the API layer, Google Sheets as the database. No Node server, no Express, no traditional database.

---

## 1. Architecture

```
┌──────────────────────────┐      HTTPS       ┌───────────────────────────┐     internal     ┌──────────────────┐
│  React + Vite (Vercel)   │ ───────────────► │  Google Apps Script       │ ───────────────► │  Google Sheet    │
│                          │                  │  Web App (/exec)          │                  │  "Registrations" │
│  Register.jsx            │  GET  ?action=   │                           │  SpreadsheetApp  │                  │
│  Dashboard.jsx           │  POST {action}   │  doGet()  -> list         │                  │  ID | First Name │
│  services/api.js         │ ◄─────────────── │  doPost() -> create /     │ ◄─────────────── │  NIC | Mobile |  │
│                          │    JSON          │             update /      │      values      │  Category | ...  │
└──────────────────────────┘                  │             delete        │                  └──────────────────┘
                                              └───────────────────────────┘
```

**Request flow, end to end**

1. The user submits the form in `Register.jsx`.
2. `utils/validation.js` validates the names, NIC, Sri Lankan phone format and the required choice fields in the browser.
3. `services/api.js` sends the payload to the Apps Script `/exec` URL taken from `VITE_GOOGLE_SCRIPT_URL`.
4. `doPost()` in `Code.gs` takes a script lock, re-validates the payload server side, generates the next ID, stamps date/time, and appends the row via `SpreadsheetApp`.
5. Apps Script returns JSON; React shows a success toast and clears the form.
6. The dashboard calls `doGet(?action=list)`, receives the rows as JSON, and renders them with search, sort, update and delete.

**Why update/delete are tunnelled over POST**

Apps Script only exposes `doGet()` and `doPost()` — there is no `doPut()` or `doDelete()`, and it cannot answer a CORS preflight (`OPTIONS`) request. So:

- The REST verb travels inside the JSON body as `action: "update" | "delete"`.
- The frontend sends `Content-Type: text/plain;charset=utf-8`, which keeps the call a CORS *simple request* — the browser skips the preflight entirely.
- A published `/exec` response already carries `Access-Control-Allow-Origin: *`, so the Vercel origin can read it.

This is the standard, working pattern for Apps Script APIs. Sending `application/json` instead would trigger a preflight that Apps Script cannot answer, and every request would fail with a CORS error.

---

## 2. Project structure

```
.
├── apps-script/
│   ├── Code.gs             # The whole API: doGet, doPost, CRUD, validation
│   └── appsscript.json     # Manifest (timezone + web app access)
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Top navigation + language toggle
│   │   ├── LanguageToggle.jsx  # EN / සිං switch
│   │   ├── FormInput.jsx       # Labelled input with error/hint states
│   │   ├── RadioGroup.jsx      # Visitor category
│   │   ├── CheckboxGroup.jsx   # Interest areas (multi-select)
│   │   ├── DataTable.jsx       # Table (desktop) + cards (mobile), sorting, empty/error states
│   │   ├── Modal.jsx           # Accessible dialog (Esc, backdrop, scroll lock)
│   │   ├── Toast.jsx           # Success / error / info notifications
│   │   └── Spinner.jsx         # Loading indicator
│   ├── context/
│   │   └── LanguageContext.jsx # Language state + t() helper
│   ├── i18n/
│   │   └── translations.js     # English + Sinhala strings
│   ├── pages/
│   │   ├── Register.jsx    # Page 1 - registration form
│   │   └── Dashboard.jsx   # Page 2 - stats, search, sort, update, delete
│   ├── services/
│   │   └── api.js          # All Apps Script calls
│   ├── utils/
│   │   └── validation.js   # Field validators + phone/NIC normalisation
│   ├── App.jsx             # Routes + layout
│   ├── main.jsx            # Entry point
│   └── index.css           # Tailwind layers
├── .env.example
├── vercel.json             # SPA rewrites for React Router
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 3. Google Sheet setup

1. Go to <https://sheets.new> and create a spreadsheet. Name it **ACEL Registrations**.
2. Rename the first tab to exactly **`Registrations`**.
3. **File -> Settings -> Time zone ->** `(GMT+05:30) Colombo`.
4. Open **Extensions -> Apps Script**, paste `Code.gs` (next section), then run **`setupSheet`** once. It writes all 14 headers, freezes the header row, and formats the NIC and phone columns as plain text so leading zeros and the trailing `V` survive.

The sheet ends up with these columns:

| # | Column | Required | Notes |
|---|---|---|---|
| A | ID | auto | Generated, highest + 1 |
| B | First Name | **yes** | |
| C | Last Name | **yes** | |
| D | NIC | **yes** | Unique key - duplicates are rejected |
| E | Email | no | Validated only if filled |
| F | Mobile Number | **yes** | Stored as `07XXXXXXXX` |
| G | Organization | no | |
| H | Visitor Category | **yes** | Student / SME / Industry / Other |
| I | Interest Areas | **yes** | Comma separated, at least one |
| J | Heard From | no | |
| K | Consent | no | `Yes` / `No` |
| L | Created Date | auto | `YYYY-MM-DD` |
| M | Created Time | auto | `HH:MM` |
| N | Last Updated | auto | Set on edit |

> Categories and interest areas are always stored in **English**, whichever language the visitor used, so the data stays sortable and filterable.

> **Upgrading an existing sheet:** `setupSheet()` calls `sheet.clear()` and wipes existing rows. Duplicate the old sheet first if the data matters.

## 4. Apps Script setup

1. In the spreadsheet: **Extensions → Apps Script**.
2. Delete the placeholder `myFunction()` and paste the entire contents of [`apps-script/Code.gs`](apps-script/Code.gs).
3. Save (Ctrl+S). Name the project *ACEL Registration API*.
4. Optional but recommended: run **`setupSheet`** once from the function dropdown → **Run**. Approve the permission prompt (*Review permissions → choose your account → Advanced → Go to … (unsafe) → Allow*). This is your own script accessing your own sheet.
5. **Deploy → New deployment**:
   - Gear icon → **Web app**
   - Description: `v1`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` ← must be *Anyone*, not *Anyone with Google account*
   - **Deploy** → copy the **Web app URL**. It looks like:
     `https://script.google.com/macros/s/AKfycbx.../exec`
6. Test it in a browser tab — opening `<your-url>?action=ping` should print:
   ```json
   {"success":true,"message":"API is running","sheet":"Registrations"}
   ```

> **Every time you edit `Code.gs`, you must re-deploy:** *Deploy → Manage deployments → pencil icon → Version: New version → Deploy*. The `/exec` URL stays the same.

---

## 5. Environment variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
VITE_GOOGLE_SCRIPT_URL="https://script.google.com/macros/s/AKfycbx.../exec"
```

Rules:

- The variable **must** start with `VITE_` or Vite will not expose it to the browser.
- Read it in code as `import.meta.env.VITE_GOOGLE_SCRIPT_URL` (already done in `src/services/api.js`).
- `.env` is gitignored; only `.env.example` is committed.
- Restart `npm run dev` after changing it — Vite inlines env vars at build time.

---

## 6. Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Registration form is at `/`, dashboard at `/dashboard`.

Production preview:

```bash
npm run build
npm run preview
```

---

## 7. Deploy to Vercel

### Option A — dashboard

1. Push the project to GitHub.
2. <https://vercel.com/new> → **Import** the repository.
3. Vercel auto-detects Vite. Confirm:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Expand **Environment Variables** and add:
   - Name: `VITE_GOOGLE_SCRIPT_URL`
   - Value: your `/exec` URL
   - Environments: **Production, Preview, Development** (tick all three)
5. **Deploy**.

### Option B — CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel env add VITE_GOOGLE_SCRIPT_URL production
vercel --prod
```

`vercel.json` already rewrites all routes to `index.html`, so refreshing `/dashboard` will not 404.

> If you change the env var later, you must **redeploy** — Vite bakes env vars into the bundle at build time; changing it in the dashboard alone does nothing until the next build.

---

## 8. API reference

Base URL = your Apps Script `/exec` URL.

### Get all records

```
GET  <BASE_URL>?action=list
```

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Nimal",
      "lastName": "Perera",
      "fullName": "Nimal Perera",
      "nic": "200012345678",
      "email": "nimal@example.com",
      "phone": "0771234567",
      "organization": "ACEL",
      "visitorCategory": "Student",
      "interestAreas": ["Innovation", "Sustainability"],
      "heardFrom": "Facebook",
      "consent": true,
      "createdDate": "2026-09-22",
      "createdTime": "16:30",
      "lastUpdated": ""
    }
  ]
}
```

### Add a record

```
POST <BASE_URL>
Content-Type: text/plain;charset=utf-8

{
  "action": "create",
  "firstName": "Nimal",
  "lastName": "Perera",
  "nic": "200012345678",
  "email": "nimal@example.com",
  "phone": "0771234567",
  "organization": "ACEL",
  "visitorCategory": "Student",
  "interestAreas": ["Innovation", "Sustainability"],
  "heardFrom": "Facebook",
  "consent": true
}
```

```json
{ "success": true, "message": "Record added successfully", "id": 1 }
```

### Update a record (REST: PUT)

```
POST <BASE_URL>

{ "action": "update", "id": 1, "firstName": "Nimal", "lastName": "Silva", "nic": "200012345678", "phone": "0711111111", "visitorCategory": "SME", "interestAreas": ["Innovation"] }
```

```json
{ "success": true, "message": "Record updated successfully", "id": 1 }
```

### Delete a record (REST: DELETE)

```
POST <BASE_URL>

{ "action": "delete", "id": 1 }
```

```json
{ "success": true, "message": "Record deleted successfully", "id": 1 }
```

### Errors

Any failure returns HTTP 200 with:

```json
{ "success": false, "message": "NIC 200012345678 is already registered" }
```

`services/api.js` turns `success: false` into a thrown `Error`, which the pages render as a red toast.

---

## 9. Validation rules

Every rule runs twice - once in the browser for fast feedback, once in Apps Script because a client-side check is a convenience, never a guarantee.

| Field | Rule |
|-------|------|
| First / Last name | required, 2-40 chars, Latin/Sinhala/Tamil letters plus `. ' -` |
| NIC | required, `123456789V` (9 digits + V/X) or `200012345678` (12 digits); must be unique |
| Email | optional; standard address shape if provided |
| Mobile | required; `07…`, `+947…`, `0094…`, `947…` and landlines, normalised to `07XXXXXXXX` |
| Organization | optional, under 80 chars |
| Visitor Category | required, one of the four known values |
| Interest Areas | required, at least one known value |
| Heard From | optional, under 120 chars |
| Consent | optional checkbox |

Client-side messages are stored as **translation keys**, not sentences, so an error raised in English re-renders in Sinhala the moment the language is switched. Errors returned by Apps Script are English only.

## 9a. Language switching

The header carries an **EN / සිං** toggle. All labels, hints, buttons, table headers, validation messages and toasts are translated; the choice is remembered in `localStorage` and restored on the next visit.

- Strings live in [`src/i18n/translations.js`](src/i18n/translations.js) - one object per language, same shape.
- `LanguageProvider` in [`src/context/LanguageContext.jsx`](src/context/LanguageContext.jsx) exposes `t()` and the current language, and sets `<html lang>` so the Sinhala line-height rule applies.
- Sinhala glyphs come from **Noto Sans Sinhala**, loaded in `index.html`.
- To add a language: add an entry to `translations`, add it to `LANGUAGES`, done.

## 10. Testing steps

**API on its own (no frontend)**

```bash
curl "https://script.google.com/macros/s/XXXX/exec?action=ping"
curl "https://script.google.com/macros/s/XXXX/exec?action=list"
curl -L -X POST "https://script.google.com/macros/s/XXXX/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"action":"create","firstName":"Test","lastName":"User","nic":"200012345678","phone":"0771234567","visitorCategory":"Student","interestAreas":["Innovation"]}'
```

(`-L` matters: Apps Script answers with a 302 to `googleusercontent.com`.)

**Full app**

1. `npm run dev`, open `/`.
2. Submit an empty form → three inline errors, nothing sent.
3. Enter phone `123` → *"Enter a valid Sri Lankan number"*. Enter NIC `123` → NIC error.
3b. Click **සිං** in the header → every label, hint, button **and the visible errors** switch to Sinhala. Reload → Sinhala is remembered.
4. Submit a valid record → green toast, form clears, new row visible in the Google Sheet with ID, date and time filled in.
5. Submit the same NIC again → red toast: *"… is already registered"*.
6. Open `/dashboard` → the record appears, "Total registrations" increments.
7. Click **Update** → change the name → **Save changes** → toast, table refreshes, `Last Updated` column now has a timestamp.
8. Click **Delete** → confirm → the row disappears from both the table and the sheet.
9. Type in the search box → list filters by name / student ID / phone.
10. Change **Sort by** or click a column header → order flips.
11. Resize to mobile width (< 768px) → the table becomes stacked cards.
12. Temporarily blank `VITE_GOOGLE_SCRIPT_URL` and restart → a clear configuration error appears instead of a silent failure.

---

## 11. Security notes

- No Google API key, OAuth client ID, or service-account credential ever reaches the browser. The only secret-ish value is the web app URL.
- The Apps Script runs as **you**, so the sheet itself stays private — visitors never touch Google Sheets directly and cannot read or write anything the script does not expose.
- All input is re-validated server side; the client-side checks are UX only.
- `LockService` serialises writes so two simultaneous submissions cannot claim the same ID.
- `.env` is gitignored.

Worth knowing: a public `/exec` URL is *unauthenticated*. Anyone who has the URL can call it. For a closed system, add a shared secret — send a `token` field from the frontend and check it in `doPost()` against `PropertiesService.getScriptProperties().getProperty('API_TOKEN')`. That raises the bar but is still visible in the bundle; real authentication would need a login layer in front of the dashboard.
