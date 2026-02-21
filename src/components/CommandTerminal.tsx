import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_LOGS = [
    "[NODE_01] Initiating Prime-AI Neural Hub...",
    "[SWARM_NET] 77 Repositories Indexed. 125 UIs Online.",
    "[AGENT_03] Analyzing inbound connection...",
    "> SECURE HANDSHAKE ESTABLISHED",
    "[ORCHESTRATOR] Routing execution pipeline...",
    "DeepSearch sequence activated (Query: B2B Copilot).",
    "Running validation on Vast.ai cluster 31022347.",
    "[AGENT_07] Model Live Avatar 14B initialized.",
    "[SYSTEM] Zero-Illusion protocol active. No simulated outputs.",
    "Awaiting command input..."
];

export default function CommandTerminal() {
    const [logs, setLogs] = useState<string[]>([]);
    const [currentLogIndex, setCurrentLogIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentLogIndex < MOCK_LOGS.length) {
            const timeout = setTimeout(() => {
                setLogs(prev => [...prev, MOCK_LOGS[currentLogIndex]]);
                setCurrentLogIndex(prev => prev + 1);
            }, Math.random() * 800 + 400); // Random delay between 400-1200ms
            return () => clearTimeout(timeout);
        } else {
            // Loop it eventually for infinite effect
            const loopTimeout = setTimeout(() => {
                setLogs(["[SYSTEM] Rebooting terminal instance...", "[NODE_01] Initiating Prime-AI Neural Hub..."]);
                setCurrentLogIndex(1);
            }, 10000);
            return () => clearTimeout(loopTimeout);
        }
    }, [currentLogIndex]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full glass-panel bg-[#02050A]/80 border border-cyan-500/20 rounded-2xl p-4 flex flex-col font-mono text-xs md:text-sm text-cyan-400 overflow-hidden relative"
        >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
                <div className="flex items-center gap-2">
                    <TerminalIcon size={14} className="text-cyan-500" />
                    <span className="font-bold tracking-widest text-[#8B5CF6]">SOVEREIGN_OS_TERMINAL</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50 animate-pulse" />
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto hidden-scrollbar flex flex-col gap-1.5 scroll-smooth">
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                        <span className="text-gray-600 select-none">{`>`}</span>
                        <span className={`${log.includes('[ERR]') ? 'text-red-400' : log.includes('[SWARM') ? 'text-purple-400' : 'text-cyan-300'} opacity-90 leading-relaxed break-words`}>
                            {log}
                        </span>
                    </div>
                ))}
                {/* Blinking cursor */}
                <div className="flex gap-2 mt-1">
                    <span className="text-gray-600 select-none">{`>`}</span>
                    <span className="w-2 h-4 bg-cyan-400 animate-pulse block"></span>
                </div>
            </div>

            {/* Glowing bottom edge */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_0_10px_#00FFFF]" />
        </motion.div>
    );
}
