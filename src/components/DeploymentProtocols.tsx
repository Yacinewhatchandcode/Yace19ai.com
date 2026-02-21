import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Building2, Brain, ArrowRight, Check, Sparkles } from 'lucide-react';

interface ServiceTier {
    icon: React.ReactNode;
    name: string;
    badge?: string;
    tagline: string;
    features: string[];
    isPrime?: boolean;
}

const tiers: ServiceTier[] = [
    {
        icon: <Rocket size={28} />,
        name: 'MVP Acceleration',
        tagline: 'Accelerate Time-to-Market',
        features: [
            'Accelerated 7-14 Day Delivery Cycle',
            'End-to-End Scalable Architecture',
            'Mobile-First Conversion Optimization',
            'Seamless Enterprise Handoff',
            '30-Day Technical Warranty & Support'
        ]
    },
    {
        icon: <Building2 size={28} />,
        name: 'Enterprise AI Transformation',
        badge: 'Executive Standard',
        tagline: 'Secure & Scalable Data Sovereignty',
        features: [
            'Private Cloud & On-Premise Deployment',
            'Proprietary Workflow Agent Training',
            '100% Intellectual Property Transfer',
            'Dedicated Autonomous Workforce',
            'Priority SLAs & Infrastructure Monitoring',
            'Quarterly AI Strategy & Architecture Reviews'
        ],
        isPrime: true
    },
    {
        icon: <Brain size={28} />,
        name: 'Executive AI Consulting',
        tagline: 'Digital Transformation Strategies',
        features: [
            'C-Suite AI Roadmap Workshops',
            'Legacy System Modernization',
            'Corporate AI Enablement Training',
            'Comprehensive Technical Debt Audits',
            'Long-Term Scalability Planning'
        ]
    }
];

const DeploymentProtocols: React.FC = () => {
    return (
        <section className="py-24 px-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-cyan-500/5 via-transparent to-transparent rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto relative">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10 mb-6"
                    >
                        <Sparkles size={16} className="text-purple-400" />
                        <span className="text-sm font-medium text-gray-300">B2B Partnership</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-bold text-white mb-4"
                    >
                        Enterprise Licensing
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto text-lg"
                    >
                        Select the optimal integration framework for your business scalability.
                    </motion.p>
                </div>

                {/* Tier Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className={`group relative p-8 rounded-2xl backdrop-blur-xl transition-all duration-500 flex flex-col ${tier.isPrime
                                ? 'bg-gradient-to-br from-gray-900/90 to-cyan-900/20 border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/10'
                                : 'bg-gray-900/60 border border-white/10 hover:border-white/20'
                                }`}
                        >
                            {/* Prime Badge */}
                            {tier.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                                    {tier.badge}
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`mb-6 w-14 h-14 rounded-xl flex items-center justify-center ${tier.isPrime
                                ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 text-cyan-300'
                                : 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10'
                                } transition-all`}>
                                {tier.icon}
                            </div>

                            {/* Content */}
                            <h3 className={`text-2xl font-bold mb-2 ${tier.isPrime ? 'text-cyan-400' : 'text-white'}`}>
                                {tier.name}
                            </h3>
                            <p className="text-gray-400 text-sm mb-6">
                                {tier.tagline}
                            </p>

                            {/* Features */}
                            <ul className="space-y-3 mb-8 flex-grow">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                                        <Check size={16} className={`mt-0.5 shrink-0 ${tier.isPrime ? 'text-cyan-400' : 'text-gray-500'}`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <a
                                href="https://calendly.com/info-primeai/30min"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${tier.isPrime
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02]'
                                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                Book Execution Call
                                <ArrowRight size={16} />
                            </a>
                        </motion.div>
                    ))}
                </div>

                {/* Disclaimer */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-xs max-w-3xl mx-auto">
                        * Timelines and deliverables depend on project scope and complexity. Final terms provided during consultation. All services subject to availability.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default DeploymentProtocols;
