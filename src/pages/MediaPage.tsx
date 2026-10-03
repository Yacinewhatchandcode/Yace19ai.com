import media from "../../public/media-catalog.json";
import type { Locale } from "../App";

export default function MediaPage({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  return (
    <div className="archive-page">
      <section className="page-hero">
        <p className="eyebrow">YACE19AI / Archive</p>
        <h1>{fr ? "Archives visuelles." : "A record of experiments."}</h1>
        <p>{fr
          ? "Des enregistrements illustratifs, conservés comme archives — pas comme preuve de disponibilité actuelle."
          : "Illustrative recordings kept as an archive, not as proof of current availability."}</p>
      </section>
      <section className="section media-archive" aria-label={fr ? "Archives vidéo" : "Video archive"}>
        <div className="archive-note"><strong>Archive note</strong><span>Historical demos may be incomplete or unverified. Each recording is labeled with its local QA status.</span></div>
        <div className="media-grid">
          {media.map(item => {
            const filename = item.url.split("/").pop() ?? item.url;
            const title = filename.replace(/^video-/, "").replace(/\.(mp4|webm)$/, "").replaceAll("-", " ");
            return (
              <article className="media-card" key={item.path}>
                <div className="media-card-heading"><p className="eyebrow">Recorded experiment</p><h2>{title}</h2></div>
                {item.qa_status === "failed"
                  ? <p className="archive-warning" role="status">{fr ? "Source vidéo manquante ou illisible." : "Video source unavailable or unreadable."}</p>
                  : <video controls preload="none" playsInline width={item.width || 800} height={item.height || 450} poster={`/media-posters/${filename.replace(/\.(mp4|webm)$/, "")}.jpg`} aria-label={filename}>
                    <source src={item.url} />
                    {fr ? "La lecture vidéo n'est pas prise en charge." : "Your browser does not support video playback."}
                  </video>}
                <p className="media-metadata">
                  {item.duration !== null ? `${item.duration}s` : "Duration unverified"}
                  <span aria-hidden="true"> · </span>
                  {item.audio_state === "audible" ? "Audio recorded" : "No narration"}
                  <span aria-hidden="true"> · </span>
                  {item.qa_status === "passed" ? "Local playback checked" : "QA note: review source"}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
