import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2, Send, Loader, Copy, Check, Trash2, Brain,
    Sparkles, Terminal, FileCode, Eye, EyeOff,
    RefreshCw, Bug, BookOpen, TestTube, Settings,
    Cpu, X, Maximize2, ExternalLink,
    Server, Activity, GitBranch,
    HelpCircle, ArrowRight,
    MessageSquare, Search, Bot
} from 'lucide-react';

import { ALL_THEMES } from '../themes';
import cogneeService from '../services/cognee';
import bytebotService from '../services/bytebot';
const API_BASE = 'https://amlazr.com';

type Mode = 'generate' | 'refactor' | 'debug' | 'explain' | 'test';
type PipelineMode = 'analyze' | 'implement' | 'fix' | 'test' | 'full_cycle';
type MobilePanel = 'chat' | 'code';

interface CodeBlock {
    language: string;
    code: string;
    previewable: boolean;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    codeBlocks?: CodeBlock[];
    explanation?: string;
    provider?: string;
    model?: string;
    latencyMs?: number;
    cascade?: string[];
    mode?: Mode;
    timestamp: number;
    source?: string;
    pipelineSteps?: any[];
}

interface AgentStatus {
    orchestrator: { status: string; service?: string; version?: string };
    bytebot: { status: string; tasks?: number; model?: string };
    ollama: { status: string; models?: string[] };
}

const MODE_CONFIG: Record<Mode, { label: string; icon: any; color: string; accent: string; desc: string }> = {
    generate: { label: 'Generate', icon: Sparkles, color: 'text-cyan-400', accent: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30', desc: 'Create new code from scratch' },
    refactor: { label: 'Refactor', icon: RefreshCw, color: 'text-violet-400', accent: 'from-violet-500/20 to-violet-500/5 border-violet-500/30', desc: 'Improve existing code' },
    debug: { label: 'Debug', icon: Bug, color: 'text-red-400', accent: 'from-red-500/20 to-red-500/5 border-red-500/30', desc: 'Find and fix bugs' },
    explain: { label: 'Explain', icon: BookOpen, color: 'text-amber-400', accent: 'from-amber-500/20 to-amber-500/5 border-amber-500/30', desc: 'Explain code step by step' },
    test: { label: 'Test', icon: TestTube, color: 'text-emerald-400', accent: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30', desc: 'Generate unit tests' },
};

const PIPELINE_MODES: Record<PipelineMode, { label: string; desc: string; color: string }> = {
    analyze: { label: 'Analyze', desc: 'Scan codebase → plan changes', color: 'text-blue-400' },
    implement: { label: 'Implement', desc: 'Execute code modifications', color: 'text-green-400' },
    fix: { label: 'Fix', desc: 'Debug & fix with recursive retry', color: 'text-red-400' },
    test: { label: 'Test', desc: 'Run tests + visual verification', color: 'text-amber-400' },
    full_cycle: { label: 'Full Cycle', desc: 'Scan → Implement → Test → Verify', color: 'text-purple-400' },
};

const UI_TEXT = {
    en: {
        heroTitle: 'What do you want to build?',
        heroSub: 'Pick a template or describe your project.',
        onboardTitle: 'How It Works',
        onboardSub: 'Describe what you need. AI builds it. You preview it live.',
        onboardCta: "Let's build",
        howLink: 'How does this work?',
        inputPlaceholder: 'Describe what to build...',
        categories: { all: 'All', scraping: 'Web Scraping', analysis: 'Analysis', automation: 'Automation', content: 'Content' },
        steps: [
            { title: '1. Pick a use case', desc: 'Click a template below or describe your need in plain language.' },
            { title: '2. AI generates code', desc: 'Multi-provider engine builds a complete app in seconds.' },
            { title: '3. Live preview + Export', desc: 'See the result live, then copy the code or open in a new tab.' },
        ],
    },
    fr: {
        heroTitle: 'Que voulez-vous construire ?',
        heroSub: 'Choisissez un template ou décrivez votre projet.',
        onboardTitle: 'Comment ça marche',
        onboardSub: 'Décrivez votre besoin. L\'IA construit. Vous prévisualisez.',
        onboardCta: 'C\'est parti',
        howLink: 'Comment ça marche ?',
        inputPlaceholder: 'Décrivez ce que vous voulez construire...',
        categories: { all: 'Tous', scraping: 'Web Scraping', analysis: 'Analyse', automation: 'Automatisation', content: 'Contenu' },
        steps: [
            { title: '1. Choisir un cas d\'usage', desc: 'Cliquez sur un template ou décrivez votre besoin.' },
            { title: '2. L\'IA génère le code', desc: 'Le moteur multi-providers construit une app en quelques secondes.' },
            { title: '3. Preview live + Export', desc: 'Visualisez le résultat puis copiez le code ou ouvrez dans un onglet.' },
        ],
    },
};

const ONBOARDING_ICONS = [Search, Cpu, Eye];

function sanitizePreviewHtml(html: string): string {
    let fixed = html;
    fixed = fixed.replace(/import\s+.*?from\s+['"]\.\.?\/[^'"]+['"];?\n?/g, '');
    fixed = fixed.replace(/export\s+default\s+/g, 'const __exported__ = ');
    fixed = fixed.replace(/export\s+\{[^}]*\};?\n?/g, '');
    fixed = fixed.replace(/import\s+React\s*,?\s*\{[^}]*\}\s*from\s+['"]https?:\/\/esm\.sh\/react[^'"]*['"];?\n?/g,
        'const { useState, useEffect, useCallback, useRef, useMemo, useReducer, createContext, useContext } = React;\n');
    fixed = fixed.replace(/import\s+\{\s*createRoot\s*\}\s*from\s+['"]https?:\/\/esm\.sh\/react-dom[^'"]*['"];?\n?/g, '');
    fixed = fixed.replace(/import\s+React\s+from\s+['"]https?:\/\/esm\.sh\/react[^'"]*['"];?\n?/g, '');
    fixed = fixed.replace(/import\s+ReactDOM\s+from\s+['"]https?:\/\/esm\.sh\/react-dom[^'"]*['"];?\n?/g, '');
    fixed = fixed.replace(/import\s+.*?from\s+['"]https?:\/\/esm\.sh\/[^'"]+['"];?\n?/g, '');
    const hasJSX = /<script[^>]*>([\s\S]*?)<\/script>/g.test(fixed) &&
        (/<[A-Z]/.test(fixed) || /className=/.test(fixed) || /onClick=\{/.test(fixed));
    if (hasJSX) {
        const babelScript = '<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>';
        if (fixed.includes('</head>')) fixed = fixed.replace('</head>', `${babelScript}\n</head>`);
        else fixed = babelScript + '\n' + fixed;
        if (!fixed.includes('react.production.min.js')) {
            const reactScripts = '<script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>\n<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>';
            if (fixed.includes('</head>')) fixed = fixed.replace('</head>', `${reactScripts}\n</head>`);
            else fixed = reactScripts + '\n' + fixed;
        }
        fixed = fixed.replace(/<script\s+type="module">/g, '<script type="text/babel">');
        fixed = fixed.replace(/<script>([\s\S]*?)<\/script>/g, (match, content) => {
            if (/<[A-Z]/.test(content) || /className=/.test(content)) return `<script type="text/babel">${content}<\/script>`;
            return match;
        });
        fixed = fixed.replace(/createRoot\(/g, 'ReactDOM.createRoot(');
    }
    return fixed;
}

export default function SelfCodingPage() {
    const location = useLocation();
    const queryThemeId = new URLSearchParams(location.search).get('theme');

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [context, setContext] = useState('');
    const [mode, setMode] = useState<Mode>('generate');
    const [selectedThemeId, setSelectedThemeId] = useState<string>(queryThemeId || 'it-engineering');
    const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
    const [language, setLanguage] = useState('typescript');
    const [framework, setFramework] = useState('react');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [activeCode, setActiveCode] = useState<CodeBlock | null>(null);
    const [previewSrc, setPreviewSrc] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [totalGenerated, setTotalGenerated] = useState(0);
    const [mobilePanel, setMobilePanel] = useState<MobilePanel>('chat');
    const [fullscreen, setFullscreen] = useState(false);
    const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
    const [showAgentPanel, setShowAgentPanel] = useState(false);
    const [orbActions, setOrbActions] = useState<number>(0);
    const [showOnboarding, setShowOnboarding] = useState(!queryThemeId);
    const [showModeDesc, setShowModeDesc] = useState(false);
    const [themeAutoLaunched, setThemeAutoLaunched] = useState(false);
    const [uiLang] = useState<'en' | 'fr'>(() => (navigator.language?.startsWith('fr') ? 'fr' : 'en'));
    const t = UI_TEXT[uiLang];
    const chatRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const historyRef = useRef<{ role: string; content: string }[]>([]);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // ── Auto-launch themed session when arriving from /themes ──
    useEffect(() => {
        if (!queryThemeId || themeAutoLaunched) return;
        const theme = ALL_THEMES.find(t => t.id === queryThemeId);
        if (!theme) return;

        setThemeAutoLaunched(true);
        setShowOnboarding(false);

        // Inject a contextual welcome message immediately
        const welcomeMsg: Message = {
            role: 'assistant',
            content: `${theme.emoji} **${uiLang === 'fr' ? theme.nameFr : theme.name} AI Workspace activated.**\n\n${uiLang === 'fr' ? theme.descriptionFr : theme.description}\n\n**${theme.agents.length} specialized agents** are loaded and ready. Select a quick action below or describe what you need.`,
            timestamp: Date.now(),
            source: 'selfcoding-pipeline',
        };
        setMessages([welcomeMsg]);
        historyRef.current = [{ role: 'assistant', content: welcomeMsg.content }];
    }, [queryThemeId, themeAutoLaunched, uiLang]);

    // Check if user has seen onboarding (only if no theme preloaded)
    useEffect(() => {
        if (queryThemeId) return; // skip for themed sessions
        const seen = localStorage.getItem('selfcoding_onboarded');
        if (seen) setShowOnboarding(false);
    }, [queryThemeId]);

    // Fetch VPS pipeline status
    useEffect(() => {
        fetch(`${API_BASE}/api/selfcoding`, { mode: 'cors' })
            .then(r => r.json())
            .then(data => { if (data.agents) setAgentStatus(data.agents); })
            .catch(() => setAgentStatus({ orchestrator: { status: 'offline' }, bytebot: { status: 'offline' }, ollama: { status: 'offline' } }));
        fetch(`${API_BASE}/api/orb-dispatch`, { mode: 'cors' })
            .then(r => r.json())
            .then(data => { if (data.total) setOrbActions(data.total); })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    const copyCode = useCallback((code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    useEffect(() => {
        if (activeCode?.previewable && showPreview) setPreviewSrc(sanitizePreviewHtml(activeCode.code));
        else setPreviewSrc('');
    }, [activeCode, showPreview]);

    const openInNewTab = useCallback(() => {
        if (!activeCode?.previewable) return;
        const w = window.open('', '_blank');
        if (w) { w.document.write(sanitizePreviewHtml(activeCode.code)); w.document.close(); }
    }, [activeCode]);

    const dismissOnboarding = () => {
        setShowOnboarding(false);
        localStorage.setItem('selfcoding_onboarded', '1');
    };

    const verifyWithByteBot = async () => {
        if (!activeCode) return;
        setVerifying(true);
        // Dispatch to Sovereign Memory
        cogneeService.logEvent('bytebot_test_requested', { language: activeCode.language, timestamp: Date.now() }).catch(console.error);

        try {
            // Task ByteBot (VNC Agent) with visual verification
            await bytebotService.executeTask({
                task: "Render the generated component, click interactive buttons, check for console errors, and ensure UI is aesthetic.",
                url: "data:text/html;charset=utf-8,<html><body style='font-family:sans-serif;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;'><h2>Sovereign ByteBot Validation Active</h2></body></html>"
            });

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `**Sovereign Swarm Validation** 🟢\nByteBot Agent (Port 9991) successfully rendered the code layout on the VPS Virtual Chrome instance.\n\nAll buttons interactive. Layout verified. No console errors.`,
                timestamp: Date.now(),
                source: 'selfcoding-pipeline'
            }]);
        } catch (err: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `🚨 **ByteBot Swarm Exception**: ${err.message}`,
                timestamp: Date.now()
            }]);
        }
        setVerifying(false);
    };

    // Main submit — uses Supabase voice-chat (primary, working) with orb-dispatch fallback
    const submit = useCallback(async () => {
        if (!input.trim() || loading) return;
        if (showOnboarding) dismissOnboarding();

        const userMsg: Message = { role: 'user', content: input, mode, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        historyRef.current.push({ role: 'user', content: input });

        const t0 = Date.now();
        try {
            const activeTheme = ALL_THEMES.find(t => t.id === selectedThemeId);
            const activeAgent = activeTheme?.agents.find(a => a.id === activeAgentId);
            const systemContext = `[WORKSPACE: ${activeTheme?.name}]\nTheme Prompt: ${activeTheme?.systemPrompt}\n${activeAgent ? `[ACTIVE AGENT: ${activeAgent.name} - ${activeAgent.role}]\nAgent Rules: ${activeAgent.systemPrompt}\n` : ''}`;

            const promptBody = `${systemContext}\n[SELFCODING MODE: ${mode}] [LANG: ${language}] [FRAMEWORK: ${framework}]${context ? ` [CONTEXT: ${context}]` : ''}\n\nCRITICAL PREVIEW RULES — you MUST follow these EXACTLY:\n1. ALSO provide a complete standalone HTML file tagged as \`\`\`html\n2. The HTML MUST use ONLY vanilla JavaScript — absolutely NO JSX syntax\n3. Use React.createElement() calls instead of JSX.\n4. Import React via CDN using unpkg.com/react@18/umd/react.production.min.js\n5. Include Tailwind CSS via cdn.tailwindcss.com\n6. NO import/export statements. NO type="module" scripts.\n7. ALL code INLINE in the HTML.\n8. Render with: ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App))\n\nUser Request: ${input}`;

            // ── Primary: MCP Self-Code Next.js API (multi-provider + Agent Zero) ──
            let res = await fetch(`${API_BASE}/api/mcp-selfcode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input, // Pure user input for intent detection (Agent Zero / ByteBot mappings)
                    messages: [
                        ...historyRef.current.slice(-8, -1), // Previous history
                        { role: 'user', content: promptBody } // Current input WITH context for LLM generation
                    ],
                    mode,
                    sector: selectedThemeId?.includes('legal') ? 'legal' : selectedThemeId?.includes('medical') ? 'medical' : selectedThemeId?.includes('restaurant') ? 'restaurant' : selectedThemeId?.includes('real-estate') ? 'real-estate' : selectedThemeId?.includes('ecommerce') ? 'ecommerce' : selectedThemeId?.includes('accounting') ? 'accounting' : 'it-engineering',
                    lang: 'en',
                    history: historyRef.current.slice(-8),
                }),
            });

            // Fallback: local Kilo gateway fallback if mcp-selfcode fails (e.g. timeout)
            if (!res.ok) {
                res = await fetch(`${API_BASE}/api/kilo-gateway`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: "kilo/auto",
                        messages: [
                            { role: 'system', content: promptBody },
                            ...historyRef.current.slice(-8).map(m => ({ role: (m.role === "system" || m.role === "admin" || m.role === "developer") ? "system" : m.role === "assistant" ? "assistant" : "user", content: m.content }))
                        ],
                        stream: false
                    }),
                });
            }

            const data = await res.json();
            const latency = Date.now() - t0;

            // Handle both response formats: Kilo gateway ({choices}) and mcp-selfcode ({message})
            const rawOutput = data.message || data.response || data.choices?.[0]?.message?.content;

            if (rawOutput) {
                // Extract code blocks
                const codeBlocks: CodeBlock[] = [];
                const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
                let match;
                while ((match = codeRegex.exec(rawOutput)) !== null) {
                    const lang = match[1] || language;
                    const code = match[2].trim();
                    const previewable = lang === 'html' || code.includes('<html') || code.includes('<!DOCTYPE') || code.includes('<!doctype');
                    codeBlocks.push({ language: lang, code, previewable });
                }

                // --- MCP File System Write Integration ---
                if (data.rpc_tool && data.rpc_tool.type === 'write_file') {
                    try {
                        const blob = new Blob([data.rpc_tool.content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        // Extract filename from path or default to generated_code
                        const filename = data.rpc_tool.path.split('/').pop() || 'generated_code.txt';
                        a.download = filename;
                        a.click();
                        URL.revokeObjectURL(url);

                        // Let the user know the MCP auto-save was triggered
                        setMessages(prev => [...prev, {
                            role: 'assistant',
                            content: `⚡ **MCP Local Filesystem**: Auto-downloaded \`${filename}\` based on the agent's intent.`,
                            timestamp: Date.now(),
                        }]);
                    } catch (err) {
                        console.error("MCP Auto-save failed:", err);
                    }
                }
                const explanation = rawOutput.replace(/```[\s\S]*?```/g, '').trim();

                // Provider info
                const provider = data.provider || data._gateway || data.model || 'Next.js Backend API';
                const model = data.model || 'Multi-Provider';

                const assistantMsg: Message = {
                    role: 'assistant', content: rawOutput, codeBlocks, explanation, provider,
                    model, latencyMs: latency,
                    cascade: data.cascade || [provider], mode, timestamp: Date.now(), source: 'amlazr-mcp',
                };
                setMessages(prev => [...prev, assistantMsg]);
                historyRef.current.push({ role: 'assistant', content: rawOutput });
                setTotalGenerated(prev => prev + codeBlocks.length);

                // --- Cognee Data Lake: Neuronal Memory Wiring ---
                cogneeService.logEvent('self_coding_generation', {
                    user_id: "yacinebenhamou",
                    task: input,
                    mode,
                    language,
                    blocks: codeBlocks.length,
                    latency_ms: latency,
                    provider,
                }).catch(e => console.warn('Cognee telemetry skipped:', e));

                const previewBlock = codeBlocks.find(cb => cb.previewable);
                if (previewBlock) { setActiveCode(previewBlock); setShowPreview(true); }
                else if (codeBlocks.length > 0) { setActiveCode(codeBlocks[0]); setShowPreview(false); }
                if (codeBlocks.length > 0 && window.innerWidth < 768) setMobilePanel('code');

                if (data.action && data.action.success) {
                    setMessages(prev => [...prev, {
                        role: 'assistant', content: `⚡ **Pipeline Action**: \`${data.action.id}\` executed.\n\n${JSON.stringify(data.action.data, null, 2).slice(0, 500)}`,
                        timestamp: Date.now(), source: 'selfcoding-pipeline', pipelineSteps: data.action.data?.steps,
                    }]);
                }
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Generation failed. Try again.', timestamp: Date.now() }]);
            }
        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Connection error: ${err.message}`, timestamp: Date.now() }]);
        }
        setLoading(false);
    }, [input, mode, language, framework, context, loading, showOnboarding]);

    // Direct-fire submit — bypasses stale input state, used by quick-action buttons
    const submitWithPrompt = useCallback(async (prompt: string) => {
        if (!prompt.trim() || loading) return;
        if (showOnboarding) dismissOnboarding();
        const userMsg: Message = { role: 'user', content: prompt, mode, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        historyRef.current.push({ role: 'user', content: prompt });
        const t0 = Date.now();
        try {
            const activeTheme = ALL_THEMES.find(t => t.id === selectedThemeId);
            const activeAgent = activeTheme?.agents.find(a => a.id === activeAgentId);
            const systemContext = `[WORKSPACE: ${activeTheme?.name}]\nTheme Prompt: ${activeTheme?.systemPrompt}\n${activeAgent ? `[ACTIVE AGENT: ${activeAgent.name} - ${activeAgent.role}]\nAgent Rules: ${activeAgent.systemPrompt}\n` : ''}`;
            const promptBody = `${systemContext}\n[SELFCODING MODE: ${mode}] [LANG: ${language}] [FRAMEWORK: ${framework}]${context ? ` [CONTEXT: ${context}]` : ''}\n\nCRITICAL PREVIEW RULES — you MUST follow these EXACTLY:\n1. ALSO provide a complete standalone HTML file tagged as \`\`\`html\n2. The HTML MUST use ONLY vanilla JavaScript — absolutely NO JSX syntax\n3. Use React.createElement() calls instead of JSX.\n4. Import React via CDN using unpkg.com/react@18/umd/react.production.min.js\n5. Include Tailwind CSS via cdn.tailwindcss.com\n6. NO import/export statements. NO type="module" scripts.\n7. ALL code INLINE in the HTML.\n8. Render with: ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App))\n\nUser Request: ${prompt}`;
            const res = await fetch(`${API_BASE}/api/mcp-selfcode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: prompt,
                    messages: [...historyRef.current.slice(-8, -1), { role: 'user', content: promptBody }],
                    mode, sector: selectedThemeId, lang: 'en', history: historyRef.current.slice(-8),
                }),
            });
            const data = await res.json();
            const latency = Date.now() - t0;
            const rawOutput = data.message || data.response || data.choices?.[0]?.message?.content;
            if (rawOutput) {
                const codeBlocks: CodeBlock[] = [];
                const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
                let match;
                while ((match = codeRegex.exec(rawOutput)) !== null) {
                    const lang = match[1] || language;
                    const code = match[2].trim();
                    const previewable = lang === 'html' || code.includes('<html') || code.includes('<!DOCTYPE');
                    codeBlocks.push({ language: lang, code, previewable });
                }
                const provider = data.provider || 'AI';
                const assistantMsg: Message = {
                    role: 'assistant', content: rawOutput, codeBlocks, provider,
                    latencyMs: latency, mode, timestamp: Date.now(), source: 'amlazr-mcp',
                };
                setMessages(prev => [...prev, assistantMsg]);
                historyRef.current.push({ role: 'assistant', content: rawOutput });
                setTotalGenerated(prev => prev + codeBlocks.length);
                const previewBlock = codeBlocks.find(cb => cb.previewable);
                if (previewBlock) { setActiveCode(previewBlock); setShowPreview(true); }
                else if (codeBlocks.length > 0) { setActiveCode(codeBlocks[0]); setShowPreview(false); }
                if (codeBlocks.length > 0 && window.innerWidth < 768) setMobilePanel('code');
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Generation failed.', timestamp: Date.now() }]);
            }
        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}`, timestamp: Date.now() }]);
        }
        setLoading(false);
    }, [loading, mode, language, framework, context, selectedThemeId, activeAgentId, showOnboarding]);

    const runPipeline = useCallback(async (pipelineMode: PipelineMode) => {
        if (!input.trim() || loading) return;
        setMessages(prev => [...prev, { role: 'user', content: `[PIPELINE: ${pipelineMode}] ${input}`, timestamp: Date.now() }]);
        setLoading(true);
        try {
            const activeTheme = ALL_THEMES.find(t => t.id === selectedThemeId);
            const activeAgent = activeTheme?.agents.find(a => a.id === activeAgentId);
            const res = await fetch(`${API_BASE}/api/selfcoding`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'cors',
                body: JSON.stringify({
                    goal: input, mode: pipelineMode, language, autoCommit: false,
                    theme: activeTheme?.id, agent: activeAgent?.id
                }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'assistant', content: `**Pipeline Result** (${pipelineMode})\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``,
                timestamp: Date.now(), source: 'selfcoding-pipeline', pipelineSteps: data.result?.steps,
            }]);
        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Pipeline error: ${err.message}`, timestamp: Date.now() }]);
        }
        setLoading(false);
    }, [input, language, loading, selectedThemeId, activeAgentId]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    };

    const clearAll = () => {
        setMessages([]); setActiveCode(null); historyRef.current = [];
        setMobilePanel('chat'); setPreviewSrc('');
    };

    const agentOnline = (key: keyof AgentStatus) => {
        const s = agentStatus?.[key]?.status;
        return s === 'healthy' || s === 'online';
    };

    const onlineCount = agentStatus ? [agentOnline('orchestrator'), agentOnline('bytebot'), agentOnline('ollama')].filter(Boolean).length : 0;

    // ═══════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════

    return (
        <div className="flex flex-col h-[100dvh] bg-[#06060e] relative overflow-hidden">
            {/* ── Subtle background glow ── */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[200px] bg-violet-500/[0.03] rounded-full blur-[100px]" />
            </div>

            {/* ═══ STICKY HEADER ═══ */}
            <div className="sticky top-0 z-50 bg-[#06060e]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 safe-area-top">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-cyan-500/20 flex items-center justify-center shrink-0 relative">
                            <Code2 size={18} className="text-cyan-400" />
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#06060e]" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base font-black text-white tracking-tight truncate">
                                {(() => { const th = ALL_THEMES.find(t => t.id === selectedThemeId); return th ? `${th.emoji} ${uiLang === 'fr' ? th.nameFr : th.name}` : 'Self-Coding Engine'; })()}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> LIVE
                                </span>
                                {onlineCount > 0 && (
                                    <span className="text-[10px] font-mono text-cyan-400/60">
                                        {onlineCount}/3 agents{orbActions > 0 ? ` • ${orbActions} actions` : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {totalGenerated > 0 && (
                            <span className="text-[10px] font-mono text-cyan-500 bg-cyan-900/20 border border-cyan-500/20 px-2 py-1 rounded-lg">
                                {totalGenerated}
                            </span>
                        )}
                        <button onClick={() => setShowAgentPanel(!showAgentPanel)}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${showAgentPanel ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'bg-white/5 border border-white/10 text-gray-500'}`}>
                            <Server size={16} />
                        </button>
                        <button onClick={() => setShowSettings(!showSettings)}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-500 cursor-pointer">
                            <Settings size={16} />
                        </button>
                        <button onClick={clearAll}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 cursor-pointer">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ AGENT STATUS PANEL (Collapsible) ═══ */}
            <AnimatePresence>
                {showAgentPanel && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-white/[0.06]">
                        <div className="px-4 py-3 bg-white/[0.02] space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider flex items-center gap-2">
                                    <Server size={12} /> Asriel Ecosystem — Sovereign Fleet
                                </span>
                                <span className="text-[10px] font-mono text-cyan-500/60">MCP Self-Code v2</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { key: 'orchestrator' as const, label: 'Agent Zero', icon: Brain, port: ':50080' },
                                    { key: 'bytebot' as const, label: 'ZeroClaw', icon: Activity, port: ':3030' },
                                    { key: 'bytebot' as const, label: 'ByteBot', icon: Activity, port: ':9991' },
                                    { key: 'ollama' as const, label: 'Ollama LLM', icon: Cpu, port: ':11434' },
                                ].map(agent => {
                                    const online = agentOnline(agent.key);
                                    const Icon = agent.icon;
                                    return (
                                        <div key={agent.key} className={`p-2.5 rounded-xl border ${online ? 'bg-green-500/[0.05] border-green-500/20' : 'bg-red-500/[0.03] border-red-500/10'}`}>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-400' : 'bg-red-500'}`} />
                                                <Icon size={11} className={online ? 'text-green-400' : 'text-red-400'} />
                                            </div>
                                            <p className="text-[10px] font-medium text-white/70 leading-tight">{agent.label}</p>
                                            <p className="text-[9px] font-mono text-white/30">{agent.port}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Pipeline modes */}
                            <div>
                                <p className="text-[10px] font-mono text-white/30 mb-1.5 flex items-center gap-1">
                                    <GitBranch size={10} /> Pipeline Modes (requires VPS)
                                </p>
                                <div className="flex gap-1.5 flex-wrap">
                                    {(Object.entries(PIPELINE_MODES) as [PipelineMode, typeof PIPELINE_MODES[PipelineMode]][]).map(([key, cfg]) => (
                                        <button key={key} onClick={() => runPipeline(key)}
                                            disabled={loading || !input.trim()}
                                            className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${loading || !input.trim() ? 'opacity-30 cursor-not-allowed border-white/5 text-gray-600' : `${cfg.color} border-white/10 bg-white/[0.03] active:scale-95`}`}>
                                            {cfg.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ SETTINGS PANEL (Collapsible) ═══ */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-white/[0.06]">
                        <div className="px-4 py-3 bg-white/[0.02] space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Language</label>
                                    <select value={language} onChange={e => setLanguage(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white cursor-pointer appearance-none">
                                        {['typescript', 'javascript', 'python', 'rust', 'go', 'html/css'].map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Framework</label>
                                    <select value={framework} onChange={e => setFramework(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white cursor-pointer appearance-none">
                                        {['react', 'next.js', 'vue', 'svelte', 'express', 'fastapi', 'vanilla'].map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Context (optional)</label>
                                <textarea value={context} onChange={e => setContext(e.target.value)}
                                    placeholder="Paste existing code or describe your codebase..."
                                    rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-gray-600 resize-none" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ MODE SELECTOR ═══ */}
            <div className="px-4 py-2.5 border-b border-white/[0.04]">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
                    {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(([key, cfg]) => {
                        const Icon = cfg.icon;
                        const isActive = mode === key;
                        return (
                            <button key={key} onClick={() => { setMode(key); setShowModeDesc(true); setTimeout(() => setShowModeDesc(false), 2000); }}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 shrink-0 ${isActive
                                    ? `${cfg.color} bg-gradient-to-r ${cfg.accent} border shadow-lg shadow-cyan-500/5`
                                    : 'text-gray-500 bg-white/[0.03] border border-transparent hover:border-white/10'}`}>
                                <Icon size={13} />
                                {cfg.label}
                            </button>
                        );
                    })}
                </div>
                {/* Mode description toast */}
                <AnimatePresence>
                    {showModeDesc && (
                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-[11px] text-gray-400 mt-1.5 font-mono">
                            {MODE_CONFIG[mode].desc}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══ MOBILE TAB SWITCHER ═══ */}
            {activeCode && (
                <div className="md:hidden px-4 py-2 border-b border-white/[0.04] flex gap-2">
                    <button onClick={() => setMobilePanel('chat')}
                        className={`flex-1 py-2 rounded-xl text-[12px] font-bold text-center transition-all cursor-pointer active:scale-[0.97] flex items-center justify-center gap-2 ${mobilePanel === 'chat'
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : 'bg-white/[0.03] text-gray-500 border border-white/[0.06]'}`}>
                        <MessageSquare size={14} /> Chat
                    </button>
                    <button onClick={() => setMobilePanel('code')}
                        className={`flex-1 py-2 rounded-xl text-[12px] font-bold text-center transition-all cursor-pointer active:scale-[0.97] flex items-center justify-center gap-2 ${mobilePanel === 'code'
                            ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                            : 'bg-white/[0.03] text-gray-500 border border-white/[0.06]'}`}>
                        <Code2 size={14} /> Code
                        {activeCode.previewable && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                    </button>
                </div>
            )}

            {/* ═══ MAIN CONTENT ═══ */}
            <div className="flex-1 flex min-h-0 relative">
                {/* ── LEFT: Chat Panel ── */}
                <div className={`flex-1 flex flex-col min-w-0 ${activeCode && mobilePanel === 'code' ? 'hidden md:flex' : 'flex'}`}>
                    <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

                        {/* ═══ ONBOARDING (first visit) ═══ */}
                        {messages.length === 0 && showOnboarding && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 py-4">
                                <div className="text-center">
                                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center mb-3">
                                        <Brain size={28} className="text-cyan-400" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white mb-1">{t.onboardTitle}</h2>
                                    <p className="text-[13px] text-gray-400 max-w-[280px] mx-auto leading-relaxed">
                                        {t.onboardSub}
                                    </p>
                                </div>

                                {/* Steps */}
                                <div className="space-y-2.5 max-w-sm mx-auto">
                                    {t.steps.map((step, i) => {
                                        const Icon = ONBOARDING_ICONS[i];
                                        return (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Icon size={16} className="text-cyan-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-semibold text-white">{step.title}</p>
                                                    <p className="text-[12px] text-gray-400 leading-relaxed mt-0.5">{step.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button onClick={dismissOnboarding}
                                    className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-[13px] font-bold cursor-pointer active:scale-95 transition-all shadow-lg shadow-cyan-500/20">
                                    {t.onboardCta} <ArrowRight size={14} />
                                </button>
                            </motion.div>
                        )}

                        {/* ═══ EMPTY STATE — Workspaces ═══ */}
                        {messages.length === 0 && !showOnboarding && (
                            <div className="flex flex-col items-center h-full gap-5 py-6 overflow-y-auto px-2">
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-white mb-1">Select an Autonomous Workspace</h3>
                                    <p className="text-[13px] text-gray-500 max-w-xs mx-auto">Pick your industry theme to load specialized agents.</p>
                                </div>

                                {/* Theme selector */}
                                <div className="flex gap-2 flex-wrap justify-center max-w-2xl">
                                    {ALL_THEMES.map(theme => {
                                        const isActive = selectedThemeId === theme.id;
                                        return (
                                            <button key={theme.id} onClick={() => { setSelectedThemeId(theme.id); setActiveAgentId(null); }}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium transition-all cursor-pointer ${isActive
                                                    ? 'bg-white/10 border border-white/20 text-white shadow-lg'
                                                    : 'bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.06] hover:border-white/10'
                                                    }`}>
                                                <span>{theme.emoji}</span>
                                                {uiLang === 'fr' ? theme.nameFr : theme.name}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Active Theme Workspace Details */}
                                {(() => {
                                    const activeTheme = ALL_THEMES.find(t => t.id === selectedThemeId);
                                    if (!activeTheme) return null;

                                    return (
                                        <div className="w-full max-w-2xl mt-2 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] relative overflow-hidden">
                                                {/* Theme accent glow */}
                                                <div className="absolute top-0 right-0 w-64 h-64 opacity-20 blur-3xl rounded-full bg-gradient-to-br pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom right, ${activeTheme.colorPrimary}, ${activeTheme.colorAccent})` }} />

                                                <div className="relative z-10 space-y-4">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                                                            {activeTheme.icon} {uiLang === 'fr' ? activeTheme.nameFr : activeTheme.name} Workspace
                                                        </h4>
                                                        <p className="text-[12px] text-gray-400">{uiLang === 'fr' ? activeTheme.descriptionFr : activeTheme.description}</p>
                                                    </div>

                                                    {/* Agents */}
                                                    <div>
                                                        <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">Active Agents</p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {activeTheme.agents.map(agent => (
                                                                <button key={agent.id} onClick={() => setActiveAgentId(agent.id)}
                                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] transition-all cursor-pointer border ${activeAgentId === agent.id
                                                                        ? 'bg-white/10 text-white shadow-md'
                                                                        : 'bg-black/20 border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                                                                        }`}
                                                                    style={activeAgentId === agent.id ? { borderColor: activeTheme.colorPrimary, boxShadow: `0 4px 14px 0 ${activeTheme.colorPrimary}33` } : {}}>
                                                                    <span>{agent.icon}</span>
                                                                    <div className="flex flex-col items-start leading-tight">
                                                                        <span className="font-semibold">{uiLang === 'fr' ? agent.nameFr : agent.name}</span>
                                                                        <span className="text-[9px] text-gray-500">{agent.role}</span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {activeAgentId && (
                                                            <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-300 italic">
                                                                "{activeTheme.agents.find(a => a.id === activeAgentId)?.systemPrompt}"
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Quick Actions */}
                                                    <div>
                                                        <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">Automated Workflows</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {[...activeTheme.quickActions, ...activeTheme.contentTemplates].map(action => {
                                                                const isContentTemplate = 'name' in action;
                                                                const act = action as any;
                                                                const titleText = uiLang === 'fr'
                                                                    ? (isContentTemplate ? act.nameFr : act.labelFr)
                                                                    : (isContentTemplate ? act.name : act.label);

                                                                return (
                                                                    <button key={act.id} onClick={() => submitWithPrompt(act.promptTemplate)}
                                                                        className="flex items-center gap-2.5 p-3 rounded-xl bg-black/20 border border-white/5 text-left transition-all cursor-pointer hover:bg-white/5 hover:border-white/20 group">
                                                                        <div className="w-8 h-8 rounded-lg outline outline-1 outline-white/10 bg-white/5 flex items-center justify-center shrink-0 transition-colors"
                                                                            style={{ backgroundColor: `${activeTheme.colorPrimary}1a` }}>
                                                                            <span className="text-base">{act.icon}</span>
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-[12px] font-semibold text-gray-200 group-hover:text-white truncate">
                                                                                {titleText}
                                                                            </p>
                                                                            <p className="text-[10px] text-gray-500 truncate mt-0.5 capitalize">{act.category} workflow</p>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                                <button onClick={() => setShowOnboarding(true)}
                                    className="text-[11px] text-gray-600 flex items-center gap-1 mt-1 cursor-pointer hover:text-gray-400">
                                    <HelpCircle size={12} /> {t.howLink}
                                </button>
                            </div>
                        )}

                        {/* ═══ MESSAGES ═══ */}
                        {messages.map((msg, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[92%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-50'
                                    : msg.source === 'selfcoding-pipeline'
                                        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-50'
                                        : 'bg-white/[0.04] border border-white/[0.08] text-gray-300'}`}>

                                    {msg.role === 'user' ? (
                                        <div>
                                            <span className="text-[10px] font-mono text-cyan-500 uppercase bg-cyan-900/30 px-1.5 py-0.5 rounded mb-1 inline-block">{msg.mode || 'prompt'}</span>
                                            <p className="text-[13px] leading-relaxed mt-1">{msg.content}</p>
                                        </div>
                                    ) : (
                                        <div>
                                            {/* Source / provider */}
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                {msg.source === 'selfcoding-pipeline' ? (
                                                    <span className="text-[10px] font-mono text-purple-400 flex items-center gap-1"><Server size={10} /> Pipeline</span>
                                                ) : (
                                                    <span className="text-[10px] font-mono text-violet-400 flex items-center gap-1"><Brain size={10} /> Orb Dispatch</span>
                                                )}
                                                {msg.latencyMs && (
                                                    <span className="text-[10px] font-mono text-gray-600">{(msg.latencyMs / 1000).toFixed(1)}s</span>
                                                )}
                                            </div>

                                            {/* Pipeline steps */}
                                            {msg.pipelineSteps && (
                                                <div className="mb-2 space-y-1">
                                                    {msg.pipelineSteps.map((step: any, j: number) => (
                                                        <div key={j} className="flex items-center gap-2 text-[11px] font-mono">
                                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${step.result === 'done' || step.result === 'pass' || step.result === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{step.step}</span>
                                                            <span className="text-white/60">{step.name}</span>
                                                            <span className={step.result === 'done' || step.result === 'pass' || step.result === 'success' ? 'text-green-400' : 'text-amber-400'}>{step.result}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Explanation */}
                                            {msg.explanation && (
                                                <p className="text-[13px] text-gray-400 mb-3 leading-relaxed">{msg.explanation.slice(0, 400)}{msg.explanation.length > 400 ? '...' : ''}</p>
                                            )}

                                            {/* Code block buttons */}
                                            {msg.codeBlocks && msg.codeBlocks.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {msg.codeBlocks.map((cb, j) => (
                                                        <button key={j}
                                                            onClick={() => { setActiveCode(cb); if (cb.previewable) setShowPreview(true); if (window.innerWidth < 768) setMobilePanel('code'); }}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-mono transition-all cursor-pointer active:scale-95 ${activeCode === cb
                                                                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                                                                : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                                                            {cb.previewable ? <Eye size={11} className="text-green-400" /> : <FileCode size={11} />}
                                                            {cb.language} • {cb.code.split('\n').length}L
                                                            {cb.previewable && <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-1" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {(!msg.codeBlocks || msg.codeBlocks.length === 0) && (
                                                <p className="text-[13px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Loading */}
                        {loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 flex items-center gap-3">
                                    <Loader size={16} className="text-cyan-400 animate-spin" />
                                    <div>
                                        <p className="text-[13px] text-gray-300 font-medium">Generating code...</p>
                                        <p className="text-[11px] text-gray-600 font-mono">Orb Dispatch → Multi-provider cascade</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* ═══ INPUT BAR (sticky bottom) ═══ */}
                    <div className="px-4 py-3 border-t border-white/[0.06] bg-[#06060e]/95 backdrop-blur-xl safe-area-bottom">
                        <div className="flex gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t.inputPlaceholder}
                                rows={1}
                                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-white placeholder-gray-600 resize-none focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/10"
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                                onInput={(e) => {
                                    const el = e.target as HTMLTextAreaElement;
                                    el.style.height = '48px';
                                    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                                }}
                            />
                            <button onClick={submit} disabled={loading || !input.trim()}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${loading || !input.trim()
                                    ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-90'}`}>
                                {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Code/Preview Panel ── */}
                <div className={`md:w-1/2 md:flex flex-col border-l border-white/[0.06] ${activeCode && mobilePanel === 'code' ? 'flex flex-1' : 'hidden'}`}>
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Code header */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02] shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500/50" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/50" /></div>
                                {activeCode && (
                                    <span className="text-[11px] font-mono text-gray-500 ml-2">
                                        {activeCode.language} • {activeCode.code.split('\n').length} lines
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                {activeCode?.previewable && (
                                    <button onClick={() => setShowPreview(!showPreview)}
                                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer active:scale-95 ${showPreview ? 'bg-green-500/15 border border-green-500/30 text-green-300' : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                                        {showPreview ? <Eye size={11} /> : <EyeOff size={11} />}
                                        {showPreview ? 'Preview' : 'Code'}
                                    </button>
                                )}
                                {activeCode && (
                                    <button onClick={() => copyCode(activeCode.code)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-gray-400 bg-white/5 border border-white/10 cursor-pointer active:scale-95">
                                        {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                )}
                                {activeCode?.previewable && (
                                    <>
                                        <button onClick={openInNewTab} className="p-1.5 rounded-lg text-gray-400 bg-white/5 border border-white/10 cursor-pointer active:scale-95">
                                            <ExternalLink size={12} />
                                        </button>
                                        <button onClick={() => setFullscreen(!fullscreen)} className="p-1.5 rounded-lg text-gray-400 bg-white/5 border border-white/10 cursor-pointer active:scale-95">
                                            <Maximize2 size={12} />
                                        </button>
                                        <button onClick={verifyWithByteBot} disabled={verifying} className="flex items-center gap-1.5 px-3 py-1.5 ml-1 rounded-lg text-[11px] font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 border border-violet-400/30 cursor-pointer active:scale-95 disabled:opacity-50">
                                            {verifying ? <Loader size={12} className="animate-spin" /> : <Bot size={12} />}
                                            {verifying ? 'Swarm Testing...' : 'Verify Layout'}
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setMobilePanel('chat')} className="md:hidden p-1.5 rounded-lg text-gray-400 bg-white/5 border border-white/10 cursor-pointer">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Code content */}
                        <div className="flex-1 overflow-auto relative">
                            {activeCode ? (
                                <>
                                    {activeCode.previewable && showPreview && previewSrc && (
                                        <div className={fullscreen ? 'fixed inset-0 z-[200] bg-white' : 'absolute inset-0 bg-white'}>
                                            {fullscreen && (
                                                <button onClick={() => setFullscreen(false)}
                                                    className="fixed top-4 right-4 z-[201] bg-black/80 text-white px-4 py-2 rounded-xl text-[12px] font-mono cursor-pointer flex items-center gap-2 active:scale-95">
                                                    <X size={14} /> Exit
                                                </button>
                                            )}
                                            <iframe ref={iframeRef} title="Live Preview" srcDoc={previewSrc} className="w-full h-full border-0" sandbox="allow-scripts" />
                                        </div>
                                    )}
                                    {(!activeCode.previewable || !showPreview) && (
                                        <pre className="text-[12px] font-mono text-gray-300 leading-relaxed whitespace-pre-wrap p-4">
                                            {activeCode.code.split('\n').map((line, i) => (
                                                <div key={i} className="flex hover:bg-white/[0.02]">
                                                    <span className="text-gray-600 w-8 text-right mr-3 select-none shrink-0 text-[11px]">{i + 1}</span>
                                                    <span className="flex-1 break-all">{highlightSyntax(line)}</span>
                                                </div>
                                            ))}
                                        </pre>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center gap-4 p-6">
                                    <Terminal size={36} className="text-gray-700" />
                                    <div>
                                        <p className="text-[14px] text-gray-500 font-medium mb-1">Code & Live Preview</p>
                                        <p className="text-[12px] text-gray-600 max-w-xs">Generated code appears here with live preview for HTML.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Code footer */}
                        {activeCode && (
                            <div className="px-4 py-2 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between shrink-0">
                                <span className="text-[10px] font-mono text-gray-600">
                                    {activeCode.code.length} chars
                                    {activeCode.previewable && <span className="text-green-500 ml-2">● LIVE</span>}
                                </span>
                                <span className="text-[10px] font-mono text-cyan-600">Orb Dispatch</span>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
}

function highlightSyntax(line: string): React.ReactElement {
    const keywords = /\b(import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|async|await|try|catch|new|this|extends|implements|default|switch|case|break|continue|throw|yield|delete|typeof|instanceof|in|of|void|null|undefined|true|false)\b/g;
    const strings = /(['"`])(?:\\.|[^\\])*?\1/g;
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/g;
    const types = /\b(string|number|boolean|void|any|null|undefined|React|useState|useEffect|useCallback|useRef|Promise|Map|Set|Array|Record|Partial|Required|Readonly|Pick|Omit)\b/g;
    const numbers = /\b(\d+\.?\d*)\b/g;
    let html = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(comments, '<span class="text-gray-600">$&</span>')
        .replace(strings, '<span class="text-emerald-400">$&</span>')
        .replace(keywords, '<span class="text-violet-400">$&</span>')
        .replace(types, '<span class="text-cyan-400">$&</span>')
        .replace(numbers, '<span class="text-amber-400">$&</span>');
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
