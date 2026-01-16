import { motion } from "framer-motion";
import React from "react";
import philosophyBanner from "../assets/philosophy-banner.png";

const Philosophy: React.FC = () => {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        >
          <img
            src={philosophyBanner}
            alt="Prime AI Philosophy - A magical garden where human creativity meets AI innovation"
            className="w-full h-auto object-cover"
            loading="lazy"
            decoding="async"
          />
        </motion.div>

        {/* Optional: English Translation Below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 text-center max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-white mb-6">
            Philosophy & Vision
          </h3>
          <div className="text-gray-400 leading-relaxed space-y-4">
            <p className="italic">
              "Each solution is delivered as an act of passage. It carries the
              momentum of a young spirit: curious, free, moving—one who learns,
              seeks, and transforms without ever staying still."
            </p>
            <p>
              Every deployment is not just an end, but a birth—the moment where
              intention becomes real, where ideas embrace the world as it is.
            </p>
            <p>
              That this unfolding remains faithful to the essential: to build
              simply, justly, and vividly. To advance without losing meaning. To
              construct without forgetting why.
            </p>
            <p className="text-cyan-400 font-semibold">
              May it be useful. May it be true. May it continue.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Philosophy;
