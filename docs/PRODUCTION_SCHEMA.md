# Morningfy: existing Supabase production database (metadata only)

**Checked:** 27 October 2026. No user profile data, journal text, passwords, auth tokens or API keys were exported. No writes or schema changes were made.

- Supabase project name: `Morningfy`
- Project reference: `uytnsylrwsyxdjakccmw`
- Public API host: `https://uytnsylrwsyxdjakccmw.supabase.co`
- Region: `eu-north-1`
- Table: `public.morningfy_state`
- Status at inspection: active; one row present.

## Database columns

| Field | Type | Notes |
| --- | --- | --- |
| `user_id` | uuid | Primary key; foreign key to auth.users(id) |
| `data` | jsonb | Main app state object |
| `revision` | integer | Nonnegative, default 0 |
| `updated_at` | timestamptz | Default now() |

Required data checks: `sessions` array, `subjects` array, `presets` array, `journals` object, numeric `goal` in 1–600, total JSON text at most 1,500,000 bytes.

Observed `data` keys and JSON types **only**:

```json
{
  "goal": "number", "lang": "string", "theme": "string", "active": "null",
  "presets": "array", "journals": "object", "sessions": "array",
  "subjects": "array", "selectedSubject": "string"
}
```

An existing example session had fields: `id` string, `day` string, `done` string, `goal` number, `kind` string, `next` string, `endedAt` number, `seconds` number, `subject` string, `startedAt` number.

An existing subject had fields: `en` string, `fi` string, `id` string, `url` string. An existing preset had `en` string, `fi` string, `id` string, `items` array. Journal entry substructure was not retrieved. **Do not infer it.**

## Security policies (RLS enabled)

`own_select`, `own_insert`, and `own_update` apply to the `authenticated` role only, scoped to `auth.uid() = user_id` (for insert and update the check is on the user's own ID too).

No edge functions found. Reported migration versions:
- `20261027162835` `morningfy_private_state`
- `20261027163043` `require_state_fields`

## Integration guidance

1. Retrieve a public *publishable* key from the user's Supabase Dashboard when the user authorizes reconnection. **Never use a secret or service-role key in a browser.**
2. Download/backup production data securely before any client writes. Confirm the real journal format, nested preset item format and existing active session format.
3. Reuse email authentication only after verifying existing login method and authenticated user identity.
4. Preserve `revision` during concurrency handling, avoid naïve `upsert` overwrites, and provide a conflict strategy for multiple devices.
5. Keep RLS enabled. No anonymous/public database writes. Verify authorization under different user sessions.
6. Test against a separate project or development branch first, not against the user's one production row.

**This reconstruction is intentionally offline/local.** It has not been connected to the production table and does not hold account credentials.
