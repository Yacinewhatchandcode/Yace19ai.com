
import { motion } from 'framer-motion';
import ProjectPortfolio from '../components/ProjectPortfolio';

export default function FleetPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="pt-12"
        >
            {/* The ProjectPortfolio was just renamed internally to Active Swarm Nodes, so we can just render it here */}
            <ProjectPortfolio />
        </motion.div>
    );
}
