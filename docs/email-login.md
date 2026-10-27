# Email login

Morningfy has one way to sign in: **email and password** through Supabase
(project `uytnsylrwsyxdjakccmw`). The website and the iPhone app use the same account
and the same saved data.

The old ChatGPT sign-in, the `/legacy` page, the `/api/state` import route and its
Cloudflare D1 database code were removed on 2026-10-28. Your history had already been
copied into the email account on 2026-10-27, so nothing in Supabase was changed. The old
D1 copy still exists on the ChatGPT Sites hosting, untouched.

- Sign in, create an account, and "Forgot password?" are on the first screen (`app/email-app.tsx`).
- Data is read from `public.morningfy_state` and saved with the `save_morningfy_state`
  database function, which refuses to overwrite a newer save from another device.
- Row-level security limits every account to its own row. Only the public publishable key
  is in the code (`lib/supabase-client.ts`).

## Still to do

- Confirmation and password-reset emails link to
  `https://morningfy-jonathan.auroraolive2048.chatgpt.site/email`. When the website moves to
  new hosting, change `redirectTo` in `app/email-app.tsx` and add the new address in
  Supabase → Authentication → URL Configuration.
- Supabase's default email sender is rate-limited; set up custom SMTP before inviting others.
- The Supabase advisor reports leaked-password protection is off (unchanged).
