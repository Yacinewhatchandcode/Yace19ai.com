import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Users, Eye, Globe, Monitor, Smartphone, Clock, TrendingUp, RefreshCw, Activity } from 'lucide-react';

interface AnalyticsApiResponse {
    success: boolean;
    timestamp: string;
    realtime: {
        active_visitors: number;
        by_domain: Record<string, number>;
        active_pages: Record<string, { path: string; title: string | null; count: number }[]>;
        active_detail: Array<{
            domain: string;
            path: string;
            title: string | null;
            country: string | null;
            city: string | null;
            device: string | null;
            browser: string | null;
            os: string | null;
            entry_path: string;
            started_at: string;
            last_seen: string;
            pageviews: number;
            referrer: string | null;
        }>;
    };
    period: {
        label: string;
        unique_visitors: number;
        total_pageviews: number;
        total_sessions: number;
        avg_duration_seconds: number;
        bounce_rate: number;
    };
    top_pages: { path: string; title: string | null; views: number }[];
    top_referrers: { domain: string; count: number }[];
    countries: { country: string; count: number }[];
    devices: Record<string, number>;
    browsers: Record<string, number>;
    os_breakdown: Record<string, number>;
    languages: Record<string, number>;
    time_series: { time: string; count: number }[];
}

const COUNTRY_FLAGS: Record<string, string> = {
    FR: '🇫🇷', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', ES: '🇪🇸', IT: '🇮🇹',
    JP: '🇯🇵', CN: '🇨🇳', IN: '🇮🇳', BR: '🇧🇷', CA: '🇨🇦', AU: '🇦🇺',
    NL: '🇳🇱', SE: '🇸🇪', CH: '🇨🇭', BE: '🇧🇪', AT: '🇦🇹', PT: '🇵🇹',
    AE: '🇦🇪', SA: '🇸🇦', MA: '🇲🇦', DZ: '🇩🇿', TN: '🇹🇳',
};

const OS_ICONS: Record<string, string> = {
    'Windows': '🪟', 'macOS': '🍎', 'Linux': '🐧', 'Android': '🤖', 'iOS': '📱',
};

// ═══════════════════════════════════════════════════════════════
// ANALYTICS DASHBOARD — Powered by Prime AI Realtime API
// Fetches from https://amlazr.com/api/analytics/realtime
// ═══════════════════════════════════════════════════════════════

const API_BASE = 'https://amlazr.com/api/analytics/realtime';
const REFRESH_INTERVAL = 10000; // 10s

export default function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d');
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchData = useCallback(async () => {
        try {
            const params = new URLSearchParams({ period, domain: 'yace19ai.com' });
            const res = await fetch(`${API_BASE}?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.success) {
                setData(json);
                setError(null);
            } else {
                setError(json.error || 'Failed to fetch analytics');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLastUpdate(new Date());
        }
    }, [period]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading && !data) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error && !data) return (
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={fetchData} className="mt-3 text-xs text-white/50 hover:text-white/80 underline">Retry</button>
        </div>
    );

    if (!data) return null;

    const maxTimeSeriesCount = Math.max(1, ...(data.time_series?.map(t => t.count) || [1]));

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4 sm:pt-8 flex flex-col gap-4 sm:gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <BarChart3 className="text-cyan-400" size={24} />
                    <h1 className="text-lg sm:text-2xl font-black text-white font-display">Sovereign Analytics</h1>
                    <div className="flex items-center gap-1.5">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400/50 animate-ping" />
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">Live</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Period selector */}
                    <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                        {(['24h', '7d', '30d'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-[10px] font-bold transition-all ${period === p
                                    ? 'bg-cyan-500/20 text-cyan-300'
                                    : 'text-white/30 hover:text-white/60'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button onClick={fetchData} className="text-white/20 hover:text-white/60 transition-colors">
                        <RefreshCw size={14} />
                    </button>
                    <span className="text-[9px] font-mono text-white/15">
                        {lastUpdate.toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* Real-time Hero */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-emerald-500/5 border border-indigo-500/15 rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-5">
                    <motion.div
                        key={data.realtime.active_visitors}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-5xl sm:text-7xl font-black bg-gradient-to-r from-indigo-300 to-emerald-300 bg-clip-text text-transparent"
                    >
                        {data.realtime.active_visitors}
                    </motion.div>
                    <div>
                        <p className="text-white/50 text-sm font-medium flex items-center gap-2">
                            <Activity size={14} className="text-emerald-400" />
                            Active Now
                        </p>
                        <p className="text-white/20 text-xs">real-time visitors on yace19ai.com</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <StatCard icon={Eye} label="Page Views" value={data.period.total_pageviews.toLocaleString()} color="cyan" sub={period} />
                <StatCard icon={Users} label="Unique Visitors" value={data.period.unique_visitors.toLocaleString()} color="violet" sub={period} />
                <StatCard icon={TrendingUp} label="Sessions" value={data.period.total_sessions.toLocaleString()} color="emerald" sub={period} />
                <StatCard icon={Clock} label="Avg Duration" value={formatDuration(data.period.avg_duration_seconds)} color="amber" sub={period} />
                <StatCard icon={BarChart3} label="Bounce Rate" value={`${data.period.bounce_rate}%`} color={data.period.bounce_rate > 60 ? 'red' : 'emerald'} sub={period} />
            </div>

            {/* Traffic Over Time */}
            {data.time_series.length > 0 && (
                <div className="glass-panel border border-white/10 rounded-2xl p-5">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-4">📊 Traffic Over Time</h3>
                    <div className="h-[160px] flex items-end gap-[2px]">
                        {data.time_series.map((t, i) => (
                            <div key={i} className="flex-1 group relative" style={{ height: '100%' }}>
                                <div className="absolute bottom-0 w-full rounded-t transition-all group-hover:opacity-80"
                                    style={{
                                        height: `${Math.max(4, (t.count / maxTimeSeriesCount) * 100)}%`,
                                        background: `linear-gradient(to top, rgba(6,182,212,0.6), rgba(6,182,212,0.15))`,
                                    }}
                                />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    {t.count} views · {t.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Grid: Pages + Countries + Devices + Browsers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Top Pages */}
                <div className="glass-panel border border-white/10 rounded-2xl p-5">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-4">Top Pages</h3>
                    <div className="flex flex-col gap-2">
                        {data.top_pages.slice(0, 8).map((p, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 font-mono text-xs truncate max-w-[200px]">{p.path}</span>
                                <span className="text-white/60 font-mono text-xs font-bold">{p.views}</span>
                            </div>
                        ))}
                        {data.top_pages.length === 0 && <p className="text-white/20 text-xs">No data yet</p>}
                    </div>
                </div>

                {/* Countries */}
                <div className="glass-panel border border-white/10 rounded-2xl p-5">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-violet-400 mb-4 flex items-center gap-2">
                        <Globe size={12} /> Countries
                    </h3>
                    <div className="flex flex-col gap-2">
                        {data.countries.slice(0, 8).map((c, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">{COUNTRY_FLAGS[c.country] || '🌍'} {c.country}</span>
                                <span className="text-white/60 font-mono text-xs font-bold">{c.count}</span>
                            </div>
                        ))}
                        {data.countries.length === 0 && <p className="text-white/20 text-xs">No geo data</p>}
                    </div>
                </div>

                {/* Devices + OS */}
                <div className="glass-panel border border-white/10 rounded-2xl p-5">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                        <Monitor size={12} /> Devices & OS
                    </h3>
                    <div className="flex flex-col gap-2 mb-4">
                        {Object.entries(data.devices).map(([device, count]) => (
                            <div key={device} className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2">
                                    {device === 'mobile' ? <Smartphone size={12} className="text-violet-400" /> : <Monitor size={12} className="text-cyan-400" />}
                                    <span className="capitalize">{device}</span>
                                </span>
                                <span className="text-white/60 font-mono text-xs font-bold">{count}</span>
                            </div>
                        ))}
                        {Object.keys(data.devices).length === 0 && <p className="text-white/20 text-xs">No device data</p>}
                    </div>
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/30 mb-2">Operating Systems</h4>
                    <div className="flex flex-col gap-1">
                        {Object.entries(data.os_breakdown || {}).map(([os, count]) => (
                            <div key={os} className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{OS_ICONS[os] || '💻'} {os}</span>
                                <span className="text-white/40 font-mono">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Browsers + Referrers */}
                <div className="glass-panel border border-white/10 rounded-2xl p-5">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-4">Browsers</h3>
                    <div className="flex flex-col gap-2 mb-4">
                        {Object.entries(data.browsers).map(([browser, count]) => (
                            <div key={browser} className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">{browser}</span>
                                <span className="text-white/60 font-mono text-xs font-bold">{count}</span>
                            </div>
                        ))}
                        {Object.keys(data.browsers).length === 0 && <p className="text-white/20 text-xs">No browser data</p>}
                    </div>
                    {data.top_referrers.length > 0 && (
                        <>
                            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/30 mb-2">Top Referrers</h4>
                            <div className="flex flex-col gap-1">
                                {data.top_referrers.slice(0, 5).map((r, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 truncate max-w-[150px]">{r.domain}</span>
                                        <span className="text-white/40 font-mono">{r.count}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Live Visitor Feed */}
            <div className="glass-panel border border-white/10 rounded-2xl p-5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Visitor Feed
                </h3>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                        {data.realtime.active_detail.length > 0 ? (
                            data.realtime.active_detail.map((v, i) => (
                                <motion.div
                                    key={`${v.domain}-${v.path}-${i}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center justify-between text-xs font-mono py-2 px-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg border border-white/[0.04] transition-all"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-white/80 truncate max-w-[200px]">{v.path}</span>
                                        {v.country && <span className="text-white/30">{COUNTRY_FLAGS[v.country] || v.country}</span>}
                                        {v.device && <span className="text-white/20">{v.device === 'mobile' ? '📱' : '🖥️'}</span>}
                                    </div>
                                    <span className="text-white/15 text-[10px]">{timeAgo(v.last_seen)}</span>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-white/20 text-sm">
                                <p className="text-2xl mb-2">👀</p>
                                <p>No active visitors right now</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

function StatCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string; color: string; sub: string }) {
    return (
        <div className={`glass-panel border border-${color}-500/20 rounded-2xl p-4 flex flex-col gap-1`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon size={14} className={`text-${color}-400`} />
                    <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500">{label}</span>
                </div>
                <span className="text-[8px] font-mono text-white/15 uppercase">{sub}</span>
            </div>
            <span className="text-2xl font-black text-white font-display">{value}</span>
        </div>
    );
}

function formatDuration(seconds: number): string {
    if (!seconds || seconds === 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}
