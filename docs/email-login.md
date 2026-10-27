# Email login

Morningfy signs in with an email account through Supabase (project `uytnsylrwsyxdjakccmw`).
The website and the iPhone app use the same account and the same saved data.

- **Sign in** with email + password, or with email + a 6-digit code ("Sign in with a code").
- **Create an account** with email + password; the account must be verified with a 6-digit code from the email.
- **Forgot password?** emails a 6-digit code; after entering it you choose a new password.
- Signing in with an unverified email automatically sends a new verification code.

Codes work inside the iPhone app, so no links have to open a website.

The old ChatGPT sign-in, the `/legacy` page, the `/api/state` import route and its
Cloudflare D1 database code were removed on 2026-10-28. Your history had already been
copied into the email account on 2026-10-27, so nothing in Supabase was changed. The old
D1 copy still exists on the ChatGPT Sites hosting, untouched.

- All of this lives in `app/email-app.tsx`.
- Data is read from `public.morningfy_state` and saved with the `save_morningfy_state`
  database function, which refuses to overwrite a newer save from another device.
- Row-level security limits every account to its own row. Only the public publishable key
  is in the code (`lib/supabase-client.ts`).

## Still to do

- The emails can still contain a link as well; it opens
  `https://morningfy-jonathan.auroraolive2048.chatgpt.site/email`. When the website moves to
  new hosting, change `LINK_REDIRECT` in `app/email-app.tsx` and add the new address in
  Supabase → Authentication → URL Configuration.
- Supabase's default email sender is rate-limited; set up custom SMTP before inviting others.
- The Supabase advisor reports leaked-password protection is off (unchanged).

## Required once: put the code in Supabase's emails

Supabase's default emails only contain a link. In the Supabase dashboard open
**Authentication → Emails → Templates** and replace the **Message body** of these three templates
(keep the subjects or change them as you like):

**Confirm signup**
```html
<h2>Welcome to Morningfy</h2>
<p>Your verification code is:</p>
<p style="font-size:28px;letter-spacing:6px"><strong>{{ .Token }}</strong></p>
<p>Enter it in Morningfy to verify your email. If you didn't sign up, ignore this email.</p>
```

**Magic Link** (used by "Sign in with a code")
```html
<h2>Your Morningfy sign-in code</h2>
<p style="font-size:28px;letter-spacing:6px"><strong>{{ .Token }}</strong></p>
<p>Enter it in Morningfy to sign in. If you didn't ask for it, ignore this email.</p>
```

**Reset Password**
```html
<h2>Reset your Morningfy password</h2>
<p>Your reset code is:</p>
<p style="font-size:28px;letter-spacing:6px"><strong>{{ .Token }}</strong></p>
<p>Enter it in Morningfy, then choose a new password. If you didn't ask for this, ignore this email.</p>
```

Also check **Authentication → Sign In / Providers → Email**: "Confirm email" on, and the email
OTP length is 6 digits (the app accepts 6–10).
