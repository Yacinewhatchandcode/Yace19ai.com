import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe2, ShieldCheck, Clock, CheckCircle, HelpCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import VoiceOrbInterface from '../components/VoiceOrbInterface';
import ReinforcementSandbox from '../components/ReinforcementSandbox';
import CommandTerminal from '../components/CommandTerminal';
import DeploymentProtocols from '../components/DeploymentProtocols';
import AziReMCatalog from '../components/AziReMCatalog';
import ROISection from '../components/ROISection';

interface FAQ { question_en: string; answer_en: string; category: string }
interface Service { icon: string; title_en: string; description_en: string; href: string }

export default function HomePage() {
    const [stats, setStats] = useState({ repos: '...', pageviews: '...', agents: '...', total_deployments: 0 });
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        // Load real stats
        Promise.all([
            supabase.from('analytics_pageviews').select('*', { count: 'exact', head: true }),
            supabase.from('sovereign_api_keys').select('provider').eq('status', 'active'),
            supabase.from('prime_leads_unified').select('*', { count: 'exact', head: true }),
            supabase.from('deployments').select('*', { count: 'exact', head: true }),
        ]).then(([pvRes, keysRes, leadsRes, deploymentsRes]) => {
            setStats({
                repos: String(pvRes.count || 0),
                pageviews: String(keysRes.data?.length || 0),
                agents: String(leadsRes.count || 0),
                total_deployments: deploymentsRes.count || 0,
            });
        });

        supabase.from('faqs').select('question_en, answer_en, category').order('sort_order').then(({ data }) => setFaqs(data || []));
        supabase.from('services').select('icon, title_en, description_en, href').order('sort_order').then(({ data }) => setServices(data || []));
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4 sm:gap-6 pt-4 sm:pt-8 md:pt-12 pointer-events-none"
        >
            <div className="pointer-events-auto">
                <VoiceOrbInterface />
            </div>

            {/* HER0 BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 auto-rows-min pointer-events-none">
                {/* BIG TILE: Playable Arcade */}
                <div className="md:col-span-2 md:row-span-2 pointer-events-auto">
                    <ReinforcementSandbox />
                </div>

                {/* SMALL TILE TOP RIGHT: AI Agent Catalog */}
                <div className="h-64 md:h-auto md:row-span-1 border border-white/5 rounded-3xl overflow-hidden glass-panel pointer-events-auto">
                    <AziReMCatalog />
                </div>

                {/* SMALL TILE BOTTOM RIGHT: Live Stats from Supabase */}
                <div className="flex flex-col gap-4 pointer-events-none">
                    {[
                        { label: 'TOTAL PAGEVIEWS', value: stats.repos, icon: ArrowRight, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
                        { label: 'ACTIVE API KEYS', value: stats.pageviews, icon: ArrowRight, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
                        { label: 'CAPTURED LEADS', value: stats.agents, icon: ArrowRight, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30' }
                    ].map((stat, i) => (
                        <Link to="/analytics" key={i} className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl border ${stat.border} ${stat.bg} hover:bg-opacity-20 transition-all group`}>
                            <div className="flex items-center gap-4">
                                <stat.icon size={24} className={stat.color} />
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black font-display text-white group-hover:pl-1 transition-all">
                                        {stat.value}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest font-mono text-gray-400">
                                        {stat.label}
                                    </span>
                                </div>
                            </div>
                            <ArrowRight size={18} className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* ─── SERVICES (from Supabase) ─── */}
            {services.length > 0 && (
                <section className="py-12">
                    <h2 className="text-lg sm:text-2xl font-black text-white font-display mb-4 sm:mb-8 text-center">Our Services</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {services.map((svc, i) => (
                            <motion.a
                                key={i}
                                href={svc.href || '#'}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="pointer-events-auto glass-panel border border-white/10 rounded-2xl p-6 hover:border-cyan-500/40 hover:bg-cyan-500/[0.03] transition-all group block"
                            >
                                <div className="text-3xl mb-4">{svc.icon}</div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{svc.title_en}</h3>
                                <p className="text-sm text-gray-400">{svc.description_en}</p>
                            </motion.a>
                        ))}
                    </div>
                </section>
            )}

            {/* ─── TECHNICAL CORE METRICS SECTION ─── */}
            <section className="py-8">
                <div className="text-center mb-4 sm:mb-8 pointer-events-auto">
                    <span className="text-[10px] font-black text-cyan-500 tracking-[0.3em] uppercase mb-4 block">R&D & Engineering</span>
                    <h2 className="text-lg sm:text-2xl font-black text-white font-display">Agentic Infrastructure</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20 px-4 pointer-events-none">
                    <div className="pointer-events-auto bg-black/40 border border-white/5 rounded-2xl p-6 text-center backdrop-blur-xl hover:bg-white/[0.02] transition-colors">
                        <div className="flex justify-center mb-3 text-cyan-400"><Clock size={24} /></div>
                        <div className="text-3xl font-black text-white mb-1">V2</div>
                        <div className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Architecture LangGraph</div>
                    </div>
                    <div className="pointer-events-auto bg-black/40 border border-white/5 rounded-2xl p-6 text-center backdrop-blur-xl hover:bg-white/[0.02] transition-colors">
                        <div className="flex justify-center mb-3 text-emerald-400"><CheckCircle size={24} /></div>
                        <div className="text-3xl font-black text-white mb-1">{stats?.total_deployments?.toLocaleString() || '43+'}</div>
                        <div className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Modèles LLM Intégrés</div>
                    </div>
                    <div className="pointer-events-auto bg-black/40 border border-white/5 rounded-2xl p-6 text-center backdrop-blur-xl hover:bg-white/[0.02] transition-colors">
                        <div className="flex justify-center mb-3 text-blue-400"><ShieldCheck size={24} /></div>
                        <div className="text-3xl font-black text-white mb-1">3-Tier</div>
                        <div className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Sovereign Fabric</div>
                    </div>
                    <div className="pointer-events-auto bg-black/40 border border-white/5 rounded-2xl p-6 text-center backdrop-blur-xl hover:bg-white/[0.02] transition-colors">
                        <div className="flex justify-center mb-3 text-purple-400"><Globe2 size={24} /></div>
                        <div className="text-3xl font-black text-white mb-1">&lt;50ms</div>
                        <div className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Latence d'Orchestration</div>
                    </div>
                </div>
            </section>

            {/* ─── ROI BUSINESS SECTION ─── */}
            <div className="pointer-events-auto">
                <ROISection />
            </div>

            {/* COMMAND TERMINAL SECTION */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 relative z-10 pointer-events-none">
                    <div className="text-center mb-16 pointer-events-auto">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Télémétrie Agentique</h2>
                        <p className="text-gray-400 text-sm max-w-2xl mx-auto">Surveillez les opérations et l'exécution asynchrone des réseaux neuronaux en temps réel.</p>
                    </div>
                    <div className="pointer-events-auto">
                        <CommandTerminal />
                    </div>
                </div>
            </section>

            {/* DEPLOYMENT PROTOCOLS SECTION */}
            <section className="py-24 relative overflow-hidden bg-[#0A0A0A]">
                <div className="max-w-7xl mx-auto px-4 relative z-10 pointer-events-none">
                    <div className="text-center mb-16 pointer-events-auto">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Déploiement Souverain</h2>
                        <p className="text-gray-400 text-sm max-w-2xl mx-auto">Déploiement en nœuds multi-zones, isolation de vos données et performance hors-ligne. Infrastructure privatisée disponible 24/7.</p>
                    </div>
                    <div className="pointer-events-auto">
                        <DeploymentProtocols />
                    </div>
                </div>
            </section>

            <div className="h-12"></div>

            {/* ─── FAQ (from Supabase) ─── */}
            {faqs.length > 0 && (
                <section className="py-16 max-w-3xl mx-auto w-full pointer-events-none">
                    <div className="flex items-center gap-3 mb-8 justify-center pointer-events-auto">
                        <HelpCircle className="text-amber-400" size={24} />
                        <h2 className="text-2xl font-black text-white font-display">Questions Fréquentes</h2>
                    </div>
                    <div className="flex flex-col gap-3 pointer-events-none">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="pointer-events-auto glass-panel border border-white/10 rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                                >
                                    <span className="text-sm font-semibold text-white">{faq.question_en}</span>
                                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === i && (
                                    <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                                        {faq.answer_en}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

        </motion.div>
    );
}
