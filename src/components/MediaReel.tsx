import { useEffect, useRef } from "react";
import type { Locale } from "../App";
import Card3D from "./Card3D";

function ReelVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reduced.matches) {
        video.play().catch(error => {
          if (error.name !== "AbortError" && error.name !== "NotAllowedError" && errorRef.current) {
            errorRef.current.hidden = false;
          }
        });
      } else video.pause();
    }, { threshold: 0.5 });
    const stop = () => { if (reduced.matches) video.pause(); };
    reduced.addEventListener("change", stop);
    observer.observe(video);
    return () => { observer.disconnect(); reduced.removeEventListener("change", stop); video.pause(); };
  }, [src, errorRef]);
  return <>
    <video ref={ref} src={src} muted loop playsInline controls preload="none" poster={poster} width="720" height="1280" />
    <p ref={errorRef} hidden role="alert">Playback unavailable. Poster shown.</p>
  </>;
}

export default function MediaReel({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  const chapters = [
    { title: "AIA", src: "/videos/aia-creative-lab.mp4", poster: "/media-posters/aia-creative-lab.jpg" },
    { title: "Faith", src: "/videos/faith-demo.mp4", poster: "/media-posters/faith-demo.jpg" },
    { title: "WhatsApp", src: "/videos/whatsapp-demo.mp4", poster: "/media-posters/whatsapp-demo.jpg" },
  ];
  return <section className="media-strip" aria-label={fr ? "Reel : archives illustratives" : "Reel: illustrative archives"}>
    {chapters.map(chapter => <Card3D key={chapter.src}>
      <span className="chapter-chip">{chapter.title} · {fr ? "archive" : "archive"}</span>
      <ReelVideo src={chapter.src} poster={chapter.poster} />
      <p>{fr ? "Illustratif · Muet" : "Illustrative · Muted"}</p>
    </Card3D>)}
  </section>;
}
