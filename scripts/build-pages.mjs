import fs from 'node:fs/promises';
import path from 'node:path';

const output=path.resolve('_site');await fs.mkdir(output,{recursive:true});
for(const entry of await fs.readdir('dist',{withFileTypes:true})){
  if(['server','.openai'].includes(entry.name))continue;
  await fs.cp(path.join('dist',entry.name),path.join(output,entry.name),{recursive:true});
}
await fs.writeFile(path.join(output,'runtime-config.mjs'),'export const SNAPSHOT_ONLY = true;\n');
const manifest=JSON.parse(await fs.readFile(path.join(output,'manifest.webmanifest'),'utf8'));manifest.id='./';manifest.start_url='./';manifest.scope='./';
await fs.writeFile(path.join(output,'manifest.webmanifest'),JSON.stringify(manifest));
await fs.writeFile(path.join(output,'.nojekyll'),'');
console.log('GitHub Pages preparado em _site/.');
