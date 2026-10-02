import React from 'react';
import Card3D from './Card3D';
import GoldVisual from './GoldVisual';
import { Github, Code2, Database, Layout, Cpu, Bot } from 'lucide-react';
import type { Locale } from '../App';

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
        id: 'eu-ai-act',
        title: 'EU AI Act Compliance',
        category: 'Regulatory AI Platform',
        description: 'Full-Stack EU AI Act Compliance System — AI Risk Classification, Audit Engine, Knowledge Base, and Bot Integration. Built for enterprise regulatory compliance.',
        tech: ['Python', 'Flask', 'PWA', 'OpenAI', 'EU AI Act'],
        link: 'https://github.com/Yacinewhatchandcode/EU-AI-Act-Compliance',
        color: 'from-indigo-600/20 to-violet-500/5',
        icon: <Cpu size={24} className="text-indigo-400" />,
        status: 'live',
        aiModel: 'GPT-4 + Custom NLP'
    },
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
        videoFile: '/video-Sovereign-Ecosystem.webm',
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
        color: 'from-emerald-500/20 to-teal-500/5',
        icon: <Cpu size={24} className="text-emerald-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet 3.7',
        image: '/repo-Prime.AI.png'
    },
    {
        id: 'yace19ai',
        title: 'Yace19ai.com',
        category: 'Sovereign OS',
        description: 'Sovereign OS Hub showcasing AI Builder expertise with ASIREM multi-agent ecosystem. Features 3D neural meshwork, active swarm nodes, and modern web architecture.',
        tech: ['TypeScript', 'React', 'Three.js', 'Tailwind CSS'],
        link: 'https://github.com/Yacinewhatchandcode/Yace19ai.com',
        videoFile: '/video-Yace19ai.com.webm',
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
        videoFile: '/video-Faith.webm',
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
        videoFile: '/video-AIA-Creative-Lab.webm',
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
        videoFile: '/video-BSQ.webm',
        color: 'from-amber-500/20 to-yellow-500/5',
        icon: <Bot size={24} className="text-amber-400" />,
        status: 'live',
        aiModel: 'Claude Sonnet 3.7',
        image: '/repo-BSQ.png'
    },
    {
        id: 'sq-baha',
        title: 'SQ BAHA',
        category: 'Spiritual AI System',
        description: 'Spiritual Quest system complementing BSQ with enhanced spiritual knowledge exploration and guidance capabilities.',
        tech: ['Python', 'AI Agents', 'Knowledge Graph', 'NLP'],
        link: 'https://github.com/Yacinewhatchandcode/SQ-BAHA',
        videoFile: '/video-SQ_BAHA.webm',
        color: 'from-orange-500/20 to-red-500/5',
        icon: <Cpu size={24} className="text-orange-400" />,
        status: 'live',
        aiModel: 'GPT-4',
        image: '/repo-SQ_BAHA.png'
    },
    {
        id: 'agent-coder-ybe',
        title: 'AgentCoderYBE',
        category: 'AI Code Generation',
        description: 'Autonomous agent-based code generation system for intelligent software development and automated programming tasks.',
        tech: ['Python', 'Code Generation', 'AI Agents', 'Automation'],
        link: 'https://github.com/Yacinewhatchandcode/AgentCoderYBE',
        videoFile: '/video-AgentCoderYBE.webm',
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
        image: '/repo-https-github.com-Yacinewhatchandcode-AIA-DiscoVery.png'
    },
    {
        id: 'agent-y',
        title: 'AgentY',
        category: 'Autonomous AI Agent',
        description: 'Autonomous AI Coding Agent with Semantic Memory — multi-model routing, intelligent code generation, and autonomous task execution across any language.',
        tech: ['Python', 'LangChain', 'ChromaDB', 'OpenAI'],
        link: 'https://github.com/Yacinewhatchandcode/AgentY',
        color: 'from-purple-600/20 to-fuchsia-500/5',
        icon: <Bot size={24} className="text-purple-400" />,
        status: 'live',
        aiModel: 'Multi-Model Router'
    },
    {
        id: 'voice-cloning',
        title: 'VoiceCloning',
        category: 'Voice AI Pipeline',
        description: 'Real-Time TTS & Voice Cloning Pipeline with F5-TTS, PyTorch, and Gradio. Full end-to-end voice agent capabilities.',
        tech: ['Python', 'F5-TTS', 'PyTorch', 'Gradio'],
        link: 'https://github.com/Yacinewhatchandcode/VoiceCloning',
        color: 'from-rose-500/20 to-red-500/5',
        icon: <Cpu size={24} className="text-rose-400" />,
        status: 'live',
        aiModel: 'F5-TTS + VoxCPM'
    },
    {
        id: 'calendly-connect',
        title: 'Calendly Connect',
        category: 'MCP Integration',
        description: 'Model Context Protocol server that enables AI agents to autonomously manage Calendly scheduling and appointments.',
        tech: ['TypeScript', 'MCP', 'Calendly API', 'Node.js'],
        link: 'https://github.com/Yacinewhatchandcode/calendly-connect',
        color: 'from-sky-500/20 to-blue-500/5',
        icon: <Code2 size={24} className="text-sky-400" />,
        status: 'live',
        aiModel: 'MCP Protocol'
    },
    {
        id: 'networking',
        title: 'NETWORKING',
        category: 'Cyber Security',
        description: 'Cyber Radar & Security Dashboard — network visualization, multi-agent security monitoring, and web security assessment tools.',
        tech: ['JavaScript', 'Canvas API', 'WebSocket'],
        link: 'https://github.com/Yacinewhatchandcode/NETWORKING',
        color: 'from-green-600/20 to-emerald-500/5',
        icon: <Database size={24} className="text-green-400" />,
        status: 'live',
        aiModel: 'Custom Detection'
    },
    {
        id: 'antigravity-game',
        title: 'Antigravity Game',
        category: '3D Browser Game',
        description: '3D Space Explorer with JEPA AI Agent — gravity-flip mechanics, Three.js rendering, runs entirely in the browser.',
        tech: ['JavaScript', 'Three.js', 'WebGL', 'JEPA'],
        link: 'https://github.com/Yacinewhatchandcode/antigravity-game',
        demoUrl: 'https://antigravity-game.vercel.app',
        color: 'from-teal-500/20 to-cyan-500/5',
        icon: <Layout size={24} className="text-teal-400" />,
        status: 'live',
        aiModel: 'JEPA Agent'
    }
];

export default function ProjectPortfolio({ locale = 'en' }: { locale?: Locale }) {
    const fr = locale === 'fr';
    return <section className="intro">
        <p>{fr ? `${projects.length} archives. Descriptions anglaises non vérifiées. Aucun paiement.` : `${projects.length} archives. Unverified English descriptions. No payments.`}</p>
        <div className="info-grid">
            {projects.map(project => <Card3D key={project.id}>
                {project.videoFile ? <video controls playsInline preload="none" width="800" height="450" poster={project.image} aria-label={project.title}>
                    <source src={project.videoFile} />
                </video> : project.image ? <img src={project.image} alt={project.title} width="800" height="450" loading="lazy" /> : <GoldVisual />}
                <h2 lang="en" title={project.title}>{project.title.split(' ').slice(0, 4).join(' ')}</h2>
                <p>{fr ? "Archive illustrative · Source externe" : "Illustrative archive · External source"}</p>
                <details lang="en"><summary>{fr ? "Description (EN)" : "Description (EN)"}</summary><p>{project.description}</p><p>{project.tech.join(' · ')}</p></details>
                <div className="actions">
                    {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer"><Github size={16} aria-hidden="true" /> {fr ? "Source" : "Source"}</a>}
                    {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">{fr ? "Externe, non vérifié" : "External, unverified"}</a>}
                </div>
            </Card3D>)}
        </div>
    </section>;
}
