import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {examples,iteratorExperiment} from './dist/examples.js';
const dir=path.resolve('qa/compiler');fs.mkdirSync(dir,{recursive:true});const report=[];
function compile(id,source){const file=path.join(dir,id+'.rs'),exe=path.join(dir,id+(process.platform==='win32'?'.exe':''));fs.writeFileSync(file,source);const p=spawnSync('rustc',[file,'--edition=2024','--error-format=json','-o',exe],{encoding:'utf8',timeout:60000});return{...p,exe};}
for(const e of examples){const p=compile(e.id,e.code);if(e.error){assert.notEqual(p.status,0,e.id);assert(p.stderr.includes('"code":"'+e.error+'"'),e.id+': '+p.stderr);report.push({id:e.id,result:'rejected',error:e.error});}else{assert.equal(p.status,0,e.id+': '+p.stderr);const r=spawnSync(p.exe,[],{encoding:'utf8',timeout:5000});assert.equal(r.status,0);assert.equal(r.stdout.replaceAll('\r\n','\n'),e.output,e.id);report.push({id:e.id,result:'passed',output:e.output});}}
let body='',count=0;
for(const input of ['1, 2, 3, 4, 5, 6','-3, -2, 0, 4',''])for(const filter of ['even','positive','all'])for(const map of ['double','square','increment'])for(const consumer of ['collect','sum']){const x=iteratorExperiment(input,filter,map,consumer);let code=x.code.slice('fn main() {\n'.length,-2).replace('println!("{result:?}");',`assert_eq!(format!("{result:?}"), ${JSON.stringify(x.output.trim())});`);body+='    {\n'+code+'\n    }\n';count++;}
const p=compile('iterator-matrix','fn main() {\n'+body+'}\n');assert.equal(p.status,0,p.stderr);assert.equal(spawnSync(p.exe,[],{encoding:'utf8',timeout:5000}).status,0);
assert.throws(()=>iteratorExperiment('1, nope'));assert.throws(()=>iteratorExperiment('1001'));assert.throws(()=>iteratorExperiment('1,'.repeat(25)));
const summary={compiler:spawnSync('rustc',['--version'],{encoding:'utf8'}).stdout.trim(),edition:2024,examples:report,iteratorCases:count};fs.writeFileSync('qa/compiler-report.json',JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
