import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Workflow, Loader, ExternalLink, RefreshCw, Zap, GitBranch, Bot, AlertCircle } from 'lucide-react';

const SIM_URL = 'http://31.97.52.22:3014';

export default function WorkflowPage() {
    const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');
    const [frameLoaded, setFrameLoaded] = useState(false);

    useEffect(() => {
        // Probe sim availability
        fetch(`/api/sim/health`, { method: 'GET', signal: AbortSignal.timeout(5000) })
            .then(r => { if (r.ok || r.status < 500) setStatus('online'); else setStatus('offline'); })
            .catch(() => setStatus('offline'));
    }, []);

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] -mx-3 sm:-mx-4 md:-mx-8 -mb-6 sm:-mb-12 overflow-hidden bg-[#02050A]">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <GitBranch size={18} className="text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-white tracking-tight">Sovereign Workflow Builder</h1>
                        <p className="text-[10px] font-mono text-gray-500">Visual multi-agent orchestration · Sim Studio</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Status badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono font-bold ${status === 'online' ? 'border-green-500/30 bg-green-500/10 text-green-400' :
                            status === 'offline' ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                                'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-green-400 animate-pulse' :
                                status === 'offline' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
                            }`} />
                        {status === 'loading' ? 'CONNECTING...' : status === 'online' ? 'SIM ONLINE' : 'OFFLINE'}
                    </div>

                    {/* Actions */}
                    <button
                        onClick={() => { setFrameLoaded(false); setStatus('loading'); setTimeout(() => setStatus('online'), 1000); }}
                        className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-all cursor-pointer"
                        title="Refresh"
                    >
                        <RefreshCw size={13} className="text-gray-400" />
                    </button>
                    <a
                        href={SIM_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-all"
                        title="Open in new tab"
                    >
                        <ExternalLink size={13} className="text-gray-400" />
                    </a>
                </div>
            </div>

            {/* ── Capability bar ── */}
            <div className="flex items-center gap-4 px-4 py-2 border-b border-white/[0.04] bg-black/20 shrink-0 overflow-x-auto">
                {[
                    { icon: Bot, label: 'Multi-Agent Orchestration', color: 'text-violet-400' },
                    { icon: Zap, label: 'Tool Chaining', color: 'text-cyan-400' },
                    { icon: GitBranch, label: 'Conditional Flows', color: 'text-emerald-400' },
                    { icon: Workflow, label: 'Visual Drag & Drop', color: 'text-orange-400' },
                ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-1.5 shrink-0">
                        <Icon size={11} className={color} />
                        <span className={`text-[9px] font-mono font-bold ${color} uppercase tracking-widest`}>{label}</span>
                    </div>
                ))}
            </div>

            {/* ── Main content area ── */}
            <div className="flex-1 relative overflow-hidden">
                {/* Loading overlay */}
                {(!frameLoaded || status === 'loading') && status !== 'offline' && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: frameLoaded ? 0 : 1 }}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#02050A] pointer-events-none"
                    >
                        <div className="relative mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <Workflow size={28} className="text-violet-400" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                                <Loader size={10} className="text-white animate-spin" />
                            </div>
                        </div>
                        <p className="text-white font-bold text-sm mb-1">Loading Workflow Engine</p>
                        <p className="text-gray-500 text-[11px] font-mono">Connecting to Sim Studio on VPS...</p>
                    </motion.div>
                )}

                {/* Offline state */}
                {status === 'offline' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#02050A]">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <AlertCircle size={28} className="text-red-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-white font-bold text-sm mb-1">Workflow Engine Offline</p>
                            <p className="text-gray-500 text-xs max-w-xs text-center">
                                The Sim Studio container on VPS is unreachable. It may be starting up or require a restart.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setStatus('loading'); setTimeout(() => setStatus('online'), 1500); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono font-bold hover:bg-violet-500/20 transition-all cursor-pointer"
                            >
                                <RefreshCw size={12} /> Retry Connection
                            </button>
                            <a
                                href={SIM_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-xs font-mono font-bold hover:bg-white/[0.08] transition-all"
                            >
                                <ExternalLink size={12} /> Open Direct URL
                            </a>
                        </div>
                    </div>
                )}

                {/* Sim Studio iframe */}
                {status !== 'offline' && (
                    <iframe
                        src={SIM_URL}
                        className="w-full h-full border-none"
                        title="Sim Studio — Sovereign Workflow Builder"
                        onLoad={() => setFrameLoaded(true)}
                        allow="clipboard-write; clipboard-read"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
                    />
                )}
            </div>
        </div>
    );
}
