const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  const variants = ['a','b','c'];
  const html = path.resolve(__dirname, 'icons.html');
  for (const v of variants) {
    await page.goto('file://' + html);
    await page.evaluate((v) => {
      document.body.innerHTML = '';
      const tpl = {
        a: `<div class="icon a"><div class="env"><div class="seal"><svg width="84" height="84" viewBox="0 0 24 24" fill="#fff"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div></div></div>`,
        b: `<div class="icon b"><div class="env"><div class="flap"></div><div class="flap-in"></div><div class="line"></div><div class="line short"></div></div></div>`,
        c: `<div class="icon c"><div class="book"><div class="row"></div><div class="row short"></div><div class="row"></div></div></div>`
      };
      document.body.innerHTML = tpl[v];
    }, v);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.resolve(__dirname, `icon-${v}.png`) });
    console.log(v, 'ok');
  }
  await browser.close();
})();
