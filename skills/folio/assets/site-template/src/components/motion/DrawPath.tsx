// A line from the person's world (a route, a plan, a curve, a pen mark) drawn once. The SVG is complete in
// the HTML; labels are plain SVG text or HTML beside it and are never hidden.
// Below the fold:  <DrawPath client:idle d="M10 80 C 60 10, 140 10, 190 80" viewBox="0 0 200 100" />
// On the first screen, as the load sequence: add `load` (and a `delay`). The CSS gate in base.css hides
// the stroke before the first paint only when script runs; base.js shows it after 2.5 s in any case.
import { useEffect, useRef } from "react";
import { animate } from "motion";
import { useOnView, prefersReducedMotion } from "./useOnView";

type Props = {
  d: string; viewBox: string; stroke?: string; width?: number; duration?: number; delay?: number;
  load?: boolean; className?: string; title?: string; preserveAspectRatio?: string;
};

export default function DrawPath({ d, viewBox, stroke = "currentColor", width = 6, duration = 0.85, delay = 0, load = false, className, title, preserveAspectRatio }: Props) {
  const ref = useRef<SVGPathElement>(null);
  const play = (el: Element) => {
    const svg = el.closest("svg");
    animate(el, { strokeDashoffset: [1, 0] }, { duration, delay, ease: [0.77, 0, 0.175, 1] })
      .then(() => svg?.classList.add("drawn"));
  };
  useOnView(
    ref,
    (el) => { const p = el as SVGPathElement; p.style.strokeDasharray = "1"; p.style.strokeDashoffset = "1"; },
    play,
  );
  useEffect(() => {
    const el = ref.current;
    if (!load || !el) return;
    if (prefersReducedMotion()) { el.closest("svg")?.classList.add("drawn"); return; }
    if (el.getBoundingClientRect().top < window.innerHeight) play(el);
  }, []);
  return (
    <svg viewBox={viewBox} className={[className, load ? "draw-gate" : ""].filter(Boolean).join(" ")} preserveAspectRatio={preserveAspectRatio}
      role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path ref={ref} d={d} pathLength={1} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
        vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
