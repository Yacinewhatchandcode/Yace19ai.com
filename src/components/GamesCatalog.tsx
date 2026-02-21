import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Swords,
    Bot,
    Cpu,
    Zap,
    Sparkles,
    PlayCircle,
    X,
    Smartphone,
    Apple
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Game {
    id: string;
    title: string;
    desc: string;
    icon: LucideIcon;
    demoUrl: string;
    apkUrl?: string;
    iosInfo?: string;
    category: string;
    status: string;
    gradient: string;
    emoji: string;
}

const GAMES: Game[] = [
    {
        id: "sovereign-arcade",
        title: "Sovereign Arcade",
        desc: "6 classic arcade games with built-in AI agents. Play manually, challenge the agent, or watch it dominate. Runner, Invaders, Pipeline Dash, Snake, Breakout, Pong.",
        icon: Sparkles,
        demoUrl: "https://sovereign-arcade.vercel.app",
        category: "Arcade / AI Agent",
        status: "Live",
        gradient: "from-cyan-600 via-purple-600 to-pink-500",
        emoji: "🕹️",
    },
    {
        id: "sovereign-matrix",
        title: "Sovereign OS: Active Matrix",
        desc: "Interactive 3D terminal replacing the text IDE. Command internal Swarm agents natively by moving your avatar and approaching execution nodes.",
        icon: Cpu,
        demoUrl: "/sovereign/index.html",
        category: "System Interface",
        status: "Live",
        gradient: "from-green-600 to-emerald-400",
        emoji: "🌐",
    },
    {
        id: "platformer",
        title: "Sovereign Platformer 3D",
        desc: "A custom 3D platformer running natively in your browser. Defy gravity, dodge obstacles, and survive the Mario-like challenges!",
        icon: Zap,
        demoUrl: "https://prime-ai.fr/games/platformer/index.html",
        apkUrl: "/downloads/Sovereign-Platformer_Android.apk",
        iosInfo: "iOS Native Ready",
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
        demoUrl: "https://prime-ai.fr/games/swarm-architect/index.html",
        apkUrl: "/downloads/Swarm-Architect_Android.apk",
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
        demoUrl: "https://prime-ai.fr/games/kids-games/index.html",
        apkUrl: "/downloads/Antigravity-Kids_Android.apk",
        category: "Education",
        status: "Live",
        gradient: "from-blue-600 to-cyan-500",
        emoji: "🚀",
    },
    {
        id: "arena",
        title: "Agent Arena",
        desc: "12 autonomous AI agents in a real-time battle royale. Strategic combat, kill feeds, and only one winner.",
        icon: Swords,
        demoUrl: "https://prime-ai.fr/games/arena",
        category: "Strategy / AI",
        status: "Live",
        gradient: "from-pink-600 to-rose-500",
        emoji: "⚔️",
    },
    {
        id: "werewolf",
        title: "Project Werewolf",
        desc: "AI social deduction simulation. 8 agents negotiate, accuse, and deceive across night/day cycles.",
        icon: Bot,
        demoUrl: "https://prime-ai.fr/games/werewolf",
        category: "Agent Simulation",
        status: "Live",
        gradient: "from-fuchsia-600 to-purple-500",
        emoji: "🐺",
    },
    {
        id: "chess",
        title: "Sovereign Chess",
        desc: "Full chess engine with minimax AI. Play against the computer or watch two AI engines clash.",
        icon: Cpu,
        demoUrl: "https://prime-ai.fr/games/chess",
        category: "Distributed AI",
        status: "Live",
        gradient: "from-emerald-600 to-teal-500",
        emoji: "♟️",
    },
];

const GameCard: React.FC<{ game: Game; index: number }> = ({ game, index }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-gray-900/40 backdrop-blur-md hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/10 flex flex-col h-full ${isPlaying ? 'col-span-1 md:col-span-2 lg:col-span-2 row-span-2 z-30 scale-[1.02]' : ''}`}
        >
            {/* Header / Graphic / Iframe Container */}
            <div className={`transition-all duration-500 bg-gradient-to-br ${game.gradient} relative overflow-hidden flex flex-col justify-center items-center ${isPlaying ? 'h-[60vh] md:h-[500px]' : 'h-32 p-7'}`}>

                {isPlaying ? (
                    <div className="absolute inset-0 w-full h-full bg-black">
                        <iframe
                            src={game.demoUrl}
                            className="w-full h-full border-none rounded-t-2xl"
                            title={`${game.title} Live Gameplay`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <>
                        <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md p-2 rounded-lg border border-white/5 z-10">
                            <game.icon size={24} className="text-white" />
                        </div>
                        <div className="absolute bottom-4 left-6 flex gap-2 z-10">
                            <span className="text-xs font-bold tracking-wider uppercase text-white/60 bg-black/20 px-2 py-1 rounded backdrop-blur-md">
                                {game.category}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg border text-[10px] uppercase tracking-widest font-bold bg-emerald-500/10 border-emerald-500/20 text-emerald-400 backdrop-blur-md">
                                {game.status}
                            </span>
                        </div>

                        {/* Abstract decorative circles */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                        <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />

                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button
                                onClick={() => setIsPlaying(true)}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-semibold transition-all shadow-lg hover:scale-105"
                            >
                                <PlayCircle size={20} /> Test Live Mechanics
                            </button>
                        </div>
                    </>
                )}

                {isPlaying && (
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md z-40 shadow-2xl transition-all"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-7 relative z-10 flex-grow flex flex-col bg-[#030812]/50">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                        {game.emoji} {game.title}
                    </h3>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                    {game.desc}
                </p>

                <div className="flex flex-col gap-3 mt-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <a
                                href={`https://prime-ai.fr/checkout?product=${game.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 backdrop-blur-md px-4 py-1.5 rounded-xl border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] flex items-center gap-2 transition-all group cursor-pointer"
                            >
                                <span className="text-white font-black tracking-widest text-xs uppercase group-hover:scale-105 transition-transform flex items-center gap-2">
                                    Download Source: 1€
                                </span>
                                <span className="text-emerald-200/70 text-[10px] line-through font-medium">149€</span>
                            </a>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end mt-2 md:mt-0">
                            {game.apkUrl ? (
                                <a
                                    href={game.apkUrl}
                                    download
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors"
                                >
                                    <Smartphone className="w-4 h-4" />
                                    Android
                                </a>
                            ) : (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-white/50 text-xs font-bold border border-white/5 cursor-not-allowed">
                                    <Smartphone className="w-4 h-4" />
                                    Android
                                </span>
                            )}
                            <a
                                href={game.iosInfo || "#"}
                                onClick={(e) => !game.iosInfo && e.preventDefault()}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${game.iosInfo ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-white/5 text-white/50 border-white/5 cursor-not-allowed'}`}
                            >
                                <Apple className="w-4 h-4" />
                                iOS
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function GamesCatalog() {
    return (
        <div className="w-full relative">
            <div className="w-full mx-auto">
                <div className="flex flex-col items-center text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-300 text-xs font-bold tracking-widest uppercase">
                            ASIREM Interactive Modules
                        </span>
                    </motion.div>

                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Explore <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Live Experiences</span> Anywhere
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Play these immersive experiences directly in your browser on desktop and mobile, or download the native apps for iOS and Android. Our technology is built to be responsive everywhere.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
                    {GAMES.map((game, i) => (
                        <GameCard key={game.id} game={game} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
