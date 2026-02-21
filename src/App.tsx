import { AnimatePresence } from "framer-motion";
import { Rocket, Globe } from "lucide-react";

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";

import "./App.css";

// Shared Background
import NeuralMeshwork3D from "./components/NeuralMeshwork3D";

// Pages
import HomePage from "./pages/HomePage";
import FleetPage from "./pages/FleetPage";
import PhilosophyPage from "./pages/PhilosophyPage";

import LiveVisitorCounter from "./components/LiveVisitorCounter";

function Navigation() {
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "HOME", color: "text-cyan-400" },
    { path: "/fleet", label: "OUR WORK", color: "text-violet-400" },
    { path: "/philosophy", label: "ABOUT US", color: "text-fuchsia-400" }
  ];

  return (
    <nav className="fixed w-full px-6 py-4 flex justify-between items-center z-[100] backdrop-blur-xl border-b border-white/[0.05] bg-[#02050A]/70">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center relative overflow-hidden">
          <Globe className="text-cyan-400 w-4 h-4 z-10 group-hover:rotate-180 transition-transform duration-700" />
          <div className="absolute inset-0 bg-cyan-400/20 translate-y-full group-hover:translate-y-0 transition-transform" />
        </div>
        <div className="font-display font-black tracking-[0.2em] text-sm uppercase">
          <span className="text-white">PRIME</span>
          <span className="text-cyan-400">_AI</span>
        </div>
      </Link>

      <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest font-bold">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`transition-all duration-300 ${location.pathname === link.path ? link.color : 'text-gray-500 hover:text-white'}`}
          >
            {link.label}
          </Link>
        ))}

        <LiveVisitorCounter />
      </div>

      <a
        href="https://calendly.com/info-primeai/30min"
        target="_blank"
        rel="noreferrer"
        className="px-5 py-2 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 font-mono text-xs font-bold tracking-widest uppercase hover:bg-purple-500/20 hover:border-purple-500/50 transition-all flex items-center gap-2 group"
      >
        <Rocket size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
        START PROJECT
      </a>
    </nav>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/philosophy" element={<PhilosophyPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div className="fixed inset-0 z-0 bg-[#02050A]">
        <NeuralMeshwork3D />
      </div>
      <div className="relative z-10 min-h-screen text-white font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-white flex flex-col pt-20">
        <Navigation />
        <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-12">
          <AnimatedRoutes />
        </div>
      </div>
    </Router>
  );
}
