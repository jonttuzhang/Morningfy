import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'node:path';
export default defineConfig({root:resolve(import.meta.dirname,'mobile'),plugins:[react()],publicDir:resolve(import.meta.dirname,'public'),base:'./',build:{outDir:resolve(import.meta.dirname,'dist-mobile'),emptyOutDir:true}});
