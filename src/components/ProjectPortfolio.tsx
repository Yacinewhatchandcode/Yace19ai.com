import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Code2, Database, Layout, Cpu, Bot, PlayCircle, X } from 'lucide-react';

interface Project {
    id: string;
    title: string;
    category: string;
    description: string;
    tech: string[];
    link?: string;
    demoUrl?: string; // If an iframe or site is available
    videoFile?: string; // If a recorded mp4 demo is available
    image?: string; // Auto-generated repo screenshots
    color: string;
    icon: React.ReactNode;
    status?: 'live' | 'development' | 'concept';
    aiModel?: string;
}

const projects: Project[] = [
    {
        id: 'ran-sales-copilot',
        title: 'RAN AI Sales Co-Pilot',
        category: 'B2B Enterprise SaaS',
        description: 'Complete Sovereign Sales Intelligence Layer. Captures WebRTC Audio Live, parses objections using Whisper, classifies deal probabilities, and pushes Drafts to Gmail and Contacts to HubSpot autonomously.',
        tech: ['Next.js', 'WebRTC', 'OpenAI Whisper', 'HubSpot API', 'Google APIs', 'Supabase'],
        link: 'https://github.com/Yacinewhatchandcode/ran-sales-copilot',
        demoUrl: 'https://ran-sales-copilot.vercel.app',
        color: 'from-amber-500/20 to-orange-500/5',
        icon: <Bot size={24} className="text-amber-400" />,
        status: 'live',
        aiModel: 'Whisper + NLP Vector'
    },
    {
        id: 'sovereign-ecosystem',
        title: 'Sovereign Ecosystem',
        category: 'Multi-Agent Framework',
        description: 'The complete Sovereign Ecosystem codebase including aSiReM agents, dashboard, and infrastructure. Full autonomous multi-agent system for enterprise automation and orchestration.',
        tech: ['Python', 'Multi-Agent', 'Docker', 'Infrastructure'],
        link: 'https://github.com/Yacinewhatchandcode/Sovereign-Ecosystem',
        demoUrl: 'https://prime-ai.fr',
        color: 'from-violet-500/20 to-purple-500/5',
        icon: <Cpu size={24} className="text-violet-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet 3.7',
        image: '/repo-Sovereign-Ecosystem.png'
    },
    {
        id: 'prime-ai',
        title: 'Prime.AI Orchestrator',
        category: 'Root Intelligence',
        description: 'Main multi-agent orchestration system tracking 30+ classes of AI Models on local hardware & Vast.ai H200s. Exists as the command matrix driving computer-use and voice instances.',
        tech: ['Python', 'Docker', 'Ollama', 'LangChain'],
        link: 'https://github.com/Yacinewhatchandcode/Prime.AI',
        videoFile: '/videos/whatsapp-demo.mp4',
        color: 'from-emerald-500/20 to-teal-500/5',
        icon: <Cpu size={24} className="text-emerald-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet 3.7',
        image: '/repo-Prime.AI.png'
    },
    {
        id: 'yace19ai',
        title: 'Yace19ai.com',
        category: 'Portfolio Website',
        description: 'Professional portfolio showcasing AI Builder expertise with ASIREM multi-agent ecosystem. Features 3D neural meshwork, interactive project showcase, and modern web design.',
        tech: ['TypeScript', 'React', 'Three.js', 'Tailwind CSS'],
        link: 'https://github.com/Yacinewhatchandcode/Yace19ai.com',
        color: 'from-cyan-500/20 to-blue-500/5',
        icon: <Layout size={24} className="text-cyan-400" />,
        status: 'live',
        aiModel: 'Google AI Studio',
        image: '/repo-Yace19ai.com.png'
    },
    {
        id: 'mcp-registry',
        title: 'MCP Registry',
        category: 'Infrastructure',
        description: 'Official Docker MCP (Model Context Protocol) registry for managing and distributing AI model contexts across distributed offline systems.',
        tech: ['Go', 'Docker', 'Registry', 'Infrastructure'],
        link: 'https://github.com/Yacinewhatchandcode/mcp-registry',
        videoFile: '/videos/sovereign-factory.mp4',
        color: 'from-orange-500/20 to-red-500/5',
        icon: <Database size={24} className="text-orange-400" />,
        status: 'live',
        aiModel: 'Multi-Model Support',
        image: '/repo-mcp-registry.png'
    },
    {
        id: 'faith-video',
        title: 'Faith VideoGenerator',
        category: 'AI Video Creation',
        description: 'AI-powered video generation system with scene creation and automated editing. Integrates with SiliconFlow API for intelligent video content production.',
        tech: ['TypeScript', 'React', 'AI APIs', 'FFmpeg'],
        link: 'https://github.com/Yacinewhatchandcode/Faith',
        videoFile: '/videos/faith-demo.mp4',
        color: 'from-pink-500/20 to-rose-500/5',
        icon: <Layout size={24} className="text-pink-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet 3.5',
        image: '/repo-Faith.png'
    },
    {
        id: 'aia-creative-lab',
        title: 'AIA Creative Lab',
        category: 'Creative AI Platform',
        description: 'Vision 2030 - Creative AI laboratory for innovative digital experiences and AI-powered content generation.',
        tech: ['TypeScript', 'React', 'AI Integration', 'Creative Tools'],
        link: 'https://github.com/Yacinewhatchandcode/AIA-Creative-Lab',
        videoFile: '/videos/aia-creative-lab.mp4',
        color: 'from-indigo-500/20 to-purple-500/5',
        icon: <Layout size={24} className="text-indigo-400" />,
        status: 'live',
        aiModel: 'GPT-4',
        image: '/repo-AIA-Creative-Lab.png'
    },
    {
        id: 'hyperswitch-cloud',
        title: 'Hyperswitch Cloud',
        category: 'Payment Infrastructure',
        description: 'Hyperswitch payment system deployed on Railway cloud with multi-provider support, secure transaction handling, and unified payment gateway.',
        tech: ['Python', 'Railway', 'Payment APIs', 'Cloud'],
        link: 'https://github.com/Yacinewhatchandcode/hyperswitch-cloud',
        videoFile: '/videos/sovereign-factory.mp4',
        color: 'from-yellow-500/20 to-amber-500/5',
        icon: <Code2 size={24} className="text-yellow-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet 3.5',
        image: '/repo-hyperswitch-cloud.png'
    },
    {
        id: 'hyperswitch-railway',
        title: 'Hyperswitch Railway',
        category: 'Payment Infrastructure',
        description: 'Hyperswitch payment system - clean Railway deployment with optimized cloud infrastructure and seamless integration.',
        tech: ['Python', 'Railway', 'Payment Gateway', 'Cloud Deploy'],
        link: 'https://github.com/Yacinewhatchandcode/hyperswitch-railway',
        color: 'from-teal-500/20 to-emerald-500/5',
        icon: <Database size={24} className="text-teal-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet 3.5',
        image: '/repo-hyperswitch-railway.png'
    },
    {
        id: 'converse-final',
        title: 'Converse Final Solution',
        category: 'Conversational AI',
        description: 'Advanced conversational AI system with intelligent dialogue management and multi-turn conversation capabilities.',
        tech: ['TypeScript', 'AI Agents', 'NLP', 'Conversation'],
        link: 'https://github.com/Yacinewhatchandcode/converse-final-solution',
        videoFile: '/videos/converse-promo.mp4',
        color: 'from-teal-500/20 to-green-500/5',
        icon: <Bot size={24} className="text-blue-400" />,
        status: 'live',
        aiModel: 'GPT-4',
        image: '/repo-converse-final-solution.png'
    },
    {
        id: 'lovable-spirit-forge',
        title: 'Lovable Spirit Forge',
        category: 'Creative Development',
        description: 'Spirit forge project for creative AI applications and experimental digital experiences.',
        tech: ['TypeScript', 'React', 'Creative Tools', 'AI'],
        link: 'https://github.com/Yacinewhatchandcode/lovable-spirit-forge',
        color: 'from-pink-500/20 to-fuchsia-500/5',
        icon: <Layout size={24} className="text-pink-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet',
        image: '/repo-lovable-spirit-forge.png'
    },
    {
        id: 'bsq',
        title: 'BSQ - Autonomous Multi-Agent',
        category: 'Spiritual AI System',
        description: 'Bahá\'í Spiritual Quest - Autonomous Multi-Agent System for spiritual guidance and knowledge exploration with intelligent conversation flows.',
        tech: ['Python', 'Multi-Agent', 'NLP', 'Knowledge Base'],
        link: 'https://github.com/Yacinewhatchandcode/BSQ-Autonomous-Multi-Agent',
        color: 'from-amber-500/20 to-yellow-500/5',
        icon: <Bot size={24} className="text-amber-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet 3.7',
        image: '/repo-BSQ-Autonomous-Multi-Agent.png'
    },
    {
        id: 'sq-baha',
        title: 'SQ BAHA',
        category: 'Spiritual AI System',
        description: 'Spiritual Quest system complementing BSQ with enhanced spiritual knowledge exploration and guidance capabilities.',
        tech: ['Python', 'AI Agents', 'Knowledge Graph', 'NLP'],
        link: 'https://github.com/Yacinewhatchandcode/SQ-BAHA',
        color: 'from-orange-500/20 to-red-500/5',
        icon: <Cpu size={24} className="text-orange-400" />,
        status: 'live',
        aiModel: 'GPT-4',
        image: '/repo-SQ-BAHA.png'
    },
    {
        id: 'agent-coder-ybe',
        title: 'AgentCoderYBE',
        category: 'AI Code Generation',
        description: 'Autonomous agent-based code generation system for intelligent software development and automated programming tasks.',
        tech: ['Python', 'Code Generation', 'AI Agents', 'Automation'],
        link: 'https://github.com/Yacinewhatchandcode/AgentCoderYBE',
        videoFile: '/videos/agent-coder.mp4',
        color: 'from-green-500/20 to-emerald-500/5',
        icon: <Code2 size={24} className="text-emerald-400" />,
        status: 'live',
        aiModel: 'GPT-4 + Claude',
        image: '/repo-AgentCoderYBE.png'
    },
    {
        id: 'aia-discovery',
        title: 'AIA Discovery',
        category: 'Research Platform',
        description: 'AIA lab discovery platform for AI research and experimental development.',
        tech: ['TypeScript', 'Research Tools', 'AI Integration'],
        link: 'https://github.com/Yacinewhatchandcode/AIA-Discovery',
        color: 'from-blue-500/20 to-cyan-500/5',
        icon: <Database size={24} className="text-blue-400" />,
        status: 'live',
        aiModel: 'Multi-Model',
        image: '/repo-AIA-Discovery.png'
    }
];

const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/20 flex flex-col h-full items-stretch ${isPlaying ? 'md:col-span-2 lg:col-span-2 row-span-2 z-10 scale-[1.02]' : ''}`}
        >
            {/* Header / Graphic / Video Demo */}
            <div className={`transition-all duration-500 bg-gray-900 relative overflow-hidden flex flex-col justify-center items-center shrink-0 ${isPlaying ? 'h-96 md:h-[500px]' : 'h-48 group-hover:h-56'}`}>

                {isPlaying ? (
                    <div className="absolute inset-0 w-full h-full bg-black">
                        {project.videoFile ? (
                            <video
                                src={project.videoFile}
                                autoPlay
                                controls
                                className="w-full h-full object-contain"
                            />
                        ) : project.demoUrl ? (
                            <iframe
                                src={project.demoUrl}
                                className="w-full h-full border-none bg-white"
                                title={`${project.title} Live Demo`}
                            />
                        ) : null}
                    </div>
                ) : (
                    <>
                        {project.image ? (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                    onError={(e) => {
                                        // Fallback if image doesn't exist
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                                {/* Abstract decorative lines representing scanning */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,1)] opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_ease-in-out_infinite] z-20 pointer-events-none" />
                            </>
                        ) : (
                            <div className={`absolute inset-0 bg-gradient-to-br ${project.color}`} />
                        )}

                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10 z-20">
                            {project.icon}
                        </div>

                        <div className="absolute bottom-4 left-6 flex gap-2 z-20">
                            {project.aiModel && (
                                <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-300 bg-cyan-900/40 px-2 py-1 rounded backdrop-blur-md border border-cyan-500/30">
                                    {project.aiModel}
                                </span>
                            )}
                            <span className="text-[10px] font-bold tracking-wider uppercase text-white bg-black/40 px-2 py-1 rounded backdrop-blur-md border border-white/10 backdrop-saturate-150">
                                {project.category}
                            </span>
                        </div>

                        {(project.videoFile || project.demoUrl) && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                                <button
                                    onClick={() => setIsPlaying(true)}
                                    className={`flex items-center gap-3 border backdrop-blur-md px-6 py-3 rounded-full text-white font-bold transition-all hover:-translate-y-1 ${project.videoFile ? 'bg-gradient-to-r from-red-600 to-red-800 border-red-400/50 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]' : 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'}`}
                                >
                                    <PlayCircle size={24} className="animate-pulse" />
                                    {project.videoFile ? "Watch Visual Demo" : "Open Live Interface"}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {isPlaying && (
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 border border-white/20 text-white p-2 rounded-full backdrop-blur-md z-30 shadow-2xl transition-all"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex-grow flex flex-col bg-gray-900/40 relative z-20">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {project.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                    {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((t) => (
                        <span key={t} className="text-xs font-medium px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/5">
                            {t}
                        </span>
                    ))}
                </div>

                {/* Action Footer */}
                <div className="mt-auto">
                    {project.link ? (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: '0.75rem' }}
                            className={`w-full flex items-center justify-center gap-2 text-white rounded-lg border font-bold transition-all shadow-lg text-sm
                                ${project.videoFile
                                    ? 'bg-gradient-to-r from-red-600 to-red-800 border-red-500 shadow-red-900/40 hover:border-red-400'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-800 border-blue-500 shadow-blue-900/40 hover:border-blue-400'}`}
                        >
                            <Github size={18} /> {project.videoFile ? 'Access Full Github & Video' : 'Review Complete Github Repo'}
                        </a>
                    ) : (
                        <span style={{ padding: '0.75rem' }} className="w-full flex items-center justify-center gap-2 bg-gray-800 text-gray-400 rounded-lg border border-gray-700 font-bold text-sm">
                            <Github size={18} /> Private Enterprise Repo
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default function ProjectPortfolio() {
    return (
        <div className="w-full max-w-7xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8 px-2 md:px-0">
                <div className="flex items-center gap-3">
                    <Layout className="text-cyan-500" size={24} />
                    <h2 className="text-2xl font-bold text-white tracking-tight">Agent Deployments & Architectures</h2>
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Visualization Active
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-min">
                {projects.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} />
                ))}
            </div>
        </div>
    );
}
