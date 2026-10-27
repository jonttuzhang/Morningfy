# Morningfy source code

This ZIP contains the actual React/TypeScript source and the generated Capacitor iOS project, not just a planning document.

Snapshot: af3489ccfa31479720b96ce21cd4dc5314d484ac.

Upload the contents of this Morningfy folder into your GitHub repository. Preserve dotfiles such as .gitignore and .openai/hosting.json. No .git history, node_modules, generated web bundles, passwords, signing credentials or user journal records are included. The Supabase publishable key in lib/supabase-client.ts is intentionally public; account privacy depends on the existing database RLS policies.

Start with package.json and docs/ios-app.md. Install the packageManager version of pnpm, then run pnpm install --frozen-lockfile. Use pnpm dev for the website, pnpm build:mobile for the mobile bundle, and pnpm ios:sync to update the iPhone project. Xcode and Apple signing are needed to install a native iPhone build.

Status: this snapshot includes root email-login changes and native packaging prepared in the latest coding session. TypeScript, web/mobile builds and seven tracking checks passed. That session stopped before deployment and removing the hosting access gate were confirmed. No signed IPA exists.

The website retains Sites/Cloudflare-specific hosting and a legacy D1 import route. Pushing to GitHub alone does not deploy it. The Supabase backend already exists separately; this ZIP is not a database backup and does not include Supabase database migrations. For a new backend, recreate the table, save_morningfy_state function, constraints and RLS policies first.
