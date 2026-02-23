import { useEffect, useState } from 'react';
import { Github, Twitter, Linkedin, Mail, ExternalLink, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SocialLink {
    id: string;
    platform: string;
    url: string;
    icon: string;
    label: string;
    sort_order: number;
    active: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    github: <Github size={20} />,
    twitter: <Twitter size={20} />,
    linkedin: <Linkedin size={20} />,
    mail: <Mail size={20} />,
    users: <Users size={20} />,
};

export default function Footer() {
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [tagline, setTagline] = useState('A Human-AI Journey through Multi-Agent Intelligence.');
    const [subtitle, setSubtitle] = useState('Architecting the Neuronal Future.');
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        supabase.from('social_links').select('*').eq('active', true).order('sort_order').then(({ data }) => {
            if (data && data.length > 0) setLinks(data);
        });
        supabase.from('site_content').select('key, value_en').eq('section', 'footer').order('sort_order').then(({ data }) => {
            data?.forEach((item: { key: string; value_en: string }) => {
                if (item.key === 'tagline') setTagline(item.value_en);
                if (item.key === 'subtitle') setSubtitle(item.value_en);
            });
        });
    }, []);

    return (
        <footer className="relative py-16 px-4 border-t border-white/5">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-950 to-transparent pointer-events-none" />
            <div className="max-w-7xl mx-auto relative">
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <span className="font-bold text-white text-lg">P</span>
                        </div>
                        <span className="text-xl font-bold text-white">Prime AI</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-8 max-w-md">
                        {tagline}<br /><span className="text-cyan-400">{subtitle}</span>
                    </p>
                    <div className="flex items-center gap-6 mb-10">
                        {links.map((link) => (
                            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors duration-300" aria-label={link.label}>
                                {ICON_MAP[link.icon] || <ExternalLink size={20} />}
                            </a>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-8">
                        <a href="#projects" className="hover:text-white transition-colors">Projects</a>
                        <span className="text-gray-700">•</span>
                        <a href="#philosophy" className="hover:text-white transition-colors">Philosophy</a>
                        <span className="text-gray-700">•</span>
                        <a href="#agent-stack" className="hover:text-white transition-colors">Stack</a>
                        <span className="text-gray-700">•</span>
                        <a href="https://calendly.com/info-primeai/30min" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                            Contact <ExternalLink size={12} />
                        </a>
                    </div>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6" />
                    <p className="text-gray-600 text-xs">© {currentYear} Prime AI France. All rights reserved.</p>
                    <p className="text-gray-700 text-xs mt-4 max-w-2xl mx-auto">All project timelines and deliverables are subject to project scope and requirements. Services and pricing provided upon consultation.</p>
                </div>
            </div>
        </footer>
    );
}
