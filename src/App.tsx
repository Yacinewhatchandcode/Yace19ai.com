import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Rocket, Globe, Menu, X } from "lucide-react";

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";

import "./App.css";

// Shared Background
import NeuralMeshwork3D from "./components/NeuralMeshwork3D";

// Pages
import HomePage from "./pages/HomePage";
import FleetPage from "./pages/FleetPage";
import PhilosophyPage from "./pages/PhilosophyPage";
import SovereignSearchPage from "./pages/SovereignSearchPage";
import BlogPage from "./pages/BlogPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import PricingPage from "./pages/PricingPage";
import PricingSuccessPage from "./pages/PricingSuccessPage";
import SelfCodingPage from "./pages/SelfCodingPage";
import ThemesPage from "./pages/ThemesPage";
import VoicePage from "./pages/VoicePage";
import StatusPage from "./pages/StatusPage";
import CRMPage from "./pages/CRMPage";
import AgentMemoryPage from "./pages/AgentMemoryPage";
import KnowledgeGraphPage from "./pages/KnowledgeGraphPage";
import CostTrackerPage from "./pages/CostTrackerPage";
import DataExtractorPage from "./pages/DataExtractorPage";
import WorkflowPage from "./pages/WorkflowPage";

function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "ACCUEIL", color: "text-cyan-400" },
    { path: "/solutions", label: "NOS SERVICES", color: "text-teal-400" },
    { path: "/voice", label: "ASSISTANT VOCAL", color: "text-violet-400" },
    { path: "/fleet", label: "RÉALISATIONS", color: "text-blue-400" },
    { path: "/sovereign", label: "INFRASTRUCTURE", color: "text-emerald-400" },
    { path: "/pricing", label: "TARIFS", color: "text-orange-400" },
    { path: "/build", label: "SUR-MESURE", color: "text-rose-400" },
    { path: "/philosophy", label: "NOTRE APPROCHE", color: "text-gray-400" },
    { path: "/workflow", label: "WORKFLOWS", color: "text-violet-400" },
  ];

  return (
    <>
      <nav className="fixed w-full px-4 md:px-6 py-3 md:py-4 flex justify-between items-center z-[100] backdrop-blur-xl border-b border-white/[0.05] bg-[#02050A]/80">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center relative overflow-hidden">
            <Globe className="text-cyan-400 w-3.5 h-3.5 sm:w-4 sm:h-4 z-10 group-hover:rotate-180 transition-transform duration-700" />
            <div className="absolute inset-0 bg-cyan-400/20 translate-y-full group-hover:translate-y-0 transition-transform" />
          </div>
          <div className="font-display font-black tracking-[0.15em] sm:tracking-[0.2em] text-xs sm:text-sm uppercase">
            <span className="text-white">PRIME</span>
            <span className="text-cyan-400">_AI</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 font-mono text-[10px] lg:text-xs tracking-widest font-bold">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-all duration-300 ${location.pathname === link.path ? link.color : 'text-gray-500 hover:text-white'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side: CTA + Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://calendly.com/info-primeai/30min"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex px-3 sm:px-4 py-1.5 sm:py-2 md:px-5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase hover:bg-purple-500/20 hover:border-purple-500/50 transition-all items-center gap-2 group"
          >
            <Rocket size={12} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            <span className="hidden lg:inline">NOUS CONTACTER</span>
            <span className="lg:hidden">CONTACT</span>
          </a>

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[52px] sm:top-[56px] z-[99] md:hidden"
          >
            <div className="mx-3 mt-1 rounded-2xl border border-white/10 bg-[#0a0a14]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden">
              <div className="flex flex-col py-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-5 py-3 font-mono text-xs tracking-widest font-bold transition-all ${location.pathname === link.path
                      ? `${link.color} bg-white/5`
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                      }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${location.pathname === link.path ? 'bg-current' : 'bg-gray-700'}`} />
                    {link.label}
                  </Link>
                ))}
              </div>
              {/* Mobile CTA */}
              <div className="border-t border-white/5 p-3">
                <a
                  href="https://calendly.com/info-primeai/30min"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 font-mono text-xs font-bold tracking-widest uppercase hover:bg-purple-500/20 transition-all"
                >
                  <Rocket size={14} />
                  NOUS CONTACTER
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const isFullBleed = location.pathname === '/build' || location.pathname === '/workflow';

  if (isFullBleed) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/build" element={<SelfCodingPage />} />
          <Route path="/workflow" element={<WorkflowPage />} />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/philosophy" element={<PhilosophyPage />} />
        <Route path="/sovereign" element={<SovereignSearchPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/pricing/success" element={<PricingSuccessPage />} />
        <Route path="/solutions" element={<ThemesPage />} />
        <Route path="/voice" element={<VoicePage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/crm" element={<CRMPage />} />
        <Route path="/agents" element={<AgentMemoryPage />} />
        <Route path="/graph" element={<KnowledgeGraphPage />} />
        <Route path="/costs" element={<CostTrackerPage />} />
        <Route path="/extractor" element={<DataExtractorPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isFullBleed = location.pathname === '/build' || location.pathname === '/workflow';

  return (
    <>
      <div className="fixed inset-0 z-0 bg-[#02050A]">
        {!isFullBleed && <NeuralMeshwork3D />}
      </div>

      {isFullBleed ? (
        /* Full-bleed: no nav, no wrapper, no padding */
        <div className="relative z-10 h-[100dvh] text-white font-sans overflow-hidden selection:bg-cyan-500/30 selection:text-white">
          <AnimatedRoutes />
        </div>
      ) : (
        /* Normal pages: nav + content wrapper */
        <div className="relative z-10 min-h-[100dvh] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-white flex flex-col pt-[52px] sm:pt-14 md:pt-[72px]">
          <Navigation />
          <div className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 md:px-8 pb-6 sm:pb-12">
            <AnimatedRoutes />
          </div>
        </div>
      )}
    </>
  );
}
