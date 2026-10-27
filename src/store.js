// Morningfy data model. Shape matches production public.morningfy_state.data (see docs/PRODUCTION_SCHEMA.md).
export const STORAGE_KEY = 'morningfy:claude-handoff:v1';
export const CLOUD_CACHE_KEY = 'morningfy:cloud-cache:v1';
export const SUBJECTS = [
  {id:'math', en:'Mathematics', fi:'Matematiikka', url:''},
  {id:'physics', en:'Physics', fi:'Fysiikka', url:''},
  {id:'ml', en:'Machine learning', fi:'Koneoppiminen', url:''},
];
export const ROUTINE_STEPS = [
  {id:'body', en:'Body activation', fi:'Kehon herättely', time:8, descriptionEn:'Move and stretch', descriptionFi:'Liiku ja venyttele'},
  {id:'brain', en:'Brain warm-up', fi:'Aivojen lämmittely', time:10, descriptionEn:'Chess, maths, or memory', descriptionFi:'Shakkia, matematiikkaa tai muistia'},
  {id:'study', en:'Focused study', fi:'Keskittynyt opiskelu', time:45, descriptionEn:'Make progress on one subject', descriptionFi:'Edisty yhdessä oppiaineessa'},
  {id:'news', en:'Read the news', fi:'Uutiset', time:10, descriptionEn:'Catch up on the world', descriptionFi:'Katso päivän uutiset'},
  {id:'journal', en:'Journal', fi:'Päiväkirja', time:5, descriptionEn:'A few words for yourself', descriptionFi:'Muutama sana itsellesi'},
];
export function freshState() {
  return {lang:'en', theme:'light', goal:45,
    subjects:structuredClone(SUBJECTS), selectedSubject:'math',
    presets:[{id:'everyday', en:'Everyday', fi:'Arki', items:ROUTINE_STEPS.map(s=>({kind:s.id,minutes:s.time}))}],
    sessions:[], journals:{}, active:null};
}
export function localDay(date=new Date()) {
  const y=date.getFullYear(), m=String(date.getMonth()+1).padStart(2,'0'), d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
export function normalize(raw) {
  const base=freshState();
  if (!raw || typeof raw!=='object' || Array.isArray(raw)) return base;
  // Keep every field we don't know about, so saving never drops production data.
  return {...base, ...raw,
    lang:raw.lang==='fi'?'fi':'en', theme:raw.theme==='dark'?'dark':'light',
    goal:Number.isFinite(raw.goal)?Math.max(1,Math.min(600,raw.goal)):45,
    subjects:Array.isArray(raw.subjects)&&raw.subjects.length?raw.subjects:base.subjects,
    selectedSubject:typeof raw.selectedSubject==='string'?raw.selectedSubject:base.selectedSubject,
    presets:Array.isArray(raw.presets)&&raw.presets.length?raw.presets:base.presets,
    sessions:Array.isArray(raw.sessions)?raw.sessions:[],
    journals:raw.journals&&typeof raw.journals==='object'&&!Array.isArray(raw.journals)?raw.journals:{},
    active:raw.active&&typeof raw.active==='object'&&!Array.isArray(raw.active)?raw.active:null,
  };
}
let current, storageKey=STORAGE_KEY, onSave=null;
export function useStorage(key){storageKey=key;current=undefined;}
export function onStateSaved(fn){onSave=fn;}
export function getState(){
  if (!current){
    try {current=normalize(JSON.parse(localStorage.getItem(storageKey)||'null'));}
    catch {current=freshState();}
  }
  return current;
}
export function saveState(state){current=normalize(state);localStorage.setItem(storageKey,JSON.stringify(current));onSave?.(current);return current;}
// Replace state from the server without triggering a sync back.
export function replaceState(state){current=normalize(state);localStorage.setItem(storageKey,JSON.stringify(current));return current;}
export function importState(text){const parsed=JSON.parse(text);if(!parsed||typeof parsed!=='object'||!Array.isArray(parsed.sessions)||!parsed.journals)throw Error('Invalid Morningfy file');return saveState(parsed);}
export function uid(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;}
export function runningTimer(state){return Number.isFinite(state.active?.startedAt)?state.active:null;}
export function elapsedSeconds(active, now=Date.now()){return active?Math.max(0,Math.floor((now-active.startedAt)/1000)):0;}
export function studySecondsOnDay(state,day){return state.sessions.filter(s=>s.kind==='study'&&s.day===day).reduce((a,s)=>a+(Number(s.seconds)||0),0);}
export function formatDuration(seconds,lang='en'){const min=Math.floor(seconds/60), hrs=Math.floor(min/60); if(hrs)return `${hrs}h ${String(min%60).padStart(2,'0')}m`; if(min)return `${min} min`;return `${Math.max(0,Math.floor(seconds))} sec`;}
export function lastStudy(state, subjectId){return [...state.sessions].filter(s=>s.kind==='study'&&s.subject===subjectId).sort((a,b)=>(b.endedAt||0)-(a.endedAt||0))[0]||null;}
export function countStreak(state,now=new Date()){
  const days=new Set(state.sessions.filter(s=>s.kind==='study'&&Number(s.seconds)>0).map(s=>s.day));
  let d=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  if(!days.has(localDay(d)))d.setDate(d.getDate()-1);
  let n=0;while(days.has(localDay(d))){n++;d.setDate(d.getDate()-1);}return n;
}
// Production stores one journal text per day: journals = {'YYYY-MM-DD': 'text'}. Older object entries are still read.
export function journalEntries(state){return Object.entries(state.journals).map(([key,x])=>typeof x==='string'?{id:key,day:key,text:x}:{...x,id:x?.id||key,day:x?.day||key}).filter(x=>typeof x.text==='string'&&x.text.trim()).sort((a,b)=>b.day.localeCompare(a.day)||(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0));}
export function journalForDay(state,day){const x=state.journals[day];return typeof x==='string'?x:'';}
export function saveJournal(state,day,text){state.journals[day]=text;return saveState(state);}
export function dayCompleted(state,day,id){if(id==='journal')return journalEntries(state).some(j=>j.day===day)||state.sessions.some(s=>s.day===day&&s.kind==='journal');return state.sessions.some(s=>s.day===day&&s.kind===id);}
export function routineMinutes(state,presetId='everyday'){const p=state.presets.find(x=>x.id===presetId)||state.presets[0];const m={};for(const i of p?.items||[])if(i&&typeof i==='object'&&Number.isFinite(i.minutes))m[i.kind]=i.minutes;return m;}
export function finishSession(state,{done='',next=''}){
  if(!runningTimer(state))return false;
  const endedAt=Date.now(), a=state.active;
  state.sessions.push({id:uid(),kind:a.kind,subject:a.kind==='study'?a.subject:'',day:localDay(new Date(a.startedAt)),startedAt:a.startedAt,endedAt,seconds:elapsedSeconds(a,endedAt),goal:state.goal,done:done.trim(),next:next.trim()});
  state.active=null;saveState(state);return true;
}
// Three-way merge used when another device saved first. Nothing is deleted:
// sessions are unioned by id; journals and settings take the local value only where this device changed them.
export function mergeStates(base,local,remote){
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b), out={...remote};
  for(const k of ['lang','theme','goal','selectedSubject','active','subjects','presets'])if(!same(local[k],base?.[k]))out[k]=local[k];
  const ids=new Set((remote.sessions||[]).map(s=>s.id));
  out.sessions=[...(remote.sessions||[]),...(local.sessions||[]).filter(s=>!ids.has(s.id))];
  out.journals={...(remote.journals||{})};
  for(const [k,v] of Object.entries(local.journals||{}))if(!same(v,base?.journals?.[k]))out.journals[k]=v;
  return out;
}
