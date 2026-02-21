
import { motion } from 'framer-motion';
import Philosophy from '../components/Philosophy';
import AgentStack from '../components/AgentStack';
import Achievements from '../components/Achievements';

export default function PhilosophyPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-24 pt-12"
        >
            <Philosophy />

            <div className="relative">
                <div className="absolute inset-0 bg-violet-500/5 clip-path-polygon-[0_0,100%_10%,100%_100%,0_90%] -z-10"></div>
                <AgentStack />
            </div>

            <Achievements />
        </motion.div>
    );
}
