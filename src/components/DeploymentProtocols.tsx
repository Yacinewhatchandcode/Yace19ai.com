import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Building2, Brain, ArrowRight, Check, Sparkles, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PricingPlan {
    plan_id: string;
    name_en: string;
    description_en: string;
    features_en: string[];
    price_monthly: number;
    popular: boolean;
    sort_order: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    'mvp': <Rocket size={28} />,
    'enterprise': <Building2 size={28} />,
    'consulting': <Brain size={28} />,
};

const DeploymentProtocols: React.FC = () => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.from('pricing_plans')
            .select('plan_id, name_en, description_en, features_en, price_monthly, popular, sort_order')
            .order('sort_order')
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setPlans(data);
                }
                setLoading(false);
            });
    }, []);

    // Fallback if no data loaded yet
    const fallbackTiers = [
        {
            plan_id: 'mvp', name_en: 'MVP Acceleration', description_en: 'Accelerate Time-to-Market', popular: false,
            features_en: ['7-14 Day Delivery', 'Scalable Architecture', 'Mobile-First', 'Enterprise Handoff', '30-Day Warranty'],
            price_monthly: 0, sort_order: 0,
        },
        {
            plan_id: 'enterprise', name_en: 'Enterprise AI Transformation', description_en: 'Secure & Scalable Data Sovereignty', popular: true,
            features_en: ['Private Cloud Deployment', 'Workflow Agent Training', '100% IP Transfer', 'Dedicated Workforce', 'Priority SLAs', 'Quarterly Reviews'],
            price_monthly: 0, sort_order: 1,
        },
        {
            plan_id: 'consulting', name_en: 'Executive AI Consulting', description_en: 'Digital Transformation Strategies', popular: false,
            features_en: ['C-Suite AI Workshops', 'Legacy Modernization', 'AI Enablement Training', 'Technical Debt Audits', 'Scalability Planning'],
            price_monthly: 0, sort_order: 2,
        },
    ];

    const displayPlans = plans.length > 0 ? plans : fallbackTiers;

    return (
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-cyan-500/5 via-transparent to-transparent rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto relative">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10 mb-6"
                    >
                        <Sparkles size={16} className="text-purple-400" />
                        <span className="text-sm font-medium text-gray-300">B2B Partnership</span>
                        {plans.length > 0 && (
                            <span className="text-[8px] text-green-500 bg-green-900/30 px-1.5 py-0.5 rounded border border-green-500/20 ml-2">LIVE DATA</span>
                        )}
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

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {displayPlans.slice(0, 3).map((plan, index) => {
                            const isPrime = plan.popular;
                            const icon = ICON_MAP[plan.plan_id] || <Rocket size={28} />;

                            return (
                                <motion.div
                                    key={plan.plan_id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15 }}
                                    className={`group relative p-8 rounded-2xl backdrop-blur-xl transition-all duration-500 flex flex-col ${isPrime
                                        ? 'bg-gradient-to-br from-gray-900/90 to-cyan-900/20 border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/10'
                                        : 'bg-gray-900/60 border border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {isPrime && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                                            Executive Standard
                                        </div>
                                    )}

                                    <div className={`mb-6 w-14 h-14 rounded-xl flex items-center justify-center ${isPrime
                                        ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 text-cyan-300'
                                        : 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10'
                                        } transition-all`}>
                                        {icon}
                                    </div>

                                    <h3 className={`text-2xl font-bold mb-2 ${isPrime ? 'text-cyan-400' : 'text-white'}`}>
                                        {plan.name_en}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-6">
                                        {plan.description_en}
                                    </p>

                                    {plan.price_monthly > 0 && (
                                        <div className="mb-4">
                                            <span className="text-3xl font-black text-white">{plan.price_monthly}€</span>
                                            <span className="text-gray-500 text-sm">/month</span>
                                        </div>
                                    )}

                                    <ul className="space-y-3 mb-8 flex-grow">
                                        {(plan.features_en || []).map((feature) => (
                                            <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                                                <Check size={16} className={`mt-0.5 shrink-0 ${isPrime ? 'text-cyan-400' : 'text-gray-500'}`} />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <a
                                        href="https://calendly.com/info-primeai/30min"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${isPrime
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02]'
                                            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        Book Execution Call
                                        <ArrowRight size={16} />
                                    </a>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

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
