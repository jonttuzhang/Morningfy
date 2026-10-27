# Email login rollout

Root and /email use Supabase email/password. The original UI remains at /legacy; /api/state checks ChatGPT identity and supplies optional imports into empty email accounts. Original history is preserved.

Supabase project: uytnsylrwsyxdjakccmw. Confirmation and reset links point to https://morningfy-jonathan.auroraolive2048.chatgpt.site/email. The owner configured redirects and verified signup/history import on 2026-10-27.

The public sign-in page does not expose saved records: Supabase RLS restricts each account to its records. Password recovery and two-device syncing need device checks. Configure custom SMTP before broader invitations; the default sender is restricted. The advisor reports leaked-password protection disabled; this setting is unchanged.

See ios-app.md for build steps and signing requirements.
