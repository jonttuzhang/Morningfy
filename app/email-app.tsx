'use client';
import {useEffect,useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import {Sunrise} from 'lucide-react';
import Morningfy from './morningfy';
import {getSupabase} from '../lib/supabase-client';
import {isNative} from '../lib/platform';
import {emailStateRequest} from '../lib/email-state';

type Mode='login'|'signup'|'reset'|'recovery';
export default function EmailApp(){
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[mode,setMode]=useState<Mode>('login');
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[fi,setFi]=useState(false),[version,setVersion]=useState(0);
 const t=(en:string,fin:string)=>fi?fin:en;
 useEffect(()=>{
  const client=getSupabase();let alive=true;
  const {data:{subscription}}=client.auth.onAuthStateChange((event,next)=>{if(!alive)return;setSession(next);setReady(true);if(event==='PASSWORD_RECOVERY')setMode('recovery');});
  client.auth.getSession().then(({data,error})=>{if(!alive)return;if(error)setError(t('Could not restore your session. Please sign in again.','Istunnon palautus epäonnistui. Kirjaudu uudelleen.'));setSession(data.session);setReady(true)});
  return()=>{alive=false;subscription.unsubscribe()};
 },[]);
 async function submit(e:React.FormEvent){
  e.preventDefault();if(busy)return;setBusy(true);setError('');setMessage('');
  const client=getSupabase();const redirectTo='https://morningfy-jonathan.auroraolive2048.chatgpt.site/email';
  try{
   if(mode==='login'){
    const {error}=await client.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;
   }else if(mode==='signup'){
    const {error}=await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:redirectTo}});if(error)throw error;
    setMessage(t('Check your email to confirm your account, then sign in.','Vahvista tilisi sähköpostista ja kirjaudu sitten sisään.'));setMode('login');
   }else if(mode==='reset'){
    const {error}=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo});if(error)throw error;
    setMessage(t('If an account exists, you will receive a password reset email.','Jos tili on olemassa, saat salasanan palautusviestin.'));
   }else{
    const {error}=await client.auth.updateUser({password});if(error)throw error;setMode('login');setMessage(t('Password updated.','Salasana päivitetty.'));
   }
   setPassword('');
  }catch(e){setError(e instanceof Error?e.message:t('Please try again.','Yritä uudelleen.'))}finally{setBusy(false)}
 }
 async function signOut(){
  if(!window.confirm(t('Sign out? Save any open writing first.','Kirjaudutaanko ulos? Tallenna avoimet tekstit ensin.')))return;
  const {error}=await getSupabase().auth.signOut();if(error)setError(error.message);
 }
 async function migrate(){
  if(busy)return;setBusy(true);setError('');setMessage('');
  try{
   const old=await fetch('/api/state',{cache:'no-store'});if(!old.ok)throw new Error(t('Open the original Morningfy with ChatGPT sign-in first.','Avaa alkuperäinen Morningfy ensin ChatGPT-kirjautumisella.'));
   const {data}=await old.json() as {data:unknown};if(!data)throw new Error(t('No previous history was found.','Aiemmaa historiaa ei löytynyt.'));
   const current=await emailStateRequest('/api/state');if(!current.ok)throw new Error('Could not check email account');const state=await current.json() as {revision:number};
   if(state.revision!==0)throw new Error(t('This email account already has saved data. Import is stopped to avoid overwriting it.','Sähköpostitilillä on jo tallennettuja tietoja. Tuonti keskeytettiin, jotta niitä ei korvata.'));
   const saved=await emailStateRequest('/api/state',{method:'POST',body:JSON.stringify({data,revision:0})});if(!saved.ok)throw new Error(t('Import failed. Your original history is unchanged.','Tuonti epäonnistui. Alkuperäinen historia säilyy.'));
   setVersion(v=>v+1);setMessage(t('Your history was copied to this email account.','Historiasi kopioitiin tälle sähköpostitilille.'));
  }catch(e){setError(e instanceof Error?e.message:'Import failed')}finally{setBusy(false)}
 }
 if(!ready)return <div className="email-auth"><p role="status">{t('Opening Morningfy…','Avataan Morningfy…')}</p></div>;
 if(session&&mode!=='recovery')return <><Morningfy key={session.user.id+':'+version} stateRequest={emailStateRequest} homeHref="/" accountControls={(f)=> <><p>{session.user.email}</p><p>{f?'Sama sähköpostitili pitää laitteidesi historian ajan tasalla.':'Use this email account on both devices to keep your history in sync.'}</p><button className="text-button" onClick={signOut}>{f?'Kirjaudu ulos':'Sign out'}</button>{!isNative()&&<details><summary>{f?'Tuo aiempi Morningfy-historia':'Import previous Morningfy history'}</summary><p>{f?'Kopioi nykyisen ChatGPT-tilisi historia tähän tyhjään sähköpostitiliin. Alkuperäistä historiaa ei poisteta.':'Copy the current ChatGPT account’s history into this empty email account. The original history is kept.'}</p><button className="primary" disabled={busy} onClick={migrate}>{f?'Kopioi historiani':'Copy my history'}</button></details>}{message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}</>}/></>;
 const title=mode==='signup'?t('Make room for you.','Tee tilaa itsellesi.'):mode==='reset'?t('Reset your password.','Palauta salasanasi.'):mode==='recovery'?t('Choose a new password.','Valitse uusi salasana.'):t('Welcome back.','Tervetuloa takaisin.');
 return <div className="email-auth"><section className="email-auth-card"><div className="email-auth-top"><a className="brand" href="/"><Sunrise size={28}/>morningfy.</a><button onClick={()=>setFi(!fi)}>{fi?'English':'Suomi'}</button></div><h1>{title}</h1><p>{t('Your mornings, saved in your own account.','Aamusi tallessa omalla tililläsi.')}</p><form onSubmit={submit}>{mode!=='recovery'&&<label>{t('Email','Sähköposti')}<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>}{mode!=='reset'&&<label>{t('Password','Salasana')}<input type="password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={mode==='login'?1:12} required value={password} onChange={e=>setPassword(e.target.value)}/>{mode!=='login'&&<small>{t('At least 12 characters.','Vähintään 12 merkkiä.')}</small>}</label>}{error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}<button className="primary full" disabled={busy}>{busy?t('One moment…','Hetkinen…'):mode==='login'?t('Sign in','Kirjaudu sisään'):mode==='signup'?t('Create account','Luo tili'):mode==='reset'?t('Send reset email','Lähetä palautusviesti'):t('Save password','Tallenna salasana')}</button></form><div className="email-auth-links">{mode==='login'?<><button onClick={()=>{setMode('signup');setError('');setMessage('')}}>{t('Create an account','Luo tili')}</button><button onClick={()=>{setMode('reset');setError('');setMessage('')}}>{t('Forgot password?','Unohditko salasanasi?')}</button></>:<button onClick={()=>{setMode('login');setPassword('');setError('');setMessage('')}}>{t('Back to sign in','Takaisin kirjautumiseen')}</button>}</div></section></div>;
}
