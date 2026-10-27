// Morningfy standalone reconstruction. No production Supabase connection or writes.
export const STORAGE_KEY = 'morningfy:claude-handoff:v1';
export const SUBJECTS = [
  {id:'mathematics', en:'Mathematics', fi:'Matematiikka', url:''},
  {id:'physics', en:'Physics', fi:'Fysiikka', url:''},
  {id:'machine-learning', en:'Machine learning', fi:'Koneoppiminen', url:''},
];
export const ROUTINE_STEPS = [
  {id:'body', en:'Body activation', fi:'Kehon herättely', time:8, descriptionEn:'Move and stretch', descriptionFi:'Liiku ja venyttele'},
  {id:'brain', en:'Brain warm-up', fi:'Aivojen lämmittely', time:10, descriptionEn:'Chess, maths, or memory', descriptionFi:'Shakkia, matematiikkaa tai muistia'},
  {id:'study', en:'Focused study', fi:'Keskittynyt opiskelu', time:45, descriptionEn:'Make progress on one subject', descriptionFi:'Edisty yhdessä oppiaineessa'},
  {id:'news', en:'Read the news', fi:'Uutiset', time:10, descriptionEn:'Catch up on the world', descriptionFi:'Katso päivän uutiset'},
  {id:'journal', en:'Journal', fi:'Päiväkirja', time:5, descriptionEn:'A few words for yourself', descriptionFi:'Muutama sana itsellesi'},
];
export function freshState() {
  return {version:1, lang:'en', theme:'light', goal:45,
    subjects:structuredClone(SUBJECTS), selectedSubject:'mathematics',
    presets:[{id:'morning-rhythm', en:'Your morning rhythm', fi:'Aamurytmisi', items:ROUTINE_STEPS.map(s=>s.id)}],
    sessions:[], journals:{}, active:null};
}
export function localDay(date=new Date()) {
  const y=date.getFullYear(), m=String(date.getMonth()+1).padStart(2,'0'), d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
export function normalize(raw) {
  const base=freshState();
  if (!raw || typeof raw!=='object' || Array.isArray(raw)) return base;
  return {...base,
    lang:raw.lang==='fi'?'fi':'en', theme:raw.theme==='dark'?'dark':'light',
    goal:Number.isFinite(raw.goal)?Math.max(1,Math.min(600,raw.goal)):45,
    subjects:Array.isArray(raw.subjects)&&raw.subjects.length?raw.subjects:base.subjects,
    selectedSubject:typeof raw.selectedSubject==='string'?raw.selectedSubject:base.selectedSubject,
    presets:Array.isArray(raw.presets)&&raw.presets.length?raw.presets:base.presets,
    sessions:Array.isArray(raw.sessions)?raw.sessions:[],
    journals:raw.journals&&typeof raw.journals==='object'&&!Array.isArray(raw.journals)?raw.journals:{},
    active:raw.active&&typeof raw.active==='object'&&Number.isFinite(raw.active.startedAt)?raw.active:null,
  };
}
let current;
export function getState(){
  if (!current){
    try {current=normalize(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'));}
    catch {current=freshState();}
  }
  return current;
}
export function saveState(state){current=normalize(state);localStorage.setItem(STORAGE_KEY,JSON.stringify(current));return current;}
export function importState(text){const parsed=JSON.parse(text);if(!parsed||typeof parsed!=='object'||!Array.isArray(parsed.sessions)||!parsed.journals)throw Error('Invalid Morningfy file');return saveState(parsed);}
export function uid(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;}
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
export function journalEntries(state){return Object.entries(state.journals).map(([id,x])=>({...x,id:x?.id||id})).filter(x=>typeof x.text==='string').sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0));}
export function dayCompleted(state,day,id){if(id==='journal')return journalEntries(state).some(j=>j.day===day);return state.sessions.some(s=>s.day===day&&s.kind===id);}
export function finishSession(state,{done='',next=''}){
  if(!state.active)return false;
  const endedAt=Date.now(), a=state.active;
  state.sessions.push({id:uid(),kind:a.kind,subject:a.kind==='study'?a.subject:'',day:localDay(new Date(a.startedAt)),startedAt:a.startedAt,endedAt,seconds:elapsedSeconds(a,endedAt),goal:state.goal,done:done.trim(),next:next.trim()});
  state.active=null;saveState(state);return true;
}
