import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const repos = [
    'Sovereign-Ecosystem',
    'Prime.AI',
    'Yace19ai.com',
    'Faith',
    'AIA-Creative-Lab',
    'BSQ',
    'SQ_BAHA',
    'AgentCoderYBE',
];

async function recordRepos() {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        recordVideo: { dir: '../public' },
        viewport: { width: 1280, height: 720 }
    });

    for (const repo of repos) {
        console.log(`Recording: ${repo}...`);
        try {
            const page = await context.newPage();
            await page.goto(`https://github.com/Yacinewhatchandcode/${repo}`);
            await page.waitForTimeout(2000);
            await page.mouse.wheel(0, 400);
            await page.waitForTimeout(1000);
            await page.mouse.wheel(0, 400);
            await page.waitForTimeout(1000);

            const videoPath = await page.video().path();
            await page.close();

            // Rename video to match repo name
            const newPath = path.join('../public', `video-${repo}.webm`);
            if (fs.existsSync(newPath)) fs.unlinkSync(newPath); // Remove if exists
            fs.renameSync(videoPath, newPath);
        } catch (e) {
            console.error(`Error recording ${repo}:`, e.message);
        }
    }

    await browser.close();
    console.log('Video recording complete.');
}

recordRepos().catch(console.error);
