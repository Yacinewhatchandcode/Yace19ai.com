import { Link } from "react-router-dom";
import type { Locale } from "../App";
import Card3D from "../components/Card3D";
import founder from "../assets/founder.jpg";

export default function HomePage({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  return <section className="info-grid">
    <Card3D><img src={founder} alt="Yacine Benhamou" width="600" height="400" loading="lazy" className="founder-photo" /><h2>{fr ? "Une vision humaine" : "A human vision"}</h2><Link to="/philosophy">{fr ? "Philosophie" : "Philosophy"}</Link></Card3D>
    <Card3D><img src="/repo-Yace19ai.com.png" alt={fr ? "Archive du portfolio" : "Portfolio archive"} width="800" height="450" loading="lazy" /><h2>{fr ? "Projets archivés" : "Archived projects"}</h2><Link to="/fleet">{fr ? "Explorer" : "Explore"}</Link></Card3D>
  </section>;
}
