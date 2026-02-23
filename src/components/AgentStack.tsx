import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Scan, ShieldCheck, Zap, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AgentProduct {
    icon: React.ReactNode;
    title: string;
    description: string;
    highlight: string;
}

const fallbackProducts: AgentProduct[] = [
    {
        icon: <Bot size={32} />,
        title: 'Multi-Agent System',
        description: 'Specialized agents collaborate in coordinated workflows. From architecture to QA, each agent focuses on distinct engineering tasks.',
        highlight: 'Collaborative'
    },
    {
        icon: <Scan size={32} />,
        title: 'Deep Perception',
        description: 'Semantic codebase analysis with vector-based memory. Maintains context across sessions for intelligent code understanding.',
        highlight: 'RAG-Powered'
    },
    {
        icon: <ShieldCheck size={32} />,
        title: 'Automated QA',
        description: 'Autonomous bug detection and validation pipeline. Continuous verification to catch issues early in the development cycle.',
        highlight: 'Continuous'
    }
];

const AgentStack: React.FC = () => {
    const [products] = useState<AgentProduct[]>(fallbackProducts);
    const [providerCount, setProviderCount] = useState<number | null>(null);
    const [memoryCount, setMemoryCount] = useState<number | null>(null);

    useEffect(() => {
        // Pull live stats from Supabase
        Promise.all([
            supabase.from('sovereign_api_keys').select('provider', { count: 'exact', head: false }).eq('status', 'active'),
            supabase.from('agent_memory').select('*', { count: 'exact', head: true }),
        ]).then(([keysRes, memRes]) => {
            setProviderCount(keysRes.data?.length || 0);
            setMemoryCount(memRes.count || 0);
        });
    }, []);

    return (
        <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10 mb-6"
                    >
                        <Layers size={16} className="text-cyan-400" />
                        <span className="text-sm font-medium text-gray-300">Proprietary Stack</span>
                        {providerCount !== null && (
                            <span className="text-[8px] text-green-500 bg-green-900/30 px-1.5 py-0.5 rounded border border-green-500/20 ml-2">
                                {providerCount} PROVIDERS LIVE
                            </span>
                        )}
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-bold text-white mb-4"
                    >
                        The Agent Infrastructure
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto text-lg"
                    >
                        Three core capabilities powering AI-assisted development
                        {memoryCount !== null && (
                            <span className="block text-xs text-cyan-500 mt-2 font-mono">
                                {memoryCount.toLocaleString()} agent memory entries • Live Supabase data
                            </span>
                        )}
                    </motion.p>
                </div>

                {/* Product Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            className="group relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 transition-all duration-500"
                        >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 transition-all duration-500" />

                            <div className="relative mb-6 w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-cyan-400 group-hover:text-white group-hover:from-cyan-500/40 group-hover:to-purple-500/40 transition-all duration-500">
                                {product.icon}
                            </div>

                            <div className="relative">
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                    {product.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                    {product.description}
                                </p>

                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                    <Zap size={12} />
                                    {product.highlight}
                                </span>
                            </div>

                            <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AgentStack;
