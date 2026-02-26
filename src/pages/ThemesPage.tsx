import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Sparkles, Clock, Check, Lock, Zap } from "lucide-react";
import { ALL_THEMES, COMING_SOON_THEMES, searchThemes } from "../themes";
import type { ThemeConfig } from "../themes";
import { injectData } from "../themes/types";

// ── Theme Card ─────────────────────────────────────────────────
function ThemeCard({ theme, isActive, onSelect }: { theme: ThemeConfig; isActive: boolean; onSelect: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onClick={onSelect}
            className={`relative cursor-pointer rounded-2xl border backdrop-blur-xl overflow-hidden group ${isActive
                ? "border-cyan-400/50 bg-cyan-400/5 ring-2 ring-cyan-400/20"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
                }`}
        >
            {/* Gradient accent top */}
            <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${theme.colorPrimary}, ${theme.colorAccent})` }}
            />

            <div className="p-6">
                {/* Icon + Name */}
                <div className="flex items-start gap-4 mb-4">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{ background: `${theme.colorPrimary}30`, border: `1px solid ${theme.colorPrimary}50` }}
                    >
                        {theme.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg leading-tight">{theme.name}</h3>
                        <p className="text-white/40 text-sm mt-0.5">{theme.nameFr}</p>
                    </div>
                </div>

                {/* Description */}
                <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">{theme.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs">
                        {theme.quickActions.length} Quick Actions
                    </span>
                    <span className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs">
                        {theme.dataFields.length} Data Fields
                    </span>
                    <span className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs">
                        {theme.agents.length} AI Agents
                    </span>
                </div>

                {/* CTA */}
                <button
                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{
                        background: `linear-gradient(135deg, ${theme.colorPrimary}, ${theme.colorAccent})`,
                        color: "#fff",
                    }}
                >
                    <Zap className="w-4 h-4" />
                    Select & Configure
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
}

// ── Coming Soon Card ───────────────────────────────────────────
function ComingSoonCard({ theme }: { theme: Partial<ThemeConfig> & { phase?: number; icon?: string } }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 opacity-60"
        >
            <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-xl">
                    {theme?.icon || ""}
                </div>
                <div>
                    <h3 className="text-white/60 font-semibold text-sm">{theme?.name || ""}</h3>
                    <p className="text-white/30 text-xs">{theme?.nameFr || ""}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 text-white/20 text-xs">
                <Clock className="w-3 h-3" />
                Phase {theme?.phase || "?"} — Coming Soon
            </div>
        </motion.div>
    );
}

// ── Theme Detail / Preview ─────────────────────────────────────
function ThemePreview({ theme, onClose, onSetup }: { theme: ThemeConfig; onClose: () => void; onSetup: () => void }) {
    const samplePrompt = theme.quickActions[0];
    const filledPrompt = samplePrompt ? injectData(samplePrompt.promptTemplate, theme.sampleData) : "";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 40 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/[0.08] bg-[#0a0f1a] shadow-2xl"
            >
                {/* Header */}
                <div
                    className="p-8 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${theme.colorPrimary}30, ${theme.colorAccent}10)` }}
                >
                    <div className="absolute top-0 right-0 text-[120px] opacity-10 leading-none">{theme.emoji}</div>
                    <div className="relative z-10">
                        <div className="text-5xl mb-4">{theme.emoji}</div>
                        <h2 className="text-3xl font-black text-white mb-2">{theme.name}</h2>
                        <p className="text-white/50 text-lg">{theme.tagline}</p>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Quick Actions Preview */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {theme.quickActions.map((action) => (
                                <div
                                    key={action.id}
                                    className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                                >
                                    <span className="text-lg mr-2">{action.icon}</span>
                                    <span className="text-white/70 text-sm">{action.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Agents */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-400" />
                            AI Agents Included
                        </h3>
                        <div className="space-y-2">
                            {theme.agents.map((agent) => (
                                <div
                                    key={agent.id}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                                >
                                    <span className="text-xl">{agent.icon}</span>
                                    <div>
                                        <div className="text-white/80 text-sm font-medium">{agent.name}</div>
                                        <div className="text-white/30 text-xs">{agent.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sample AI Output */}
                    {filledPrompt && (
                        <div>
                            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <Check className="w-5 h-5 text-emerald-400" />
                                Sample AI Prompt (with demo data)
                            </h3>
                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-white/50 text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                                {filledPrompt}
                            </div>
                        </div>
                    )}

                    {/* Data Fields Required */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">
                            📝 {theme.dataFields.filter((f) => f.required).length} required fields,{" "}
                            {theme.dataFields.length} total — Setup takes ~2 minutes
                        </h3>
                    </div>

                    {/* CTA */}
                    <div className="flex gap-4">
                        <button
                            onClick={onSetup}
                            className="flex-1 py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all hover:brightness-110"
                            style={{ background: `linear-gradient(135deg, ${theme.colorPrimary}, ${theme.colorAccent})` }}
                        >
                            <Zap className="w-5 h-5" />
                            Configure My {theme.name.split(" ")[0]}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-4 rounded-xl border border-white/[0.08] text-white/40 hover:text-white/60 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function ThemesPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null);
    const [activeThemeId, setActiveThemeId] = useState<string | null>(null);

    const filteredThemes = useMemo(() => {
        if (!searchQuery.trim()) return ALL_THEMES;
        return searchThemes(searchQuery);
    }, [searchQuery]);

    const filteredComingSoon = useMemo(() => {
        if (!COMING_SOON_THEMES || COMING_SOON_THEMES.length === 0) return [];
        if (!searchQuery.trim()) return COMING_SOON_THEMES as unknown as Partial<ThemeConfig>[];
        const q = searchQuery.toLowerCase();
        return (COMING_SOON_THEMES as unknown as Partial<ThemeConfig>[]).filter(
            (t) => (t.name?.toLowerCase().includes(q) || t.nameFr?.toLowerCase().includes(q))
        );
    }, [searchQuery]);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 relative z-10">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-sm mb-6">
                    <Sparkles className="w-4 h-4" />
                    20 Industries — Your AI, Your Profession
                </div>

                <h1 className="text-4xl md:text-6xl font-black mb-6">
                    <span className="text-white">What's Your </span>
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                        Profession
                    </span>
                    <span className="text-white">?</span>
                </h1>

                <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
                    Select your industry. Inject your data. Get an AI assistant that speaks
                    <strong className="text-white/60"> your language</strong>, knows{" "}
                    <strong className="text-white/60">your services</strong>, and works for{" "}
                    <strong className="text-white/60">your business</strong>.
                </p>

                {/* Search */}
                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search: baker, lawyer, doctor, fitness..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-cyan-400/30 focus:ring-2 focus:ring-cyan-400/10 transition-all"
                    />
                </div>
            </motion.div>

            {/* Active Themes */}
            {filteredThemes.length > 0 && (
                <div className="max-w-6xl mx-auto mb-16">
                    <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Available Now — {filteredThemes.length} Industries
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredThemes.map((theme) => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                                isActive={activeThemeId === theme.id}
                                onSelect={() => {
                                    setActiveThemeId(theme.id);
                                    navigate(`/build?theme=${theme.id}`);
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Coming Soon */}
            {filteredComingSoon.length > 0 && (
                <div className="max-w-6xl mx-auto mb-16">
                    <h2 className="text-white/40 font-bold text-xl mb-6 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Coming Soon — {filteredComingSoon.length} More Industries
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredComingSoon.map((theme) => (
                            <ComingSoonCard key={theme.id} theme={theme} />
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="max-w-2xl mx-auto text-center mt-20"
            >
                <div className="p-8 rounded-3xl border border-white/[0.06] bg-white/[0.02]">
                    <h3 className="text-white font-bold text-xl mb-3">Don't see your industry?</h3>
                    <p className="text-white/40 mb-6">
                        Tell us your profession and we'll build a custom theme — or use the{" "}
                        <strong className="text-cyan-400">Freelancer</strong> theme as a universal starting point.
                    </p>
                    <a
                        href="https://calendly.com/yacine-primeai/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold hover:bg-cyan-500/20 transition-colors"
                    >
                        Request Custom Theme
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </motion.div>

            {/* Theme Preview Modal — Detail view, secondary entry point */}
            <AnimatePresence>
                {selectedTheme && (
                    <ThemePreview
                        theme={selectedTheme}
                        onClose={() => setSelectedTheme(null)}
                        onSetup={() => {
                            setActiveThemeId(selectedTheme.id);
                            navigate(`/build?theme=${selectedTheme.id}`);
                            setSelectedTheme(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
