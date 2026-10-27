// Cloud sync with the existing public.morningfy_state row (one row per user).
// Safety rules: never delete, never upsert. Every update checks the revision we last read,
// so a newer save from another device is merged instead of overwritten.
import {SUPABASE_URL,SUPABASE_KEY,SYNC_WRITES} from './config.js';
import {mergeStates,freshState} from './store.js';

const TABLE='morningfy_state', BACKUP_PREFIX='morningfy:cloud-backup:r';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
let client=null;
export const writesEnabled=SYNC_WRITES;
export function getClient(){
  if(!client&&globalThis.supabase?.createClient&&SUPABASE_URL&&SUPABASE_KEY)client=globalThis.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  return client;
}
export async function currentUser(){const c=getClient();if(!c)return null;const {data}=await c.auth.getSession();return data.session?.user||null;}
export async function signIn(email,password){const {data,error}=await getClient().auth.signInWithPassword({email,password});if(error)throw error;return data.user;}
export async function signOut(){await getClient()?.auth.signOut();}
async function fetchRow(userId){const {data,error}=await getClient().from(TABLE).select('data,revision').eq('user_id',userId).maybeSingle();if(error)throw error;return data;}
async function updateRow(userId,data,revision){
  const {data:rows,error}=await getClient().from(TABLE).update({data,revision:revision+1,updated_at:new Date().toISOString()}).eq('user_id',userId).eq('revision',revision).select('revision');
  if(error)throw error;return rows.length?rows[0].revision:null; // null = someone else saved first
}
async function insertRow(userId,data){const {data:row,error}=await getClient().from(TABLE).insert({user_id:userId,data,revision:0}).select('revision').single();if(error)throw error;return row.revision;}
// Keep a copy of the last 3 server versions in this browser, in case something ever goes wrong.
function keepBackup(row){try{
  const k=BACKUP_PREFIX+row.revision;if(!localStorage.getItem(k))localStorage.setItem(k,JSON.stringify({savedAt:new Date().toISOString(),revision:row.revision,data:row.data}));
  Object.keys(localStorage).filter(x=>x.startsWith(BACKUP_PREFIX)).sort((a,b)=>b.slice(BACKUP_PREFIX.length)-a.slice(BACKUP_PREFIX.length)).slice(3).forEach(x=>localStorage.removeItem(x));
}catch{}}

// load(): current local state. replace(state): show server state without re-triggering a save.
// status(name, detail): 'loading' | 'synced' | 'read-only' | 'saving' | 'error'.
export function createSync({user,load,replace,status}){
  let base=null,revision=null,timer=null,busy=false,dirty=false;
  async function pull(){
    status('loading');
    try{
      const row=await fetchRow(user.id);
      if(!row){
        if(!SYNC_WRITES){base=freshState();revision=null;replace(base);return status('read-only');}
        const fresh=freshState();revision=await insertRow(user.id,fresh);base=fresh;replace(fresh);return status('synced');
      }
      keepBackup(row);base=row.data;revision=row.revision;replace(structuredClone(row.data));
      status(SYNC_WRITES?'synced':'read-only');
    }catch(e){status('error',e.message);}
  }
  async function flush(){
    if(busy||!dirty||!SYNC_WRITES||revision===null)return;
    busy=true;dirty=false;status('saving');let failed=false;
    try{
      let local=load();
      if(!same(local,base)){
        let rev=await updateRow(user.id,local,revision);
        if(rev===null){
          const row=await fetchRow(user.id);keepBackup(row);
          local=mergeStates(base,local,row.data);
          rev=await updateRow(user.id,local,row.revision);
          if(rev===null)throw Error('Another device keeps saving; please reload.');
          replace(local);
        }
        base=structuredClone(local);revision=rev;
      }
      status('synced');
    }catch(e){failed=true;dirty=true;status('error',e.message);}
    finally{busy=false;if(dirty&&!failed)timer=setTimeout(flush,800);}
  }
  return {
    pull,
    changed(){if(!SYNC_WRITES||base===null)return;dirty=true;clearTimeout(timer);timer=setTimeout(flush,800);},
    retry(){dirty=true;return flush();},
    refresh(){return dirty||busy?flush():pull();},
    hasPending(){return dirty||busy;},
  };
}
