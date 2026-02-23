import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, Terminal, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import flowStatsLocal from '../assets/flow_stats.png';
import cursorStatsLocal from '../assets/cursor_stats.png';

interface Achievement {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    badge_type: string;
    location?: string;
    date?: string;
    tags: string[];
    image_url?: string;
    sort_order: number;
}

const BADGE_ICONS: Record<string, any> = {
    award: Award,
    zap: Zap,
    terminal: Terminal,
};

// Local fallback images for flow_stats and cursor_stats
const LOCAL_IMAGES: Record<string, string> = {
    '/assets/flow_stats.png': flowStatsLocal,
    '/assets/cursor_stats.png': cursorStatsLocal,
};

export default function Achievements() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.from('achievements').select('*').order('sort_order').then(({ data }) => {
            if (data && data.length > 0) setAchievements(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <section className="py-20 px-4 relative flex justify-center">
                <Loader className="text-cyan-400 animate-spin" size={28} />
            </section>
        );
    }

    // Split: first 2 are image cards, rest are badge cards
    const imageCards = achievements.filter(a => a.image_url);
    const badgeCards = achievements.filter(a => !a.image_url);

    return (
        <section className="py-20 px-4 relative">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-10">
                    <Award className="text-cyan-500" size={28} />
                    <h2 className="text-3xl font-bold text-white tracking-tight">Performance & Recognition</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {imageCards.map((ach, i) => {
                        const Icon = BADGE_ICONS[ach.badge_type] || Award;
                        const imgSrc = LOCAL_IMAGES[ach.image_url || ''] || ach.image_url || '';
                        const colors = i === 0
                            ? { icon: 'text-yellow-400', label: ach.subtitle }
                            : { icon: 'text-blue-400', label: ach.subtitle };
                        return (
                            <motion.div key={ach.id} initial={{ opacity: 0, x: i === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden p-1">
                                <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/5">
                                    <Icon className={colors.icon} size={20} />
                                    <h3 className="font-bold text-gray-200">{ach.title}</h3>
                                    <span className="ml-auto text-xs font-mono text-gray-400 bg-black/30 px-2 py-1 rounded">{colors.label}</span>
                                </div>
                                <div className="p-4">
                                    <img src={imgSrc} alt={ach.title} className="rounded-xl w-full border border-white/5 shadow-2xl" />
                                </div>
                            </motion.div>
                        );
                    })}

                    {badgeCards.map(ach => {
                        const Icon = BADGE_ICONS[ach.badge_type] || Award;
                        return (
                            <motion.div key={ach.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                className="lg:col-span-2 bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-purple-500/20 rounded-full border border-purple-500/30">
                                        <Icon size={32} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{ach.title}</h3>
                                        <p className="text-gray-300">{ach.subtitle}</p>
                                        {ach.location && <p className="text-sm text-gray-500 mt-1">{ach.location} • {ach.date}</p>}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {ach.tags.map(tag => (
                                        <div key={tag} className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-300">{tag}</div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
