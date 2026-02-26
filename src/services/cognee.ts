// ═══════════════════════════════════════════════════════════════
// PRIME AI — Sovereign Swarm Memory Integration Service
// Interacts with the Cognee Graph Data Lake natively.
// ═══════════════════════════════════════════════════════════════

const COGNEE_PROXY = "/api/cognee";

export interface DataIngestPayload {
    user_id: string;
    text_content: string;
}

export interface QueryPayload {
    user_id: string;
    query_text: string;
}

class CogneeSwarmClient {
    private baseUrl: string;

    constructor(baseUrl: string = COGNEE_PROXY) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`, {
            headers: { "Content-Type": "application/json", ...options.headers as Record<string, string> },
            ...options,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            throw new Error(err.detail || `Cognee Swarm error: ${res.status}`);
        }
        return res.json();
    }

    async health(): Promise<{ status: string; version: string }> {
        return this.request("/health");
    }

    async isOnline(): Promise<boolean> {
        try {
            const h = await this.health();
            return h.status.includes("Cognee");
        } catch {
            return false;
        }
    }

    async ingestMemory(payload: DataIngestPayload): Promise<{ status: string; message: string }> {
        return this.request("/ingest", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    async queryMemory(payload: QueryPayload): Promise<{ status: string; insights: any }> {
        return this.request("/query", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    /**
     * Utility method: Silently inject an event (e.g. Analytics telemetry, code generated) 
     * into the global Sovereign Graph.
     */
    async logEvent(eventType: string, details: Record<string, any>) {
        const timestamp = new Date().toISOString();
        const memoryContent = `[SYSTEM TELEMETRY] Event: ${eventType} | Time: ${timestamp} | Details: ${JSON.stringify(details)}`;

        try {
            await this.ingestMemory({
                user_id: "global_autonomous_system",
                text_content: memoryContent,
            });
            console.log(`🧠 [Cognee Injection] Successfully logged ${eventType}`);
        } catch (e) {
            console.warn(`🧠 [Cognee Injection] Failed to upload telemetry: ${e}`);
        }
    }
}

export const cogneeService = new CogneeSwarmClient();
export default cogneeService;
