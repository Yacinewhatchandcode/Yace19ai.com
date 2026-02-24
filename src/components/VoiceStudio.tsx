import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic, Play, Pause, Volume2, VolumeX,
    Loader2, AlertCircle, Settings2,
    Download, RefreshCw, Sparkles, Radio
} from "lucide-react";
import { voicebox } from "../services/voicebox";
import type { VoiceProfile, GenerationResponse, HealthStatus } from "../services/voicebox";

// ── Waveform Visualizer ────────────────────────────────────────
function WaveformBar({ active }: { active: boolean }) {
    return (
        <div className="flex items-end gap-[2px] h-8">
            {Array.from({ length: 24 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-gradient-to-t from-cyan-500 to-violet-500"
                    animate={{
                        height: active
                            ? [4, 8 + Math.random() * 24, 4 + Math.random() * 12]
                            : 4,
                    }}
                    transition={{
                        duration: 0.4 + Math.random() * 0.3,
                        repeat: active ? Infinity : 0,
                        repeatType: "reverse",
                    }}
                />
            ))}
        </div>
    );
}

// ── Status Badge ───────────────────────────────────────────────
function StatusBadge({ status }: { status: "offline" | "online" | "generating" | "ready" }) {
    const config = {
        offline: { label: "Voicebox Offline", color: "bg-red-500/20 text-red-400 border-red-500/20", dot: "bg-red-400" },
        online: { label: "Voicebox Connected", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400 animate-pulse" },
        generating: { label: "Generating...", color: "bg-amber-500/20 text-amber-400 border-amber-500/20", dot: "bg-amber-400 animate-pulse" },
        ready: { label: "Audio Ready", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/20", dot: "bg-cyan-400" },
    };
    const c = config[status];
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${c.color}`}>
            <div className={`w-2 h-2 rounded-full ${c.dot}`} />
            {c.label}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// VOICE STUDIO COMPONENT
// ═══════════════════════════════════════════════════════════════
interface VoiceStudioProps {
    themeId?: string;
    businessName?: string;
    defaultLanguage?: string;
    onClose?: () => void;
}

export default function VoiceStudio({
    themeId,
    businessName = "Prime AI",
    defaultLanguage = "en",
    onClose,
}: VoiceStudioProps) {
    // ── State ──────────────────────────────────────────────
    const [serverStatus, setServerStatus] = useState<"offline" | "online" | "generating" | "ready">("offline");
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<string>("");
    const [text, setText] = useState("");
    const [language, setLanguage] = useState(defaultLanguage);
    const [instruct, setInstruct] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [generation, setGeneration] = useState<GenerationResponse | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // ── Check Server Health ────────────────────────────────
    const checkHealth = useCallback(async () => {
        try {
            const h = await voicebox.health();
            setHealth(h);
            setServerStatus("online");
            return true;
        } catch {
            setServerStatus("offline");
            setHealth(null);
            return false;
        }
    }, []);

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 15000);
        return () => clearInterval(interval);
    }, [checkHealth]);

    // ── Load Profiles ──────────────────────────────────────
    useEffect(() => {
        if (serverStatus !== "offline") {
            voicebox.listProfiles().then((p) => {
                setProfiles(p);
                if (p.length > 0 && !selectedProfile) {
                    setSelectedProfile(p[0].id);
                }
            }).catch(() => { });
        }
    }, [serverStatus, selectedProfile]);

    // ── Generate Speech ────────────────────────────────────
    const handleGenerate = async () => {
        if (!text.trim() || !selectedProfile) return;
        setError(null);
        setServerStatus("generating");
        setGeneration(null);
        setAudioUrl(null);

        try {
            const result = await voicebox.generateAndPlay({
                profile_id: selectedProfile,
                text: text.trim(),
                language,
                instruct: instruct || undefined,
            });
            setGeneration(result.generation);
            setAudioUrl(result.audioUrl);
            setServerStatus("ready");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Generation failed";
            setError(message);
            setServerStatus("online");
        }
    };

    // ── Audio Playback ─────────────────────────────────────
    const togglePlayback = () => {
        if (!audioRef.current || !audioUrl) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.src = audioUrl;
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleAudioEnd = () => setIsPlaying(false);

    // ── Create Theme Voice ─────────────────────────────────
    const handleCreateThemeVoice = async () => {
        if (!themeId) return;
        setError(null);
        try {
            const profile = await voicebox.createThemeVoice(themeId, businessName, language);
            setProfiles((prev) => [...prev, profile]);
            setSelectedProfile(profile.id);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to create voice profile";
            setError(message);
        }
    };

    // ── Languages ──────────────────────────────────────────
    const LANGUAGES = [
        { code: "en", label: "English" },
        { code: "fr", label: "Français" },
        { code: "de", label: "Deutsch" },
        { code: "es", label: "Español" },
        { code: "it", label: "Italiano" },
        { code: "pt", label: "Português" },
        { code: "zh", label: "中文" },
        { code: "ja", label: "日本語" },
        { code: "ko", label: "한국어" },
        { code: "ru", label: "Русский" },
    ];

    // ═══════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════
    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="rounded-3xl border border-white/[0.06] bg-[#080c16]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center">
                            <Radio className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Voice Studio</h3>
                            <p className="text-white/30 text-xs">Powered by Voicebox — Local AI Voice Synthesis</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={serverStatus} />
                        {onClose && (
                            <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors text-xl leading-none">×</button>
                        )}
                    </div>
                </div>

                {/* Offline State */}
                {serverStatus === "offline" && (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <VolumeX className="w-8 h-8 text-red-400" />
                        </div>
                        <h4 className="text-white font-semibold mb-2">Voicebox Server Offline</h4>
                        <p className="text-white/40 text-sm mb-4">
                            Start the Voicebox server to enable voice synthesis.
                        </p>
                        <code className="block bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-cyan-400 text-xs text-left">
                            cd voicebox && source .venv/bin/activate<br />
                            python -m uvicorn backend.main:app --port 17493
                        </code>
                        <button
                            onClick={checkHealth}
                            className="mt-4 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.08] transition-colors flex items-center gap-2 mx-auto"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry Connection
                        </button>
                    </div>
                )}

                {/* Online State */}
                {serverStatus !== "offline" && (
                    <div className="p-6 space-y-5">
                        {/* Profile Selector */}
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Voice Profile</label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedProfile}
                                    onChange={(e) => setSelectedProfile(e.target.value)}
                                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm appearance-none focus:outline-none focus:border-cyan-400/30"
                                >
                                    {profiles.length === 0 && <option value="">No profiles — create one</option>}
                                    {profiles.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.language})</option>
                                    ))}
                                </select>
                                {themeId && (
                                    <button
                                        onClick={handleCreateThemeVoice}
                                        className="px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors whitespace-nowrap"
                                    >
                                        <Sparkles className="w-4 h-4 inline mr-1" />
                                        + Theme Voice
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Text Input */}
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                                Text to Speak
                            </label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter the text you want to convert to speech..."
                                rows={4}
                                maxLength={5000}
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 resize-none focus:outline-none focus:border-cyan-400/30 focus:ring-2 focus:ring-cyan-400/10 transition-all"
                            />
                            <div className="flex justify-between mt-1">
                                <span className="text-white/20 text-xs">{text.length}/5000</span>
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="text-white/30 hover:text-white/60 transition-colors text-xs flex items-center gap-1"
                                >
                                    <Settings2 className="w-3 h-3" />
                                    {showSettings ? "Hide" : "Show"} Settings
                                </button>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        <AnimatePresence>
                            {showSettings && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Language</label>
                                            <select
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-cyan-400/30"
                                            >
                                                {LANGUAGES.map((l) => (
                                                    <option key={l.code} value={l.code}>{l.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Voice Instruction</label>
                                            <input
                                                type="text"
                                                value={instruct}
                                                onChange={(e) => setInstruct(e.target.value)}
                                                placeholder="e.g. Speak warmly and slowly"
                                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-cyan-400/30"
                                            />
                                        </div>
                                    </div>
                                    {health && (
                                        <div className="mt-3 flex gap-3 text-xs text-white/20">
                                            <span>Backend: {health.backend_type}</span>
                                            <span>GPU: {health.gpu_type || "None"}</span>
                                            {health.model_size && <span>Model: {health.model_size}</span>}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={!text.trim() || !selectedProfile || serverStatus === "generating"}
                            className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 active:scale-[0.98]"
                        >
                            {serverStatus === "generating" ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating Speech...
                                </>
                            ) : (
                                <>
                                    <Volume2 className="w-5 h-5" />
                                    Generate Voice
                                </>
                            )}
                        </button>

                        {/* Waveform / Generating */}
                        {serverStatus === "generating" && (
                            <div className="flex justify-center py-2">
                                <WaveformBar active />
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-400 text-sm font-medium">Generation Error</p>
                                    <p className="text-red-400/60 text-xs mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Audio Player */}
                        {audioUrl && generation && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Play/Pause */}
                                    <button
                                        onClick={togglePlayback}
                                        className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-500/30 transition-colors"
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-5 h-5 text-cyan-400" />
                                        ) : (
                                            <Play className="w-5 h-5 text-cyan-400 ml-0.5" />
                                        )}
                                    </button>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white/70 text-sm truncate">{generation.text}</p>
                                        <p className="text-white/30 text-xs mt-1">
                                            {generation.duration.toFixed(1)}s · {generation.language.toUpperCase()}
                                        </p>
                                    </div>

                                    {/* Waveform */}
                                    <WaveformBar active={isPlaying} />

                                    {/* Download */}
                                    <a
                                        href={audioUrl}
                                        download={`voicebox-${generation.id}.wav`}
                                        className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                                    >
                                        <Download className="w-4 h-4 text-white/40" />
                                    </a>
                                </div>

                                <audio ref={audioRef} onEnded={handleAudioEnd} className="hidden" />
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-3 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="text-white/15 text-xs">
                        Voicebox v0.1.13 · Local-first · No cloud
                    </span>
                    <span className="text-white/15 text-xs flex items-center gap-1">
                        <Mic className="w-3 h-3" />
                        {profiles.length} voice{profiles.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>
        </div>
    );
}
