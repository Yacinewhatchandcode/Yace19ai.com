import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowUpRight, Mic, X } from "lucide-react";
import type { JuliaInstance, JuliaToolHandlers, JuliaWindowSession } from "../lib/julia";
import { juliaWindowEndpoint, loadJuliaRuntime } from "../lib/julia";

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

function isLiveSession(session: JuliaWindowSession | null): session is JuliaWindowSession {
  return !!session
    && typeof session.token === "string"
    && session.token.length > 0
    && Number.isFinite(session.exp)
    && Number.isFinite(session.ttl)
    && session.ttl > 0
    && session.exp > Date.now() / 1000;
}

export default function JuliaPortal({
  tools,
  onMount,
}: {
  tools: JuliaToolHandlers;
  onMount?: (instance: JuliaInstance | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "connecting" | "active" | "offline" | "ended">("idle");
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [sessionDuration, setSessionDuration] = useState(300);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [agentState, setAgentState] = useState("idle");
  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<JuliaInstance | null>(null);

  const releaseSession = useCallback(() => {
    instance.current?.unmount();
    instance.current = null;
    onMount?.(null);
  }, [onMount]);

  useEffect(() => {
    const handleAgentState = (event: Event) => {
      const state = (event as CustomEvent<{ state?: string }>).detail?.state;
      if (state && ["idle", "listening", "thinking", "speaking", "working", "success", "error"].includes(state)) {
        setAgentState(state);
      }
    };
    window.addEventListener("prime-julia-state", handleAgentState);
    window.addEventListener("pagehide", releaseSession);
    return () => {
      window.removeEventListener("prime-julia-state", handleAgentState);
      window.removeEventListener("pagehide", releaseSession);
      releaseSession();
    };
  }, [releaseSession]);

  useEffect(() => {
    if (status !== "active" || expiresAt === null) return;
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil(expiresAt - Date.now() / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        releaseSession();
        setStatus("ended");
        setMessage("Your five-minute preview has ended. Thank you for exploring with Julia.");
      }
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, releaseSession, status]);

  async function startSession() {
    setStatus("connecting");
    setMessage("");
    try {
      const runtime = await loadJuliaRuntime();
      const mounted = runtime.mount({
        site: "yace19ai",
        container: container.current ?? undefined,
        tools,
        windowEndpoint: juliaWindowEndpoint,
      });
      instance.current = mounted;
      onMount?.(mounted);
      const session = await mounted.getSession();
      if (!isLiveSession(session)) throw new Error("The shared runtime did not issue an active five-minute window.");
      const duration = Math.min(session.ttl, Math.ceil(session.exp - Date.now() / 1000));
      setSessionDuration(duration);
      setSecondsLeft(duration);
      setExpiresAt(session.exp);
      setAgentState("idle");
      setStatus("active");
    } catch (error) {
      releaseSession();
      setStatus("offline");
      setMessage(error instanceof Error ? error.message : "Julia's shared runtime is not available.");
    }
  }

  const progress = status === "active" ? `${secondsLeft / sessionDuration * 100}%` : "100%";

  return (
    <aside className={open ? "julia-portal is-open" : "julia-portal"} id="julia-portal" aria-label="Julia research companion">
      <button
        className="julia-orb"
        type="button"
        aria-label={open ? "Close Julia portal" : "Open Julia, research companion"}
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <span className="julia-countdown" style={{ "--progress": progress } as CSSProperties}>
          <img src="/julia/julia-portrait.png" alt="" width="76" height="76" />
        </span>
        <span className="julia-orb-label">{status === "active" ? formatTime(secondsLeft) : "Julia"}</span>
      </button>

      {open && (
        <section className="julia-panel" aria-labelledby="julia-title">
          <div ref={container} className="julia-runtime-container" />
          <header className="julia-panel-header">
            <img src="/julia/julia-portrait.png" alt="" width="48" height="48" />
            <div><p className="eyebrow">Research companion</p><h2 id="julia-title">Julia</h2></div>
            <button className="icon-button" type="button" aria-label="Close Julia panel" onClick={() => setOpen(false)}><X size={18} /></button>
          </header>
          <p className="julia-intro">Explore world models, scientific AI and open research. Julia can help you find your way around this lab.</p>
          <div className="julia-session-status" role="status" aria-live="polite">
            {status === "idle" && <span>Five-minute preview · no signup</span>}
            {status === "connecting" && <span>Connecting to the shared Julia runtime…</span>}
            {status === "active" && <span><span className="status-dot" /> Session active · {formatTime(secondsLeft)} remaining · {agentState}</span>}
            {status === "offline" && <span>{message || "Julia's shared runtime is not available yet."}</span>}
            {status === "ended" && <span>{message}</span>}
          </div>
          {status === "offline" && <p className="julia-fallback-note">Julia's portrait stays here while the shared runtime reconnects. Try again later.</p>}
          {status === "ended"
            ? <a className="button button-primary julia-cta" href="https://calendly.com/info-primeai/30min" target="_blank" rel="noreferrer">Continue the conversation <ArrowUpRight size={16} /></a>
            : status !== "active" && <button className="button button-primary julia-cta" type="button" disabled={status === "connecting"} onClick={startSession}>
              <Mic size={16} /> {status === "connecting" ? "Connecting…" : status === "offline" ? "Try again" : "Start free 5-minute session"}
            </button>}
          <p className="julia-disclosure">The shared PRIME-AI service signs and expires the session window; this countdown mirrors its issued expiry.</p>
        </section>
      )}
    </aside>
  );
}
