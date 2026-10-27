import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'Morningfy · A little further',description:'A quieter morning. Make room for learning.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'Morningfy',statusBarStyle:'default'},icons:{icon:'/favicon.svg',apple:'/apple-touch-icon.png'}};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
