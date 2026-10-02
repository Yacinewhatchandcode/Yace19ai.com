const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = 'http://127.0.0.1:4181';
const checks = [];
fs.mkdirSync('qa-evidence/interactions', { recursive: true });

async function check(name, task) {
  try {
    const details = await task();
    checks.push({ name, pass: true, details });
  } catch (error) {
    checks.push({ name, pass: false, error: error.message });
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'] });
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', hasTouch: true });
    const page = await context.newPage();
    const errors = [], remote = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/^https?:/.test(request.url()) && !request.url().startsWith(base)) remote.push(request.url()); });
    await page.goto(base);
    await check(`skip link ${width}`, async () => {
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.skip-link').evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');
    });
    await check(`navigation and history ${width}`, async () => {
      for (const pathname of ['/fleet', '/games', '/philosophy', '/media', '/']) {
        await page.locator(`nav a[href="${pathname}"]`).click();
        assert.equal(new URL(page.url()).pathname, pathname);
        assert.equal(await page.locator('main h1').count(), 1);
      }
      await page.goBack();
      assert.equal(new URL(page.url()).pathname, '/media');
    });
    await check(`FR persistence and archive boundary ${width}`, async () => {
      await page.getByRole('button', { name: 'FR', exact: true }).click();
      assert.equal(await page.locator('html').getAttribute('lang'), 'fr');
      await page.reload();
      assert.equal(await page.locator('html').getAttribute('lang'), 'fr');
      await page.goto(base + '/fleet');
      assert.match(await page.locator('.intro').innerText(), /anglaises non vérifiées/);
      assert.equal(await page.locator('details[lang="en"]').count(), 21);
      await page.locator('details').first().locator('summary').click();
      assert.equal(await page.locator('details').first().getAttribute('open'), '');
    });
    await check(`Pages direct route entries ${width}`, async () => {
      for (const pathname of ['/fleet/', '/games/', '/philosophy/', '/media/']) {
        const response = await page.goto(base + pathname);
        assert.equal(response.status(), 200);
        assert.doesNotMatch(await page.title(), /Not found|Introuvable/);
      }
    });
    await check(`platformer start/move/pause/touch ${width}`, async () => {
      await page.goto(base + '/games/platformer/index.html');
      await page.getByRole('button', { name: 'Start', exact: true }).tap();
      await page.waitForTimeout(150);
      assert.equal(await page.evaluate(() => state), 3);
      const start = await page.evaluate(() => player.x);
      await page.keyboard.down('ArrowRight');
      await page.waitForTimeout(350);
      await page.keyboard.up('ArrowRight');
      assert.ok(await page.evaluate(() => player.x) > start);
      const muted = await page.evaluate(() => audio.muted);
      await page.keyboard.press('KeyM');
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate(() => audio.muted), !muted);
      await page.keyboard.press('KeyP');
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate(() => state), 4);
      await page.screenshot({ path: `qa-evidence/interactions/platformer-paused-${width}.jpg` });
    });
    await check(`platformer menu/back/native parity ${width}`, async () => {
      for (const pathname of ['/games/platformer/index.html', '/games/platformer/www/index.html']) {
        await page.goto(base + pathname);
        await page.getByRole('button', { name: 'Down', exact: true }).tap();
        await page.waitForTimeout(80);
        await page.getByRole('button', { name: 'Start', exact: true }).tap();
        await page.waitForTimeout(100);
        assert.equal(await page.evaluate(() => state), 1);
        await page.getByRole('button', { name: 'Right', exact: true }).tap();
        await page.waitForTimeout(80);
        assert.equal(await page.evaluate(() => lvlSel), 1);
        await page.getByRole('button', { name: 'Back', exact: true }).tap();
        await page.waitForTimeout(100);
        assert.equal(await page.evaluate(() => state), 0);
        await page.getByRole('button', { name: 'Up', exact: true }).tap();
        await page.waitForTimeout(80);
        await page.getByRole('button', { name: 'Down', exact: true }).tap();
        await page.waitForTimeout(80);
        await page.getByRole('button', { name: 'Down', exact: true }).tap();
        await page.waitForTimeout(80);
        await page.getByRole('button', { name: 'Start', exact: true }).tap();
        await page.waitForTimeout(100);
        assert.equal(await page.evaluate(() => state), 2);
        await page.getByRole('button', { name: 'Back', exact: true }).tap();
        await page.waitForTimeout(100);
        assert.equal(await page.evaluate(() => state), 0);
      }
    });
    await check(`swarm start and movement ${width}`, async () => {
      await page.goto(base + '/games/swarm-architect/index.html');
      await page.getByRole('button', { name: 'INITIALIZE CORE' }).click();
      assert.equal(await page.evaluate(() => state), 'PLAYING');
      const x = await page.evaluate(() => player.x);
      const right = page.getByRole('button', { name: 'Right', exact: true });
      const box = await right.boundingBox();
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.down();
      await page.waitForTimeout(350);
      await page.mouse.up();
      assert.ok(await page.evaluate(() => player.x) > x);
      assert.equal(await page.evaluate(() => keys.d), false);
      await page.screenshot({ path: `qa-evidence/interactions/swarm-playing-${width}.jpg` });
    });
    await check(`matrix offline execution guard ${width}`, async () => {
      await page.goto(base + '/sovereign/index.html');
      await page.waitForTimeout(700);
      await page.keyboard.down('KeyW');
      await page.waitForTimeout(900);
      await page.keyboard.up('KeyW');
      await page.keyboard.press('KeyE');
      await page.keyboard.press('Space');
      assert.match(await page.locator('.archive-banner').innerText(), /Execution disabled/);
      assert.ok(!remote.some(url => url.includes(':8000')));
      await page.screenshot({ path: `qa-evidence/interactions/matrix-offline-${width}.jpg` });
    });
    await check(`reduced motion ${width}`, async () => {
      await page.goto(base);
      assert.equal(await page.locator('.sg-ring-one').evaluate(el => getComputedStyle(el).animationName), 'none');
      await page.locator('.media-strip').scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      assert.equal(await page.locator('.media-strip video').evaluateAll(videos => videos.every(v => v.paused)), true);
    });
    await check(`no remote calls or page errors ${width}`, async () => {
      assert.deepEqual(errors, []);
      assert.deepEqual(remote, []);
    });
    await context.close();
  }
  const page = await browser.newPage();
  await check('gold contrast basics', async () => {
    const luminance = color => color.map(value => {
      const normalized = value / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
    const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
    const ratios = {
      body: contrast([204, 204, 214], [22, 22, 29]),
      goldLinks: contrast([244, 215, 122], [22, 22, 29]),
      buttonDarkestGradientPoint: contrast([0, 0, 0], [159.2, 130.2, 49.2]),
    };
    assert.ok(Object.values(ratios).every(value => value >= 4.5));
    return ratios;
  });
  await check('normal motion tilt and viewport-only muted reel', async () => {
    await page.goto(base);
    const card = page.locator('.card-3d').first();
    await card.scrollIntoViewIfNeeded();
    const box = await card.boundingBox();
    await page.mouse.move(box.x + box.width * .8, box.y + box.height * .4);
    await page.waitForTimeout(500);
    assert.notEqual(await card.evaluate(el => getComputedStyle(el).transform), 'none');
    await page.locator('.media-strip').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const state = await page.locator('.media-strip video').first().evaluate(video => ({ muted: video.muted, playsInline: video.playsInline, paused: video.paused }));
    assert.deepEqual(state, { muted: true, playsInline: true, paused: false });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.media-strip video').first().evaluate(video => video.paused), true);
  });
  await page.goto(base + '/media');
  const media = JSON.parse(fs.readFileSync('qa-evidence/media.json'));
  for (const item of media.filter(item => item.qa_status !== 'failed')) {
    await check(`browser playback ${item.url}`, async () => {
      const details = await page.evaluate(async ({ url }) => {
        const video = document.createElement('video');
        video.muted = true;
        video.src = url;
        document.body.append(video);
        try {
          await Promise.race([
            new Promise((resolve, reject) => {
              video.onloadedmetadata = resolve;
              video.onerror = () => reject(new Error('MediaError ' + video.error?.code));
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Metadata timeout')), 10000)),
          ]);
          await video.play();
          await new Promise(resolve => setTimeout(resolve, 250));
          if (video.currentTime <= 0) throw new Error('Playback did not advance');
          return { duration: video.duration, currentTime: video.currentTime, width: video.videoWidth, height: video.videoHeight };
        } finally {
          video.pause();
          video.removeAttribute('src');
          video.load();
          video.remove();
        }
      }, item);
      return details;
    });
  }
  await check('media ranges, unknown routes and CNAME', async () => {
    let response = await page.request.get(base + '/videos/faith-demo.mp4', { headers: { Range: 'bytes=0-99' } });
    assert.equal(response.status(), 206);
    assert.equal((await response.body()).length, 100);
    assert.match(response.headers()['content-range'], /^bytes 0-99\//);
    response = await page.request.get(base + '/videos/faith-demo.mp4', { headers: { Range: 'bytes=999999999-' } });
    assert.equal(response.status(), 416);
    response = await page.request.get(base + '/not-a-route');
    assert.equal(response.status(), 404);
    response = await page.request.get(base + '/CNAME');
    assert.equal((await response.text()).trim(), 'yace19ai.com');
  });
  const summary = { total: checks.length, passed: checks.filter(c => c.pass).length, failed: checks.filter(c => !c.pass).length };
  fs.writeFileSync('qa-evidence/interactions.json', JSON.stringify({ summary, checks }, null, 2) + '\n');
  console.log(JSON.stringify(summary));
  console.log(JSON.stringify(checks.filter(c => !c.pass), null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
