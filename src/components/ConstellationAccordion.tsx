import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Linkedin, Orbit } from "lucide-react";
import { Link } from "react-router-dom";
import type { JuliaConstellationInstance } from "../lib/julia";
import { loadJuliaRuntime } from "../lib/julia";

type ConstellationEntry = {
  id: string;
  name: string;
  role: string;
  icon?: boolean;
  links: { label: string; href: string; local?: boolean }[];
};

const entries: ConstellationEntry[] = [
  {
    id: "yace19ai",
    name: "YACE19AI",
    role: "Research & world models",
    links: [
      { label: "Research", href: "/#mission", local: true },
      { label: "Lab systems", href: "/fleet#systems", local: true },
      { label: "Research domains", href: "/#research-domains", local: true },
    ],
  },
  {
    id: "prime",
    name: "PRIME-AI",
    role: "Sovereign cognitive infrastructure",
    links: [
      { label: "Infrastructure", href: "https://prime-ai.fr/" },
      { label: "Architecture", href: "https://prime-ai.fr/#architecture" },
      { label: "Private deployment", href: "https://prime-ai.fr/#deployment" },
    ],
  },
  {
    id: "amlazr",
    name: "AMLAZR",
    role: "Execution intelligence",
    links: [
      { label: "Execution", href: "https://amlazr.com/" },
      { label: "Agent workflows", href: "https://amlazr.com/#workflows" },
      { label: "Outcomes", href: "https://amlazr.com/#outcomes" },
    ],
  },
  {
    id: "network",
    name: "LinkedIn",
    role: "Network",
    icon: true,
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/yacine-benhamou-b26386124/" },
      { label: "GitHub", href: "https://github.com/Yacinewhatchandcode" },
      { label: "Contact", href: "https://calendly.com/info-primeai/30min" },
    ],
  },
];

export default function ConstellationAccordion({
  onMount,
}: {
  onMount?: (instance: JuliaConstellationInstance | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [runtimeMounted, setRuntimeMounted] = useState(false);
  const [runtimeUnavailable, setRuntimeUnavailable] = useState(false);
  const instance = useRef<JuliaConstellationInstance | null>(null);

  const mountSharedConstellation = useCallback(async () => {
    if (instance.current) return instance.current;
    try {
      const runtime = await loadJuliaRuntime();
      const mounted = runtime.mountConstellation({ site: "yace19ai" });
      instance.current = mounted;
      onMount?.(mounted);
      setRuntimeMounted(true);
      setRuntimeUnavailable(false);
      return mounted;
    } catch {
      setRuntimeUnavailable(true);
      return null;
    }
  }, [onMount]);

  const openConstellation = useCallback(async () => {
    setIsOpen(true);
    const mounted = await mountSharedConstellation();
    if (mounted) {
      mounted.open();
      setIsOpen(false);
    }
  }, [mountSharedConstellation]);

  const closeConstellation = useCallback(() => {
    setIsOpen(false);
    instance.current?.close();
  }, []);

  useEffect(() => {
    const open = () => {
      if (instance.current) {
        instance.current.open();
        setIsOpen(false);
      } else {
        void openConstellation();
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeConstellation();
    };
    const unmount = () => {
      instance.current?.unmount();
      instance.current = null;
      onMount?.(null);
    };
    window.addEventListener("yace19ai:open-constellation", open);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pagehide", unmount);
    return () => {
      window.removeEventListener("yace19ai:open-constellation", open);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pagehide", unmount);
      unmount();
    };
  }, [closeConstellation, onMount, openConstellation]);

  return (
    <div className="constellation-wrap">
      {!runtimeMounted && (
        <>
          <button
            type="button"
            className="constellation-trigger"
            aria-expanded={isOpen}
            aria-controls="constellation-drawer"
            onClick={() => isOpen ? closeConstellation() : void openConstellation()}
          >
            <Orbit size={16} aria-hidden="true" />
            <span>Constellation</span>
            <ChevronDown size={14} aria-hidden="true" className={isOpen ? "chevron is-open" : "chevron"} />
          </button>
          {isOpen && createPortal(
            <div className="constellation-backdrop" onClick={closeConstellation}>
              <section
                className="constellation-drawer"
                id="constellation-drawer"
                aria-label="Sovereign Constellation sites"
                role="dialog"
                aria-modal="true"
                onClick={event => event.stopPropagation()}
              >
                <div className="drawer-heading">
                  <div><p className="eyebrow">One ecosystem</p><h2>Three universes. Shared intent.</h2></div>
                  <button className="icon-button" type="button" aria-label="Close constellation" onClick={closeConstellation}>×</button>
                </div>
                {runtimeUnavailable && <p className="constellation-fallback-status" role="status">Shared constellation is offline. Local links are shown.</p>}
                <div className="constellation-sites">
                  {entries.map(entry => (
                    <article className={`constellation-entry ${entry.id}`} key={entry.id}>
                      <button
                        className="constellation-site-trigger"
                        type="button"
                        aria-expanded={expanded === entry.id}
                        onClick={() => setExpanded(current => current === entry.id ? null : entry.id)}
                      >
                        <span className="site-orb" aria-hidden="true">{entry.icon ? <Linkedin size={16} /> : null}</span>
                        <span className="site-entry-copy"><strong>{entry.name}</strong><span>{entry.role}</span></span>
                        {entry.id === "yace19ai" && <span className="current-site">You are here</span>}
                        <ChevronDown size={16} aria-hidden="true" className={expanded === entry.id ? "chevron is-open" : "chevron"} />
                      </button>
                      {expanded === entry.id && (
                        <nav className="site-deep-links" aria-label={`${entry.name} links`}>
                          {entry.links.map(link => link.local
                            ? <Link key={link.label} to={link.href} onClick={closeConstellation}>{link.label}</Link>
                            : <a key={link.label} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined}>{link.label}</a>)}
                        </nav>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            </div>,
            document.body,
          )}
        </>
      )}
    </div>
  );
}
