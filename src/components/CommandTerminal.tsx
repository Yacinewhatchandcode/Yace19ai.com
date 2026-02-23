import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const BOOT_LINES = [
    "[SOVEREIGN_OS] Booting neural mesh...",
    "[VAULT] 7 encrypted API keys loaded.",
    "[VOICE] ASiReM voice-chat v2 online (Groq + OpenRouter).",
];

export default function CommandTerminal() {
    const [logs, setLogs] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Phase 1: Boot sequence
        let timer: ReturnType<typeof setTimeout>;
        const bootSequence = async () => {
            for (let i = 0; i < BOOT_LINES.length; i++) {
                await new Promise(r => { timer = setTimeout(r, 400 + Math.random() * 300); });
                setLogs(prev => [...prev, BOOT_LINES[i]]);
            }

            // Phase 2: Load real agent memory
            const { data: memories } = await supabase
                .from('agent_memory')
                .select('agent_id, type, content, created_at')
                .order('created_at', { ascending: false })
                .limit(15);

            if (memories && memories.length > 0) {
                setLogs(prev => [...prev, `[MEMORY] ${memories.length} agent memories loaded.`]);
                for (const m of memories.slice(0, 8)) {
                    await new Promise(r => { timer = setTimeout(r, 300 + Math.random() * 400); });
                    const snippet = m.content.replace(/\n/g, ' ').slice(0, 80);
                    setLogs(prev => [...prev, `[${m.agent_id.toUpperCase()}] ${snippet}...`]);
                }
            }

            // Phase 3: Load real system alerts
            const { data: alerts } = await supabase
                .from('system_alerts')
                .select('type, severity, message, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

            if (alerts && alerts.length > 0) {
                await new Promise(r => { timer = setTimeout(r, 600); });
                setLogs(prev => [...prev, `[ALERTS] ${alerts.length} system alerts queued.`]);
                for (const a of alerts.slice(0, 3)) {
                    await new Promise(r => { timer = setTimeout(r, 250); });
                    const sev = a.severity === 'critical' ? '🔴' : a.severity === 'high' ? '🟠' : '🟡';
                    setLogs(prev => [...prev, `${sev} [${a.type}] ${a.message.slice(0, 70)}`]);
                }
            }

            // Phase 4: Load real provider health
            const { data: health } = await supabase
                .from('provider_health_log')
                .select('total_providers, available_providers, degraded_providers, created_at')
                .order('created_at', { ascending: false })
                .limit(1);

            if (health && health[0]) {
                await new Promise(r => { timer = setTimeout(r, 500); });
                const h = health[0];
                setLogs(prev => [...prev,
                `[FLEET] ${h.available_providers}/${h.total_providers} providers online. ${h.degraded_providers} degraded.`
                ]);
            }

            await new Promise(r => { timer = setTimeout(r, 800); });
            setLogs(prev => [...prev, "[SYSTEM] All subsystems nominal. Awaiting command input..."]);
        };

        bootSequence();
        return () => clearTimeout(timer);
    }, []);

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
                    <span className="text-[8px] text-green-500 bg-green-900/30 px-1.5 py-0.5 rounded border border-green-500/20">LIVE</span>
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
                        <span className={`${log.includes('🔴') ? 'text-red-400' :
                            log.includes('🟠') ? 'text-orange-400' :
                                log.includes('[MEMORY]') || log.includes('[FLEET]') ? 'text-purple-400' :
                                    log.includes('[VAULT]') || log.includes('[VOICE]') ? 'text-green-400' :
                                        log.includes('[ALERTS]') ? 'text-amber-400' :
                                            'text-cyan-300'} opacity-90 leading-relaxed break-words`}>
                            {log}
                        </span>
                    </div>
                ))}
                <div className="flex gap-2 mt-1">
                    <span className="text-gray-600 select-none">{`>`}</span>
                    <span className="w-2 h-4 bg-cyan-400 animate-pulse block"></span>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_0_10px_#00FFFF]" />
        </motion.div>
    );
}
