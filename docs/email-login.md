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

- Email links return to the page you used (the iPhone app uses `WEB_APP_URL` in
  `app/email-app.tsx`). Every address must be allowed in Supabase (see below).
- Supabase allows one code email per minute per address.
- The Supabase advisor reports leaked-password protection is off (unchanged).

## Required once: Supabase dashboard settings

**1. Authentication → URL Configuration**
- **Site URL:** `https://jonttuzhang.github.io/Morningfy/`
- **Redirect URLs:** add `https://jonttuzhang.github.io/Morningfy/`

Without this, email links fall back to the old ChatGPT site.

**2. Authentication → Emails → SMTP Settings.** Supabase only lets you edit templates when emails go
through your own mail server. Morningfy uses Gmail (set up 2026-10-28):
host `smtp.gmail.com`, port `465`, username and sender `jonttu.zhang@gmail.com`, password = a Gmail
**app password** (myaccount.google.com/apppasswords; needs 2-Step Verification). If emails stop
arriving, check Authentication → Logs; "535 Username and Password not accepted" means the app
password must be recreated. Never commit the app password.

**3. Authentication → Emails → Templates.** Supabase's default emails only contain a link.
Replace the **Message body** of these three templates so they include the 6-digit code
(`{{ .Token }}`) and keep the link as a backup:

**Magic Link** (used by "Sign in with a code")
```html
<h2>Your Morningfy sign-in code</h2>
<p style="font-size:28px;letter-spacing:6px"><strong>{{ .Token }}</strong></p>
<p>Enter this code in Morningfy, or <a href="{{ .ConfirmationURL }}">sign in with this link</a>.</p>
<p>If you didn't ask for it, ignore this email.</p>
```

**Confirm signup**
```html
<h2>Welcome to Morningfy</h2>
<p style="font-size:28px;letter-spacing:6px"><strong>{{ .Token }}</strong></p>
<p>Enter this code in Morningfy to verify your email, or <a href="{{ .ConfirmationURL }}">verify with this link</a>.</p>
<p>If you didn't sign up, ignore this email.</p>
```

**Reset Password**
```html
<h2>Reset your Morningfy password</h2>
<p style="font-size:28px;letter-spacing:6px"><strong>{{ .Token }}</strong></p>
<p>Enter this code in Morningfy, then choose a new password. Or <a href="{{ .ConfirmationURL }}">reset with this link</a>.</p>
<p>If you didn't ask for this, ignore this email.</p>
```

**4. Authentication → Sign In / Providers → Email:** "Confirm email" on; email OTP length 6.
