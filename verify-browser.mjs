import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {modules} from './dist/course.js';
import {examples,iteratorExperiment} from './dist/examples.js';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright-core');
const lessons=modules.flatMap(m=>m.lessons),errors=[];fs.mkdirSync('qa',{recursive:true});
assert.equal(lessons.length,72);assert.equal(new Set(lessons.map(l=>l.id)).size,72);
for(const l of lessons){assert(l.quiz.options[l.quiz.answer]);assert(l.steps.every(s=>s.code&&s.body&&s.callout));assert(['ownership','borrowing','lifetimes','iterators'].includes(l.lab));}
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),headless:true});const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const snap=async(name,fullPage=false)=>page.screenshot({path:'qa/'+name+'.png',animations:'disabled',fullPage});
try{
 await page.goto('http://127.0.0.1:4180/#/rust-journey/3');await page.locator('.diagram').waitFor();await page.evaluate(()=>document.fonts.ready);assert.equal(await page.locator('h1').textContent(),'How Rust Runs');await snap('desktop');
 for(const l of lessons){await page.evaluate(id=>location.hash='#/'+id+'/3',l.id);await page.waitForFunction(t=>document.querySelector('h1')?.textContent===t,l.title);assert.equal(await page.locator('[aria-current="step"]').count(),1);}
 await page.evaluate(()=>location.hash='#/rust-journey/7');await page.locator('.goals.complete').waitFor();await page.reload();await page.locator('.goals.complete').waitFor();assert((await page.locator('#progress').textContent()).includes('1 / 72'));
 await page.keyboard.press('Control+k');await page.locator('#search-input').fill('borrow');assert(await page.locator('.search-option').count()>0);await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('.modal-backdrop'));
 await page.evaluate(()=>location.hash='#/practice/rust-journey');await page.locator('.quiz-option').first().waitFor();let answer=lessons[0].quiz.answer;await page.locator('[data-choice="'+((answer+1)%4)+'"]').click();await page.locator('[data-action="check-quiz"]').click();assert(await page.locator('.quiz-feedback:not(.success)').count());await page.locator('[data-choice="'+answer+'"]').click();await page.locator('[data-action="check-quiz"]').click();assert(await page.locator('.quiz-feedback.success').count());
 for(const group of ['ownership','borrowing','lifetimes']){
  await page.evaluate(g=>location.hash='#/lab/'+g,group);await page.locator('#trace-next').waitFor();
  for(const e of examples.filter(e=>e.group===group)){
   await page.locator('[data-example="'+e.id+'"]').click();assert.equal(new URL(await page.locator('.lab-controls a').getAttribute('href')).searchParams.get('code'),e.code);
   for(let i=1;i<e.frames.length;i++)await page.locator('#trace-next').click();assert(await page.locator('#trace-next').isDisabled());
   const result=await page.locator('#trace-output').textContent();assert(e.error?result.includes(e.error):result===e.output,e.id);
   await page.locator('#trace-reset').click();assert(await page.locator('#trace-back').isDisabled());
  }
 }
 await page.evaluate(()=>location.hash='#/lab/borrowing');await page.locator('[data-example="last-use"]').waitFor();await page.locator('[data-example="last-use"]').click();await page.locator('#trace-next').click();await page.locator('#trace-next').click();await snap('borrow-lab',true);
 const dl=page.waitForEvent('download');await page.locator('#download-rust').click();const download=await dl;await download.saveAs('qa/downloaded-example.rs');assert(fs.readFileSync('qa/downloaded-example.rs','utf8').includes('fn main()'));
 await page.locator('#trace-play').click();await page.evaluate(()=>location.hash='#/lab/iterators');await page.locator('#iterator-input').waitFor();await page.waitForTimeout(1600);assert.equal(await page.locator('#trace-code').count(),0);
 await page.locator('#iterator-input').fill('-3, -2, 0, 4');await page.locator('#iterator-map').selectOption('square');await page.locator('#iterator-consumer').selectOption('sum');await page.locator('#evaluate-pipeline').click();assert.equal(await page.locator('.pipeline-row').last().locator('.value-chips').textContent(),'20');assert.equal(new URL(await page.locator('#iterator-playground').getAttribute('href')).searchParams.get('code'),iteratorExperiment('-3, -2, 0, 4','even','square','sum').code);
 await page.locator('#iterator-input').fill('invalid');await page.locator('#evaluate-pipeline').click();assert(await page.locator('#iterator-error').textContent());assert(await page.locator('#download-rust').isDisabled());
 await page.locator('#iterator-input').fill('');await page.locator('#evaluate-pipeline').click();assert.equal(await page.locator('.pipeline-row').last().locator('.value-chips').textContent(),'0');
 await page.locator('#iterator-input').fill('1, 2, 3, 4, 5, 6');await page.locator('#iterator-consumer').selectOption('collect');await page.locator('[data-action="theme"]').click();await snap('iterator-dark',true);
 await page.evaluate(()=>location.hash='#/cheatsheets');await page.locator('.cheat-card').first().waitFor();assert.equal(await page.locator('.cheat-card').count(),12);
 await page.locator('[data-action="theme"]').click();await page.evaluate(()=>location.hash='#/rust-journey/3');await page.locator('.diagram').waitFor();await page.setViewportSize({width:1280,height:720});await snap('desktop-720');await page.locator('[data-action="toggle-view"]').click();await page.locator('.concept-card').waitFor();await page.locator('[data-action="toggle-view"]').click();
 await page.setViewportSize({width:390,height:844});await snap('mobile',true);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await page.locator('.sidebar').evaluate(e=>e.getBoundingClientRect().right<=0));await page.locator('[data-action="drawer"]').click();await snap('mobile-menu');await page.locator('.drawer-close').click();
 await page.evaluate(()=>location.hash='#/lab/ownership');await page.locator('#trace-next').waitFor();await snap('mobile-lab',true);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.evaluate(()=>location.hash='#/lab/iterators');await page.locator('#iterator-input').waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);const report={lessons:72,steps:lessons.reduce((n,l)=>n+l.steps.length,0),labExamples:examples.length,browser:'All lesson routes, quiz retry/success, search, persistence, traces, iterator inputs, download, Playground URLs, route cleanup, field guide, dark theme, desktop and mobile passed.',errors};fs.writeFileSync('qa/browser-report.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close()}
