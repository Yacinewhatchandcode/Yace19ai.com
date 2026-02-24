// ═══════════════════════════════════════════════════════════════
// PRIME AI — Voicebox Integration Service
// Local-first voice synthesis via Voicebox API
// ═══════════════════════════════════════════════════════════════

// In production (Netlify), or local dev (Vite), we proxy /api/voicebox 
// to avoid Mixed Content (HTTPS -> HTTP) and CORS blocks.
const VOICEBOX_BASE = "/api/voicebox";

// ── Types ──────────────────────────────────────────────────────
export interface VoiceProfile {
    id: string;
    name: string;
    description: string | null;
    language: string;
    avatar_path: string | null;
    created_at: string;
    updated_at: string;
}

export interface GenerationRequest {
    profile_id: string;
    text: string;
    language?: string;       // en, fr, de, es, etc.
    seed?: number;
    model_size?: "0.6B" | "1.7B";
    instruct?: string;      // voice instruction (tone, emotion)
}

export interface GenerationResponse {
    id: string;
    profile_id: string;
    text: string;
    language: string;
    audio_path: string;
    duration: number;
    seed: number | null;
    instruct: string | null;
    created_at: string;
}

export interface HealthStatus {
    status: string;
    model_loaded: boolean;
    model_downloaded: boolean | null;
    model_size: string | null;
    gpu_available: boolean;
    gpu_type: string | null;
    vram_used_mb: number | null;
    backend_type: string | null;
}

// ── API Client ─────────────────────────────────────────────────
class VoiceboxClient {
    private baseUrl: string;

    constructor(baseUrl: string = VOICEBOX_BASE) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`, {
            headers: { "Content-Type": "application/json", ...options.headers as Record<string, string> },
            ...options,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            throw new Error(err.detail || `Voicebox API error: ${res.status}`);
        }
        return res.json();
    }

    // ── Health ──────────────────────────────────────────────
    async health(): Promise<HealthStatus> {
        return this.request<HealthStatus>("/health");
    }

    async isOnline(): Promise<boolean> {
        try {
            const h = await this.health();
            return h.status === "healthy";
        } catch {
            return false;
        }
    }

    // ── Profiles ────────────────────────────────────────────
    async listProfiles(): Promise<VoiceProfile[]> {
        return this.request<VoiceProfile[]>("/profiles");
    }

    async createProfile(name: string, language: string = "en", description?: string): Promise<VoiceProfile> {
        return this.request<VoiceProfile>("/profiles", {
            method: "POST",
            body: JSON.stringify({ name, language, description }),
        });
    }

    async deleteProfile(profileId: string): Promise<void> {
        await this.request(`/profiles/${profileId}`, { method: "DELETE" });
    }

    async addSample(profileId: string, audioFile: File, referenceText: string): Promise<unknown> {
        const form = new FormData();
        form.append("file", audioFile);
        form.append("reference_text", referenceText);
        const res = await fetch(`${this.baseUrl}/profiles/${profileId}/samples`, {
            method: "POST",
            body: form,
        });
        if (!res.ok) throw new Error(`Failed to add sample: ${res.statusText}`);
        return res.json();
    }

    // ── Generation ──────────────────────────────────────────
    async generate(req: GenerationRequest): Promise<GenerationResponse> {
        return this.request<GenerationResponse>("/generate", {
            method: "POST",
            body: JSON.stringify(req),
        });
    }

    async streamSpeech(req: GenerationRequest): Promise<Blob> {
        const res = await fetch(`${this.baseUrl}/generate/stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
        });
        if (!res.ok) throw new Error(`Stream error: ${res.statusText}`);
        return res.blob();
    }

    // ── Audio Playback ──────────────────────────────────────
    async generateAndPlay(req: GenerationRequest): Promise<{ generation: GenerationResponse; audioUrl: string }> {
        const generation = await this.generate(req);
        // The audio_path is a local file path; serve it through the API
        const audioUrl = `${this.baseUrl}/history/${generation.id}/export-audio`;
        return { generation, audioUrl };
    }

    // ── Transcription ───────────────────────────────────────
    async transcribe(audioFile: File, language?: string): Promise<{ text: string; duration: number }> {
        const form = new FormData();
        form.append("file", audioFile);
        if (language) form.append("language", language);
        const res = await fetch(`${this.baseUrl}/transcribe`, {
            method: "POST",
            body: form,
        });
        if (!res.ok) throw new Error(`Transcription error: ${res.statusText}`);
        return res.json();
    }

    // ── History ─────────────────────────────────────────────
    async listHistory(profileId?: string, limit: number = 20): Promise<{ items: GenerationResponse[]; total: number }> {
        const params = new URLSearchParams();
        if (profileId) params.set("profile_id", profileId);
        params.set("limit", String(limit));
        return this.request(`/history?${params}`);
    }

    // ── Industry Theme Voice Presets ────────────────────────

    /**
     * Create a voice profile pre-configured for an industry theme.
     * Each theme gets a named profile with an instruction prompt
     * tailored to its professional context.
     */
    async createThemeVoice(
        themeId: string,
        businessName: string,
        language: string = "en"
    ): Promise<VoiceProfile> {
        const THEME_VOICES: Record<string, { name: string; desc: string }> = {
            legal: { name: "Legal Counsel Voice", desc: "Professional, authoritative tone for legal communications" },
            medical: { name: "Healthcare Voice", desc: "Warm, reassuring tone for patient communications" },
            restaurant: { name: "Restaurant Host Voice", desc: "Friendly, inviting tone for hospitality" },
            "real-estate": { name: "Real Estate Agent Voice", desc: "Confident, persuasive tone for property sales" },
            ecommerce: { name: "E-Commerce Voice", desc: "Engaging, upbeat tone for retail" },
            accounting: { name: "Finance Advisor Voice", desc: "Clear, trustworthy tone for financial guidance" },
        };

        const preset = THEME_VOICES[themeId] || { name: `${businessName} Voice`, desc: `Voice for ${businessName}` };
        return this.createProfile(`${preset.name} — ${businessName}`, language, preset.desc);
    }
}

// ── Singleton Export ────────────────────────────────────────────
export const voicebox = new VoiceboxClient();
export default voicebox;
