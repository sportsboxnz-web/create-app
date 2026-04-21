# CREATE App — Setup Guide (5–10 minutes)

You'll set up a Google Sheet + a small Apps Script that acts as the backend. Every store's save flows into this sheet, and the admin dashboard reads from it. Only you (the Sheet owner) can open the raw data.

---

## Step 1 — Create the Google Sheet

1. Go to https://sheets.google.com and sign in with the Google account you want to own this data.
2. Click the **Blank** template. A new sheet opens.
3. Rename it to something like **CREATE App — Store Check-Ins**.

Nothing else to do on the sheet itself — a `checkins` tab will be created automatically the first time a store saves.

---

## Step 2 — Add the Apps Script backend

1. With the Sheet open, go to the menu **Extensions → Apps Script**. A new Apps Script editor tab opens.
2. Delete the placeholder code that says `function myFunction() { ... }`.
3. Open the file **apps-script-Code.gs** (in the same folder as this guide) and copy its entire contents.
4. Paste into the Apps Script editor.
5. Click the **disk icon** (or Ctrl/Cmd+S) to save. When prompted to name the project, call it **CREATE App backend**.

---

## Step 3 — Deploy as a Web App

1. In the Apps Script editor, click **Deploy → New deployment** (top right).
2. Next to **Select type**, click the gear icon → choose **Web app**.
3. Fill in the form:
   - **Description:** `CREATE App v1`
   - **Execute as:** `Me (your.email@gmail.com)`
   - **Who has access:** `Anyone`  ← must be Anyone, otherwise the HTML can't reach it
4. Click **Deploy**.
5. Google will ask you to **authorize access**. Click through:
   - Pick your account.
   - If you see a "Google hasn't verified this app" warning, click **Advanced → Go to CREATE App backend (unsafe)**. It's only "unverified" because it's your own private script. Click **Allow**.
6. You'll land on a page with a **Web app URL** that looks like:
   `https://script.google.com/macros/s/AKfyc.../exec`
7. **Copy that URL.** This is the value we need next.

---

## Step 4 — Paste the URL into the HTML

1. Open **`CREATE App.html`** in any plain-text editor (Notepad, TextEdit, VS Code — anything that shows code).
2. Search for `APPS_SCRIPT_URL`. You'll find this line near the bottom of the file:

   ```js
   var APPS_SCRIPT_URL = 'PASTE_YOUR_DEPLOYED_WEB_APP_URL_HERE';
   ```

3. Replace `PASTE_YOUR_DEPLOYED_WEB_APP_URL_HERE` with the URL you copied in Step 3. Keep the quotes. It should end up looking like:

   ```js
   var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfyc.../exec';
   ```

4. Save the file.

---

## Step 5 — Test it

1. Open `CREATE App.html` in a browser (double-click or drag into Chrome/Safari).
2. You'll be prompted to pick a store. Pick one (say **Whangarei**).
3. Go to **Friday Check-In → Behaviour Check**, tap a few ratings, click **Save Week**. You should see `✓ Saved to Whangarei`.
4. Go back to your Google Sheet and refresh — you should see a new tab called `checkins` with your entry.
5. Click **View Past Weeks** on the Behaviour Check screen — your week appears; click it to reload it.

---

## Step 6 — Access the admin dashboard

Open the app with `?admin=1` at the end of the URL, like:

- If you're opening the file directly: `file:///…/CREATE App.html?admin=1`
- If you've hosted it somewhere: `https://yoursite.com/create-app.html?admin=1`

Enter the password **`tiledepot2026`** (or change it first — see "Changing the password" below).

You'll see a table of every store × last 6 weeks, with dot indicators for each CREATE step, plus a highlight of stores that haven't submitted for the current week.

---

## Step 7 — Get the app to your 13 stores

You have a few options for distribution — pick whatever's easiest for you:

- **Email the HTML file** to each store manager. They save it to their desktop and double-click it to open. Works offline-ish (saves will fail without internet, but the UI works fine).
- **Host it on a simple web host** (Netlify Drop, GitHub Pages, Vercel) — drag the HTML onto https://app.netlify.com/drop and get a public URL in 30 seconds. Send one URL to all 13 stores.
- **Save to a shared network drive** if Tile Depot has one.

Each device remembers its own store selection in the browser's localStorage — so each store manager picks their store once and never again on that device.

---

## Changing the password

The admin password appears in **two places** — both must match:

1. In `CREATE App.html`, near the bottom:
   ```js
   var ADMIN_PASSWORD = 'tiledepot2026';
   ```
2. In `apps-script-Code.gs`, near the top:
   ```js
   var ADMIN_PASSWORD = 'tiledepot2026';
   ```

Change both to the same new value, save both files, then in Apps Script click **Deploy → Manage deployments → pencil icon → Version: New version → Deploy** to roll out the backend change.

---

## If you update the Apps Script later

Apps Script doesn't auto-update the deployed web app when you edit the code — you need to create a new version:

1. **Deploy → Manage deployments**.
2. Click the **pencil** (edit) icon on your existing deployment.
3. Under **Version**, pick **New version**.
4. Click **Deploy**.

The URL stays the same — no need to update the HTML.

---

## Troubleshooting

- **"Backend not configured"** flash when saving → You haven't pasted the Apps Script URL into `APPS_SCRIPT_URL`, or it still starts with `PASTE_`.
- **"Network error — try again"** → Check you deployed with **Access: Anyone**, not "Only myself" or "Within organisation".
- **Admin screen shows "unauthorised"** → Password in HTML and Apps Script don't match. Fix both and redeploy.
- **Safari/iOS blocks it** → Some iOS versions block `file://` fetches. Host the HTML on Netlify Drop instead.
- **Saves are disappearing** → Each store + week is upserted (saving twice overwrites). That's intentional. If you want history preserved instead, tell me and I'll change it.
