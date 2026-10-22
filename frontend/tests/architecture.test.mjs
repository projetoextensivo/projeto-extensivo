import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, relative, dirname, sep } from 'node:path';
const root=resolve('src');
const layers=['app','pages','widgets','features','entities','shared'];
test('FSD: imports respeitam as camadas, slices e APIs publicas',()=>{
 const violations=[];
 for(const name of readdirSync(root,{recursive:true}).filter(name=>/\.(jsx?|tsx?)$/.test(name))){
  const file=resolve(root,name);const parts=name.split(sep);const layer=parts[0];
  if(!layers.includes(layer))continue;
  const source=readFileSync(file,'utf8');
  for(const match of source.matchAll(/(?:from\s*|import\s*)['"]((?:\.|@\/)[^'"]+)['"]/g)){
   const specifier=match[1];
   const target=specifier.startsWith('@/')?resolve(root,specifier.slice(2)):resolve(dirname(file),specifier);
   const targetParts=relative(root,target).split(sep);const targetLayer=targetParts[0];
   if(!layers.includes(targetLayer))continue;
   if(layers.indexOf(targetLayer)<layers.indexOf(layer))violations.push(name+' importa camada superior '+specifier);
   if(layer===targetLayer&&!['app','shared'].includes(layer)&&parts[1]!==targetParts[1])violations.push(name+' importa outra slice da mesma camada '+specifier);
   if(layer!==targetLayer&&!['app','shared'].includes(targetLayer)&&targetParts.length>2)violations.push(name+' ignora a API publica '+specifier);
   if(![target,target+'.js',target+'.jsx',resolve(target,'index.js'),resolve(target,'index.jsx')].some(p=>existsSync(p)&&statSync(p).isFile()))violations.push(name+' importa arquivo inexistente '+specifier);
  }
 }
 assert.deepEqual(violations,[]);
});
test('FSD: slices de negocio expõem index.js e organizam implementacao em segmentos',()=>{
 for(const layer of ['pages','widgets','features','entities']){
  for(const slice of readdirSync(resolve(root,layer),{withFileTypes:true}).filter(item=>item.isDirectory())){
   const base=resolve(root,layer,slice.name);
   assert.ok(existsSync(resolve(base,'index.js')),layer+'/'+slice.name+' precisa de uma API publica');
   assert.ok(['ui','model','api','lib','config'].some(segment=>existsSync(resolve(base,segment))),layer+'/'+slice.name+' precisa de um segmento');
   const source=readFileSync(resolve(base,'index.js'),'utf8');
   assert.ok(!source.includes('export *'),layer+'/'+slice.name+' deve exportar nomes explicitos');
  }
 }
});
