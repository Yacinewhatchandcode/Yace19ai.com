import { motion } from 'framer-motion';
import { Activity, ArrowRight } from 'lucide-react';
import asiremBanner from '../assets/asirem-banner.webp';
import GamesCatalog from './GamesCatalog';

export default function AziReMCatalog() {
    return (
        <section className="py-20 px-4 relative">
            <div className="w-full max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-white/10 mb-6">
                        <Activity size={16} className="text-amber-400" />
                        <span className="text-sm font-medium text-gray-300">Enterprise AI Automation Suite</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        ASIREM
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8 italic">
                        Driving Operational Efficiency at Scale.
                    </p>
                </div>

                {/* Main Banner Image */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 mb-12"
                >
                    <img
                        src={asiremBanner}
                        alt="ASIREM - Enterprise AI Automation Suite"
                        className="w-full h-auto object-cover"
                        loading="lazy"
                        decoding="async"
                    />

                    {/* Overlay CTA */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-12 opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <a
                            href="https://calendly.com/info-primeai/30min"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg shadow-2xl hover:shadow-amber-500/50 transition-all hover:scale-105"
                        >
                            Explore Enterprise Solutions
                            <ArrowRight size={20} />
                        </a>
                    </div>
                </motion.div>

                {/* Description */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-center max-w-3xl mx-auto"
                >
                    <p className="text-gray-400 leading-relaxed mb-6">
                        ASIREM represents the convergence of predictive analytics and autonomous execution.
                        Our proprietary multi-agent architecture operates as a unified digital workforce,
                        transforming complex business workflows into streamlined, revenue-generating engines
                        tailored exclusively for your enterprise infrastructure.
                    </p>
                    <a
                        href="https://calendly.com/info-primeai/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white font-semibold border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-all"
                    >
                        Book Strategy Call
                        <ArrowRight size={18} />
                    </a>
                </motion.div>

                {/* Encapsulated Games/Interactive Modules */}
                <div className="mt-20">
                    <GamesCatalog />
                </div>
            </div>
        </section>
    );
}
