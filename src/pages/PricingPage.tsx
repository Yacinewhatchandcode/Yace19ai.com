import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Check,
    Zap,
    Crown,
    ArrowRight,
    Sparkles,
    Clock,
    Timer,
    Rocket,
    Code,
    Search,
    MessageSquare,
    Layers,
    BarChart3,
} from "lucide-react";

const API_BASE = "https://prime-ai.fr";

const TIME_PACKS = [
    { euros: 1, minutes: 5, label: "5 min", emoji: "⚡" },
    { euros: 5, minutes: 30, label: "30 min", emoji: "🔥" },
    { euros: 10, minutes: 60, label: "1 hour", emoji: "🚀" },
    { euros: 25, minutes: 180, label: "3 hours", emoji: "⭐" },
    { euros: 50, minutes: 480, label: "8 hours", emoji: "👑" },
];

// ═══════════════════════════════════════════════════════════════
// TRUTH-ONLY: Features that ACTUALLY work in production
// ═══════════════════════════════════════════════════════════════
const LIVE_FEATURES = [
    { icon: MessageSquare, label: "AI Chat", desc: "Multi-model (Groq, OpenRouter)", status: "live" },
    { icon: Search, label: "Deep Search", desc: "Web search + structured results", status: "live" },
    { icon: Layers, label: "Agent Fleet", desc: "18 specialized AI agents", status: "live" },
    { icon: Code, label: "Self-Coding Engine", desc: "Code generation interface", status: "beta" },
    { icon: BarChart3, label: "Analytics", desc: "Real-time visitor tracking", status: "live" },
    { icon: Rocket, label: "Sovereign OS", desc: "3D interactive workspace", status: "beta" },
];

const COMING_SOON = [
    { label: "Image Generation", desc: "Flux, DALL-E, Stable Diffusion", eta: "March 2026" },
    { label: "Video Generation", desc: "Wan 2.2 on sovereign GPU", eta: "March 2026" },
    { label: "Music Generation", desc: "Suno AI integration", eta: "Q2 2026" },
    { label: "Voice Synthesis", desc: "ElevenLabs, OpenVoice", eta: "Q2 2026" },
    { label: "3D Model Generation", desc: "TripoSR, Meshy", eta: "Q2 2026" },
    { label: "Public API", desc: "REST + WebSocket", eta: "Q2 2026" },
];

const TIERS = [
    {
        id: "free",
        name: "Free",
        desc: "Explore the platform. No card needed.",
        price: "€0",
        features: [
            "AI Chat (free models)",
            "Deep Search (3/day)",
            "Sovereign OS demo",
            "Analytics dashboard",
        ],
        icon: Sparkles,
        gradient: "from-gray-500 to-gray-700",
        cta: "register",
    },
    {
        id: "time-access",
        name: "Early Access",
        desc: "Buy time to fuel development. Full access to all live features.",
        price: "from €1",
        features: [
            "All live AI models",
            "Deep Search unlimited",
            "18 AI Agents",
            "Self-Coding Engine (beta)",
            "Priority access to new features",
            "From €1 = 5 minutes",
        ],
        icon: Timer,
        gradient: "from-red-500 to-orange-500",
        cta: "time",
        popular: true,
    },
    {
        id: "build",
        name: "Build Together",
        desc: "Custom AI solution. Let's talk about your idea.",
        price: "custom",
        features: [
            "Everything in Early Access",
            "Custom integrations",
            "Dedicated setup call",
            "Priority feature requests",
            "Direct founder access",
        ],
        icon: Crown,
        gradient: "from-red-600 to-red-800",
        cta: "book",
    },
];

export default function PricingPage() {
    const [isProcessing, setIsProcessing] = useState<number | null>(null);
    const [capacity, setCapacity] = useState({
        active: 0,
        max: 50,
        available: 50,
        status: "open",
    });

    useEffect(() => {
        fetch(`${API_BASE}/api/stripe/time-access`)
            .then((r) => r.json())
            .then((data) => {
                if (data.capacity) setCapacity(data.capacity);
            })
            .catch(() => { });
    }, []);

    const handleBuyTime = async (euros: number) => {
        setIsProcessing(euros);
        try {
            const response = await fetch(`${API_BASE}/api/stripe/time-access`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: euros }),
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || "Payment failed");
            }
        } catch (error) {
            console.error("Time access error:", error);
            alert("Error. Please try again.");
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
        >
            {/* Hero */}
            <div className="max-w-7xl mx-auto pt-12 pb-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                    <Rocket className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-300">
                        Early Access — Help us build the future
                    </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    Buy{" "}
                    <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                        Time
                    </span>
                </h1>

                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
                    Starting from €1. Access all live AI features for the
                    duration you choose.
                </p>

                <p className="text-sm text-gray-500 max-w-xl mx-auto mb-12">
                    This is a launch phase. Your purchase funds development of new features.
                    Every euro goes directly into building the platform you want.
                </p>
            </div>

            {/* ═══ TIME PACKS ═══ */}
            <div className="max-w-4xl mx-auto px-4 pb-12">
                <h2 className="text-2xl font-bold text-white text-center mb-4">
                    Choose your duration
                </h2>

                {/* Capacity indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span
                        className={`w-2 h-2 rounded-full ${capacity.status === "open"
                            ? "bg-green-400 animate-pulse"
                            : capacity.status === "limited"
                                ? "bg-yellow-400 animate-pulse"
                                : "bg-red-500"
                            }`}
                    />
                    <span className="text-xs text-gray-500">
                        {capacity.status === "full"
                            ? "Platform at capacity — try again soon"
                            : `${capacity.active}/${capacity.max} active sessions`}
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {TIME_PACKS.map((pack) => (
                        <button
                            key={pack.euros}
                            onClick={() => handleBuyTime(pack.euros)}
                            disabled={
                                isProcessing !== null || capacity.status === "full"
                            }
                            className={`
                group relative flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-200 cursor-pointer
                ${isProcessing === pack.euros
                                    ? "border-red-500/40 bg-red-500/10 scale-95"
                                    : "border-white/[0.08] bg-white/[0.02] hover:border-red-500/40 hover:bg-red-500/[0.06] hover:scale-105"
                                }
              `}
                        >
                            <span className="text-2xl">{pack.emoji}</span>
                            <span className="text-2xl font-bold text-white">
                                €{pack.euros}
                            </span>
                            <div className="flex items-center gap-1 text-white/50 text-sm">
                                <Clock className="w-3 h-3" />
                                <span>{pack.label}</span>
                            </div>
                            {isProcessing === pack.euros && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-sm">
                                    <div className="animate-spin w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <p className="text-center text-gray-500 text-xs mt-4">
                    Secure payment via Stripe • Visa, Mastercard, Apple Pay, Google Pay
                </p>
            </div>

            {/* ═══ WHAT'S LIVE RIGHT NOW ═══ */}
            <div className="max-w-5xl mx-auto px-4 pb-8">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-8">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <h3 className="text-xl font-bold text-white">
                            What's Live Right Now
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {LIVE_FEATURES.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                                >
                                    <Icon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-white text-sm font-medium flex items-center gap-2">
                                            {item.label}
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold ${item.status === 'live'
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="text-white/30 text-[11px]">{item.desc}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ═══ WHAT'S COMING ═══ */}
            <div className="max-w-5xl mx-auto px-4 pb-12">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
                    <h3 className="text-lg font-bold text-white/60 mb-6 text-center">
                        🚧 Coming Soon — Your purchase accelerates these features
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {COMING_SOON.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/[0.04] opacity-60"
                            >
                                <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-3 h-3 text-white/30" />
                                </div>
                                <div>
                                    <div className="text-white/50 text-sm font-medium">
                                        {item.label}
                                    </div>
                                    <div className="text-white/20 text-[10px]">
                                        {item.desc} • <span className="text-amber-400/60">{item.eta}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ 3 TIERS ═══ */}
            <div className="max-w-7xl mx-auto px-4 pb-16">
                <div className="grid md:grid-cols-3 gap-6">
                    {TIERS.map((tier) => {
                        const Icon = tier.icon;
                        return (
                            <div
                                key={tier.id}
                                className={`relative rounded-2xl overflow-hidden transition-transform ${tier.popular
                                    ? "ring-2 ring-red-500 md:scale-105 z-10"
                                    : "ring-1 ring-white/[0.06]"
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 to-red-400" />
                                )}

                                <div className="bg-white/[0.02] backdrop-blur-xl p-6 h-full flex flex-col">
                                    {tier.popular && (
                                        <span className="inline-block px-3 py-1 text-xs font-medium text-red-300 bg-red-500/20 rounded-full mb-4 self-start">
                                            Early Access
                                        </span>
                                    )}

                                    <div
                                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-4`}
                                    >
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {tier.name}
                                    </h3>
                                    <p className="text-gray-400 mb-6 text-sm">{tier.desc}</p>

                                    <div className="flex items-baseline gap-1 mb-4">
                                        {tier.id === "build" ? (
                                            <span className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                                                Custom
                                            </span>
                                        ) : tier.id === "time-access" ? (
                                            <span className="text-3xl font-bold text-white">
                                                From €1
                                            </span>
                                        ) : (
                                            <span className="text-3xl font-bold text-green-400">
                                                Free
                                            </span>
                                        )}
                                    </div>

                                    {tier.cta === "book" ? (
                                        <a
                                            href="https://calendly.com/info-primeai/30min"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mt-auto bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-600/20"
                                        >
                                            Book a Call
                                            <ArrowRight className="w-4 h-4" />
                                        </a>
                                    ) : tier.cta === "time" ? (
                                        <button
                                            onClick={() => handleBuyTime(1)}
                                            disabled={isProcessing !== null}
                                            className="w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mt-auto bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20 cursor-pointer"
                                        >
                                            {isProcessing ? "Loading..." : "Start for €1"}
                                            <Zap className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <a
                                            href={`${API_BASE}/auth/register`}
                                            className="w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mt-auto bg-white/10 text-white hover:bg-white/20"
                                        >
                                            Start Free
                                            <ArrowRight className="w-4 h-4" />
                                        </a>
                                    )}

                                    <ul className="mt-8 space-y-3">
                                        {tier.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                                <span className="text-gray-300 text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Support — Solo Builder Transparency */}
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="relative rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-900/10 to-blue-800/5 p-8 md:p-10 text-center">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 mb-6">
                        <span className="text-blue-400 text-sm font-medium tracking-wide">
                            💙 Support the Project
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">
                        Believe in PRIME?
                    </h2>
                    <p className="text-gray-400 text-sm max-w-lg mx-auto mb-2">
                        I'm a solo builder creating AI tools for everyone. This is a live launch —
                        I ship new features every week.
                    </p>
                    <p className="text-gray-500 text-xs max-w-lg mx-auto mb-6">
                        Your early support directly funds GPU compute, API costs, and new feature development.
                        Early backers will always keep their founding rate.
                    </p>
                    <a
                        href="https://revolut.me/yacinen09"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                    >
                        Support via Revolut
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {/* CTA */}
            <div className="max-w-4xl mx-auto px-4 pb-20">
                <div className="bg-gradient-to-r from-red-900/20 to-red-800/10 rounded-2xl p-8 md:p-12 text-center border border-red-500/20">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Need a custom AI solution?
                    </h2>
                    <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                        Let's build together. Book a free 30-minute call to discuss your project.
                    </p>
                    <a
                        href="https://calendly.com/info-primeai/30min"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Book a Call
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
