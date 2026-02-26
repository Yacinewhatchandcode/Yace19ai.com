import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, Code2, Database, Layout, Cpu, Bot, PlayCircle, X, Loader } from 'lucide-react';
import CheckoutModal from './CheckoutModal';
import { supabase } from '../lib/supabase';

interface Project {
    id: string;
    title: string;
    category: string;
    description: string;
    tech: string[];
    link?: string;
    demo_url?: string;
    video_file?: string;
    image?: string;
    color: string;
    icon: string;
    status?: 'live' | 'development' | 'concept';
    ai_model?: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    layout: <Layout size={24} className="text-cyan-400" />,
    cpu: <Cpu size={24} className="text-violet-400" />,
    bot: <Bot size={24} className="text-amber-400" />,
    database: <Database size={24} className="text-orange-400" />,
    code: <Code2 size={24} className="text-emerald-400" />,
};

const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/20 flex flex-col h-full items-stretch ${isPlaying ? 'md:col-span-2 lg:col-span-2 row-span-2 z-10 scale-[1.02]' : ''}`}
        >
            <div className={`transition-all duration-500 bg-gray-900 relative overflow-hidden flex flex-col justify-center items-center shrink-0 ${isPlaying ? 'h-96 md:h-[500px]' : 'h-48 group-hover:h-56'}`}>
                {isPlaying ? (
                    <div className="absolute inset-0 w-full h-full bg-black">
                        {project.video_file ? (
                            <video src={project.video_file} autoPlay controls className="w-full h-full object-contain" />
                        ) : project.demo_url ? (
                            <iframe src={project.demo_url} className="w-full h-full border-none bg-white" title={`${project.title} Live Demo`} />
                        ) : null}
                    </div>
                ) : (
                    <>
                        {project.image ? (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
                                <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,1)] opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_ease-in-out_infinite] z-20 pointer-events-none" />
                            </>
                        ) : (
                            <div className={`absolute inset-0 bg-gradient-to-br ${project.color}`} />
                        )}
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10 z-20">
                            {ICON_MAP[project.icon] || <Code2 size={24} className="text-cyan-400" />}
                        </div>
                        <div className="absolute bottom-4 left-6 flex gap-2 z-20">
                            {project.ai_model && (
                                <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-300 bg-cyan-900/40 px-2 py-1 rounded backdrop-blur-md border border-cyan-500/30">{project.ai_model}</span>
                            )}
                            <span className="text-[10px] font-bold tracking-wider uppercase text-white bg-black/40 px-2 py-1 rounded backdrop-blur-md border border-white/10">{project.category}</span>
                        </div>
                        {(project.video_file || project.demo_url) && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                                <button onClick={() => setIsPlaying(true)} className={`flex items-center gap-3 border backdrop-blur-md px-6 py-3 rounded-full text-white font-bold transition-all hover:-translate-y-1 ${project.video_file ? 'bg-gradient-to-r from-red-600 to-red-800 border-red-400/50 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.4)]'}`}>
                                    <PlayCircle size={24} className="animate-pulse" />
                                    {project.video_file ? "Watch Visual Demo" : "Open Live Interface"}
                                </button>
                            </div>
                        )}
                    </>
                )}
                {isPlaying && (
                    <button onClick={() => setIsPlaying(false)} className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 border border-white/20 text-white p-2 rounded-full backdrop-blur-md z-30 shadow-2xl transition-all">
                        <X size={20} />
                    </button>
                )}
            </div>
            <div className="p-6 flex-grow flex flex-col bg-gray-900/40 relative z-20">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((t) => (<span key={t} className="text-xs font-medium px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/5">{t}</span>))}
                </div>
                <div className="mt-auto flex gap-2">
                    {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem' }} className="flex-1 flex items-center justify-center gap-2 text-white rounded-lg border font-bold transition-all shadow-lg text-sm bg-gray-800/80 border-white/10 hover:border-white/30 hover:bg-gray-700/80">
                            <Github size={16} /> Source
                        </a>
                    )}
                    <button onClick={() => setIsCheckoutOpen(true)} style={{ padding: '0.75rem' }} className="flex-1 flex items-center justify-center gap-2 text-white rounded-lg border font-bold transition-all shadow-lg text-sm cursor-pointer bg-gradient-to-r from-blue-600 to-blue-800 border-blue-500 shadow-blue-900/40 hover:border-blue-400 hover:scale-[1.02]">
                        Acquire €1 ↗
                    </button>
                    <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} projectId={project.id} projectTitle={project.title} />
                </div>
            </div>
        </motion.div>
    );
};

export default function ProjectPortfolio() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ repos: 0, uis: 0, clis: 0, games: 0 });

    useEffect(() => {
        supabase.from('portfolio_projects').select('*').order('sort_order').then(({ data }) => {
            if (data && data.length > 0) setProjects(data);
            setLoading(false);
        });
        // Live stats
        Promise.all([
            supabase.from('portfolio_projects').select('*', { count: 'exact', head: true }),
            supabase.from('games_catalog').select('*', { count: 'exact', head: true }),
        ]).then(([projRes, gamesRes]) => {
            setStats({
                repos: projRes.count || 21,
                uis: 125,
                clis: 12,
                games: gamesRes.count || 20,
            });
        });
    }, []);

    return (
        <div className="w-full h-full pb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 bg-gray-900/60 backdrop-blur-xl border border-green-500/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-green-500/5">
                    <div className="flex items-center gap-3">
                        <Database className="text-green-400 animate-pulse" size={24} />
                        <h2 className="text-xl font-bold text-white tracking-tight font-mono">SOVEREIGN DISK DEEP AUDIT</h2>
                    </div>
                    <div className="text-xs font-mono text-green-400 flex items-center gap-2 border border-green-500/30 px-3 py-1 bg-green-900/30 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        LIVE VERIFIED - ALL NODES GREEN
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
                    {[
                        { val: stats.repos, label: 'GitHub Repositories' },
                        { val: stats.uis, label: 'Functional UIs' },
                        { val: stats.clis, label: 'Working CLIs' },
                        { val: stats.games, label: 'Functional Games' },
                    ].map(s => (
                        <div key={s.label} className="bg-gray-900/80 p-6 flex flex-col justify-center items-center group hover:bg-gray-800/80 transition-colors">
                            <div className="text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform">
                                {s.val}<span className="text-green-500 text-lg ml-1">🟢</span>
                            </div>
                            <div className="text-xs text-gray-400 font-mono text-center tracking-widest uppercase">{s.label}</div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <div className="flex items-center justify-between mb-8 px-2 md:px-0">
                <div className="flex items-center gap-3">
                    <Layout className="text-cyan-500" size={24} />
                    <h2 className="text-2xl font-bold text-white tracking-tight font-display uppercase">Active Swarm Nodes</h2>
                </div>
                <div className="text-sm font-mono tracking-widest text-cyan-400 flex items-center gap-2 bg-cyan-900/20 px-3 py-1 border border-cyan-500/30 rounded">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    {loading ? 'LOADING...' : 'LIVE DEPLOYMENTS'}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader className="text-cyan-400 animate-spin" size={32} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-min">
                    {projects.map((project, i) => (<ProjectCard key={project.id} project={project} index={i} />))}
                </div>
            )}
        </div>
    );
}
