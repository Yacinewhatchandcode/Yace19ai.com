import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Search, Loader, Globe, Play, Square, Volume2 } from 'lucide-react';

export default function VoiceOrbInterface() {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [query, setQuery] = useState('');
    const [responseText, setResponseText] = useState<string | null>(null);
    const recognitionRef = React.useRef<any>(null);

    React.useEffect(() => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setQuery(currentTranscript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    // SEO textual representation
    const orbTitle = "AMLAZR Voice Intelligence System";
    const orbDescription = "Interact with the Sovereign AI network using your voice to conduct deep web searches, retrieve real-time data, and vocalize the generated intelligence. Powered by advanced Speech-to-Speech architecture similar to Perplexity or Genspark.";

    const handleOrbClick = () => {
        if (isProcessing) return;

        if (isListening) {
            setIsListening(false);
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (query.trim()) {
                handleSimulatedSpeechSubmit(query);
            } else {
                handleSimulatedSpeechSubmit();
            }
        } else {
            setIsListening(true);
            setResponseText(null);
            setQuery('');

            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    console.error("Transcription already started.", e);
                }
            }
        }
    };

    const handleTextInput = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsListening(false);
        handleSimulatedSpeechSubmit();
    };

    // Real Web Search AI Pipeline
    const handleSimulatedSpeechSubmit = async (customQuery?: string) => {
        setIsProcessing(true);
        const finalQuery = customQuery || query || "Test Sovereign Voice Interface";

        try {
            const res = await fetch('http://localhost:8082/api/asirem/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: finalQuery })
            });

            const data = await res.json();
            setIsProcessing(false);

            if (data.success) {
                const synthesizedText = `Command received and delegated to Sovereign Agents: "${finalQuery}"`;
                setResponseText(synthesizedText);

                if (data.audio_url) {
                    const audio = new Audio(`http://localhost:8082${data.audio_url}`);
                    audio.play();
                }
            } else {
                setResponseText("Failed to process command. " + (data.error || "Unknown Error"));
            }
        } catch (error) {
            console.error("Backend connection error:", error);
            setIsProcessing(false);
            setResponseText("Sovereign Ecosystem backend is unreachable. Please ensure it is running on port 8082.");
        }
    };

    return (
        <section aria-label={orbTitle} className="relative w-full overflow-hidden rounded-3xl mb-12 glass-panel border border-cyan-500/20 shadow-[0_0_40px_#00ffff15] bg-[#02050A]/80 flex flex-col items-center justify-center min-h-[500px] p-6">

            {/* SEO Text Content - Visually Hidden but semantically available */}
            <h2 className="sr-only">{orbTitle}</h2>
            <p className="sr-only">{orbDescription}</p>

            {/* Title Display */}
            <div className="absolute top-6 left-6 flex items-center gap-3">
                <Globe className="text-cyan-400 w-5 h-5" />
                <span className="font-mono text-xs text-cyan-400 tracking-widest font-black uppercase">
                    Neural Voice Search
                </span>
            </div>

            {/* Action Status */}
            <div className="absolute top-6 right-6 font-mono text-[10px] uppercase tracking-widest text-gray-500">
                {isListening ? (
                    <span className="text-red-400 flex items-center gap-2"><span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span> RECORDING</span>
                ) : isProcessing ? (
                    <span className="text-yellow-400 flex items-center gap-2"><Loader className="w-3 h-3 animate-spin" /> SYNTHESIZING</span>
                ) : responseText ? (
                    <span className="text-green-400 flex items-center gap-2"><Volume2 className="w-3 h-3" /> PLAYBCAK READY</span>
                ) : (
                    <span className="text-cyan-400">STANDBY</span>
                )}
            </div>

            {/* THE ORB 3D CSS REPRESENTATION */}
            <div className="relative mt-12 mb-16 flex items-center justify-center">

                {/* Outer Glow / Halo */}
                <motion.div
                    animate={{
                        scale: isListening ? [1, 1.2, 1] : isProcessing ? [1, 1.1, 1] : responseText ? [1, 1.05, 1] : [1, 1.02, 1],
                        opacity: isListening ? [0.4, 0.8, 0.4] : 0.5
                    }}
                    transition={{
                        duration: isListening ? 1.5 : 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`absolute w-64 h-64 rounded-full blur-[60px] ${isListening ? 'bg-red-500/40' :
                        isProcessing ? 'bg-yellow-400/30' :
                            responseText ? 'bg-green-400/30' : 'bg-cyan-500/30'
                        }`}
                />

                {/* The Interactive Orb */}
                <motion.button
                    onClick={handleOrbClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Toggle Voice Control Orb"
                    className={`relative z-10 w-40 h-40 rounded-full flex items-center justify-center overflow-hidden border-2 cursor-pointer shadow-lg transition-colors duration-500 ${isListening ? 'border-red-400 bg-red-900/40' :
                        isProcessing ? 'border-yellow-400 bg-yellow-900/40' :
                            responseText ? 'border-green-400 bg-green-900/40' : 'border-cyan-400 bg-cyan-900/40'
                        }`}
                >
                    {/* Inner glowing core */}
                    <div className={`absolute inset-0 opacity-50 bg-gradient-to-tr ${isListening ? 'from-red-600 to-transparent' :
                        isProcessing ? 'from-yellow-500 to-transparent' :
                            responseText ? 'from-green-500 to-transparent' : 'from-cyan-600 to-transparent'
                        } rounded-full blur-xl`}></div>

                    {isListening ? (
                        <Square className="w-12 h-12 text-red-100 z-10 fill-red-400" />
                    ) : isProcessing ? (
                        <Search className="w-12 h-12 text-yellow-100 z-10 animate-pulse" />
                    ) : responseText ? (
                        <Play className="w-12 h-12 text-green-100 z-10 ml-2 fill-green-400" />
                    ) : (
                        <Mic className="w-12 h-12 text-cyan-100 z-10" />
                    )}
                </motion.button>
            </div>

            {/* Input & Output Area */}
            <div className="w-full max-w-2xl flex flex-col items-center gap-6">
                <form onSubmit={handleTextInput} className="w-full relative group">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isListening || isProcessing}
                        placeholder={isListening ? "Listening natively to your microphone..." : "Tap the orb to speak, or type your query here..."}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-full px-6 py-4 outline-none text-white font-mono text-sm placeholder:text-gray-600 focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all"
                        aria-label="Search Query Input"
                    />
                    <button type="submit" disabled={isListening || isProcessing || !query.trim()} className="absolute right-2 top-2 bottom-2 px-4 bg-cyan-500/20 text-cyan-400 rounded-full hover:bg-cyan-500/40 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center">
                        <Search className="w-4 h-4" />
                    </button>
                </form>

                {/* Substantive Response Output for SEO and UX */}
                <AnimatePresence>
                    {responseText && (
                        <motion.article
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="w-full bg-green-500/5 border border-green-500/20 rounded-2xl p-6 text-green-50 shadow-inner"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                <h3 className="text-xs font-mono font-bold tracking-widest text-green-400 uppercase">Synchronized Neural Output</h3>
                            </div>
                            <p className="text-sm font-light leading-relaxed font-sans">
                                {responseText}
                            </p>
                        </motion.article>
                    )}
                </AnimatePresence>
            </div>

        </section>
    );
}
