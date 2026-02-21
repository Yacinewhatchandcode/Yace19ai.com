import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LiveVisitorCounter() {
    const [visitors, setVisitors] = useState(0);

    useEffect(() => {
        // Base traffic baseline
        const base = 142;
        let current = base + Math.floor(Math.random() * 20);
        setVisitors(current);

        const interval = setInterval(() => {
            const change = Math.floor(Math.random() * 5) - 2; // -2 to +2

            setVisitors(prev => {
                let next = prev + change;
                // keep boundaries realistic
                if (next < 110) next += 5;
                if (next > 210) next -= 5;

                return next;
            });
        }, 3500);

        return () => clearInterval(interval);
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
