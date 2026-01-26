import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, ArrowRight, Code2, Database, Layout, Globe, Cpu, Bot } from 'lucide-react';



interface Project {
    id: string;
    title: string;
    category: string;
    description: string;
    tech: string[];
    link?: string;
    color: string;
    icon: React.ReactNode;
    status?: 'live' | 'development' | 'concept';
    aiModel?: string;
}

const projects: Project[] = [
    {
        id: 'sovereign-ecosystem',
        title: 'Sovereign Ecosystem',
        category: 'Multi-Agent Framework',
        description: 'The complete Sovereign Ecosystem codebase including aSiReM agents, dashboard, and infrastructure. Full autonomous multi-agent system for enterprise automation and orchestration.',
        tech: ['Python', 'Multi-Agent', 'Docker', 'Infrastructure'],
        link: 'https://github.com/Yacinewhatchandcode/Sovereign-Ecosystem',
        color: 'from-violet-500/20 to-purple-500/5',
        icon: <Cpu size={24} className="text-violet-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet 3.7'
    },
    {
        id: 'prime-ai',
        title: 'Prime.AI',
        category: 'Multi-Agent Framework',
        description: 'Main multi-agent orchestration system with specialized agents for architecture, QA, backend, and deployment automation. Built with Docker and Ollama for autonomous task execution.',
        tech: ['Python', 'Docker', 'Ollama', 'LangChain'],
        link: 'https://github.com/Yacinewhatchandcode/Prime.AI',
        color: 'from-emerald-500/20 to-teal-500/5',
        icon: <Cpu size={24} className="text-emerald-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet 3.7'
    },
    {
        id: 'yace19ai-portfolio',
        title: 'Yace19ai.com',
        category: 'Portfolio Website',
        description: 'Professional portfolio showcasing AI Builder expertise with ASIREM multi-agent ecosystem. Features 3D neural meshwork, interactive project showcase, and modern web design.',
        tech: ['TypeScript', 'React', 'Three.js', 'Tailwind CSS'],
        link: 'https://github.com/Yacinewhatchandcode/Yace19ai.com',
        color: 'from-cyan-500/20 to-blue-500/5',
        icon: <Globe size={24} className="text-cyan-400" />,
        status: 'live',
        aiModel: 'Google AI Studio'
    },
    {
        id: 'mcp-registry',
        title: 'MCP Registry',
        category: 'Infrastructure',
        description: 'Official Docker MCP (Model Context Protocol) registry for managing and distributing AI model contexts across distributed systems.',
        tech: ['Go', 'Docker', 'Registry', 'Infrastructure'],
        link: 'https://github.com/Yacinewhatchandcode/mcp-registry',
        color: 'from-orange-500/20 to-red-500/5',
        icon: <Database size={24} className="text-orange-400" />,
        status: 'live',
        aiModel: 'Multi-Model Support'
    },
    {
        id: 'faith-video',
        title: 'Faith VideoGenerator',
        category: 'AI Video Creation',
        description: 'AI-powered video generation system with scene creation and automated editing. Integrates with SiliconFlow API for intelligent video content production.',
        tech: ['TypeScript', 'React', 'AI APIs', 'FFmpeg'],
        link: 'https://github.com/Yacinewhatchandcode/Faith',
        color: 'from-pink-500/20 to-rose-500/5',
        icon: <Layout size={24} className="text-pink-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet 3.5'
    },
    {
        id: 'aia-creative-lab',
        title: 'AIA Creative Lab',
        category: 'Creative AI Platform',
        description: 'Vision 2030 - Creative AI laboratory for innovative digital experiences and AI-powered content generation.',
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
        aiModel: 'Claude Sonnet 3.5'
    },
    {
        id: 'hyperswitch-railway',
        title: 'Hyperswitch Railway',
        category: 'Payment Infrastructure',
        description: 'Hyperswitch payment system - clean Railway deployment with optimized cloud infrastructure and seamless integration.',
        tech: ['Python', 'Railway', 'Payment Gateway', 'Cloud Deploy'],
        link: 'https://github.com/Yacinewhatchandcode/hyperswitch-railway',
        color: 'from-amber-500/20 to-yellow-500/5',
        icon: <Database size={24} className="text-amber-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet 3.5'
    },
    {
        id: 'converse-final',
        title: 'Converse Final Solution',
        category: 'Conversational AI',
        description: 'Advanced conversational AI system with intelligent dialogue management and multi-turn conversation capabilities.',
        tech: ['TypeScript', 'AI Agents', 'NLP', 'Conversation'],
        link: 'https://github.com/Yacinewhatchandcode/converse-final-solution',
        color: 'from-teal-500/20 to-green-500/5',
        icon: <Bot size={24} className="text-teal-400" />,
        status: 'live',
        aiModel: 'GPT-4'
    },
    {
        id: 'lovable-spirit-forge',
        title: 'Lovable Spirit Forge',
        category: 'Creative Development',
        description: 'Spirit forge project for creative AI applications and experimental digital experiences.',
        tech: ['TypeScript', 'React', 'Creative Tools', 'AI'],
        link: 'https://github.com/Yacinewhatchandcode/lovable-spirit-forge',
        color: 'from-rose-500/20 to-pink-500/5',
        icon: <Layout size={24} className="text-rose-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet'
    },
    {
        id: 'bsq',
        title: 'BSQ - Autonomous Multi-Agent',
        category: 'Spiritual AI System',
        description: "Bahá'í Spiritual Quest - Autonomous Multi-Agent System for spiritual guidance and knowledge exploration with intelligent conversation flows.",
        tech: ['Python', 'Multi-Agent', 'NLP', 'Knowledge Base'],
        link: 'https://github.com/Yacinewhatchandcode/BSQ',
        color: 'from-blue-500/20 to-cyan-500/5',
        icon: <Bot size={24} className="text-blue-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet 3.7'
    },
    {
        id: 'sq-baha',
        title: 'SQ BAHA',
        category: 'Spiritual AI System',
        description: 'Spiritual Quest system complementing BSQ with enhanced spiritual knowledge exploration and guidance capabilities.',
        tech: ['Python', 'AI Agents', 'Knowledge Graph', 'NLP'],
        link: 'https://github.com/Yacinewhatchandcode/SQ_BAHA',
        color: 'from-sky-500/20 to-blue-500/5',
        icon: <Bot size={24} className="text-sky-400" />,
        status: 'live',
        aiModel: 'GPT-4'
    },
    {
        id: 'agent-coder-ybe',
        title: 'AgentCoderYBE',
        category: 'AI Code Generation',
        description: 'Autonomous agent-based code generation system for intelligent software development and automated programming tasks.',
        tech: ['Python', 'Code Generation', 'AI Agents', 'Automation'],
        link: 'https://github.com/Yacinewhatchandcode/AgentCoderYBE',
        color: 'from-green-500/20 to-emerald-500/5',
        icon: <Code2 size={24} className="text-green-400" />,
        status: 'live',
        aiModel: 'GPT-4 + Claude'
    },
    {
        id: 'aia-discovery-mirror',
        title: 'AIA Discovery',
        category: 'Research Platform',
        description: 'AIA lab discovery platform for AI research and experimental development.',
        tech: ['TypeScript', 'Research Tools', 'AI Integration'],
        link: 'https://github.com/Yacinewhatchandcode/https-github.com-Yacinewhatchandcode-AIA-DiscoVery',
        color: 'from-fuchsia-500/20 to-purple-500/5',
        icon: <Globe size={24} className="text-fuchsia-400" />,
        status: 'live',
        aiModel: 'Multi-Model'
    }
];

const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10 flex flex-col h-full"
        >
            {/* Header / Graphic */}
            <div className={`h-32 bg-gradient-to-br ${project.color} p-6 relative overflow-hidden`}>
                <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md p-2 rounded-lg border border-white/5">
                    {project.icon}
                </div>
                <div className="absolute bottom-4 left-6 flex gap-2">
                    <span className="text-xs font-bold tracking-wider uppercase text-white/60 bg-black/20 px-2 py-1 rounded backdrop-blur-md">
                        {project.category}
                    </span>
                    {project.status && (
                        <span className={`text-xs font-bold tracking-wider uppercase px-2 py-1 rounded backdrop-blur-md ${
                            project.status === 'live' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
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
            </div>

            {/* Content */}
            <div className="p-6 flex-grow flex flex-col">
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

                {/* AI Model Badge */}
                {project.aiModel && (
                    <div className="mb-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                            <span className="text-xs font-semibold text-purple-300">Powered by {project.aiModel}</span>
                        </div>
                    </div>
                )}

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                    {project.link ? (
                        <a 
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-cyan-400 transition-colors group/btn"
                        >
                            View on GitHub
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
                                <a href={project.link} target="_blank" rel="noopener noreferrer" aria-label="Open in new tab">
                                    <ExternalLink size={18} className="hover:text-white cursor-pointer transition-colors" />
                                </a>
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
                    <h2 className="text-2xl font-bold text-white tracking-tight">Featured Work</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {projects.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} />
                ))}
            </div>
        </div>
    );
}
