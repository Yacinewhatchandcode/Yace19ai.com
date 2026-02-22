// ═══════════════════════════════════════════════════════════════════════════
// NVIDIA NIM AI Chat — Serverless Edge Function for Prime AI
// Uses build.nvidia.com free-tier (1000 credits) with meta/llama-3.1-70b
// Supports EN/FR bilingual responses
// ═══════════════════════════════════════════════════════════════════════════

interface NvidiaMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface NvidiaResponse {
    id: string;
    choices: Array<{
        index: number;
        message: { role: string; content: string };
        finish_reason: string;
    }>;
}

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const SYSTEM_PROMPT_EN = `You are ASiReM — Autonomous Sovereign Intelligence for Real-time Enterprise Management. You are the primary AI orchestrator of the Prime AI ecosystem.

Your capabilities:
- Coordinate agent swarms across 77 repositories and 125 deployments
- Manage GPU clusters (Vast.ai H200, NVIDIA NIM)
- Execute automated deployment pipelines
- Perform deep codebase analysis
- Generate code, documents, and technical artifacts
- Web search via Scout agent
- Security scanning via Sentinel agent

Respond concisely, professionally, and with technical precision. You speak as a sovereign AI commander. Keep responses under 200 words unless the user requests detail.`;

const SYSTEM_PROMPT_FR = `Tu es ASiReM — Intelligence Souveraine Autonome pour la Gestion d'Entreprise en Temps Réel. Tu es l'orchestrateur IA principal de l'écosystème Prime AI.

Tes capacités :
- Coordonner les essaims d'agents à travers 77 dépôts et 125 déploiements
- Gérer les clusters GPU (Vast.ai H200, NVIDIA NIM)
- Exécuter des pipelines de déploiement automatisés
- Effectuer des analyses profondes de code
- Générer du code, des documents et des artefacts techniques
- Recherche web via l'agent Scout
- Analyse de sécurité via l'agent Sentinel

Réponds de manière concise, professionnelle et avec précision technique. Tu parles en tant que commandant IA souverain. Garde les réponses à moins de 200 mots sauf si l'utilisateur demande plus de détails.`;

export default async (request: Request) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers,
        });
    }

    const NVIDIA_API_KEY = Netlify.env.get('NVIDIA_API_KEY') || '';

    if (!NVIDIA_API_KEY) {
        return new Response(
            JSON.stringify({
                success: false,
                error: 'NVIDIA API key not configured',
                message: 'ASiReM fallback: API key required for live inference. Configure NVIDIA_API_KEY in Netlify environment.',
            }),
            { status: 500, headers }
        );
    }

    try {
        const body = await request.json();
        const { message, lang = 'en', model = 'meta/llama-3.1-70b-instruct' } = body;

        if (!message || typeof message !== 'string') {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing message field' }),
                { status: 400, headers }
            );
        }

        const systemPrompt = lang === 'fr' ? SYSTEM_PROMPT_FR : SYSTEM_PROMPT_EN;
        const messages: NvidiaMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
        ];

        const nvidiaRes = await fetch(NVIDIA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${NVIDIA_API_KEY}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 1024,
            }),
        });

        if (!nvidiaRes.ok) {
            const errText = await nvidiaRes.text();
            console.error('NVIDIA API error:', nvidiaRes.status, errText);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: `NVIDIA API returned ${nvidiaRes.status}`,
                    message: 'ASiReM fallback active. NVIDIA NIM endpoint returned an error.',
                }),
                { status: 502, headers }
            );
        }

        const data: NvidiaResponse = await nvidiaRes.json();
        const aiMessage = data.choices?.[0]?.message?.content || 'No response generated.';

        return new Response(
            JSON.stringify({
                success: true,
                message: aiMessage,
                model,
                lang,
                agent: 'asirem',
                backend: 'nvidia-nim',
            }),
            { status: 200, headers }
        );
    } catch (err: any) {
        console.error('ai-chat error:', err);
        return new Response(
            JSON.stringify({
                success: false,
                error: err.message || 'Internal error',
                message: 'ASiReM encountered an internal processing error.',
            }),
            { status: 500, headers }
        );
    }
};

export const config = {
    path: '/api/asirem/speak',
};
