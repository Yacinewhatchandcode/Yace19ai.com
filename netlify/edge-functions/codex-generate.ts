// ═══════════════════════════════════════════════════════════════════════════
// Code Generation Endpoint — Uses NVIDIA NIM for self-coding with preview
// Generates code artifacts and returns them with a preview sandbox URL
// ═══════════════════════════════════════════════════════════════════════════

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const CODE_SYSTEM_PROMPT = `You are Codex, the Prime AI Code Generation Agent. You generate production-ready code.

RULES:
1. When asked to generate code, output ONLY valid, runnable code
2. Always wrap the code in a <code lang="LANGUAGE"> ... </code> block
3. For web UIs, generate self-contained HTML with inline CSS and JS
4. For Python, generate standalone scripts
5. For data files, generate valid JSON/CSV
6. Keep code clean, well-commented, and functional
7. If generating HTML, make it visually premium (dark theme, glassmorphism, animations)
8. After the code block, provide a brief 1-line description in a <description> tag

EXAMPLE OUTPUT:
<code lang="html">
<!DOCTYPE html>
<html>...</html>
</code>
<description>Interactive dashboard with live data visualization</description>`;

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
        const { prompt, lang = 'en', outputFormat = 'html' } = body;

        if (!prompt) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing prompt' }),
                { status: 400, headers }
            );
        }

        const userMessage = `Generate ${outputFormat} code for: ${prompt}. Output format should be ${outputFormat}. ${lang === 'fr' ? 'Respond in French for comments.' : ''}`;

        const nvidiaRes = await fetch(NVIDIA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${NVIDIA_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'meta/llama-3.1-70b-instruct',
                messages: [
                    { role: 'system', content: CODE_SYSTEM_PROMPT },
                    { role: 'user', content: userMessage },
                ],
                temperature: 0.6,
                max_tokens: 4096,
            }),
        });

        if (!nvidiaRes.ok) {
            return new Response(
                JSON.stringify({ success: false, error: `NVIDIA API ${nvidiaRes.status}` }),
                { status: 502, headers }
            );
        }

        const data = await nvidiaRes.json();
        const rawContent = data.choices?.[0]?.message?.content || '';

        // Extract code block
        const codeMatch = rawContent.match(/<code\s+lang="([^"]+)">([\s\S]*?)<\/code>/);
        const descMatch = rawContent.match(/<description>([\s\S]*?)<\/description>/);

        const code = codeMatch ? codeMatch[2].trim() : rawContent;
        const detectedLang = codeMatch ? codeMatch[1] : outputFormat;
        const description = descMatch ? descMatch[1].trim() : 'Generated code artifact';

        // For HTML output, create a data URI for iframe preview
        let previewUrl = null;
        if (detectedLang === 'html' || outputFormat === 'html') {
            previewUrl = `data:text/html;charset=utf-8,${encodeURIComponent(code)}`;
        }

        return new Response(
            JSON.stringify({
                success: true,
                code,
                language: detectedLang,
                description,
                previewUrl,
                agent: 'codex',
                backend: 'nvidia-nim',
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
    path: '/api/codex/generate',
};
