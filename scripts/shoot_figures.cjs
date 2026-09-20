/* Screenshot every chapter figure in the production build (desktop, mobile, dark). */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.env.QA_SCREENSHOT_DIR || '/tmp/fig-shots';
const IDS = process.argv.slice(2); // optional chapter id filter

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const preview = await (await import('vite')).preview({ preview: { host: '127.0.0.1', port: 0 } });
  const base = preview.resolvedUrls.local[0];
  const browser = await chromium.launch();
  const report = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(base, { waitUntil: 'networkidle' });
    const chapters = await page.$$eval('section.chapter', els =>
      els.map(e => e.id.replace(/^ch-/, '')).filter(id => !['home', 'lc'].includes(id)));
    const targets = IDS.length ? IDS : chapters;
    for (const id of targets) {
      for (const [tag, vp, dark] of [['d', { width: 1280, height: 900 }, false], ['m', { width: 390, height: 844 }, false], ['k', { width: 1280, height: 900 }, true]]) {
        await page.setViewportSize(vp);
        await page.goto(base + '#/' + id, { waitUntil: 'networkidle' });
        // theme lives in the app's in-memory store; drive it through the real toggle.
        await page.evaluate(async d => {
          const want = d ? 'dark' : 'light';
          for (let i = 0; i < 4 && document.documentElement.getAttribute('data-theme') !== want; i++) {
            document.getElementById('themeBtn').click();
            await new Promise(r => setTimeout(r, 30));
          }
          if (document.documentElement.getAttribute('data-theme') !== want) {
            throw new Error(`theme switch failed: still ${document.documentElement.getAttribute('data-theme')}, want ${want}`);
          }
        }, dark);
        const figs = await page.$$(`#ch-${id} figure`);
        for (let i = 0; i < figs.length; i++) {
          const shot = `${OUT}/${id}-${i}-${tag}.png`;
          await figs[i].scrollIntoViewIfNeeded();
          const img = await figs[i].$('img');
          if (img) await img.evaluate(el => el.decode().catch(() => {}));
          await page.waitForTimeout(60);
          await figs[i].screenshot({ path: shot });
          const box = await figs[i].boundingBox();
          const scroller = await figs[i].$('.fig-scroll, .eval-figure-scroll');
          const metrics = scroller ? await scroller.evaluate(el => ({ sw: el.scrollWidth, cw: el.clientWidth, iw: el.querySelector('img') ? el.querySelector('img').naturalWidth : 0 })) : null;
          report.push({ id, tag, i, w: Math.round(box.width), h: Math.round(box.height), metrics });
        }
      }
    }
  } finally {
    await browser.close();
    await new Promise((res, rej) => preview.httpServer.close(e => e ? rej(e) : res()));
  }
  const scrollers = report.filter(r => r.metrics && r.metrics.sw > r.metrics.cw + 4);
  console.log(JSON.stringify({ figures: report.length, scrollers: scrollers.map(s => `${s.id}-${s.i}-${s.tag}`) }, null, 1));
}

main().catch(e => { console.error(e); process.exit(1); });
