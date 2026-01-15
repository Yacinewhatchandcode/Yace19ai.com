import { motion } from 'framer-motion';
import { Award, Zap, Terminal } from 'lucide-react';
import flowStats from '../assets/flow_stats.png';
import cursorStats from '../assets/cursor_stats.png';

export default function Achievements() {
    return (
        <section className="py-20 px-4 relative">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-10">
                    <Award className="text-cyan-500" size={28} />
                    <h2 className="text-3xl font-bold text-white tracking-tight">Performance & Recognition</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Flow State Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden p-1"
                    >
                        <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/5">
                            <Zap className="text-yellow-400" size={20} />
                            <h3 className="font-bold text-gray-200">Flow State Mastery</h3>
                            <span className="ml-auto text-xs font-mono text-gray-400 bg-black/30 px-2 py-1 rounded">Top 1% Voice Dictator</span>
                        </div>
                        <div className="p-4">
                            <img src={flowStats} alt="Flow State Statistics" className="rounded-xl w-full border border-white/5 shadow-2xl" />
                        </div>
                    </motion.div>

                    {/* Cursor Usage Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden p-1"
                    >
                        <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/5">
                            <Terminal className="text-blue-400" size={20} />
                            <h3 className="font-bold text-gray-200">AI-Augmented Velocity</h3>
                            <span className="ml-auto text-xs font-mono text-gray-400 bg-black/30 px-2 py-1 rounded">Top 0.9% Cursor Usage</span>
                        </div>
                        <div className="p-4">
                            <img src={cursorStats} alt="Cursor Usage Statistics" className="rounded-xl w-full border border-white/5 shadow-2xl" />
                        </div>
                    </motion.div>

                    {/* GITEX Certification */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2 bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-purple-500/20 rounded-full border border-purple-500/30">
                                <Award size={32} className="text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">GITEX Global 2025</h3>
                                <p className="text-gray-300">Attended: AI for Developers Track</p>
                                <p className="text-sm text-gray-500 mt-1">Dubai, UAE • October 2025</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-300">
                                AI Solutions
                            </div>
                            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-300">
                                Enterprise Architecture
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
