import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, ArrowLeft, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    featured: boolean;
    author: string;
    read_time: string;
    tags: string[];
    published_at: string;
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.from('blog_posts')
            .select('*')
            .eq('published', true)
            .order('published_at', { ascending: false })
            .then(({ data }) => {
                setPosts(data || []);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (selectedPost) return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8 max-w-3xl mx-auto">
            <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 font-mono text-sm cursor-pointer">
                <ArrowLeft size={16} /> Back to articles
            </button>
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">{selectedPost.category}</span>
            <h1 className="text-3xl font-black text-white mt-2 mb-4">{selectedPost.title}</h1>
            <div className="flex items-center gap-4 text-xs text-gray-500 font-mono mb-8">
                <span>{selectedPost.author}</span>
                <span>•</span>
                <span>{selectedPost.read_time}</span>
                <span>•</span>
                <span>{new Date(selectedPost.published_at).toLocaleDateString()}</span>
            </div>
            <div className="prose prose-invert prose-cyan max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                {selectedPost.content}
            </div>
            {selectedPost.tags?.length > 0 && (
                <div className="flex items-center gap-2 mt-8 flex-wrap">
                    <Tag size={12} className="text-gray-500" />
                    {selectedPost.tags.map(t => (
                        <span key={t} className="text-[10px] font-mono text-cyan-500 bg-cyan-900/20 px-2 py-0.5 rounded">{t}</span>
                    ))}
                </div>
            )}
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-8">
            <div className="flex items-center gap-3 mb-8">
                <BookOpen className="text-cyan-400" size={24} />
                <h1 className="text-2xl font-black text-white font-display tracking-tight">Sovereign Intelligence Log</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post, i) => (
                    <motion.button
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setSelectedPost(post)}
                        className="text-left glass-panel border border-white/10 rounded-2xl p-6 hover:border-cyan-500/40 hover:bg-cyan-500/[0.03] transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2 py-0.5 rounded">{post.category}</span>
                            {post.featured && <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">★ Featured</span>}
                        </div>
                        <h2 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{post.title}</h2>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-600 font-mono">
                            <span>{post.author}</span>
                            <Clock size={10} /> <span>{post.read_time}</span>
                        </div>
                    </motion.button>
                ))}
            </div>
            {posts.length === 0 && (
                <p className="text-gray-500 font-mono text-sm text-center mt-12">No articles published yet.</p>
            )}
        </motion.div>
    );
}
