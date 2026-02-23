import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import philosophyBanner from "../assets/philosophy-banner.webp";
import { supabase } from "../lib/supabase";

interface ContentItem {
  key: string;
  value_en: string;
  value_fr?: string;
}

export default function Philosophy() {
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from('site_content').select('key, value_en').eq('section', 'philosophy').order('sort_order').then(({ data }) => {
      if (data && data.length > 0) {
        const map: Record<string, string> = {};
        data.forEach((item: ContentItem) => { map[item.key] = item.value_en; });
        setContent(map);
      }
    });
  }, []);

  const title = content['title'] || 'Philosophy & Vision';
  const quote = content['quote'] || 'Each solution is delivered as an act of passage. It carries the momentum of a young spirit: curious, free, moving—one who learns, seeks, and transforms without ever staying still.';
  const p1 = content['paragraph_1'] || 'Every deployment is not just an end, but a birth—the moment where intention becomes real, where ideas embrace the world as it is.';
  const p2 = content['paragraph_2'] || 'That this unfolding remains faithful to the essential: to build simply, justly, and vividly. To advance without losing meaning. To construct without forgetting why.';
  const cta = content['cta'] || 'May it be useful. May it be true. May it continue.';

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <img src={philosophyBanner} alt="Prime AI Philosophy - A magical garden where human creativity meets AI innovation" className="w-full h-auto object-cover" loading="lazy" decoding="async" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mt-12 text-center max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>
          <div className="text-gray-400 leading-relaxed space-y-4">
            <p className="italic">"{quote}"</p>
            <p>{p1}</p>
            <p>{p2}</p>
            <p className="text-cyan-400 font-semibold">{cta}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
