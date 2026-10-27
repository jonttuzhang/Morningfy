import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,normalize,elapsedSeconds,studySecondsOnDay,lastStudy,countStreak,dayCompleted,localDay,journalEntries} from '../src/store.js';

test('initializes a Morningfy-compatible local data shape',()=>{const s=freshState();assert.equal(s.goal,45);assert.ok(Array.isArray(s.sessions));assert.ok(Array.isArray(s.subjects));assert.ok(Array.isArray(s.presets));assert.equal(typeof s.journals,'object');});
test('normalization repairs invalid settings',()=>{const s=normalize({goal:1000,lang:'nonsense',theme:'pink',sessions:[{kind:'study',seconds:60,day:'2026-10-27'}]});assert.equal(s.goal,600);assert.equal(s.lang,'en');assert.equal(s.theme,'light');assert.equal(s.sessions.length,1);});
test('time calculation never reports negative elapsed time',()=>{assert.equal(elapsedSeconds({startedAt:5000},4000),0);assert.equal(elapsedSeconds({startedAt:5000},6600),1);});
test('summaries return correct study sessions',()=>{const s=freshState();s.sessions=[{kind:'study',subject:'physics',seconds:1800,day:'2026-10-27',endedAt:100},{kind:'body',seconds:600,day:'2026-10-27'},{kind:'study',subject:'physics',seconds:2700,day:'2026-10-27',endedAt:200}];assert.equal(studySecondsOnDay(s,'2026-10-27'),4500);assert.equal(lastStudy(s,'physics').seconds,2700);assert.equal(dayCompleted(s,'2026-10-27','body'),true);});
test('journal entries sort newest first',()=>{const s=freshState();s.journals={older:{text:'old',createdAt:10,day:'2026-10-26'},newer:{text:'new',createdAt:20,day:'2026-10-27'}};assert.equal(journalEntries(s)[0].text,'new');assert.equal(dayCompleted(s,'2026-10-27','journal'),true);});
test('streak counts consecutive days',()=>{const s=freshState();s.sessions=[{kind:'study',seconds:100,day:'2026-10-27'},{kind:'study',seconds:100,day:'2026-10-26'},{kind:'study',seconds:100,day:'2026-10-24'}];assert.equal(countStreak(s,new Date(2026,9,27)),2);assert.equal(localDay(new Date(2026,9,27)),'2026-10-27');});
