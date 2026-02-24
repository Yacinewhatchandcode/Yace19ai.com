import VoiceStudio from "../components/VoiceStudio";
import { motion } from "framer-motion";
import { Radio, Shield, Cpu, Zap } from "lucide-react";

export default function VoicePage() {
    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 relative z-10">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-4xl mx-auto mb-12"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-sm mb-6">
                    <Radio className="w-4 h-4" />
                    Powered by Voicebox — 100% Local
                </div>

                <h1 className="text-4xl md:text-6xl font-black mb-6">
                    <span className="text-white">AI </span>
                    <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                        Voice Studio
                    </span>
                </h1>

                <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
                    Clone voices. Generate speech. Build voice-powered content.
                    <br />
                    <strong className="text-white/60">Running entirely on your machine</strong> — no cloud, no limits, no subscription.
                </p>

                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {[
                        { icon: Shield, label: "100% Private", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
                        { icon: Cpu, label: "MLX Metal Acceleration", color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5" },
                        { icon: Zap, label: "10 Languages", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
                        { icon: Radio, label: "Voice Cloning", color: "text-violet-400 border-violet-500/20 bg-violet-500/5" },
                    ].map((feat) => (
                        <div key={feat.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${feat.color}`}>
                            <feat.icon className="w-3.5 h-3.5" />
                            {feat.label}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Voice Studio */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <VoiceStudio />
            </motion.div>

            {/* How it works */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="max-w-4xl mx-auto mt-20"
            >
                <h2 className="text-white font-bold text-xl text-center mb-10">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            step: "01",
                            title: "Create a Voice Profile",
                            desc: "Upload a few seconds of audio to clone any voice. Or use the default voice.",
                            gradient: "from-cyan-500/10 to-blue-500/5",
                        },
                        {
                            step: "02",
                            title: "Enter Your Text",
                            desc: "Type anything — emails, blog posts, announcements, scripts. Up to 5,000 characters.",
                            gradient: "from-violet-500/10 to-purple-500/5",
                        },
                        {
                            step: "03",
                            title: "Generate & Download",
                            desc: "AI generates natural speech in seconds. Play it back, download the WAV, or integrate via API.",
                            gradient: "from-fuchsia-500/10 to-rose-500/5",
                        },
                    ].map((item) => (
                        <div
                            key={item.step}
                            className={`p-6 rounded-2xl border border-white/[0.06] bg-gradient-to-b ${item.gradient}`}
                        >
                            <div className="text-4xl font-black text-white/10 mb-3">{item.step}</div>
                            <h3 className="text-white font-bold mb-2">{item.title}</h3>
                            <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>


        </div>
    );
}
