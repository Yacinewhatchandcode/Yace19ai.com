import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Lead {
    id: string;
    lead_id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    employees: string | null;
    objective: string | null;
    challenge: string | null;
    source: string | null;
    status: string;
    created_at: string;
}

interface Prospect {
    id: string;
    full_name: string;
    email: string | null;
    company: string | null;
    title: string | null;
    stage: string;
    score: number;
    source: string | null;
    tags: string[];
    created_at: string;
}

interface Booking {
    id: string;
    invitee_name: string | null;
    invitee_email: string | null;
    event_type: string | null;
    scheduled_at: string | null;
    status: string | null;
    google_meet_url: string | null;
    created_at: string;
}

const STAGE_CONFIG: Record<string, { color: string; bg: string }> = {
    new: { color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    qualified: { color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    contacted: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    engaged: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    converted: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    lost: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

export default function CRMPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pipeline' | 'leads' | 'bookings'>('pipeline');

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [{ data: l }, { data: p }, { data: b }] = await Promise.all([
                supabase.from('prime_leads_unified').select('*').order('created_at', { ascending: false }),
                supabase.from('prospects').select('*').order('score', { ascending: false }),
                supabase.from('bookings').select('*').order('scheduled_at', { ascending: false }),
            ]);
            setLeads(l || []);
            setProspects(p || []);
            setBookings(b || []);
            setLoading(false);
        })();
    }, []);

    const totalLeads = leads.length + prospects.length;
    const stages = ['new', 'qualified', 'contacted', 'engaged', 'converted', 'lost'];
    const funnelData = stages.map(s => ({
        stage: s,
        count: prospects.filter(p => p.stage === s).length + leads.filter(l => l.status === s).length,
    }));

    return (
        <div className="min-h-screen pt-8 pb-20">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2">
                    <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">CRM Pipeline</span>
                </h1>
                <p className="text-white/40 text-sm">{totalLeads} contacts · {bookings.length} bookings · All from Supabase Data Lake</p>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <StatCard icon={Users} label="Total Contacts" value={totalLeads} color="text-cyan-400" />
                <StatCard icon={Building2} label="Companies" value={new Set([...leads.map(l => l.company), ...prospects.map(p => p.company)].filter(Boolean)).size} color="text-violet-400" />
                <StatCard icon={Calendar} label="Bookings" value={bookings.length} color="text-emerald-400" />
                <StatCard icon={TrendingUp} label="Avg Score" value={prospects.length > 0 ? Math.round(prospects.reduce((a, p) => a + (p.score || 0), 0) / prospects.length) : 0} color="text-amber-400" />
            </div>

            {/* Funnel */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
                <h2 className="text-white font-bold text-lg mb-4">Sales Funnel</h2>
                <div className="flex gap-2 items-end h-32">
                    {funnelData.map((f) => {
                        const maxCount = Math.max(...funnelData.map(x => x.count), 1);
                        const pct = (f.count / maxCount) * 100;
                        const cfg = STAGE_CONFIG[f.stage] || STAGE_CONFIG.new;
                        return (
                            <div key={f.stage} className="flex-1 flex flex-col items-center gap-1">
                                <span className={`text-xs font-bold ${cfg.color}`}>{f.count}</span>
                                <div className={`w-full rounded-t-lg ${cfg.bg} border`} style={{ height: `${Math.max(pct, 8)}%` }} />
                                <span className="text-white/30 text-[10px] uppercase tracking-wider">{f.stage}</span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {(['pipeline', 'leads', 'bookings'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-12 text-white/30">Loading data lake...</div>
            ) : activeTab === 'pipeline' ? (
                <div className="space-y-3">
                    {prospects.map((p, i) => {
                        const cfg = STAGE_CONFIG[p.stage] || STAGE_CONFIG.new;
                        return (
                            <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                className={`p-4 rounded-xl border ${cfg.bg} flex items-center gap-4`}>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                                    {(p.full_name || '?')[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-bold text-sm">{p.full_name}</div>
                                    <div className="text-white/40 text-xs">{p.company || 'No company'} {p.title ? `· ${p.title}` : ''}</div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.color} border ${cfg.bg}`}>{p.stage}</div>
                                <div className="text-right">
                                    <div className="text-white font-mono text-sm font-bold">{p.score}</div>
                                    <div className="text-white/30 text-[10px]">Score</div>
                                </div>
                            </motion.div>
                        );
                    })}
                    {prospects.length === 0 && <div className="text-center py-12 text-white/30">No prospects yet</div>}
                </div>
            ) : activeTab === 'leads' ? (
                <div className="space-y-3">
                    {leads.map((l, i) => (
                        <motion.div key={l.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                                {(l.name || l.email || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-bold text-sm">{l.name || l.email || 'Unknown'}</div>
                                <div className="text-white/40 text-xs">{l.company || 'No company'}{l.objective ? ` · ${l.objective}` : ''}</div>
                                {l.challenge && <div className="text-white/30 text-xs mt-1 truncate">💬 {l.challenge}</div>}
                            </div>
                            <div className="text-right">
                                <div className="text-white/40 text-xs">{l.source || '—'}</div>
                                <div className="text-white/20 text-[10px]">{timeAgo(l.created_at)}</div>
                            </div>
                        </motion.div>
                    ))}
                    {leads.length === 0 && <div className="text-center py-12 text-white/30">No leads yet</div>}
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map((b, i) => (
                        <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-4">
                            <Calendar className="w-8 h-8 text-emerald-400" />
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-bold text-sm">{b.invitee_name || 'Unknown'}</div>
                                <div className="text-white/40 text-xs">{b.invitee_email} · {b.event_type} · {b.status}</div>
                            </div>
                            <div className="text-right">
                                {b.scheduled_at && <div className="text-emerald-400 text-sm font-mono">{new Date(b.scheduled_at).toLocaleDateString()}</div>}
                                {b.google_meet_url && <a href={b.google_meet_url} target="_blank" rel="noreferrer" className="text-cyan-400 text-xs hover:underline">Join →</a>}
                            </div>
                        </motion.div>
                    ))}
                    {bookings.length === 0 && <div className="text-center py-12 text-white/30">No bookings yet</div>}
                </div>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
    return (
        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-white/40 text-xs mt-1">{label}</div>
        </div>
    );
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}
