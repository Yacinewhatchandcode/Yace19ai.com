import { ArrowUpRight, Github } from "lucide-react";
import type { Locale } from "../App";

const systems = [
  {
    title: "AIA Discovery",
    category: "Research platform",
    description: "A public repository describing a platform for AI research and experimental development.",
    stack: ["TypeScript", "Research tools", "AI integration"],
    href: "https://github.com/Yacinewhatchandcode/AIA-Discovery",
  },
  {
    title: "Prime.AI",
    category: "Model orchestration",
    description: "A public code repository exploring model routing, local inference and agent orchestration.",
    stack: ["Python", "Ollama", "LangChain"],
    href: "https://github.com/Yacinewhatchandcode/Prime.AI",
  },
  {
    title: "Sovereign Ecosystem",
    category: "Agent systems",
    description: "A public codebase for agent software and the infrastructure around it.",
    stack: ["Python", "Multi-agent", "Docker"],
    href: "https://github.com/Yacinewhatchandcode/Sovereign-Ecosystem",
  },
  {
    title: "YACE19AI.com",
    category: "Research interface",
    description: "The source repository for this research and project archive.",
    stack: ["React", "TypeScript", "Three.js"],
    href: "https://github.com/Yacinewhatchandcode/Yace19ai.com",
  },
];

export default function FleetPage({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  return (
    <div className="archive-page">
      <section className="page-hero">
        <p className="eyebrow">YACE19AI / Lab systems</p>
        <h1>{fr ? "Des idées à des systèmes explorables." : "Ideas, made explorable."}</h1>
        <p>{fr
          ? "Un index resserré de dépôts publics liés à la recherche, aux modèles et aux systèmes d'agents."
          : "A short index of publicly linked repositories around research, models and agent systems."}</p>
      </section>
      <section className="section archive-systems" id="systems" aria-labelledby="systems-heading">
        <div className="section-heading section-heading-row">
          <div><p className="eyebrow">Selected repositories</p><h2 id="systems-heading">Work in the open</h2></div>
          <a className="text-link" href="https://github.com/Yacinewhatchandcode" target="_blank" rel="noreferrer">Browse GitHub <ArrowUpRight size={15} /></a>
        </div>
        <div className="repository-list">
          {systems.map((system, index) => (
            <article className="repository-card" key={system.title}>
              <span className="repository-index">0{index + 1}</span>
              <div className="repository-content">
                <p className="eyebrow">{system.category}</p>
                <h3>{system.title}</h3>
                <p>{system.description}</p>
                <ul aria-label={`${system.title} technologies`}>{system.stack.map(item => <li key={item}>{item}</li>)}</ul>
              </div>
              <a className="repository-link" href={system.href} target="_blank" rel="noreferrer" aria-label={`Open ${system.title} on GitHub`}><Github size={17} /><span>Source</span><ArrowUpRight size={14} /></a>
            </article>
          ))}
        </div>
        <p className="archive-disclaimer">Repository presence does not imply a maintained service, benchmark result or production deployment. Descriptions are limited to the linked projects.</p>
      </section>
      <section className="build-cta compact-cta">
        <div><p className="eyebrow">Open questions welcome</p><h2>What should we explore next?</h2></div>
        <a className="button button-light" href="https://calendly.com/info-primeai/30min" target="_blank" rel="noreferrer">Share a question <ArrowUpRight size={16} /></a>
      </section>
    </div>
  );
}
