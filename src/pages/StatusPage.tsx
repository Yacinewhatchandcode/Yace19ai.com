import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, XCircle, Clock, Shield, RefreshCw, Server } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SystemAlert {
    id: string;
    type: string;
    severity: string;
    message: string;
    ack: boolean;
    created_at: string;
}

interface ProviderHealth {
    id: string;
    timestamp: string;
    total_providers: number;
    available_providers: number;
    degraded_providers: number;
    unavailable_providers: number;
    alerts: string[];
    provider_details: Record<string, any>;
}

const SEV_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
    critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
    high: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', icon: AlertTriangle },
    medium: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
    low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
};

export default function StatusPage() {
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [health, setHealth] = useState<ProviderHealth[]>([]);
    const [alertCounts, setAlertCounts] = useState<Record<string, number>>({});
    const [totalAlerts, setTotalAlerts] = useState(0);
    const [totalHealth, setTotalHealth] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sevFilter, setSevFilter] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch recent alerts (last 50, newest first)
            let q = supabase.from('system_alerts').select('*').order('created_at', { ascending: false }).limit(50);
            if (sevFilter) q = q.eq('severity', sevFilter);
            const { data: alertData } = await q;
            setAlerts(alertData || []);

            // Fetch alert severity breakdown
            const { count: totalA } = await supabase.from('system_alerts').select('*', { count: 'exact', head: true });
            setTotalAlerts(totalA || 0);

            // Count by severity
            const counts: Record<string, number> = {};
            for (const sev of ['critical', 'high', 'medium', 'low']) {
                const { count } = await supabase.from('system_alerts').select('*', { count: 'exact', head: true }).eq('severity', sev);
                counts[sev] = count || 0;
            }
            setAlertCounts(counts);

            // Fetch latest provider health snapshots
            const { data: healthData } = await supabase.from('provider_health_log').select('*').order('created_at', { ascending: false }).limit(20);
            setHealth(healthData || []);

            const { count: totalH } = await supabase.from('provider_health_log').select('*', { count: 'exact', head: true });
            setTotalHealth(totalH || 0);

            setLastRefresh(new Date());
        } catch (e) {
            console.error('StatusPage fetch error:', e);
        }
        setLoading(false);
    }, [sevFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const latestHealth = health[0];
    const overallStatus = latestHealth
        ? latestHealth.unavailable_providers === 0 && latestHealth.degraded_providers === 0
            ? 'operational' : latestHealth.unavailable_providers > 0 ? 'partial_outage' : 'degraded'
        : 'unknown';

    const statusConfig = {
        operational: { label: 'All Systems Operational', color: 'text-emerald-400', bg: 'border-emerald-500/30 bg-emerald-500/5', icon: CheckCircle },
        degraded: { label: 'Partial Degradation', color: 'text-amber-400', bg: 'border-amber-500/30 bg-amber-500/5', icon: AlertTriangle },
        partial_outage: { label: 'Partial Outage', color: 'text-red-400', bg: 'border-red-500/30 bg-red-500/5', icon: XCircle },
        unknown: { label: 'Status Unknown', color: 'text-gray-400', bg: 'border-white/10 bg-white/5', icon: Activity },
    };

    const sc = statusConfig[overallStatus];

    return (
        <div className="min-h-screen pt-8 pb-20">
            {/* Overall Status Banner */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className={`p-6 rounded-2xl border ${sc.bg} flex items-center gap-4`}>
                    <sc.icon className={`w-8 h-8 ${sc.color}`} />
                    <div className="flex-1">
                        <h1 className={`text-2xl font-black ${sc.color}`}>{sc.label}</h1>
                        <p className="text-white/40 text-sm mt-1">
                            {totalAlerts.toLocaleString()} alerts tracked · {totalHealth.toLocaleString()} health checks
                            · Last refresh {lastRefresh.toLocaleTimeString()}
                        </p>
                    </div>
                    <button onClick={fetchData} disabled={loading} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <RefreshCw className={`w-5 h-5 text-white/60 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </motion.div>

            {/* Provider Status Grid */}
            {latestHealth && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
                    <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Server className="w-5 h-5 text-cyan-400" /> Provider Status</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatBox label="Total Providers" value={latestHealth.total_providers} color="text-white" />
                        <StatBox label="Available" value={latestHealth.available_providers} color="text-emerald-400" />
                        <StatBox label="Degraded" value={latestHealth.degraded_providers} color="text-amber-400" />
                        <StatBox label="Unavailable" value={latestHealth.unavailable_providers} color="text-red-400" />
                    </div>
                    {latestHealth.provider_details && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(latestHealth.provider_details).map(([name, details]: [string, any]) => (
                                <div key={name} className={`p-3 rounded-xl border ${details.status === 'available' ? 'border-emerald-500/20 bg-emerald-500/5' : details.status === 'degraded' ? 'border-amber-500/20 bg-amber-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${details.status === 'available' ? 'bg-emerald-400' : details.status === 'degraded' ? 'bg-amber-400' : 'bg-red-400'}`} />
                                        <span className="text-white font-mono text-xs font-bold uppercase">{name}</span>
                                    </div>
                                    {details.latency_ms && <span className="text-white/30 text-xs ml-4">{details.latency_ms}ms</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Alert Severity Breakdown */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-violet-400" /> Alert Breakdown</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['critical', 'high', 'medium', 'low'].map(sev => {
                        const cfg = SEV_CONFIG[sev];
                        return (
                            <button key={sev} onClick={() => setSevFilter(sevFilter === sev ? null : sev)}
                                className={`p-4 rounded-xl border transition-all ${sevFilter === sev ? cfg.bg + ' ring-1 ring-current' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                                <div className={`text-2xl font-black ${cfg.color}`}>{alertCounts[sev] || 0}</div>
                                <div className="text-white/40 text-xs uppercase tracking-wider mt-1">{sev}</div>
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Recent Alerts Feed */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Recent Alerts {sevFilter && <span className="text-xs text-white/40 ml-2">filtered: {sevFilter}</span>}
                </h2>
                <div className="space-y-2">
                    {alerts.length === 0 && (
                        <div className="text-center py-12 text-white/30">No alerts found</div>
                    )}
                    {alerts.map((alert, i) => {
                        const cfg = SEV_CONFIG[alert.severity] || SEV_CONFIG.low;
                        const Icon = cfg.icon;
                        return (
                            <motion.div key={alert.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                                className={`p-3 rounded-xl border ${cfg.bg} flex items-start gap-3`}>
                                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-xs font-bold uppercase ${cfg.color}`}>{alert.severity}</span>
                                        <span className="text-white/20 text-xs">·</span>
                                        <span className="text-white/40 text-xs font-mono">{alert.type}</span>
                                        {alert.ack && <span className="text-emerald-400/60 text-xs">✓ ack</span>}
                                    </div>
                                    <p className="text-white/70 text-sm mt-1 truncate">{alert.message}</p>
                                </div>
                                <span className="text-white/20 text-xs flex-shrink-0 whitespace-nowrap">{timeAgo(alert.created_at)}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Health Timeline */}
            {health.length > 1 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
                    <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-cyan-400" /> Health Timeline</h2>
                    <div className="flex gap-1 items-end h-20">
                        {health.slice(0, 20).reverse().map((h) => {
                            const pct = h.total_providers > 0 ? (h.available_providers / h.total_providers) * 100 : 0;
                            const color = pct === 100 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
                            return (
                                <div key={h.id} className="flex-1 flex flex-col items-center gap-1" title={`${pct.toFixed(0)}% at ${new Date(h.timestamp).toLocaleTimeString()}`}>
                                    <div className={`w-full rounded-sm ${color}`} style={{ height: `${Math.max(pct * 0.8, 4)}px` }} />
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between text-white/20 text-xs mt-1">
                        <span>Older</span><span>Now</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className={`text-3xl font-black ${color}`}>{value}</div>
            <div className="text-white/40 text-xs mt-1">{label}</div>
        </div>
    );
}

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
}
