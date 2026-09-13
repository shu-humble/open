import { build } from 'vite';
import { resolve } from 'node:path';
import { cpSync } from 'node:fs';
cpSync('public/chess-engine','chess-engine',{recursive:true});
// Keep a checked-in browser-ready bundle so the repository also works on plain static hosting.
await build({
  configFile:false,
  publicDir:false,
  build:{
    outDir:resolve('chess-trainer/generated'),
    emptyOutDir:false,
    lib:{entry:resolve('chess-trainer/app.js'),formats:['es'],fileName:()=> 'trainer.js'},
    minify:true,
  },
});
