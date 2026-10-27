import test from 'node:test';
import assert from 'node:assert/strict';
import {normalize,journalEntries,journalForDay,dayCompleted,routineMinutes,lastStudy,mergeStates,freshState} from '../src/store.js';

// Same shape as the production row (structure verified 27 Oct 2026; values are made up).
const prod=()=>({goal:45,lang:'fi',theme:'dark',active:null,selectedSubject:'math',
  subjects:[{id:'math',en:'Mathematics',fi:'Matematiikka',url:'https://example.com'},{id:'physics',en:'Physics',fi:'Fysiikka',url:'https://example.com'},{id:'ml',en:'Machine learning',fi:'Koneoppiminen',url:''}],
  presets:[{id:'essential',en:'Essential',fi:'Perus',items:[{kind:'body',minutes:5},{kind:'study',minutes:45},{kind:'journal',minutes:3}]},{id:'everyday',en:'Everyday',fi:'Arki',items:[{kind:'body',minutes:5},{kind:'brain',minutes:5},{kind:'study',minutes:45},{kind:'news',minutes:5},{kind:'journal',minutes:5}]}],
  sessions:[{id:'a',day:'2026-10-27',done:'',goal:45,kind:'brain',next:'',endedAt:2,seconds:504,subject:'math',startedAt:1},{id:'b',day:'2026-10-27',done:'ch 3',goal:45,kind:'study',next:'ch 4',endedAt:4,seconds:900,subject:'math',startedAt:3}],
  journals:{'2026-10-27':'Hello world'}});

test('normalize keeps production data unchanged',()=>{const p=prod();assert.deepEqual(normalize(p),p);});
test('normalize keeps unknown fields',()=>{assert.equal(normalize({...prod(),futureField:{x:1}}).futureField.x,1);});
test('fresh state has no fields production lacks',()=>{assert.deepEqual(Object.keys(freshState()).sort(),Object.keys(prod()).sort());});
test('day-keyed journal strings are shown',()=>{const s=prod();assert.equal(journalEntries(s).length,1);assert.equal(journalEntries(s)[0].text,'Hello world');assert.equal(journalForDay(s,'2026-10-27'),'Hello world');assert.equal(dayCompleted(s,'2026-10-27','journal'),true);});
test('routine minutes come from the everyday preset',()=>{assert.deepEqual(routineMinutes(prod()),{body:5,brain:5,study:45,news:5,journal:5});});
test('study history uses production subject ids',()=>{assert.equal(lastStudy(prod(),'math').next,'ch 4');});
test('merge never loses sessions or journals from either device',()=>{
  const base=prod(),local=prod(),remote=prod();
  local.sessions.push({id:'local1',kind:'study',day:'2026-10-28'});local.journals['2026-10-28']='local';local.theme='light';
  remote.sessions.push({id:'remote1',kind:'body',day:'2026-10-28'});remote.journals['2026-10-29']='remote';remote.lang='en';
  const m=mergeStates(base,local,remote);
  assert.deepEqual(m.sessions.map(s=>s.id),['a','b','remote1','local1']);
  assert.deepEqual(m.journals,{'2026-10-27':'Hello world','2026-10-29':'remote','2026-10-28':'local'});
  assert.equal(m.theme,'light');assert.equal(m.lang,'en');
});
