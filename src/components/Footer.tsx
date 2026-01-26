import React from 'react';
import { Github, Twitter, Linkedin, Mail, ExternalLink, Users } from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: <Github size={20} />, href: 'https://github.com/Yacinewhatchandcode', label: 'GitHub' },
        { icon: <Twitter size={20} />, href: 'https://twitter.com/yace19ai', label: 'Twitter' },
        { icon: <Linkedin size={20} />, href: 'https://www.linkedin.com/in/yacine-benhamou-b26386124', label: 'LinkedIn' },
        { icon: <Users size={20} />, href: 'https://skool.com/together-with-ai-9145', label: 'Skool Community' },
        { icon: <Mail size={20} />, href: 'mailto:info.primeai@gmail.com', label: 'Email' }
    ];

    return (
        <footer className="relative py-16 px-4 border-t border-white/5">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-950 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto relative">
                <div className="flex flex-col items-center text-center">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <span className="font-bold text-white text-lg">P</span>
                        </div>
                        <span className="text-xl font-bold text-white">Prime AI</span>
                    </div>

                    {/* Tagline */}
                    <p className="text-gray-400 text-sm mb-8 max-w-md">
                        A Human-AI Journey through Multi-Agent Intelligence.
                        <br />
                        <span className="text-cyan-400">Architecting the Neuronal Future.</span>
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center gap-6 mb-10">
                        {socialLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-white transition-colors duration-300"
                                aria-label={link.label}
                            >
                                {link.icon}
                            </a>
                        ))}
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-8">
                        <a href="#" className="hover:text-white transition-colors">Projects</a>
                        <span className="text-gray-700">•</span>
                        <a href="#" className="hover:text-white transition-colors">Philosophy</a>
                        <span className="text-gray-700">•</span>
                        <a href="#" className="hover:text-white transition-colors">Stack</a>
                        <span className="text-gray-700">•</span>
                        <a href="mailto:info.primeai@gmail.com" className="hover:text-white transition-colors flex items-center gap-1">
                            Contact <ExternalLink size={12} />
                        </a>
                    </div>

                    {/* Divider */}
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6" />

                    {/* Copyright */}
                    <p className="text-gray-600 text-xs">
                        © {currentYear} Prime AI France. All rights reserved.
                    </p>

                    {/* Legal Disclaimer */}
                    <p className="text-gray-700 text-xs mt-4 max-w-2xl mx-auto">
                        All project timelines and deliverables are subject to project scope and requirements.
                        Services and pricing provided upon consultation.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
