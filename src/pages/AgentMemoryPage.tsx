import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Search, Sparkles, Database, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Memory {
    id: string;
    agent_id: string;
    type: string;
    content: string;
    metadata: Record<string, any>;
    importance: number;
    created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
    observation: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    decision: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    task: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    error: 'text-red-400 bg-red-500/10 border-red-500/20',
    reflection: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    knowledge: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
    plan: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

export default function AgentMemoryPage() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [agentFilter, setAgentFilter] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [agents, setAgents] = useState<string[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 30;

    useEffect(() => {
        (async () => {
            setLoading(true);
            let q = supabase.from('agent_memory').select('*').order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
            if (agentFilter) q = q.eq('agent_id', agentFilter);
            if (typeFilter) q = q.eq('type', typeFilter);
            if (search) q = q.ilike('content', `%${search}%`);

            const { data } = await q;
            setMemories(data || []);

            // Get total count
            const { count } = await supabase.from('agent_memory').select('*', { count: 'exact', head: true });
            setTotal(count || 0);

            // Get unique agents and types
            if (agents.length === 0) {
                const { data: all } = await supabase.from('agent_memory').select('agent_id, type');
                if (all) {
                    setAgents([...new Set(all.map(a => a.agent_id))]);
                    setTypes([...new Set(all.map(a => a.type))]);
                }
            }
            setLoading(false);
        })();
    }, [page, agentFilter, typeFilter, search]);

    return (
        <div className="min-h-screen pt-8 pb-20">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                    <Brain className="w-8 h-8 text-fuchsia-400" />
                    <span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">Agent Memory</span>
                </h1>
                <p className="text-white/40 text-sm">{total.toLocaleString()} memories across {agents.length} agents · {types.length} types</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <Database className="w-5 h-5 text-cyan-400 mb-2" />
                    <div className="text-2xl font-black text-cyan-400">{total}</div>
                    <div className="text-white/40 text-xs">Total Memories</div>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <Brain className="w-5 h-5 text-violet-400 mb-2" />
                    <div className="text-2xl font-black text-violet-400">{agents.length}</div>
                    <div className="text-white/40 text-xs">Active Agents</div>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <Tag className="w-5 h-5 text-amber-400 mb-2" />
                    <div className="text-2xl font-black text-amber-400">{types.length}</div>
                    <div className="text-white/40 text-xs">Memory Types</div>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <Sparkles className="w-5 h-5 text-emerald-400 mb-2" />
                    <div className="text-2xl font-black text-emerald-400">
                        {memories.length > 0 ? (memories.reduce((a, m) => a + (m.importance || 0), 0) / memories.length).toFixed(2) : '—'}
                    </div>
                    <div className="text-white/40 text-xs">Avg Importance</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                        placeholder="Search memories..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500/50 focus:outline-none" />
                </div>
                <select value={agentFilter || ''} onChange={e => { setAgentFilter(e.target.value || null); setPage(0); }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs appearance-none cursor-pointer">
                    <option value="">All Agents</option>
                    {agents.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select value={typeFilter || ''} onChange={e => { setTypeFilter(e.target.value || null); setPage(0); }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs appearance-none cursor-pointer">
                    <option value="">All Types</option>
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {/* Memory List */}
            {loading ? (
                <div className="text-center py-12 text-white/30">Loading agent memories...</div>
            ) : (
                <div className="space-y-2">
                    {memories.map((mem, i) => {
                        const typeClass = TYPE_COLORS[mem.type] || 'text-gray-400 bg-white/5 border-white/10';
                        return (
                            <motion.div key={mem.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}
                                className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] transition-colors">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${typeClass}`}>{mem.type}</span>
                                    <span className="text-white/30 text-xs font-mono">{mem.agent_id}</span>
                                    <span className="text-white/20 text-xs ml-auto">{timeAgo(mem.created_at)}</span>
                                    <span className={`text-xs font-mono ${mem.importance >= 0.7 ? 'text-amber-400' : mem.importance >= 0.4 ? 'text-white/50' : 'text-white/20'}`}>
                                        ★ {mem.importance?.toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-white/70 text-sm leading-relaxed">{mem.content.length > 300 ? mem.content.slice(0, 300) + '…' : mem.content}</p>
                            </motion.div>
                        );
                    })}
                    {memories.length === 0 && <div className="text-center py-12 text-white/30">No memories match your filters</div>}
                </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center gap-3 mt-8">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs disabled:opacity-30">← Prev</button>
                <span className="px-4 py-2 text-white/30 text-xs">Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs disabled:opacity-30">Next →</button>
            </div>
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
