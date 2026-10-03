import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import HomePage from "./pages/HomePage";
import FleetPage from "./pages/FleetPage";
import GamesCatalog from "./components/GamesCatalog";
import MediaPage from "./pages/MediaPage";
import PhilosophyPage from "./pages/PhilosophyPage";
import ConstellationAccordion from "./components/ConstellationAccordion";
import JuliaPortal from "./components/JuliaPortal";
import PageMetadata from "./components/PageMetadata";
import type { JuliaConstellationInstance, JuliaInstance, JuliaSite, JuliaToolHandlers } from "./lib/julia";
import "./App.css";

export type Locale = "en" | "fr";

const routeMetadata = {
  "/": {
    title: "Research the possible. | YACE19AI",
    description: "YACE19AI explores world models, scientific AI and open models through research, prototypes and questions worth pursuing.",
    label: "Research",
  },
  "/fleet": {
    title: "Lab systems | YACE19AI",
    description: "Explore selected, publicly linked research and engineering systems from the YACE19AI lab.",
    label: "Lab systems",
  },
  "/philosophy": {
    title: "Our approach | YACE19AI",
    description: "How YACE19AI connects imagination, research and systems into one open-ended practice.",
    label: "Our approach",
  },
  "/media": {
    title: "Media archive | YACE19AI",
    description: "A clearly labeled archive of recorded experiments and project media.",
    label: "Media archive",
  },
  "/games": {
    title: "Interactive experiments | YACE19AI",
    description: "A small archive of local interactive experiments and playable prototypes.",
    label: "Experiments",
  },
} as const;

const allowedRoutes = new Set(["/", "/fleet", "/philosophy", "/media", "/games"]);
const allowedSections = new Set([
  "mission", "layers", "systems", "research-domains", "domain-world-models",
  "domain-scientific-ai", "domain-frontier-models", "publications", "get-involved",
]);
const sectionsByRoute: Record<string, Set<string>> = {
  "/": allowedSections,
  "/fleet": new Set(["systems"]),
};
const sectionIds = new Set(allowedSections);
const siteUrls: Record<JuliaSite, string> = {
  yace19ai: "https://yace19ai.com/",
  "prime-ai": "https://prime-ai.fr/",
  amlazr: "https://amlazr.com/",
};

function resolveInternalPath(path: string) {
  try {
    const url = new URL(path, window.location.origin);
    if (url.origin !== window.location.origin || !allowedRoutes.has(url.pathname) || url.search) return null;
    const section = url.hash.slice(1);
    if (section && (!sectionIds.has(section) || !sectionsByRoute[url.pathname]?.has(section))) return null;
    return `${url.pathname}${section ? `#${section}` : ""}`;
  } catch {
    return null;
  }
}

function Site() {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return localStorage.getItem("locale") === "fr" ? "fr" : "en";
    } catch {
      return "en";
    }
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  const page = routeMetadata[pathname as keyof typeof routeMetadata] ?? {
    title: "Page not found | YACE19AI",
    description: "The page you requested could not be found.",
    label: locale === "fr" ? "Page introuvable" : "Page not found",
  };
  const juliaInstance = useRef<JuliaInstance | null>(null);
  const constellationInstance = useRef<JuliaConstellationInstance | null>(null);

  const onJuliaMount = useCallback((instance: JuliaInstance | null) => {
    juliaInstance.current = instance;
  }, []);
  const onConstellationMount = useCallback((instance: JuliaConstellationInstance | null) => {
    constellationInstance.current = instance;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem("locale", locale);
    } catch {
      // Keep the current language for this visit when browser storage is unavailable.
    }
  }, [locale]);

  useEffect(() => {
    if (location.hash) {
      requestAnimationFrame(() => {
        document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: "smooth" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname, location.hash]);

  const tools = useMemo<JuliaToolHandlers>(() => ({
    navigate: async ({ path }) => {
      const destination = resolveInternalPath(path);
      if (!destination) return { ok: false, message: "Navigation is limited to a known YACE19AI route or section." };
      navigate(destination);
      return { ok: true, path: destination };
    },
    scrollTo: async ({ selector }) => {
      if (!selector.startsWith("#") || !sectionIds.has(selector.slice(1))) return { ok: false, message: "Only listed research sections can be targeted." };
      const target = document.getElementById(selector.slice(1));
      if (!target) return { ok: false, message: "That section is not present on this route." };
      target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return { ok: true, selector };
    },
    highlight: async ({ selector }) => {
      if (!selector.startsWith("#") || !sectionIds.has(selector.slice(1))) return { ok: false, message: "Only listed research sections can be highlighted." };
      const target = document.getElementById(selector.slice(1));
      if (!target) return { ok: false, message: "That section is not present on this route." };
      target.classList.add("is-julia-highlighted");
      window.setTimeout(() => target.classList.remove("is-julia-highlighted"), 2200);
      target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      return { ok: true, selector };
    },
    click: async ({ selector }) => {
      if (selector !== "#publication-search-submit") return { ok: false, message: "Julia can only activate the publication search control." };
      const button = document.getElementById("publication-search-submit");
      if (!(button instanceof HTMLButtonElement)) return { ok: false, message: "The publication search is not available on this route." };
      button.click();
      return { ok: true };
    },
    fill: async ({ selector, value }) => {
      if (selector !== "#publication-query" || value.length > 160) return { ok: false, message: "Only the publication search field accepts text (up to 160 characters)." };
      const input = document.getElementById("publication-query");
      if (!(input instanceof HTMLInputElement)) return { ok: false, message: "The publication search is not available on this route." };
      const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      nativeSetter?.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return { ok: true };
    },
    openConstellation: async () => {
      if (constellationInstance.current) constellationInstance.current.open();
      else window.dispatchEvent(new CustomEvent("yace19ai:open-constellation"));
      return { ok: true };
    },
    switchSite: async ({ site }) => {
      const url = siteUrls[site];
      const target = window.open(url, "_blank");
      if (!target) return { ok: false, message: "The browser blocked the constellation tab." };
      target.opener = null;
      const mounted = juliaInstance.current;
      if (!mounted) {
        target.close();
        return { ok: false, message: "An active Julia session is required for a site handoff." };
      }
      try {
        await mounted.handoff(target, new URL(url).origin);
        return { ok: true, site };
      } catch {
        target.close();
        return { ok: false, message: "The Julia session could not be handed off to that site." };
      }
    },
  }), [navigate]);

  return (
    <div className="site-shell">
      <PageMetadata pathname={pathname} locale={locale} title={page.title} description={page.description} label={page.label} />
      <a className="skip-link" href="#main-content">{locale === "fr" ? "Aller au contenu" : "Skip to content"}</a>
      <header className="site-header">
        <Link className="brand" aria-label="YACE19AI home" to="/">
          <img className="brand-mark" src="/prime-trinity.svg" alt="" width="32" height="32" />
          <span>YACE19AI</span>
        </Link>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-expanded={mobileNavOpen}
          aria-controls="primary-navigation"
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMobileNavOpen(open => !open)}
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav id="primary-navigation" className={mobileNavOpen ? "primary-navigation is-open" : "primary-navigation"} aria-label="Main navigation" onClick={() => setMobileNavOpen(false)}>
          <NavLink to="/" end>Research</NavLink>
          <NavLink to="/fleet">Lab systems</NavLink>
          <NavLink to="/philosophy">Our approach</NavLink>
        </nav>
        <div className="header-actions">
          <div className="locale-switch" aria-label="Language">
            <button lang="en" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button>
            <button lang="fr" aria-pressed={locale === "fr"} onClick={() => setLocale("fr")}>FR</button>
          </div>
          <ConstellationAccordion onMount={onConstellationMount} />
          <button className="header-link" type="button" onClick={() => window.dispatchEvent(new CustomEvent("yace19ai:open-julia"))}>
            Meet Julia <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage locale={locale} />} />
          <Route path="/fleet" element={<FleetPage locale={locale} />} />
          <Route path="/philosophy" element={<PhilosophyPage locale={locale} />} />
          <Route path="/games" element={<GamesCatalog locale={locale} />} />
          <Route path="/media" element={<MediaPage locale={locale} />} />
          <Route path="*" element={<section className="not-found"><p className="eyebrow">404 / Not found</p><h1>{locale === "fr" ? "Cette page n'existe pas." : "This page does not exist."}</h1><Link className="text-link" to="/">Return to the research lab <ArrowUpRight size={16} /></Link></section>} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <Link className="brand footer-brand" to="/"><img className="brand-mark" src="/prime-trinity.svg" alt="" width="32" height="32" /><span>YACE19AI</span></Link>
          <p>Research, imagination and world models.</p>
          <p className="constellation-label">Part of the PRIME-AI Sovereign Constellation</p>
          <nav aria-label="Sovereign Constellation">
            <a href="https://prime-ai.fr/">PRIME-AI</a>
            <a href="https://yace19ai.com/">YACE19AI</a>
            <a href="https://amlazr.com/">AMLAZR</a>
            <a href="https://www.linkedin.com/in/yacine-benhamou-b26386124/" target="_blank" rel="noreferrer">LinkedIn</a>
          </nav>
          <div className="footer-archive-links">
            <Link to="/games">Interactive archive</Link>
            <Link to="/media">Media archive</Link>
            <a href="https://github.com/Yacinewhatchandcode" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} YACE19AI</span>        <a href="https://calendly.com/info-primeai/30min" target="_blank" rel="noreferrer">Contact</a></div>
      </footer>

      <JuliaPortal tools={tools} onMount={onJuliaMount} />
    </div>
  );
}

export default function App() {
  return <BrowserRouter><Site /></BrowserRouter>;
}
