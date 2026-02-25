import { TrendingUp, Clock, Euro, Target, Activity, CheckCircle, ExternalLink } from 'lucide-react';

export default function ROISection() {
    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">

                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-[10px] font-black text-green-400 tracking-[0.3em] uppercase mb-4 block">Impact Business</span>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">De la théorie au résultat net</h2>
                    <p className="text-gray-400 text-sm max-w-2xl mx-auto">
                        Notre laboratoire développe la technologie. <strong>Prime Enterprise OS</strong> la transforme en croissance mesurable pour votre entreprise.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Bloc 1: Use case → temps gagné → € impact */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-green-500/30 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-colors pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center shrink-0">
                                    <Target className="text-green-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Use Case Standard</h3>
                                    <p className="text-sm text-gray-400">Automatisation Service Client & Devis</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-black/40 rounded-xl p-4 border border-white/5 shadow-inner">
                                    <Clock className="text-blue-400 shrink-0" size={20} />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Temps Gagné</p>
                                        <p className="text-white font-mono font-semibold">~18h / semaine par agent</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-black/40 rounded-xl p-4 border border-white/5 shadow-inner">
                                    <Euro className="text-green-400 shrink-0" size={20} />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Impact Net Estimé</p>
                                        <p className="text-white font-mono font-semibold">+12% marge opérationnelle</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-black/40 rounded-xl p-4 border border-white/5 shadow-inner">
                                    <TrendingUp className="text-purple-400 shrink-0" size={20} />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Taux de Conversion</p>
                                        <p className="text-white font-mono font-semibold">Réponses en &lt;2min = x3.5</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bloc 2: Cas réel 90 jours */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-blue-500/30 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                                    <Activity className="text-blue-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Cas Réel : 90 Jours</h3>
                                    <p className="text-sm text-gray-400">Période de transformation</p>
                                </div>
                            </div>

                            <div className="relative pl-6 border-l border-white/10 space-y-6 my-4 ml-2">
                                <div className="relative">
                                    <div className="absolute -left-[29px] bg-blue-500/20 rounded-full p-1 border border-blue-500/30">
                                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    </div>
                                    <p className="text-sm font-bold text-white mb-1">Mois 1 : Déploiement & Capture</p>
                                    <p className="text-xs text-gray-400 leading-relaxed">Audit data, mise en place des agents (voix/texte), synchronisation de votre CRM CRM.</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[29px] bg-purple-500/20 rounded-full p-1 border border-purple-500/30">
                                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                                    </div>
                                    <p className="text-sm font-bold text-white mb-1">Mois 2 : Apprentissage & Routage</p>
                                    <p className="text-xs text-gray-400 leading-relaxed">Création de la base de connaissances (Knowledge Graph), automatisation de l'acquisition.</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[29px] bg-green-500/20 rounded-full p-1 border border-green-500/30">
                                        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)] animate-pulse" />
                                    </div>
                                    <p className="text-sm font-bold text-white mb-1">Mois 3 : ROI & Scalabilité</p>
                                    <p className="text-xs text-gray-400 leading-relaxed">Passage en autonomie complète sur le niveau 1. Baisse drastique du coût d'acquisition client.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bloc 3: CTA Audit -> prime-ai.fr */}
                <div className="bg-gradient-to-r from-[#030712] via-[#0f172a] to-[#030712] border border-blue-500/30 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-transparent blur-[100px] pointer-events-none" />

                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Prêt à transformer votre entreprise ?</h3>
                        <p className="text-blue-100/70 text-[15px] max-w-xl mx-auto mb-8 leading-relaxed">
                            Passez de l'expérimentation technologique à l'industrialisation. Prime AI déploie ces systèmes au cœur de votre PME pour une rentabilité immédiate et mesurable.
                        </p>

                        <a
                            href="https://prime-ai.fr/?utm_source=yace19ai.com&utm_medium=referral&utm_campaign=roi_cta"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all cursor-pointer"
                        >
                            Réserver un Audit Gratuit sur Prime AI <ExternalLink size={18} />
                        </a>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-blue-300/50 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-400" /> Garanti sans blabla</span>
                            <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-400" /> ROI mesurable</span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
