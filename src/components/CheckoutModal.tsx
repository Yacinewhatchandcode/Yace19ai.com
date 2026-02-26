import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Shield, Check, Zap, ArrowRight, Copy, Sparkles } from 'lucide-react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectTitle: string;
}

const STRIPE_PK = import.meta.env.VITE_STRIPE_PK || '';

const PAYMENT_LINKS: Record<string, string> = {};

const PRICE = '1.00';
const CURRENCY = '€';

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, projectId, projectTitle }) => {
    const [step, setStep] = useState<'overview' | 'processing' | 'success'>('overview');
    const [email, setEmail] = useState('');
    const [copied, setCopied] = useState(false);

    const paymentLink = PAYMENT_LINKS[projectId];
    const hasStripe = !!STRIPE_PK || !!paymentLink;

    const handlePurchase = () => {
        if (paymentLink) {
            // Use Stripe Payment Link (simplest — no backend needed)
            const url = new URL(paymentLink);
            if (email) url.searchParams.set('prefilled_email', email);
            window.open(url.toString(), '_blank');
            setStep('processing');
            setTimeout(() => setStep('success'), 2000);
        } else if (STRIPE_PK) {
            // Use Stripe Checkout via Supabase Edge Function
            setStep('processing');
            fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ projectId, email, amount: 100 })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.url) window.location.href = data.url;
                    else setStep('success');
                })
                .catch(() => {
                    // Fallback to email
                    window.open(`mailto:yacine@prime-ai.fr?subject=Acquire & Deploy: ${projectTitle}&body=I'd like to acquire the codebase and setup guide for ${projectTitle} (€1). My email: ${email}`, '_blank');
                    setStep('success');
                });
        } else {
            // No Stripe — use direct payment via email/PayPal
            setStep('processing');
            setTimeout(() => {
                window.open(`mailto:yacine@prime-ai.fr?subject=Acquire & Deploy: ${projectTitle}&body=Hi Yacine,%0A%0AI'd like to acquire the source code and documentation for "${projectTitle}" for €1.%0A%0AMy email: ${email}%0A%0AThank you!`, '_blank');
                setStep('success');
            }, 1200);
        }
    };

    const copyPaymentInfo = () => {
        navigator.clipboard.writeText(`IBAN: FR76 XXXX XXXX XXXX XXXX XXXX XXX\nAmount: €1.00\nRef: ${projectId.toUpperCase()}\nEmail: yacine@prime-ai.fr`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const reset = () => {
        setStep('overview');
        setEmail('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={reset}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={e => e.stopPropagation()}
                        className="relative w-full max-w-md rounded-2xl overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, #0a0a1a 0%, #111128 50%, #0a0a1a 100%)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            boxShadow: '0 25px 80px rgba(99, 102, 241, 0.15), 0 0 1px rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        {/* Glow line */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

                        {/* Close button */}
                        <button
                            onClick={reset}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all z-10"
                        >
                            <X size={16} />
                        </button>

                        {/* STEP: Overview */}
                        {step === 'overview' && (
                            <div className="p-8">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/30 flex items-center justify-center">
                                        <Zap size={22} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Acquire & Deploy</h3>
                                        <p className="text-sm text-gray-400">{projectTitle}</p>
                                    </div>
                                </div>

                                {/* Price card */}
                                <div className="bg-white/5 rounded-xl border border-white/10 p-5 mb-6">
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-4xl font-black text-white">{CURRENCY}{PRICE}</span>
                                        <span className="text-gray-400 text-sm">/ one-time</span>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            'Full source code access',
                                            'Documentation & setup guide',
                                            'Deployment ready (Docker/Cloud)',
                                            '30-day email support',
                                            'Commercial license included'
                                        ].map(f => (
                                            <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                                                <Check size={14} className="text-emerald-400 shrink-0" />
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Email input */}
                                <div className="mb-4">
                                    <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1.5 block">
                                        Delivery email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                                    />
                                </div>

                                {/* Pay button */}
                                <button
                                    onClick={handlePurchase}
                                    disabled={!email}
                                    className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${email
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.01] cursor-pointer'
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <CreditCard size={18} />
                                    {hasStripe ? `Pay ${CURRENCY}${PRICE}` : `Acquire for ${CURRENCY}${PRICE}`}
                                    <ArrowRight size={16} />
                                </button>

                                {/* Alternative payment */}
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <button
                                        onClick={copyPaymentInfo}
                                        className="w-full py-2.5 rounded-lg text-xs text-gray-400 hover:text-gray-300 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Copy size={14} />
                                        {copied ? '✓ Payment info copied!' : 'Or pay via bank transfer'}
                                    </button>
                                </div>

                                {/* Security footer */}
                                <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-gray-500">
                                    <Shield size={12} />
                                    Secure checkout • SSL encrypted • GDPR compliant
                                </div>
                            </div>
                        )}

                        {/* STEP: Processing */}
                        {step === 'processing' && (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-6 relative">
                                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
                                    <div className="absolute inset-2 rounded-full border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                                    <div className="absolute inset-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                        <Sparkles size={16} className="text-indigo-400" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Processing...</h3>
                                <p className="text-sm text-gray-400">Setting up your access</p>
                            </div>
                        )}

                        {/* STEP: Success */}
                        {step === 'success' && (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                    <Check size={28} className="text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">You're In! 🚀</h3>
                                <p className="text-sm text-gray-400 mb-6">
                                    {hasStripe
                                        ? `Check ${email} for your access details and setup guide.`
                                        : `We've received your request. You'll get setup instructions at ${email} within 24 hours.`
                                    }
                                </p>
                                <div className="space-y-3">
                                    <a
                                        href={`https://github.com/Yacinewhatchandcode/${projectId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                                    >
                                        Access Repository →
                                    </a>
                                    <button
                                        onClick={reset}
                                        className="block w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CheckoutModal;
