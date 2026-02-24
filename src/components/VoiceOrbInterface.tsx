import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Search, Loader, Globe, Square, Volume2, AlertCircle, Languages } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

type OrbState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
type VoiceLang = 'en' | 'fr';
type VoiceGender = 'male' | 'female';

// ─── Voice Configuration ──────────────────────────────────────────────────────
// Priority-ordered voice names per language+gender. The FIRST match is locked.
const VOICE_REGISTRY: Record<VoiceLang, Record<VoiceGender, string[]>> = {
    en: {
        female: ['Samantha', 'Karen', 'Moira', 'Tessa', 'Google US English Female', 'Microsoft Zira'],
        male: ['Daniel', 'Alex', 'Fred', 'Google US English Male', 'Microsoft David'],
    },
    fr: {
        female: ['Amelie', 'Marie', 'Audrey', 'Google français', 'Microsoft Hortense'],
        male: ['Thomas', 'Nicolas', 'Google français Male'],
    }
};

const LANG_CONFIG: Record<VoiceLang, { recognitionLang: string; label: string; flag: string }> = {
    en: { recognitionLang: 'en-US', label: 'English', flag: '🇬🇧' },
    fr: { recognitionLang: 'fr-FR', label: 'Français', flag: '🇫🇷' },
};


interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function VoiceOrbInterface() {
    const [orbState, setOrbState] = useState<OrbState>('idle');
    const [transcript, setTranscript] = useState('');
    const [responseText, setResponseText] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [supported, setSupported] = useState(true);
    const [lang, setLang] = useState<VoiceLang>('en');
    const [provider, setProvider] = useState<string | null>(null);

    // Voice lock: once a voice is found, it NEVER changes until language changes
    const lockedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
    const voiceGenderRef = useRef<VoiceGender>('female'); // Default gender
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
    const finalTranscriptRef = useRef('');
    const historyRef = useRef<ChatMessage[]>([]);

    // ─── Lock voice on mount and language change ────────────────────────────
    const lockVoice = useCallback(() => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return; // Voices not loaded yet

        const gender = voiceGenderRef.current;
        const candidates = VOICE_REGISTRY[lang][gender];
        const langPrefix = lang === 'fr' ? 'fr' : 'en';

        // Try priority-ordered named voices
        for (const name of candidates) {
            const found = voices.find(v => v.lang.startsWith(langPrefix) && v.name.includes(name));
            if (found) {
                lockedVoiceRef.current = found;
                console.log(`[Voice] Locked: "${found.name}" (${found.lang}) [${gender}]`);
                return;
            }
        }

        // Fallback: any voice in target language
        const fallback = voices.find(v => v.lang.startsWith(langPrefix));
        if (fallback) {
            lockedVoiceRef.current = fallback;
            console.log(`[Voice] Fallback locked: "${fallback.name}" (${fallback.lang})`);
        }
    }, [lang]);

    useEffect(() => {
        // Voices load asynchronously in some browsers
        lockedVoiceRef.current = null; // Reset on language change
        lockVoice();
        window.speechSynthesis.onvoiceschanged = lockVoice;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, [lang, lockVoice]);

    // ─── Initialize speech recognition ──────────────────────────────────────
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { setSupported(false); return; }

        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = LANG_CONFIG[lang].recognitionLang;

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
            if (final) finalTranscriptRef.current += final;
            setTranscript(finalTranscriptRef.current + interim);
        };

        recognition.onerror = (event: any) => {
            const msg = event.error === 'not-allowed'
                ? lang === 'fr'
                    ? 'Accès au microphone refusé. Veuillez autoriser le microphone.'
                    : 'Microphone access denied. Please allow microphone in browser settings.'
                : `${lang === 'fr' ? 'Erreur' : 'Error'}: ${event.error}`;
            setErrorMsg(msg);
            setOrbState('error');
        };

        recognition.onend = () => {
            if (orbState === 'listening') {
                submitQuery(finalTranscriptRef.current || transcript);
            }
        };

        recognitionRef.current = recognition;
    }, [lang]); // eslint-disable-line

    // ─── Speak with LOCKED voice ────────────────────────────────────────────
    const speakText = useCallback((text: string) => {
        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.0;
        utter.pitch = 1.0;
        utter.volume = 1.0;
        utter.lang = LANG_CONFIG[lang].recognitionLang;

        // ALWAYS use the locked voice — never search again
        if (lockedVoiceRef.current) {
            utter.voice = lockedVoiceRef.current;
        }

        utter.onstart = () => setOrbState('speaking');
        utter.onend = () => setOrbState('idle');
        utter.onerror = () => setOrbState('idle');

        synthRef.current = utter;
        window.speechSynthesis.speak(utter);
    }, [lang]);

    // ─── Submit query to Supabase Edge Function ─────────────────────────────
    const submitQuery = useCallback(async (query: string) => {
        if (!query.trim()) { setOrbState('idle'); return; }

        setOrbState('processing');
        setErrorMsg(null);
        setProvider(null);

        // Add user message to history
        historyRef.current.push({ role: 'user', content: query });

        let aiText: string;

        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/voice-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    message: query,
                    lang,
                    history: historyRef.current.slice(-6),
                }),
            });

            const data = await res.json();

            if (data.success && data.message) {
                aiText = data.message;
                setProvider(data.provider || null);
            } else {
                aiText = data.error || (lang === 'fr'
                    ? 'Erreur de connexion au réseau souverain.'
                    : 'Connection error to sovereign network.');
            }
        } catch (err: any) {
            console.error('[Voice] Edge function error:', err);
            aiText = lang === 'fr'
                ? 'Le réseau souverain est temporairement indisponible. Veuillez réessayer.'
                : 'The sovereign network is temporarily unavailable. Please try again.';
        }

        // Add assistant response to history
        historyRef.current.push({ role: 'assistant', content: aiText });
        // Keep history manageable
        if (historyRef.current.length > 20) {
            historyRef.current = historyRef.current.slice(-12);
        }

        setResponseText(aiText);
        speakText(aiText);
    }, [speakText, lang]);

    // ─── Toggle language ────────────────────────────────────────────────────
    const toggleLang = useCallback(() => {
        if (orbState === 'listening' || orbState === 'processing') return;
        window.speechSynthesis.cancel();
        setOrbState('idle');
        setLang(prev => prev === 'en' ? 'fr' : 'en');
        // History persists across language switches
    }, [orbState]);

    // ─── Orb click handler ─────────────────────────────────────────────────
    const handleOrbClick = () => {
        if (orbState === 'processing') return;

        if (orbState === 'speaking') {
            window.speechSynthesis.cancel();
            setOrbState('idle');
            return;
        }

        if (orbState === 'listening') {
            if (recognitionRef.current) recognitionRef.current.stop();
            const captured = finalTranscriptRef.current || transcript;
            setOrbState('processing');
            submitQuery(captured);
        } else {
            finalTranscriptRef.current = '';
            setTranscript('');
            setResponseText(null);
            setErrorMsg(null);
            setOrbState('listening');

            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch {
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
        listening: <span className="text-red-400 flex items-center gap-2"><span className="animate-pulse w-2 h-2 rounded-full bg-red-500 inline-block" /> {lang === 'fr' ? 'ENREGISTREMENT' : 'RECORDING'}</span>,
        processing: <span className="text-yellow-400 flex items-center gap-2"><Loader className="w-3 h-3 animate-spin" /> {lang === 'fr' ? 'TRAITEMENT' : 'PROCESSING'}</span>,
        speaking: <span className="text-green-400 flex items-center gap-2"><Volume2 className="w-3 h-3 animate-pulse" /> {lang === 'fr' ? 'PARLE' : 'SPEAKING'}</span>,
        error: <span className="text-red-400 flex items-center gap-2"><AlertCircle className="w-3 h-3" /> {lang === 'fr' ? 'ERREUR' : 'ERROR'}</span>,
    }[orbState];

    return (
        <section
            aria-label="PRIME.AI Assistant"
            className="relative w-full overflow-hidden rounded-3xl mb-8 md:mb-12 glass-panel border border-cyan-500/20 shadow-[0_0_40px_#00ffff15] bg-[#02050A]/80 flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] px-4 py-8 md:p-6"
        >
            <h2 className="sr-only">PRIME.AI Assistant — Ask anything, get instant answers</h2>
            <p className="sr-only">
                {lang === 'fr'
                    ? 'Parlez naturellement pour interagir avec notre IA. Les commandes vocales sont transcrites et répondues en temps réel.'
                    : 'Speak naturally to interact with our AI. Voice commands are transcribed and answered aloud in real-time.'}
            </p>

            {/* Header */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 md:gap-3">
                <Globe className="text-cyan-400 w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span className="hidden sm:inline font-mono text-xs text-cyan-400 tracking-widest font-black uppercase">AI Assistant</span>
                <span className="ml-2 text-[9px] font-mono text-green-500 uppercase tracking-widest border border-green-500/30 px-1.5 py-0.5 rounded">
                    Live
                </span>
            </div>

            {/* Language Toggle + Status */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-3">
                <motion.button
                    onClick={toggleLang}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={`Switch to ${lang === 'en' ? 'Français' : 'English'}`}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                    <Languages className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] font-mono font-bold text-white tracking-widest">
                        {LANG_CONFIG[lang].flag} {LANG_CONFIG[lang].label.toUpperCase()}
                    </span>
                </motion.button>
                <div className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest">
                    {statusLabel}
                </div>
            </div>

            {/* Orb */}
            <div className="relative mt-16 md:mt-12 mb-8 md:mb-10 flex items-center justify-center">
                <motion.div
                    animate={{
                        scale: orbState === 'listening' ? [1, 1.25, 1] : orbState === 'speaking' ? [1, 1.1, 1] : [1, 1.03, 1],
                        opacity: orbState === 'idle' ? 0.4 : [0.5, 0.9, 0.5],
                    }}
                    transition={{ duration: orbState === 'listening' ? 1.2 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute w-64 h-64 rounded-full blur-[60px] ${glowColor}`}
                />
                <motion.button
                    onClick={handleOrbClick}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.93 }}
                    aria-label={orbState === 'listening' ? (lang === 'fr' ? "Arrêter l'enregistrement" : 'Stop recording') : (lang === 'fr' ? "Commencer l'enregistrement" : 'Start recording')}
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
            <p className="text-xs text-gray-600 font-mono mb-4 text-center max-w-md">
                {orbState === 'listening'
                    ? (lang === 'fr' ? "En écoute — tapez pour arrêter et envoyer" : 'Listening — tap again to stop & send')
                    : orbState === 'speaking'
                        ? (lang === 'fr' ? "Tapez pour interrompre" : 'Tap to interrupt')
                        : orbState === 'processing'
                            ? (lang === 'fr' ? 'Traitement de votre commande...' : 'Processing your command...')
                            : supported
                                ? (lang === 'fr' ? "Tapez le cercle ou tapez votre question. L'IA répondra instantanément à voix haute." : 'Tap the circle or type your question. Our AI will answer instantly — by voice and text.')
                                : (lang === 'fr' ? 'Votre navigateur ne supporte pas la Reconnaissance Vocale. Utilisez la zone de texte.' : "Your browser doesn't support Speech Recognition. Use the text box below.")}
            </p>

            {/* Trust cue */}
            <p className="text-[10px] text-gray-700 font-mono mb-6 text-center flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500/60" />
                {lang === 'fr' ? 'Connexion sécurisée · Aucune donnée vocale stockée' : 'Secure connection · No voice data stored'}
            </p>

            {/* Input + Output */}
            <div className="w-full max-w-2xl flex flex-col items-center gap-5">
                <form onSubmit={handleTextSubmit} className="w-full relative group">
                    <input
                        type="text"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        disabled={orbState === 'processing'}
                        placeholder={orbState === 'listening'
                            ? (lang === 'fr' ? 'En écoute...' : 'Listening...')
                            : (lang === 'fr' ? 'Ou tapez votre question ici...' : 'Or type your question here...')}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-full px-4 py-3 md:px-6 md:py-4 outline-none text-white font-mono text-xs md:text-sm placeholder:text-gray-600 focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all"
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
                            className="w-full bg-green-500/5 border border-green-500/20 rounded-2xl p-4 md:p-6 text-green-50"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <h3 className="text-xs font-mono font-bold tracking-widest text-green-400 uppercase">
                                    {lang === 'fr' ? 'Réponse PRIME.AI' : 'PRIME.AI Response'}
                                </h3>
                                {provider && (
                                    <span className="text-[8px] font-mono text-cyan-500 bg-cyan-900/30 border border-cyan-500/20 px-1.5 py-0.5 rounded uppercase">
                                        {provider}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-light leading-relaxed">{responseText}</p>
                        </motion.article>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
