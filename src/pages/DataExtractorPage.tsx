import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ExtractionJob {
    id: string;
    source_url: string;
    job_type: string;
    status: string;
    total_items: number;
    created_at: string;
}

interface ExtractedItem {
    id: string;
    job_id: string;
    item_index: number;
    title: string | null;
    description: string | null;
    image_url: string | null;
    price: string | null;
    specs: Record<string, any>;
    source_page_url: string | null;
}

export default function DataExtractorPage() {
    const [jobs, setJobs] = useState<ExtractionJob[]>([]);
    const [items, setItems] = useState<ExtractedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [{ data: j }, { data: i }] = await Promise.all([
                supabase.from('extraction_jobs').select('*').order('created_at', { ascending: false }),
                supabase.from('extracted_items').select('*').order('item_index', { ascending: true }),
            ]);
            setJobs(j || []);
            setItems(i || []);
            if (j && j.length > 0) setSelectedJob(j[0].id);
            setLoading(false);
        })();
    }, []);

    const filteredItems = selectedJob ? items.filter(i => i.job_id === selectedJob) : items;

    return (
        <div className="min-h-screen pt-8 pb-20">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                    <Globe className="w-8 h-8 text-teal-400" />
                    <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Data Extractor</span>
                </h1>
                <p className="text-white/40 text-sm">{jobs.length} extraction jobs · {items.length} items scraped</p>
            </motion.div>

            {/* Jobs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {jobs.map(job => (
                    <button key={job.id} onClick={() => setSelectedJob(job.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-mono transition-all ${selectedJob === job.id ? 'bg-teal-500/10 border border-teal-500/30 text-teal-400' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'}`}>
                        <div className="truncate max-w-[200px]">{new URL(job.source_url).hostname}</div>
                        <div className="text-[10px] text-white/20">{job.total_items} items · {job.status}</div>
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="text-center py-12 text-white/30">Loading extracted data...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item, i) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-teal-500/30 transition-colors">
                            {item.image_url && (
                                <div className="h-40 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center overflow-hidden">
                                    <img src={item.image_url} alt={item.title || ''} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{item.title || `Item #${item.item_index}`}</h3>
                                {item.description && <p className="text-white/40 text-xs mb-2 line-clamp-3">{item.description}</p>}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {item.price && <span className="text-emerald-400 font-bold text-sm">{item.price}</span>}
                                    {item.source_page_url && (
                                        <a href={item.source_page_url} target="_blank" rel="noreferrer" className="text-cyan-400 text-xs flex items-center gap-1 hover:underline">
                                            <ExternalLink className="w-3 h-3" /> Source
                                        </a>
                                    )}
                                </div>
                                {Object.keys(item.specs || {}).length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {Object.entries(item.specs).slice(0, 4).map(([k, v]) => (
                                            <span key={k} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/30 border border-white/5">{k}: {String(v)}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {filteredItems.length === 0 && <div className="col-span-3 text-center py-12 text-white/30">No items in this extraction</div>}
                </div>
            )}
        </div>
    );
}
