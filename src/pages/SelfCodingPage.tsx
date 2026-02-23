import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2, Send, Loader, Copy, Check, Trash2, Brain,
    Sparkles, Terminal, FileCode,
    RefreshCw, Bug, BookOpen, TestTube, Settings,
} from 'lucide-react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

type Mode = 'generate' | 'refactor' | 'debug' | 'explain' | 'test';

interface CodeBlock {
    language: string;
    code: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    codeBlocks?: CodeBlock[];
    explanation?: string;
    provider?: string;
    mode?: Mode;
    timestamp: number;
}

const MODE_CONFIG: Record<Mode, { label: string; icon: any; color: string; desc: string }> = {
    generate: { label: 'Generate', icon: Sparkles, color: 'text-cyan-400', desc: 'Create new code from description' },
    refactor: { label: 'Refactor', icon: RefreshCw, color: 'text-violet-400', desc: 'Improve existing code' },
    debug: { label: 'Debug', icon: Bug, color: 'text-red-400', desc: 'Find and fix bugs' },
    explain: { label: 'Explain', icon: BookOpen, color: 'text-amber-400', desc: 'Explain how code works' },
    test: { label: 'Test', icon: TestTube, color: 'text-emerald-400', desc: 'Generate unit tests' },
};

export default function SelfCodingPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [context, setContext] = useState('');
    const [mode, setMode] = useState<Mode>('generate');
    const [language, setLanguage] = useState('typescript');
    const [framework, setFramework] = useState('react');
    const [loading, setLoading] = useState(false);
    const [activeCode, setActiveCode] = useState<CodeBlock | null>(null);
    const [copied, setCopied] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const historyRef = useRef<{ role: string; content: string }[]>([]);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    const copyCode = useCallback((code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    const submit = useCallback(async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: 'user', content: input, mode, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        historyRef.current.push({ role: 'user', content: input });

        try {
            // Use voice-chat EF with code intent (since selfcoding deploy is failing)
            const res = await fetch(`${SUPABASE_URL}/functions/v1/voice-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({
                    message: `[SELFCODING MODE: ${mode}] [LANG: ${language}] [FRAMEWORK: ${framework}]${context ? ` [CONTEXT: ${context}]` : ''}\n\n${input}`,
                    lang: 'en',
                    history: historyRef.current.slice(-8),
                }),
            });

            const data = await res.json();

            if (data.success && data.message) {
                const rawOutput = data.message;

                // Extract code blocks
                const codeBlocks: CodeBlock[] = [];
                const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
                let match;
                while ((match = codeRegex.exec(rawOutput)) !== null) {
                    codeBlocks.push({ language: match[1] || language, code: match[2].trim() });
                }
                const explanation = rawOutput.replace(/```[\s\S]*?```/g, '').trim();

                const assistantMsg: Message = {
                    role: 'assistant',
                    content: rawOutput,
                    codeBlocks,
                    explanation,
                    provider: data.provider,
                    mode,
                    timestamp: Date.now(),
                };

                setMessages(prev => [...prev, assistantMsg]);
                historyRef.current.push({ role: 'assistant', content: rawOutput });

                // Auto-select first code block for preview
                if (codeBlocks.length > 0) {
                    setActiveCode(codeBlocks[0]);
                }
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.error || 'Code generation failed.',
                    timestamp: Date.now(),
                }]);
            }
        } catch (err: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${err.message}`,
                timestamp: Date.now(),
            }]);
        }

        setLoading(false);
    }, [input, mode, language, framework, context, loading]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 flex flex-col h-[calc(100vh-5rem)]"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-cyan-500/30 flex items-center justify-center">
                        <Code2 size={20} className="text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white font-display flex items-center gap-2">
                            Self-Coding Engine
                            <span className="text-[8px] font-mono text-green-500 bg-green-900/30 border border-green-500/20 px-1.5 py-0.5 rounded">7 PROVIDERS</span>
                        </h1>
                        <p className="text-[10px] font-mono text-gray-500">ASiReM • Sovereign Code Generation • No GPU Required</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer">
                        <Settings size={16} />
                    </button>
                    <button onClick={() => { setMessages([]); setActiveCode(null); historyRef.current = []; }} className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 transition-colors cursor-pointer">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Settings Bar */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
                        <div className="flex flex-wrap gap-3 p-3 glass-panel border border-white/10 rounded-xl">
                            <div>
                                <label className="text-[9px] font-mono text-gray-500 uppercase block mb-1">Language</label>
                                <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white cursor-pointer">
                                    {['typescript', 'javascript', 'python', 'rust', 'go', 'swift', 'kotlin', 'java', 'c#', 'html/css'].map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] font-mono text-gray-500 uppercase block mb-1">Framework</label>
                                <select value={framework} onChange={e => setFramework(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white cursor-pointer">
                                    {['react', 'next.js', 'vue', 'svelte', 'express', 'fastapi', 'django', 'unity', 'none'].map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-[9px] font-mono text-gray-500 uppercase block mb-1">Context (paste existing code)</label>
                                <textarea
                                    value={context}
                                    onChange={e => setContext(e.target.value)}
                                    placeholder="Paste existing code for refactoring/debugging..."
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-gray-600 resize-none"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mode Selector */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => setMode(key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${mode === key
                                ? `${cfg.color} bg-white/10 border border-white/20`
                                : 'text-gray-500 bg-white/5 border border-transparent hover:border-white/10'
                                }`}
                        >
                            <Icon size={12} />
                            {cfg.label}
                        </button>
                    );
                })}
            </div>

            {/* Main Split Panel */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* LEFT: Chat Panel */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div ref={chatRef} className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center">
                                    <Brain size={28} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">What do you want to build?</h3>
                                    <p className="text-xs text-gray-500 max-w-sm">Describe your component, function, API, game, or any code. ASiReM generates production-ready code using 7 AI providers.</p>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {[
                                        'Build a React login form with validation',
                                        'Create a REST API for user management',
                                        'Generate a 2D platformer game loop',
                                        'Build a real-time chat component',
                                    ].map(s => (
                                        <button key={s} onClick={() => setInput(s)} className="text-[10px] font-mono text-cyan-500 bg-cyan-900/20 border border-cyan-500/20 px-3 py-1.5 rounded-lg hover:bg-cyan-900/40 transition-colors cursor-pointer">
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
                                <div className={`max-w-[90%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-50'
                                    : 'bg-white/5 border border-white/10 text-gray-300'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[9px] font-mono text-cyan-500 uppercase">{msg.mode}</span>
                                            </div>
                                            <p className="text-sm">{msg.content}</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Brain size={12} className="text-violet-400" />
                                                <span className="text-[9px] font-mono text-violet-400">ASiReM</span>
                                                {msg.provider && (
                                                    <span className="text-[8px] font-mono text-cyan-500 bg-cyan-900/30 px-1.5 py-0.5 rounded">{msg.provider}</span>
                                                )}
                                            </div>
                                            {msg.explanation && (
                                                <p className="text-xs text-gray-400 mb-3">{msg.explanation}</p>
                                            )}
                                            {msg.codeBlocks && msg.codeBlocks.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {msg.codeBlocks.map((cb, j) => (
                                                        <button
                                                            key={j}
                                                            onClick={() => setActiveCode(cb)}
                                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${activeCode === cb
                                                                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                                                                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                                                                }`}
                                                        >
                                                            <FileCode size={10} />
                                                            {cb.language} ({cb.code.split('\n').length} lines)
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {(!msg.codeBlocks || msg.codeBlocks.length === 0) && (
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                                    <Loader size={14} className="text-cyan-400 animate-spin" />
                                    <span className="text-xs text-gray-400 font-mono">Generating code...</span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="mt-3 flex gap-2">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe what to build..."
                            rows={2}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        />
                        <button
                            onClick={submit}
                            disabled={loading || !input.trim()}
                            className={`px-4 rounded-xl flex items-center justify-center transition-all ${loading || !input.trim()
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 cursor-pointer'
                                }`}
                        >
                            {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>

                {/* RIGHT: Code Preview Panel */}
                <div className="w-1/2 hidden md:flex flex-col min-w-0">
                    <div className="flex-1 flex flex-col glass-panel border border-white/10 rounded-2xl overflow-hidden">
                        {/* Code Editor Header */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                </div>
                                {activeCode && (
                                    <span className="text-[10px] font-mono text-gray-500 ml-2">
                                        {activeCode.language} • {activeCode.code.split('\n').length} lines
                                    </span>
                                )}
                            </div>
                            {activeCode && (
                                <button
                                    onClick={() => copyCode(activeCode.code)}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                                >
                                    {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            )}
                        </div>

                        {/* Code Content */}
                        <div className="flex-1 overflow-auto p-4">
                            {activeCode ? (
                                <pre className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {activeCode.code.split('\n').map((line, i) => (
                                        <div key={i} className="flex hover:bg-white/[0.02]">
                                            <span className="text-gray-600 w-8 text-right mr-4 select-none shrink-0">{i + 1}</span>
                                            <span className="flex-1">{highlightSyntax(line)}</span>
                                        </div>
                                    ))}
                                </pre>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                                    <Terminal size={32} className="text-gray-700" />
                                    <p className="text-xs text-gray-600 font-mono">Your code preview will appear here</p>
                                    <p className="text-[10px] text-gray-700">Describe what to build → Code is generated → Preview appears</p>
                                </div>
                            )}
                        </div>

                        {/* Code Stats Footer */}
                        {activeCode && (
                            <div className="px-4 py-2 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <span className="text-[9px] font-mono text-gray-600">
                                    {activeCode.code.length} chars • {activeCode.code.split('\n').length} lines
                                </span>
                                <span className="text-[9px] font-mono text-cyan-600">Sovereign Edge Function • 7-Provider Cascade</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Basic syntax highlighting
function highlightSyntax(line: string): React.ReactElement {
    const keywords = /\b(import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|async|await|try|catch|new|this|extends|implements)\b/g;
    const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/g;
    const types = /\b(string|number|boolean|void|any|null|undefined|React|useState|useEffect|useCallback|useRef)\b/g;

    let html = line
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(comments, '<span class="text-gray-600">$&</span>')
        .replace(strings, '<span class="text-emerald-400">$&</span>')
        .replace(keywords, '<span class="text-violet-400">$&</span>')
        .replace(types, '<span class="text-cyan-400">$&</span>');

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
