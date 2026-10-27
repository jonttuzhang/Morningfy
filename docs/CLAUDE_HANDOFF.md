# Instructions for Claude Code

You are taking over development of an existing *product idea* called **Morningfy**, but the attached code is a **functional reconstruction**, not an export of the production ChatGPT Sites app. Never claim parity with the production website without comparing them.

## Product goals

Morningfy is a simple, Apple-inspired morning routine and studying app for Windows browsers and an iPhone 16 Pro Max Home Screen. Neutral color palette; plenty of whitespace; few buttons. Supports Finnish and English and light/dark modes. User normally wakes around 05:00–05:30, heads to school at ~07:50, and wants a calm morning routine rather than a rigid schedule.

Primary UX requirement: **Your morning rhythm must be the first section**, without a large, unnecessary information block above it. Routine step durations are estimates. Record *actual* time from start to finish. If someone leaves for an external website, they can return and stop the timer.

V1 study workflow: subject selection → previous study summary and next-time hint (suggestions only) → today's optional task → start stopwatch → save what was done → optional next-time note. Current daily goal is 45 minutes. Subjects include mathematics, physics and machine learning. The user studies from existing textbooks or other websites. No textbook uploads, OCR, AI analysis or complicated recommendations in V1.

Other routines: a short body activation (including simple hopping/swinging and stretches), brain warm-up (chess/maths/memory), news (Helsingin Sanomat), and journaling with a journal archive. Eventually add streaks, milestones, and skill-specific progress. Possible future project: Nightify.

## Current local code

Inspect README.md, src/store.js, src/main.js, src/i18n.js, styles.css and the tests. The app is standalone, uses browser localStorage, and runs without npm/build steps. It is deliberately disconnected from production Supabase.

## Production status

Original live site: https://morningfy-jonathan.auroraolive2048.chatgpt.site/

The original ChatGPT Sites source was not accessible for export from this conversation. Its site library projection exists but contains no downloadable source. A live Supabase project named Morningfy was discoverable, with metadata detailed in `PRODUCTION_SCHEMA.md`; *no user data was exported*.

Do **not** casually replace or overwrite the published app or its database. When the user provides the actual site source/GitHub repository, favor that over this reconstruction. Never guess keys or commit credentials.

## Priorities

1. Review the reconstruction against the current published website and correct UI/functionality differences.
2. Make local app tests pass and review browser/mobile usability.
3. Ask the user to provide the original site's source, if obtainable, before choosing between preserving that source and migrating this local reconstruction.
4. Implement email/password auth and cross-device synchronization using the *existing* Supabase project only after backing up current state, verifying its JSON shape, and reviewing row-level policies.
5. Preserve all existing study sessions and journals. Use migration/versioning, and avoid duplicate sessions on reconnect. No manual service-role API keys in the client.
6. Deploy new versions to a repository-backed hosting service that allows easy ongoing updates; do not imply Claude can automatically deploy to the original ChatGPT Site.

## Behavioral constraints

- Avoid unnecessary features and excessive UI clutter.
- Keep study session notes optional except perhaps the save prompt.
- Maintain accurate actual-time measurements.
- Do not automatically write to production or change auth/RLS without explicit approval.
- Explain each change in beginner-friendly terms and show how to preview it in Windows.
