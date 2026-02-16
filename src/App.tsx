
import { motion } from "framer-motion";
import { ArrowRight, Gamepad2, Github, Menu, Rocket, Twitter, X } from "lucide-react";
import { Link } from "react-router-dom";
import React from 'react';
import "./App.css";
import founderImage from "./assets/founder.jpg";
import Achievements from "./components/Achievements";
import AgentStack from './components/AgentStack';
import AziReMCatalog from "./components/AziReMCatalog";
import DeploymentProtocols from "./components/DeploymentProtocols";
import Footer from './components/Footer';
import NeuralMeshwork3D from "./components/NeuralMeshwork3D";
import Philosophy from './components/Philosophy';
import ProjectPortfolio from "./components/ProjectPortfolio";

function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <>
      <NeuralMeshwork3D />
      <div className="min-h-screen text-white relative z-20 selection:bg-cyan-500/30 font-sans overflow-x-hidden pb-12 bg-transparent">

        {/* Improved Navigation */}
        <nav className="fixed w-full px-6 py-4 flex justify-between items-center z-50 bg-transparent">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="font-bold text-white">Y</span>
            </div>
            <span className="font-bold tracking-tight text-xl" style={{ textShadow: '0 0 10px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)' }}>Yace19.ai</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <a href="#projects" className="hover:text-white transition-colors text-shadow-lg" style={{ textShadow: '0 0 10px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)' }}>Projects</a>
            <a href="#agent-stack" className="hover:text-white transition-colors text-shadow-lg" style={{ textShadow: '0 0 10px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)' }}>Philosophy</a>
            <a href="#deployment-protocols" className="hover:text-white transition-colors text-shadow-lg" style={{ textShadow: '0 0 10px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)' }}>Stack</a>
            <Link to="/games" className="hover:text-white transition-colors flex items-center gap-1.5" style={{ textShadow: '0 0 10px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)' }}><Gamepad2 size={15} /> Games</Link>
            <div className="flex items-center gap-4 ml-4">
              <a href="https://github.com/Yacinewhatchandcode" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
                <Github className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              </a>
              <a href="https://twitter.com/yace19ai" target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile">
                <Twitter className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
        </nav>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center gap-8 p-6">
            <button className="absolute top-6 right-6" onClick={() => setIsMenuOpen(false)} aria-label="Close menu"><X size={32} /></button>
            <a href="#projects" className="text-2xl font-bold text-cyan-400" onClick={() => setIsMenuOpen(false)}>Projects</a>
            <a href="#agent-stack" className="text-2xl font-bold text-white" onClick={() => setIsMenuOpen(false)}>Philosophy</a>
            <a href="#deployment-protocols" className="text-2xl font-bold text-white" onClick={() => setIsMenuOpen(false)}>Stack</a>
            <Link to="/games" className="text-2xl font-bold text-cyan-400 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}><Gamepad2 size={24} /> Games</Link>
          </div>
        )}

        {/* Main Content Container */}
        <div className="pt-32 px-4 md:px-8 max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12">

          {/* Main Feed Area */}
          <main className="flex-grow min-w-0">
            {/* Professional Profile Banner */}
            <div className="mb-12 relative bg-transparent">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 border-white/10 overflow-hidden shadow-2xl shrink-0 bg-gray-800">
                  <img src={founderImage} alt="Yacine" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow pt-2">
                  <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
                    Yacine Benhamou
                    <span className="block text-xl md:text-2xl font-normal text-gray-400 mt-2 font-mono">Lead AI Builder | Agentic AI Strategy, Core Development & Multi-System Orchestration</span>
                  </h1>
                  <p className="text-gray-300 text-lg max-w-2xl leading-relaxed mb-6">
                    Founder of Prime-AI, architecting autonomous multi-agent systems for enterprise automation.
                    Specialized in <span className="text-cyan-400 font-semibold">Agentic AI Strategy</span>, <span className="text-purple-400 font-semibold">Multi-System Orchestration</span>, and building intelligent agents that drive real-world outcomes.
                  </p>

                  {/* Hero CTAs */}
                  <div className="flex flex-wrap gap-4">
                    <motion.a
                      href="mailto:info.primeai@gmail.com"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
                    >
                      <Rocket size={18} />
                      Start Collaboration
                    </motion.a>
                    <motion.a
                      href="#projects"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white font-semibold border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      View Case Studies
                      <ArrowRight size={18} />
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter/Status Chips - Simplified */}
            <div className="flex gap-3 mb-12 overflow-x-auto pb-2 scrollbar-hide">
              {['Featured', 'Infrastructure', 'Agents', 'UI/UX'].map((chip, i) => (
                <button key={chip} className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${i === 0 ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`}>
                  {chip}
                </button>
              ))}
            </div>

            {/* The Real Portfolio */}
            <div id="projects">
              <ProjectPortfolio />
            </div>

            {/* Achievements & Certifications */}
            <Achievements />

          </main>
        </div>

        {/* Agent Stack Section */}
        <div id="agent-stack">
          <AgentStack />
        </div>

        {/* Philosophy & Vision */}
        <Philosophy />

        {/* AziReM Catalogue (Agent Feed) */}
        <AziReMCatalog />

        {/* Deployment Protocols (Service Tiers) */}
        <div id="deployment-protocols">
          <DeploymentProtocols />
        </div>

        {/* Footer */}
        <Footer />

      </div>
    </>
  );
}

export default App;
