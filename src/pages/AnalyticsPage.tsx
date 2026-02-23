import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Eye, Globe, Monitor, Smartphone, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalyticsData {
    totalPageviews: number;
    totalSessions: number;
    uniqueVisitors: number;
    topPages: { path: string; count: number }[];
    topCountries: { country: string; count: number }[];
    deviceBreakdown: { desktop: number; mobile: number; tablet: number };
    topBrowsers: { browser: string; count: number }[];
    recentSessions: { visitor_id: string; current_path: string; pageview_count: number; device_type: string; country: string; started_at: string }[];
}

export default function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [pvRes, sessRes] = await Promise.all([
                supabase.from('analytics_pageviews').select('path, country, device_type, browser, visitor_id'),
                supabase.from('analytics_sessions').select('*').order('last_seen_at', { ascending: false }).limit(20),
            ]);

            const pvs = pvRes.data || [];
            const sessions = sessRes.data || [];

            // Aggregate
            const pageCounts: Record<string, number> = {};
            const countryCounts: Record<string, number> = {};
            const browserCounts: Record<string, number> = {};
            const devices = { desktop: 0, mobile: 0, tablet: 0 };
            const uniqueVisitors = new Set<string>();

            for (const pv of pvs) {
                pageCounts[pv.path] = (pageCounts[pv.path] || 0) + 1;
                if (pv.country) countryCounts[pv.country] = (countryCounts[pv.country] || 0) + 1;
                if (pv.browser) browserCounts[pv.browser] = (browserCounts[pv.browser] || 0) + 1;
                if (pv.device_type && pv.device_type in devices) devices[pv.device_type as keyof typeof devices]++;
                if (pv.visitor_id) uniqueVisitors.add(pv.visitor_id);
            }



            setData({
                totalPageviews: pvs.length,
                totalSessions: sessions.length,
                uniqueVisitors: uniqueVisitors.size,
                topPages: Object.entries(pageCounts).sort(([, a], [, b]) => b - a).slice(0, 8).map(([path, count]) => ({ path, count })),
                topCountries: Object.entries(countryCounts).sort(([, a], [, b]) => b - a).slice(0, 8).map(([country, count]) => ({ country, count })),
                deviceBreakdown: devices,
                topBrowsers: Object.entries(browserCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([browser, count]) => ({ browser, count })),
                recentSessions: sessions.map((s: any) => ({
                    visitor_id: s.visitor_id?.slice(0, 8) || '...',
                    current_path: s.current_path,
                    pageview_count: s.pageview_count,
                    device_type: s.device_type || 'unknown',
                    country: s.country || '??',
                    started_at: s.started_at,
                })),
            });
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!data) return null;

    const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => (
        <div className={`glass-panel border border-${color}-500/20 rounded-2xl p-5 flex flex-col gap-2`}>
            <div className="flex items-center gap-2">
                <Icon size={16} className={`text-${color}-400`} />
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">{label}</span>
            </div>
            <span className="text-3xl font-black text-white font-display">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        </div>
    );

    const Bar = ({ label, value, max }: { label: string; value: number; max: number }) => (
        <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-400 w-24 truncate" title={label}>{label}</span>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max((value / max) * 100, 2)}%` }} transition={{ duration: 0.6 }} className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full" />
            </div>
            <span className="text-xs font-mono text-gray-500 w-10 text-right">{value}</span>
        </div>
    );

    const maxPage = data.topPages[0]?.count || 1;
    const maxCountry = data.topCountries[0]?.count || 1;
    const totalDevices = data.deviceBreakdown.desktop + data.deviceBreakdown.mobile + data.deviceBreakdown.tablet || 1;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4 sm:pt-8 flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
                <BarChart3 className="text-cyan-400" size={24} />
                <h1 className="text-lg sm:text-2xl font-black text-white font-display">Sovereign Analytics</h1>
                <span className="text-[9px] font-mono text-green-500 bg-green-900/30 border border-green-500/20 px-2 py-0.5 rounded uppercase">Live Data</span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <StatCard icon={Eye} label="Total Pageviews" value={data.totalPageviews} color="cyan" />
                <StatCard icon={Users} label="Unique Visitors" value={data.uniqueVisitors} color="violet" />
                <StatCard icon={TrendingUp} label="Sessions" value={data.totalSessions} color="emerald" />
                <StatCard icon={Clock} label="Avg Views/Session" value={data.totalSessions > 0 ? (data.totalPageviews / data.totalSessions).toFixed(1) : '0'} color="amber" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Top Pages */}
                <div className="glass-panel border border-white/10 rounded-2xl p-5">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-4">Top Pages</h3>
                    <div className="flex flex-col gap-3">
                        {data.topPages.map(p => <Bar key={p.path} label={p.path} value={p.count} max={maxPage} />)}
                    </div>
                </div>

                {/* Countries */}
                <div className="glass-panel border border-white/10 rounded-2xl p-5">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-violet-400 mb-4 flex items-center gap-2"><Globe size={12} /> Top Countries</h3>
                    <div className="flex flex-col gap-3">
                        {data.topCountries.map(c => <Bar key={c.country} label={c.country} value={c.count} max={maxCountry} />)}
                    </div>
                </div>

                {/* Devices */}
                <div className="glass-panel border border-white/10 rounded-2xl p-5">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2"><Monitor size={12} /> Devices</h3>
                    <div className="flex flex-col gap-4">
                        {Object.entries(data.deviceBreakdown).map(([device, count]) => (
                            <div key={device} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {device === 'mobile' ? <Smartphone size={14} className="text-violet-400" /> : <Monitor size={14} className="text-cyan-400" />}
                                    <span className="text-sm font-mono text-gray-300 capitalize">{device}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full" style={{ width: `${(count / totalDevices) * 100}%` }} />
                                    </div>
                                    <span className="text-xs font-mono text-gray-500">{Math.round((count / totalDevices) * 100)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Sessions */}
                <div className="glass-panel border border-white/10 rounded-2xl p-5">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-4">Recent Sessions</h3>
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        {data.recentSessions.slice(0, 10).map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-xs font-mono py-1 border-b border-white/5 last:border-0">
                                <span className="text-gray-400">{s.visitor_id}…</span>
                                <span className="text-gray-300 truncate max-w-[100px]">{s.current_path}</span>
                                <span className="text-cyan-500">{s.pageview_count}pv</span>
                                <span className="text-gray-600">{s.country}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
