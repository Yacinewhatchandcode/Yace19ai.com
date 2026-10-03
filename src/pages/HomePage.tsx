import { ArrowDown, ArrowRight, ArrowUpRight, Orbit } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import type { Locale } from "../App";

const domains = [
  {
    id: "domain-world-models",
    number: "01",
    slug: "world-models",
    title: "World models",
    description: "How can systems build useful internal models of environments, change and consequence?",
    tag: "Representation · Prediction · Action",
  },
  {
    id: "domain-scientific-ai",
    number: "02",
    slug: "scientific-ai",
    title: "Scientific AI",
    description: "Where can machine intelligence help people ask better questions and investigate complex systems?",
    tag: "Discovery · Simulation · Human inquiry",
  },
  {
    id: "domain-frontier-models",
    number: "03",
    slug: "frontier-models",
    title: "Frontier models",
    description: "What becomes possible when open models, local infrastructure and careful evaluation meet?",
    tag: "Open models · Evaluation · Systems",
  },
];

const labSystems = [
  {
    title: "AIA Discovery",
    focus: "Research exploration",
    description: "A publicly linked research-platform repository for AI discovery and experimental development.",
    href: "https://github.com/Yacinewhatchandcode/AIA-Discovery",
    number: "01",
  },
  {
    title: "Prime.AI",
    focus: "Model orchestration",
    description: "An open repository exploring model routing, local inference and agent coordination.",
    href: "https://github.com/Yacinewhatchandcode/Prime.AI",
    number: "02",
  },
  {
    title: "Sovereign Ecosystem",
    focus: "Agent systems",
    description: "A public codebase for multi-agent software and its supporting infrastructure.",
    href: "https://github.com/Yacinewhatchandcode/Sovereign-Ecosystem",
    number: "03",
  },
];

export default function HomePage({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  const [publicationQuery, setPublicationQuery] = useState("");
  const [publicationStatus, setPublicationStatus] = useState("");

  function searchPublications(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = publicationQuery.trim();
    setPublicationStatus(query
      ? `No DOI-verified publications match “${query}”. The catalogue is not populated yet.`
      : "No DOI-verified publications are listed yet.");
  }

  return (
    <>
      <section className="research-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">YACE19AI <span>/</span> Research & imagination</p>
          <h1 id="hero-title">{fr ? "Explorer le possible." : "Research the possible."}</h1>
          <p className="hero-summary">{fr
            ? "Explorer les modèles du monde, l'IA scientifique et les modèles ouverts à travers la recherche et l'expérimentation."
            : "Exploring world models, scientific AI and open models through research, prototypes and questions worth pursuing."}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#systems">{fr ? "Entrer dans le laboratoire" : "Enter the Lab"} <ArrowRight size={16} aria-hidden="true" /></a>
            <a className="button button-quiet" href="#research-domains">{fr ? "Explorer la recherche" : "Explore Research"} <ArrowDown size={16} aria-hidden="true" /></a>
          </div>
          <p className="hero-caption">Independent exploration · Open questions · Verifiable work</p>
        </div>
        <div className="world-visual" role="img" aria-label="An abstract constellation globe connecting research ideas">
          <div className="globe-halo" />
          <div className="globe">
            <svg viewBox="0 0 480 480" aria-hidden="true">
              <defs>
                <radialGradient id="globe-fill" cx="36%" cy="30%">
                  <stop offset="0" stopColor="#d9efff" />
                  <stop offset=".52" stopColor="#7ab8f0" />
                  <stop offset="1" stopColor="#2465c5" />
                </radialGradient>
                <clipPath id="globe-clip"><circle cx="240" cy="240" r="156" /></clipPath>
              </defs>
              <circle cx="240" cy="240" r="158" fill="url(#globe-fill)" opacity=".78" />
              <g clipPath="url(#globe-clip)" fill="none" stroke="#fff" strokeOpacity=".53" strokeWidth="1">
                <ellipse cx="240" cy="240" rx="152" ry="54" />
                <ellipse cx="240" cy="240" rx="152" ry="104" />
                <ellipse cx="240" cy="240" rx="64" ry="156" />
                <ellipse cx="240" cy="240" rx="118" ry="156" />
                <path d="M84 240h312M108 160h264M108 320h264" />
              </g>
              <g fill="#fff">
                <circle cx="137" cy="163" r="4" /><circle cx="326" cy="145" r="3" />
                <circle cx="369" cy="245" r="5" /><circle cx="177" cy="333" r="3" />
                <circle cx="247" cy="83" r="4" /><circle cx="291" cy="366" r="4" />
              </g>
              <g stroke="#5797e9" strokeWidth="1.5">
                <path d="M137 163 57 93M326 145l72-52M369 245l67 19M177 333 92 388M247 83l7-53" />
              </g>
              <g fill="#2465c5">
                <circle cx="57" cy="93" r="5" /><circle cx="398" cy="93" r="5" />
                <circle cx="436" cy="264" r="5" /><circle cx="92" cy="388" r="5" />
                <circle cx="254" cy="30" r="5" />
              </g>
            </svg>
          </div>
          <span className="orbit-label orbit-label-one"><Orbit size={13} /> Models</span>
          <span className="orbit-label orbit-label-two">Research / 01</span>
          <span className="orbit-label orbit-label-three">Open inquiry</span>
          <span className="visual-caption">A map of questions, not a claim of solved science.</span>
        </div>
      </section>

      <section className="section mission-section" id="mission" aria-labelledby="mission-title">
        <div className="section-heading">
          <p className="eyebrow">01 / Purpose</p>
          <h2 id="mission-title">Our mission</h2>
          <p>Build room for ideas that are not yet products, and tools that make the next question easier to ask.</p>
        </div>
        <div className="mission-grid">
          <article className="mission-card mission-feature">
            <span className="card-index">A / Core inquiry</span>
            <div className="mission-mark" aria-hidden="true"><Orbit size={26} /></div>
            <h3>World models</h3>
            <p>Explore how machine intelligence can represent environments, reason about change and support action.</p>
            <a className="text-link" href="#domain-world-models">Explore the domain <ArrowUpRight size={15} /></a>
          </article>
          <article className="mission-card">
            <span className="card-index">B / Discovery</span>
            <div className="mission-mark" aria-hidden="true"><span className="scientific-mark">∿</span></div>
            <h3>Scientific AI</h3>
            <p>Investigate where AI can extend scientific practice while keeping evidence and human judgment in view.</p>
            <a className="text-link" href="#domain-scientific-ai">Explore the domain <ArrowUpRight size={15} /></a>
          </article>
          <article className="mission-card">
            <span className="card-index">C / Open frontier</span>
            <div className="mission-mark" aria-hidden="true"><span className="open-mark">↗</span></div>
            <h3>Frontier models</h3>
            <p>Study open models, their capabilities and the systems needed to evaluate them responsibly.</p>
            <a className="text-link" href="#domain-frontier-models">Explore the domain <ArrowUpRight size={15} /></a>
          </article>
        </div>
      </section>

      <section className="section layers-section" id="layers" aria-labelledby="layers-title">
        <div className="section-heading">
          <p className="eyebrow">02 / Method</p>
          <h2 id="layers-title">Three layers. One vision.</h2>
          <p>Curiosity sets the direction. Research tests the idea. Systems make exploration tangible.</p>
        </div>
        <div className="layers-diagram" aria-label="Imagination leads to research, which informs systems">
          <article className="layer-step">
            <span className="layer-number">01</span>
            <h3>Imagination</h3>
            <p>Frame questions beyond the current interface.</p>
          </article>
          <span className="layer-connector" aria-hidden="true">→</span>
          <article className="layer-step layer-step-active">
            <span className="layer-number">02</span>
            <h3>Research</h3>
            <p>Make hypotheses visible, testable and open to revision.</p>
          </article>
          <span className="layer-connector" aria-hidden="true">→</span>
          <article className="layer-step">
            <span className="layer-number">03</span>
            <h3>Systems</h3>
            <p>Build prototypes that let the idea meet the world.</p>
          </article>
        </div>
      </section>

      <section className="section systems-section" id="systems" aria-labelledby="systems-title">
        <div className="section-heading section-heading-row">
          <div><p className="eyebrow">03 / In the lab</p><h2 id="systems-title">Lab systems</h2></div>
          <Link className="text-link" to="/fleet">View linked repositories <ArrowUpRight size={15} /></Link>
        </div>
        <div className="systems-grid">
          {labSystems.map(system => (
            <article className="system-card" key={system.title}>
              <span className="system-number">{system.number}</span>
              <div className="system-copy"><p className="system-focus">{system.focus}</p><h3>{system.title}</h3><p className="system-description">{system.description}</p></div>
              <a className="system-link" href={system.href} target="_blank" rel="noreferrer" aria-label={`View ${system.title} repository`}>View repository <ArrowUpRight size={16} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="section domains-section" id="research-domains" aria-labelledby="domains-title">
        <div className="section-heading">
          <p className="eyebrow">04 / Questions in motion</p>
          <h2 id="domains-title">Research domains</h2>
          <p>These are directions of inquiry, not claims of completed scientific results.</p>
        </div>
        <div className="domains-list">
          {domains.map(domain => (
            <article className="domain-row" id={domain.id} key={domain.id}>
              <span className="domain-number">{domain.number}</span>
              <div className="domain-content"><p className="eyebrow">{domain.tag}</p><h3>{domain.title}</h3><p>{domain.description}</p></div>
              <span className="domain-arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
            </article>
          ))}
        </div>
      </section>

      <section className="section evidence-section" id="publications" aria-labelledby="evidence-title">
        <div className="section-heading">
          <p className="eyebrow">05 / Evidence</p>
          <h2 id="evidence-title">What is published</h2>
          <p>Only verifiable work belongs here. No metrics or publication counts are inferred.</p>
        </div>
        <div className="evidence-list">
          <div><span>Publications</span><strong>TODO — add DOI-linked publications</strong></div>
          <div><span>Models</span><strong>TODO — add model cards and public weights</strong></div>
          <div><span>Benchmarks</span><strong>TODO — add reproducible evaluation results</strong></div>
        </div>
        <form className="publication-search" onSubmit={searchPublications}>
          <label htmlFor="publication-query">Search the publication catalogue</label>
          <div className="publication-search-controls">
            <input
              id="publication-query"
              type="search"
              maxLength={160}
              value={publicationQuery}
              onChange={event => setPublicationQuery(event.target.value)}
              placeholder="Title, author or topic"
            />
            <button className="button button-primary" id="publication-search-submit" type="submit">Search publications</button>
          </div>
          <p className="publication-search-status" role="status" aria-live="polite">{publicationStatus}</p>
        </form>
      </section>

      <section className="build-cta" id="get-involved">
        <div><p className="eyebrow">The frontier is a beginning</p><h2>Build what does not exist yet.</h2><p>Bring a question. Leave with a clearer way to explore it.</p></div>
        <a className="button button-light" href="https://calendly.com/info-primeai/30min" target="_blank" rel="noreferrer">Start a conversation <ArrowUpRight size={16} /></a>
      </section>
    </>
  );
}
