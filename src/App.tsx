import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProjectPortfolio from "./components/ProjectPortfolio";
import GamesCatalog from "./components/GamesCatalog";
import Philosophy from "./components/Philosophy";
import MediaPage from "./pages/MediaPage";
import GoldVisual from "./components/GoldVisual";
import MediaReel from "./components/MediaReel";
import { Home, FolderOpen, Gamepad2, Sparkles, Film, Github } from "lucide-react";
import "./App.css";

export type Locale = "en" | "fr";

function Site() {
  const [locale, setLocale] = useState<Locale>(() => localStorage.getItem("locale") === "fr" ? "fr" : "en");
  const location = useLocation();
  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  const previousPath = useRef(pathname);
  const fr = locale === "fr";
  const navigation = [
    ["/", fr ? "Accueil" : "Home"],
    ["/fleet", fr ? "Projets" : "Projects"],
    ["/games", fr ? "Jeux" : "Games"],
    ["/philosophy", "Vision"],
    ["/media", fr ? "Médias" : "Media"],
  ];
  const icons = [Home, FolderOpen, Gamepad2, Sparkles, Film];
  const pageLabel = navigation.find(([path]) => path === pathname)?.[1] ?? (fr ? "Introuvable" : "Not found");
  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem("locale", locale);
    document.title = `${pageLabel} | Yace19ai — Local portfolio`;
    window.scrollTo(0, 0);
    if (previousPath.current !== pathname) {
      document.getElementById("main-content")?.focus({ preventScroll: true });
      previousPath.current = pathname;
    }
  }, [locale, pathname, pageLabel]);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">{fr ? "Aller au contenu" : "Skip to content"}</a>
      <header className="site-header">
        <Link className="brand" aria-label="Yace19ai home" to="/"><span className="logo-orb" /><span className="brand-word">yace19ai</span></Link>
        <nav aria-label={fr ? "Navigation principale" : "Main navigation"}>
          {navigation.map(([path, label], index) => {
            const Icon = icons[index];
            return <NavLink key={path} to={path} end><Icon size={16} aria-hidden="true" />{label}</NavLink>;
          })}
        </nav>
        <div className="locale-switch" aria-label={fr ? "Langue" : "Language"}>
          <button lang="en" aria-pressed={!fr} onClick={() => setLocale("en")}>EN</button>
          <button lang="fr" aria-pressed={fr} onClick={() => setLocale("fr")}>FR</button>
        </div>
        <Link className="cta-pill" to="/games">{fr ? "Explorer" : "Explore"}</Link>
      </header>
      <aside className="local-notice">
        {fr
          ? "Illustratif. Local. Sans paiement/exécution."
          : "Illustrative. Local. No payments/execution."}
      </aside>
      <main id="main-content" tabIndex={-1}>
        <section className="sg-hero">
          <GoldVisual />
          <div className="hero-copy">
            <p className="eyebrow">Yacine Benhamou</p>
            <h1>{pathname === "/" ? (fr ? "Créer. Explorer. Transmettre." : "Build. Explore. Share.") : pageLabel}</h1>
            <p>{fr ? "IA illustrative. Uniquement locale." : "Illustrative AI. Local only."}</p>
            <div className="actions"><Link className="primary-link" to="/fleet">{fr ? "Projets" : "Projects"}</Link><Link className="primary-link secondary" to="/media">{fr ? "Voir les médias" : "Watch media"}</Link></div>
          </div>
        </section>
        <Routes>
          <Route path="/" element={<HomePage locale={locale} />} />
          <Route path="/fleet" element={<ProjectPortfolio locale={locale} />} />
          <Route path="/games" element={<GamesCatalog locale={locale} />} />
          <Route path="/philosophy" element={<Philosophy locale={locale} />} />
          <Route path="/media" element={<MediaPage locale={locale} />} />
          <Route path="*" element={<section className="intro"><h1>{fr ? "Page introuvable" : "Page not found"}</h1><Link to="/">{fr ? "Retour à l'accueil" : "Return home"}</Link></section>} />
        </Routes>
        <MediaReel locale={locale} />
      </main>
      <footer className="site-footer">
        <p>©2026 Yacine Benhamou</p>
        <a href="https://github.com/Yacinewhatchandcode" aria-label="GitHub (external)" target="_blank" rel="noopener noreferrer"><Github size={20} /></a>
      </footer>
    </div>
  );
}

export default function App() {
  return <BrowserRouter><Site /></BrowserRouter>;
}
