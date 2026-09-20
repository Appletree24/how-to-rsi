/* Exercises the production build; QA_BASE_URL can target a running dev/preview server. */
const assert = require('node:assert/strict');
const path = require('node:path');
const {chromium} = require('playwright');
(async () => {
  let preview;
  let url = process.env.QA_BASE_URL;
  if (!url) {
    preview = await (await import('vite')).preview({preview:{host:'127.0.0.1',port:0}});
    url = preview.resolvedUrls.local[0];
  }
  url = url.replace(/\/?$/, '/');
  let browser;
  try {
    browser = await chromium.launch({headless:true,
      executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined});
    const context = await browser.newContext({viewport:{width:1440,height:1000}});
    const page = await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    // Observe navigation rather than relying on a global data object.
    await page.goto(url);
    await page.waitForSelector('#navList a[data-ch]');
    const routes=await page.locator('#navList a[data-ch]').evaluateAll(links=>links.map(a=>a.dataset.ch));
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
    await page.goto(url+'#/paper-lab');
    await page.locator('#searchBtn').click();
    await page.locator('#paletteInput').fill('Hoeffding');
    const statisticsTitle = await page.locator('#ch-evaluation-design h1').innerText();
    await page.locator('#paletteResults .p-item').filter({hasText:statisticsTitle}).click();
    await page.waitForFunction(()=>location.hash==='#/evaluation-design' &&
      document.querySelector('#ch-evaluation-design').classList.contains('active'));
    await page.locator('#searchBtn').click();
    await page.locator('#paletteInput').fill('fencing');
    const platformTitle = await page.locator('#ch-capstone-platform h1').innerText();
    await page.locator('#paletteResults .p-item').filter({hasText:platformTitle}).click();
    await page.waitForFunction(()=>location.hash==='#/capstone-platform' &&
      document.querySelector('#ch-capstone-platform').classList.contains('active'));
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
    await page.goto(url+'#/eval');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'evaluation chapter mobile overflow');
    assert.ok(await page.locator('#ch-eval .eval-figure-scroll').evaluateAll(figures=>
      figures.length===3&&figures.every(figure=>figure.scrollWidth>figure.clientWidth)
    ),'evaluation diagrams should scroll inside their own containers');
    if(process.env.QA_SCREENSHOT_DIR){
      await page.screenshot({path:path.join(process.env.QA_SCREENSHOT_DIR,'research-mobile.png')});
    }
    // Existing interactions still initialize through the TypeScript module entry.
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
  } finally {
    if (browser) await browser.close();
    if (preview) await new Promise((resolve,reject)=>preview.httpServer.close(error=>error?reject(error):resolve()));
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
