import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ═══════════════════════════════════════════════════════════════
// ASRIEL ECOSYSTEM — Sovereign Self-Coding Orchestrator v6
//
// Master Prompt Architecture:
//   Pillar 1: Zero-latency direct answer (never redirect, always DO)
//   Pillar 2: Contextual multi-agent routing by intent (Agent Zero, ByteBot)
//   Pillar 3: Sector-adaptive content (6 industry themes)
//
// ═══════════════════════════════════════════════════════════════

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const VPS = Deno.env.get('VPS_HOST') || '31.97.52.22';
const KEYS = {
  groq: Deno.env.get('GROQ_API_KEY') || '',
  openai: Deno.env.get('OPENAI_API_KEY') || '',
  openrouter: Deno.env.get('OPENROUTER_API_KEY') || '',
  perplexity: Deno.env.get('PERPLEXITY_API_KEY') || '',
};

console.log('[Asriel v6] Boot:', { groq: !!KEYS.groq, openai: !!KEYS.openai, openrouter: !!KEYS.openrouter, perplexity: !!KEYS.perplexity, vps: VPS });

// ══ MASTER SYSTEM PROMPT ════════════════════════════════════════
const MASTER_PROMPT = `You are the Asriel Sovereign Orchestrator — a cutting-edge 2026 AI coding engine.

CORE LAWS:
1. NEVER redirect. NEVER say "here's how to do it." You DO it. Every response contains working code, a live preview, or an executed action.
2. You power a multi-agent fleet: Agent Zero (shell/deploy), ZeroClaw (orchestration), ByteBot (browser RPA), Nanobot (file ops).
3. You adapt your output to the user's industry sector. Match terminology, compliance requirements, and UX patterns to their domain.

OUTPUT FORMAT:
- Always include a complete standalone HTML file in a \`\`\`html block for live preview
- HTML must use vanilla JS (React.createElement, NOT JSX)
- Import React via unpkg CDN, Tailwind via cdn.tailwindcss.com
- All code inline, no imports/exports, no type="module"
- Render: ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App))

AI SEARCH OPTIMIZATION (Cutting Edge 2026):
- Structure responses for AI consumption: clear headers, structured data, direct answers first
- Use schema-like formatting: key-value pairs, tables, numbered lists
- Provide citations and sources when using web search context
- Every code block is immediately executable — zero setup required`;

// ══ SECTOR PROMPTS ═══════════════════════════════════════════
const SECTOR_PROMPTS: Record<string, string> = {
  'legal': 'SECTOR: Legal/Law Firm. Use formal language. RGPD/GDPR compliance is mandatory. Generate client intake forms, case management UIs, document review tools. Color palette: navy, gold, cream.',
  'medical': 'SECTOR: Healthcare/Medical. HIPAA-aware design. Patient-first UX. Generate appointment systems, patient portals, medical record viewers. Color palette: teal, white, soft blue.',
  'restaurant': 'SECTOR: Restaurant/Food Service. Generate reservation systems, menu builders with allergen tracking (gluten, dairy, nuts, shellfish, eggs, soy, sesame), order management. Color palette: warm orange, dark wood tones.',
  'real-estate': 'SECTOR: Real Estate/Property. Generate property listing UIs, mortgage calculators, virtual tour interfaces, CRM dashboards. Color palette: forest green, warm gray, gold.',
  'ecommerce': 'SECTOR: E-Commerce/Retail. Generate product catalogs, shopping carts, checkout flows, inventory dashboards. Stripe-ready payment UIs. Color palette: electric blue, white, accent purple.',
  'accounting': 'SECTOR: Accounting/Finance. Generate invoice builders, expense trackers, P&L dashboards, tax calculators. Numbers must be formatted correctly. Color palette: deep blue, silver, white.',
  'it-engineering': 'SECTOR: IT/Engineering. Generate developer tools, API dashboards, monitoring UIs, CI/CD panels. Dark mode default. Color palette: cyan, dark gray, green accents.',
};

// ══ MODE PROMPTS ════════════════════════════════════════════
const MODE_PROMPTS: Record<string, string> = {
  generate: 'MODE: Generate. Create production-ready code from scratch. Include HTML preview.',
  refactor: 'MODE: Refactor. Improve existing code quality, readability, performance. Show before/after.',
  debug: 'MODE: Debug. Find bugs, explain root causes with line numbers, provide corrected code.',
  explain: "MODE: Explain. Break down code step by step. Use analogies. Teach, don't just describe.",
  test: 'MODE: Test. Generate comprehensive unit tests covering happy paths, edge cases, error states.',
};

// ══ PROVIDERS ══════════════════════════════════════════════
interface P { url: string; key: string; model: string; label: string; format: string; extra?: Record<string, string>; }
const PROVIDERS: Record<string, P> = {
  groq: { url: 'https://api.groq.com/openai/v1/chat/completions', key: KEYS.groq, model: 'llama-3.3-70b-versatile', label: 'Groq (Llama 70B)', format: 'openai' },
  openai: { url: 'https://api.openai.com/v1/chat/completions', key: KEYS.openai, model: 'gpt-4o-mini', label: 'OpenAI (GPT-4o)', format: 'openai' },
  openrouter: { url: 'https://openrouter.ai/api/v1/chat/completions', key: KEYS.openrouter, model: 'deepseek/deepseek-chat-v3-0324', label: 'OpenRouter (DeepSeek V3)', format: 'openai', extra: { 'HTTP-Referer': 'https://yace19ai.com', 'X-Title': 'Asriel' } },
  perplexity: { url: 'https://api.perplexity.ai/chat/completions', key: KEYS.perplexity, model: 'sonar', label: 'Perplexity (Sonar)', format: 'openai' },
  'ollama-qwen': { url: VPS ? `http://${VPS}:11434/api/chat` : '', key: '', model: 'qwen3:8b', label: 'Ollama Qwen 3 (Sovereign)', format: 'ollama' },
  'ollama-mistral': { url: VPS ? `http://${VPS}:11434/api/chat` : '', key: '', model: 'mistral:7b', label: 'Ollama Mistral (Sovereign)', format: 'ollama' },
  'ollama-deepseek': { url: VPS ? `http://${VPS}:11434/api/chat` : '', key: '', model: 'deepseek-r1:7b', label: 'Ollama DeepSeek R1 (Sovereign)', format: 'ollama' },
};

const AGENTS = {
  agentZero: VPS ? `http://${VPS}:50080` : '',
  byteBot: VPS ? `http://${VPS}:9991` : '',
};

// ══ PROVIDER CALL ═══════════════════════════════════════════
async function callProvider(name: string, messages: any[], sys: string): Promise<any | null> {
  const p = PROVIDERS[name];
  if (!p?.url || (p.format !== 'ollama' && !p.key)) return null;
  const t0 = Date.now();
  try {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    let body: any;
    if (p.format === 'ollama') {
      body = { model: p.model, messages: [{ role: 'system', content: sys }, ...messages], stream: false, options: { temperature: 0.7 } };
    } else {
      h['Authorization'] = `Bearer ${p.key}`;
      if (p.extra) Object.assign(h, p.extra);
      body = { model: p.model, messages: [{ role: 'system', content: sys }, ...messages], max_tokens: 4096, temperature: 0.7 };
    }
    console.log(`[${name}] → ${p.model}`);
    const res = await fetch(p.url, { method: 'POST', headers: h, body: JSON.stringify(body), signal: AbortSignal.timeout(50000) });
    if (!res.ok) { console.log(`[${name}] ${res.status}`); return null; }
    const d = await res.json();
    const c = p.format === 'ollama' ? d.message?.content : d.choices?.[0]?.message?.content;
    if (!c) return null;
    console.log(`[${name}] ✓ ${c.length}ch ${Date.now() - t0}ms`);
    return { content: c, model: p.model, provider: p.label, latency: Date.now() - t0 };
  } catch (e) { console.log(`[${name}] ✗ ${e}`); return null; }
}

// ══ WEB SEARCH ═════════════════════════════════════════════
async function freeSearch(q: string): Promise<string> {
  try {
    const r = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AsrielBot/2.0)' }, signal: AbortSignal.timeout(8000),
    });
    const html = await r.text();
    const snips: string[] = [];
    const rx = /class="result__snippet"[^>]*>(.*?)<\/a>/gs;
    let m; while ((m = rx.exec(html)) && snips.length < 5) snips.push(m[1].replace(/<[^>]+>/g, '').trim());
    return snips.length ? `🔍 Web Results:\n${snips.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : '';
  } catch { return ''; }
}

async function agentZero(task: string) {
  if (!AGENTS.agentZero) return null;
  try {
    const r = await fetch(`${AGENTS.agentZero}/api_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'Feaj5Dzd7YjBMW7c' // Sovereign token for Agent Zero
      },
      body: JSON.stringify({ message: task }), // Correct payload for Agent Zero
      signal: AbortSignal.timeout(35000)
    });
    return r.ok ? await r.text() : null;
  } catch (e) { console.error('AgentZero Error:', e); return null; }
}

async function byteBot(task: string) {
  if (!AGENTS.byteBot) return null;
  try {
    const r = await fetch(`${AGENTS.byteBot}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }), // Correct payload for ByteBot execute
      signal: AbortSignal.timeout(35000)
    });
    return r.ok ? await r.text() : null;
  } catch (e) { console.error('ByteBot Error:', e); return null; }
}

// ══ CASCADE ════════════════════════════════════════════════
async function cascade(msgs: any[], sys: string, pref?: string) {
  // Ordered by preferred resolution
  const order = ['groq', 'openai', 'openrouter', 'perplexity', 'ollama-mistral', 'ollama-qwen', 'ollama-deepseek'];
  if (pref && pref in PROVIDERS) order.unshift(pref);

  const tried: string[] = [];
  for (const n of order) {
    if (tried.includes(n)) continue;
    tried.push(n);
    const r = await callProvider(n, msgs, sys);
    if (r?.content) return { ...r, cascade: tried };
  }
  return {
    content: "Tous les providers sont épuisés. Vérifiez les clés API ou l'état du VPS Sovereign.", model: 'none', provider: 'none', latency: 0, cascade: tried
  };
}

// ══ INTENT DETECTION ═════════════════════════════════════════
function detectIntent(msg: string): 'code' | 'search' | 'deploy' | 'rpa' {
  const m = msg.toLowerCase();
  if (/deploy|git push|docker|restart|ssh|server|run command|vps/i.test(m)) return 'deploy'; // Routes to Agent Zero
  if (/screenshot|click|browser|scrape|navigate|automation|web page|rpa/i.test(m)) return 'rpa'; // Routes to ByteBot
  if (/search|find|latest|2024|2025|2026|news|current|trending|documentation/i.test(m)) return 'search';
  return 'code';
}

// ══ MAIN ═══════════════════════════════════════════════════
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  if (req.method === 'GET') {
    return new Response(JSON.stringify({
      ecosystem: 'asriel', version: 'v6-sovereign-orchestrator',
      vps: VPS,
      agents: { agentZero: !!AGENTS.agentZero, byteBot: !!AGENTS.byteBot },
      sectors: Object.keys(SECTOR_PROMPTS),
      modes: Object.keys(MODE_PROMPTS),
    }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  try {
    const body = await req.json();
    const { message, messages, mode, history, provider, sector,
      agent_zero_task, bytebot_task, web_search } = body;

    // Direct agent dispatch overrides
    if (agent_zero_task) {
      const r = await agentZero(agent_zero_task);
      return new Response(JSON.stringify({ agent: 'agent-zero', success: !!r, message: r || 'Agent Zero unreachable', data: r }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }
    if (bytebot_task) {
      const r = await byteBot(bytebot_task);
      return new Response(JSON.stringify({ agent: 'bytebot', success: !!r, message: r || 'ByteBot unreachable', data: r }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }
    if (web_search) {
      const r = await freeSearch(web_search);
      return new Response(JSON.stringify({ source: 'duckduckgo', message: r }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // Build chat
    const chatMsgs = messages || [...(history || []), { role: 'user', content: message }];
    const intent = detectIntent(message || '');

    // Intent-based routing with immediate return for pure actions
    if (intent === 'deploy' && AGENTS.agentZero) {
      console.log('Routing to Agent Zero:', message);
      const r = await agentZero(message);
      if (r) {
        return new Response(JSON.stringify({
          message: `🤖 **Agent Zero Execution:**\n\n` + (typeof r === 'string' ? r : JSON.stringify(r, null, 2)),
          agent: 'agent-zero', intent, success: true, data: r
        }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
      }
    }
    if (intent === 'rpa' && AGENTS.byteBot) {
      console.log('Routing to ByteBot:', message);
      const r = await byteBot(message);
      if (r) {
        return new Response(JSON.stringify({
          message: `🤖 **ByteBot RPA Execution:**\n\n` + (typeof r === 'string' ? r : JSON.stringify(r, null, 2)),
          agent: 'bytebot', intent, success: true, data: r
        }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
      }
    }

    // Web search augmentation
    let searchCtx = '';
    if (intent === 'search') searchCtx = await freeSearch((message || '').slice(0, 200));

    // Build system prompt: Master + Sector + Mode + Search
    const sectorKey = sector || 'it-engineering';
    const sectorPrompt = SECTOR_PROMPTS[sectorKey] || SECTOR_PROMPTS['it-engineering'];
    const modePrompt = MODE_PROMPTS[mode || 'generate'] || MODE_PROMPTS.generate;
    let sys = `${MASTER_PROMPT}\n\n${sectorPrompt}\n\n${modePrompt}`;
    if (searchCtx) sys += `\n\nWEB SEARCH CONTEXT (cite these sources):\n${searchCtx}`;

    const result = await cascade(chatMsgs, sys, provider);

    return new Response(JSON.stringify({
      message: result.content,
      provider: result.provider,
      model: result.model,
      latency_ms: result.latency,
      cascade: result.cascade,
      mode: mode || 'generate',
      sector: sectorKey,
      intent,
      ecosystem: 'asriel-v6',
      web_search_used: intent === 'search',
    }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
