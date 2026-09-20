/* Optional local QA: NODE_PATH may point to an existing Playwright install. */
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true,
    executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined});
  try {
    const context = await browser.newContext({viewport:{width:1440,height:1000}});
    const page = await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const url=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
    await page.goto(url);
    const routes=await page.evaluate(()=>DSH.chapters.map(c=>c.id));
    for(const id of routes){
      await page.evaluate(id=>location.hash='#/'+id,id);
      await page.waitForFunction(id=>document.querySelector('#ch-'+id).classList.contains('active'),id);
      assert.equal(await page.locator('.chapter.active').count(),1);
    }
    await page.goto(url+'#/evaluation-design');
    await page.locator('#biasCandidates').selectOption('100');
    await page.locator('#biasRun').click();
    assert.match(await page.locator('#biasResult').innerText(),/候选数=100/);
    const first=await page.locator('#biasResult').innerText();
    await page.locator('#biasRun').click();
    assert.equal(await page.locator('#biasResult').innerText(),first);
    await page.locator('#searchBtn').click();
    await page.locator('#paletteInput').fill('Hoeffding');
    assert.match(await page.locator('#paletteResults').innerText(),/统计与实验设计/);
    await page.keyboard.press('Escape');
    await page.locator('#searchBtn').click();
    await page.locator('#paletteInput').fill('fencing');
    assert.match(await page.locator('#paletteResults').innerText(),/队列、租约与故障恢复/);
    await page.keyboard.press('Escape');
    await page.locator('#themeBtn').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.locator('#themeBtn').click();
    await page.goto(url+'#/paper-lab');
    if(process.env.QA_SCREENSHOT_DIR){
      await page.screenshot({path:path.join(process.env.QA_SCREENSHOT_DIR,'research-desktop.png')});
    }
    await page.setViewportSize({width:390,height:844});
    await page.goto(url+'#/evaluation-design');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile horizontal overflow');
    await page.goto(url+'#/capstone');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'capstone mobile overflow');
    assert.match(await page.locator('#ch-capstone').innerText(),/16 周/);
    if(process.env.QA_SCREENSHOT_DIR){
      await page.screenshot({path:path.join(process.env.QA_SCREENSHOT_DIR,'research-mobile.png')});
    }
    // Legacy interactions still mount after the additional research data is loaded.
    await page.goto(url+'#/godel');
    assert.ok(await page.locator('#evoSim button').count()>0);
    await page.goto(url+'#/eval');
    await page.locator('#ch-eval details').filter({has:page.locator('#evalGateSim')}).locator(':scope > summary').click();
    await page.locator('#egRun').click();
    assert.match(await page.locator('#egLog').innerText(),/v1/);
    await page.goto(url+'#/quiz');
    assert.ok(await page.locator('#ch-quiz button').count()>0);
    assert.deepEqual(errors,[]);
    const nojs=await browser.newContext({javaScriptEnabled:false});
    const plain=await nojs.newPage();
    await plain.goto(url);
    assert.ok(await plain.locator('#ch-research-contract').isVisible());
    assert.ok(await plain.locator('#ch-capstone').isVisible());
    assert.ok(await plain.locator('noscript a[href="#ch-capstone-career"]').count());
    assert.ok(await plain.locator('noscript a[href="#ch-evaluation-design"]').count());
    assert.match(await plain.locator('#ch-evaluation-design').innerText(),/Hoeffding/);
    assert.equal(await plain.locator('[data-count="quiz"]').innerText(),'16');
    console.log(`Browser smoke passed: ${routes.length} routes, experiment, body search, themes, mobile, legacy controls, no-JS.`);
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
