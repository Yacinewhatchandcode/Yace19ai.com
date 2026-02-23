// ═══════════════════════════════════════════════════════════════════════════
// NVIDIA NIM Image/Video Generation Endpoint
// ═══════════════════════════════════════════════════════════════════════════

export default async (request: Request) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    const NVIDIA_API_KEY = Netlify.env.get('NVIDIA_API_KEY') || '';

    if (!NVIDIA_API_KEY) {
        return new Response(
            JSON.stringify({ success: false, error: 'NVIDIA API key not configured' }),
            { status: 500, headers }
        );
    }

    try {
        const body = await request.json();
        const { prompt } = body;

        if (!prompt) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing prompt' }),
                { status: 400, headers }
            );
        }

        const nvidiaRes = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${NVIDIA_API_KEY}`,
            },
            body: JSON.stringify({
                prompt: prompt
            }),
        });

        if (!nvidiaRes.ok) {
            const err = await nvidiaRes.text();
            return new Response(
                JSON.stringify({ success: false, error: `NVIDIA API returned ${nvidiaRes.status}: ${err}` }),
                { status: 502, headers }
            );
        }

        const data = await nvidiaRes.json();
        // NVIDIA returns base64 inside "image"
        const b64 = data.image || data.b64_json;

        return new Response(
            JSON.stringify({
                success: true,
                base64: b64,
                agent: 'Media-Synthesizer',
                backend: 'nvidia-nim-sd3',
            }),
            { status: 200, headers }
        );
    } catch (err: any) {
        return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers }
        );
    }
};

export const config = {
    path: '/api/image/generate',
};
