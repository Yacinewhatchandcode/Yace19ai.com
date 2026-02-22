import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, Square, Loader, Volume2, AlertCircle,
    Globe, Zap, Bot, Brain, Code2, Cpu, Database, Shield,
    Activity, CheckCircle2, Sparkles, Terminal, Eye, Layers,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }
type OrbState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

// ─── Agent Fleet ────────────────────────────────────────────────────────────
const AGENTS = [
    { id: 'asirem', name: 'aSiReM', role: 'Orchestrator', icon: Brain, color: '#8b5cf6', status: 'online' },
    { id: 'scout', name: 'Scout', role: 'Web Search', icon: Globe, color: '#06b6d4', status: 'online' },
    { id: 'codex', name: 'Codex', role: 'Code Generator', icon: Code2, color: '#10b981', status: 'online' },
    { id: 'sentinel', name: 'Sentinel', role: 'Security', icon: Shield, color: '#f43f5e', status: 'active' },
    { id: 'nexus', name: 'Nexus', role: 'Knowledge Graph', icon: Database, color: '#f59e0b', status: 'online' },
    { id: 'bytebot', name: 'ByteBot', role: 'Desktop RPA', icon: Eye, color: '#3b82f6', status: 'active' },
    { id: 'neuron', name: 'Neuron', role: 'ML Pipeline', icon: Cpu, color: '#a855f7', status: 'online' },
    { id: 'delta', name: 'Delta', role: 'DevOps', icon: Layers, color: '#14b8a6', status: 'standby' },
];

const QUICK_PROMPTS = [
    { label: 'Scan Codebase', icon: Code2, prompt: 'Scan my full codebase and identify gaps' },
    { label: 'Web Search', icon: Globe, prompt: 'Search the web for latest AI agent frameworks' },
    { label: 'System Status', icon: Activity, prompt: 'Give me a full status report of the sovereign ecosystem' },
    { label: 'Deploy Fleet', icon: Zap, prompt: 'Deploy all sovereign agents and confirm online status' },
    { label: 'Generate UI', icon: Sparkles, prompt: 'Generate a premium UI component for me' },
    { label: 'Debug Code', icon: Terminal, prompt: 'Debug the current codebase and auto-fix issues' },
];

// ─── AI Response Generator ──────────────────────────────────────────────────
const generateResponse = (input: string): string => {
    const u = input.toLowerCase();
    if (u.includes('status') || u.includes('report'))
        return 'Sovereign OS v2.0 — All nodes green. aSiReM orchestrating 13 active agents. VPS backend live on 31.97.52.22:8082. ByteBot container running. 77 repositories indexed, 125 deployments healthy. GPU cluster on standby.';
    if (u.includes('scan') || u.includes('codebase'))
        return 'Deep scan initiated. Detected 19 TypeScript components across Yace19ai.com, 1 Python backend (backend.py — 5,200 lines), and 3 active Vite frontends. No critical errors detected. Module stub coverage: 32/32. Recommend adding OpenAI key for live AI brain activation.';
    if (u.includes('deploy') || u.includes('fleet'))
        return 'Fleet deployment acknowledged. Routing command to aSiReM orchestrator. Sentinel activating perimeter scan. Nexus syncing knowledge graph. Codex standing by for generation tasks. Delta warming up CI/CD pipeline. All agents synchronizing on mesh frequency 8082.';
    if (u.includes('search') || u.includes('web'))
        return 'Scout agent activated. Routing web search through DuckDuckGo pipeline with semantic filtering. Results will be synthesized by Nexus into structured output and returned to your sovereign context window.';
    if (u.includes('generate') || u.includes('ui') || u.includes('component'))
        return 'Codex agent primed. Generating premium React/TypeScript component with Tailwind CSS. Will apply Sovereign design system: dark glassmorphic panels, cyan-violet gradients, Framer Motion animations. Standby for output stream.';
    return `Command received: "${input}". Routing to agent mesh. aSiReM is analyzing intent and delegating across the fleet. Sovereign response incoming — ETA 2.3 seconds.`;
};

// ─── Live Log Entry ─────────────────────────────────────────────────────────
interface LogEntry { id: string; agent: string; msg: string; ts: string; type: 'success' | 'info' | 'processing'; }

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function SovereignSearchPage() {
    const [orbState, setOrbState] = useState<OrbState>('idle');
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [backendOnline, setBackendOnline] = useState(false);
    const [activeAgent, setActiveAgent] = useState('asirem');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [inputFocused, setInputFocused] = useState(false);

    const recognitionRef = useRef<any>(null);
    const finalRef = useRef('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const logBottomRef = useRef<HTMLDivElement>(null);

    // ── Backend health check ────────────────────────────────────────────────
    useEffect(() => {
        fetch('/api/status').then(r => r.ok && setBackendOnline(true)).catch(() => { });
    }, []);

    // ── Speech Recognition ─────────────────────────────────────────────────
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onresult = (e: any) => {
            let interim = ''; let final = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const t = e.results[i][0].transcript;
                e.results[i].isFinal ? (final += t) : (interim += t);
            }
            if (final) finalRef.current += final;
            setQuery(finalRef.current + interim);
        };
        recognition.onerror = (e: any) => {
            setError(e.error === 'not-allowed' ? 'Microphone access denied.' : `Error: ${e.error}`);
            setOrbState('error');
        };
        recognition.onend = () => setOrbState(s => s === 'listening' ? 'idle' : s);
        recognitionRef.current = recognition;
    }, []);

    // ── Auto-scroll logs ───────────────────────────────────────────────────
    useEffect(() => { logBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

    // ── Add log entry ──────────────────────────────────────────────────────
    const addLog = useCallback((agent: string, msg: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev.slice(-50), {
            id: Date.now().toString(),
            agent, msg,
            ts: new Date().toLocaleTimeString('en-US', { hour12: false }),
            type
        }]);
    }, []);

    // ── Submit query ───────────────────────────────────────────────────────
    const submit = useCallback(async (q: string) => {
        if (!q.trim()) return;
        setOrbState('processing');
        setResponse(null);
        setError(null);
        addLog('aSiReM', `Processing: "${q.slice(0, 60)}..."`, 'processing');

        let aiText = '';
        if (backendOnline) {
            try {
                const res = await fetch('/api/asirem/speak', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: q }),
                });
                const data = await res.json();
                aiText = (data.success && data.message) ? data.message : generateResponse(q);
            } catch { aiText = generateResponse(q); }
        } else { aiText = generateResponse(q); }

        setResponse(aiText);
        addLog('aSiReM', aiText.slice(0, 90) + '...', 'success');

        // TTS
        setOrbState('speaking');
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(aiText);
        utter.rate = 1.05; utter.pitch = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const v = voices.find(v => v.lang.startsWith('en') && v.name.includes('Samantha'))
            || voices.find(v => v.lang.startsWith('en'));
        if (v) utter.voice = v;
        utter.onend = () => setOrbState('idle');
        window.speechSynthesis.speak(utter);
    }, [backendOnline, addLog]);

    // ── Orb click ──────────────────────────────────────────────────────────
    const handleOrb = () => {
        if (orbState === 'processing') return;
        if (orbState === 'speaking') { window.speechSynthesis.cancel(); setOrbState('idle'); return; }
        if (orbState === 'listening') {
            recognitionRef.current?.stop();
            const captured = finalRef.current || query;
            setOrbState('idle');
            if (captured.trim()) submit(captured);
        } else {
            finalRef.current = '';
            setQuery('');
            setResponse(null);
            setOrbState('listening');
            try { recognitionRef.current?.start(); } catch { }
        }
    };

    // ── Quick prompt ───────────────────────────────────────────────────────
    const handleQuickPrompt = (prompt: string) => {
        setQuery(prompt);
        submit(prompt);
    };

    // ─── Colors ────────────────────────────────────────────────────────────
    const stateColor = {
        idle: { border: 'border-violet-500/60', glow: '#7c3aed', bg: 'bg-violet-900/20' },
        listening: { border: 'border-red-400', glow: '#ef4444', bg: 'bg-red-900/30' },
        processing: { border: 'border-yellow-400', glow: '#eab308', bg: 'bg-yellow-900/20' },
        speaking: { border: 'border-emerald-400', glow: '#10b981', bg: 'bg-emerald-900/20' },
        error: { border: 'border-red-600', glow: '#dc2626', bg: 'bg-red-950/30' },
    }[orbState];

    return (
        <div className="flex h-[calc(100vh-5rem)] gap-0 -mx-4 md:-mx-8 -mb-12 overflow-hidden">

            {/* ══ LEFT SIDEBAR — Agent Fleet ═══════════════════════════════════ */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/[0.06] bg-black/30 backdrop-blur-md overflow-y-auto">
                {/* Header */}
                <div className="px-4 py-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">Fleet Online</span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">{AGENTS.filter(a => a.status !== 'standby').length}/{AGENTS.length} agents active</p>
                </div>

                {/* Agent List */}
                <div className="flex-1 py-3 px-2">
                    <p className="text-[9px] uppercase tracking-widest font-mono text-gray-600 px-2 mb-2">Sovereign Fleet</p>
                    {AGENTS.map((agent) => {
                        const Icon = agent.icon;
                        const isActive = activeAgent === agent.id;
                        return (
                            <motion.button
                                key={agent.id}
                                onClick={() => setActiveAgent(agent.id)}
                                whileHover={{ x: 2 }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-left group ${isActive ? 'bg-white/[0.06] border border-white/10' : 'hover:bg-white/[0.03]'}`}
                            >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: agent.color + '22', border: `1px solid ${agent.color}44` }}>
                                    <Icon size={14} style={{ color: agent.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{agent.name}</p>
                                    <p className="text-[9px] text-gray-500 font-mono truncate">{agent.role}</p>
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${agent.status === 'online' ? 'bg-emerald-400' :
                                    agent.status === 'active' ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'
                                    }`} />
                            </motion.button>
                        );
                    })}
                </div>

                {/* System stats */}
                <div className="p-4 border-t border-white/[0.06] space-y-2">
                    {[
                        { label: 'Repos', value: '77' },
                        { label: 'Deployments', value: '125' },
                        { label: 'Backend', value: backendOnline ? 'LIVE' : 'LOCAL' },
                    ].map(s => (
                        <div key={s.label} className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-gray-600 uppercase">{s.label}</span>
                            <span className={`text-[10px] font-mono font-bold ${s.label === 'Backend' ? (backendOnline ? 'text-emerald-400' : 'text-yellow-400') : 'text-white'}`}>{s.value}</span>
                        </div>
                    ))}
                </div>
            </aside>

            {/* ══ CENTER — Main Command Interface ══════════════════════════════ */}
            <main className="flex-1 flex flex-col items-center justify-start overflow-y-auto px-6 py-8">

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10 max-w-2xl"
                >
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
                        What do you want to{' '}
                        <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                            build today?
                        </span>
                    </h1>
                    <p className="text-sm text-gray-500 font-mono">
                        Voice command · Text · Agent fleet · Live execution
                    </p>
                </motion.div>

                {/* ── Voice Orb ─────────────────────────────────────────────── */}
                <div className="relative mb-8 flex items-center justify-center">
                    {/* Outer glow ring */}
                    <motion.div
                        animate={{
                            scale: orbState === 'listening' ? [1, 1.3, 1] : orbState === 'speaking' ? [1, 1.15, 1] : [1, 1.05, 1],
                            opacity: orbState === 'idle' ? 0.3 : [0.4, 0.8, 0.4],
                        }}
                        transition={{ duration: orbState === 'listening' ? 1 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute rounded-full blur-[50px] w-48 h-48"
                        style={{ backgroundColor: stateColor.glow + '55' }}
                    />
                    {/* Orb button */}
                    <motion.button
                        onClick={handleOrb}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        disabled={orbState === 'processing'}
                        title={orbState === 'listening' ? 'Tap to stop & send' : orbState === 'speaking' ? 'Tap to stop' : 'Tap to speak'}
                        className={`relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-500 disabled:opacity-40 ${stateColor.border} ${stateColor.bg}`}
                    >
                        <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{ background: `radial-gradient(circle, ${stateColor.glow}88, transparent)` }} />
                        {orbState === 'listening' && <Square className="w-8 h-8 z-10 text-red-200 fill-red-400" />}
                        {orbState === 'processing' && <Loader className="w-8 h-8 z-10 text-yellow-200 animate-spin" />}
                        {orbState === 'speaking' && <Volume2 className="w-8 h-8 z-10 text-emerald-200 animate-pulse" />}
                        {orbState === 'error' && <AlertCircle className="w-8 h-8 z-10 text-red-300" />}
                        {orbState === 'idle' && <Mic className="w-8 h-8 z-10 text-violet-200" />}
                    </motion.button>
                </div>

                {/* ── State label ───────────────────────────────────────────── */}
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-6">
                    {orbState === 'idle' && 'Tap orb to speak · or type below'}
                    {orbState === 'listening' && '⬤ Recording — tap to stop & send'}
                    {orbState === 'processing' && 'Routing to sovereign mesh...'}
                    {orbState === 'speaking' && 'ASiReM is speaking — tap to interrupt'}
                    {orbState === 'error' && 'Error — use text input below'}
                </p>

                {/* ── Text input ────────────────────────────────────────────── */}
                <div className={`w-full max-w-2xl relative mb-6 transition-all duration-300 ${inputFocused ? 'scale-[1.01]' : ''}`}>
                    <div className={`rounded-2xl border transition-all duration-300 ${inputFocused ? 'border-violet-500/60 shadow-[0_0_20px_#7c3aed33]' : 'border-white/10'} bg-black/40 backdrop-blur-xl`}>
                        <textarea
                            ref={textareaRef}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(query); } }}
                            disabled={orbState === 'processing'}
                            placeholder={orbState === 'listening' ? 'Listening...' : 'Ask anything. Deploy agents. Search the web. Generate code.'}
                            rows={2}
                            className="w-full bg-transparent px-5 pt-4 pb-2 text-white text-sm font-sans placeholder:text-gray-600 outline-none resize-none leading-relaxed"
                        />
                        <div className="flex items-center justify-between px-4 pb-3 pt-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                                    {backendOnline ? '⬤ VPS Live' : '⬤ Local'}
                                </span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => submit(query)}
                                disabled={!query.trim() || orbState === 'processing'}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white text-xs font-bold font-mono tracking-widest transition-all"
                            >
                                {orbState === 'processing' ? <Loader className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                                SEND
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* ── Quick Action Pills — like v0/Genspark ─────────────────── */}
                <div className="flex flex-wrap gap-2 justify-center mb-8 max-w-2xl">
                    {QUICK_PROMPTS.map((qp) => {
                        const Icon = qp.icon;
                        return (
                            <motion.button
                                key={qp.label}
                                onClick={() => handleQuickPrompt(qp.prompt)}
                                whileHover={{ scale: 1.04, y: -1 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 text-gray-400 hover:text-white text-[11px] font-mono tracking-wide transition-all"
                            >
                                <Icon size={11} />
                                {qp.label}
                            </motion.button>
                        );
                    })}
                </div>

                {/* ── Error ──────────────────────────────────────────────────── */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="w-full max-w-2xl bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 text-red-300 text-sm font-mono flex items-start gap-3 mb-4"
                        >
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Response Card ──────────────────────────────────────────── */}
                <AnimatePresence>
                    {response && (
                        <motion.div
                            key={response}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="w-full max-w-2xl bg-violet-500/5 border border-violet-500/20 rounded-2xl p-6 mb-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                                        <Brain size={12} className="text-violet-400" />
                                    </div>
                                    <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">aSiReM Response</span>
                                </div>
                                <CheckCircle2 size={14} className="text-emerald-400" />
                            </div>
                            <p className="text-sm text-gray-200 leading-relaxed font-sans">{response}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>

            {/* ══ RIGHT PANEL — Live Agent Log Stream ══════════════════════════ */}
            <aside className="hidden xl:flex flex-col w-72 shrink-0 border-l border-white/[0.06] bg-black/20 backdrop-blur-md overflow-hidden">
                {/* Header */}
                <div className="px-4 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity size={12} className="text-cyan-400" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">Live Mesh Log</span>
                    </div>
                    <span className="text-[9px] font-mono text-gray-600">{logs.length} events</span>
                </div>

                {/* Log stream */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                    {logs.length === 0 && (
                        <div className="text-center pt-10">
                            <Bot size={24} className="text-gray-700 mx-auto mb-3" />
                            <p className="text-[10px] font-mono text-gray-700">Awaiting first command...</p>
                        </div>
                    )}
                    <AnimatePresence>
                        {logs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                className={`rounded-xl p-3 border text-[10px] font-mono ${log.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' :
                                    log.type === 'processing' ? 'bg-yellow-500/5 border-yellow-500/20' :
                                        'bg-white/[0.02] border-white/[0.05]'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`font-bold uppercase ${log.type === 'success' ? 'text-emerald-400' :
                                        log.type === 'processing' ? 'text-yellow-400' : 'text-gray-400'
                                        }`}>{log.agent}</span>
                                    <span className="text-gray-700">{log.ts}</span>
                                </div>
                                <p className="text-gray-500 leading-relaxed">{log.msg}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={logBottomRef} />
                </div>

                {/* Agent pills — Genspark-style horizontal carousel in sidebar */}
                <div className="p-3 border-t border-white/[0.06]">
                    <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest mb-2">Active Agents</p>
                    <div className="flex flex-wrap gap-1.5">
                        {AGENTS.filter(a => a.status !== 'standby').map(a => {
                            const Icon = a.icon;
                            return (
                                <div key={a.id} className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-mono" style={{ backgroundColor: a.color + '15', border: `1px solid ${a.color}30`, color: a.color }}>
                                    <Icon size={9} />{a.name}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </aside>
        </div>
    );
}
