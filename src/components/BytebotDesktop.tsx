import React, { useState, useEffect } from 'react';
import { Monitor, Maximize2, Minimize2, ExternalLink, WifiOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BYTEBOT_VNC_URL = 'http://31.97.52.22:9990/vnc.html';

interface BytebotDesktopProps {
    defaultExpanded?: boolean;
    vncUrl?: string;
}

export const BytebotDesktop: React.FC<BytebotDesktopProps> = ({
    defaultExpanded = false,
    vncUrl = BYTEBOT_VNC_URL,
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [vpsStatus, setVpsStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    useEffect(() => {
        // Check VPS status from system_alerts
        (async () => {
            try {
                const { data } = await supabase.from('system_alerts')
                    .select('type, severity, message')
                    .ilike('message', '%VPS%')
                    .order('created_at', { ascending: false })
                    .limit(1);
                if (data && data.length > 0 && data[0].severity === 'critical') {
                    setVpsStatus('offline');
                } else {
                    setVpsStatus('online');
                }
            } catch {
                setVpsStatus('online');
            }
        })();
    }, []);

    return (
        <div
            className={`
                relative overflow-hidden flex flex-col rounded-2xl border border-indigo-500/20
                bg-gray-900/80 backdrop-blur-xl shadow-[0_0_30px_rgba(99,102,241,0.15)]
                ${isExpanded ? 'fixed inset-4 z-50' : 'w-full h-64 md:h-80'}
                transition-all duration-300
            `}
        >
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-indigo-500/5 shrink-0">
                <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold tracking-widest uppercase text-indigo-300">
                        Bytebot Ubuntu Desktop
                    </span>
                    <span className={`flex items-center gap-1 ml-2 text-[9px] font-mono rounded-full px-2 py-0.5 ${vpsStatus === 'online'
                        ? 'text-green-400 bg-green-900/30 border border-green-500/20'
                        : vpsStatus === 'offline'
                            ? 'text-red-400 bg-red-900/30 border border-red-500/20'
                            : 'text-yellow-400 bg-yellow-900/30 border border-yellow-500/20'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${vpsStatus === 'online' ? 'bg-green-500 animate-pulse'
                            : vpsStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                            }`} />
                        {vpsStatus === 'online' ? 'LIVE' : vpsStatus === 'offline' ? 'OFFLINE' : 'CHECKING'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => window.open(vncUrl, '_blank')} className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-indigo-400 transition-all" title="Open in new tab">
                        <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-indigo-400 transition-all" title={isExpanded ? 'Minimize' : 'Maximize'}>
                        {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-black relative overflow-hidden">
                {vpsStatus === 'offline' ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 p-4">
                        <WifiOff className="text-red-500" size={32} />
                        <p className="text-xs text-gray-500 font-mono">VPS node offline — waiting for reconnection</p>
                        <p className="text-[10px] text-gray-600">31.97.52.22:9990</p>
                    </div>
                ) : (
                    <iframe src={vncUrl} className="w-full h-full border-0" title="Bytebot VNC Desktop" allow="fullscreen" />
                )}
            </div>

            <div className="px-4 py-1.5 bg-black/40 border-t border-white/5 flex items-center justify-between shrink-0">
                <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest">
                    Encrypted VNC · Sovereign VPS
                </span>
                <span className="text-[9px] font-mono text-white/20">31.97.52.22:9990</span>
            </div>
        </div>
    );
};

export default BytebotDesktop;
