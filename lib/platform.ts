import {Capacitor} from '@capacitor/core';
export const isNative=()=>Capacitor.isNativePlatform();
export async function openNativeResource(url:string){
 const parsed=new URL(url);
 if(parsed.protocol!=='https:'&&parsed.protocol!=='http:')throw new Error('Unsupported resource');
 const {Browser}=await import('@capacitor/browser');
 await Browser.open({url:parsed.href});
}
