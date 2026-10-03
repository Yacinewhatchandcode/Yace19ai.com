import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";
import { expect } from "playwright/test";

const base = process.env.PLAYWRIGHT_BASE_URL || "http://192.168.1.80:5175";
const routeInventory = JSON.parse(fs.readFileSync("qa/routes.json", "utf8"));
const results = [];
fs.mkdirSync("qa-evidence/constellation", { recursive: true });

async function check(name, task) {
  try {
    const details = await task();
    results.push({ name, pass: true, details });
  } catch (error) {
    results.push({ name, pass: false, error: error.message });
  }
}

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader-webgl", "--enable-unsafe-swiftshader"],
});

for (const width of [390, 1440]) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    isMobile: width < 600,
    hasTouch: width < 600,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") pageErrors.push(message.text());
  });
  await page.clock.install();
  await page.addInitScript(() => {
    const vitals = { lcp: 0, cls: 0 };
    try {
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        if (entries.length) vitals.lcp = entries[entries.length - 1].startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) vitals.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      // Older browser engines may not expose the entry types.
    }
    window.__constellationVitals = vitals;
  });
  await page.route("**/julia/embed.js", route => route.fulfill({
    status: 200,
    contentType: "text/javascript",
    headers: { "access-control-allow-origin": "*" },
    body: `window.PrimeJulia = {
      mount: ({ site, tools }) => {
        window.__juliaMount = { site, names: Object.keys(tools) };
        window.__juliaTools = tools;
        return {
          root: document.createElement('div'),
          getState: () => 'idle',
          getSession: () => ({ token: 'test-token-never-persisted', exp: Math.floor(Date.now() / 1000) + 3, ttl: 3 }),
          runTool: (name, args) => tools[name]?.(args),
          handoff: async () => {},
          open: () => {},
          unmount: () => {},
        };
      },
      mountConstellation: ({ site }) => {
        const root = document.createElement('section');
        Object.assign(root.style, { position: 'fixed', zIndex: '130', inset: '0', overflow: 'auto', background: '#fff', padding: '80px 22px 22px' });
        root.setAttribute('role', 'region');
        root.setAttribute('aria-label', 'Sovereign Constellation sites');
        for (const [id, name, role, hrefs] of [
          ['yace19ai', 'YACE19AI', 'Research & world models', ['/#mission', '/fleet#systems', '/#research-domains']],
          ['prime', 'PRIME-AI', 'Sovereign cognitive infrastructure', ['https://prime-ai.fr/', 'https://prime-ai.fr/#architecture', 'https://prime-ai.fr/#deployment']],
          ['amlazr', 'AMLAZR', 'Execution intelligence', ['https://amlazr.com/', 'https://amlazr.com/#workflows', 'https://amlazr.com/#outcomes']],
          ['network', 'LinkedIn', 'Network', ['https://www.linkedin.com/in/yacine-benhamou-b26386124/', 'https://github.com/Yacinewhatchandcode', 'https://calendly.com/info-primeai/30min']],
        ]) {
          const article = document.createElement('article');
          article.className = 'constellation-entry ' + id;
          const button = document.createElement('button');
          button.className = 'constellation-site-trigger';
          button.setAttribute('aria-expanded', 'false');
          button.innerHTML = '<span class="site-entry-copy"><strong>' + name + '</strong><span>' + role + '</span></span>' + (id === 'yace19ai' ? '<span class="current-site">You are here</span>' : '');
          const nav = document.createElement('nav');
          nav.className = 'site-deep-links';
          nav.setAttribute('aria-label', name + ' links');
          nav.hidden = true;
          for (const [index, href] of hrefs.entries()) {
            const anchor = document.createElement('a');
            anchor.href = href;
            anchor.textContent = ['Research', 'Lab systems', 'Research domains'][index];
            nav.append(anchor);
          }
          button.addEventListener('click', () => {
            nav.hidden = !nav.hidden;
            button.setAttribute('aria-expanded', String(!nav.hidden));
          });
          article.append(button, nav);
          root.append(article);
        }
        document.body.append(root);
        return { root, currentSite: site, origin: location.origin, open: () => { root.hidden = false; }, close: () => { root.hidden = true; }, unmount: () => root.remove() };
      },
    };`,
  }));

  await check(`home layout and research content at ${width}px`, async () => {
    await page.goto(base);
    await expect(page.getByRole("heading", { level: 1, name: "Research the possible." })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://yace19ai.com/");
    await expect(page.getByRole("heading", { name: "Our mission" })).toBeVisible();
    assert.equal(await page.locator(".mission-card").count(), 3);
    assert.equal(await page.locator(".layer-step").count(), 3);
    assert.equal(await page.locator(".domain-row").count(), 3);
    assert.equal(await page.locator(".evidence-list strong").count(), 3);
    const layout = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      title: document.title,
      lang: document.documentElement.lang,
      vitals: window.__constellationVitals,
    }));
    assert.ok(layout.document <= layout.viewport + 1, `horizontal overflow: ${JSON.stringify(layout)}`);
    assert.equal(layout.title, "Research the possible. | YACE19AI");
    assert.equal(layout.lang, "en");
    assert.ok(layout.vitals.lcp > 0, "Largest Contentful Paint was not observed");
    assert.ok(layout.vitals.cls < 0.1, `Cumulative Layout Shift too high: ${layout.vitals.cls}`);
    await page.screenshot({
      path: `qa-evidence/constellation/home-${width < 600 ? "mobile" : "desktop"}.png`,
      fullPage: true,
    });
    return { ...layout, vitals: { lcp: Math.round(layout.vitals.lcp), cls: Number(layout.vitals.cls.toFixed(3)) } };
  });

  await check(`route-specific metadata at ${width}px`, async () => {
    for (const route of ["/fleet", "/philosophy", "/games", "/media"]) {
      await page.goto(`${base}${route}`);
      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://yace19ai.com${route}`);
      const metadata = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
        graph: JSON.parse(document.querySelector("#yace19ai-jsonld")?.textContent || "{}"),
      }));
      assert.ok(metadata.title.includes("YACE19AI"), `${route} title is not route-specific`);
      assert.ok(metadata.description?.length > 40, `${route} description is missing`);
      assert.equal(metadata.canonical, `https://yace19ai.com${route}`);
      const graph = metadata.graph["@graph"];
      assert.ok(graph.some(item => item["@id"] === "https://prime-ai.fr/#constellation"));
      assert.ok(graph.some(item => item["@type"] === "BreadcrumbList"));
    }
    return "four secondary React routes have unique canonical head data and shared JSON-LD";
  });

  await check(`navigation and EN/FR language at ${width}px`, async () => {
    await page.goto(base);
    await page.getByRole("button", { name: "FR", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByRole("heading", { level: 1, name: "Explorer le possible." })).toBeVisible();
    await page.getByRole("button", { name: "EN", exact: true }).click();
    if (width < 600) await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("link", { name: "Lab systems" }).click();
    await expect(page).toHaveURL(/\/fleet$/);
    await expect(page.getByRole("heading", { level: 1, name: "Ideas, made explorable." })).toBeVisible();
  });

  await check(`constellation accordion at ${width}px`, async () => {
    await page.goto(base);
    await page.getByRole("button", { name: /Constellation/ }).click();
    const entries = page.locator(".constellation-entry");
    assert.equal(await entries.count(), 4);
    for (const [index, name] of ["YACE19AI", "PRIME-AI", "AMLAZR", "LinkedIn"].entries()) {
      const entry = entries.nth(index);
      await expect(entry.getByRole("button")).toContainText(name);
      await entry.getByRole("button").click();
      await expect(entry.locator(".site-deep-links a")).toHaveCount(3);
    }
    assert.equal(await page.locator('.site-deep-links a[href^="https://yace19ai.com"]').count(), 0);
    await expect(page.getByText("You are here")).toBeVisible();
    return "all four entries expand to three links; current site is marked";
  });

  await check(`Julia runtime integration and research tools at ${width}px`, async () => {
    await page.goto(base);
    await page.getByRole("button", { name: "Open Julia, research companion" }).click();
    await expect(page.getByRole("heading", { name: "Julia" })).toBeVisible();
    await page.getByRole("button", { name: "Start free 5-minute session" }).click();
    await expect(page.getByText(/Session active/)).toBeVisible();
    const mounted = await page.evaluate(() => window.__juliaMount);
    assert.equal(mounted.site, "yace19ai");
    assert.deepEqual(mounted.names, ["navigate", "scrollTo", "highlight", "click", "fill", "openConstellation", "switchSite"]);

    await page.evaluate(async () => {
      await window.__juliaTools.navigate({ path: "/fleet#systems" });
    });
    await expect(page).toHaveURL(/\/fleet#systems$/);
    await page.evaluate(async () => {
      await window.__juliaTools.navigate({ path: "/#research-domains" });
    });
    await expect(page).toHaveURL(/\/#research-domains$/);
    await expect(page.locator("#publication-query")).toBeVisible();
    await page.evaluate(async () => {
      await window.__juliaTools.scrollTo({ selector: "#domain-scientific-ai" });
    });
    await page.evaluate(async () => {
      await window.__juliaTools.fill({ selector: "#publication-query", value: "world models" });
      await window.__juliaTools.click({ selector: "#publication-search-submit" });
    });
    await expect(page.locator(".publication-search-status")).toContainText(/No DOI-verified publications match/);
    await page.evaluate(async () => {
      await window.__juliaTools.openConstellation({});
    });
    await expect(page.getByRole("region", { name: "Sovereign Constellation sites" })).toBeVisible();

    await page.clock.runFor(3_000);
    await expect(page.getByText(/five-minute preview has ended/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Continue the conversation/ })).toBeVisible();
    return "shared mount payload, route/section navigation, publication search and three-second mock issuer expiry";
  });

  await check(`skip link, archive routes and no browser errors at ${width}px`, async () => {
    await page.goto(base);
    await page.keyboard.press("Tab");
    assert.equal(await page.locator(".skip-link").evaluate(node => node === document.activeElement), true);
    for (const route of routeInventory.routes.filter(item => item.kind === "static")) {
      const response = await page.request.get(`${base}${route.path}`);
      assert.equal(response.status(), 200, `archive route failed: ${route.path}`);
    }
    for (const url of [
      `${base}/robots.txt`,
      `${base}/sitemap.xml`,
      `${base}/llms.txt`,
    ]) {
      const response = await page.request.get(url);
      assert.equal(response.status(), 200, `${url} not served`);
    }
    await page.goto(`${base}/unknown-page`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
    assert.deepEqual(pageErrors, []);
    return `${routeInventory.routes.filter(item => item.kind === "static").length} archive URLs return successfully`;
  });

  await check(`offline fallback at ${width}px`, async () => {
    const fallbackPage = await context.newPage();
    await fallbackPage.route("**/julia/embed.js", route => route.fulfill({
      status: 200,
      contentType: "text/javascript",
      headers: { "access-control-allow-origin": "*" },
      body: "window.PrimeJulia = undefined;",
    }));
    await fallbackPage.goto(base);
    await fallbackPage.getByRole("button", { name: /Constellation/ }).click();
    await expect(fallbackPage.getByText(/Shared constellation is offline/)).toBeVisible();
    for (let index = 0; index < 4; index++) {
      const entry = fallbackPage.locator(".constellation-entry").nth(index);
      await entry.getByRole("button").click();
      await expect(entry.locator(".site-deep-links a")).toHaveCount(3);
    }
    await fallbackPage.getByRole("button", { name: "Close constellation" }).click();
    await fallbackPage.getByRole("button", { name: "Open Julia, research companion" }).click();
    await fallbackPage.getByRole("button", { name: "Start free 5-minute session" }).click();
    await expect(fallbackPage.getByText(/could not be loaded/)).toBeVisible();
    await fallbackPage.close();
    return "offline shared runtime leaves local constellation links and Julia portrait fallback available";
  });

  await context.close();
}

await browser.close();
const summary = {
  total: results.length,
  passed: results.filter(result => result.pass).length,
  failed: results.filter(result => !result.pass).length,
};
fs.writeFileSync("qa-evidence/constellation/report.json", `${JSON.stringify({ summary, results }, null, 2)}\n`);
console.log(JSON.stringify(summary));
console.log(JSON.stringify(results.filter(result => !result.pass), null, 2));
if (summary.failed) process.exitCode = 1;
