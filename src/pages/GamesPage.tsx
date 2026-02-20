import { motion } from "framer-motion";
import {
    Gamepad2,
    Swords,
    Bot,
    Cpu,
    Zap,
    Trophy,
    ChevronRight,
    ArrowLeft,
    Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const GAMES = [
    {
        id: "platformer",
        title: "Sovereign Platformer 3D",
        desc: "A custom 3D platformer running natively in your browser. Defy gravity, dodge obstacles, and survive the Mario-like challenges!",
        icon: Zap,
        href: "/games/platformer/index.html",
        category: "Action / Platformer",
        status: "Live",
        gradient: "from-red-600 to-orange-500",
        emoji: "🍄",
    },
    {
        id: "swarm-architect",
        title: "Swarm Architect",
        desc: "A Vampire-Survivor style auto-battler. Command your AI swarm, upgrade node levels, and protect the core integrity!",
        icon: Swords,
        href: "/games/swarm-architect/index.html",
        category: "Auto-Battler",
        status: "Live",
        gradient: "from-purple-600 to-indigo-500",
        emoji: "⚔️",
    },
    {
        id: "kids-games",
        title: "Antigravity Kids",
        desc: "A collection of 9 tailored educational games for young explorers aged 3-12. Enjoy Puzzle solving, Coding and more!",
        icon: Bot,
        href: "/games/kids-games/index.html",
        category: "Education",
        status: "Live",
        gradient: "from-blue-600 to-cyan-500",
        emoji: "🚀",
    },
    {
        id: "chess",
        title: "Sovereign Chess",
        desc: "Full chess engine with minimax AI. Play against the computer or watch two AI engines clash.",
        icon: Cpu,
        href: "https://prime-ai.fr/games/chess",
        category: "Distributed AI",
        status: "Live",
        gradient: "from-emerald-600 to-teal-500",
        emoji: "♟️",
    },
];

const STATS = [
    { label: "Games", value: "4", icon: Gamepad2 },
    { label: "AI Agents", value: "32", icon: Bot },
    { label: "Total Rounds", value: "∞", icon: Zap },
    { label: "Multiplayer", value: "Soon", icon: Trophy },
];

export default function GamesPage() {
    return (
        <div className="min-h-screen bg-[#030812] text-white relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-cyan-500/8 via-blue-600/4 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-gradient-radial from-purple-500/6 via-transparent to-transparent rounded-full blur-3xl" />
                <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-gradient-radial from-red-500/4 via-transparent to-transparent rounded-full blur-3xl" />
            </div>

            {/* Navigation */}
            <nav className="fixed w-full px-6 py-4 flex justify-between items-center z-50 bg-[#030812]/80 backdrop-blur-xl border-b border-white/5">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <span className="font-bold text-white">Y</span>
                    </div>
                    <span className="font-bold tracking-tight text-xl">Yace19.ai</span>
                </Link>
                <Link
                    to="/"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Portfolio
                </Link>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 pt-28 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-300 text-xs font-bold tracking-widest uppercase">
                            Free AI Games
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="text-4xl md:text-6xl font-black mb-6 leading-tight"
                    >
                        Play{" "}
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            AI Games
                        </span>{" "}
                        for Free
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
                    >
                        From reflex-based platformers to strategic AI simulations. Every
                        game runs natively in your browser. No downloads. No installs. No
                        cost.
                    </motion.p>
                </div>

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16 max-w-3xl mx-auto"
                >
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                            className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center backdrop-blur-sm"
                        >
                            <stat.icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                            <div className="text-2xl font-black text-white">{stat.value}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Game Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {GAMES.map((game, i) => (
                        <motion.a
                            key={game.id}
                            href={game.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + i * 0.08 }}
                            whileHover={{ y: -4, scale: 1.01 }}
                            className="group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 cursor-pointer block"
                        >
                            {/* Gradient overlay on hover */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none`}
                            />

                            {/* Content */}
                            <div className="relative z-10 p-7">
                                {/* Top row: emoji + badges */}
                                <div className="flex items-start justify-between mb-5">
                                    <div className="text-4xl">{game.emoji}</div>
                                    <div className="flex gap-2">
                                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                            {game.category}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-lg border text-[10px] uppercase tracking-widest font-bold bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                                            {game.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-black text-white mb-2 group-hover:text-cyan-300 transition-colors">
                                    {game.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                    {game.desc}
                                </p>

                                {/* Footer: Free + Play button */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                                            Free
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
                                        Play Now
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </div>

                            {/* Subtle animated border glow on hover */}
                            <div className="absolute inset-0 rounded-2xl border border-cyan-500/0 group-hover:border-cyan-500/20 transition-colors duration-500 pointer-events-none" />
                        </motion.a>
                    ))}
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-16 text-center"
                >
                    <div className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm max-w-2xl mx-auto">
                        <Gamepad2 className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">
                            Powered by{" "}
                            <a
                                href="https://prime-ai.fr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                Prime AI
                            </a>
                        </h2>
                        <p className="text-gray-500 text-sm mb-6 max-w-lg mx-auto">
                            All games are open-source Next.js components. Fork any game,
                            modify the logic, and deploy your own simulation. No engine
                            required.
                        </p>
                        <a
                            href="https://prime-ai.fr/games"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                            Explore Full Games Hub
                            <ChevronRight size={16} />
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="relative py-8 px-4 border-t border-white/5 text-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                <p className="text-gray-600 text-xs relative z-10">
                    © {new Date().getFullYear()} Yacine Benhamou — Built with Prime AI
                    Technology
                </p>
            </footer>
        </div>
    );
}
