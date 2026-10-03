import { ArrowUpRight, Gamepad2 } from "lucide-react";
import type { Locale } from "../App";

const experiments = [
  { title: "Sovereign Platformer", path: "/games/platformer/index.html", note: "A local canvas platformer with keyboard and touch controls." },
  { title: "Swarm Architect", path: "/games/swarm-architect/index.html", note: "A local arcade survival game; not an autonomous AI workforce." },
  { title: "Antigravity Kids", path: "/games/kids-games/index.html", note: "Archive hub. Some linked game pages are placeholders." },
  { title: "Sovereign Interface", path: "/sovereign/index.html", note: "An illustrative 3D scene. No backend execution." },
];

export default function GamesCatalog({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";
  return (
    <div className="archive-page">
      <section className="page-hero">
        <p className="eyebrow">YACE19AI / Interactive archive</p>
        <h1>{fr ? "Expériences interactives." : "Ideas you can play with."}</h1>
        <p>{fr
          ? "Une archive de prototypes locaux et d'expériences interactives — distincte de la recherche et sans promesse d'exécution distante."
          : "A small archive of local prototypes and interactive experiments—separate from the research work, with no promise of remote execution."}</p>
      </section>
      <section className="section experiment-list" aria-label="Interactive archive">
        {experiments.map((experiment, index) => (
          <article className="experiment-row" key={experiment.path}>
            <span className="experiment-index">0{index + 1}</span>
            <Gamepad2 size={20} aria-hidden="true" />
            <div><h2>{experiment.title}</h2><p>{experiment.note}</p></div>
            <a className="text-link" href={experiment.path}>{fr ? "Ouvrir l'archive" : "Open archive"} <ArrowUpRight size={15} /></a>
          </article>
        ))}
      </section>
    </div>
  );
}
