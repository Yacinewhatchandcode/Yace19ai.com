import { motion } from 'framer-motion';
import { Activity, ArrowRight } from 'lucide-react';
import asiremBanner from '../assets/asirem-banner.png';



export default function AziReMCatalog() {
    return (
        <section className="py-20 px-4 relative">
            <div className="w-full max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-white/10 mb-6">
                        <Activity size={16} className="text-amber-400" />
                        <span className="text-sm font-medium text-gray-300">Agent Ecosystem</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        ASIREM
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8 italic">
                        Where the gears turn with grace, and hope blooms eternal.
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
                        alt="ASIREM - Where the gears turn with grace, and hope blooms eternal" 
                        className="w-full h-auto object-cover"
                        loading="lazy"
                        decoding="async"
                    />
                    
                    {/* Overlay CTA */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-12 opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <a 
                            href="mailto:info.primeai@gmail.com?subject=ASIREM Agent Deployment Inquiry"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg shadow-2xl hover:shadow-amber-500/50 transition-all hover:scale-105"
                        >
                            Explore ASIREM Agents
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
                        ASIREM represents the harmonious fusion of mechanical precision and organic creativity. 
                        Our multi-agent ecosystem operates like a steampunk orchestra, where each agent plays its unique role 
                        in composing solutions that are both technically elegant and beautifully human.
                    </p>
                    <a 
                        href="mailto:info.primeai@gmail.com?subject=ASIREM Agent System Consultation"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white font-semibold border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-all"
                    >
                        Request Consultation
                        <ArrowRight size={18} />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
