import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, Square, Loader, Volume2, AlertCircle,
    Globe, Zap, Bot, Brain, Code2, Cpu, Database, Shield,
    Activity, CheckCircle2, Sparkles, Terminal, Eye, Layers, Languages,
    RefreshCw, Search, ChevronRight, RotateCcw, Gauge,
} from 'lucide-react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }
type OrbState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
type VoiceLang = 'en' | 'fr';
type VoiceGender = 'male' | 'female';

// 5-Layer Agentic AI Layer definitions (from framework diagram)
type AgenticLayer = 1 | 2 | 3 | 4 | 5;
const LAYER_META: Record<AgenticLayer, { name: string; role: string; color: string }> = {
    1: { name: 'Foundation', role: 'AI & ML', color: '#6366f1' },
    2: { name: 'Engine', role: 'Deep Learning', color: '#8b5cf6' },
    3: { name: 'Creative', role: 'GenAI', color: '#06b6d4' },
    4: { name: 'Execution', role: 'AI Agents', color: '#10b981' },
    5: { name: 'System', role: 'Agentic AI', color: '#f59e0b' },
};

// Semantic search node — each sentence becomes a clickable exploration root
interface SemanticNode {
    id: string;
    text: string;
    depth: number;        // How many recursion levels deep
    parentId: string | null;
    layer: AgenticLayer;  // Which agentic layer this content belongs to
}

const VOICE_REGISTRY: Record<VoiceLang, Record<VoiceGender, string[]>> = {
    en: {
        female: ['Samantha', 'Karen', 'Moira', 'Tessa', 'Google US English Female', 'Microsoft Zira'],
        male: ['Daniel', 'Alex', 'Fred', 'Google US English Male', 'Microsoft David'],
    },
    fr: {
        female: ['Amelie', 'Marie', 'Audrey', 'Google français', 'Microsoft Hortense'],
        male: ['Thomas', 'Nicolas', 'Google français Male'],
    }
};

interface ChatMessage { role: 'user' | 'assistant'; content: string; }

// ─── Agent Fleet (5-Layer mapped) ──────────────────────────────────────────
const AGENTS = [
    { id: 'asirem', name: 'aSiReM', role: 'Orchestrator', icon: Brain, color: '#8b5cf6', status: 'online', layer: 5 },
    { id: 'scout', name: 'Scout', role: 'Web Search', icon: Globe, color: '#06b6d4', status: 'online', layer: 4 },
    { id: 'codex', name: 'Codex', role: 'Code Generator', icon: Code2, color: '#10b981', status: 'online', layer: 3 },
    { id: 'sentinel', name: 'Sentinel', role: 'Security', icon: Shield, color: '#f43f5e', status: 'active', layer: 5 },
    { id: 'nexus', name: 'Nexus', role: 'Knowledge Graph', icon: Database, color: '#f59e0b', status: 'online', layer: 4 },
    { id: 'bytebot', name: 'ByteBot', role: 'Desktop RPA', icon: Eye, color: '#3b82f6', status: 'active', layer: 4 },
    { id: 'neuron', name: 'Neuron', role: 'ML Pipeline', icon: Cpu, color: '#a855f7', status: 'online', layer: 2 },
    { id: 'delta', name: 'Delta', role: 'DevOps', icon: Layers, color: '#14b8a6', status: 'standby', layer: 5 },
];

const QUICK_PROMPTS = [
    { label: 'Scan Codebase', icon: Code2, prompt: 'Scan my full codebase and identify gaps' },
    { label: 'Web Search', icon: Globe, prompt: 'Search the web for latest AI agent frameworks 2026' },
    { label: 'System Status', icon: Activity, prompt: 'Give me a full status report of the sovereign ecosystem' },
    { label: 'Deploy Fleet', icon: Zap, prompt: 'Deploy all sovereign agents and confirm online status' },
    { label: 'Generate UI', icon: Sparkles, prompt: 'Generate a premium dark glassmorphic UI component' },
    { label: 'Deep Research', icon: Search, prompt: 'Perform deep research on autonomous AI agent orchestration 2026' },
];

// ─── AI API call ─────────────────────────────────────────────────────────────
async function callVoiceChat(
    message: string,
    lang: string,
    history: ChatMessage[]
): Promise<{ text: string; provider: string | null }> {
    try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/voice-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ message, lang, history: history.slice(-6) }),
        });
        const data = await res.json();
        if (data.success && data.message) {
            return { text: data.message, provider: data.provider || null };
        }
        return { text: data.error || 'Connection error.', provider: null };
    } catch {
        return { text: 'Sovereign network temporarily unavailable.', provider: null };
    }
}

interface LogEntry { id: string; agent: string; msg: string; ts: string; type: 'success' | 'info' | 'processing'; layer: AgenticLayer; }

// ─── Utility: split AI response into semantic sentences ─────────────────────
function splitToSemanticNodes(text: string, parentId: string | null, depth: number): SemanticNode[] {
    // Split on sentence boundaries, keep meaningful chunks (min 20 chars)
    const sentences = text
        .replace(/([.!?])\s+/g, '$1|||')
        .split('|||')
        .map(s => s.trim())
        .filter(s => s.length > 20);

    return sentences.map((s, i) => ({
        id: `${Date.now()}-${depth}-${i}`,
        text: s,
        depth,
        parentId,
        layer: (Math.min(5, Math.max(1, Math.ceil(i % 5) + 1))) as AgenticLayer,
    }));
}

// ─── Semantic Node Component — clickable deep-dive ───────────────────────────
function SemanticSentence({
    node,
    isActive,
    isLoading,
    onClick,
}: {
    node: SemanticNode;
    isActive: boolean;
    isLoading: boolean;
    onClick: (node: SemanticNode) => void;
}) {
    const layerMeta = LAYER_META[node.layer];
    return (
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => !isLoading && onClick(node)}
            title="Click to deep-dive into this concept"
            className={`
                inline cursor-pointer rounded px-0.5 transition-all duration-200
                hover:bg-white/10 hover:text-white
                ${isActive ? 'bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/40' : 'text-gray-300'}
                ${node.depth > 0 ? 'border-l-2 pl-1' : ''}
            `}
            style={{
                borderColor: node.depth > 0 ? layerMeta.color + '66' : undefined,
                textDecoration: 'underline dotted',
                textDecorationColor: layerMeta.color + '88',
                textDecorationThickness: '1px',
            }}
        >
            {node.text}{' '}
        </motion.span>
    );
}

// ─── Recursive Deep Search Result ────────────────────────────────────────────
interface DeepNode {
    query: string;
    response: string;
    nodes: SemanticNode[];
    provider: string | null;
    parentNodeId: string | null;
    depth: number;
    id: string;
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function SovereignSearchPage() {
    const [orbState, setOrbState] = useState<OrbState>('idle');
    const [query, setQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [backendOnline] = useState(true);
    const [activeAgent, setActiveAgent] = useState('asirem');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [inputFocused, setInputFocused] = useState(false);
    const [lang, setLang] = useState<VoiceLang>('en');
    const [aiProvider, setAiProvider] = useState<string | null>(null);
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [isDeepSearching, setIsDeepSearching] = useState(false);
    const [activeLayer, setActiveLayer] = useState<AgenticLayer | null>(null);

    // Recursive deep-search graph: array of exploration layers
    const [deepGraph, setDeepGraph] = useState<DeepNode[]>([]);

    const lockedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
    const voiceGenderRef = useRef<VoiceGender>('female');
    const historyRef = useRef<ChatMessage[]>([]);
    const recognitionRef = useRef<any>(null);
    const finalRef = useRef('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const logBottomRef = useRef<HTMLDivElement>(null);
    const responseEndRef = useRef<HTMLDivElement>(null);

    // ── Lock voice on mount / language change ───────────────────────────────
    const lockVoice = useCallback(() => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return;
        const gender = voiceGenderRef.current;
        const candidates = VOICE_REGISTRY[lang][gender];
        const langPrefix = lang === 'fr' ? 'fr' : 'en';
        for (const name of candidates) {
            const found = voices.find(v => v.lang.startsWith(langPrefix) && v.name.includes(name));
            if (found) { lockedVoiceRef.current = found; return; }
        }
        const fallback = voices.find(v => v.lang.startsWith(langPrefix));
        if (fallback) lockedVoiceRef.current = fallback;
    }, [lang]);

    useEffect(() => {
        lockedVoiceRef.current = null;
        lockVoice();
        window.speechSynthesis.onvoiceschanged = lockVoice;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, [lang, lockVoice]);

    // ── Speech Recognition ─────────────────────────────────────────────────
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
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
            const msg = lang === 'fr'
                ? (e.error === 'not-allowed' ? 'Accès au micro refusé.' : `Erreur: ${e.error}`)
                : (e.error === 'not-allowed' ? 'Microphone access denied.' : `Error: ${e.error}`);
            setError(msg);
            setOrbState('error');
        };
        recognition.onend = () => setOrbState(s => s === 'listening' ? 'idle' : s);
        recognitionRef.current = recognition;
    }, [lang]);

    useEffect(() => { logBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
    useEffect(() => { responseEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [deepGraph]);

    const addLog = useCallback((agent: string, msg: string, type: LogEntry['type'] = 'info', layer: AgenticLayer = 4) => {
        setLogs(prev => [...prev.slice(-50), {
            id: Date.now().toString(),
            agent, msg,
            ts: new Date().toLocaleTimeString('en-US', { hour12: false }),
            type, layer,
        }]);
    }, []);

    // ── Core submit: creates a new root DeepNode ───────────────────────────
    const submit = useCallback(async (q: string, parentNodeId: string | null = null, depth = 0) => {
        if (!q.trim()) return;
        const nodeId = `root-${Date.now()}`;

        if (depth === 0) {
            setOrbState('processing');
            setDeepGraph([]);
            setActiveNodeId(null);
        } else {
            setIsDeepSearching(true);
        }

        setError(null);
        setAiProvider(null);
        addLog('aSiReM', `[L${depth}] Processing: "${q.slice(0, 60)}..."`, 'processing', 5);

        historyRef.current.push({ role: 'user', content: q });

        const contextualQuery = depth > 0
            ? `Deep dive into this specific concept from the previous response: "${q}". Provide a focused 3-4 sentence analysis. Be precise and dense.`
            : q;

        const { text: aiText, provider } = await callVoiceChat(contextualQuery, lang, historyRef.current);
        setAiProvider(provider);

        historyRef.current.push({ role: 'assistant', content: aiText });
        if (historyRef.current.length > 20) historyRef.current = historyRef.current.slice(-12);

        const nodes = splitToSemanticNodes(aiText, parentNodeId, depth);

        const newNode: DeepNode = {
            id: nodeId,
            query: q,
            response: aiText,
            nodes,
            provider,
            parentNodeId,
            depth,
        };

        setDeepGraph(prev => depth === 0 ? [newNode] : [...prev, newNode]);
        addLog(provider || 'aSiReM', aiText.slice(0, 80) + '...', 'success', (Math.min(5, depth + 1)) as AgenticLayer);

        if (depth === 0) {
            // TTS only for root response
            setOrbState('speaking');
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(aiText.slice(0, 300));
            utter.rate = 1.0; utter.pitch = 1.0;
            utter.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
            if (lockedVoiceRef.current) utter.voice = lockedVoiceRef.current;
            utter.onend = () => setOrbState('idle');
            window.speechSynthesis.speak(utter);
        } else {
            setIsDeepSearching(false);
        }
    }, [addLog, lang]);

    // ── Interactive sentence click → recursive deep dive ──────────────────
    const handleSemanticClick = useCallback((node: SemanticNode) => {
        if (isDeepSearching || orbState === 'processing') return;
        setActiveNodeId(node.id);
        setActiveLayer(node.layer);
        addLog('Scout', `Deep dive: "${node.text.slice(0, 60)}..."`, 'processing', node.layer);
        submit(node.text, node.id, node.depth + 1);
    }, [isDeepSearching, orbState, addLog, submit]);

    // ── Orb click ─────────────────────────────────────────────────────────
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
            setDeepGraph([]);
            setOrbState('listening');
            try { recognitionRef.current?.start(); } catch { }
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        setQuery(prompt);
        submit(prompt);
    };

    const resetSearch = () => {
        setDeepGraph([]);
        setActiveNodeId(null);
        setQuery('');
        historyRef.current = [];
        window.speechSynthesis.cancel();
        setOrbState('idle');
        setActiveLayer(null);
    };

    const stateColor = {
        idle: { border: 'border-violet-500/60', glow: '#7c3aed', bg: 'bg-violet-900/20' },
        listening: { border: 'border-red-400', glow: '#ef4444', bg: 'bg-red-900/30' },
        processing: { border: 'border-yellow-400', glow: '#eab308', bg: 'bg-yellow-900/20' },
        speaking: { border: 'border-emerald-400', glow: '#10b981', bg: 'bg-emerald-900/20' },
        error: { border: 'border-red-600', glow: '#dc2626', bg: 'bg-red-950/30' },
    }[orbState];

    const rootNode = deepGraph[0] || null;
    const childNodes = deepGraph.slice(1);

    return (
        <div className="flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] gap-0 -mx-3 sm:-mx-4 md:-mx-8 -mb-6 sm:-mb-12 overflow-hidden">

            {/* ══ LEFT SIDEBAR — Agent Fleet (5-Layer View) ══════════════════ */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/[0.06] bg-black/30 backdrop-blur-md overflow-y-auto">
                <div className="px-4 py-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">Fleet Online</span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">{AGENTS.filter(a => a.status !== 'standby').length}/{AGENTS.length} agents active</p>
                </div>

                {/* 5-Layer Indicator */}
                <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-[9px] uppercase tracking-widest font-mono text-gray-600 mb-2">5-Layer Framework</p>
                    <div className="space-y-1">
                        {([1, 2, 3, 4, 5] as AgenticLayer[]).map((layer) => {
                            const meta = LAYER_META[layer];
                            const isActive = activeLayer === layer;
                            return (
                                <div
                                    key={layer}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${isActive ? 'bg-white/10' : ''}`}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                                    <span className="text-[9px] font-mono" style={{ color: isActive ? meta.color : '#6b7280' }}>
                                        L{layer} · {meta.name}
                                    </span>
                                    <span className="ml-auto text-[8px] font-mono text-gray-700">{meta.role}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Agent List */}
                <div className="flex-1 py-3 px-2">
                    <p className="text-[9px] uppercase tracking-widest font-mono text-gray-600 px-2 mb-2">Sovereign Fleet</p>
                    {AGENTS.map((agent) => {
                        const Icon = agent.icon;
                        const isActive = activeAgent === agent.id;
                        const layerMeta = LAYER_META[agent.layer as AgenticLayer];
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
                                    <p className="text-[9px] font-mono truncate" style={{ color: layerMeta.color + 'aa' }}>L{agent.layer} · {agent.role}</p>
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${agent.status === 'online' ? 'bg-emerald-400' :
                                    agent.status === 'active' ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'
                                    }`} />
                            </motion.button>
                        );
                    })}
                </div>

                {/* Depth meter */}
                <div className="p-4 border-t border-white/[0.06] space-y-2">
                    <p className="text-[9px] uppercase tracking-widest font-mono text-gray-600 mb-2">Search Graph</p>
                    {[
                        { label: 'Depth', value: deepGraph.length > 0 ? `${deepGraph.length - 1}` : '—' },
                        { label: 'Nodes', value: deepGraph.reduce((a, n) => a + n.nodes.length, 0) || '—' },
                        { label: 'Backend', value: backendOnline ? 'LIVE' : 'LOCAL' },
                    ].map(s => (
                        <div key={s.label} className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-gray-600 uppercase">{s.label}</span>
                            <span className={`text-[10px] font-mono font-bold ${s.label === 'Backend' ? (backendOnline ? 'text-emerald-400' : 'text-yellow-400') : 'text-white'}`}>{s.value}</span>
                        </div>
                    ))}
                </div>
            </aside>

            {/* ══ CENTER — Main Interface ══════════════════════════════════════ */}
            <main className="flex-1 flex flex-col items-center justify-start overflow-y-auto px-3 sm:px-6 py-4 sm:py-8">

                {/* Headline */}
                {deepGraph.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-6 sm:mb-10 max-w-2xl"
                    >
                        <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white mb-2 sm:mb-3 tracking-tight">
                            What do you want to{' '}
                            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                                explore today?
                            </span>
                        </h1>
                        <p className="text-[10px] sm:text-sm text-gray-500 font-mono">
                            Ask anything · Click any sentence to deep-dive recursively · 5-Layer Agentic AI
                        </p>
                        <motion.button
                            onClick={() => setLang(l => l === 'en' ? 'fr' : 'en')}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer"
                        >
                            <Languages className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[10px] font-mono font-bold text-white tracking-widest">
                                {lang === 'en' ? '🇬🇧 ENGLISH' : '🇫🇷 FRANÇAIS'}
                            </span>
                        </motion.button>
                    </motion.div>
                )}

                {/* ── Voice Orb ──────────────────────────────────────────────── */}
                <div className="relative mb-4 sm:mb-6 flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: orbState === 'listening' ? [1, 1.3, 1] : orbState === 'speaking' ? [1, 1.15, 1] : [1, 1.05, 1],
                            opacity: orbState === 'idle' ? 0.3 : [0.4, 0.8, 0.4],
                        }}
                        transition={{ duration: orbState === 'listening' ? 1 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute rounded-full blur-[50px] w-24 h-24 sm:w-36 sm:h-36"
                        style={{ backgroundColor: stateColor.glow + '55' }}
                    />
                    <motion.button
                        onClick={handleOrb}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        disabled={orbState === 'processing'}
                        className={`relative z-10 w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-500 disabled:opacity-40 ${stateColor.border} ${stateColor.bg}`}
                    >
                        <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{ background: `radial-gradient(circle, ${stateColor.glow}88, transparent)` }} />
                        {orbState === 'listening' && <Square className="w-5 h-5 sm:w-7 sm:h-7 z-10 text-red-200 fill-red-400" />}
                        {orbState === 'processing' && <Loader className="w-5 h-5 sm:w-7 sm:h-7 z-10 text-yellow-200 animate-spin" />}
                        {orbState === 'speaking' && <Volume2 className="w-5 h-5 sm:w-7 sm:h-7 z-10 text-emerald-200 animate-pulse" />}
                        {orbState === 'error' && <AlertCircle className="w-5 h-5 sm:w-7 sm:h-7 z-10 text-red-300" />}
                        {orbState === 'idle' && <Mic className="w-5 h-5 sm:w-7 sm:h-7 z-10 text-violet-200" />}
                    </motion.button>
                </div>

                {/* State label */}
                <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-3 sm:mb-5">
                    {orbState === 'idle' && (deepGraph.length > 0 ? 'Click any sentence to explore deeper' : 'Tap orb to speak · or type below')}
                    {orbState === 'listening' && '⬤ Recording — tap to stop & send'}
                    {orbState === 'processing' && 'Routing to sovereign mesh...'}
                    {orbState === 'speaking' && 'ASiReM is speaking — tap to interrupt'}
                    {orbState === 'error' && 'Error — use text input below'}
                    {isDeepSearching && '⟳ Deep diving into semantic node...'}
                </p>

                {/* ── Text Input ────────────────────────────────────────────── */}
                <div className={`w-full max-w-2xl relative mb-4 sm:mb-5 transition-all duration-300 ${inputFocused ? 'sm:scale-[1.01]' : ''}`}>
                    <div className={`rounded-2xl border transition-all duration-300 ${inputFocused ? 'border-violet-500/60 shadow-[0_0_20px_#7c3aed33]' : 'border-white/10'} bg-black/40 backdrop-blur-xl`}>
                        <textarea
                            ref={textareaRef}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(query); } }}
                            disabled={orbState === 'processing'}
                            placeholder={orbState === 'listening' ? 'Listening...' : 'Ask anything · Enter to deep search · or tap the orb'}
                            rows={2}
                            className="w-full bg-transparent px-3 sm:px-5 pt-3 sm:pt-4 pb-2 text-white text-xs sm:text-sm font-sans placeholder:text-gray-600 outline-none resize-none leading-relaxed"
                        />
                        <div className="flex items-center justify-between px-4 pb-3 pt-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                                    {backendOnline ? '⬤ VPS Live' : '⬤ Local'}
                                </span>
                                {deepGraph.length > 0 && (
                                    <button onClick={resetSearch} className="flex items-center gap-1 text-[9px] font-mono text-gray-600 hover:text-red-400 transition-colors">
                                        <RotateCcw size={9} />Reset
                                    </button>
                                )}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => submit(query)}
                                disabled={!query.trim() || orbState === 'processing'}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white text-xs font-bold font-mono tracking-widest transition-all"
                            >
                                {orbState === 'processing' ? <Loader className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                                SEARCH
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* ── Quick Prompts ─────────────────────────────────────────── */}
                {deepGraph.length === 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mb-4 sm:mb-8 max-w-2xl">
                        {QUICK_PROMPTS.map((qp) => {
                            const Icon = qp.icon;
                            return (
                                <motion.button
                                    key={qp.label}
                                    onClick={() => handleQuickPrompt(qp.prompt)}
                                    whileHover={{ scale: 1.04, y: -1 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 text-gray-400 hover:text-white text-[9px] sm:text-[11px] font-mono tracking-wide transition-all"
                                >
                                    <Icon size={11} />
                                    {qp.label}
                                </motion.button>
                            );
                        })}
                    </div>
                )}

                {/* ── Error ────────────────────────────────────────────────── */}
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

                {/* ══ RECURSIVE DEEP SEARCH GRAPH ═════════════════════════════ */}
                <AnimatePresence>
                    {rootNode && (
                        <motion.div
                            key="deep-graph"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-2xl space-y-4"
                        >
                            {/* Root query breadcrumb */}
                            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600">
                                <Gauge size={10} className="text-violet-400" />
                                <span className="text-violet-400">Root Query</span>
                                {childNodes.length > 0 && (
                                    <>
                                        <ChevronRight size={10} />
                                        <span>{childNodes.length} deep dive{childNodes.length > 1 ? 's' : ''}</span>
                                    </>
                                )}
                                <button onClick={resetSearch} className="ml-auto flex items-center gap-1 text-gray-600 hover:text-red-400 transition-colors">
                                    <RotateCcw size={9} />Reset
                                </button>
                            </div>

                            {/* All nodes in the deep graph */}
                            {deepGraph.map((node, gi) => (
                                <motion.div
                                    key={node.id}
                                    initial={{ opacity: 0, x: gi > 0 ? 20 : 0 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: gi > 0 ? 0.1 : 0 }}
                                    className="rounded-2xl border bg-black/30 backdrop-blur-xl overflow-hidden"
                                    style={{
                                        borderColor: gi === 0 ? '#7c3aed33' : `${LAYER_META[Math.min(5, gi) as AgenticLayer].color}33`,
                                        marginLeft: `${Math.min(gi * 12, 48)}px`,
                                    }}
                                >
                                    {/* Node header */}
                                    <div
                                        className="flex items-center justify-between px-5 py-3 border-b"
                                        style={{ borderColor: gi === 0 ? '#7c3aed22' : `${LAYER_META[Math.min(5, gi) as AgenticLayer].color}22` }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {gi === 0
                                                ? <Brain size={12} className="text-violet-400" />
                                                : <RefreshCw size={10} style={{ color: LAYER_META[Math.min(5, node.depth) as AgenticLayer].color }} />
                                            }
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest"
                                                style={{ color: gi === 0 ? '#a78bfa' : LAYER_META[Math.min(5, node.depth) as AgenticLayer].color }}>
                                                {gi === 0 ? 'aSiReM Response' : `Deep Dive · L${node.depth}`}
                                            </span>
                                            {node.provider && (
                                                <span className="text-[8px] font-mono text-cyan-500 bg-cyan-900/30 border border-cyan-500/20 px-1.5 py-0.5 rounded uppercase">
                                                    {node.provider}
                                                </span>
                                            )}
                                        </div>
                                        <CheckCircle2 size={12} className="text-emerald-400" />
                                    </div>

                                    {/* Semantic query shown for child nodes */}
                                    {gi > 0 && (
                                        <div className="px-5 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                                            <p className="text-[9px] font-mono text-gray-600">
                                                <span className="text-gray-500">▸ </span>
                                                {node.query.slice(0, 120)}{node.query.length > 120 ? '...' : ''}
                                            </p>
                                        </div>
                                    )}

                                    {/* Interactive semantic nodes */}
                                    <div className="p-5 leading-7">
                                        {node.nodes.map((sn) => (
                                            <SemanticSentence
                                                key={sn.id}
                                                node={sn}
                                                isActive={activeNodeId === sn.id}
                                                isLoading={isDeepSearching}
                                                onClick={handleSemanticClick}
                                            />
                                        ))}
                                    </div>

                                    {/* Hint */}
                                    {gi === 0 && (
                                        <div className="px-5 py-2 border-t border-white/[0.04] bg-white/[0.01]">
                                            <p className="text-[9px] font-mono text-gray-700">
                                                ↑ Click any underlined sentence above to recursively deep-dive
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Deep search loading indicator */}
                            {isDeepSearching && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-3 px-5 py-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 ml-4"
                                >
                                    <Loader size={12} className="text-yellow-400 animate-spin" />
                                    <span className="text-[10px] font-mono text-yellow-400">Recursive search in progress...</span>
                                </motion.div>
                            )}

                            <div ref={responseEndRef} />
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>

            {/* ══ RIGHT PANEL — Live Agent Log Stream ══════════════════════════ */}
            <aside className="hidden xl:flex flex-col w-72 shrink-0 border-l border-white/[0.06] bg-black/20 backdrop-blur-md overflow-hidden">
                <div className="px-4 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity size={12} className="text-cyan-400" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">Live Mesh Log</span>
                    </div>
                    <span className="text-[9px] font-mono text-gray-600">{logs.length} events</span>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                    {logs.length === 0 && (
                        <div className="text-center pt-10">
                            <Bot size={24} className="text-gray-700 mx-auto mb-3" />
                            <p className="text-[10px] font-mono text-gray-700">Awaiting first command...</p>
                        </div>
                    )}
                    <AnimatePresence>
                        {logs.map((log) => {
                            const layerColor = LAYER_META[log.layer]?.color || '#6b7280';
                            return (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                    className={`rounded-xl p-3 border text-[10px] font-mono ${log.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' :
                                        log.type === 'processing' ? 'bg-yellow-500/5 border-yellow-500/20' :
                                            'bg-white/[0.02] border-white/[0.05]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: layerColor }} />
                                            <span className={`font-bold uppercase ${log.type === 'success' ? 'text-emerald-400' :
                                                log.type === 'processing' ? 'text-yellow-400' : 'text-gray-400'
                                                }`}>{log.agent}</span>
                                        </div>
                                        <span className="text-gray-700">{log.ts}</span>
                                    </div>
                                    <p className="text-gray-500 leading-relaxed">{log.msg}</p>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    <div ref={logBottomRef} />
                </div>

                {/* Active agents pills */}
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
