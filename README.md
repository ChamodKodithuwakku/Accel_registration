# ACEL Registration System

A frontend-only registration management app. React (Vite) on Vercel, Google Apps Script as the API layer, Google Sheets as the database. No Node server, no Express, no traditional database.

---

## 1. Architecture

```
┌──────────────────────────┐      HTTPS       ┌───────────────────────────┐     internal     ┌──────────────────┐
│  React + Vite (Vercel)   │ ───────────────► │  Google Apps Script       │ ───────────────► │  Google Sheet    │
│                          │                  │  Web App (/exec)          │                  │  "Registrations" │
│  Register.jsx            │  GET  ?action=   │                           │  SpreadsheetApp  │                  │
│  Dashboard.jsx           │  POST {action}   │  doGet()  -> list         │                  │  ID | Name |     │
│  services/api.js         │ ◄─────────────── │  doPost() -> create /     │ ◄─────────────── │  Student ID |    │
│                          │    JSON          │             update /      │      values      │  Phone | ...     │
└──────────────────────────┘                  │             delete        │                  └──────────────────┘
                                              └───────────────────────────┘
```

**Request flow, end to end**

1. The user submits the form in `Register.jsx`.
2. `utils/validation.js` validates name, student ID and the Sri Lankan phone format in the browser.
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
│   │   ├── Navbar.jsx      # Top navigation
│   │   ├── FormInput.jsx   # Labelled input with error/hint states
│   │   ├── DataTable.jsx   # Table (desktop) + cards (mobile), sorting, empty/error states
│   │   ├── Modal.jsx       # Accessible dialog (Esc, backdrop, scroll lock)
│   │   ├── Toast.jsx       # Success / error / info notifications
│   │   └── Spinner.jsx     # Loading indicator
│   ├── pages/
│   │   ├── Register.jsx    # Page 1 - registration form
│   │   └── Dashboard.jsx   # Page 2 - stats, search, sort, update, delete
│   ├── services/
│   │   └── api.js          # All Apps Script calls
│   ├── utils/
│   │   └── validation.js   # Field validators + phone normalisation
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
2. Rename the first tab to exactly **`Registrations`** (bottom-left tab → double-click).
3. Add these headers in row 1, columns A–G:

   | A | B | C | D | E | F | G |
   |---|---|---|---|---|---|---|
   | ID | Name | Student ID | Phone Number | Created Date | Created Time | Last Updated |

4. Select column **D** → *Format → Number → Plain text*. This stops Sheets from eating the leading `0` in `0771234567`.
5. **File → Settings → Time zone →** `(GMT+05:30) Colombo`, so the generated dates/times are local.

> You can skip steps 3–4: run the `setupSheet()` function once from the Apps Script editor and it creates the tab, headers, formatting and frozen header row for you.

---

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
      "name": "John",
      "studentId": "IT001",
      "phone": "0771234567",
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

{ "action": "create", "name": "John", "studentId": "IT001", "phone": "0771234567" }
```

```json
{ "success": true, "message": "Record added successfully", "id": 1 }
```

### Update a record (REST: PUT)

```
POST <BASE_URL>

{ "action": "update", "id": 1, "name": "Updated Name", "studentId": "IT002", "phone": "0711111111" }
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
{ "success": false, "message": "Student ID IT001 is already registered" }
```

`services/api.js` turns `success: false` into a thrown `Error`, which the pages render as a red toast.

---

## 9. Validation rules

| Field | Client (`validation.js`) | Server (`Code.gs`) |
|---|---|---|
| Name | required, 2–60 chars, letters/spaces/`-`/`'` (Sinhala + Tamil ranges allowed) | required, 2–60 chars |
| Student ID | required, 3–20 chars, `A-Z 0-9 / - _`, upper-cased on submit | same regex, plus duplicate check against the sheet |
| Phone | required, Sri Lankan mobile or landline; accepts `07…`, `+947…`, `0094…`, `947…`; normalised to `07XXXXXXXX` | re-normalised and re-validated |

Both layers validate — a client-side check is a convenience, never a guarantee.

---

## 10. Testing steps

**API on its own (no frontend)**

```bash
curl "https://script.google.com/macros/s/XXXX/exec?action=ping"
curl "https://script.google.com/macros/s/XXXX/exec?action=list"
curl -L -X POST "https://script.google.com/macros/s/XXXX/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"action":"create","name":"Test User","studentId":"IT999","phone":"0771234567"}'
```

(`-L` matters: Apps Script answers with a 302 to `googleusercontent.com`.)

**Full app**

1. `npm run dev`, open `/`.
2. Submit an empty form → three inline errors, nothing sent.
3. Enter phone `123` → *"Enter a valid Sri Lankan number"*.
4. Submit a valid record → green toast, form clears, new row visible in the Google Sheet with ID, date and time filled in.
5. Submit the same Student ID again → red toast: *"… is already registered"*.
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
