# Morningfy · Claude Code handoff

> **What this is:** a new, working, editable reconstruction of Morningfy made for transferring development to Claude. It is **not the original source code** used to publish the existing ChatGPT Site. The original ChatGPT Sites source could not be exported through the available access. Do not treat this ZIP as a snapshot of production.

**Published original:** https://morningfy-jonathan.auroraolive2048.chatgpt.site/

This ZIP contains a functioning standalone morning routine app and handoff notes. It runs without registration, npm installation, paid API keys, or any database connection. It intentionally saves **only in this browser's localStorage**. The live Morningfy website and existing Supabase records are untouched.

## Start on Windows

1. Extract the ZIP into a folder, for example `C:\Users\You\Documents\Morningfy`.
2. Open **Claude Desktop → Code**, choose **Open folder**, and select that extracted folder.
3. Ask Claude to inspect `README.md` and `docs/CLAUDE_HANDOFF.md` first.
4. For a local preview, open a terminal inside the folder and use either:
   ```powershell
   py -m http.server 4173
   ```
   or, with Node.js installed:
   ```powershell
   npx --yes serve . -l 4173
   ```
5. Visit `http://localhost:4173` in your browser.

The app uses plain HTML, CSS, and JavaScript ES modules. There is no build step. Python or Node is needed only to serve it locally; clicking `index.html` directly will not load ES modules reliably.

To run the automated tests with Node 18+:

```powershell
node --test tests/*.test.mjs
```

## What works now

- Your morning rhythm appears first. Five steps: body activation, brain warm-up, study, news, journal.
- Step timers record actual elapsed time, including across page reloads.
- Study sessions: choose Mathematics, Physics, or Machine Learning; optionally describe today's task; see the last session and next-time note; finish by saving a summary.
- A 45-minute daily study goal, study streak, activity heatmap and session counters.
- Journal with saved entries and a browseable archive.
- Finnish and English, light and dark mode.
- Local JSON export and import, keyboard-aware controls, responsive layout, app manifest and offline cache.
- Basic PWA icons, so an HTTPS-deployed site can be added to the iPhone Home Screen.

**Not yet included:** a real email login, existing user history synchronization, production deployment, or the exact original source/UI. This handoff intentionally does not implement the original Supabase authentication or write to its database. The live database schema is documented in `docs/PRODUCTION_SCHEMA.md` to help Claude migrate cautiously.

## Where to edit

| Path | Contents |
| --- | --- |
| `index.html` | App document and PWA metadata |
| `styles.css` | Apple-inspired light/dark responsive design |
| `src/main.js` | The app screens, buttons, study timer, journal, data controls |
| `src/store.js` | Data model, local persistence, calculations |
| `src/i18n.js` | Finnish/English text |
| `assets/` | Original Morningfy-style sunrise icons |
| `manifest.webmanifest` | iPhone/Android install metadata |
| `service-worker.js` | Offline caching of the static app |
| `docs/CLAUDE_HANDOFF.md` | Detailed coding-agent instructions |
| `docs/PRODUCTION_SCHEMA.md` | Read-only metadata from the existing Supabase project |
| `tests/store.test.mjs` | Data model smoke tests |

## Safe approach to resuming the original app

1. If you can later obtain the original ChatGPT Sites source ZIP or GitHub repository, **use that as the main source**, not this reconstruction. The original may contain behavior or styling missing here.
2. Create a GitHub repository and commit this local source as a new reconstruction if that is the route you choose.
3. Before connecting to Supabase, back up existing data, verify the complete JSON structure and authentication/RLS behavior, then build a safe, reversible migration. Never overwrite the existing `morningfy_state` row with a guessed data shape.
4. Set up a separate deployment on an HTTPS hosting service. This project does not control updates to the original `chatgpt.site` deployment.

## Privacy and credentials

No credentials, private database rows, or personal journal content are included in this ZIP. A Supabase project URL (a public identifier) is documented for recovery. Do not put service-role or secret keys in browser JavaScript. Never commit a `.env` containing secrets.

**Reconstruction created:** 27 October 2026.
