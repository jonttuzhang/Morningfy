// Public Supabase settings. The publishable key is safe in browser code: row-level security
// limits every request to the signed-in user's own row. Never put a secret/service-role key here.
export const SUPABASE_URL = 'https://uytnsylrwsyxdjakccmw.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_ugrAlScnqInPUOpceMLlng_GxV77tke';
// false = read-only check: your account's data is loaded and shown, but nothing is written back.
// Set to true only after you have downloaded a backup and confirmed your data looks right.
export const SYNC_WRITES = false;
