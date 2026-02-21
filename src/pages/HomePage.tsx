
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Monitor, Github } from "lucide-react";
import { Link } from 'react-router-dom';

import ReinforcementSandbox from '../components/ReinforcementSandbox';
import CommandTerminal from '../components/CommandTerminal';
import AziReMCatalog from '../components/AziReMCatalog';
import DeploymentProtocols from '../components/DeploymentProtocols';

export default function HomePage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6 pt-12"
        >
            {/* HER0 BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">

                {/* BIG TILE: Playable Arcade */}
                <div className="md:col-span-2 md:row-span-2">
                    <ReinforcementSandbox />
                </div>

                {/* SMALL TILE TOP RIGHT: Swarm Status (Terminal) */}
                <div className="h-64 md:h-auto md:row-span-1 rounded-3xl overflow-hidden glass-panel border border-cyan-500/20 shadow-[0_0_30px_#00ffff11]">
                    <CommandTerminal />
                </div>

                {/* SMALL TILE BOTTOM RIGHT: Repo / UIs Quick Stats */}
                <div className="flex flex-col gap-4">
                    {[
                        { label: 'SCALABLE SYSTEMS', value: '77', icon: Github, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
                        { label: 'ENTERPRISE DEPLOYMENTS', value: '125', icon: Monitor, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
                        { label: 'AI TRAINING MODULES', value: '12', icon: Terminal, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30' }
                    ].map((stat, i) => (
                        <Link to="/fleet" key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${stat.border} ${stat.bg} hover:bg-opacity-20 transition-all group`}>
                            <div className="flex items-center gap-4">
                                <stat.icon size={24} className={stat.color} />
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black font-display text-white group-hover:pl-1 transition-all">
                                        {stat.value}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest font-mono text-gray-400">
                                        {stat.label}
                                    </span>
                                </div>
                            </div>
                            <ArrowRight size={18} className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* A spacer for rhythm */}
            <div className="h-12"></div>

            {/* SEAMLESSLY EMBEDDED PREVIOUS SECTIONS */}
            <AziReMCatalog />

            <div className="h-12"></div>

            <DeploymentProtocols />

        </motion.div>
    );
}
