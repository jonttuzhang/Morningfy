# Reconnecting your Morningfy account (Supabase)

The app can sign in to the **existing** Supabase project (`uytnsylrwsyxdjakccmw`) with your
Morningfy email and password, and works on the same single row in `public.morningfy_state`.
No database tables, security rules or settings were changed to make this work.

## How your data is protected

- **Read-only first.** `src/config.js` ships with `SYNC_WRITES = false`. Signing in loads and shows
  your saved data, but nothing is written back. The badge says "Read-only check".
- **Same data format as production.** Journals stay `{"YYYY-MM-DD": "text"}`, subject ids stay
  `math`/`physics`/`ml`, and any field the app doesn't recognise is kept as-is (tests in
  `tests/production-data.test.mjs`).
- **No deletes, no overwrites.** Every save says "update my row *only if* it is still at revision N".
  If another device (or the old ChatGPT site) saved in between, the app downloads the newer
  version and merges: sessions from both sides are kept, journals/settings only take this device's
  value where this device changed them (`mergeStates` in `src/store.js`).
- **Automatic backups.** Each time the app reads your row it keeps a copy of the last 3 versions in
  the browser (`localStorage` keys `morningfy:cloud-backup:r<revision>`). "Export my data" downloads
  the account data as JSON. Import and Reset are disabled while signed in.
- **Local preview data is kept separate** from account data and is never uploaded.
- Only the public *publishable* key is in the code. Row-level security means it can only reach the
  signed-in user's own row. Never put a `service_role`/secret key in this project.

## Turning on saving (when you are ready)

1. Sign in on the new site and check that your sessions and journal look right.
2. Click **Export my data** and keep the file somewhere safe.
3. Change `SYNC_WRITES = false` to `true` in `src/config.js`, commit, and deploy.
4. Avoid using the old ChatGPT site and the new site at the same moment. Conflicts are merged, but
   it is unknown whether the old site checks revisions before saving.

## Before going live on a new web address

Password sign-in needs no redirect settings. If you later use password reset or magic-link emails,
add the new address under Supabase → Authentication → URL Configuration.
