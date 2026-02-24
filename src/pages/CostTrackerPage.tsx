import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Cpu, Zap, TrendingDown, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UsageRecord {
    id: string;
    provider: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
    cost_eur: number;
    task_type: string;
    description: string | null;
    created_at: string;
}

interface CreditTx {
    id: string;
    type: string;
    amount: number;
    description: string | null;
    provider: string | null;
    model_used: string | null;
    task_type: string | null;
    created_at: string;
}

export default function CostTrackerPage() {
    const [usage, setUsage] = useState<UsageRecord[]>([]);
    const [credits, setCredits] = useState<CreditTx[]>([]);
    const [, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [{ data: u }, { data: c }] = await Promise.all([
                supabase.from('ai_usage_records').select('*').order('created_at', { ascending: false }),
                supabase.from('credit_transactions').select('*').order('created_at', { ascending: false }),
            ]);
            setUsage(u || []);
            setCredits(c || []);
            setLoading(false);
        })();
    }, []);

    // Aggregations
    const totalCostUSD = usage.reduce((a, r) => a + (r.cost_usd || 0), 0);

    const totalTokensIn = usage.reduce((a, r) => a + (r.input_tokens || 0), 0);
    const totalTokensOut = usage.reduce((a, r) => a + (r.output_tokens || 0), 0);
    const totalCreditsUsed = credits.filter(c => c.type === 'usage').reduce((a, c) => a + Math.abs(c.amount), 0);
    const totalCreditsPurchased = credits.filter(c => c.type === 'purchase' || c.type === 'bonus').reduce((a, c) => a + c.amount, 0);

    // By provider
    const byProvider: Record<string, { cost: number; tokens: number; count: number }> = {};
    usage.forEach(r => {
        if (!byProvider[r.provider]) byProvider[r.provider] = { cost: 0, tokens: 0, count: 0 };
        byProvider[r.provider].cost += r.cost_usd || 0;
        byProvider[r.provider].tokens += (r.input_tokens || 0) + (r.output_tokens || 0);
        byProvider[r.provider].count++;
    });

    // By model
    const byModel: Record<string, { cost: number; tokens: number; count: number }> = {};
    usage.forEach(r => {
        const m = r.model || 'unknown';
        if (!byModel[m]) byModel[m] = { cost: 0, tokens: 0, count: 0 };
        byModel[m].cost += r.cost_usd || 0;
        byModel[m].tokens += (r.input_tokens || 0) + (r.output_tokens || 0);
        byModel[m].count++;
    });

    return (
        <div className="min-h-screen pt-8 pb-20">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-emerald-400" />
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Cost & Usage Tracker</span>
                </h1>
                <p className="text-white/40 text-sm">{usage.length} AI calls · {credits.length} credit transactions · All from Supabase</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <SC icon={DollarSign} label="Total Cost (USD)" value={`$${totalCostUSD.toFixed(4)}`} color="text-emerald-400" />
                <SC icon={Zap} label="Tokens In/Out" value={`${(totalTokensIn / 1000).toFixed(1)}K / ${(totalTokensOut / 1000).toFixed(1)}K`} color="text-cyan-400" />
                <SC icon={BarChart3} label="Credits Used" value={totalCreditsUsed.toString()} color="text-amber-400" />
                <SC icon={TrendingDown} label="Credits Balance" value={(totalCreditsPurchased - totalCreditsUsed).toString()} color="text-violet-400" />
            </div>

            {/* By Provider */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Cpu className="w-5 h-5 text-cyan-400" /> By Provider</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(byProvider).sort((a, b) => b[1].count - a[1].count).map(([provider, data]) => (
                        <div key={provider} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                            <div className="text-white font-mono text-sm font-bold uppercase">{provider}</div>
                            <div className="flex gap-4 mt-2">
                                <div><span className="text-emerald-400 text-lg font-black">${data.cost.toFixed(4)}</span><div className="text-white/30 text-[10px]">Cost</div></div>
                                <div><span className="text-cyan-400 text-lg font-black">{data.count}</span><div className="text-white/30 text-[10px]">Calls</div></div>
                                <div><span className="text-white/60 text-lg font-black">{(data.tokens / 1000).toFixed(1)}K</span><div className="text-white/30 text-[10px]">Tokens</div></div>
                            </div>
                        </div>
                    ))}
                    {Object.keys(byProvider).length === 0 && <div className="text-white/30 text-sm col-span-3">No usage data yet</div>}
                </div>
            </motion.div>

            {/* By Model */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
                <h2 className="text-white font-bold text-lg mb-4">By Model</h2>
                <div className="space-y-2">
                    {Object.entries(byModel).sort((a, b) => b[1].count - a[1].count).map(([model, data]) => {
                        const maxCount = Math.max(...Object.values(byModel).map(d => d.count), 1);
                        const pct = (data.count / maxCount) * 100;
                        return (
                            <div key={model} className="flex items-center gap-3">
                                <span className="text-white/60 text-xs font-mono w-48 truncate">{model}</span>
                                <div className="flex-1 h-6 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500/40 to-violet-500/40" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-white/40 text-xs w-16 text-right">{data.count} calls</span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-400" /> Recent Activity</h2>
                <div className="space-y-2">
                    {[...usage.map(u => ({ ...u, _type: 'usage' as const })), ...credits.map(c => ({ ...c, _type: 'credit' as const }))]
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 20)
                        .map((item) => (
                            <div key={item.id} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3 text-sm">
                                {item._type === 'usage' ? (
                                    <>
                                        <Cpu className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                                        <span className="text-white/40 font-mono text-xs">{(item as UsageRecord).provider}</span>
                                        <span className="text-white/60">{(item as UsageRecord).model}</span>
                                        <span className="ml-auto text-emerald-400 text-xs">${((item as UsageRecord).cost_usd || 0).toFixed(4)}</span>
                                    </>
                                ) : (
                                    <>
                                        <DollarSign className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                        <span className={`font-bold ${(item as CreditTx).amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {(item as CreditTx).amount > 0 ? '+' : ''}{(item as CreditTx).amount}
                                        </span>
                                        <span className="text-white/40 text-xs">{(item as CreditTx).type} — {(item as CreditTx).description}</span>
                                    </>
                                )}
                                <span className="text-white/20 text-[10px] flex-shrink-0">{timeAgo(item.created_at)}</span>
                            </div>
                        ))}
                </div>
            </motion.div>
        </div>
    );
}

function SC({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
    return (
        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <div className={`text-xl font-black ${color}`}>{value}</div>
            <div className="text-white/40 text-xs mt-1">{label}</div>
        </div>
    );
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
}
