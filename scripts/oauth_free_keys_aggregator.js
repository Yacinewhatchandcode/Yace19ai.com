/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  SOVEREIGN FREE API KEY AGGREGATOR                          ║
 * ║  Runtime: Node.js + Playwright                              ║
 * ║  Providers: NVIDIA Build, Google AI Studio, OpenRouter,     ║
 * ║             Groq, GitHub Models, Cloudflare Workers,        ║
 * ║             GLM/BigModel (ZhipuAI)                          ║
 * ║  Auth: Google OAuth SSO + Direct Registration               ║
 * ║  Output: ./api_keys_ledger.json                             ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ────────────────────────────────────────────────────────────────
// CONFIGURATION
// ────────────────────────────────────────────────────────────────

const LEDGER_PATH = join(__dirname, 'api_keys_ledger.json');

const PROVIDERS = {
    nvidia_build: {
        name: 'NVIDIA Build',
        url: 'https://build.nvidia.com/explore/discover',
        auth: 'direct',       // No Google OAuth needed
        rateLimit: '40 req/min',
        freeModels: ['Qwen 2.5', 'DeepSeek V3', 'Nemotron', 'GLM-4', 'Llama 3.3'],
    },
    google_ai_studio: {
        name: 'Google AI Studio',
        url: 'https://aistudio.google.com/app/apikey',
        auth: 'google_oauth',
        rateLimit: '1,000,000 tokens/day',
        freeModels: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash'],
    },
    openrouter: {
        name: 'OpenRouter',
        url: 'https://openrouter.ai/keys',
        auth: 'google_oauth',
        rateLimit: 'varies per model',
        freeModels: ['GLM-4', 'Llama 3.3', 'Qwen 2.5', 'Mistral', 'DeepSeek V3'],
        note: 'Filter models by $0 pricing for free access',
    },
    groq: {
        name: 'Groq',
        url: 'https://console.groq.com/keys',
        auth: 'google_oauth',
        rateLimit: 'varies',
        freeModels: ['Llama 3.3', 'Qwen 2.5', 'Mixtral 8x7B'],
    },
    github_models: {
        name: 'GitHub Models',
        url: 'https://github.com/marketplace/models',
        auth: 'github_token',
        rateLimit: 'limited free tier',
        freeModels: ['GPT-4o', 'DeepSeek V3', 'Llama 3.3', 'Mistral Large'],
        note: 'Uses Personal Access Token (PAT), not API key',
    },
    cloudflare_workers_ai: {
        name: 'Cloudflare Workers AI',
        url: 'https://developers.cloudflare.com/workers-ai/models/',
        auth: 'cloudflare_account',
        rateLimit: '10,000 neurons/day free',
        freeModels: ['Llama 3.3', 'Mistral 7B', 'Qwen 1.5'],
    },
    zhipuai_bigmodel: {
        name: 'ZhipuAI BigModel (GLM)',
        url: 'https://open.bigmodel.cn/',
        auth: 'direct',
        rateLimit: 'refreshes every 2 hours',
        freeModels: ['GLM-4', 'GLM-4V'],
    },
};

// ────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ────────────────────────────────────────────────────────────────

function loadEnv() {
    const envPath = join(__dirname, '..', '.env.local');
    const env = {};
    if (existsSync(envPath)) {
        const lines = readFileSync(envPath, 'utf-8').split('\n');
        for (const line of lines) {
            const match = line.match(/^([A-Z_]+)=(.+)$/);
            if (match) env[match[1]] = match[2].trim();
        }
    }
    return env;
}

function loadLedger() {
    if (existsSync(LEDGER_PATH)) {
        return JSON.parse(readFileSync(LEDGER_PATH, 'utf-8'));
    }
    return { keys: [], meta: { created: new Date().toISOString() } };
}

function saveLedger(ledger) {
    ledger.meta.updated = new Date().toISOString();
    writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
    console.log(`[LEDGER] Saved to ${LEDGER_PATH}`);
}

function addKeyToLedger(ledger, provider, keyValue, status, notes = '') {
    ledger.keys.push({
        provider,
        key: keyValue,
        status,
        notes,
        timestamp: new Date().toISOString(),
    });
}

function log(provider, msg) {
    const ts = new Date().toISOString().slice(11, 19);
    console.log(`[${ts}] [${provider}] ${msg}`);
}

// ────────────────────────────────────────────────────────────────
// PROVIDER: NVIDIA BUILD (Direct — no OAuth)
// ────────────────────────────────────────────────────────────────

async function resolveNvidia(ledger, env) {
    const provider = 'NVIDIA Build';

    // Check if key already exists in environment
    if (env.NVIDIA_API_KEY) {
        log(provider, `✅ Key already present in .env.local: ${env.NVIDIA_API_KEY.slice(0, 12)}...`);
        addKeyToLedger(ledger, provider, env.NVIDIA_API_KEY, 'active', 'Pre-existing from .env.local');
        return;
    }

    log(provider, '🔶 No NVIDIA_API_KEY found in .env.local');
    log(provider, '→ Manual steps:');
    log(provider, '  1. Go to https://build.nvidia.com/explore/discover');
    log(provider, '  2. Click "Get API Key" → "Generate Key"');
    log(provider, '  3. Copy key and add NVIDIA_API_KEY=nvapi-xxx to .env.local');
    addKeyToLedger(ledger, provider, 'MISSING', 'pending', 'Requires manual generation at build.nvidia.com');
}

// ────────────────────────────────────────────────────────────────
// PROVIDER: GOOGLE AI STUDIO (Google OAuth)
// ────────────────────────────────────────────────────────────────

async function resolveGoogleAiStudio(browser, ledger) {
    const provider = 'Google AI Studio';
    log(provider, '🔄 Opening Google AI Studio...');

    const page = await browser.newPage();
    try {
        await page.goto('https://aistudio.google.com/app/apikey', {
            waitUntil: 'networkidle',
            timeout: 30000,
        });

        // Check if already authenticated via cookie/session
        const url = page.url();
        if (url.includes('accounts.google.com')) {
            log(provider, '🔐 Google login required — will attempt SSO from existing session');
            // Wait for potential auto-redirect if session exists
            await page.waitForTimeout(5000);
            if (page.url().includes('accounts.google.com')) {
                log(provider, '⚠️ Manual Google login required. Open browser to complete.');
                addKeyToLedger(ledger, provider, 'AUTH_REQUIRED', 'pending', 'Google login needed');
                return;
            }
        }

        log(provider, '✅ Session active. Looking for API key UI...');

        // Look for existing keys or create button
        const createBtn = await page.$('button:has-text("Create API key")');
        if (createBtn) {
            log(provider, '→ Found "Create API key" button');
            // Don't auto-click to avoid creating unwanted keys
            addKeyToLedger(ledger, provider, 'READY_TO_CREATE', 'ready',
                'Button available. Run with --create flag to generate.');
        }

        // Check for already visible keys
        const keyElements = await page.$$('[data-testid="api-key"]');
        if (keyElements.length > 0) {
            log(provider, `✅ Found ${keyElements.length} existing key(s)`);
            addKeyToLedger(ledger, provider, `${keyElements.length}_KEYS_EXIST`, 'active',
                'Keys already provisioned');
        }
    } catch (err) {
        log(provider, `❌ Error: ${err.message}`);
        addKeyToLedger(ledger, provider, 'ERROR', 'error', err.message);
    } finally {
        await page.close();
    }
}

// ────────────────────────────────────────────────────────────────
// PROVIDER: OPENROUTER (Google OAuth / Email)
// ────────────────────────────────────────────────────────────────

async function resolveOpenRouter(browser, ledger) {
    const provider = 'OpenRouter';
    log(provider, '🔄 Opening OpenRouter...');

    const page = await browser.newPage();
    try {
        await page.goto('https://openrouter.ai/keys', {
            waitUntil: 'networkidle',
            timeout: 30000,
        });

        await page.waitForTimeout(3000);
        const url = page.url();

        if (url.includes('/auth') || url.includes('login')) {
            log(provider, '🔐 Login required');
            addKeyToLedger(ledger, provider, 'AUTH_REQUIRED', 'pending', 'Login required at openrouter.ai');
        } else {
            log(provider, '✅ Session active');
            // Check for existing keys
            const keyRows = await page.$$('tr, [class*="key"]');
            log(provider, `→ Found ${keyRows.length} key-related elements`);
            addKeyToLedger(ledger, provider, 'SESSION_ACTIVE', 'ready',
                'Authenticated. Navigate to /keys to manage.');
        }
    } catch (err) {
        log(provider, `❌ Error: ${err.message}`);
        addKeyToLedger(ledger, provider, 'ERROR', 'error', err.message);
    } finally {
        await page.close();
    }
}

// ────────────────────────────────────────────────────────────────
// PROVIDER: GROQ (Google OAuth / GitHub)
// ────────────────────────────────────────────────────────────────

async function resolveGroq(browser, ledger) {
    const provider = 'Groq';
    log(provider, '🔄 Opening Groq Console...');

    const page = await browser.newPage();
    try {
        await page.goto('https://console.groq.com/keys', {
            waitUntil: 'networkidle',
            timeout: 30000,
        });

        await page.waitForTimeout(3000);
        const url = page.url();

        if (url.includes('login') || url.includes('auth')) {
            log(provider, '🔐 Login required');
            addKeyToLedger(ledger, provider, 'AUTH_REQUIRED', 'pending', 'Login required at console.groq.com');
        } else {
            log(provider, '✅ Session active');
            const createBtn = await page.$('button:has-text("Create API Key")');
            if (createBtn) {
                log(provider, '→ "Create API Key" button available');
            }
            addKeyToLedger(ledger, provider, 'SESSION_ACTIVE', 'ready',
                'Authenticated. Use console to create/manage keys.');
        }
    } catch (err) {
        log(provider, `❌ Error: ${err.message}`);
        addKeyToLedger(ledger, provider, 'ERROR', 'error', err.message);
    } finally {
        await page.close();
    }
}

// ────────────────────────────────────────────────────────────────
// PROVIDER: GITHUB MODELS (Personal Access Token)
// ────────────────────────────────────────────────────────────────

async function resolveGitHubModels(browser, ledger) {
    const provider = 'GitHub Models';
    log(provider, '🔄 Opening GitHub Token Settings...');

    const page = await browser.newPage();
    try {
        await page.goto('https://github.com/settings/tokens', {
            waitUntil: 'networkidle',
            timeout: 30000,
        });

        await page.waitForTimeout(3000);
        const url = page.url();

        if (url.includes('login')) {
            log(provider, '🔐 GitHub login required');
            addKeyToLedger(ledger, provider, 'AUTH_REQUIRED', 'pending', 'Login required at github.com');
        } else {
            log(provider, '✅ GitHub session active');
            const tokenRows = await page.$$('.listgroup-item, [class*="token"]');
            log(provider, `→ Found ${tokenRows.length} token-related elements`);
            addKeyToLedger(ledger, provider, 'SESSION_ACTIVE', 'ready',
                'Navigate to github.com/marketplace/models for model-specific access.');
        }
    } catch (err) {
        log(provider, `❌ Error: ${err.message}`);
        addKeyToLedger(ledger, provider, 'ERROR', 'error', err.message);
    } finally {
        await page.close();
    }
}

// ────────────────────────────────────────────────────────────────
// PROVIDER: CLOUDFLARE WORKERS AI (Account-based)
// ────────────────────────────────────────────────────────────────

async function resolveCloudflare(browser, ledger) {
    const provider = 'Cloudflare Workers AI';
    log(provider, '🔄 Opening Cloudflare Dashboard...');

    const page = await browser.newPage();
    try {
        await page.goto('https://dash.cloudflare.com/', {
            waitUntil: 'networkidle',
            timeout: 30000,
        });

        await page.waitForTimeout(3000);
        const url = page.url();

        if (url.includes('login') || url.includes('sign-up')) {
            log(provider, '🔐 Cloudflare login required');
            addKeyToLedger(ledger, provider, 'AUTH_REQUIRED', 'pending',
                'Login at dash.cloudflare.com → AI → Workers AI → API Tokens');
        } else {
            log(provider, '✅ Cloudflare session active');
            addKeyToLedger(ledger, provider, 'SESSION_ACTIVE', 'ready',
                'Navigate to AI > Workers AI for free inference tokens.');
        }
    } catch (err) {
        log(provider, `❌ Error: ${err.message}`);
        addKeyToLedger(ledger, provider, 'ERROR', 'error', err.message);
    } finally {
        await page.close();
    }
}

// ────────────────────────────────────────────────────────────────
// PROVIDER: ZHIPUAI / BIGMODEL (Direct Registration)
// ────────────────────────────────────────────────────────────────

async function resolveZhipuAI(browser, ledger) {
    const provider = 'ZhipuAI BigModel';
    log(provider, '🔄 Opening BigModel platform...');

    const page = await browser.newPage();
    try {
        await page.goto('https://open.bigmodel.cn/usercenter/apikeys', {
            waitUntil: 'networkidle',
            timeout: 30000,
        });

        await page.waitForTimeout(3000);
        const url = page.url();

        if (url.includes('login') || url.includes('register')) {
            log(provider, '🔐 BigModel login/registration required');
            addKeyToLedger(ledger, provider, 'AUTH_REQUIRED', 'pending',
                'Register at open.bigmodel.cn for free GLM-4/GLM-4V access');
        } else {
            log(provider, '✅ BigModel session active');
            addKeyToLedger(ledger, provider, 'SESSION_ACTIVE', 'ready',
                'Free cloud API with 2-hour refresh cycle');
        }
    } catch (err) {
        log(provider, `❌ Error: ${err.message}`);
        addKeyToLedger(ledger, provider, 'ERROR', 'error', err.message);
    } finally {
        await page.close();
    }
}

// ────────────────────────────────────────────────────────────────
// MAIN ORCHESTRATOR
// ────────────────────────────────────────────────────────────────

async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  SOVEREIGN FREE API KEY AGGREGATOR v2.0                     ║');
    console.log('║  Timestamp: ' + new Date().toISOString().padEnd(47) + '║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

    const env = loadEnv();
    const ledger = loadLedger();

    // Clear previous run keys
    ledger.keys = [];

    // ── Phase 1: Direct API Keys (No Browser) ──
    console.log('━━━ PHASE 1: DIRECT API KEYS (No Browser Required) ━━━');
    await resolveNvidia(ledger, env);

    // ── Phase 2: Browser-Based OAuth Probing ──
    console.log('');
    console.log('━━━ PHASE 2: BROWSER-BASED SESSION PROBING ━━━');
    console.log('Launching Chromium (headed mode for OAuth visibility)...');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500,          // Human-speed interaction
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-first-run',
            '--disable-default-apps',
        ],
    });

    // Create a persistent context to share cookies across pages
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        viewport: { width: 1440, height: 900 },
    });

    // Use context-based browser for shared session
    const contextBrowser = {
        newPage: () => context.newPage(),
    };

    try {
        // Execute all providers sequentially (shared cookie jar)
        await resolveGoogleAiStudio(contextBrowser, ledger);
        await resolveOpenRouter(contextBrowser, ledger);
        await resolveGroq(contextBrowser, ledger);
        await resolveGitHubModels(contextBrowser, ledger);
        await resolveCloudflare(contextBrowser, ledger);
        await resolveZhipuAI(contextBrowser, ledger);
    } finally {
        await context.close();
        await browser.close();
    }

    // ── Phase 3: Summary Report ──
    console.log('');
    console.log('━━━ PHASE 3: EXECUTION LEDGER ━━━');
    console.log('');

    const statusCounts = { active: 0, ready: 0, pending: 0, error: 0 };
    for (const entry of ledger.keys) {
        const icon = {
            active: '🟢', ready: '🟡', pending: '🟠', error: '🔴'
        }[entry.status] || '⚫';

        console.log(`  ${icon} ${entry.provider.padEnd(25)} ${entry.status.toUpperCase().padEnd(10)} ${entry.notes}`);
        statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1;
    }

    console.log('');
    console.log(`  Summary: ${statusCounts.active} active | ${statusCounts.ready} ready | ${statusCounts.pending} pending | ${statusCounts.error} errors`);
    console.log('');

    // Save ledger
    saveLedger(ledger);

    // ── Phase 4: Provider Reference Table ──
    console.log('━━━ PROVIDER REFERENCE (Free Tier Limits) ━━━');
    console.log('');
    for (const [id, p] of Object.entries(PROVIDERS)) {
        console.log(`  ${p.name}`);
        console.log(`    URL:        ${p.url}`);
        console.log(`    Auth:       ${p.auth}`);
        console.log(`    Rate Limit: ${p.rateLimit}`);
        console.log(`    Models:     ${p.freeModels.join(', ')}`);
        if (p.note) console.log(`    Note:       ${p.note}`);
        console.log('');
    }

    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  EXECUTION COMPLETE                                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
}

main().catch((err) => {
    console.error('[FATAL] Aggregator crashed:', err);
    process.exit(1);
});
