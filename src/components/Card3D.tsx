import { useEffect, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";

export default function Card3D({ children, className = "" }: { children: ReactNode; className?: string }) {
  const frame = useRef(0);
  const element = useRef<HTMLElement>(null);
  useEffect(() => {
    const card = element.current;
    if (!card) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        card.classList.add("is-visible");
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(card);
    return () => { observer.disconnect(); cancelAnimationFrame(frame.current); };
  }, []);
  function tilt(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      card.style.transform = `perspective(1200px) rotateX(${(0.5 - y) * 16}deg) rotateY(${(x - 0.5) * 16}deg)`;
      card.style.setProperty("--pointer-x", `${x * 100}%`);
      card.style.setProperty("--pointer-y", `${y * 100}%`);
    });
  }
  return <article ref={element} className={`info-card card-3d ${className}`} onPointerMove={tilt} onPointerLeave={event => {
    cancelAnimationFrame(frame.current);
    event.currentTarget.style.transform = "";
  }}>{children}</article>;
}
