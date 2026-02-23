import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Monitor, Github, HelpCircle, ChevronDown } from "lucide-react";
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import VoiceOrbInterface from '../components/VoiceOrbInterface';
import ReinforcementSandbox from '../components/ReinforcementSandbox';
import CommandTerminal from '../components/CommandTerminal';
import AziReMCatalog from '../components/AziReMCatalog';
import DeploymentProtocols from '../components/DeploymentProtocols';

interface FAQ { question_en: string; answer_en: string; category: string }
interface Service { icon: string; title_en: string; description_en: string; href: string }
interface Capability { icon: string; title_en: string; description_en: string }

export default function HomePage() {
    const [stats, setStats] = useState({ repos: '...', pageviews: '...', agents: '...' });
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [capabilities, setCapabilities] = useState<Capability[]>([]);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        // Load real stats
        Promise.all([
            supabase.from('analytics_pageviews').select('*', { count: 'exact', head: true }),
            supabase.from('sovereign_api_keys').select('provider').eq('status', 'active'),
            supabase.from('prime_leads_unified').select('*', { count: 'exact', head: true }),
        ]).then(([pvRes, keysRes, leadsRes]) => {
            setStats({
                repos: String(pvRes.count || 0),
                pageviews: String(keysRes.data?.length || 0),
                agents: String(leadsRes.count || 0),
            });
        });

        // Load dynamic content
        supabase.from('faqs').select('question_en, answer_en, category').order('sort_order').then(({ data }) => setFaqs(data || []));
        supabase.from('services').select('icon, title_en, description_en, href').order('sort_order').then(({ data }) => setServices(data || []));
        supabase.from('capabilities').select('icon, title_en, description_en').order('sort_order').then(({ data }) => setCapabilities(data || []));
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4 sm:gap-6 pt-4 sm:pt-8 md:pt-12"
        >
            <VoiceOrbInterface />

            {/* HER0 BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 auto-rows-min">

                {/* BIG TILE: Playable Arcade */}
                <div className="md:col-span-2 md:row-span-2">
                    <ReinforcementSandbox />
                </div>

                {/* SMALL TILE TOP RIGHT: Live Terminal */}
                <div className="h-64 md:h-auto md:row-span-1 rounded-3xl overflow-hidden glass-panel border border-cyan-500/20 shadow-[0_0_30px_#00ffff11]">
                    <CommandTerminal />
                </div>

                {/* SMALL TILE BOTTOM RIGHT: Live Stats from Supabase */}
                <div className="flex flex-col gap-4">
                    {[
                        { label: 'TOTAL PAGEVIEWS', value: stats.repos, icon: Github, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
                        { label: 'ACTIVE API KEYS', value: stats.pageviews, icon: Monitor, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
                        { label: 'CAPTURED LEADS', value: stats.agents, icon: Terminal, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30' }
                    ].map((stat, i) => (
                        <Link to="/analytics" key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${stat.border} ${stat.bg} hover:bg-opacity-20 transition-all group`}>
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
                                className="glass-panel border border-white/10 rounded-2xl p-6 hover:border-cyan-500/40 hover:bg-cyan-500/[0.03] transition-all group block"
                            >
                                <div className="text-3xl mb-4">{svc.icon}</div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{svc.title_en}</h3>
                                <p className="text-sm text-gray-400">{svc.description_en}</p>
                            </motion.a>
                        ))}
                    </div>
                </section>
            )}

            {/* ─── CAPABILITIES (from Supabase) ─── */}
            {capabilities.length > 0 && (
                <section className="py-8">
                    <h2 className="text-lg sm:text-2xl font-black text-white font-display mb-4 sm:mb-8 text-center">Core Capabilities</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                        {capabilities.map((cap, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-panel border border-white/10 rounded-xl p-4 text-center hover:border-violet-500/40 transition-all"
                            >
                                <div className="text-2xl mb-2">{cap.icon}</div>
                                <h4 className="text-xs font-bold text-white mb-1">{cap.title_en}</h4>
                                <p className="text-[10px] text-gray-500">{cap.description_en}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            <div className="h-12"></div>

            <AziReMCatalog />

            <div className="h-12"></div>

            <DeploymentProtocols />

            {/* ─── FAQ (from Supabase) ─── */}
            {faqs.length > 0 && (
                <section className="py-16 max-w-3xl mx-auto w-full">
                    <div className="flex items-center gap-3 mb-8 justify-center">
                        <HelpCircle className="text-amber-400" size={24} />
                        <h2 className="text-2xl font-black text-white font-display">Frequently Asked Questions</h2>
                    </div>
                    <div className="flex flex-col gap-3">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-panel border border-white/10 rounded-xl overflow-hidden"
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
