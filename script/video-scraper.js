import { chromium } from 'playwright';

const repos = [
    'Faith',
    'AgentCoderYBE'
];

async function recordRepos() {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        recordVideo: { dir: '../public' },
        viewport: { width: 1280, height: 720 }
    });

    for (const repo of repos) {
        console.log(`Recording: ${repo}...`);
        const page = await context.newPage();
        await page.goto(`https://github.com/Yacinewhatchandcode/${repo}`);
        await page.waitForTimeout(3000); // 3 seconds video
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(2000);
        const videoPath = await page.video().path();
        await page.close();

        // Rename video
        const fs = await import('fs');
        fs.renameSync(videoPath, `../public/video-${repo}.webm`);
    }

    await browser.close();
    console.log('Video recording complete.');
}

recordRepos().catch(console.error);
