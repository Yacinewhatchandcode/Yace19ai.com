import { ArrowRight, Compass, FlaskConical, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Locale } from "../App";

export default function PhilosophyPage({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  return (
    <div className="approach-page">
      <section className="page-hero">
        <p className="eyebrow">YACE19AI / Our approach</p>
        <h1>{fr ? "La curiosité mérite des systèmes." : "Curiosity deserves a system."}</h1>
        <p>{fr
          ? "La recherche commence par l'imagination, progresse par une enquête honnête et devient tangible grâce à des outils."
          : "Research begins with imagination, moves through honest inquiry and becomes tangible through tools."}</p>
      </section>
      <section className="section approach-section" aria-labelledby="approach-title">
        <div className="section-heading">
          <p className="eyebrow">A practice, not a promise</p>
          <h2 id="approach-title">{fr ? "Une idée doit rester ouverte à la preuve." : "Keep the idea open to evidence."}</h2>
          <p>We treat prototypes as instruments for learning. A working interface is a starting point; claims need evidence beyond the interface.</p>
        </div>
        <div className="approach-principles">
          <article><Compass size={22} aria-hidden="true" /><span>01</span><h3>Imagine freely</h3><p>Begin with possibilities worth investigating, not with a claim that the answer is already known.</p></article>
          <article><FlaskConical size={22} aria-hidden="true" /><span>02</span><h3>Investigate honestly</h3><p>Separate questions, experiments and evidence. Name the gaps when work is not yet verifiable.</p></article>
          <article><Layers3 size={22} aria-hidden="true" /><span>03</span><h3>Build to learn</h3><p>Make systems that can be inspected, tested and changed as understanding improves.</p></article>
        </div>
      </section>
      <section className="approach-bridge">
        <p className="eyebrow">Research × imagination × systems</p>
        <h2>Less performance. More possibility.</h2>
        <p>YACE19AI is the research and imagination layer of the Sovereign Constellation. Infrastructure belongs to PRIME-AI; operational execution belongs to AMLAZR.</p>
        <Link className="button button-primary" to="/#research-domains">Explore the research domains <ArrowRight size={16} /></Link>
      </section>
    </div>
  );
}
