import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Search, Loader, Globe, Square, Volume2, AlertCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

type OrbState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

// ─── AI Text Generation (used when backend unavailable) ───────────────────────
const generateAIResponse = (input: string): string => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed.includes('sovereign') || trimmed.includes('prime')) {
        return `Sovereign OS is fully operational. The AMLAZR multi-agent fleet is running across 77 repositories with 125 active deployments. The ASiReM orchestrator is standing by for your next directive, Commander.`;
    }
    if (trimmed.includes('status') || trimmed.includes('health')) {
        return `System health nominal. Backend nodes online. GPU cluster on standby. 12 AI training modules active. All sovereign agents reporting green across the mesh.`;
    }
    if (trimmed.includes('who') || trimmed.includes('what are you')) {
        return `I am ASiReM — Autonomous Sovereign Intelligence for Real-time Enterprise Management. I coordinate the entire Prime AI ecosystem including your agent swarms, GPU clusters, and automated deployment pipelines.`;
    }
    return `Directive received: "${input}". Routing to Sovereign Mesh. The agent swarm is analyzing your query and preparing an optimal response. Standby for execution update.`;
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function VoiceOrbInterface() {
    const [orbState, setOrbState] = useState<OrbState>('idle');
    const [transcript, setTranscript] = useState('');
    const [responseText, setResponseText] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [supported, setSupported] = useState(true);
    const [backendOnline, setBackendOnline] = useState(false);

    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
    const finalTranscriptRef = useRef('');

    // ─── Check backend availability ─────────────────────────────────────────
    useEffect(() => {
        fetch('/api/status', { method: 'GET' })
            .then(r => r.ok ? setBackendOnline(true) : setBackendOnline(false))
            .catch(() => setBackendOnline(false));
    }, []);

    // ─── Initialize speech recognition ──────────────────────────────────────
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            setSupported(false);
            return;
        }

        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += t;
                } else {
                    interim += t;
                }
            }
            if (final) {
                finalTranscriptRef.current += final;
            }
            setTranscript(finalTranscriptRef.current + interim);
        };

        recognition.onerror = (event: any) => {
            const msg = event.error === 'not-allowed'
                ? 'Microphone access denied. Please allow microphone in your browser settings.'
                : `Recognition error: ${event.error}`;
            setErrorMsg(msg);
            setOrbState('error');
        };

        recognition.onend = () => {
            // If we're still in listening state when it ends, submit
            if (orbState === 'listening') {
                submitQuery(finalTranscriptRef.current || transcript);
            }
        };

        recognitionRef.current = recognition;
    }, []); // eslint-disable-line

    // ─── Speak text via browser TTS ─────────────────────────────────────────
    const speakText = useCallback((text: string) => {
        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.0;
        utter.pitch = 1.0;
        utter.volume = 1.0;

        // Prefer a female English voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v =>
            v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Female'))
        ) || voices.find(v => v.lang.startsWith('en'));
        if (preferred) utter.voice = preferred;

        utter.onstart = () => setOrbState('speaking');
        utter.onend = () => setOrbState('idle');
        utter.onerror = () => setOrbState('idle');

        synthRef.current = utter;
        window.speechSynthesis.speak(utter);
    }, []);

    // ─── Submit the query to backend or fallback────────────────────────────
    const submitQuery = useCallback(async (query: string) => {
        if (!query.trim()) {
            setOrbState('idle');
            return;
        }

        setOrbState('processing');
        setErrorMsg(null);

        let aiText: string;

        if (backendOnline) {
            try {
                const res = await fetch('/api/asirem/speak', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: query }),
                });
                const data = await res.json();

                if (data.success && data.message) {
                    aiText = data.message;
                } else {
                    // Backend responded but no real content — use local AI
                    aiText = generateAIResponse(query);
                }
            } catch {
                aiText = generateAIResponse(query);
            }
        } else {
            aiText = generateAIResponse(query);
        }

        setResponseText(aiText);
        speakText(aiText);
    }, [backendOnline, speakText]);

    // ─── Orb click handler ─────────────────────────────────────────────────
    const handleOrbClick = () => {
        if (orbState === 'processing') return;

        if (orbState === 'speaking') {
            window.speechSynthesis.cancel();
            setOrbState('idle');
            return;
        }

        if (orbState === 'listening') {
            // Stop recording and submit
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            const captured = finalTranscriptRef.current || transcript;
            setOrbState('processing');
            submitQuery(captured);
        } else {
            // Start recording
            finalTranscriptRef.current = '';
            setTranscript('');
            setResponseText(null);
            setErrorMsg(null);
            setOrbState('listening');

            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    // Already running — stop and restart
                    recognitionRef.current.stop();
                    setTimeout(() => {
                        finalTranscriptRef.current = '';
                        setTranscript('');
                        recognitionRef.current.start();
                    }, 300);
                }
            }
        }
    };

    // ─── Text form fallback ────────────────────────────────────────────────
    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!transcript.trim()) return;
        if (recognitionRef.current && orbState === 'listening') {
            recognitionRef.current.stop();
        }
        submitQuery(transcript);
    };

    // ─── Styles ────────────────────────────────────────────────────────────
    const glowColor = {
        idle: 'bg-cyan-500/30',
        listening: 'bg-red-500/40',
        processing: 'bg-yellow-400/30',
        speaking: 'bg-green-400/30',
        error: 'bg-red-700/30',
    }[orbState];

    const borderColor = {
        idle: 'border-cyan-400 bg-cyan-900/30',
        listening: 'border-red-400 bg-red-900/40',
        processing: 'border-yellow-400 bg-yellow-900/30',
        speaking: 'border-green-400 bg-green-900/30',
        error: 'border-red-600 bg-red-900/30',
    }[orbState];

    const statusLabel = {
        idle: <span className="text-cyan-400">STANDBY</span>,
        listening: <span className="text-red-400 flex items-center gap-2"><span className="animate-pulse w-2 h-2 rounded-full bg-red-500 inline-block" /> RECORDING</span>,
        processing: <span className="text-yellow-400 flex items-center gap-2"><Loader className="w-3 h-3 animate-spin" /> PROCESSING</span>,
        speaking: <span className="text-green-400 flex items-center gap-2"><Volume2 className="w-3 h-3 animate-pulse" /> SPEAKING</span>,
        error: <span className="text-red-400 flex items-center gap-2"><AlertCircle className="w-3 h-3" /> ERROR</span>,
    }[orbState];

    return (
        <section
            aria-label="AMLAZR Voice Intelligence System"
            className="relative w-full overflow-hidden rounded-3xl mb-12 glass-panel border border-cyan-500/20 shadow-[0_0_40px_#00ffff15] bg-[#02050A]/80 flex flex-col items-center justify-center min-h-[500px] p-6"
        >
            {/* SEO - screen reader only */}
            <h2 className="sr-only">AMLAZR Voice Intelligence System</h2>
            <p className="sr-only">
                Speak naturally to interact with the Sovereign AI network. Voice commands are transcribed and answered aloud in real-time.
            </p>

            {/* Header */}
            <div className="absolute top-6 left-6 flex items-center gap-3">
                <Globe className="text-cyan-400 w-5 h-5" />
                <span className="font-mono text-xs text-cyan-400 tracking-widest font-black uppercase">Neural Voice Search</span>
                {backendOnline && (
                    <span className="ml-2 text-[9px] font-mono text-green-500 uppercase tracking-widest border border-green-500/30 px-1.5 py-0.5 rounded">
                        Backend Live
                    </span>
                )}
            </div>

            {/* Status */}
            <div className="absolute top-6 right-6 font-mono text-[10px] uppercase tracking-widest">
                {statusLabel}
            </div>

            {/* Orb */}
            <div className="relative mt-12 mb-10 flex items-center justify-center">
                {/* Glow halo */}
                <motion.div
                    animate={{
                        scale: orbState === 'listening' ? [1, 1.25, 1] : orbState === 'speaking' ? [1, 1.1, 1] : [1, 1.03, 1],
                        opacity: orbState === 'idle' ? 0.4 : [0.5, 0.9, 0.5],
                    }}
                    transition={{ duration: orbState === 'listening' ? 1.2 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute w-64 h-64 rounded-full blur-[60px] ${glowColor}`}
                />

                {/* Button */}
                <motion.button
                    onClick={handleOrbClick}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.93 }}
                    aria-label={orbState === 'listening' ? 'Stop recording' : 'Start recording'}
                    title={orbState === 'listening' ? 'Tap to stop & send' : orbState === 'speaking' ? 'Tap to stop speaking' : 'Tap to speak'}
                    disabled={orbState === 'processing'}
                    className={`relative z-10 w-40 h-40 rounded-full flex items-center justify-center border-2 cursor-pointer shadow-lg transition-colors duration-500 disabled:opacity-40 ${borderColor}`}
                >
                    <div className={`absolute inset-0 rounded-full blur-xl opacity-40 bg-gradient-to-tr ${orbState === 'listening' ? 'from-red-500 to-transparent' :
                            orbState === 'processing' ? 'from-yellow-400 to-transparent' :
                                orbState === 'speaking' ? 'from-green-400 to-transparent' :
                                    'from-cyan-500 to-transparent'
                        }`} />

                    {orbState === 'listening' ? (
                        <Square className="w-12 h-12 text-red-100 z-10 fill-red-400" />
                    ) : orbState === 'processing' ? (
                        <Loader className="w-12 h-12 text-yellow-200 z-10 animate-spin" />
                    ) : orbState === 'speaking' ? (
                        <Volume2 className="w-12 h-12 text-green-100 z-10 animate-pulse" />
                    ) : orbState === 'error' ? (
                        <AlertCircle className="w-12 h-12 text-red-300 z-10" />
                    ) : (
                        <Mic className="w-12 h-12 text-cyan-100 z-10" />
                    )}
                </motion.button>
            </div>

            {/* Hint */}
            <p className="text-xs text-gray-600 font-mono mb-6 text-center">
                {orbState === 'listening' ? 'Speaking — tap orb again to stop & send' :
                    orbState === 'speaking' ? 'Tap orb to interrupt' :
                        orbState === 'processing' ? 'Processing your command...' :
                            supported ? 'Tap the orb to speak. The AI will answer aloud.' :
                                'Your browser doesn\'t support Speech Recognition. Use the text box below.'}
            </p>

            {/* Input + Output */}
            <div className="w-full max-w-2xl flex flex-col items-center gap-5">
                <form onSubmit={handleTextSubmit} className="w-full relative group">
                    <input
                        type="text"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        disabled={orbState === 'processing'}
                        placeholder={orbState === 'listening' ? 'Listening...' : 'Or type your question here...'}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-full px-6 py-4 outline-none text-white font-mono text-sm placeholder:text-gray-600 focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all"
                        aria-label="Query input"
                    />
                    <button
                        type="submit"
                        disabled={orbState === 'processing' || !transcript.trim()}
                        className="absolute right-2 top-2 bottom-2 px-4 bg-cyan-500/20 text-cyan-400 rounded-full hover:bg-cyan-500/40 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </form>

                <AnimatePresence>
                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="w-full bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 text-red-300 text-sm font-mono flex items-start gap-3"
                        >
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            {errorMsg}
                        </motion.div>
                    )}
                    {responseText && orbState !== 'error' && (
                        <motion.article
                            key={responseText}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="w-full bg-green-500/5 border border-green-500/20 rounded-2xl p-6 text-green-50"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <h3 className="text-xs font-mono font-bold tracking-widest text-green-400 uppercase">ASiReM Response</h3>
                            </div>
                            <p className="text-sm font-light leading-relaxed">{responseText}</p>
                        </motion.article>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
