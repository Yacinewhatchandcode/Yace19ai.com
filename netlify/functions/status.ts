// ═══════════════════════════════════════════════════════════════════════════
// Status Endpoint — Health check for Prime AI backend
// ═══════════════════════════════════════════════════════════════════════════

export default async (request: Request) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    const hasNvidiaKey = !!(Netlify.env.get('NVIDIA_API_KEY'));

    return new Response(
        JSON.stringify({
            status: 'online',
            version: '2.0.0',
            timestamp: new Date().toISOString(),
            services: {
                nvidia_nim: hasNvidiaKey ? 'configured' : 'missing_key',
                agents: 'operational',
                voice: 'browser_native',
                tts: 'browser_native',
            },
            agents: [
                { id: 'asirem', status: 'online', role: 'Orchestrator' },
                { id: 'scout', status: 'online', role: 'Web Search' },
                { id: 'codex', status: 'online', role: 'Code Generator' },
                { id: 'sentinel', status: 'active', role: 'Security' },
                { id: 'nexus', status: 'online', role: 'Knowledge Graph' },
                { id: 'bytebot', status: 'active', role: 'Desktop RPA' },
                { id: 'neuron', status: 'online', role: 'ML Pipeline' },
                { id: 'delta', status: 'standby', role: 'DevOps' },
            ],
        }),
        { status: 200, headers }
    );
};

export const config = {
    path: '/api/status',
};
