
import { motion } from 'framer-motion';
import { Gamepad2, PlayCircle, ExternalLink } from 'lucide-react';

export default function ReinforcementSandbox() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full min-h-[500px] flex flex-col rounded-3xl overflow-hidden glass-panel border border-[#8B5CF6]/30 shadow-[0_0_40px_rgba(139,92,246,0.15)] bg-gradient-to-b from-[#0B0D17] to-[#04060A]"
        >
            {/* Top Bar (Apple Vision Style) */}
            <div className="bg-[#10121D]/80 backdrop-blur-md px-6 py-3 flex items-center justify-between border-b border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                    <Gamepad2 size={18} className="text-[#8B5CF6]" />
                    <span className="text-sm font-display font-medium tracking-widest uppercase text-gray-200">
                        Reinforcement Learning Sandbox
                    </span>
                    <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] px-2 py-0.5 rounded uppercase tracking-widest font-bold ml-2 animate-pulse">
                        Live Feed
                    </span>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="text-xs font-mono text-gray-500 hidden sm:block">Status: AUTONOMOUS</span>
                    <a
                        href="https://sovereign-arcade.vercel.app"
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-cyan-400"
                    >
                        <ExternalLink size={16} />
                    </a>
                </div>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 relative overflow-hidden group">
                {/* Embedded Vercel Game Arcade */}
                <iframe
                    src="https://sovereign-arcade.vercel.app"
                    className="absolute inset-0 w-full h-full border-none pointer-events-auto"
                    title="Live Agent Swarm Games"
                />

                {/* Initial Instruction Overlay that disappears on hover/interaction */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-700 flex justify-center items-end pb-6">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-2 rounded-full flex items-center gap-3 shadow-[0_0_30px_#8b5cf633]">
                        <PlayCircle size={16} className="text-[#00FFFF] animate-pulse" />
                        <span className="text-white text-xs font-bold tracking-widest uppercase">Select mode to interact</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
