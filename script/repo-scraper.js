import { chromium } from 'playwright';
import fs from 'fs';

const repos = [
  'Sovereign-Ecosystem',
  'Prime.AI',
  'Yace19ai.com',
  'mcp-registry',
  'Faith',
  'AIA-Creative-Lab',
  'hyperswitch-cloud',
  'hyperswitch-railway',
  'converse-final-solution',
  'lovable-spirit-forge',
  'BSQ',
  'SQ_BAHA',
  'AgentCoderYBE',
  'https-github.com-Yacinewhatchandcode-AIA-DiscoVery'
];

async function run() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const page = await context.newPage();

    for(const repo of repos) {
        console.log(`Scanning: ${repo}...`);
        try {
            await page.goto(`https://github.com/Yacinewhatchandcode/${repo}`, { waitUntil: 'networkidle', timeout: 15000 });
            await page.waitForTimeout(1000);
            
            // Check for Readme
            const hasReadme = await page.locator('#readme').isVisible();
            if (hasReadme) {
                // Emulate human scrolling for GIF/Video capture logic wrapper
                for(let i = 0; i < 3; i++) {
                    await page.mouse.wheel(0, 500);
                    await page.waitForTimeout(500);
                }
            }
            // Capture full page screenshot of the repo as proof of scan
            await page.screenshot({ path: `public/repo-${repo}.png`, fullPage: false });
            
        } catch(e) {
            console.log(`Failed scanning ${repo}: ${e.message}`);
        }
    }

    await browser.close();
    console.log("Scraping complete.");
}

run();
