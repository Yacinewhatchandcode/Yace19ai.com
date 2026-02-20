import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, ArrowRight, Code2, Database, Layout, Cpu, Bot, PlayCircle, X } from 'lucide-react';

interface Project {
    id: string;
    title: string;
    category: string;
    description: string;
    tech: string[];
    link?: string;
    demoUrl?: string; // If an iframe or site is available
    videoFile?: string; // If a recorded mp4 demo is available
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
        demoUrl: 'https://ran-sales-copilot.vercel.app', // Highly visual iframe component
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
        aiModel: 'Claude Sonnet 3.7'
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
        aiModel: 'Llama-3 (Sovereign)'
    },
    {
        id: 'faith-video',
        title: 'Faith VideoGenerator',
        category: 'AI Video Creation',
        description: 'AI-powered video generation system with scene creation and automated editing. Orchestrates the visual matrix using local rendering pipes and GPU scaling.',
        tech: ['TypeScript', 'React', 'AI APIs', 'FFmpeg'],
        link: 'https://github.com/Yacinewhatchandcode/Faith',
        videoFile: '/videos/faith-demo.mp4',
        color: 'from-pink-500/20 to-rose-500/5',
        icon: <Layout size={24} className="text-pink-400" />,
        status: 'live',
        aiModel: 'SiliconFlow API'
    },
    {
        id: 'mcp-registry',
        title: 'MCP Registry',
        category: 'Infrastructure',
        description: 'Official Docker MCP (Model Context Protocol) registry for managing and distributing AI model contexts across distributed offline systems.',
        tech: ['Go', 'Docker', 'Registry', 'Infrastructure'],
        link: 'https://github.com/Yacinewhatchandcode/mcp-registry',
        color: 'from-orange-500/20 to-red-500/5',
        icon: <Database size={24} className="text-orange-400" />,
        status: 'live',
        aiModel: 'Multi-Model Support'
    },
    {
        id: 'aia-creative-lab',
        title: 'AIA Creative Lab',
        category: 'Creative AI Platform',
        description: 'Vision 2030 - Creative AI laboratory for innovative digital experiences and AI-powered cinematic generation.',
        tech: ['TypeScript', 'React', 'AI Integration', 'Creative Tools'],
        link: 'https://github.com/Yacinewhatchandcode/AIA-Creative-Lab',
        color: 'from-indigo-500/20 to-purple-500/5',
        icon: <Layout size={24} className="text-indigo-400" />,
        status: 'live',
        aiModel: 'GPT-4'
    },
    {
        id: 'hyperswitch-cloud',
        title: 'Hyperswitch Cloud',
        category: 'Payment Infrastructure',
        description: 'Hyperswitch payment system deployed on Railway cloud with multi-provider support, secure transaction handling, and unified payment gateway.',
        tech: ['Python', 'Railway', 'Payment APIs', 'Cloud'],
        link: 'https://github.com/Yacinewhatchandcode/hyperswitch-cloud',
        color: 'from-yellow-500/20 to-amber-500/5',
        icon: <Code2 size={24} className="text-yellow-400" />,
        status: 'live',
        aiModel: 'Architecture'
    },
    {
        id: 'converse-final',
        title: 'Converse Final Matrix',
        category: 'Conversational AI',
        description: 'Advanced conversational AI system with intelligent dialogue management, state tracking, and memory retention across large multi-turn sequences.',
        tech: ['TypeScript', 'AI Agents', 'NLP', 'Conversation'],
        link: 'https://github.com/Yacinewhatchandcode/converse-final-solution',
        color: 'from-teal-500/20 to-green-500/5',
        icon: <Bot size={24} className="text-teal-400" />,
        status: 'live',
        aiModel: 'GPT-4'
    },
    {
        id: 'agent-coder-ybe',
        title: 'AgentCoderYBE',
        category: 'Autonomous Programming',
        description: 'Autonomous agent-based code generation system. Programs entire frontend apps from text intent and self-corrects based on compiler errors in real-time.',
        tech: ['Python', 'Code Generation', 'AI Agents', 'Automation'],
        link: 'https://github.com/Yacinewhatchandcode/AgentCoderYBE',
        color: 'from-green-500/20 to-emerald-500/5',
        icon: <Code2 size={24} className="text-green-400" />,
        status: 'live',
        aiModel: 'Claude Engineer'
    }
];

const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10 flex flex-col h-full ${isPlaying ? 'md:col-span-2 lg:col-span-2 row-span-2 z-10 scale-105' : ''}`}
        >
            {/* Header / Graphic / Video Demo */}
            <div className={`transition-all duration-500 bg-gradient-to-br ${project.color} relative overflow-hidden flex flex-col justify-center items-center ${isPlaying ? 'h-80 md:h-96' : 'h-32 p-6'}`}>

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
                                className="w-full h-full border-none"
                                title={`${project.title} Live Demo`}
                            />
                        ) : null}
                    </div>
                ) : (
                    <>
                        <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md p-2 rounded-lg border border-white/5 z-10">
                            {project.icon}
                        </div>
                        <div className="absolute bottom-4 left-6 flex gap-2 z-10">
                            <span className="text-xs font-bold tracking-wider uppercase text-white/60 bg-black/20 px-2 py-1 rounded backdrop-blur-md">
                                {project.category}
                            </span>
                            {project.status && (
                                <span className={`text-xs font-bold tracking-wider uppercase px-2 py-1 rounded backdrop-blur-md ${project.status === 'live' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                    project.status === 'development' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    }`}>
                                    {project.status === 'live' ? '● Live' : project.status === 'development' ? '◐ In Dev' : '○ Concept'}
                                </span>
                            )}
                        </div>

                        {/* Abstract decorative circles */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                        <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />

                        {(project.videoFile || project.demoUrl) && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button
                                    onClick={() => setIsPlaying(true)}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-semibold transition-all shadow-lg hover:scale-105"
                                >
                                    <PlayCircle size={20} /> Watch Agent Demo
                                </button>
                            </div>
                        )}
                    </>
                )}

                {isPlaying && (
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md z-30 shadow-2xl transition-all"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex-grow flex flex-col bg-gray-900/40">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {project.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                    {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((t) => (
                        <span key={t} className="text-xs font-medium px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/5">
                            {t}
                        </span>
                    ))}
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                    {project.link ? (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-cyan-400 transition-colors group/btn"
                        >
                            View Source Code
                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                    ) : (
                        <span className="text-sm font-medium text-gray-500">Private Repository</span>
                    )}
                    <div className="flex gap-2 text-gray-500">
                        {project.link && (
                            <>
                                <a href={project.link} target="_blank" rel="noopener noreferrer" aria-label="View on GitHub">
                                    <Github size={18} className="hover:text-white cursor-pointer transition-colors" />
                                </a>
                                {(project.demoUrl) && (
                                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" aria-label="Open App in Full tab">
                                        <ExternalLink size={18} className="hover:text-white cursor-pointer transition-colors" />
                                    </a>
                                )}
                            </>
                        )}
                    </div>
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
