import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Database,
  Shield,
  Eye,
  Activity,
  Globe,
  Fingerprint,
  Mic,
  Video,
  Layers,
  Tv,
  Smartphone,
  MessageSquare,
  Music,
  Search,
  Terminal,
  ArrowRight,
  CheckCircle2,
  X,
  PlayCircle,
  HelpCircle,
  Network
} from 'lucide-react';

export interface MicroAgent {
  name: string;
  toolAgent: string;
  systemPrompt: string;
  mcpTool: string;
  model: string;
  location: string;
  status: 'active' | 'offline' | 'standby';
}

export interface MegaAgentData {
  id: string;
  category: string;
  megaAgent: string;
  primaryAgent: string;
  subAgent: string;
  hardwareNode: string;
  repo: string;
  scripts: string;
  diskScope: number;
  status: 'active' | 'offline' | 'standby';
  color: string;
  glowColor: string;
  iconName: string;
  microAgents: MicroAgent[];
}

const sovereignAgents: MegaAgentData[] = [
  {
    id: 'prime-orchestrator',
    category: 'Dev / Core',
    megaAgent: 'Prime Orchestrator',
    primaryAgent: 'ZeroClaw (:9999)',
    subAgent: 'Dispatch Router',
    hardwareNode: 'M4 Mac Nexus / Cloudflare Edge / GPU Tunnel',
    repo: 'prime-orchestrator',
    scripts: '~30,007',
    diskScope: 1630786,
    status: 'active',
    color: 'from-cyan-500/20 to-blue-500/5 hover:border-cyan-500/40',
    glowColor: 'rgba(6, 182, 212, 0.15)',
    iconName: 'Cpu',
    microAgents: [
      {
        name: 'Intent Classifier',
        toolAgent: 'ollama-router',
        systemPrompt: 'You are the Sovereign Orchestrator. Goal: Parse user intent to route specialized tasks.',
        mcpTool: 'prime-router-mcp',
        model: 'qwen2.5:7b / deepseek-r1',
        location: 'Local M4 / Ollama',
        status: 'active'
      },
      {
        name: 'Task Dispatcher',
        toolAgent: 'sovereign_dispatch',
        systemPrompt: 'You are the Task Dispatcher. Goal: Route sub-tasks to specialized swarm nodes.',
        mcpTool: 'prime-router-mcp',
        model: 'qwen2.5:7b',
        location: 'Cloudflare Workers',
        status: 'active'
      },
      {
        name: 'System Config Manager',
        toolAgent: 'sovereign_boot_state',
        systemPrompt: 'You are the Config Auditor. Goal: Monitor and maintain active service boot states.',
        mcpTool: 'prime-router-mcp',
        model: 'qwen2.5:7b',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Gateway Controller',
        toolAgent: 'zeroclaw_control',
        systemPrompt: 'You are the Gateway Guard. Goal: Control and hot-reload local ZeroClaw port:9999.',
        mcpTool: 'prime-router-mcp',
        model: 'deepseek-r1:7b',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Swarm Health Checker',
        toolAgent: 'fleet_health',
        systemPrompt: 'You are the Swarm Auditor. Goal: Maintain real-time health matrix of all fleet units.',
        mcpTool: 'sovereign-fleet-mcp',
        model: 'qwen2.5:7b',
        location: 'Local M4 / Ollama',
        status: 'active'
      }
    ]
  },
  {
    id: 'democompta-engine',
    category: 'Dev / Cloud',
    megaAgent: 'DemoCompta Engine',
    primaryAgent: 'Agent Zero',
    subAgent: 'Backend API Sync',
    hardwareNode: 'VPS 31.97.52.22 / Cloudflare Edge / local GPU',
    repo: 'DemoCompta',
    scripts: '663',
    diskScope: 6823,
    status: 'active',
    color: 'from-blue-500/20 to-indigo-500/5 hover:border-blue-500/40',
    glowColor: 'rgba(59, 130, 246, 0.15)',
    iconName: 'Database',
    microAgents: [
      {
        name: 'Database Synchronizer',
        toolAgent: 'vps_exec (psql)',
        systemPrompt: 'You are the Database Sync. Goal: Execute SQL migrations and ledger reconciliations.',
        mcpTool: 'sovereign-fleet-mcp',
        model: 'qwen3:8b',
        location: 'Local VPS / Ollama',
        status: 'active'
      },
      {
        name: 'Service Monitor',
        toolAgent: 'vps_service_control',
        systemPrompt: 'You are the Systemd Controller. Goal: Start/stop/restart VPS services securely.',
        mcpTool: 'sovereign-fleet-mcp',
        model: 'qwen3:8b',
        location: 'Local VPS',
        status: 'active'
      },
      {
        name: 'Docker Orchestrator',
        toolAgent: 'vps_docker_control',
        systemPrompt: 'You are the Docker Daemon. Goal: Orchestrate Kokoro, n8n, and web interface containers.',
        mcpTool: 'sovereign-fleet-mcp',
        model: 'qwen3:8b',
        location: 'Local VPS / Docker',
        status: 'active'
      },
      {
        name: 'Storage Monitor',
        toolAgent: 'vps_disk_status',
        systemPrompt: 'You are the Disk Sentry. Goal: Prevent 100% disk filling events by cleanups.',
        mcpTool: 'sovereign-fleet-mcp',
        model: 'qwen3:8b',
        location: 'Local VPS',
        status: 'active'
      },
      {
        name: 'API Health Ping',
        toolAgent: 'server-fetch',
        systemPrompt: 'You are the API Prober. Goal: Periodically fetch /health and report deviations.',
        mcpTool: 'server-fetch',
        model: 'qwen3:8b',
        location: 'Cloudflare Edge',
        status: 'active'
      }
    ]
  },
  {
    id: 'matrix-defense',
    category: 'Cyber / Security',
    megaAgent: 'Matrix Defense',
    primaryAgent: 'Network Mapper',
    subAgent: 'Matrix Halt',
    hardwareNode: 'TP-Link WLAN / Raspberry Pi',
    repo: 'matrix-defense',
    scripts: '—',
    diskScope: 0,
    status: 'offline',
    color: 'from-red-500/20 to-orange-500/5 hover:border-red-500/40',
    glowColor: 'rgba(239, 68, 68, 0.15)',
    iconName: 'Shield',
    microAgents: [
      {
        name: 'ARP Spoofer',
        toolAgent: 'run_command (arp-scan)',
        systemPrompt: 'You are the Network Sentry. Goal: Detect foreign devices and intercept rogue packets.',
        mcpTool: 'run_command',
        model: 'Llama-3-8B-Instruct',
        location: 'Local M4',
        status: 'offline'
      },
      {
        name: 'Port Scanner',
        toolAgent: 'run_command (nmap)',
        systemPrompt: 'You are the Port Scanner. Goal: Detect open services and identify network backdoors.',
        mcpTool: 'run_command',
        model: 'Llama-3-8B-Instruct',
        location: 'Raspberry Pi Local',
        status: 'offline'
      },
      {
        name: 'WLAN Administrator',
        toolAgent: 'server-playwright',
        systemPrompt: 'You are the WLAN Operator. Goal: Access router admin interface and change controls.',
        mcpTool: 'server-playwright',
        model: 'Llama-3-8B-Instruct',
        location: 'Local M4',
        status: 'offline'
      },
      {
        name: 'Intrusion Isolator',
        toolAgent: 'run_command (iptables)',
        systemPrompt: 'You are the Firewall Sentry. Goal: Inject drop rules to isolate compromised nodes.',
        mcpTool: 'run_command',
        model: 'Llama-3-8B-Instruct',
        location: 'Raspberry Pi Local',
        status: 'offline'
      },
      {
        name: 'Emergency Stop Trigger',
        toolAgent: 'run_command (kill-switch)',
        systemPrompt: 'You are the Stop Switch. Goal: Instantly drop the network connection if swarm breaches limit.',
        mcpTool: 'run_command',
        model: 'Llama-3-8B-Instruct',
        location: 'Local M4',
        status: 'offline'
      }
    ]
  },
  {
    id: 'visual-cameraman',
    category: 'Cyber / Quality',
    megaAgent: 'Visual Cameraman',
    primaryAgent: 'ByteBot RPA',
    subAgent: 'Vision OCR',
    hardwareNode: 'M4 Mac Nexus / GPU Tunnel (local)',
    repo: 'bytebot-agent',
    scripts: '555',
    diskScope: 1630786,
    status: 'active',
    color: 'from-violet-500/20 to-purple-500/5 hover:border-violet-500/40',
    glowColor: 'rgba(139, 92, 246, 0.15)',
    iconName: 'Eye',
    microAgents: [
      {
        name: 'Element Visual Searcher',
        toolAgent: 'visual_search',
        systemPrompt: 'You are the Element Spotter. Goal: Identify pixel coordinates of interactive components.',
        mcpTool: 'prime-browser-runtime',
        model: 'qwen-vl:latest',
        location: 'Local VPS / Docker',
        status: 'active'
      },
      {
        name: 'RPA Automation Engine',
        toolAgent: 'bytebot_execute',
        systemPrompt: 'You are the ByteBot Core. Goal: Execute cross-browser interactions on standard desktop.',
        mcpTool: 'sovereign-fleet-mcp',
        model: 'qwen-vl:latest',
        location: 'Local VPS / Docker',
        status: 'active'
      },
      {
        name: 'DOM Accessibility Snapshot',
        toolAgent: 'browser_snapshot',
        systemPrompt: 'You are the DOM Auditor. Goal: Capture raw accessibility trees to parse interactive buttons.',
        mcpTool: 'server-playwright',
        model: 'qwen-vl:latest',
        location: 'Local VPS / Docker',
        status: 'active'
      },
      {
        name: 'Page Screenshot Taker',
        toolAgent: 'browser_take_screenshot',
        systemPrompt: 'You are the Cameraman. Goal: Take full-page or viewport snapshots of UI layout.',
        mcpTool: 'server-playwright',
        model: 'qwen-vl:latest',
        location: 'Local VPS / Docker',
        status: 'active'
      },
      {
        name: 'User Flow Action Simulator',
        toolAgent: 'browser_click / browser_type',
        systemPrompt: 'You are the Action Ingestor. Goal: Simulate high-fidelity human clicking, typing, and hovering.',
        mcpTool: 'server-playwright',
        model: 'qwen-vl:latest',
        location: 'Local VPS / Docker',
        status: 'active'
      }
    ]
  },
  {
    id: 'self-healing',
    category: 'Quality / Audit',
    megaAgent: 'Self-Healing Agent',
    primaryAgent: 'CodeSecAgent',
    subAgent: 'Deep Scanner',
    hardwareNode: 'M4 Mac Nexus',
    repo: 'Prime.AI',
    scripts: '~30,007',
    diskScope: 1630786,
    status: 'active',
    color: 'from-emerald-500/20 to-teal-500/5 hover:border-emerald-500/40',
    glowColor: 'rgba(16, 185, 129, 0.15)',
    iconName: 'Activity',
    microAgents: [
      {
        name: 'AST Error Analyser',
        toolAgent: 'self_patch',
        systemPrompt: 'You are the AST Patched. Goal: Analyze logs and dynamically repair code errors.',
        mcpTool: 'recursive-evolution',
        model: 'deepseek-coder',
        location: 'Local M4 / Ollama',
        status: 'active'
      },
      {
        name: 'Swarm Performance Scorer',
        toolAgent: 'benchmark_agent',
        systemPrompt: 'You are the Evaluator. Goal: Benchmark models on task performance and trace errors.',
        mcpTool: 'recursive-evolution',
        model: 'deepseek-coder',
        location: 'Local M4 / Ollama',
        status: 'active'
      },
      {
        name: 'Python Dependency Resolver',
        toolAgent: 'run_command (pip/poetry)',
        systemPrompt: 'You are the Dependency Auditor. Goal: Fix package conflicts and security breaches.',
        mcpTool: 'run_command',
        model: 'deepseek-coder',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Vulnerability Scanner',
        toolAgent: 'grep_search',
        systemPrompt: 'You are the Code Auditor. Goal: Run ripgrep to find security vulnerabilities.',
        mcpTool: 'grep_search',
        model: 'deepseek-coder',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Code Repair Engine',
        toolAgent: 'replace_file_content',
        systemPrompt: 'You are the Code Splicer. Goal: Overwrite or edit code chunks with safety-patched versions.',
        mcpTool: 'replace_file_content / multi_replace_file_content',
        model: 'deepseek-coder',
        location: 'Local M4 / Ollama',
        status: 'active'
      }
    ]
  },
  {
    id: 'cloud-asian-hub',
    category: 'Web / Scraping',
    megaAgent: 'Cloud Asian Hub',
    primaryAgent: 'Web Navigation Swarm',
    subAgent: 'DOM Parser',
    hardwareNode: 'Alibaba Cloud / Cloudflare Edge',
    repo: 'asian-hub-proxy',
    scripts: '—',
    diskScope: 0,
    status: 'offline',
    color: 'from-amber-500/20 to-orange-500/5 hover:border-amber-500/40',
    glowColor: 'rgba(245, 158, 11, 0.15)',
    iconName: 'Globe',
    microAgents: [
      {
        name: 'Puppeteer Headless Crawler',
        toolAgent: 'browser_navigate',
        systemPrompt: 'You are the Crawler. Goal: Load static and JS-rendered web pages in headless Chrome.',
        mcpTool: 'server-playwright',
        model: 'qwen2.5:7b',
        location: 'Alibaba A10 GPU',
        status: 'offline'
      },
      {
        name: 'RiskControl Bypass Agent',
        toolAgent: 'browser_click / browser_type slowly',
        systemPrompt: 'You are the Captcha Solver. Goal: Click checkboxes slowly and type credentials humanly.',
        mcpTool: 'server-playwright',
        model: 'qwen2.5:7b',
        location: 'Cloudflare Edge',
        status: 'offline'
      },
      {
        name: 'Browser Fingerprint Changer',
        toolAgent: 'browser_evaluate',
        systemPrompt: 'You are the Identity Spoofer. Goal: Mutate navigator properties to avoid scraper detection.',
        mcpTool: 'server-playwright',
        model: 'qwen2.5:7b',
        location: 'Alibaba A10 GPU',
        status: 'offline'
      },
      {
        name: 'Lead Scraper Form Ingestor',
        toolAgent: 'browser_fill_form / submit',
        systemPrompt: 'You are the Form Automated. Goal: Search company directories and submit inputs.',
        mcpTool: 'server-playwright',
        model: 'qwen2.5:7b',
        location: 'Alibaba A10 GPU',
        status: 'offline'
      },
      {
        name: 'Proxy Node Rotation Manager',
        toolAgent: 'ssh proxy command',
        systemPrompt: 'You are the Proxy Rotator. Goal: Connect and rotate SSH socks5 proxies dynamically.',
        mcpTool: 'run_command',
        model: 'qwen2.5:7b',
        location: 'Alibaba Cloud',
        status: 'offline'
      }
    ]
  },
  {
    id: 'sovereign-identity',
    category: 'Auth / Infra',
    megaAgent: 'Sovereign Identity',
    primaryAgent: 'Auth Sub-Agent',
    subAgent: 'Token Manager',
    hardwareNode: 'M4 Mac Nexus / Cloudflare Edge',
    repo: 'oauth-automation',
    scripts: '—',
    diskScope: 1630786,
    status: 'active',
    color: 'from-pink-500/20 to-fuchsia-500/5 hover:border-pink-500/40',
    glowColor: 'rgba(236, 72, 153, 0.15)',
    iconName: 'Fingerprint',
    microAgents: [
      {
        name: 'PKCE OAuth Ingestor',
        toolAgent: 'oauth_connect',
        systemPrompt: 'You are the Identity Connector. Goal: Spin up local callback servers and start PKCE flows.',
        mcpTool: 'sovereign-oauth-mcp',
        model: 'mistral:7b',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Batch Provider Coordinator',
        toolAgent: 'oauth_connect_batch',
        systemPrompt: 'You are the Swarm Auth Wire. Goal: Sequentially log into Github, Google, and Slack.',
        mcpTool: 'sovereign-oauth-mcp',
        model: 'mistral:7b',
        location: 'Cloudflare Edge',
        status: 'active'
      },
      {
        name: 'Auto-Refresh Guard',
        toolAgent: 'oauth_get_token',
        systemPrompt: 'You are the Token Refresher. Goal: Retreive active tokens and auto-refresh them if expired.',
        mcpTool: 'sovereign-oauth-mcp',
        model: 'mistral:7b',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Stored Token Revoker',
        toolAgent: 'oauth_disconnect',
        systemPrompt: 'You are the Token Destroyer. Goal: Safely disconnect providers and purge tokens.',
        mcpTool: 'sovereign-oauth-mcp',
        model: 'mistral:7b',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Provider Status Auditor',
        toolAgent: 'oauth_status',
        systemPrompt: 'You are the Auth Auditor. Goal: Monitor and report connection status of all OAuth endpoints.',
        mcpTool: 'sovereign-oauth-mcp',
        model: 'mistral:7b',
        location: 'Local M4',
        status: 'active'
      }
    ]
  },
  {
    id: 'audio-persona',
    category: 'Voice / Media',
    megaAgent: 'Audio Persona',
    primaryAgent: 'Kokoro TTS',
    subAgent: 'Voicebox',
    hardwareNode: 'M4 Mac Nexus / GPU Tunnel (local)',
    repo: 'kokoro-tts',
    scripts: '—',
    diskScope: 1630786,
    status: 'active',
    color: 'from-purple-500/20 to-violet-500/5 hover:border-purple-500/40',
    glowColor: 'rgba(168, 85, 247, 0.15)',
    iconName: 'Mic',
    microAgents: [
      {
        name: 'Low-Latency Synthesis Engine',
        toolAgent: 'vps_docker_control (kokoro)',
        systemPrompt: 'You are the Audio Synthesizer. Goal: Generate vocal wav stream from raw text prompt.',
        mcpTool: 'sovereign-fleet-mcp',
        model: 'Kokoro-82M',
        location: 'Local M4 / Docker',
        status: 'active'
      },
      {
        name: 'Audio Waveform Converter',
        toolAgent: 'run_command (ffmpeg)',
        systemPrompt: 'You are the Audio Splicer. Goal: Re-sample vocal tracks and mix sound levels.',
        mcpTool: 'run_command',
        model: 'Kokoro-82M',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Local Audio Player Actuator',
        toolAgent: 'run_command (afplay)',
        systemPrompt: 'You are the Sound Player. Goal: Play MP3/WAV files on the local Mac host speaker.',
        mcpTool: 'run_command',
        model: 'Kokoro-82M',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Phoneme Transcription Translator',
        toolAgent: 'python kokoro script',
        systemPrompt: 'You are the Phoneme Editor. Goal: Map characters to exact phonemes for speech engine.',
        mcpTool: 'run_command',
        model: 'Kokoro-82M',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Real-time Voice Mixer',
        toolAgent: 'run_command',
        systemPrompt: 'You are the Voice Mixer. Goal: Adjust speed, pitch, and tone of the generated audio.',
        mcpTool: 'run_command',
        model: 'Kokoro-82M',
        location: 'Local M4',
        status: 'active'
      }
    ]
  },
  {
    id: 'live-avatar-14b',
    category: 'Media / Generative',
    megaAgent: 'Live Avatar 14B',
    primaryAgent: 'Wan2.2-S2V-14B',
    subAgent: 'FP8 Video Streamer',
    hardwareNode: 'Vast.ai H200 / GPU Tunnel (local)',
    repo: 'live-avatar',
    scripts: '—',
    diskScope: 0,
    status: 'offline',
    color: 'from-orange-500/20 to-red-500/5 hover:border-orange-500/40',
    glowColor: 'rgba(249, 115, 22, 0.15)',
    iconName: 'Video',
    microAgents: [
      {
        name: 'Real-Time Streaming Frame Generator',
        toolAgent: 'live_avatar_inference.sh',
        systemPrompt: 'You are the Frame Synthesizer. Goal: Render FP8 avatar frames at 24fps in real time.',
        mcpTool: 'server-fetch',
        model: 'Wan2.2-S2V-14B',
        location: 'Vast.ai / Nvidia H200',
        status: 'offline'
      },
      {
        name: 'GPU Container Provisioner',
        toolAgent: 'run_command (vastai CLI)',
        systemPrompt: 'You are the Cloud Deployer. Goal: Lease Vast.ai instances and compile environment.',
        mcpTool: 'run_command',
        model: 'Wan2.2-S2V-14B',
        location: 'Vast.ai Cloud API',
        status: 'offline'
      },
      {
        name: 'Cloudflare Proxy Tunnel',
        toolAgent: 'vps_exec (cloudflared)',
        systemPrompt: 'You are the Tunnel Guard. Goal: Open Cloudflare secure reverse tunnel for WebRTC stream.',
        mcpTool: 'sovereign-fleet-mcp',
        model: 'Wan2.2-S2V-14B',
        location: 'Local M4 / Cloudflared',
        status: 'offline'
      },
      {
        name: 'FP8 Weight Fetcher',
        toolAgent: 'server-fetch',
        systemPrompt: 'You are the weight downloader. Goal: Fetch FP8 weights without corrupting memory.',
        mcpTool: 'server-fetch',
        model: 'Wan2.2-S2V-14B',
        location: 'Hugging Face API',
        status: 'offline'
      },
      {
        name: 'WebRTC Stream Initiator',
        toolAgent: 'browser_evaluate',
        systemPrompt: 'You are the WebRTC Handshaker. Goal: Connect SDP offer to local dashboard for live stream.',
        mcpTool: 'server-playwright',
        model: 'Wan2.2-S2V-14B',
        location: 'Vast.ai / Nvidia H200',
        status: 'offline'
      }
    ]
  },
  {
    id: 'memory-core',
    category: 'Data / Memory',
    megaAgent: 'Memory Core',
    primaryAgent: 'FAISS Index',
    subAgent: 'Backup Agent',
    hardwareNode: 'Synology NAS',
    repo: 'memory-core',
    scripts: '—',
    diskScope: 0,
    status: 'active',
    color: 'from-teal-500/20 to-emerald-500/5 hover:border-teal-500/40',
    glowColor: 'rgba(20, 184, 166, 0.15)',
    iconName: 'Layers',
    microAgents: [
      {
        name: 'Vector Database Builder',
        toolAgent: 'create_entities',
        systemPrompt: 'You are the Memory Grapher. Goal: Ingest system status and build vector entities.',
        mcpTool: 'server-memory',
        model: 'nomic-embed-text',
        location: 'Local NAS',
        status: 'active'
      },
      {
        name: 'Semantic Knowledge Searcher',
        toolAgent: 'search_nodes',
        systemPrompt: 'You are the Memory Retrospective. Goal: Execute similarity searches across vector space.',
        mcpTool: 'server-memory',
        model: 'nomic-embed-text',
        location: 'Local NAS',
        status: 'active'
      },
      {
        name: 'Semantic Relation Mapper',
        toolAgent: 'create_relations',
        systemPrompt: 'You are the Relation Weaver. Goal: Link entities in active voice inside the graph.',
        mcpTool: 'server-memory',
        model: 'nomic-embed-text',
        location: 'Local NAS',
        status: 'active'
      },
      {
        name: 'NAS Synchronization Scheduler',
        toolAgent: 'run_command (rsync)',
        systemPrompt: 'You are the Sync Guard. Goal: Sync cold storage vectors to offline Synology NAS partitions.',
        mcpTool: 'run_command',
        model: 'nomic-embed-text',
        location: 'Local NAS',
        status: 'active'
      },
      {
        name: 'Entity Graph Cleaner',
        toolAgent: 'delete_entities',
        systemPrompt: 'You are the Memory Purger. Goal: Prune stale or redundant entities from active Qdrant.',
        mcpTool: 'server-memory',
        model: 'nomic-embed-text',
        location: 'Local NAS',
        status: 'active'
      }
    ]
  },
  {
    id: 'autonomous-claw',
    category: 'Physical / Legacy',
    megaAgent: 'Autonomous CLAW',
    primaryAgent: 'Windows Remote',
    subAgent: 'Hardware Actuator',
    hardwareNode: 'iMac Windows / Raspberry Pi',
    repo: 'imac-remote',
    scripts: '12',
    diskScope: 253,
    status: 'offline',
    color: 'from-amber-600/20 to-yellow-500/5 hover:border-amber-600/40',
    glowColor: 'rgba(217, 119, 6, 0.15)',
    iconName: 'Tv',
    microAgents: [
      {
        name: 'Windows Remote Typist',
        toolAgent: 'imac_type',
        systemPrompt: 'You are the Typist. Goal: Simulate keyboard text input on active remote screen.',
        mcpTool: 'imac_type',
        model: 'qwen2.5:7b',
        location: 'Local iMac / ZeroClaw',
        status: 'offline'
      },
      {
        name: 'Windows Remote Mouse Clicker',
        toolAgent: 'imac_click',
        systemPrompt: 'You are the Clicker. Goal: Perform click actions at exact coordinates.',
        mcpTool: 'imac_click',
        model: 'qwen2.5:7b',
        location: 'Local iMac / ZeroClaw',
        status: 'offline'
      },
      {
        name: 'Windows Remote Command Executor',
        toolAgent: 'imac_execute',
        systemPrompt: 'You are the Command Executor. Goal: Execute PowerShell commands in the background.',
        mcpTool: 'imac_execute',
        model: 'qwen2.5:7b',
        location: 'Local iMac / ZeroClaw',
        status: 'offline'
      },
      {
        name: 'Hotkey Automation Combiner',
        toolAgent: 'imac_hotkey',
        systemPrompt: 'You are the Hotkey Ingestor. Goal: Press complex hotkeys simultaneously.',
        mcpTool: 'imac_hotkey',
        model: 'qwen2.5:7b',
        location: 'Local iMac / ZeroClaw',
        status: 'offline'
      },
      {
        name: 'Remote Status Controller',
        toolAgent: 'imac_status',
        systemPrompt: 'You are the Remote Checker. Goal: Probe AntiGravity Windows gateway and report latency.',
        mcpTool: 'imac_status',
        model: 'qwen2.5:7b',
        location: 'Raspberry Pi Local / Windows Gateway',
        status: 'offline'
      }
    ]
  },
  {
    id: 'mobile-sovereign',
    category: 'Business / Edge',
    megaAgent: 'Mobile Sovereign',
    primaryAgent: 'PWA Agent',
    subAgent: 'TWA Bridge',
    hardwareNode: 'Samsung Android / Cloudflare Edge',
    repo: 'prime-pwa',
    scripts: '—',
    diskScope: 0,
    status: 'offline',
    color: 'from-cyan-600/20 to-teal-500/5 hover:border-cyan-600/40',
    glowColor: 'rgba(8, 145, 178, 0.15)',
    iconName: 'Smartphone',
    microAgents: [
      {
        name: 'Haptic Command Ingestor',
        toolAgent: 'run_command (NATS)',
        systemPrompt: 'You are the Telemetry Subscriber. Goal: Ingest real-time NATS events from the swarm.',
        mcpTool: 'run_command',
        model: 'DeepSeek-Chat',
        location: 'OpenRouter API',
        status: 'offline'
      },
      {
        name: 'WebView DOM Auditor',
        toolAgent: 'mcp_nullclaw-repo (read_text)',
        systemPrompt: 'You are the Mobile File Inspector. Goal: Parse local Android filesystem and verify assets.',
        mcpTool: 'mcp_nullclaw-repo',
        model: 'DeepSeek-Chat',
        location: 'Cloudflare Edge',
        status: 'offline'
      },
      {
        name: 'Mobile Gradle Builder',
        toolAgent: 'run_command (gradlew)',
        systemPrompt: 'You are the Gradle Compiler. Goal: Package the APK securely under production certificate.',
        mcpTool: 'run_command',
        model: 'DeepSeek-Chat',
        location: 'OpenRouter API',
        status: 'offline'
      },
      {
        name: 'Android Device Runner',
        toolAgent: 'run_command (adb)',
        systemPrompt: 'You are the Device Operator. Goal: Push APKs to local Samsung hardware and launch activity.',
        mcpTool: 'run_command',
        model: 'DeepSeek-Chat',
        location: 'OpenRouter API',
        status: 'offline'
      },
      {
        name: 'Haptic Feedback Actuator',
        toolAgent: 'run_command (NATS vibration)',
        systemPrompt: 'You are the Haptic Engine. Goal: Trigger vibration signals based on telemetry status.',
        mcpTool: 'run_command',
        model: 'DeepSeek-Chat',
        location: 'OpenRouter API',
        status: 'offline'
      }
    ]
  },
  {
    id: 'majlis-connect',
    category: 'Business / Concierge',
    megaAgent: 'Majlis Connect',
    primaryAgent: 'Sentiens Concierge',
    subAgent: 'Lead Capture',
    hardwareNode: 'M4 Mac Nexus / Cloudflare Edge',
    repo: 'majlis-connect',
    scripts: '—',
    diskScope: 1630786,
    status: 'active',
    color: 'from-yellow-500/20 to-amber-500/5 hover:border-yellow-500/40',
    glowColor: 'rgba(234, 179, 8, 0.15)',
    iconName: 'MessageSquare',
    microAgents: [
      {
        name: 'OpenRouter Inference Proxy',
        toolAgent: 'server-fetch',
        systemPrompt: 'You are the Concierge Model. Goal: Route high-fidelity booking questions to OpenRouter DeepSeek.',
        mcpTool: 'server-fetch',
        model: 'DeepSeek-Chat',
        location: 'OpenRouter API',
        status: 'active'
      },
      {
        name: 'Booking Web Form Controller',
        toolAgent: 'server-fetch (POST)',
        systemPrompt: 'You are the Booking Automated. Goal: Parse user variables and submit POST requests to CRM API.',
        mcpTool: 'server-fetch',
        model: 'DeepSeek-Chat',
        location: 'Cloudflare Edge',
        status: 'active'
      },
      {
        name: 'SMTP Email Concierge Mailer',
        toolAgent: 'run_command (python smtp)',
        systemPrompt: 'You are the Email Notified. Goal: Dispatch booking confirmations using secure SMTP.',
        mcpTool: 'run_command',
        model: 'DeepSeek-Chat',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Slack Webhook Dispatcher',
        toolAgent: 'run_command (slack curl)',
        systemPrompt: 'You are the Slack Messenger. Goal: Post new lead notifications to the AIA_LAB Slack channel.',
        mcpTool: 'run_command',
        model: 'DeepSeek-Chat',
        location: 'Local M4 / Slack API',
        status: 'active'
      },
      {
        name: 'Vercel Build Monitor',
        toolAgent: 'server-fetch (Vercel API)',
        systemPrompt: 'You are the Deploy Auditor. Goal: Monitor Vercel builds for static site generation errors.',
        mcpTool: 'server-fetch',
        model: 'DeepSeek-Chat',
        location: 'Local M4 / Vercel API',
        status: 'active'
      }
    ]
  },
  {
    id: 'prime-consciousness',
    category: 'Desktop / OS',
    megaAgent: 'Prime Consciousness',
    primaryAgent: 'Self-Coding Engine',
    subAgent: 'Sovereign Architect',
    hardwareNode: 'M4 Mac Nexus / Cloudflare Edge',
    repo: 'Prime.AI',
    scripts: '~30,007',
    diskScope: 1630786,
    status: 'active',
    color: 'from-blue-600/20 to-cyan-500/5 hover:border-blue-600/40',
    glowColor: 'rgba(37, 99, 235, 0.15)',
    iconName: 'Globe',
    microAgents: [
      {
        name: 'File Contents Overwriter',
        toolAgent: 'write_to_file',
        systemPrompt: 'You are the File Creator. Goal: Write or replace code structures with precise indentation.',
        mcpTool: 'write_to_file',
        model: 'deepseek-r1:7b',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'System Shell Supervisor',
        toolAgent: 'run_command',
        systemPrompt: 'You are the Command Dispatch. Goal: Propose and run system-level commands inside zsh.',
        mcpTool: 'run_command',
        model: 'deepseek-r1:7b',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Directory Structure Lister',
        toolAgent: 'mcp_nullclaw-repo (directory_tree)',
        systemPrompt: 'You are the Directory Auditor. Goal: Map recursive JSON layouts of active repositories.',
        mcpTool: 'mcp_nullclaw-repo',
        model: 'deepseek-r1:7b',
        location: 'Cloudflare Edge',
        status: 'active'
      },
      {
        name: 'Perplexity Research Analyst',
        toolAgent: 'mcp_perplexity-ask',
        systemPrompt: 'You are the Web Analyst. Goal: Probe perplexity search for active framework changes.',
        mcpTool: 'mcp_perplexity-ask',
        model: 'deepseek-r1:7b',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Workspace File Searcher',
        toolAgent: 'search_files',
        systemPrompt: 'You are the File Spotter. Goal: Recursively match partial filenames across target directories.',
        mcpTool: 'mcp_nullclaw-repo',
        model: 'deepseek-r1:7b',
        location: 'Local M4',
        status: 'active'
      }
    ]
  },
  {
    id: 'traffic-controller',
    category: 'Infra / Routing',
    megaAgent: 'Traffic Controller',
    primaryAgent: 'F5 Proxy Simulator',
    subAgent: 'Nginx Load Balancer',
    hardwareNode: 'VPS 31.97.52.22 / Cloudflare Edge',
    repo: 'N/A',
    scripts: '—',
    diskScope: 6823,
    status: 'active',
    color: 'from-teal-600/20 to-emerald-500/5 hover:border-teal-600/40',
    glowColor: 'rgba(13, 148, 136, 0.15)',
    iconName: 'Network',
    microAgents: [
      {
        name: 'Nginx Proxy Hot Reloader',
        toolAgent: 'vps_exec (nginx)',
        systemPrompt: 'You are the Nginx Operator. Goal: Reload Nginx configurations to support new subdomains.',
        mcpTool: 'mcp_sovereign-fleet-mcp',
        model: 'N/A',
        location: 'Local VPS',
        status: 'active'
      },
      {
        name: 'Tunnel Daemon Keeper',
        toolAgent: 'vps_service_control (cloudflared)',
        systemPrompt: 'You are the Cloudflare Daemon. Goal: Restart and monitor cloudflared proxy connections.',
        mcpTool: 'mcp_sovereign-fleet-mcp',
        model: 'N/A',
        location: 'Local VPS',
        status: 'active'
      },
      {
        name: 'SSL Certbot Auto-Renewer',
        toolAgent: 'vps_exec (certbot)',
        systemPrompt: 'You are the SSL Guard. Goal: Secure Let\'s Encrypt certificates before expiration.',
        mcpTool: 'mcp_sovereign-fleet-mcp',
        model: 'N/A',
        location: 'Local VPS',
        status: 'active'
      },
      {
        name: 'WebSocket Port Upgrader',
        toolAgent: 'Nginx websocket config',
        systemPrompt: 'You are the WebSocket Port Upgrader. Goal: Configure Nginx headers to support persistent ws connections.',
        mcpTool: 'mcp_sovereign-fleet-mcp',
        model: 'N/A',
        location: 'Local VPS / Cloudflare Edge',
        status: 'active'
      },
      {
        name: 'Active Load Balancer Prober',
        toolAgent: 'vps_exec (curl)',
        systemPrompt: 'You are the Router Monitor. Goal: Verify active port distribution and report errors.',
        mcpTool: 'mcp_sovereign-fleet-mcp',
        model: 'N/A',
        location: 'Local VPS',
        status: 'active'
      }
    ]
  },
  {
    id: 'rap-bot-synthesis',
    category: 'Creative / Audio',
    megaAgent: 'Rap Bot / Synthesis',
    primaryAgent: 'Music Agent',
    subAgent: 'Audio Mixer',
    hardwareNode: 'M4 Mac Nexus',
    repo: 'N/A',
    scripts: '—',
    diskScope: 1630786,
    status: 'active',
    color: 'from-pink-600/20 to-rose-500/5 hover:border-pink-600/40',
    glowColor: 'rgba(219, 39, 119, 0.15)',
    iconName: 'Music',
    microAgents: [
      {
        name: 'Suno/Udio Lyric Submitter',
        toolAgent: 'browser_fill_form / submit',
        systemPrompt: 'You are the Lyric Synthesizer. Goal: Ingest procedural lyrics and submit them to generative engine.',
        mcpTool: 'server-playwright',
        model: 'Suno/Udio API',
        location: 'API Provider',
        status: 'active'
      },
      {
        name: 'Rhythmic Segment Concat',
        toolAgent: 'run_command (ffmpeg splice)',
        systemPrompt: 'You are the Music Editor. Goal: Cut, splice, and concat procedural audio tracks securely.',
        mcpTool: 'run_command',
        model: 'Suno/Udio API',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Soundboard Browser Actuator',
        toolAgent: 'server-playwright (audio render)',
        systemPrompt: 'You are the Soundboard Player. Goal: Verify audio rendering and play sound files inside browser.',
        mcpTool: 'server-playwright',
        model: 'Suno/Udio API',
        location: 'API Provider',
        status: 'active'
      },
      {
        name: 'Sound Level Normalizer',
        toolAgent: 'run_command (ffmpeg loudnorm)',
        systemPrompt: 'You are the Sound Auditor. Goal: Normalize dynamic audio levels using EBU R128 guidelines.',
        mcpTool: 'run_command',
        model: 'Suno/Udio API',
        location: 'Local M4',
        status: 'active'
      },
      {
        name: 'Beat Synchronization Engine',
        toolAgent: 'run_command',
        systemPrompt: 'You are the Beat Matcher. Goal: Detect track BPM and align transient spikes.',
        mcpTool: 'run_command',
        model: 'Suno/Udio API',
        location: 'Local M4',
        status: 'active'
      }
    ]
  }
];

interface ExecutionLogStep {
  text: string;
  type: 'info' | 'dispatch' | 'exec' | 'model' | 'success' | 'warn';
  delay: number;
}

interface DeepSearchPreset {
  title: string;
  task: string;
  logs: ExecutionLogStep[];
}

const deepSearchPresets: DeepSearchPreset[] = [
  {
    title: 'Deploy database synchronization on the VPS',
    task: 'Configure autonomic replication and SQL migrations on VPS amlazr.com',
    logs: [
      { text: '🔍 [INTENT CLASSIFIER] Ingesting goal: "Configure autonomic replication and SQL migrations on VPS amlazr.com"', type: 'info', delay: 400 },
      { text: '🤖 [DISPATCH ROUTER] Routing to Mega Agent: DemoCompta Engine', type: 'dispatch', delay: 800 },
      { text: '⚡ [MODEL REASONING] Invoking qwen3:8b on Local VPS. Generating migration DAG...', type: 'model', delay: 1200 },
      { text: '🔧 [MICRO AGENT: Service Monitor] Running vps_service_control status postgresql... Active 🟢', type: 'exec', delay: 1600 },
      { text: '🔧 [MICRO AGENT: Database Synchronizer] Running vps_exec (psql) with migration payload amlazr_v3.sql...', type: 'exec', delay: 2000 },
      { text: '📈 [MICRO AGENT: Storage Monitor] Checking disk scope... VPS Disk: 45.2GB utilized. Space Safe 🟢', type: 'exec', delay: 2400 },
      { text: '📡 [MICRO AGENT: API Health Ping] Testing live server health endpoint... 200 OK (latency: 18ms) 🟢', type: 'exec', delay: 2800 },
      { text: '🏆 [E2E TRUTH ENGINE] Replication active, migrations aligned. Verified E2E true. Task Complete 🟢', type: 'success', delay: 3200 }
    ]
  },
  {
    title: 'Halt rogue network services under EU AI Act rules',
    task: 'Instantly invoke MATRIX_HALT isolation on compromise zone amlazr.com',
    logs: [
      { text: '⚠️ [INTENT CLASSIFIER] WARNING: High Severity Action requested! Classifying isolation goal...', type: 'warn', delay: 400 },
      { text: '🤖 [DISPATCH ROUTER] Activating emergency Mega Agent: Matrix Defense', type: 'dispatch', delay: 800 },
      { text: '⚡ [MODEL REASONING] Invoking Llama-3-8B-Instruct on M4 local. Safe isolation compliance checked (EU AI Act 2026 Article 14) 🟢', type: 'model', delay: 1200 },
      { text: '🔧 [MICRO AGENT: Emergency Stop Trigger] Calling run_command (kill-switch amlazr) to trigger system halt...', type: 'exec', delay: 1600 },
      { text: '🔧 [MICRO AGENT: Intrusion Isolator] Executing iptables firewall injection DROP rules for target subnet...', type: 'exec', delay: 2000 },
      { text: '🔧 [MICRO AGENT: ARP Spoofer] Poisoning network gateway coordinates on Raspberry Pi... Intruder isolated.', type: 'exec', delay: 2400 },
      { text: '🛡️ [E2E TRUTH ENGINE] Network halted safely. Compliance logs exported. Sovereign Core Protected 🟢', type: 'success', delay: 2800 }
    ]
  },
  {
    title: 'Generate procedural rap beats and splice vocals',
    task: 'Compose synthetic trap lyrics, trigger Suno synth, and splice beats',
    logs: [
      { text: '🎵 [INTENT CLASSIFIER] Ingesting goal: "Compose synthetic trap lyrics, trigger Suno synth, and splice beats"', type: 'info', delay: 400 },
      { text: '🤖 [DISPATCH ROUTER] Activating Mega Agent: Rap Bot / Synthesis', type: 'dispatch', delay: 800 },
      { text: '⚡ [MODEL REASONING] Generating rhythmic lyrics and beat parameters (140 BPM, Trap) using local Qwen3...', type: 'model', delay: 1200 },
      { text: '🔧 [MICRO AGENT: Suno/Udio Lyric Submitter] Filling Udio generation forms via browser_fill_form... Generation queued 🟢', type: 'exec', delay: 1600 },
      { text: '🔧 [MICRO AGENT: Soundboard Browser Actuator] Downloading raw track WAV streams... Completed 🟢', type: 'exec', delay: 2000 },
      { text: '🔧 [MICRO AGENT: Rhythmic Segment Concat] Running run_command (ffmpeg splice) to combine vocals and beats...', type: 'exec', delay: 2400 },
      { text: '🔧 [MICRO AGENT: Sound Level Normalizer] Normalizing EBU R128 loudness to -14 LUFS...', type: 'exec', delay: 2800 },
      { text: '🎧 [E2E TRUTH ENGINE] Spliced master MP3 ready. Speaker afplay active. Audio generated successfully 🟢', type: 'success', delay: 3200 }
    ]
  },
  {
    title: 'Scrape business directories and bypass RiskControl',
    task: 'Extract 100 enterprise contacts in Singapore using browser bypass routines',
    logs: [
      { text: '🔍 [INTENT CLASSIFIER] Ingesting goal: "Extract 100 enterprise contacts in Singapore using browser bypass"', type: 'info', delay: 400 },
      { text: '🤖 [DISPATCH ROUTER] Dispatching target: Cloud Asian Hub', type: 'dispatch', delay: 800 },
      { text: '⚡ [MODEL REASONING] Instantiating stealth Chrome profiles (headless-false) on Alibaba Cloud A10 node...', type: 'model', delay: 1200 },
      { text: '🔧 [MICRO AGENT: Proxy Node Rotation Manager] Revolving SOCKS5 tunnel nodes on Cloudflare Edge...', type: 'exec', delay: 1600 },
      { text: '🔧 [MICRO AGENT: Puppeteer Headless Crawler] Loading directory targets via browser_navigate...', type: 'exec', delay: 2000 },
      { text: '🔧 [MICRO AGENT: RiskControl Bypass Agent] Captcha detected. Executing slow mouse-dragging curves... Bypass SUCCESS 🟢', type: 'exec', delay: 2400 },
      { text: '🔧 [MICRO AGENT: Lead Scraper Form Ingestor] Submitting query forms, exporting 100 leads to active vector database...', type: 'exec', delay: 2800 },
      { text: '🏆 [E2E TRUTH ENGINE] 100 contacts compiled into Synology FAISS index. Scraping Pipeline complete 🟢', type: 'success', delay: 3200 }
    ]
  }
];

export default function SovereignSwarmArena() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<MegaAgentData | null>(null);
  
  // Search state
  const [deepSearchQuery, setDeepSearchQuery] = useState('');
  const [executionLogs, setExecutionLogs] = useState<ExecutionLogStep[]>([]);
  const [isOrchestrating, setIsOrchestrating] = useState(false);

  // Filter agents based on search
  const filteredAgents = useMemo(() => {
    if (!searchTerm.trim()) return sovereignAgents;
    const term = searchTerm.toLowerCase();
    return sovereignAgents.filter((agent) => {
      const matchMega = agent.megaAgent.toLowerCase().includes(term);
      const matchPrimary = agent.primaryAgent.toLowerCase().includes(term);
      const matchSub = agent.subAgent.toLowerCase().includes(term);
      const matchCategory = agent.category.toLowerCase().includes(term);
      const matchHardware = agent.hardwareNode.toLowerCase().includes(term);
      
      const matchMicro = agent.microAgents.some(
        (micro) =>
          micro.name.toLowerCase().includes(term) ||
          micro.toolAgent.toLowerCase().includes(term) ||
          micro.systemPrompt.toLowerCase().includes(term) ||
          micro.model.toLowerCase().includes(term)
      );

      return matchMega || matchPrimary || matchSub || matchCategory || matchHardware || matchMicro;
    });
  }, [searchTerm]);

  const handleDeepSearch = (queryText: string) => {
    if (!queryText.trim() || isOrchestrating) return;
    setDeepSearchQuery(queryText);
    setIsOrchestrating(true);
    setExecutionLogs([]);

    // Check if query matches a preset
    const matchedPreset = deepSearchPresets.find((p) =>
      queryText.toLowerCase().includes(p.task.toLowerCase().slice(0, 10)) ||
      p.title.toLowerCase().includes(queryText.toLowerCase().slice(0, 10))
    );

    const steps: ExecutionLogStep[] = matchedPreset
      ? matchedPreset.logs
      : [
          { text: `🔍 [INTENT CLASSIFIER] Ingesting custom goal: "${queryText}"`, type: 'info', delay: 400 },
          { text: '🤖 [DISPATCH ROUTER] Routing to Prime Consciousness self-coding sub-swarm...', type: 'dispatch', delay: 1000 },
          { text: '⚡ [MODEL REASONING] Invoking DeepSeek-R1 for agentic step composition...', type: 'model', delay: 1800 },
          { text: '🔧 [MICRO AGENT: Workspace File Searcher] Crawling active codebase for components...', type: 'exec', delay: 2600 },
          { text: '🔧 [MICRO AGENT: File Contents Overwriter] Splicing patches in sandbox environment...', type: 'exec', delay: 3400 },
          { text: '🔧 [MICRO AGENT: System Shell Supervisor] Compiling and running tests... 100% Pass 🟢', type: 'exec', delay: 4200 },
          { text: '🏆 [E2E TRUTH ENGINE] Custom task execution completed. Verified E2E true. Output ready 🟢', type: 'success', delay: 5000 }
        ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setExecutionLogs((prev) => [...prev, step]);
        if (index === steps.length - 1) {
          setIsOrchestrating(false);
        }
      }, step.delay);
    });
  };

  const getAgentIcon = (name: string) => {
    switch (name) {
      case 'Cpu':
        return <Cpu size={24} />;
      case 'Database':
        return <Database size={24} />;
      case 'Shield':
        return <Shield size={24} />;
      case 'Eye':
        return <Eye size={24} />;
      case 'Activity':
        return <Activity size={24} />;
      case 'Globe':
        return <Globe size={24} />;
      case 'Fingerprint':
        return <Fingerprint size={24} />;
      case 'Mic':
        return <Mic size={24} />;
      case 'Video':
        return <Video size={24} />;
      case 'Layers':
        return <Layers size={24} />;
      case 'Tv':
        return <Tv size={24} />;
      case 'Smartphone':
        return <Smartphone size={24} />;
      case 'MessageSquare':
        return <MessageSquare size={24} />;
      case 'Music':
        return <Music size={24} />;
      case 'Network':
        return <Network size={24} />;
      default:
        return <HelpCircle size={24} />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-10">
      {/* 1. Dashboard Header & Live Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-transparent pointer-events-none" />
        
        {/* Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="text-cyan-400 animate-pulse" size={24} />
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-cyan-400 uppercase">
              Operational Fleet Actuator
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight font-display uppercase">
            Sovereign Swarm <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Control Arena</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-xl leading-relaxed">
            Real-time interface for the 16 multi-agent tiers driving amlazr.com, amlazr.com, and local Apple Silicon M4 clusters.
          </p>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
          {[
            { label: 'MEGA-AGENTS', val: '16', status: '🟢' },
            { label: 'MICRO-AGENTS', val: '80', status: '🟢' },
            { label: 'HARDWARE NODES', val: '9', status: '🟢' },
            { label: 'SWARM STATE', val: 'VERIFIED', status: '🟢' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-center backdrop-blur-md">
              <span className="text-[10px] text-gray-500 font-mono tracking-widest block uppercase mb-1">
                {stat.label}
              </span>
              <span className="text-xl font-black text-white font-mono flex items-center justify-center gap-1.5">
                {stat.val} <span className="text-xs">{stat.status}</span>
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 2. Deep Search Console */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Search/Form Area */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Terminal size={18} className="text-cyan-400" />
              Agent Deep Search
            </h2>
            <p className="text-gray-400 text-xs leading-relaxed">
              Submit a goal to trigger parallel intent classification, dispatch routing, and micro-agent splicing.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
              Orchestrate Presets
            </span>
            {deepSearchPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDeepSearchQuery(preset.task);
                  handleDeepSearch(preset.task);
                }}
                disabled={isOrchestrating}
                className="w-full text-left p-3 rounded-xl border border-white/5 bg-black/20 hover:bg-cyan-500/10 hover:border-cyan-500/30 text-xs text-gray-300 hover:text-white transition-all duration-300 flex items-center justify-between group disabled:opacity-50"
              >
                <span className="truncate pr-2 font-mono">{preset.title}</span>
                <PlayCircle size={14} className="text-gray-500 group-hover:text-cyan-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="mt-auto flex flex-col gap-2">
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
              Custom Goal Actuator
            </span>
            <div className="relative">
              <input
                type="text"
                placeholder="Type a goal... e.g. Sync VPS database"
                value={deepSearchQuery}
                onChange={(e) => setDeepSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDeepSearch(deepSearchQuery)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
              />
              <button
                onClick={() => handleDeepSearch(deepSearchQuery)}
                disabled={isOrchestrating}
                className="absolute right-2 top-2 p-1.5 bg-cyan-500 text-black hover:bg-cyan-400 rounded-lg transition-colors disabled:opacity-50"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Terminal Output Area */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-black/60 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.05)] flex flex-col min-h-[300px]">
          {/* Top terminal bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 text-xs font-mono text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/40"></span>
              <span className="ml-2 text-cyan-400">AMLAZR_SWARM_ORCHESTRATION_BUS</span>
            </div>
            <span>[SESSION: ACTIVE]</span>
          </div>

          {/* Logs Terminal */}
          <div className="flex-1 font-mono text-xs overflow-y-auto max-h-[320px] flex flex-col gap-2 scrollbar-thin">
            {executionLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-2">
                <Search size={24} className="opacity-40 animate-pulse text-cyan-400" />
                <span className="text-[10px] tracking-widest uppercase">
                  Awaiting Swarm Dispatch Command
                </span>
                <span className="text-[9px] text-gray-600">
                  Select a preset on the left or enter a custom goal.
                </span>
              </div>
            ) : (
              <AnimatePresence>
                {executionLogs.map((log, idx) => {
                  let logColor = 'text-gray-300';
                  if (log.type === 'dispatch') logColor = 'text-purple-400 font-bold';
                  if (log.type === 'exec') logColor = 'text-cyan-400';
                  if (log.type === 'model') logColor = 'text-yellow-400 italic';
                  if (log.type === 'success') logColor = 'text-green-400 font-bold';
                  if (log.type === 'warn') logColor = 'text-red-400 font-bold';

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`py-1 border-l-2 pl-3 ${logColor} ${
                        log.type === 'success' ? 'border-green-500 bg-green-950/10' : 'border-white/10'
                      }`}
                    >
                      {log.text}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
            
            {isOrchestrating && (
              <div className="flex items-center gap-2 text-cyan-400 py-1 pl-3 animate-pulse">
                <span>⚡ Orchestrating next workflow path...</span>
                <span className="w-1.5 h-3 bg-cyan-400 animate-pulse"></span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 3. Interactive Mega-Agents Grid */}
      <div className="flex flex-col gap-6">
        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Network className="text-cyan-500" size={20} />
            <h2 className="text-xl font-bold text-white tracking-tight font-display uppercase">
              Mega-Agentic Tiers ({filteredAgents.length})
            </h2>
          </div>

          {/* Search bar inside list */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search agents, tools, prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/60 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-3 text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => setSelectedAgent(agent)}
              className={`cursor-pointer group relative p-6 rounded-2xl bg-gradient-to-br ${agent.color} border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-500 flex flex-col justify-between min-h-[200px]`}
            >
              {/* Glow Behind Hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  boxShadow: `0 0 35px ${agent.glowColor}`,
                  background: `radial-gradient(circle at 50% 50%, ${agent.glowColor}, transparent 65%)`
                }}
              />

              {/* Card Top */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                    {getAgentIcon(agent.iconName)}
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full border ${
                      agent.status === 'active'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                    }`}
                  >
                    {agent.status.toUpperCase()}
                  </span>
                </div>

                <span className="text-[10px] text-gray-500 font-mono tracking-widest block uppercase mb-1">
                  {agent.category}
                </span>
                <h3 className="text-base font-black text-white group-hover:text-white/90 transition-colors">
                  {agent.megaAgent}
                </h3>
              </div>

              {/* Card Bottom */}
              <div className="relative z-10 mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-gray-500 text-[10px] font-mono">
                <span className="truncate max-w-[150px]">{agent.hardwareNode.split(' / ')[0]}</span>
                <span className="text-white/60 group-hover:text-white flex items-center gap-1 font-semibold group-hover:pl-1 transition-all duration-300">
                  Details <ArrowRight size={10} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. Telemetry Expanded Details Modal (Overlay) */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAgent(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="relative w-full max-w-4xl bg-slate-950/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col max-h-[85vh]"
            >
              {/* Top Banner */}
              <div className={`p-6 bg-gradient-to-r ${selectedAgent.color} border-b border-white/5 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center text-white/90 border border-white/10">
                    {getAgentIcon(selectedAgent.iconName)}
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-mono tracking-widest uppercase">
                      {selectedAgent.category} Node Expanded
                    </span>
                    <h2 className="text-2xl font-black text-white">{selectedAgent.megaAgent}</h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 scrollbar-thin">
                {/* Mega-Agent Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Primary Controller', val: selectedAgent.primaryAgent },
                    { label: 'Sub-Agent Link', val: selectedAgent.subAgent },
                    { label: 'Hardware Anchor', val: selectedAgent.hardwareNode },
                    { label: 'Repository Path', val: selectedAgent.repo }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 rounded-xl px-4 py-3">
                      <span className="text-[9px] text-gray-500 font-mono tracking-wider block uppercase mb-1">
                        {stat.label}
                      </span>
                      <span className="text-xs font-semibold text-gray-200 block truncate" title={stat.val}>
                        {stat.val}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Swarm Micro-Agents Telemetry list */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-400 animate-pulse" />
                    Micro-Agent Orchestration Stack
                  </h3>

                  <div className="flex flex-col gap-4">
                    {selectedAgent.microAgents.map((micro, idx) => (
                      <div
                        key={idx}
                        className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/15 transition-all duration-300"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            <h4 className="text-sm font-bold text-white font-mono">{micro.name}</h4>
                            <span className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded text-gray-400 font-mono">
                              Tool: {micro.toolAgent}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs italic leading-relaxed pl-5 border-l border-white/10">
                            "{micro.systemPrompt}"
                          </p>
                        </div>

                        {/* Telemetry labels */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 md:text-right font-mono text-[10px] shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                          <div>
                            <span className="text-gray-500 block">AI MODEL</span>
                            <span className="text-cyan-300 font-bold">{micro.model}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">LOCATION</span>
                            <span className="text-purple-300">{micro.location}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">MCP TOOL</span>
                            <span className="text-yellow-300">{micro.mcpTool}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500 px-6">
                <span>METADATA SCAN FOOTPRINT: {selectedAgent.diskScope.toLocaleString()} KB</span>
                <span className="text-green-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  STABLE TELEMETRY SYNCED
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
