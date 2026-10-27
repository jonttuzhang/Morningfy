'use client';
import {useEffect,useState} from 'react';
import type {Session,EmailOtpType} from '@supabase/supabase-js';
import {Sunrise} from 'lucide-react';
import Morningfy from './morningfy';
import {getSupabase} from '../lib/supabase-client';
import {emailStateRequest} from '../lib/email-state';
import {isNative} from '../lib/platform';

// login: email + password · code: request a sign-in code · verify: enter a 6-digit code
// signup: create account (verified by code) · reset: request a reset code · recovery: choose new password
type Mode='login'|'code'|'verify'|'signup'|'reset'|'recovery';
type CodeFor=Extract<EmailOtpType,'email'|'signup'|'recovery'>;
// Links in account emails come back to the page you are using; the iPhone app sends them to the website.
// Each address must be listed under Supabase → Authentication → URL Configuration → Redirect URLs.
const WEB_APP_URL='https://jonttuzhang.github.io/Morningfy/';
const linkRedirect=()=>isNative()?WEB_APP_URL:window.location.origin+window.location.pathname;
export default function EmailApp(){
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[mode,setMode]=useState<Mode>('login'),[codeFor,setCodeFor]=useState<CodeFor>('email'),[recovering,setRecovering]=useState(false);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[code,setCode]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[fi,setFi]=useState(false),[version]=useState(0);
 const t=(en:string,fin:string)=>fi?fin:en;
 useEffect(()=>{
  const client=getSupabase();let alive=true;
  const {data:{subscription}}=client.auth.onAuthStateChange((event,next)=>{if(!alive)return;setSession(next);setReady(true);if(event==='PASSWORD_RECOVERY')setMode('recovery');});
  client.auth.getSession().then(({data,error})=>{if(!alive)return;if(error)setError(t('Could not restore your session. Please sign in again.','Istunnon palautus epäonnistui. Kirjaudu uudelleen.'));setSession(data.session);setReady(true)});
  return()=>{alive=false;subscription.unsubscribe()};
 },[]);
 const go=(next:Mode)=>{setMode(next);setPassword('');setCode('');setError('');setMessage('')};
 // Ask Supabase to email a code for the given purpose.
 async function sendCode(kind:CodeFor){
  const client=getSupabase(),address=email.trim();
  const {error}=kind==='signup'?await client.auth.resend({type:'signup',email:address,options:{emailRedirectTo:linkRedirect()}})
   :kind==='recovery'?await client.auth.resetPasswordForEmail(address,{redirectTo:linkRedirect()})
   :await client.auth.signInWithOtp({email:address,options:{shouldCreateUser:false,emailRedirectTo:linkRedirect()}});
  if(error)throw error;
 }
 function awaitCode(kind:CodeFor){setCodeFor(kind);setCode('');setMode('verify');setMessage(t(`We sent a code to ${email.trim()}. It may take a minute to arrive.`,`Lähetimme koodin osoitteeseen ${email.trim()}. Sen saapuminen voi kestää hetken.`))}
 function friendly(e:unknown){
  const m=e instanceof Error?e.message:'';
  if(/signups not allowed for otp|user not found/i.test(m))return t('No account uses this email. Create an account first.','Tällä sähköpostilla ei ole tiliä. Luo ensin tili.');
  if(/token has expired|invalid/i.test(m)&&mode==='verify')return t('That code is wrong or has expired. Check the newest email or send a new code.','Koodi on väärä tai vanhentunut. Tarkista uusin viesti tai lähetä uusi koodi.');
  if(/invalid login credentials/i.test(m))return t('Email or password is incorrect.','Sähköposti tai salasana on väärin.');
  if(/rate limit|for security purposes/i.test(m))return t('Please wait a minute before asking for another email.','Odota hetki ennen kuin pyydät uuden viestin.');
  return m||t('Please try again.','Yritä uudelleen.');
 }
 async function submit(e:React.FormEvent){
  e.preventDefault();if(busy)return;setBusy(true);setError('');setMessage('');
  const client=getSupabase(),address=email.trim();
  try{
   if(mode==='login'){
    const {error}=await client.auth.signInWithPassword({email:address,password});
    if(error&&/email not confirmed/i.test(error.message)){await sendCode('signup');awaitCode('signup');setMessage(t('Please verify your email first. We sent you a new code.','Vahvista ensin sähköpostisi. Lähetimme uuden koodin.'));return}
    if(error)throw error;
   }else if(mode==='code'){
    await sendCode('email');awaitCode('email');
   }else if(mode==='signup'){
    const {data,error}=await client.auth.signUp({email:address,password,options:{emailRedirectTo:linkRedirect()}});if(error)throw error;
    if(data.user&&data.user.identities?.length===0)throw new Error(t('An account with this email already exists. Sign in instead.','Tällä sähköpostilla on jo tili. Kirjaudu sisään.'));
    if(!data.session)awaitCode('signup');
   }else if(mode==='reset'){
    await sendCode('recovery');awaitCode('recovery');
   }else if(mode==='verify'){
    if(codeFor==='recovery')setRecovering(true);
    const {error}=await client.auth.verifyOtp({email:address,token:code.trim(),type:codeFor});
    if(error)throw error;
    if(codeFor==='recovery'){setMode('recovery');setMessage('')}
   }else{
    const {error}=await client.auth.updateUser({password});if(error)throw error;setMode('login');setMessage(t('Password updated.','Salasana päivitetty.'));
   }
   setPassword('');
  }catch(e){setError(friendly(e))}finally{setRecovering(false);setBusy(false)}
 }
 async function resend(){
  if(busy)return;setBusy(true);setError('');
  try{await sendCode(codeFor);setMessage(t('A new code is on its way.','Uusi koodi on matkalla.'))}catch(e){setError(friendly(e))}finally{setBusy(false)}
 }
 async function signOut(){
  if(!window.confirm(t('Sign out? Save any open writing first.','Kirjaudutaanko ulos? Tallenna avoimet tekstit ensin.')))return;
  const {error}=await getSupabase().auth.signOut();if(error)setError(error.message);
 }
 if(!ready)return <div className="email-auth"><p role="status">{t('Opening Morningfy…','Avataan Morningfy…')}</p></div>;
 if(session&&mode!=='recovery'&&!recovering)return <><Morningfy key={session.user.id+':'+version} stateRequest={emailStateRequest} homeHref="/" accountControls={(f)=> <><p>{session.user.email}</p><p>{f?'Sama sähköpostitili pitää laitteidesi historian ajan tasalla.':'Use this email account on both devices to keep your history in sync.'}</p><button className="text-button" onClick={signOut}>{f?'Kirjaudu ulos':'Sign out'}</button>{message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}</>}/></>;
 const title=mode==='signup'?t('Make room for you.','Tee tilaa itsellesi.'):mode==='reset'?t('Reset your password.','Palauta salasanasi.'):mode==='recovery'?t('Choose a new password.','Valitse uusi salasana.'):mode==='verify'?t('Check your email.','Tarkista sähköpostisi.'):t('Welcome back.','Tervetuloa takaisin.');
 const action=mode==='login'?t('Sign in','Kirjaudu sisään'):mode==='code'?t('Email me a code','Lähetä koodi'):mode==='signup'?t('Create account','Luo tili'):mode==='reset'?t('Send reset code','Lähetä palautuskoodi'):mode==='verify'?(codeFor==='signup'?t('Verify email','Vahvista sähköposti'):t('Continue','Jatka')):t('Save password','Tallenna salasana');
 const askEmail=mode==='login'||mode==='code'||mode==='signup'||mode==='reset',askPassword=mode==='login'||mode==='signup'||mode==='recovery';
 return <div className="email-auth"><section className="email-auth-card"><div className="email-auth-top"><a className="brand" href="/"><Sunrise size={28}/>morningfy.</a><button onClick={()=>setFi(!fi)}>{fi?'English':'Suomi'}</button></div><h1>{title}</h1><p>{mode==='verify'?t('Enter the 6-digit code from the email.','Syötä sähköpostin 6-numeroinen koodi.'):t('Your mornings, saved in your own account.','Aamusi tallessa omalla tililläsi.')}</p><form onSubmit={submit}>
  {askEmail&&<label>{t('Email','Sähköposti')}<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>}
  {askPassword&&<label>{mode==='recovery'?t('New password','Uusi salasana'):t('Password','Salasana')}<input type="password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={mode==='login'?1:12} required value={password} onChange={e=>setPassword(e.target.value)}/>{mode!=='login'&&<small>{t('At least 12 characters.','Vähintään 12 merkkiä.')}</small>}</label>}
  {mode==='verify'&&<label>{t('Code','Koodi')}<input className="code-input" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" maxLength={10} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></label>}
  {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
  <button className="primary full" disabled={busy}>{busy?t('One moment…','Hetkinen…'):action}</button></form>
  <div className="email-auth-links">{mode==='login'?<><button onClick={()=>go('code')}>{t('Sign in with a code','Kirjaudu koodilla')}</button><button onClick={()=>go('reset')}>{t('Forgot password?','Unohditko salasanasi?')}</button><button onClick={()=>go('signup')}>{t('Create an account','Luo tili')}</button></>
   :mode==='code'?<><button onClick={()=>go('login')}>{t('Use password instead','Käytä salasanaa')}</button><button onClick={()=>go('signup')}>{t('Create an account','Luo tili')}</button></>
   :mode==='verify'?<><button onClick={resend} disabled={busy}>{t('Send a new code','Lähetä uusi koodi')}</button><button onClick={()=>go('login')}>{t('Back to sign in','Takaisin kirjautumiseen')}</button></>
   :mode==='recovery'?null:<button onClick={()=>go('login')}>{t('Back to sign in','Takaisin kirjautumiseen')}</button>}</div></section></div>;
}
