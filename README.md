# CREATE App — Tile Depot Manager Toolkit

In-browser behaviour check-in tool rolled out to 13 Tile Depot stores. Each store saves a weekly Friday Check-In; head office views all stores in the admin dashboard.

## Live app

The hosted version of `index.html` is served by GitHub Pages. Store managers open the same URL; the app remembers which store each device belongs to.

Admin dashboard: append `?admin=1` to the URL.

## Repo contents

- `index.html` — the app itself (served by GitHub Pages)
- `CREATE App.html` — identical copy, useful if you want to email the file directly
- `apps-script-Code.gs` — Google Apps Script backend (paste into script.google.com)
- `SETUP-INSTRUCTIONS.md` — step-by-step for wiring the Google Sheet backend

## How it works

Saves POST to a Google Apps Script web app bound to a private Google Sheet. Each store + week pair is upserted as one row. The admin view reads everything via a password-gated GET. No customer data, no third-party dependencies.
