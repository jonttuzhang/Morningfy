'use client';
import {useState} from 'react';
import {BookOpen,ChevronRight,Search} from 'lucide-react';

type Props={entries:Record<string,string>;today:string;finnish:boolean};
function entryDate(value:string){return new Date(`${value}T12:00:00`)}
export default function JournalCatalog({entries,today,finnish}:Props){
 const [query,setQuery]=useState('');
 const t=(en:string,fi:string)=>finnish?fi:en;
 const locale=finnish?'fi-FI':'en-GB';
 const sorted=Object.entries(entries).sort(([a],[b])=>b.localeCompare(a));
 const term=query.trim().toLocaleLowerCase(locale);
 const matches=sorted.filter(([date,text])=>`${date} ${entryDate(date).toLocaleDateString(locale,{dateStyle:'full'})} ${text}`.toLocaleLowerCase(locale).includes(term));
 const groups:Record<string,typeof sorted>={};
 for(const entry of matches)(groups[entry[0].slice(0,7)]??=[]).push(entry);
 return <section className="journal-catalog" aria-label={t('Journal entry catalog','Päiväkirjamerkintöjen arkisto')}>
  {sorted.length>0&&<div className="catalog-tools"><label className="catalog-search"><Search size={18} aria-hidden="true"/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} aria-label={t('Search journal entries','Hae päiväkirjamerkintöjä')} placeholder={t('Search your entries…','Hae merkinnöistä…')}/></label><p className="catalog-count" role="status">{matches.length} {t(matches.length===1?'entry':'entries',matches.length===1?'merkintä':'merkintää')}</p></div>}
  {sorted.length===0?<div className="card catalog-empty"><BookOpen size={28}/><h2>{t('Your story starts here.','Tarinasi alkaa tästä.')}</h2><p>{t('Saved journal entries will appear here, including today’s. Choose “Write today” to begin.','Tallennetut päiväkirjamerkinnät näkyvät tässä, myös tämän päivän merkintä. Aloita valitsemalla ”Kirjoita tänään”.')}</p></div>:matches.length===0?<div className="card catalog-empty"><h2>{t('No matching entries','Ei hakua vastaavia merkintöjä')}</h2><p>{t('Try another word or date.','Kokeile toista sanaa tai päivämäärää.')}</p></div>:Object.entries(groups).map(([month,items])=><section className="catalog-month" key={month}><h2>{entryDate(items[0][0]).toLocaleDateString(locale,{month:'long',year:'numeric'})}</h2><div className="catalog-list">{items.map(([date,text])=><details className="catalog-entry" key={date}><summary><div className="catalog-date-tile" aria-hidden="true"><strong>{entryDate(date).getDate()}</strong><span>{entryDate(date).toLocaleDateString(locale,{weekday:'short'})}</span></div><div className="catalog-entry-summary"><div className="catalog-entry-title"><time dateTime={date}>{entryDate(date).toLocaleDateString(locale,{day:'numeric',month:'long',year:'numeric'})}</time>{date===today&&<span className="catalog-today">{t('Today','Tänään')}</span>}</div><p className="catalog-preview">{text.trim()||t('Empty entry','Tyhjä merkintä')}</p></div><ChevronRight size={18} className="catalog-chevron" aria-hidden="true"/></summary><div className="catalog-entry-body">{text||t('This entry is empty.','Tämä merkintä on tyhjä.')}</div></details>)}</div></section>)}
 </section>
}
