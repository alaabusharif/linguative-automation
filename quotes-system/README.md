# Linguative Quotes & Invoices

Internal tool for creating quotes and invoices: logins for multiple staff, live totals (tax/discount), PO linking, amend/cancel version history, PDF export in Linguative's brand, and OCR for scanned POs.

Not yet built (phase 2): live client sync from HubSpot / email correspondence. For now, client details are entered manually per quote (autofilled if you reuse the same client name).

## What this is

- Node.js + Express backend, SQLite database (single file, no separate database server needed).
- Plain HTML/JS frontend, no build step.
- Runs as one process — deploy it as a **Systemd** app in FastPanel, with a **Reverse proxy** pointing a subdomain at it.

## 1. Get the code onto the server

From your computer or via FastPanel's File Manager, upload this whole `quotes-system/` folder to the server (e.g. `/var/www/quotes-system/`), or clone the repo there and copy just this folder out.

## 2. Install dependencies

SSH into the server (or use FastPanel's terminal if it has one) and run, inside the `quotes-system` folder:

```
npm install
```

## 3. Configure

Copy `.env.example` to `.env` and fill in:

```
PORT=4000
SESSION_SECRET=<any long random string>
ADMIN_USERNAME=ala
ADMIN_PASSWORD=<a real password — change it after first login>
```

The first time the app starts with no users in the database, it creates this admin account automatically. After logging in, use the **Users** tab to add accounts for other staff — you control who gets access.

## 4. Create the Systemd app in FastPanel

1. FastPanel → Sites → **Create site** → **Systemd**.
2. Point it at the `quotes-system` folder and set the start command to:
   ```
   node server.js
   ```
3. Set the port to match `PORT` in your `.env` (default `4000`).
4. Start the service — FastPanel keeps it running and restarts it if the server reboots.

## 5. Add the Reverse proxy

1. FastPanel → Sites → **Create site** → **Reverse proxy**.
2. Domain: a subdomain of linguative.net, e.g. `tools.linguative.net` (add the DNS record first if needed, same as any other subdomain).
3. Target: `http://127.0.0.1:4000` (the port from step 3).
4. Enable SSL for that subdomain (FastPanel's free Let's Encrypt option) so it's `https://tools.linguative.net`.

Once that's up, everyone with a login goes to that address instead of a local URL.

## 6. Back up the data

Everything (quotes, invoices, users, item catalog) lives in `data/quotes.db`. Since it's a single file, back it up the same way you'd back up any file on the server — FastPanel's "Backup copies" section can cover this folder too.

## Notes

- The repo this code lives in is public — `data/` and `.env` are git-ignored on purpose and must never be committed. Only the application code itself is in the repo.
- The logo and colors come directly from `marketing/brand/logos/` and `marketing/brand/BRAND.md` in the main repo — nothing is redrawn.
- PO-scan OCR is a best-effort reader (Tesseract) — it shows its guesses for you to confirm, never fills fields silently.
