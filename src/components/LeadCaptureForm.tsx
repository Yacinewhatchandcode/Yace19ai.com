import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LeadCaptureForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [objective, setObjective] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) return;

        setLoading(true);
        setError('');

        const { error: dbError } = await supabase.from('prime_leads_unified').insert({
            name,
            email,
            company: company || null,
            objective: objective || null,
            source: 'yace19ai-contact',
            status: 'new',
        });

        if (dbError) {
            setError('Failed to submit. Please try again.');
            setLoading(false);
            return;
        }

        setSubmitted(true);
        setLoading(false);
    };

    return (
        <section className="py-16 max-w-2xl mx-auto w-full">
            <div className="glass-panel border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center">
                        <UserPlus size={20} className="text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Get In Touch</h3>
                        <p className="text-xs text-gray-500 font-mono">Captured directly to our CRM</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {submitted ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-white mb-2">Message Received!</h4>
                            <p className="text-sm text-gray-400">We'll get back to you within 24 hours.</p>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1 block">Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Your name"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1 block">Email *</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1 block">Company</label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={e => setCompany(e.target.value)}
                                    placeholder="Your company"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1 block">What are you looking for?</label>
                                <textarea
                                    value={objective}
                                    onChange={e => setObjective(e.target.value)}
                                    placeholder="AI consulting, MVP build, enterprise deployment..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm resize-none"
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-red-400 font-mono">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !name || !email}
                                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${loading || !name || !email
                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.01] cursor-pointer'
                                    }`}
                            >
                                <Send size={16} />
                                {loading ? 'Submitting...' : 'Send Message'}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
