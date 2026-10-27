import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from '@capacitor/app';
import {openNativeResource} from '../lib/platform';
import {Browser} from '@capacitor/browser';
import EmailApp from '../app/email-app';
import '../app/globals.css';
import './native.css';
const refresh=()=>window.dispatchEvent(new Event('focus'));
void App.addListener('appStateChange',({isActive})=>{if(isActive)refresh()});
void Browser.addListener('browserFinished',refresh);
createRoot(document.getElementById('root')!).render(<EmailApp/>);

document.addEventListener('click',event=>{
 const link=(event.target as Element).closest('a');
 if(link&&/^https?:/.test(link.href)){event.preventDefault();void openNativeResource(link.href).catch(()=>window.alert('Could not open this resource. Please try again.'))}
});
