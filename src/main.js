import {getState,saveState,freshState,uid,localDay,ROUTINE_STEPS,elapsedSeconds,studySecondsOnDay,formatDuration,lastStudy,countStreak,journalEntries,dayCompleted,finishSession,importState} from './store.js';
import {t} from './i18n.js';

const root=document.getElementById('app');
const D={draftTask:'',draftJournal:'',dialog:false,notice:''};
const safe=(s='')=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const timeStr=(s)=>`${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const friendlyDate=(stamp,lang)=>new Date(stamp).toLocaleDateString(lang==='fi'?'fi-FI':'en-GB',{day:'numeric',month:'short'});
const label=(s,lang)=>safe(s?.[lang]||s?.en||s?.id||'');

function render(){
 const s=getState(),l=s.lang,day=localDay();
 document.documentElement.lang=l;document.body.classList.toggle('dark',s.theme==='dark');
 document.querySelector('meta[name="theme-color"]').content=s.theme==='dark'?'#171b19':'#f7f7f5';
 const todaySec=studySecondsOnDay(s,day),goalSec=s.goal*60,studied=Math.floor(todaySec/60);
 const currentSubject=s.subjects.find(x=>x.id===s.selectedSubject)||s.subjects[0]||{id:'mathematics',en:'Mathematics',fi:'Matematiikka'};
 const latest=lastStudy(s,currentSubject.id),completedSteps=ROUTINE_STEPS.filter(x=>dayCompleted(s,day,x.id)).length;
 const todayStudying=s.sessions.filter(x=>x.kind==='study'&&x.day===day).length;
 const running=s.active;
 const entries=journalEntries(s);
 const todayHeader=new Date().toLocaleDateString(l==='fi'?'fi-FI':'en-GB',{weekday:'long',day:'numeric',month:'long'});
 const heatDays=Array.from({length:28},(_,i)=>{const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()-(27-i));const value=studySecondsOnDay(s,localDay(date))/60;return {day:localDay(date),v:value,level:value>=s.goal?3:value>=20?2:value>0?1:0}});
 root.innerHTML=`
 <div class="app-shell">
   <header class="topbar">
      <a class="brand" href="#top"><img src="assets/morningfy.svg" alt="" /><span>morningfy</span></a>
      <div class="top-actions">
        <button type="button" class="soft-btn" data-action="language" aria-label="Change language">${l==='en'?'FI':'EN'}</button>
        <button type="button" class="icon-btn" data-action="theme" title="${t(l,s.theme==='light'?'themeDark':'themeLight')}" aria-label="${t(l,s.theme==='light'?'themeDark':'themeLight')}">${s.theme==='light'?'☾':'☀'}</button>
      </div>
   </header>
   <section id="top" class="page-intro">
      <div><p class="eyebrow">${safe(todayHeader)} · ${t(l,'today')}</p><h1 class="title">${t(l,'rhythm')}</h1><p class="subhead">${t(l,'subtitle')}</p></div>
      <span class="local-label">${t(l,'preview')}</span>
   </section>
   ${running?`<div class="active-banner" role="status"><div><div class="section-title" style="margin:0">${label(ROUTINE_STEPS.find(x=>x.id===running.kind),l)}</div><small>${t(l,'timerNote')}</small></div><div class="button-row"><span id="global-timer" class="timer">${timeStr(elapsedSeconds(running))}</span><button class="primary-btn" data-action="finish">${t(l,'finish')}</button></div></div>`:''}
   <main class="layout">
     <div class="column">
       <section class="panel" aria-labelledby="routine-title">
          <div class="panel-top"><div><h2 class="panel-title" id="routine-title">${t(l,'morning')}</h2><p class="helper">${completedSteps} / ${ROUTINE_STEPS.length} ${t(l,'completed').toLowerCase()}</p></div><small>${t(l,'approx')} 78 min</small></div>
          <div class="progress-track" role="progressbar" aria-valuenow="${completedSteps}" aria-valuemin="0" aria-valuemax="${ROUTINE_STEPS.length}"><div class="progress-fill" style="width:${completedSteps/ROUTINE_STEPS.length*100}%"></div></div>
          <div class="routine-list">${ROUTINE_STEPS.map((step,i)=>{
            const done=dayCompleted(s,day,step.id),isRun=running?.kind===step.id;
            const glyph=done?'✓':String(i+1).padStart(2,'0');
            return `<div class="routine-item"><div class="routine-symbol ${done?'done':''}">${glyph}</div><div class="routine-info"><div class="routine-label">${label(step,l)}</div><div class="routine-desc">${safe(step['description'+(l==='fi'?'Fi':'En')])}</div></div><span class="routine-time">~${step.time}m</span>${step.id==='journal'?`<button class="routine-action" data-action="journal">${t(l,'start')}</button>`:`<button class="routine-action ${isRun?'running':''}" data-action="${isRun?'finish':'start'}" data-kind="${step.id}" ${running&&!isRun?'disabled title="Finish the current timer first"':''}>${isRun?t(l,'finish'):done?t(l,'done'):t(l,'start')}</button>`}</div>`;
          }).join('')}</div>
       </section>
       <section id="study" class="panel" aria-labelledby="study-title">
          <div class="panel-top"><div><h2 class="panel-title" id="study-title">${t(l,'study')}</h2><p class="helper">${t(l,'chooseSubject')}</p></div></div>
          <div class="subject-list" role="group" aria-label="${t(l,'chooseSubject')}">${s.subjects.map(x=>`<button type="button" class="subject-pill ${x.id===currentSubject.id?'selected':''}" data-action="subject" data-id="${safe(x.id)}" aria-pressed="${x.id===currentSubject.id}">${label(x,l)}</button>`).join('')}</div>
          <div class="insight"><div class="insight-label">${t(l,'lastTime')}</div><div class="insight-main">${latest?safe(latest.done||t(l,'noSummary')):t(l,'noSessions')}</div>${latest?.next?`<div class="insight-next"><strong>${t(l,'nextTime')}:</strong> ${safe(latest.next)}</div>`:''}${latest?`<div class="helper">${friendlyDate(latest.endedAt||latest.startedAt,l)} · ${formatDuration(latest.seconds||0,l)}</div>`:''}</div>
          <label class="field-label" for="task-input">${t(l,'todaysTask')}</label>
          <input id="task-input" class="field-input" type="text" maxlength="400" placeholder="${t(l,'taskPlaceholder')}" value="${safe(D.draftTask)}" ${running?'disabled':''}/>
          <div class="study-footer"><span>${t(l,'dailyGoal')}: ${s.goal} ${t(l,'min')}</span><button type="button" class="primary-btn" data-action="${running?.kind==='study'?'finish':'start'}" data-kind="study" ${running&&running.kind!=='study'?'disabled':''}>${running?.kind==='study'?t(l,'finishStudy'):t(l,'start')}</button></div>
       </section>
       <section id="journal" class="panel" aria-labelledby="journal-title">
          <h2 class="panel-title" id="journal-title">${t(l,'journal')}</h2><p class="helper">${t(l,'journalPrompt')}</p>
          <label class="screenreader" for="journal-input">${t(l,'journal')}</label>
          <textarea id="journal-input" class="field-input journal-text section-spaced" maxlength="10000" placeholder="${t(l,'journalPlaceholder')}">${safe(D.draftJournal)}</textarea>
          <div class="button-row" style="justify-content:flex-end;margin-top:12px"><button type="button" class="primary-btn" data-action="save-journal">${t(l,'saveEntry')}</button></div>
          <div class="section-spaced"><h3 class="section-title">${t(l,'entries')}</h3><div class="journal-history">${entries.length?entries.slice(0,60).map(e=>`<article class="journal-entry"><header>${friendlyDate(e.updatedAt||e.createdAt||Date.now(),l)}</header><p>${safe(e.text)}</p></article>`).join(''):`<p class="empty">${t(l,'emptyJournal')}</p>`}</div></div>
       </section>
     </div>
     <aside class="column">
       <section class="panel" aria-labelledby="progress-title"><div class="panel-top"><h2 class="panel-title" id="progress-title">${t(l,'studyGoal')}</h2></div>
         <div class="metric-row"><div><div class="eyebrow">${t(l,'todaySoFar')}</div><div class="metric-number">${studied} <small>/ ${s.goal} ${t(l,'min')}</small></div></div></div>
         <div class="progress-track" role="progressbar" aria-valuenow="${Math.min(100,Math.floor(todaySec/goalSec*100))}" aria-valuemax="100"><div class="progress-fill" style="width:${Math.min(100,todaySec/goalSec*100)}%"></div></div>
         <div class="mini-stats"><div><strong>${countStreak(s)}</strong><p>${t(l,'streak')} (${t(l,'days')})</p></div><div><strong>${todayStudying}</strong><p>${t(l,'sessions')} ${l==='fi'?'tänään':'today'}</p></div></div>
       </section>
       <section class="panel"><h2 class="panel-title">${t(l,'pastWeek')}</h2><p class="helper">${t(l,'minutes')} ${l==='fi'?'päivittäin':'per day'}</p>
           <div class="mini-calendar" aria-label="Study time in the last 28 days">${heatDays.map(d=>`<div class="calendar-day level${d.level} ${d.day===day?'today':''}" title="${d.day}: ${Math.floor(d.v)} min" aria-label="${d.day}: ${Math.floor(d.v)} min"></div>`).join('')}</div>
           <div class="calendar-day-labels"><span>${friendlyDate(Date.now()-27*86400000,l)}</span><span>${friendlyDate(Date.now(),l)}</span></div>
       </section>
       <section class="panel"><h2 class="panel-title">${l==='fi'?'Pikalinkit':'Quick links'}</h2><div class="button-row" style="margin-top:16px"><a class="outline-btn" href="https://www.chess.com/" target="_blank" rel="noopener noreferrer" style="text-decoration:none">Chess.com ↗</a><a class="outline-btn" href="https://www.hs.fi/" target="_blank" rel="noopener noreferrer" style="text-decoration:none">HS ↗</a></div><p class="helper">${l==='fi'?'Muista lopettaa ajastin, kun palaat sivulle.':'Remember to stop your timer when you return.'}</p></section>
     </aside>
   </main>
   <footer class="footer"><span>${t(l,'offline')}</span><div class="secondary-actions"><button class="text-btn" data-action="export">${t(l,'exportData')}</button><button class="text-btn" data-action="import">${t(l,'importData')}</button><button class="text-btn" data-action="reset">${t(l,'reset')}</button></div></footer>
   <input type="file" id="import-file" accept=".json,application/json" aria-label="Import Morningfy JSON" />
 </div>
 ${D.dialog&&running?`<div class="overlay" id="modal-overlay"><form class="dialog" id="finish-form" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="eyebrow">${t(l,'duration')}: ${timeStr(elapsedSeconds(running))}</div><h2 id="dialog-title">${running.kind==='study'?t(l,'finishStudy'):t(l,'finishActivity')}</h2><p class="helper">${t(l,'timerNote')}</p><label class="field-label" for="done-input">${t(l,'whatDid')}</label><textarea class="field-input" id="done-input" name="done" maxlength="2000" placeholder="${t(l,'whatDidPlaceholder')}">${safe(running.task||'')}</textarea>${running.kind==='study'?`<label class="field-label" for="next-input">${t(l,'noteNext')}</label><textarea class="field-input" id="next-input" name="next" maxlength="2000" placeholder="${t(l,'noteNextPlaceholder')}"></textarea>`:''}<div class="dialog-buttons"><button type="button" class="outline-btn" data-action="close-dialog">${t(l,'cancel')}</button><button type="submit" class="primary-btn">${t(l,'saveSession')}</button></div></form></div>`:''}
 `;
}

function start(kind){const s=getState();if(s.active)return;s.active={kind,subject:kind==='study'?s.selectedSubject:'',task:kind==='study'?D.draftTask:'',startedAt:Date.now()};saveState(s);D.draftTask='';render();}
function download(data,name,mime){const blob=new Blob([data],{type:mime}),url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}

root.addEventListener('input',e=>{if(e.target.id==='task-input')D.draftTask=e.target.value;if(e.target.id==='journal-input')D.draftJournal=e.target.value;});
root.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b)return;
 const kind=b.dataset.kind,action=b.dataset.action,s=getState();
 if(action==='theme'){s.theme=s.theme==='light'?'dark':'light';saveState(s);render();}
 if(action==='language'){s.lang=s.lang==='en'?'fi':'en';saveState(s);render();}
 if(action==='subject'){s.selectedSubject=b.dataset.id;saveState(s);D.draftTask='';render();}
 if(action==='start'){start(kind);}
 if(action==='finish'){D.dialog=true;render();setTimeout(()=>document.querySelector('#done-input')?.focus(),0);}
 if(action==='close-dialog'){D.dialog=false;render();}
 if(action==='journal'){document.getElementById('journal').scrollIntoView({behavior:'smooth'});document.getElementById('journal-input').focus();}
 if(action==='save-journal'){
   const val=D.draftJournal.trim();if(!val){document.getElementById('journal-input').focus();return;}
   const id=uid(),ts=Date.now();s.journals[id]={id,day:localDay(),text:val,createdAt:ts,updatedAt:ts};
   saveState(s);D.draftJournal='';render();
 }
 if(action==='export'){download(JSON.stringify(s,null,2),'morningfy-local-backup-'+localDay()+'.json','application/json');}
 if(action==='import'){if(confirm(t(s.lang,'importWarning')))document.getElementById('import-file').click();}
 if(action==='reset'){if(confirm(t(s.lang,'confirmReset'))){saveState(freshState());D.draftTask='';D.draftJournal='';render();}}
});
document.addEventListener('submit',e=>{
 if(e.target.id!=='finish-form')return;
 e.preventDefault();const d=new FormData(e.target);const s=getState();finishSession(s,{done:String(d.get('done')||''),next:String(d.get('next')||'')});D.dialog=false;render();
});
document.addEventListener('change',async e=>{
 if(e.target.id!=='import-file')return;
 const file=e.target.files?.[0];if(!file)return;
 try {importState(await file.text());D.draftJournal='';D.draftTask='';D.dialog=false;render();alert(t(getState().lang,'importSuccess'));}
 catch {alert(t(getState().lang,'invalidFile'));}
 e.target.value='';
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&D.dialog){D.dialog=false;render();}});
setInterval(()=>{const s=getState();if(!s.active)return;const el=document.getElementById('global-timer');if(el)el.textContent=timeStr(elapsedSeconds(s.active));},1000);
render();
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
