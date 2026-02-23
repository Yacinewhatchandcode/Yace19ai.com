import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PricingSuccessPage() {
    const [searchParams] = useSearchParams();
    const minutes = parseInt(searchParams.get("minutes") || "5", 10);
    const sessionId = searchParams.get("session_id");

    const [timeLeft, setTimeLeft] = useState(minutes * 60);
    const [lang, setLang] = useState<"FR" | "EN">("FR");

    useEffect(() => {
        const l = navigator.language?.startsWith("fr") ? "FR" : "EN";
        setLang(l);

        // Set time-access cookies
        const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
        document.cookie = `time_access=active; expires=${expiresAt.toUTCString()}; path=/; SameSite=Lax`;
        document.cookie = `time_access_expires=${expiresAt.toISOString()}; expires=${expiresAt.toUTCString()}; path=/; SameSite=Lax`;
        document.cookie = `time_access_minutes=${minutes}; expires=${expiresAt.toUTCString()}; path=/; SameSite=Lax`;
    }, [minutes]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(interval);
                    document.cookie = "time_access=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                    document.cookie = "time_access_expires=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                    document.cookie = "time_access_minutes=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m ${sec.toString().padStart(2, "0")}s`;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    const label = (fr: string, en: string) => (lang === "FR" ? fr : en);
    const expired = timeLeft <= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="min-h-[80vh] flex items-center justify-center px-4"
        >
            <div className="max-w-md w-full">
                <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.03] backdrop-blur-xl p-8 text-center">
                    {!expired ? (
                        <>
                            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {label("Accès activé !", "Access activated!")}
                            </h1>
                            <p className="text-gray-400 mb-8">
                                {label(
                                    `Vous avez ${minutes} minutes d'accès complet.`,
                                    `You have ${minutes} minutes of full access.`,
                                )}
                            </p>

                            {/* Countdown */}
                            <div className="rounded-xl bg-black/50 border border-white/[0.06] p-6 mb-8">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Clock className="w-5 h-5 text-green-400" />
                                    <span className="text-sm text-gray-400">
                                        {label("Temps restant", "Time remaining")}
                                    </span>
                                </div>
                                <div className="text-4xl font-mono font-bold text-green-400">
                                    {formatTime(timeLeft)}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <a
                                    href="https://prime-ai.fr/chat"
                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors"
                                >
                                    <Zap className="w-4 h-4" />
                                    {label("Commencer — Chat IA", "Start — AI Chat")}
                                </a>
                                <a
                                    href="https://prime-ai.fr/creative"
                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                                >
                                    {label("Creative Hub", "Creative Hub")}
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                                <Link
                                    to="/sovereign"
                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white/5 text-white/70 font-medium hover:bg-white/10 transition-colors"
                                >
                                    {label("Sovereign OS", "Sovereign OS")}
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <Clock className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {label("Temps écoulé", "Time expired")}
                            </h1>
                            <p className="text-gray-400 mb-8">
                                {label(
                                    "Votre session est terminée. Achetez plus de temps.",
                                    "Your session has ended. Buy more time.",
                                )}
                            </p>
                            <Link
                                to="/pricing"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-500 transition-colors"
                            >
                                {label("Acheter plus de temps", "Buy more time")}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </>
                    )}
                </div>

                {sessionId && (
                    <p className="text-center text-gray-600 text-xs mt-4">
                        Session: {sessionId.slice(-8)}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
