import type { Locale } from "../App";
import philosophyBanner from "../assets/philosophy-banner.webp";
import Card3D from "./Card3D";

export default function Philosophy({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";
  return <section className="info-grid">
    <Card3D><img src={philosophyBanner} alt={fr ? "Jardin illustratif de la philosophie Prime AI" : "Illustrative garden of Prime AI philosophy"} width="1200" height="640" loading="lazy" /><h2>{fr ? "Intention" : "Intention first"}</h2><p>{fr ? "Construire simplement." : "Build without losing meaning."}</p></Card3D>
    <Card3D><img src="/media-posters/faith-demo.jpg" alt={fr ? "Illustration créative : humain et robot" : "Creative illustration: human and robot"} width="1280" height="720" loading="lazy" /><h2>{fr ? "Utile. Vrai." : "Useful. True."}</h2><p>{fr ? "Créer." : "Create with intention."}</p></Card3D>
  </section>;
}
