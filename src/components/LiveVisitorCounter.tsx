import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function LiveVisitorCounter() {
    const [visitors, setVisitors] = useState(1);

    useEffect(() => {
        // Initialize Supabase realtime presence
        const roomOne = supabase.channel('online-visitors', {
            config: { presence: { key: 'user' } }
        });

        roomOne
            .on('presence', { event: 'sync' }, () => {
                const newState = roomOne.presenceState();
                // Count unique connections across the world
                let totalConnected = 0;
                for (const user in newState) {
                    totalConnected += newState[user].length;
                }
                // Base 3 representing core devs + orchestrator, plus real live
                setVisitors(Math.max(1, totalConnected));
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string, newPresences: any }) => {
                console.log('join', key, newPresences);
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string, leftPresences: any }) => {
                console.log('leave', key, leftPresences);
            })
            .subscribe(async (status: string) => {
                if (status === 'SUBSCRIBED') {
                    // Track this current client
                    await roomOne.track({
                        online_at: new Date().toISOString(),
                        client_id: crypto.randomUUID(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(roomOne);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-green-500/30 backdrop-blur-md"
        >
            <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>

            <div className="flex flex-col">
                <span className="font-mono text-[10px] text-green-400 font-black tracking-widest leading-none" style={{ textShadow: "0 0 10px rgba(74, 222, 128, 0.4)" }}>
                    {visitors} LIVE VISITIORS
                </span>
            </div>
        </motion.div>
    );
}
