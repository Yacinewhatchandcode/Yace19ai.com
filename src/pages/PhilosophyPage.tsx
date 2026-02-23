
import { motion } from 'framer-motion';
import Philosophy from '../components/Philosophy';
import AgentStack from '../components/AgentStack';
import Achievements from '../components/Achievements';
import LeadCaptureForm from '../components/LeadCaptureForm';

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
                <div
                    className="absolute inset-0 bg-violet-500/5 -z-10"
                    style={{ clipPath: 'polygon(0 0, 100% 10%, 100% 100%, 0 90%)' }}
                />
                <AgentStack />
            </div>

            <Achievements />

            <LeadCaptureForm />
        </motion.div>
    );
}

