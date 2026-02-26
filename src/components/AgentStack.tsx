import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Network,
    Sparkles,
    Bot,
    Infinity,
    ChevronDown,
    Zap,
    Shield,
    RotateCcw,
    DollarSign,
    Eye,
    Database,
} from 'lucide-react';

interface Layer {
    id: string;
    index: number;
    emoji: string;
    title: string;
    subtitle: string;
    tagline: string;
    color: string;
    borderColor: string;
    bgColor: string;
    glowColor: string;
    icon: React.ReactNode;
    bullets: string[];
    primeLink: string;
    primeLinkUrl?: string;
}

const LAYERS: Layer[] = [
    {
        id: 'ai-ml',
        index: 1,
        emoji: '🧠',
        title: 'AI & ML',
        subtitle: 'The Foundation',
        tagline: 'Turning data into decisions.',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/40',
        bgColor: 'bg-blue-500/5',
        glowColor: 'shadow-blue-500/20',
        icon: <Brain size={28} />,
        bullets: [
            'Supervised & unsupervised learning',
            'Reinforcement learning',
            'Attention mechanisms',
            'Transformers, CNNs, LSTMs',
        ],
        primeLink: 'Classical learning that turns raw data into intelligent patterns.',
    },
    {
        id: 'deep-learning',
        index: 2,
        emoji: '⚙️',
        title: 'Deep Learning',
        subtitle: 'The Engine',
        tagline: 'Neural networks and transformers.',
        color: 'text-violet-400',
        borderColor: 'border-violet-500/40',
        bgColor: 'bg-violet-500/5',
        glowColor: 'shadow-violet-500/20',
        icon: <Network size={28} />,
        bullets: [
            'Multi-layered neural networks',
            'Convolutional Neural Networks (CNNs)',
            'Recurrent Networks & LSTMs',
            'Deep Belief Networks',
        ],
        primeLink: 'This is where the machinery learns patterns at scale.',
    },
    {
        id: 'gen-ai',
        index: 3,
        emoji: '✨',
        title: 'Gen AI',
        subtitle: 'The Creative',
        tagline: 'LLMs and multimodal generation.',
        color: 'text-cyan-400',
        borderColor: 'border-cyan-500/40',
        bgColor: 'bg-cyan-500/5',
        glowColor: 'shadow-cyan-500/20',
        icon: <Sparkles size={28} />,
        bullets: [
            'LLMs generate content',
            'RAG pulls context',
            'Multimodal (text, image, audio, video)',
            'Speech interfaces (TTS & ASR)',
        ],
        primeLink: 'PRIME.AI ships Groq, OpenRouter & multimodal generation — live today.',
    },
    {
        id: 'ai-agents',
        index: 4,
        emoji: '🤖',
        title: 'AI Agents',
        subtitle: 'The Execution',
        tagline: 'Where AI becomes operational.',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/40',
        bgColor: 'bg-amber-500/5',
        glowColor: 'shadow-amber-500/20',
        icon: <Bot size={28} />,
        bullets: [
            'Planning (ReAct, CoT, ToT)',
            'Tool use and orchestration',
            'Context management (state + history)',
            'Human-in-the-loop oversight',
        ],
        primeLink: '18 specialized AI agents deployed in production at PRIME.AI.',
    },
    {
        id: 'agentic-ai',
        index: 5,
        emoji: '∞',
        title: 'Agentic AI',
        subtitle: 'The System',
        tagline: 'Autonomy at scale.',
        color: 'text-rose-400',
        borderColor: 'border-rose-500/40',
        bgColor: 'bg-rose-500/5',
        glowColor: 'shadow-rose-500/20',
        icon: <Infinity size={28} />,
        bullets: [
            'Governance, safety, guardrails',
            'Observability & tracing',
            'Memory governance & retention policies',
            'Rollback and failure recovery',
            'Cost & resource management',
            'Multi-agent coordination',
        ],
        primeLink: 'The AMLAZR Zero-Illusion Protocol — every node verified, every action traced.',
    },
];

const GOVERNANCE_PILLARS = [
    { icon: <Shield size={16} />, label: 'Governance & Guardrails', color: 'text-rose-400' },
    { icon: <Eye size={16} />, label: 'Observability & Tracing', color: 'text-amber-400' },
    { icon: <Database size={16} />, label: 'Memory Retention Policies', color: 'text-cyan-400' },
    { icon: <RotateCcw size={16} />, label: 'Rollback & Failure Recovery', color: 'text-violet-400' },
    { icon: <DollarSign size={16} />, label: 'Cost & Resource Management', color: 'text-emerald-400' },
    { icon: <Zap size={16} />, label: 'Multi-Agent Coordination', color: 'text-blue-400' },
];

const LayerCard: React.FC<{ layer: Layer; index: number }> = ({ layer, index }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12, duration: 0.5 }}
            className={`relative rounded-2xl border ${layer.borderColor} ${layer.bgColor} backdrop-blur-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl hover:${layer.glowColor}`}
            onClick={() => setExpanded(!expanded)}
        >
            {/* Top bar accent */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent ${layer.color} opacity-60`} />

            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    {/* Layer number + icon */}
                    <div className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${layer.borderColor} ${layer.color} bg-black/30`}>
                            {layer.icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-mono text-white/30 tracking-widest">{layer.index}/5</span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${layer.borderColor} ${layer.color} bg-black/20`}>
                                    {layer.subtitle}
                                </span>
                            </div>
                            <h3 className={`text-xl font-black ${layer.color} tracking-tight`}>{layer.title}</h3>
                            <p className="text-gray-400 text-sm mt-0.5">{layer.tagline}</p>
                        </div>
                    </div>

                    <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-500 group-hover:text-white transition-colors mt-1 flex-shrink-0"
                    >
                        <ChevronDown size={18} />
                    </motion.div>
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mt-5 pt-5 border-t border-white/[0.06]">
                                <ul className="space-y-2 mb-4">
                                    {layer.bullets.map((b) => (
                                        <li key={b} className="flex items-start gap-2 text-sm text-gray-300">
                                            <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${layer.color} bg-current`} />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                                {layer.primeLink && (
                                    <div className={`mt-4 px-4 py-3 rounded-xl border ${layer.borderColor} bg-black/20 text-xs ${layer.color} font-medium`}>
                                        <span className="text-white/40 mr-1">PRIME.AI →</span>
                                        {layer.primeLink}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const AgentStack: React.FC = () => {
    return (
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500/10 to-violet-500/10 border border-white/10 mb-6">
                        <Infinity size={14} className="text-rose-400" />
                        <span className="text-sm font-medium text-gray-300">Agentic AI: A Complete Framework</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Five Layers.{' '}
                        <span className="bg-gradient-to-r from-rose-400 to-violet-400 bg-clip-text text-transparent">
                            Each one matters.
                        </span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Most people think Agentic AI is just "ChatGPT + tools." They're wrong.
                        Most failures happen in layers 4 and 5, not in the models.
                    </p>
                </motion.div>

                {/* Directive shift */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14"
                >
                    <div className="px-5 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-sm">
                        <span className="text-red-400 font-bold">Stop asking:</span>
                        <span className="text-gray-400 ml-2">"Which technology should I pick?"</span>
                    </div>
                    <div className="px-5 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-sm">
                        <span className="text-emerald-400 font-bold">Start asking:</span>
                        <span className="text-gray-400 ml-2">"How does this system behave when things go wrong?"</span>
                    </div>
                </motion.div>

                {/* The 5 Layers — stacked with arrow connectors */}
                <div className="relative">
                    <div className="space-y-3">
                        {LAYERS.map((layer, i) => (
                            <div key={layer.id}>
                                <LayerCard layer={layer} index={i} />
                                {i < LAYERS.length - 1 && (
                                    <div className="flex justify-center py-1">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <div className="w-px h-3 bg-gradient-to-b from-white/20 to-transparent" />
                                            <div className="w-2 h-2 rotate-45 border-r border-b border-white/20" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Governance Pillars — Layer 5 expanded detail */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-8"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Shield size={18} className="text-rose-400" />
                        <h3 className="text-lg font-bold text-white">Layer 5 — Governance & Future</h3>
                        <span className="text-xs text-rose-400 font-mono ml-auto">MOST UNDERESTIMATED</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        Clever algorithms don't guarantee reliability. <strong className="text-white">Architecture does.</strong>
                        <br />
                        Without audit trails, debugging capabilities, reversal mechanisms, and clear boundaries — you haven't built autonomy. You've created an unpredictable script.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {GOVERNANCE_PILLARS.map((p) => (
                            <div key={p.label} className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                <span className={p.color}>{p.icon}</span>
                                <span className="text-xs text-gray-300">{p.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* PRIME.AI positioning */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 text-center"
                >
                    <div className="inline-block px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
                        <p className="text-gray-400 text-sm max-w-xl">
                            PRIME.AI is built across all 5 layers — from the foundation models to full Agentic governance.
                            The <span className="text-white font-semibold">AMLAZR Zero-Illusion Protocol</span> ensures every node is verified, every action is traced, and every failure is recoverable.
                        </p>
                        <a
                            href="/fleet"
                            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 text-white text-sm font-bold hover:opacity-90 transition-all"
                        >
                            <Zap size={14} />
                            See the live deployments
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default AgentStack;
