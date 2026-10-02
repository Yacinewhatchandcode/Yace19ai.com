import type { Locale } from "../App";
import media from "../../public/media-catalog.json";
import Card3D from "../components/Card3D";

export default function MediaPage({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  return (
    <section className="intro">
      <p>{fr ? "Archives illustratives. Sombre : YMAX < 120 à 2 images/s. Aucune preuve de disponibilité actuelle." : "Illustrative archives. Dark: YMAX < 120 at 2fps. No proof of current availability."}</p>
      <div className="info-grid">
        {media.map(item => <Card3D key={item.path}>
          <h2 className="media-name">{item.url.split("/").pop()?.replace(/^video-/, "").replace(/\.(mp4|webm)$/, "")}</h2>
          <p>{item.duration !== null ? `${item.duration}s` : "—"} · {item.audio_state === "audible" ? (fr ? "Audio" : "Audio") : (fr ? "Sans narration" : "No narration")} · {item.blank_ratio === null ? "—" : `${(item.blank_ratio * 100).toFixed(0)}% ${fr ? "sombre" : "dark"}`}</p>
          {item.qa_status === "failed" ? <p role="status">{fr ? "Illisible. Source requise." : "Unreadable. Source required."}</p> : <>
            <video controls preload="none" playsInline width={item.width || 800} height={item.height || 450} poster={`/media-posters/${item.url.split("/").pop()?.replace(/\.(mp4|webm)$/, "")}.jpg`} aria-label={item.url.split("/").pop()}>
              <source src={item.url} />
              {fr ? "Votre navigateur ne prend pas en charge cette vidéo." : "Your browser does not support this video."}
            </video>
            {item.qa_status === "failed_content" && <p>{fr ? "Archive défectueuse" : "Defective archive"}</p>}
          </>}
        </Card3D>)}
      </div>
    </section>
  );
}
