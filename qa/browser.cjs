const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = 'http://127.0.0.1:4181';
const stage = process.argv[2] || 'final';
const inventory = JSON.parse(fs.readFileSync('qa/routes.json'));
const out = `qa-evidence/${stage}`;
fs.mkdirSync(`${out}/screenshots`, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'] });
  const results = [], linkResults = new Map();
  for (const route of inventory.routes) {
    for (const width of [390, 1440]) {
      for (const locale of route.locales) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        await context.addInitScript(locale => localStorage.setItem('locale', locale), locale);
        const page = await context.newPage();
        const errors = [], requests = [], httpErrors = [], external = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        page.on('requestfailed', request => requests.push({ url: request.url(), error: request.failure()?.errorText }));
        page.on('request', request => { if (!request.url().startsWith(base) && /^https?:/.test(request.url())) external.push(request.url()); });
        page.on('response', response => { if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() }); });
        let status, fatal;
        try {
          status = (await page.goto(base + route.path, { waitUntil: 'networkidle', timeout: 30000 }))?.status();
          await page.waitForTimeout(600);
          await page.evaluate(async () => {
            // Exercise deferred media/images throughout the document, not just the first screen.
            for (let y = 0; y < document.body.scrollHeight; y += 800) {
              window.scrollTo(0, y);
              await new Promise(resolve => setTimeout(resolve, 60));
            }
            await Promise.all([...document.images].map(img => img.decode().catch(() => null)));
            window.scrollTo(0, 0);
          });
          const checks = await page.evaluate(() => {
            const body = document.body.innerText.trim();
            const canvas = [...document.querySelectorAll('canvas')].some(c => c.width > 0 && c.height > 0);
            return {
              words: body.split(/\s+/).filter(Boolean).length,
              empty: !body && !canvas,
              title: document.title, lang: document.documentElement.lang,
              overflow: document.documentElement.scrollWidth > innerWidth + 1,
              overflowElements: [...document.querySelectorAll('body *')].filter(el => {
                const r = el.getBoundingClientRect();
                return r.width && (r.left < -1 || r.right > innerWidth + 1) && getComputedStyle(el).position !== 'fixed';
              }).slice(0, 8).map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.slice(0, 80) })),
              brokenImages: [...document.images].filter(img => img.complete && !img.naturalWidth).map(img => img.src),
              links: [...document.querySelectorAll('a[href]')].map(a => a.href),
              heroVisual: [...document.querySelectorAll('canvas, video, .sg-orb, .archive-orb')].some(el => {
                const r = el.getBoundingClientRect();
                return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0;
              }),
            };
          });
          const slug = (route.path === '/' ? 'home' : route.path.replace(/[^a-z0-9]+/gi, '-'));
          const screenshot = `${out}/screenshots/${slug}-${width}-${locale}.jpg`;
          await page.screenshot({ path: screenshot, type: 'jpeg', quality: 65 });
          const fullScreenshot = `${out}/screenshots/${slug}-${width}-${locale}-full.jpg`;
          await page.screenshot({ path: fullScreenshot, fullPage: true, type: 'jpeg', quality: 65 });
          for (const url of checks.links.filter(url => url.startsWith(base))) {
            const parsed = new URL(url);
            const key = parsed.pathname + parsed.search + parsed.hash;
            if (!linkResults.has(key)) {
              const response = await context.request.get(url);
              let anchor = null;
              if (parsed.hash && parsed.pathname === route.path) {
                anchor = await page.evaluate(hash => !!document.getElementById(decodeURIComponent(hash.slice(1))), parsed.hash);
              }
              linkResults.set(key, { url, status: response.status(), anchor, pass: response.ok() && anchor !== false });
            }
          }
          results.push({
            path: route.path, url: base + route.path, width, locale, status,
            ...checks, errors, failedRequests: requests, httpErrors, externalRequests: external,
            screenshot, fullScreenshot, caption: `${checks.title} — ${width}px, ${locale}; ${route.kind === 'static' ? 'English archive' : 'local portfolio'}.`,
            pass: status === 200 && !checks.empty && !checks.overflow && !checks.brokenImages.length
              && !errors.length && !requests.length && !httpErrors.length && !external.length,
          });
        } catch (error) {
          fatal = error.message;
          results.push({ path: route.path, width, locale, status, fatal, errors, failedRequests: requests, pass: false });
        }
        await context.close();
      }
    }
  }
  const links = [...linkResults.values()];
  const summary = { stage, routeChecks: results.length, passed: results.filter(r => r.pass).length,
    failed: results.filter(r => !r.pass).length, links: links.length, failedLinks: links.filter(l => !l.pass).length };
  fs.writeFileSync(`${out}/browser.json`, JSON.stringify({ summary, results, links }, null, 2) + '\n');
  console.log(JSON.stringify(summary));
  console.log(JSON.stringify(results.filter(r => !r.pass).map(r => ({
    path: r.path, width: r.width, locale: r.locale, fatal: r.fatal, errors: r.errors,
    overflow: r.overflow, overflowElements: r.overflowElements, brokenImages: r.brokenImages,
    failedRequests: r.failedRequests, externalRequests: r.externalRequests
  })), null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
