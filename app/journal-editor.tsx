'use client';
import {Check, LoaderCircle} from 'lucide-react';

type Props = {
  date: string;
  value: string;
  savedValue?: string;
  saving: boolean;
  error: boolean;
  finnish: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
};

export default function JournalEditor({date,value,savedValue,saving,error,finnish,onChange,onSave}:Props) {
  const t=(en:string,fi:string)=>finnish?fi:en;
  const saved=savedValue!==undefined && value===savedValue;
  const emptyNewEntry=savedValue===undefined && value.trim()==='';
  const label=saving?t('Saving…','Tallennetaan…'):saved?t('Saved','Tallennettu'):error?t('Try saving again','Yritä tallentaa uudelleen'):t('Save entry','Tallenna merkintä');
  const message=saving?t('Saving to your account…','Tallennetaan tilillesi…'):saved?t('Saved to your account. You can keep writing to update this entry.','Tallennettu tilillesi. Voit jatkaa kirjoittamista ja päivittää merkintää.'):error?t('Not saved yet. Your writing is still here; try again.','Ei vielä tallennettu. Tekstisi on yhä tässä. Yritä uudelleen.'):emptyNewEntry?t('Write as much or as little as you like.','Kirjoita niin paljon tai vähän kuin haluat.'):t('Unsaved changes','Tallentamattomia muutoksia');
  return <section className="card journal-page">
    <div className="eyebrow">{date}</div>
    <textarea value={value} onChange={e=>onChange(e.target.value)} aria-label={t('Journal entry','Päiväkirjamerkintä')} placeholder={t('What’s on your mind?','Mitä mielessäsi on?')}/>
    <div className="journal-save-row">
      <button className="primary" disabled={saving||saved||emptyNewEntry} onClick={onSave}>
        {label}{saving?<LoaderCircle size={17} className="saving-spinner"/>:<Check size={17}/>}
      </button>
      <p className={'journal-save-status '+(saved?'is-saved':'')} role="status" aria-live="polite">{message}</p>
    </div>
  </section>;
}
