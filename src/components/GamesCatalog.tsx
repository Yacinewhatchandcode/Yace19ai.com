import type { Locale } from "../App";
import Card3D from "./Card3D";
import GoldVisual from "./GoldVisual";

const games = [
  { title: "Sovereign Platformer", url: "/games/platformer/index.html", description: ["A local canvas platformer. Keyboard and touch controls; synthesized game audio.", "Un jeu de plateforme local sur canvas. Clavier et commandes tactiles ; sons synthétisés."] },
  { title: "Swarm Architect", url: "/games/swarm-architect/index.html", description: ["A local arcade survival game, not an autonomous AI workforce.", "Un jeu d'arcade local de survie, pas une flotte autonome d'IA."] },
  { title: "Antigravity Kids", url: "/games/kids-games/index.html", description: ["Archive hub. Nine game pages are placeholders; game implementations are not included.", "Archives. Les neuf pages de jeux sont des espaces réservés ; les jeux ne sont pas inclus."] },
  { title: "Sovereign Interface", url: "/sovereign/index.html", description: ["Illustrative 3D scene. No backend execution; keyboard navigation and local touch controls.", "Scène 3D illustrative. Aucune exécution serveur ; navigation au clavier et commandes tactiles locales."] },
];

export default function GamesCatalog({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";
  return (
    <section className="intro">
      <p>{fr ? "Archives EN. Neuf indisponibles." : "EN archives. Nine unavailable."}</p>
      <div className="info-grid">
        {games.map(game => <Card3D key={game.url}>
          <GoldVisual />
          <h2 lang="en">{game.title}</h2>
          <a className="primary-link" href={game.url}>{fr ? "Ouvrir (EN)" : "Open (EN)"}</a>
        </Card3D>)}
      </div>
    </section>
  );
}
