import { motion } from "framer-motion";
import { Terminal, Cpu, Activity, ArrowUpRight, Server } from "lucide-react";
import NeuralMeshwork3D from "./components/NeuralMeshwork3D";
import "./App.css";

export default function App() {
  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden bg-[#02050A] select-none flex items-center justify-center">
      {/* Three.js/Canvas Neural Mesh background */}
      <div className="absolute inset-0 z-0">
        <NeuralMeshwork3D />
      </div>

      {/* Main Glassmorphic Panel */}
      <div className="relative z-10 w-full max-w-2xl px-6 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full bg-[#030812]/75 border border-cyan-500/20 rounded-3xl p-8 md:p-12 backdrop-blur-2xl shadow-[0_0_80px_rgba(6,182,212,0.08)] flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Neon corner elements */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50 rounded-br-3xl pointer-events-none" />

          {/* Glowing Aura Accent */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          {/* Header Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-500/5 border border-cyan-400/25 mb-8 text-[10px] font-mono tracking-[0.25em] font-bold text-cyan-400 uppercase shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            comming sone &bull; Fleet Preparing Launch
          </motion.div>

          {/* Domain Title */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-4 font-display">
            yace19
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              ai.com
            </span>
          </h1>

          {/* Subtitle / Owner Description */}
          <p className="text-gray-400 text-xs md:text-sm font-mono tracking-wider max-w-lg mb-8 uppercase text-cyan-400/80">
            YACINE BENHAMOU &bull; LEAD AI BUILDER &bull; MULTI-SYSTEM ORCHESTRATION
          </p>

          {/* Status Indicators Grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-10 font-mono text-[10px] tracking-widest text-left">
            {[
              { label: "FLEET COORDINATION", value: "ONLINE", icon: Activity, color: "text-emerald-400", border: "border-emerald-500/20" },
              { label: "NEURAL GATEWAY", value: "SYNCHRONIZED", icon: Cpu, color: "text-cyan-400", border: "border-cyan-500/20" },
              { label: "COMPUTE MIGRATION", value: "H200 TIERS", icon: Server, color: "text-violet-400", border: "border-violet-500/20" },
              { label: "INTERFACE COMPILATION", value: "94% COMPLETED", icon: Terminal, color: "text-amber-400", border: "border-amber-500/20" }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border ${item.border} bg-[#040c1c]/45 flex items-center justify-between gap-3 group`}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-gray-500 text-[8px] uppercase tracking-widest truncate">{item.label}</span>
                  <span className={`font-black ${item.color} tracking-wider`}>{item.value}</span>
                </div>
                <item.icon size={16} className={`${item.color} shrink-0 opacity-80 group-hover:scale-110 transition-transform`} />
              </div>
            ))}
          </div>

          {/* CTA Link to prime-ai.fr */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-md mb-8"
          >
            <a
              href="https://prime-ai.fr"
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-cyan-500/10 to-violet-500/20 border border-cyan-400/40 text-cyan-400 font-mono text-xs font-black tracking-[0.2em] uppercase hover:bg-cyan-500/20 hover:border-cyan-400/80 transition-all shadow-[0_4px_30px_rgba(6,182,212,0.15)] group"
            >
              Visit Canonical Portal (prime-ai.fr)
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </motion.div>

          {/* Progress Bar representation */}
          <div className="w-full max-w-md flex flex-col gap-2 font-mono text-[9px] tracking-widest text-gray-500">
            <div className="flex justify-between items-center px-1">
              <span>SYSTEM COMPILE IN PROGRESS</span>
              <span className="text-cyan-400 font-bold">94%</span>
            </div>
            <div className="w-full h-1.5 bg-[#02050A] rounded-full overflow-hidden border border-white/[0.05] p-[1px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "94%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Footer Credit */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center text-gray-500 text-[9px] font-mono tracking-[0.3em] uppercase mt-8"
        >
          &copy; 2026 Yacine Benhamou &bull; AMLAZR SYSTEM DESIGN &bull; SECURELY WIRED BY ANTIGRAVITY COGNITION
        </motion.p>
      </div>
    </div>
  );
}
