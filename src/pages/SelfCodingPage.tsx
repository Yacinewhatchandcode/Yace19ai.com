import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2, Send, Loader, Copy, Check, Trash2, Brain,
    Sparkles, Terminal, FileCode, Eye, EyeOff,
    RefreshCw, Bug, BookOpen, TestTube, Settings,
    Zap, Cpu, X, Maximize2, ExternalLink,
    Server, Activity, Shield, Layers, GitBranch,
} from 'lucide-react';

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
    source?: string; // 'orb-dispatch' | 'selfcoding-pipeline' | 'voice-chat'
    pipelineSteps?: any[];
}

interface AgentStatus {
    orchestrator: { status: string; service?: string; version?: string };
    bytebot: { status: string; tasks?: number; model?: string };
    ollama: { status: string; models?: string[] };
}

const MODE_CONFIG: Record<Mode, { label: string; icon: any; color: string; accent: string; desc: string }> = {
    generate: { label: 'Generate', icon: Sparkles, color: 'text-cyan-400', accent: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30', desc: 'Create new code' },
    refactor: { label: 'Refactor', icon: RefreshCw, color: 'text-violet-400', accent: 'from-violet-500/20 to-violet-500/5 border-violet-500/30', desc: 'Improve code' },
    debug: { label: 'Debug', icon: Bug, color: 'text-red-400', accent: 'from-red-500/20 to-red-500/5 border-red-500/30', desc: 'Fix bugs' },
    explain: { label: 'Explain', icon: BookOpen, color: 'text-amber-400', accent: 'from-amber-500/20 to-amber-500/5 border-amber-500/30', desc: 'Explain code' },
    test: { label: 'Test', icon: TestTube, color: 'text-emerald-400', accent: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30', desc: 'Generate tests' },
};

const PIPELINE_MODES: Record<PipelineMode, { label: string; desc: string; color: string }> = {
    analyze: { label: 'Analyze', desc: 'Scan codebase → plan changes', color: 'text-blue-400' },
    implement: { label: 'Implement', desc: 'Execute code modifications', color: 'text-green-400' },
    fix: { label: 'Fix', desc: 'Debug & fix with recursive retry', color: 'text-red-400' },
    test: { label: 'Test', desc: 'Run tests + visual verification', color: 'text-amber-400' },
    full_cycle: { label: 'Full Cycle', desc: 'Scan → Implement → Test → Verify', color: 'text-purple-400' },
};

const PROVIDER_ICONS: Record<string, { label: string; color: string }> = {
    groq: { label: 'Groq', color: 'text-orange-400' },
    google: { label: 'Gemini', color: 'text-blue-400' },
    nvidia: { label: 'NVIDIA', color: 'text-green-400' },
    github: { label: 'GPT-4o', color: 'text-white' },
    openrouter: { label: 'OpenRouter', color: 'text-purple-400' },
    cloudflare: { label: 'Cloudflare', color: 'text-amber-400' },
    zhipu: { label: 'ZhipuAI', color: 'text-teal-400' },
};

const SUGGESTIONS = [
    'Build a React dashboard with charts',
    'Create a REST API with JWT auth',
    'Generate a 2D platformer game loop',
    'Build a real-time chat component',
    'Create a glassmorphism landing page',
    'Build a Kanban board with drag & drop',
];

// Sanitize AI-generated HTML to fix common preview issues
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
        if (fixed.includes('</head>')) {
            fixed = fixed.replace('</head>', `${babelScript}\n</head>`);
        } else if (fixed.includes('<body')) {
            fixed = fixed.replace('<body', `${babelScript}\n<body`);
        } else {
            fixed = babelScript + '\n' + fixed;
        }
        if (!fixed.includes('react.production.min.js') && !fixed.includes('react.development.min.js')) {
            const reactScripts = '<script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>\n' +
                '<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>';
            if (fixed.includes('</head>')) {
                fixed = fixed.replace('</head>', `${reactScripts}\n</head>`);
            } else {
                fixed = reactScripts + '\n' + fixed;
            }
        }
        fixed = fixed.replace(/<script\s+type="module">/g, '<script type="text/babel">');
        fixed = fixed.replace(/<script>([\s\S]*?)<\/script>/g, (match, content) => {
            if (/<[A-Z]/.test(content) || /className=/.test(content)) {
                return `<script type="text/babel">${content}<\/script>`;
            }
            return match;
        });
        fixed = fixed.replace(/createRoot\(/g, 'ReactDOM.createRoot(');
    }
    return fixed;
}

export default function SelfCodingPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [context, setContext] = useState('');
    const [mode, setMode] = useState<Mode>('generate');
    const [language, setLanguage] = useState('typescript');
    const [framework, setFramework] = useState('react');
    const [loading, setLoading] = useState(false);
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
    const chatRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const historyRef = useRef<{ role: string; content: string }[]>([]);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // ═══ Fetch VPS pipeline status on mount ═══
    useEffect(() => {
        fetch(`${API_BASE}/api/selfcoding`, { mode: 'cors' })
            .then(r => r.json())
            .then(data => {
                if (data.agents) setAgentStatus(data.agents);
            })
            .catch(() => setAgentStatus({
                orchestrator: { status: 'offline' },
                bytebot: { status: 'offline' },
                ollama: { status: 'offline' },
            }));

        // Fetch orb-dispatch registry size
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
        if (activeCode?.previewable && showPreview) {
            const sanitized = sanitizePreviewHtml(activeCode.code);
            console.log('[SelfCoding] Setting previewSrc, length:', sanitized.length, 'first 100:', sanitized.substring(0, 100));
            setPreviewSrc(sanitized);
        } else {
            console.log('[SelfCoding] Clearing previewSrc, activeCode:', !!activeCode, 'previewable:', activeCode?.previewable, 'showPreview:', showPreview);
            setPreviewSrc('');
        }
    }, [activeCode, showPreview]);

    const openInNewTab = useCallback(() => {
        if (!activeCode?.previewable) return;
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(sanitizePreviewHtml(activeCode.code));
            w.document.close();
        }
    }, [activeCode]);

    // ═══ Main submit — routes through Orb Dispatch (full power) ═══
    const submit = useCallback(async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: 'user', content: input, mode, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        historyRef.current.push({ role: 'user', content: input });

        const t0 = Date.now();

        try {
            // ── Route through Orb Dispatch (intent classification → 40+ actions) ──
            const res = await fetch(`${API_BASE}/api/orb-dispatch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                mode: 'cors',
                body: JSON.stringify({
                    message: `[SELFCODING MODE: ${mode}] [LANG: ${language}] [FRAMEWORK: ${framework}]${context ? ` [CONTEXT: ${context}]` : ''}\n\nCRITICAL PREVIEW RULES — you MUST follow these EXACTLY:\n1. ALSO provide a complete standalone HTML file tagged as \`\`\`html\n2. The HTML MUST use ONLY vanilla JavaScript — absolutely NO JSX syntax\n3. Use React.createElement() calls instead of JSX.\n4. Import React via CDN using unpkg.com/react@18/umd/react.production.min.js\n5. Include Tailwind CSS via cdn.tailwindcss.com\n6. NO import/export statements. NO type="module" scripts.\n7. ALL code INLINE in the HTML.\n8. Render with: ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App))\n\n${input}`,
                    conversationHistory: historyRef.current.slice(-8),
                    lang: 'en',
                    context: { url: '/build', title: 'Self-Coding Engine' },
                }),
            });

            const data = await res.json();
            const latency = Date.now() - t0;

            if (data.response) {
                const rawOutput = data.response;

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
                const explanation = rawOutput.replace(/```[\s\S]*?```/g, '').trim();

                // Determine provider from activeModules
                let provider = 'openrouter';
                const modules = data.activeModules || [];
                if (modules.some((m: string) => m.toLowerCase().includes('groq'))) provider = 'groq';
                else if (modules.some((m: string) => m.toLowerCase().includes('gemini'))) provider = 'google';

                const assistantMsg: Message = {
                    role: 'assistant',
                    content: rawOutput,
                    codeBlocks,
                    explanation,
                    provider,
                    model: modules.join(' → ') || 'Multi-Provider',
                    latencyMs: latency,
                    cascade: modules,
                    mode,
                    timestamp: Date.now(),
                    source: 'orb-dispatch',
                };

                setMessages(prev => [...prev, assistantMsg]);
                historyRef.current.push({ role: 'assistant', content: rawOutput });
                setTotalGenerated(prev => prev + codeBlocks.length);

                const previewBlock = codeBlocks.find(cb => cb.previewable);
                console.log('[SelfCoding] codeBlocks:', codeBlocks.length, codeBlocks.map(cb => ({ lang: cb.language, previewable: cb.previewable, codeLen: cb.code.length })));
                console.log('[SelfCoding] previewBlock:', previewBlock ? { lang: previewBlock.language, codeLen: previewBlock.code.length } : 'none');
                if (previewBlock) {
                    setActiveCode(previewBlock);
                    setShowPreview(true);
                } else if (codeBlocks.length > 0) {
                    setActiveCode(codeBlocks[0]);
                    setShowPreview(false);
                }

                if (codeBlocks.length > 0 && window.innerWidth < 768) {
                    setMobilePanel('code');
                }

                // If Orb triggered an action (like self_build, flow_code), show it
                if (data.action && data.action.success) {
                    const actionMsg: Message = {
                        role: 'assistant',
                        content: `⚡ **Pipeline Action**: \`${data.action.id}\` executed successfully.\n\n${JSON.stringify(data.action.data, null, 2).slice(0, 500)}`,
                        timestamp: Date.now(),
                        source: 'selfcoding-pipeline',
                        pipelineSteps: data.action.data?.steps,
                    };
                    setMessages(prev => [...prev, actionMsg]);
                }
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.error || 'Code generation failed. All providers may be temporarily unavailable.',
                    timestamp: Date.now(),
                }]);
            }
        } catch (err: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Connection error: ${err.message}. Check network and retry.`,
                timestamp: Date.now(),
            }]);
        }

        setLoading(false);
    }, [input, mode, language, framework, context, loading]);

    // ═══ Pipeline execution (Agent Zero full_cycle) ═══
    const runPipeline = useCallback(async (pipelineMode: PipelineMode) => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: 'user', content: `[PIPELINE: ${pipelineMode}] ${input}`, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/selfcoding`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                mode: 'cors',
                body: JSON.stringify({
                    goal: input,
                    mode: pipelineMode,
                    language,
                    autoCommit: false,
                }),
            });

            const data = await res.json();

            const assistantMsg: Message = {
                role: 'assistant',
                content: `**Pipeline Result** (${pipelineMode})\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``,
                timestamp: Date.now(),
                source: 'selfcoding-pipeline',
                pipelineSteps: data.result?.steps,
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (err: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Pipeline error: ${err.message}`,
                timestamp: Date.now(),
            }]);
        }

        setLoading(false);
    }, [input, language, loading]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    };

    const clearAll = () => {
        setMessages([]);
        setActiveCode(null);
        historyRef.current = [];
        setMobilePanel('chat');
        setPreviewSrc('');
    };

    // ═══ Agent Status Panel ═══
    const agentPanel = (
        <AnimatePresence>
            {showAgentPanel && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-2">
                    <div className="p-3 glass-panel border border-white/10 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-white/60 uppercase flex items-center gap-2">
                                <Server size={12} /> Sovereign Infrastructure
                            </span>
                            <span className="text-[9px] font-mono text-gray-600">amlazr.com</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { key: 'orchestrator', label: 'Orchestrator', icon: Brain, desc: 'Rust/Actix :3002' },
                                { key: 'bytebot', label: 'ByteBot', icon: Activity, desc: 'NestJS :9991 + Desktop :9990' },
                                { key: 'ollama', label: 'Ollama', icon: Cpu, desc: 'Local LLM :11434' },
                            ].map(agent => {
                                const agentData = agentStatus?.[agent.key as keyof AgentStatus];
                                const status = agentData?.status || 'unknown';
                                const Icon = agent.icon;
                                return (
                                    <div key={agent.key} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${status === 'healthy' || status === 'online' ? 'bg-green-400' : 'bg-red-500'}`} />
                                            <Icon size={10} className="text-white/40" />
                                            <span className="text-[9px] font-mono text-white/60">{agent.label}</span>
                                        </div>
                                        <span className={`text-[8px] font-mono ${status === 'healthy' || status === 'online' ? 'text-green-400' : 'text-red-400'}`}>{status}</span>
                                        <p className="text-[7px] text-white/20 mt-0.5">{agent.desc}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pipeline Modes */}
                        <div>
                            <span className="text-[9px] font-mono text-white/40 uppercase mb-1.5 block flex items-center gap-1">
                                <GitBranch size={10} /> Pipeline Modes
                            </span>
                            <div className="flex gap-1.5 flex-wrap">
                                {(Object.entries(PIPELINE_MODES) as [PipelineMode, typeof PIPELINE_MODES[PipelineMode]][]).map(([key, cfg]) => (
                                    <button
                                        key={key}
                                        onClick={() => runPipeline(key)}
                                        disabled={loading || !input.trim()}
                                        className={`text-[8px] font-mono px-2 py-1 rounded-lg border transition-all cursor-pointer ${loading || !input.trim()
                                            ? 'opacity-30 cursor-not-allowed border-white/5 text-gray-600'
                                            : `${cfg.color} border-white/10 bg-white/[0.02] hover:bg-white/[0.06]`
                                            }`}
                                        title={cfg.desc}
                                    >
                                        {cfg.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[7px] text-white/20 mt-1">Requires VPS agents online. Uses circuit breakers + recursive retry.</p>
                        </div>

                        {/* Orb Dispatch Stats */}
                        <div className="flex items-center gap-3 text-[8px] font-mono text-white/30">
                            <span className="flex items-center gap-1"><Layers size={9} /> {orbActions} actions in registry</span>
                            <span className="flex items-center gap-1"><Zap size={9} /> Circuit breakers active</span>
                            <span className="flex items-center gap-1"><Shield size={9} /> Approval gates</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const codePreviewContent = (
        <div className="flex-1 flex flex-col glass-panel border border-white/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500/50" />
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-500/50" />
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500/50" />
                    </div>
                    {activeCode && (
                        <span className="text-[9px] sm:text-[10px] font-mono text-gray-500 ml-1 sm:ml-2">
                            {activeCode.language} • {activeCode.code.split('\n').length} lines
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {activeCode?.previewable && (
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-mono transition-all cursor-pointer ${showPreview
                                ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                                : 'bg-white/5 border border-white/10 text-gray-400'
                                }`}
                        >
                            {showPreview ? <Eye size={9} /> : <EyeOff size={9} />}
                            <span className="hidden sm:inline">{showPreview ? 'Preview' : 'Code'}</span>
                        </button>
                    )}
                    {activeCode && (
                        <button
                            onClick={() => copyCode(activeCode.code)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-mono text-gray-400 hover:text-white bg-white/5 border border-white/10 transition-all cursor-pointer"
                        >
                            {copied ? <Check size={9} className="text-green-400" /> : <Copy size={9} />}
                            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                    )}
                    {activeCode?.previewable && (
                        <>
                            <button
                                onClick={openInNewTab}
                                title="Open in new tab"
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-mono text-gray-400 hover:text-white bg-white/5 border border-white/10 transition-all cursor-pointer"
                            >
                                <ExternalLink size={9} />
                                <span className="hidden sm:inline">New Tab</span>
                            </button>
                            <button
                                onClick={() => setFullscreen(!fullscreen)}
                                title="Fullscreen"
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-mono text-gray-400 hover:text-white bg-white/5 border border-white/10 transition-all cursor-pointer"
                            >
                                <Maximize2 size={9} />
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setMobilePanel('chat')}
                        className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white cursor-pointer"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto relative">
                {activeCode ? (
                    <>
                        {activeCode.previewable && showPreview && previewSrc && (
                            <div className={fullscreen ? 'fixed inset-0 z-[200] bg-white' : 'absolute inset-0 bg-white'}>
                                {fullscreen && (
                                    <button
                                        onClick={() => setFullscreen(false)}
                                        className="fixed top-3 right-3 z-[201] bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-mono hover:bg-black transition-colors cursor-pointer flex items-center gap-1.5"
                                    >
                                        <X size={12} /> Exit Fullscreen
                                    </button>
                                )}
                                <iframe
                                    ref={iframeRef}
                                    title="Live Preview"
                                    srcDoc={previewSrc}
                                    className="w-full h-full border-0"
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            </div>
                        )}
                        {(!activeCode.previewable || !showPreview) && (
                            <pre className="text-[10px] sm:text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap p-3 sm:p-4">
                                {activeCode.code.split('\n').map((line, i) => (
                                    <div key={i} className="flex hover:bg-white/[0.02]">
                                        <span className="text-gray-600 w-6 sm:w-8 text-right mr-2 sm:mr-4 select-none shrink-0">{i + 1}</span>
                                        <span className="flex-1 break-all sm:break-normal">{highlightSyntax(line)}</span>
                                    </div>
                                ))}
                            </pre>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 sm:gap-4 p-4 sm:p-6">
                        <Terminal size={28} className="text-gray-700 sm:hidden" />
                        <Terminal size={40} className="text-gray-700 hidden sm:block" />
                        <div>
                            <p className="text-xs sm:text-sm text-gray-500 font-mono mb-1">Code & Live Preview</p>
                            <p className="text-[9px] sm:text-[10px] text-gray-700 max-w-xs">
                                Describe what to build → Orb Dispatch classifies intent → Code generates → Preview renders live
                            </p>
                        </div>
                        <div className="flex gap-1.5 flex-wrap justify-center">
                            {Object.entries(PROVIDER_ICONS).map(([key, val]) => (
                                <span key={key} className={`text-[7px] sm:text-[8px] font-mono ${val.color} bg-white/5 border border-white/5 px-1 sm:px-1.5 py-0.5 rounded`}>
                                    {val.label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {activeCode && (
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <span className="text-[8px] sm:text-[9px] font-mono text-gray-600">
                        {activeCode.code.length} chars • {activeCode.code.split('\n').length} lines
                        {activeCode.previewable && <span className="text-green-500 ml-1 sm:ml-2">● LIVE</span>}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-mono text-cyan-600 hidden sm:inline">Orb Dispatch • {orbActions} Actions • Multi-Provider Cascade</span>
                    <span className="text-[8px] font-mono text-cyan-600 sm:hidden">{orbActions} Actions</span>
                </div>
            )}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 sm:pt-4 flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)]"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2 sm:mb-4 px-1">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-cyan-500/30 flex items-center justify-center relative shrink-0">
                        <Code2 size={16} className="text-cyan-400 sm:hidden" />
                        <Code2 size={20} className="text-cyan-400 hidden sm:block" />
                        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 border-2 border-[#0a0a12] animate-pulse" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm sm:text-xl font-black text-white font-display flex items-center gap-1.5 sm:gap-2">
                            <span className="truncate">Self-Coding Engine</span>
                            <span className="text-[7px] sm:text-[8px] font-mono text-green-500 bg-green-900/30 border border-green-500/20 px-1 sm:px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                                <Zap size={7} /> <span className="hidden sm:inline">{orbActions} ACTIONS</span> LIVE
                            </span>
                        </h1>
                        <p className="text-[8px] sm:text-[10px] font-mono text-gray-500 truncate">
                            <span className="hidden sm:inline">Orb Dispatch • {orbActions} Actions • Groq · Gemini · OpenRouter · Agent Zero Pipeline</span>
                            <span className="sm:hidden">Orb Dispatch • {orbActions} Actions</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-1.5 sm:gap-2 items-center shrink-0">
                    {totalGenerated > 0 && (
                        <span className="text-[8px] sm:text-[9px] font-mono text-cyan-500 bg-cyan-900/20 border border-cyan-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg hidden sm:inline">
                            {totalGenerated} blocks
                        </span>
                    )}
                    <button
                        onClick={() => setShowAgentPanel(!showAgentPanel)}
                        className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer ${showAgentPanel ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                        title="Agent Zero Pipeline"
                    >
                        <Server size={14} />
                    </button>
                    <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer">
                        <Settings size={14} />
                    </button>
                    <button onClick={clearAll} className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 transition-colors cursor-pointer">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Agent Panel (collapsible) */}
            {agentPanel}

            {/* Settings Bar */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-2 sm:mb-3">
                        <div className="flex flex-wrap gap-2 sm:gap-3 p-2 sm:p-3 glass-panel border border-white/10 rounded-xl">
                            <div>
                                <label className="text-[8px] sm:text-[9px] font-mono text-gray-500 uppercase block mb-1">Language</label>
                                <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-white cursor-pointer">
                                    {['typescript', 'javascript', 'python', 'rust', 'go', 'swift', 'kotlin', 'java', 'c#', 'html/css'].map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[8px] sm:text-[9px] font-mono text-gray-500 uppercase block mb-1">Framework</label>
                                <select value={framework} onChange={e => setFramework(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-white cursor-pointer">
                                    {['react', 'next.js', 'vue', 'svelte', 'express', 'fastapi', 'django', 'unity', 'vanilla', 'none'].map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[150px] sm:min-w-[200px]">
                                <label className="text-[8px] sm:text-[9px] font-mono text-gray-500 uppercase block mb-1">Context</label>
                                <textarea
                                    value={context}
                                    onChange={e => setContext(e.target.value)}
                                    placeholder="Paste existing code or describe existing codebase..."
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-white font-mono placeholder-gray-600 resize-none"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mode Selector */}
            <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => setMode(key)}
                            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${mode === key
                                ? `${cfg.color} bg-gradient-to-r ${cfg.accent} border`
                                : 'text-gray-500 bg-white/5 border border-transparent hover:border-white/10'
                                }`}
                        >
                            <Icon size={10} />
                            {cfg.label}
                        </button>
                    );
                })}
            </div>

            {/* Mobile Tab Switcher */}
            {activeCode && (
                <div className="md:hidden flex gap-2 mb-2">
                    <button
                        onClick={() => setMobilePanel('chat')}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold text-center transition-all cursor-pointer ${mobilePanel === 'chat'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-white/5 text-gray-500 border border-white/10'
                            }`}
                    >
                        💬 Chat
                    </button>
                    <button
                        onClick={() => setMobilePanel('code')}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${mobilePanel === 'code'
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            : 'bg-white/5 text-gray-500 border border-white/10'
                            }`}
                    >
                        <Code2 size={10} /> Code
                        {activeCode.previewable && <span className="text-[7px] text-green-400">LIVE</span>}
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* LEFT: Chat Panel */}
                <div className={`flex-1 flex flex-col min-w-0 ${activeCode && mobilePanel === 'code' ? 'hidden md:flex' : 'flex'}`}>
                    <div ref={chatRef} className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-3">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-3 sm:gap-4 py-6 sm:py-12">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center relative">
                                    <Brain size={20} className="text-cyan-400 sm:hidden" />
                                    <Brain size={28} className="text-cyan-400 hidden sm:block" />
                                    <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                                        {[...Array(7)].map((_, i) => (
                                            <div key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500" style={{ opacity: 0.4 + i * 0.1 }} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">What do you want to build?</h3>
                                    <p className="text-[10px] sm:text-xs text-gray-500 max-w-sm px-2">
                                        Powered by Orb Dispatch ({orbActions} actions). Describe any component, API, or game — code generates with live preview.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center max-w-lg px-2">
                                    {SUGGESTIONS.map(s => (
                                        <button key={s} onClick={() => setInput(s)} className="text-[9px] sm:text-[10px] font-mono text-cyan-500 bg-cyan-900/20 border border-cyan-500/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-cyan-900/40 transition-colors cursor-pointer">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[95%] sm:max-w-[90%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${msg.role === 'user'
                                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-50'
                                    : msg.source === 'selfcoding-pipeline'
                                        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-50'
                                        : 'bg-white/5 border border-white/10 text-gray-300'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[8px] sm:text-[9px] font-mono text-cyan-500 uppercase bg-cyan-900/30 px-1.5 py-0.5 rounded">{msg.mode || 'prompt'}</span>
                                            </div>
                                            <p className="text-xs sm:text-sm">{msg.content}</p>
                                        </div>
                                    ) : (
                                        <div>
                                            {/* Source badge */}
                                            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                                                {msg.source === 'selfcoding-pipeline' ? (
                                                    <>
                                                        <Server size={10} className="text-purple-400" />
                                                        <span className="text-[8px] sm:text-[9px] font-mono text-purple-400">Agent Zero Pipeline</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Brain size={10} className="text-violet-400" />
                                                        <span className="text-[8px] sm:text-[9px] font-mono text-violet-400">Orb Dispatch</span>
                                                    </>
                                                )}
                                                {msg.provider && (
                                                    <span className={`text-[7px] sm:text-[8px] font-mono ${PROVIDER_ICONS[msg.provider]?.color || 'text-gray-400'} bg-white/5 border border-white/10 px-1 sm:px-1.5 py-0.5 rounded flex items-center gap-0.5`}>
                                                        <Cpu size={7} />
                                                        {PROVIDER_ICONS[msg.provider]?.label || msg.provider}
                                                    </span>
                                                )}
                                                {msg.latencyMs && (
                                                    <span className="text-[7px] sm:text-[8px] font-mono text-gray-600">
                                                        {(msg.latencyMs / 1000).toFixed(1)}s
                                                    </span>
                                                )}
                                            </div>

                                            {/* Pipeline steps */}
                                            {msg.pipelineSteps && (
                                                <div className="mb-2 space-y-1">
                                                    {msg.pipelineSteps.map((step: any, j: number) => (
                                                        <div key={j} className="flex items-center gap-2 text-[8px] font-mono">
                                                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] ${step.result === 'done' || step.result === 'pass' || step.result === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{step.step}</span>
                                                            <span className="text-white/60">{step.name}</span>
                                                            <span className={`${step.result === 'done' || step.result === 'pass' || step.result === 'success' ? 'text-green-400' : 'text-amber-400'}`}>{step.result}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Explanation */}
                                            {msg.explanation && (
                                                <p className="text-[10px] sm:text-xs text-gray-400 mb-2 sm:mb-3 leading-relaxed">{msg.explanation}</p>
                                            )}

                                            {/* Code block buttons */}
                                            {msg.codeBlocks && msg.codeBlocks.length > 0 && (
                                                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                                                    {msg.codeBlocks.map((cb, j) => (
                                                        <button
                                                            key={j}
                                                            onClick={() => { setActiveCode(cb); if (cb.previewable) setShowPreview(true); if (window.innerWidth < 768) setMobilePanel('code'); }}
                                                            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-mono transition-all cursor-pointer ${activeCode === cb
                                                                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                                                                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                                                                }`}
                                                        >
                                                            {cb.previewable ? <Eye size={9} className="text-green-400" /> : <FileCode size={9} />}
                                                            {cb.language} ({cb.code.split('\n').length}L)
                                                            {cb.previewable && <span className="text-[6px] sm:text-[7px] text-green-400">LIVE</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {(!msg.codeBlocks || msg.codeBlocks.length === 0) && (
                                                <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
                                    <Loader size={12} className="text-cyan-400 animate-spin" />
                                    <div>
                                        <span className="text-[10px] sm:text-xs text-gray-400 font-mono block">Processing via Orb Dispatch...</span>
                                        <span className="text-[8px] sm:text-[9px] text-gray-600 font-mono">Intent classification → Multi-provider cascade → Action execution</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="mt-2 sm:mt-3 flex gap-1.5 sm:gap-2">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe what to build..."
                            rows={2}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white placeholder-gray-600 resize-none focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        />
                        <button
                            onClick={submit}
                            disabled={loading || !input.trim()}
                            className={`px-3 sm:px-4 rounded-xl flex items-center justify-center transition-all ${loading || !input.trim()
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 cursor-pointer'
                                }`}
                        >
                            {loading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                </div>

                {/* RIGHT: Code Preview */}
                <div className={`md:w-1/2 md:flex flex-col min-w-0 ${activeCode && mobilePanel === 'code' ? 'flex flex-1' : 'hidden'}`}>
                    {codePreviewContent}
                </div>
            </div>
        </motion.div>
    );
}

// Syntax highlighting
function highlightSyntax(line: string): React.ReactElement {
    const keywords = /\b(import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|async|await|try|catch|new|this|extends|implements|default|switch|case|break|continue|throw|yield|delete|typeof|instanceof|in|of|void|null|undefined|true|false)\b/g;
    const strings = /(['"`])(?:\\.|[^\\])*?\1/g;
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/g;
    const types = /\b(string|number|boolean|void|any|null|undefined|React|useState|useEffect|useCallback|useRef|Promise|Map|Set|Array|Record|Partial|Required|Readonly|Pick|Omit)\b/g;
    const numbers = /\b(\d+\.?\d*)\b/g;
    const decorators = /(@\w+)/g;

    let html = line
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(comments, '<span class="text-gray-600">$&</span>')
        .replace(strings, '<span class="text-emerald-400">$&</span>')
        .replace(keywords, '<span class="text-violet-400">$&</span>')
        .replace(types, '<span class="text-cyan-400">$&</span>')
        .replace(numbers, '<span class="text-amber-400">$&</span>')
        .replace(decorators, '<span class="text-yellow-400">$&</span>');

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
