import {createClient, type SupabaseClient} from '@supabase/supabase-js';
// Publishable credentials identify this app. RLS enforces each user's private access.
export const SUPABASE_URL = 'https://uytnsylrwsyxdjakccmw.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_ugrAlScnqInPUOpceMLlng_GxV77tke';
let client: SupabaseClient | undefined;
export function getSupabase(){
 if(typeof window==='undefined')throw new Error('Browser client only');
 return client ??= createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
}
