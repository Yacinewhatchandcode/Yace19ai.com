// ═══════════════════════════════════════════════════════════════
// PRIME AI — Sovereign Swarm ByteBot Integration Service
// Interacts with ByteBot Desktop Agent (VPS Port 9991)
// ═══════════════════════════════════════════════════════════════

const BYTEBOT_PROXY = "/api/bytebot";

export interface BytebotTaskPayload {
    task: string;
    url?: string;
}

class BytebotClient {
    private baseUrl: string;

    constructor(baseUrl: string = BYTEBOT_PROXY) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`, {
            headers: { "Content-Type": "application/json", ...options.headers as Record<string, string> },
            ...options,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            throw new Error(err.detail || `ByteBot error: ${res.status}`);
        }
        return res.json();
    }

    async health(): Promise<{ status: string }> {
        return this.request("/health");
    }

    async isOnline(): Promise<boolean> {
        try {
            const h = await this.health();
            return !!h.status;
        } catch {
            return false;
        }
    }

    async executeTask(payload: BytebotTaskPayload): Promise<{ success: boolean; result: any; screenshot_b64?: string }> {
        return this.request("/execute", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    async getScreenshot(): Promise<{ screenshot_b64: string }> {
        return this.request("/screenshot");
    }
}

export const bytebotService = new BytebotClient();
export default bytebotService;
