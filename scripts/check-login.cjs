const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => {
    console.log(`[browser:${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', error => {
    console.error('[browser:error]', error);
  });
  await page.goto('https://unite-e8567.web.app/', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(5000);
  const bodyClass = await page.evaluate(() => document.body.className);
  const loginVisible = await page.evaluate(() => {
    const login = document.getElementById('loginScreen');
    if (!login) return 'missing';
    const style = window.getComputedStyle(login);
    return {
      display: style.display,
      opacity: style.opacity,
      visibility: style.visibility,
      hasLoadingClass: document.body.classList.contains('loading')
    };
  });
  console.log('Body class:', bodyClass);
  console.log('Login computed style:', loginVisible);
  await browser.close();
})();
